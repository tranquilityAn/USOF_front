import { api } from '../../app/api';

export const fetchCommentsByPostRequest = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data; // Array<Comment>
};

// окремо добираємо реакції для конкретного комента
export const fetchCommentReactionsRequest = async (commentId) => {
    const { data } = await api.get(`/comments/${commentId}/like`);
    return data; // Array<Like>
};

export const addCommentRequest = async (postId, payload) => {
    const { data } = await api.post(`/posts/${postId}/comments`, payload);
    return data; // created comment
};

export const deleteCommentRequest = async (commentId) => {
    await api.delete(`/comments/${commentId}`);
    return { id: commentId };
};

// проставити like/dislike на комент
export const reactToCommentRequest = async (commentId, type /* 'like'|'dislike' */) => {
    const { data } = await api.post(`/comments/${commentId}/like`, { type });
    return data;
};

// export const likeCommentRequest = async (commentId) => {
//     const { data } = await api.post(`/comments/${commentId}/like`);
//     return data; // { liked:true, likesCount, dislikesCount } (або подібно)
// };

export const unlikeCommentRequest = async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}/like`);
    return data; // { liked:false, ... }
};


// прибрати свою реакцію з комента
export const removeCommentReactionRequest = async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}/like`);
    return data;
};