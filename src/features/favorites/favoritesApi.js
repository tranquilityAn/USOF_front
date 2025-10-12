import { api } from '../../app/api';

// GET /favorites -> Array<Post>
export const fetchFavoritesRequest = async () => {
    const { data } = await api.get('/favorites');
    return data;
};

// POST /favorites/{post_id}
export const addFavoriteRequest = async (postId) => {
    const { data } = await api.post(`/favorites/${postId}`);
    return data;
};

// DELETE /favorites/{post_id}
export const removeFavoriteRequest = async (postId) => {
    const { data } = await api.delete(`/favorites/${postId}`);
    return data;
};
