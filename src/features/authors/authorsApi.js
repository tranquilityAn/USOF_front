import { api } from '../../app/api';

export const fetchUserByIdRequest = async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data; // { id, login, fullName, ... }
};

export const fetchUserPostsCountRequest = async (id) => {
    const { data } = await api.get('/posts', { params: { authorId: id, limit: 1 } });
    return data.total ?? 0;
};