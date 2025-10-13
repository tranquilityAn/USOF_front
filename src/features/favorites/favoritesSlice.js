import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchFavoritesRequest,
    addFavoriteRequest,
    removeFavoriteRequest,
} from './favoritesApi';
import { hydratePost } from '../posts/hydratePost';

export const fetchFavorites = createAsyncThunk(
    'favorites/fetchAll',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const res = await fetchFavoritesRequest();

            const list = Array.isArray(res) ? res
                : Array.isArray(res?.items) ? res.items
                    : [];
            const hydrated = await Promise.all(list.map(hydratePost));
            return fulfillWithValue(hydrated);
        } catch (e) {
            return rejectWithValue(e?.response?.data?.message || 'Failed to load favorites');
        }
    }
);

// add to favorites
export const addFavorite = createAsyncThunk(
    'favorites/add',
    async (postId, { rejectWithValue }) => {
        try {
            await addFavoriteRequest(postId);
            return postId;
        } catch (e) { return rejectWithValue(e?.response?.data?.message || 'Failed to add favorite'); }
    }
);

// rm from favorites
export const removeFavorite = createAsyncThunk(
    'favorites/remove',
    async (postId, { rejectWithValue }) => {
        try {
            await removeFavoriteRequest(postId);
            return postId;
        } catch (e) { return rejectWithValue(e?.response?.data?.message || 'Failed to remove favorite'); }
    }
);

// toggle
export const toggleFavorite = createAsyncThunk(
    'favorites/toggle',
    async ({ postId, isFav }, { dispatch }) => {
        if (isFav) {
            const id = await dispatch(removeFavorite(postId)).unwrap();
            return { postId: id, isFav: false };
        } else {
            const id = await dispatch(addFavorite(postId)).unwrap();
            return { postId: id, isFav: true };
        }
    }
);

const initialState = {
    items: [],            // Array<Post>
    ids: {},              // { [postId]: true }
    pending: {},          // { [postId]: true } — blocking button 
    loading: false,
    error: null,
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        clearFavorites(state) {
            state.items = [];
            state.ids = {};
            state.pending = {};
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (b) => {
        b
            .addCase(fetchFavorites.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchFavorites.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.error = null;
                s.items = payload;
                s.ids = Object.fromEntries(payload.map(p => [p.id, true]));
            })
            .addCase(fetchFavorites.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
            .addCase(addFavorite.pending, (s, { meta }) => { s.pending[meta.arg] = true; })
            .addCase(addFavorite.fulfilled, (s, { payload: postId }) => {
                s.ids[postId] = true;
                delete s.pending[postId];
            })
            .addCase(addFavorite.rejected, (s, { meta }) => { delete s.pending[meta.arg]; })
            .addCase(removeFavorite.pending, (s, { meta }) => { s.pending[meta.arg] = true; })
            .addCase(removeFavorite.fulfilled, (s, { payload: postId }) => {
                delete s.ids[postId];
                delete s.pending[postId];
                s.items = s.items.filter(p => p.id !== postId);
            })
            .addCase(removeFavorite.rejected, (s, { meta }) => { delete s.pending[meta.arg]; })
            .addCase(toggleFavorite.fulfilled, (s, { payload }) => {
                if (payload.isFav) s.ids[payload.postId] = true;
                else delete s.ids[payload.postId];
            });
    },
});

export const selectIsFavorite = (state, postId) => !!state.favorites.ids[postId];
export const selectFavPending = (state, postId) => !!state.favorites.pending[postId];
export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
