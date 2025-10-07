import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostsRequest, fetchPostByIdRequest, reactToPostRequest, removePostReactionRequest, fetchPostReactionsRequest, fetchCommentsByPostRequest } from './postsApi';

// export const fetchPosts = createAsyncThunk('posts/fetch', async (params, { rejectWithValue }) => {
//     try { return await fetchPostsRequest(params); }
//     catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load posts'); }\
// });
export const fetchPosts = createAsyncThunk('posts/fetch', async (params, { rejectWithValue }) => {
    try {
        const res = await fetchPostsRequest(params); // { items, page, limit, total }

        // Паралельно збагачуємо елементи, де лічильників немає
        const items = await Promise.all((res.items || []).map(async (p) => {
            const needLikes = (p.likesCount == null) || (p.dislikesCount == null);
            const needComments = (p.commentsCount == null);

            if (!needLikes && !needComments) return p;

            const [reactions, comments] = await Promise.all([
                needLikes ? fetchPostReactionsRequest(p.id).catch(() => []) : Promise.resolve(null),
                needComments ? fetchCommentsByPostRequest(p.id).catch(() => []) : Promise.resolve(null),
            ]);

            let likesCount = p.likesCount, dislikesCount = p.dislikesCount;
            if (reactions) {
                likesCount = 0;
                dislikesCount = 0;
                for (const r of reactions) {
                    if (r?.type === 'like') likesCount++;
                    else if (r?.type === 'dislike') dislikesCount++;
                }
            }

            const commentsCount = comments ? comments.length : p.commentsCount;

            return {
                ...p,
                likesCount,
                dislikesCount,
                commentsCount
            };
        }));

        return { ...res, items };
    } catch (err) {
        return rejectWithValue(err?.response?.data?.message || 'Failed to load posts');
    }
});

// export const fetchPostById = createAsyncThunk('posts/fetchById', async (id, { rejectWithValue }) => {
//     try { return await fetchPostByIdRequest(id); }
//     catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load post'); }
// });
export const fetchPostById = createAsyncThunk(
    'posts/fetchById',
    async (id, { getState, rejectWithValue }) => {
        try {
            const post = await fetchPostByIdRequest(id);

            // визначаємо мою реакцію
            const userId = getState()?.auth?.user?.id;
            let my = null;
            if (userId) {
                const reactions = await fetchPostReactionsRequest(id); // [{ userId, type }]
                const mine = reactions.find(r => r.userId === userId);
                my = mine?.type ?? null; // 'like' | 'dislike' | null
            }

            return { post, my };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to load post');
        }
    }
);

// // проставити реакцію на пост (like або dislike), потім перезавантажити пост для точних лічильників
// export const reactToPost = createAsyncThunk('posts/react', async ({ id, type }, { dispatch, rejectWithValue }) => {
//     try {
//         await reactToPostRequest(id, type);
//         // точніше просто перезавантажити пост
//         const updated = await fetchPostByIdRequest(id);
//         return updated;
//     } catch (err) {
//         return rejectWithValue(err?.response?.data?.message || 'Failed to react');
//     }
// });

// // прибрати реакцію користувача з поста
// export const removePostReaction = createAsyncThunk('posts/removeReaction', async (id, { rejectWithValue }) => {
//     try {
//         await removePostReactionRequest(id);
//         const updated = await fetchPostByIdRequest(id);
//         return updated;
//     } catch (err) {
//         return rejectWithValue(err?.response?.data?.message || 'Failed to remove reaction');
//     }
// });
export const togglePostReaction = createAsyncThunk(
    'posts/togglePostReaction',
    async ({ id, type }, { getState, rejectWithValue }) => {
        try {
            const currentMy = getState().posts.myReactionByPost?.[id] ?? null;

            if (currentMy === type) {
                // зняти реакцію
                await removePostReactionRequest(id);
            } else {
                // поставити/замінити реакцію
                await reactToPostRequest(id, type); // 'like' | 'dislike'
            }

            // перезавантажуємо пост + мою реакцію
            const post = await fetchPostByIdRequest(id);

            const userId = getState()?.auth?.user?.id;
            let my = null;
            if (userId) {
                const reactions = await fetchPostReactionsRequest(id);
                const mine = reactions.find(r => r.userId === userId);
                my = mine?.type ?? null;
            }

            return { post, my };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to react');
        }
    }
);

const initialState = {
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    sort: 'date',
    order: 'desc',
    categories: [],  // масив id
    dateFrom: '',
    dateTo: '',
    status: 'active', // або 'all' якщо хочеш
    loading: false,
    error: null,
    // Один пост
    current: null, // {id, title, content, author, likesCount, ...}
    currentLoading: false,
    currentError: null,
    myReactionByPost: {},
};



const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setFilters(state, { payload }) {
            const allow = ['sort', 'order', 'categories', 'dateFrom', 'dateTo', 'status', 'limit', 'page'];
            for (const k of allow) {
                if (payload[k] !== undefined) state[k] = payload[k];
            }
        },
        setPage(state, { payload }) { state.page = payload; },
        clearCurrent(state) {
            state.current = null;
            state.currentError = null;
            state.currentLoading = false;
        },
    },
    extraReducers: (b) => {
        // список
        b.addCase(fetchPosts.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchPosts.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.items = payload.items || [];
            s.page = payload.page || 1;
            s.limit = payload.limit ?? s.limit;
            s.total = payload.total || 0;
        });
        b.addCase(fetchPosts.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Error'; });

        // пост
        b.addCase(fetchPostById.pending, (s) => { s.currentLoading = true; s.currentError = null; });
        b.addCase(fetchPostById.fulfilled, (s, { payload }) => {
            s.currentLoading = false; s.current = payload.post; if (payload.post?.id) {
                s.myReactionByPost[payload.post.id] = payload.my;
            }
        });
        b.addCase(fetchPostById.rejected, (s, a) => { s.currentLoading = false; s.currentError = a.payload || 'Error'; });

        // реакції -> просто заміняємо current оновленою версією з сервера
        // b.addCase(reactToPost.fulfilled, (s, { payload }) => { s.current = payload; });
        // b.addCase(removePostReaction.fulfilled, (s, { payload }) => { s.current = payload; });
        b.addCase(togglePostReaction.fulfilled, (s, { payload }) => {
            s.current = payload.post;
            if (payload.post?.id) {
                s.myReactionByPost[payload.post.id] = payload.my;
            }
        });

    },
});

export const { setFilters, setPage, clearCurrent } = postsSlice.actions;
export default postsSlice.reducer;
