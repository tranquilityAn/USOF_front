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
