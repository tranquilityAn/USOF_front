import { api } from '../../app/api';

// PATCH /users/{id}
export const updateUserRequest = async (id, payload) => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data; // 200 OK
};

// PATCH /users/avatar  (multipart)
export const uploadAvatarRequest = async (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const { data } = await api.patch('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // 200 OK
};

// PATCH /users/avatar  remove=true
export const removeAvatarRequest = async () => {
    const fd = new FormData();
    fd.append('remove', 'true');
    const { data } = await api.patch('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // 200 OK
};

// POST /auth/password-reset
export const requestPasswordReset = async (email) => {
    const { data } = await api.post('/auth/password-reset', { email });
    return data; // 200 OK
};

// DELETE /users/{id}
export const deleteAccountByIdRequest = async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data; // 200 OK
};

// POST /users  (admin only)
export const createUserRequest = async (payload) => {
    const { data } = await api.post('/users', payload);
    return data;
};

// GET /users  (admin only)
export const getUsersRequest = async () => {
    const { data } = await api.get('/users');
    return data; // array of users
};

// GET /users/:id
export const getUserByIdRequest = async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data; // user object
};

// PATCH /users/:id
export const adminRemoveAvatarByIdRequest = async (id) => {
    const { data } = await api.patch(`/users/${id}`, { profilePicture: null });
    return data;
};
