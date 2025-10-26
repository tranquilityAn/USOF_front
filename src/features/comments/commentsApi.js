import { api } from '../../app/api';

export const fetchCommentsByPostRequest = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data;
};

export const fetchRepliesByCommentRequest = async (postId, commentId, { page = 1, limit = 20 } = {}) => {
    const { data } = await api.get(`/posts/${postId}/comments/${commentId}/replies`, {
        params: { page, limit },
    });
    return data;
};

export const fetchCommentReactionsRequest = async (commentId) => {
    const { data } = await api.get(`/comments/${commentId}/like`);
    return data;
};

export const addCommentRequest = async ({ postId, content, parentId = null }) => {
    const body = parentId ? { content, parentId } : { content };
    const { data } = await api.post(`/posts/${postId}/comments`, body);
    return data;
};

export const deleteCommentRequest = async (commentId) => {
    await api.delete(`/comments/${commentId}`);
    return { id: commentId };
};

export const reactToCommentRequest = async (commentId, type /* 'like'|'dislike' */) => {
    const { data } = await api.post(`/comments/${commentId}/like`, { type });
    return data;
};

export const unlikeCommentRequest = async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}/like`);
    return data;
};

export const removeCommentReactionRequest = async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}/like`);
    return data;
};

export const updateCommentStatusRequest = async (commentId, status /* 'active'|'inactive' */) => {
    const { data } = await api.patch(`/comments/${commentId}`, { status });
    return data;
};

export const lockCommentRequest = async (postId, commentId) => {
    const { data } = await api.post(`/posts/${postId}/comments/${commentId}/lock`);
    return data;
};

export const unlockCommentRequest = async (postId, commentId) => {
    const { data } = await api.delete(`/posts/${postId}/comments/${commentId}/lock`);
    return data;
};
