import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchCommentsByPostRequest,
    fetchCommentReactionsRequest,
    addCommentRequest,
    deleteCommentRequest,
    reactToCommentRequest,
    removeCommentReactionRequest,
} from './commentsApi';
import { fetchUserByIdRequest } from '../authors/authorsApi';

// хелпер: порахувати {likes, dislikes} з масиву реакцій
const countReactions = (likesArray) => {
    let likes = 0, dislikes = 0;
    for (const l of likesArray || []) {
        if (l.type === 'like') likes++;
        else if (l.type === 'dislike') dislikes++;
    }
    return { likes, dislikes };
};

export const fetchCommentsByPost = createAsyncThunk(
    'comments/fetchByPost',
    async (postId, { rejectWithValue, getState }) => {
        try {
            const list = await fetchCommentsByPostRequest(postId); // Array<Comment>
            const me = getState()?.auth?.user;

            const enriched = await Promise.all((list || []).map(async (c) => {
                // counters
                if (c.likesCount == null || c.dislikesCount == null) {
                    try {
                        const likes = await fetchCommentReactionsRequest(c.id); // [{type,userId}]
                        const { likes: L, dislikes: D } = countReactions(likes);
                        c.likesCount = L; c.dislikesCount = D;
                        if (me?.id) {
                            const mine = likes.find(r => r.userId === me.id);
                            c.__myReaction = mine?.type ?? null;
                        }
                    } catch {
                        c.likesCount = c.likesCount ?? 0;
                        c.dislikesCount = c.dislikesCount ?? 0;
                    }
                }

                // comment author
                if (!c.author && (c.authorId || c.userId)) {
                    const uid = c.authorId ?? c.userId;
                    try {
                        c.author = await fetchUserByIdRequest(uid);
                    } catch {
                        c.author = { id: uid, login: 'anon' };
                    }
                }

                return c;
            }));

            return { postId, items: enriched };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to load comments');
        }
    }
);

export const addComment = createAsyncThunk('comments/add', async ({ postId, content }, { rejectWithValue }) => {
    try {
        const created = await addCommentRequest(postId, { content });
        created.likesCount = 0; created.dislikesCount = 0;
        return { postId, comment: created };
    } catch (err) {
        return rejectWithValue(err?.response?.data?.message || 'Failed to add comment');
    }
});

export const deleteComment = createAsyncThunk('comments/delete', async (commentId, { rejectWithValue }) => {
    try { return await deleteCommentRequest(commentId); }
    catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to delete'); }
});

export const reactToComment = createAsyncThunk('comments/react', async ({ commentId, type }, { rejectWithValue }) => {
    try {
        await reactToCommentRequest(commentId, type);
        const arr = await fetchCommentReactionsRequest(commentId);
        const { likes, dislikes } = countReactions(arr);
        return { commentId, likes, dislikes };
    } catch (err) {
        return rejectWithValue(err?.response?.data?.message || 'Failed to react on comment');
    }
});

export const removeCommentReaction = createAsyncThunk('comments/removeReact', async (commentId, { rejectWithValue }) => {
    try {
        await removeCommentReactionRequest(commentId);
        const arr = await fetchCommentReactionsRequest(commentId);
        const { likes, dislikes } = countReactions(arr);
        return { commentId, likes, dislikes };
    } catch (err) {
        return rejectWithValue(err?.response?.data?.message || 'Failed to remove reaction');
    }
});

const commentsSlice = createSlice({
    name: 'comments',
    initialState: { byPost: {}, loading: false, error: null, myReactionByComment: {} },
    reducers: {
        clearPostComments(state, { payload: postId }) { delete state.byPost[postId]; },
    },
    extraReducers: (b) => {
        b.addCase(fetchCommentsByPost.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchCommentsByPost.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.byPost[payload.postId] = payload.items;
            for (const c of payload.items) {
                if (c.__myReaction !== undefined) {
                    s.myReactionByComment[c.id] = c.__myReaction; // 'like' | 'dislike' | null
                    delete c.__myReaction;
                }
            }
        });
        b.addCase(fetchCommentsByPost.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Error'; });

        b.addCase(addComment.fulfilled, (s, { payload }) => {
            const { postId, comment } = payload;
            if (!s.byPost[postId]) s.byPost[postId] = [];
            s.byPost[postId].unshift(comment);
        });

        b.addCase(deleteComment.fulfilled, (s, { payload }) => {
            const id = payload.id;
            for (const postId in s.byPost) {
                s.byPost[postId] = s.byPost[postId].filter(c => c.id !== id);
            }
        });

        b.addCase(reactToComment.fulfilled, (s, { payload }) => {
            for (const postId in s.byPost) {
                const c = s.byPost[postId].find(x => x.id === payload.commentId);
                if (c) { c.likesCount = payload.likes; c.dislikesCount = payload.dislikes; }
            }
        });
        b.addCase(removeCommentReaction.fulfilled, (s, { payload }) => {
            for (const postId in s.byPost) {
                const c = s.byPost[postId].find(x => x.id === payload.commentId);
                if (c) { c.likesCount = payload.likes; c.dislikesCount = payload.dislikes; }
            }
        });
        b.addCase(toggleCommentReaction.fulfilled, (s, { payload }) => {
            const { commentId, next } = payload;
            const prev = s.myReactionByComment[commentId] ?? null;

            for (const postId in s.byPost) {
                const c = s.byPost[postId].find(x => x.id === commentId);
                if (!c) continue;
                if (prev === 'like') c.likesCount = Math.max(0, (c.likesCount || 0) - 1);
                if (prev === 'dislike') c.dislikesCount = Math.max(0, (c.dislikesCount || 0) - 1);
                if (next === 'like') c.likesCount = (c.likesCount || 0) + 1;
                if (next === 'dislike') c.dislikesCount = (c.dislikesCount || 0) + 1;
                break;
            }
            s.myReactionByComment[commentId] = next; // 'like' | 'dislike' | null
        });
    },
});

export const toggleCommentReaction = createAsyncThunk(
    'comments/toggleReaction',
    async ({ commentId, type }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const my = state.comments.myReactionByComment?.[commentId] ?? null;
            if (my === type) {
                await removeCommentReactionRequest(commentId);
                return { commentId, next: null };
            } else {
                await reactToCommentRequest(commentId, type);
                return { commentId, next: type }; // 'like' | 'dislike'
            }
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to toggle reaction');
        }
    }
);


export const { clearPostComments } = commentsSlice.actions;
export default commentsSlice.reducer;
