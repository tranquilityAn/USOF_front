import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchCommentsByPostRequest,
    fetchCommentReactionsRequest,
    addCommentRequest,
    deleteCommentRequest,
    reactToCommentRequest,
    removeCommentReactionRequest,
    fetchRepliesByCommentRequest,
    updateCommentStatusRequest,
    lockCommentRequest,
    unlockCommentRequest
} from './commentsApi';
import { fetchUserByIdRequest } from '../authors/authorsApi';

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
            const raw = await fetchCommentsByPostRequest(postId);
            const list = Array.isArray(raw) ? raw : (raw?.items || []);
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

const ensureReplyBucket = (state, parentId) => {
    if (!state.repliesByComment[parentId]) {
        state.repliesByComment[parentId] = { items: [], page: 1, limit: 20, total: 0 };
    }
};

const findAndUpdateComment = (state, commentId, updater) => {
    // 1) top level
    for (const postId in state.byPost) {
        const arr = state.byPost[postId];
        const idx = arr.findIndex(c => c.id === commentId);
        if (idx !== -1) { updater(arr[idx], { postId, bucket: arr }); return true; }
    }
    // 2) replies
    for (const parentId in state.repliesByComment) {
        const bucket = state.repliesByComment[parentId];
        const idx = bucket.items.findIndex(c => c.id === commentId);
        if (idx !== -1) { updater(bucket.items[idx], { parentId, bucket: bucket.items }); return true; }
    }
    return false;
};

export const fetchRepliesByComment = createAsyncThunk(
    'comments/fetchRepliesByComment',
    async ({ postId, commentId, page = 1, limit = 20 }, { rejectWithValue, getState }) => {
        try {
            const data = await fetchRepliesByCommentRequest(postId, commentId, { page, limit });
            const me = getState()?.auth?.user;

            const enriched = await Promise.all((data.items || []).map(async (c) => {
                if (c.likesCount == null || c.dislikesCount == null) {
                    try {
                        const likes = await fetchCommentReactionsRequest(c.id);
                        const { likes: L, dislikes: D } = countReactions(likes);
                        c.likesCount = L; c.dislikesCount = D;
                        if (me) {
                            c.__myReaction = (likes.find(x => x.userId === me.id)?.type) ?? null;
                        }
                    } catch { }
                }

                if (!c.author && (c.authorId || c.userId)) {
                    const uid = c.authorId ?? c.userId;
                    try { c.author = await fetchUserByIdRequest(uid); }
                    catch { c.author = { id: uid, login: 'anon' }; }
                }
                return c;
            }));

            return {
                commentId,
                items: enriched,
                total: data.total ?? enriched.length,
                page: data.page ?? page,
                limit: data.limit ?? limit,
            };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to load replies');
        }
    }
);

export const addComment = createAsyncThunk(
    'comments/add',
    async ({ postId, content, parentId = null }, { rejectWithValue, getState }) => {
        try {
            const created = await addCommentRequest({ postId, content, parentId });
            const me = getState()?.auth?.user;
            if (me) {
                created.author = created.author || {
                    id: me.id,
                    login: me.login,
                    fullName: me.fullName,
                    email: me.email,
                };
                created.authorId ??= me.id;
                created.userId ??= me.id;
            }
            created.likesCount ??= 0;
            created.dislikesCount ??= 0;
            return { postId, parentId, comment: created };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to add comment');
        }
    }
);

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

export const toggleCommentStatus = createAsyncThunk(
    'comments/toggleStatus',
    async ({ commentId, nextStatus }, { rejectWithValue }) => {
        try {
            // має повертати { id, ..., status: 'active'|'inactive' }
            const updated = await updateCommentStatusRequest(commentId, nextStatus);
            return updated;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to update comment status');
        }
    }
);

