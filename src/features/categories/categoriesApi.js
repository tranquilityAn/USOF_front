import { api } from '../../app/api';
export const fetchCategoriesRequest = async () => {
    const { data } = await api.get('/categories'); // припускаю, що такий публічний ендпоінт є
    return data; // [{id, name}, ...]
};
