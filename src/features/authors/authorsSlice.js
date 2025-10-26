import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserByIdRequest, fetchUserPostsCountRequest } from './authorsApi';

export const fetchUserById = createAsyncThunk(
    'authors/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await fetchUserByIdRequest(id);
            return data;
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to load user';
            return rejectWithValue(msg);
        }
    }
);

export const fetchUserPostsCount = createAsyncThunk(
    'authors/fetchPostsCount',
    async (id, { rejectWithValue }) => {
        try { return { id, count: await fetchUserPostsCountRequest(id) }; }
        catch (e) { return rejectWithValue('Failed to load posts count'); }
    }
);

const authorsSlice = createSlice({
    name: 'authors',
    initialState: {
        byId: {},
        loading: {},
        error: {},
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserById.pending, (s, a) => {
                s.loading[a.meta.arg] = true;
                s.error[a.meta.arg] = undefined;
            })
            .addCase(fetchUserById.fulfilled, (s, a) => {
                const user = a.payload;
                s.loading[user.id] = false;
                s.byId[user.id] = { ...s.byId[user.id], ...user };
            })
            .addCase(fetchUserById.rejected, (s, a) => {
                const id = a.meta.arg;
                s.loading[id] = false;
                s.error[id] = a.payload || 'Failed to load user';
            })
            .addCase(fetchUserPostsCount.pending, (s, a) => {

            })
            .addCase(fetchUserPostsCount.fulfilled, (s, a) => {
                const { id, count } = a.payload;
                s.byId[id] = { ...(s.byId[id] || {}), postsCount: count };
            })
            .addCase(fetchUserPostsCount.rejected, (s, a) => {

            });
    }
});

export default authorsSlice.reducer;
