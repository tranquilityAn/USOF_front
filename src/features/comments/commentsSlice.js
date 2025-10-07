import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchCommentsByPostRequest,
    fetchCommentReactionsRequest,
    addCommentRequest,
    deleteCommentRequest,
    reactToCommentRequest,
    removeCommentReactionRequest,
} from './commentsApi';

// хелпер: порахувати {likes, dislikes} з масиву реакцій
const countReactions = (likesArray) => {
    let likes = 0, dislikes = 0;
    for (const l of likesArray || []) {
        if (l.type === 'like') likes++;
        else if (l.type === 'dislike') dislikes++;
    }
    return { likes, dislikes };
};

// завантажити коментарі і добрати лічильники
export const fetchCommentsByPost = createAsyncThunk('comments/fetchByPost', async (postId, { rejectWithValue }) => {
    try {
        const items = await fetchCommentsByPostRequest(postId);
        // обмежимо паралельність до 10 (простий батч)
        const batches = [];
        const B = 10;
        for (let i = 0; i < items.length; i += B) batches.push(items.slice(i, i + B));
        for (const batch of batches) {
            await Promise.all(batch.map(async (c) => {
                try {
                    const arr = await fetchCommentReactionsRequest(c.id);
                    const { likes, dislikes } = countReactions(arr);
                    c.likesCount = likes;
                    c.dislikesCount = dislikes;
                } catch {
                    c.likesCount = 0; c.dislikesCount = 0;
                }
            }));
        }
        return { postId, items };
    } catch (err) {
        return rejectWithValue(err?.response?.data?.message || 'Failed to load comments');
    }
});

export const addComment = createAsyncThunk('comments/add', async ({ postId, content }, { rejectWithValue }) => {
    try {
        const created = await addCommentRequest(postId, { content });
        // після створення — 0/0 (або можна одразу підкачати)
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

// поставити реакцію (like|dislike) на коментар і оновити лічильники
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

// прибрати реакцію з комента
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
    initialState: { byPost: {}, loading: false, error: null },
    reducers: {
        clearPostComments(state, { payload: postId }) { delete state.byPost[postId]; },
    },
    extraReducers: (b) => {
        b.addCase(fetchCommentsByPost.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchCommentsByPost.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.byPost[payload.postId] = payload.items;
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
    },
});

export const { clearPostComments } = commentsSlice.actions;
export default commentsSlice.reducer;
