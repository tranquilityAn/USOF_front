import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserByIdRequest } from './authorsApi';

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

const authorsSlice = createSlice({
    name: 'authors',
    initialState: {
        byId: {},    // { [id]: userObject }
        loading: {}, // { [id]: boolean }
        error: {},   // { [id]: string | undefined }
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
                s.byId[user.id] = user;
            })
            .addCase(fetchUserById.rejected, (s, a) => {
                const id = a.meta.arg;
                s.loading[id] = false;
                s.error[id] = a.payload || 'Failed to load user';
            });
    }
});

export default authorsSlice.reducer;
