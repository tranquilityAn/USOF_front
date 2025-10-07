import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCategoriesRequest } from './categoriesApi';

export const fetchCategories = createAsyncThunk('categories/fetch', async () => {
    return await fetchCategoriesRequest();
});

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload || []; })
            .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.error?.message || 'Failed'; });
    }
});

export default categoriesSlice.reducer;
