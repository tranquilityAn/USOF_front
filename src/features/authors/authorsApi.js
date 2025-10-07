import { api } from '../../app/api';

export const fetchUserByIdRequest = async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data; // { id, login, fullName, ... }
};
