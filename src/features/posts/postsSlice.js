import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostsRequest, fetchPostByIdRequest, reactToPostRequest, removePostReactionRequest, fetchPostReactionsRequest, fetchCommentsByPostRequest } from './postsApi';
import { fetchUserByIdRequest } from '../authors/authorsApi';

const countReactions = (arr = []) => {
    let likes = 0, dislikes = 0;
    for (const r of arr) {
        if (r?.type === 'like') likes++;
        else if (r?.type === 'dislike') dislikes++;
    }
    return { likes, dislikes };
};

export const fetchPosts = createAsyncThunk(
    'posts/fetch',
    async (params, { rejectWithValue, fulfillWithValue }) => {
        try {
            const res = await fetchPostsRequest(params); // { items, page, limit, total }

            const filled = await Promise.all((res.items || []).map(async (p) => {
                // reaction counter
                if (p.likesCount == null || p.dislikesCount == null) {
                    const reactions = await fetchPostReactionsRequest(p.id); // Array<{type,userId}>
                    const { likes, dislikes } = countReactions(reactions);
                    p.likesCount = likes;
                    p.dislikesCount = dislikes;
                }

                // comment counter
                if (p.commentsCount == null) {
                    try {
                        const comments = await fetchCommentsByPostRequest(p.id);
                        p.commentsCount = comments?.length ?? 0;
                    } catch { p.commentsCount = 0; }

                }

                // author
                if (!p.author && (p.authorId || p.userId)) {
                    const uid = p.authorId ?? p.userId;
                    try {
                        const u = await fetchUserByIdRequest(uid);
                        p.author = u;
                    } catch {
                        p.author = { id: uid, login: 'anon' };
                    }
                }

                return p;
            }));

            return fulfillWithValue({ ...res, items: filled });
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to load posts');
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'posts/fetchById',
    async (id, { rejectWithValue, getState }) => {
        try {
            const post = await fetchPostByIdRequest(id);
            const state = getState();
            const me = state.auth?.user;

            // post reactions
            const reactions = await fetchPostReactionsRequest(id); // [{type,userId}]
            const { likes, dislikes } = countReactions(reactions);
            post.likesCount = post.likesCount ?? likes;
            post.dislikesCount = post.dislikesCount ?? dislikes;

            // my reacttion :|
            let my = null;
            if (me?.id) {
                const mine = reactions.find(r => r.userId === me.id);
                my = mine?.type ?? null;
            }

            // post author
            if (!post.author && (post.authorId || post.userId)) {
                const uid = post.authorId ?? post.userId;
                try {
                    post.author = await fetchUserByIdRequest(uid);
                } catch {
                    post.author = { id: uid, login: 'anon' };
                }
            }

            return { post, myReaction: my };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to load post');
        }
    }
);

export const togglePostReaction = createAsyncThunk(
    'posts/toggleReaction',
    async ({ id, type }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            //const current = state.posts.current;
            const my = state.posts.myReactionByPost?.[id] ?? null;

            if (my === type) {
                await removePostReactionRequest(id); // скасувати
                return { id, next: null };
            } else {
                await reactToPostRequest(id, type);  // поставити
                return { id, next: type };
            }
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
    loading: false,
    error: null,

    current: null,
    currentLoading: false,
    currentError: null,

    myReactionByPost: {},
    authorsById: {},

    // filters for HomePage/FiltersBar
    filters: {
        page: 1,
        limit: 10,
        sort: 'date',
        order: 'desc',
        categories: [],
        dateFrom: null,
        dateTo: null,
        status: 'active',
    },
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearCurrent(state) { state.current = null; state.currentError = null; state.currentLoading = false; },
        setFilters(state, { payload }) {
            state.filters = { ...state.filters, ...payload };
        },
        setPage(state, { payload }) {
            state.filters.page = payload;
        },
    },
    extraReducers: (b) => {
        b
            // fetchPosts
            .addCase(fetchPosts.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchPosts.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.items = payload.items;
                s.page = payload.page; s.limit = payload.limit; s.total = payload.total;
            })
            .addCase(fetchPosts.rejected, (s, { payload }) => {
                s.loading = false; s.error = payload || 'Failed to load posts';
            })

            // fetchPostById
            .addCase(fetchPostById.pending, (s) => { s.currentLoading = true; s.currentError = null; })
            .addCase(fetchPostById.fulfilled, (s, { payload }) => {
                s.currentLoading = false;
                s.current = payload.post;
                s.myReactionByPost[payload.post.id] = payload.myReaction;
                if (payload.post?.author?.id) {
                    s.authorsById[payload.post.author.id] = payload.post.author;
                }
            })
            .addCase(fetchPostById.rejected, (s, { payload }) => {
                s.currentLoading = false; s.currentError = payload || 'Failed to load post';
            })

            // togglePostReaction
            .addCase(togglePostReaction.fulfilled, (s, { payload }) => {
                const id = payload.id;
                const next = payload.next; // 'like'|'dislike'|null
                const cur = s.current;

                const prev = s.myReactionByPost[id] ?? null;
                if (cur && cur.id === id) {
                    if (prev === 'like') cur.likesCount = Math.max(0, (cur.likesCount || 0) - 1);
                    if (prev === 'dislike') cur.dislikesCount = Math.max(0, (cur.dislikesCount || 0) - 1);
                    if (next === 'like') cur.likesCount = (cur.likesCount || 0) + 1;
                    if (next === 'dislike') cur.dislikesCount = (cur.dislikesCount || 0) + 1;
                }
                s.myReactionByPost[id] = next;
            });
    }
});

export const { setFilters, setPage, clearCurrent } = postsSlice.actions;
export default postsSlice.reducer;