function patchCommentEverywhereImmutable(state, commentId, patch) {
    for (const postId of Object.keys(state.byPost)) {
        const arr = state.byPost[postId] || [];
        const idx = arr.findIndex(c => c.id === commentId);
        if (idx !== -1) {
            const updatedItem = { ...arr[idx], ...patch };
            state.byPost[postId] = [
                ...arr.slice(0, idx),
                updatedItem,
                ...arr.slice(idx + 1),
            ];
        }
    }

    for (const parentId of Object.keys(state.repliesByComment)) {
        const bucket = state.repliesByComment[parentId];
        if (!bucket?.items) continue;
        const arr = bucket.items;
        const idx = arr.findIndex(c => c.id === commentId);
        if (idx !== -1) {
            const updatedItem = { ...arr[idx], ...patch };
            state.repliesByComment[parentId] = {
                ...bucket,
                items: [
                    ...arr.slice(0, idx),
                    updatedItem,
                    ...arr.slice(idx + 1),
                ],
            };
        }
    }
}

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

export const lockComment = createAsyncThunk(
    'comments/lock',
    async ({ postId, commentId }, { rejectWithValue }) => {
        try { return await lockCommentRequest(postId, commentId); }
        catch (e) { return rejectWithValue(e?.response?.data?.message || 'Failed to pin comment'); }
    }
);

export const unlockComment = createAsyncThunk(
    'comments/unlock',
    async ({ postId, commentId }, { rejectWithValue }) => {
        try { return await unlockCommentRequest(postId, commentId); }
        catch (e) { return rejectWithValue(e?.response?.data?.message || 'Failed to unpin comment'); }
    }
);

