import { api } from '../../app/api';

// Список вже є
export const fetchPostsRequest = async (params) => {
    const { data } = await api.get('/posts', { params });
    return data; // { items, page, limit, total }
};

// Отримати один пост
export const fetchPostByIdRequest = async (id) => {
    const { data } = await api.get(`/posts/${id}`);
    return data; // Post
};

// масив усіх лайків/дизлайків поста (для знання власної реакції, якщо треба)
export const fetchPostReactionsRequest = async (id) => {
    const { data } = await api.get(`/posts/${id}/like`);
    return data; // Array<Like {authorId, type:'like'|'dislike'}>
};

export const fetchCommentsByPostRequest = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data; // Array<Comment>
};

// поставити реакцію (like або dislike)
export const reactToPostRequest = async (id, type /* 'like'|'dislike' */) => {
    const { data } = await api.post(`/posts/${id}/like`, { type });
    return data; // 201, без тіла або з якимось payload — не покладаємось
};

// прибрати свою реакцію з поста
export const removePostReactionRequest = async (id) => {
    const { data } = await api.delete(`/posts/${id}/like`);
    return data;
};
