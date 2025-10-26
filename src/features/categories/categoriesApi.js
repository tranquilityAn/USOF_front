import { api } from '../../app/api';
export const fetchCategoriesRequest = async () => {
    const { data } = await api.get('/categories');
    return data;
};

export const createCategoryRequest = async (payload) => {
    const { data } = await api.post('/categories', payload);
    return data;
};

export const updateCategoryRequest = async (id, payload) => {
    const { data } = await api.patch(`/categories/${id}`, payload);
    return data;
};

export const deleteCategoryRequest = async (id) => {
    await api.delete(`/categories/${id}`);
    return id;
};