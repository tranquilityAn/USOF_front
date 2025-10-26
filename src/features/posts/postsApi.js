import { api } from '../../app/api';

export const fetchPostsRequest = async (params) => {
    const { data } = await api.get('/posts', { params });
    return data; 
};

export const fetchPostByIdRequest = async (id) => {
    const { data } = await api.get(`/posts/${id}`);
    return data; 
};

export const fetchPostCategoriesRequest = async (id) => {
    const { data } = await api.get(`/posts/${id}/categories`);
    return data; 
};

export const fetchPostReactionsRequest = async (id) => {
    const { data } = await api.get(`/posts/${id}/like`);
    return data; 
};

export const fetchCommentsByPostRequest = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data; 
};

export const reactToPostRequest = async (id, type) => {
    const { data } = await api.post(`/posts/${id}/like`, { type });
    return data; 
};

export const removePostReactionRequest = async (id) => {
    const { data } = await api.delete(`/posts/${id}/like`);
    return data;
};

export const createPostRequest = async ({ title, content, categories }) => {
    const { data } = await api.post('/posts', { title, content, categories });
    return data; 
};

export const updatePostRequest = async (id, payload) => {
    const { data } = await api.patch(`/posts/${id}`, payload);
    return data; 
};

export const deletePostRequest = async (id) => {
    const { data } = await api.delete(`/posts/${id}`);
    return data; 
};

export const lockPostRequest = async (id) => {
    const { data } = await api.post(`/posts/${id}/lock`);
    return data;
};

export const unlockPostRequest = async (id) => {
    const { data } = await api.delete(`/posts/${id}/lock`);
    return data;
};
