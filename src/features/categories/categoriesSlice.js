import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCategoriesRequest, createCategoryRequest, updateCategoryRequest, deleteCategoryRequest } from './categoriesApi';

export const fetchCategories = createAsyncThunk('categories/fetch', async () => {
    return await fetchCategoriesRequest();
});

export const createCategory = createAsyncThunk(
    'categories/create',
    async ({ title, description }, { rejectWithValue }) => {
        try { return await createCategoryRequest({ title, description }); }
        catch (e) { return rejectWithValue(e?.response?.data?.error || 'Failed to create category'); }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, title, description }, { rejectWithValue }) => {
        try { return await updateCategoryRequest(id, { title, description }); }
        catch (e) { return rejectWithValue(e?.response?.data?.error || 'Failed to update category'); }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, { rejectWithValue }) => {
        try { return await deleteCategoryRequest(id); }
        catch (e) { return rejectWithValue(e?.response?.data?.error || 'Failed to delete category'); }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        items: [],
        loading: false,
        error: null,
        saving: false,
    },
    reducers: {},
    extraReducers: (b) => {
        b
            // fetch
            .addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload || []; })
            .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error?.message || 'Failed'; })

            // create
            .addCase(createCategory.pending, (s) => { s.saving = true; s.error = null; })
            .addCase(createCategory.fulfilled, (s, a) => { s.saving = false; s.items.unshift(a.payload); })
            .addCase(createCategory.rejected, (s, a) => { s.saving = false; s.error = a.payload || a.error?.message || 'Failed'; })

            // update
            .addCase(updateCategory.pending, (s) => { s.saving = true; s.error = null; })
            .addCase(updateCategory.fulfilled, (s, a) => {
                s.saving = false;
                const i = s.items.findIndex(c => c.id === a.payload.id);
                if (i !== -1) s.items[i] = a.payload;
            })
            .addCase(updateCategory.rejected, (s, a) => { s.saving = false; s.error = a.payload || a.error?.message || 'Failed'; })

            // delete
            .addCase(deleteCategory.pending, (s) => { s.saving = true; s.error = null; })
            .addCase(deleteCategory.fulfilled, (s, a) => {
                s.saving = false;
                s.items = s.items.filter(c => c.id !== a.payload);
            })
            .addCase(deleteCategory.rejected, (s, a) => { s.saving = false; s.error = a.payload || a.error?.message || 'Failed'; });
    }
});

export default categoriesSlice.reducer;