const commentsSlice = createSlice({
    name: 'comments',
    initialState: { byPost: {}, repliesByComment: {}, loading: false, error: null, myReactionByComment: {} },
    reducers: {
        clearPostComments(state, { payload: postId }) { delete state.byPost[postId]; },
    },
    extraReducers: (b) => {
        const resort = (arr = []) =>
            arr.slice().sort(
                (a, b) =>
                    (b.locked - a.locked) ||
                    (new Date(a.publishDate) - new Date(b.publishDate)) ||
                    (a.id - b.id)
            );

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
            const { postId, parentId, comment } = payload;
            if (parentId == null) {
                if (!s.byPost[postId]) s.byPost[postId] = [];
                s.byPost[postId].unshift(comment);
            } else {
                ensureReplyBucket(s, parentId);
                s.repliesByComment[parentId].items.push(comment);
                s.repliesByComment[parentId].total = (s.repliesByComment[parentId].total || 0) + 1;

                findAndUpdateComment(s, parentId, (parent) => {
                    parent.replyCount = (parent.replyCount || 0) + 1;
                });
            }
        });
        b.addCase(deleteComment.fulfilled, (s, { payload }) => {
            const id = payload.id;
            for (const postId in s.byPost) {
                const before = s.byPost[postId].length;
                s.byPost[postId] = s.byPost[postId].filter(c => c.id !== id);
                if (s.byPost[postId].length !== before) return;
            }
            for (const parentId in s.repliesByComment) {
                const bucket = s.repliesByComment[parentId];
                const before = bucket.items.length;
                bucket.items = bucket.items.filter(c => c.id !== id);
                if (bucket.items.length !== before) {
                    bucket.total = Math.max(0, (bucket.total || before) - 1);
                    findAndUpdateComment(s, Number(parentId), (parent) => {
                        parent.replyCount = Math.max(0, (parent.replyCount || 1) - 1);
                    });
                    return;
                }
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
            // 1) топ-коменти
            let updated = false;
            for (const postId in s.byPost) {
                const c = s.byPost[postId].find(x => x.id === commentId);
                if (c) {
                    if (prev === 'like') c.likesCount = Math.max(0, (c.likesCount || 0) - 1);
                    if (prev === 'dislike') c.dislikesCount = Math.max(0, (c.dislikesCount || 0) - 1);
                    if (next === 'like') c.likesCount = (c.likesCount || 0) + 1;
                    if (next === 'dislike') c.dislikesCount = (c.dislikesCount || 0) + 1;
                    updated = true;
                    break;
                }
            }
            // 2) реплаї
            if (!updated) {
                for (const parentId in s.repliesByComment) {
                    const bucket = s.repliesByComment[parentId];
                    const r = bucket.items.find(x => x.id === commentId);
                    if (r) {
                        if (prev === 'like') r.likesCount = Math.max(0, (r.likesCount || 0) - 1);
                        if (prev === 'dislike') r.dislikesCount = Math.max(0, (r.dislikesCount || 0) - 1);
                        if (next === 'like') r.likesCount = (r.likesCount || 0) + 1;
                        if (next === 'dislike') r.dislikesCount = (r.dislikesCount || 0) + 1;
                        break;
                    }
                }
            }
            s.myReactionByComment[commentId] = next; // 'like' | 'dislike' | null
        });
        b.addCase(fetchRepliesByComment.pending, (s, { meta }) => {
            const { commentId } = meta.arg;
            if (!s.repliesByComment[commentId]) s.repliesByComment[commentId] = { items: [], total: 0, page: 1, limit: 20, loading: false, error: null };
            s.repliesByComment[commentId].loading = true;
            s.repliesByComment[commentId].error = null;
        });
        b.addCase(fetchRepliesByComment.fulfilled, (s, { payload }) => {
            const { commentId, items, total, page, limit } = payload;
            s.repliesByComment[commentId] = {
                items: items || [],
                total: total ?? (items?.length || 0),
                page: page ?? 1,
                limit: limit ?? 20,
                loading: false,
                error: null,
            };
            findAndUpdateComment(s, commentId, (self) => { self.replyCount = total; });
            for (const c of items || []) {
                if (c.__myReaction !== undefined) {
                    s.myReactionByComment[c.id] = c.__myReaction;
                    delete c.__myReaction;
                }
            }
        });
        b.addCase(fetchRepliesByComment.rejected, (s, { meta, payload }) => {
            const { commentId } = meta.arg;
            if (!s.repliesByComment[commentId]) s.repliesByComment[commentId] = { items: [], total: 0, page: 1, limit: 20, loading: false, error: null };
            s.repliesByComment[commentId].loading = false;
            s.repliesByComment[commentId].error = payload || 'Error';
        });
        // toggle status
        b.addCase(toggleCommentStatus.pending, (s) => { s.error = null; });
        b.addCase(toggleCommentStatus.fulfilled, (s, { payload }) => {
            const status =
                payload && typeof payload.status === 'string'
                    ? payload.status
                    : (typeof payload?.isActive === 'boolean'
                        ? (payload.isActive ? 'active' : 'inactive')
                        : undefined);
            if (payload?.id && typeof status === 'string') {
                patchCommentEverywhereImmutable(s, payload.id, { status });
            }
        });
        b.addCase(toggleCommentStatus.rejected, (s, a) => { s.error = a.payload || 'Failed to update comment status'; });
        b.addCase(lockComment.fulfilled, (state, { payload }) => {
            // top-level comments
            const i = state.items.findIndex(c => c.id === payload.id);
            if (i !== -1) {
                state.items[i] = payload;
                state.items = resort(state.items);
            }

            // replies buckets
            Object.values(state.repliesByComment || {}).forEach(bucket => {
                const j = bucket.items.findIndex(c => c.id === payload.id);
                if (j !== -1) {
                    bucket.items[j] = payload;
                    bucket.items = resort(bucket.items);
                }
            });
        })
        b.addCase(unlockComment.fulfilled, (state, { payload }) => {
            const i = state.items.findIndex(c => c.id === payload.id);
            if (i !== -1) {
                state.items[i] = payload;
                state.items = resort(state.items);
            }

            Object.values(state.repliesByComment || {}).forEach(bucket => {
                const j = bucket.items.findIndex(c => c.id === payload.id);
                if (j !== -1) {
                    bucket.items[j] = payload;
                    bucket.items = resort(bucket.items);
                }
            });
        });

    },
});

export const { clearPostComments } = commentsSlice.actions;
export default commentsSlice.reducer;
