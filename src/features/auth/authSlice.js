import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginRequest, meRequest, registerRequest } from './authApi';

const readJSON = (k) => {
    try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
};

const initialToken = localStorage.getItem('token');
const initialUser = readJSON('user');

// Thunks

export const registerUser = createAsyncThunk(
    'auth/register',
    async (payload, { rejectWithValue }) => {
        try {
            const user = await registerRequest(payload);
            return user; // 201 Created -> user
        } catch (err) {
            const msg = err?.response?.data?.message
                || err?.response?.data?.error
                || 'Registration failed';
            return rejectWithValue(msg);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ login, password }, { rejectWithValue }) => {
        try {
            const res = await loginRequest({ login, password });
            return res; // { token, user? }
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Login failed');
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/me',
    async (id, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const safeId = id ?? state?.auth?.user?.id;
            const user = await meRequest(safeId);
            return user;
        } catch (err) {
            return rejectWithValue('Failed to load profile');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: initialUser || null,
        token: initialToken || null,
        status: 'idle',
        error: null,
        registerStatus: 'idle',
        registerError: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { token, user } = action.payload || {};
                if (token) {
                    state.token = token;
                    localStorage.setItem('token', token);
                }

                if (user) {
                    state.user = user;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Login failed';
            })
            // ME
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            // REGISTER
            .addCase(registerUser.pending, (state) => {
                state.registerStatus = 'loading';
                state.registerError = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.registerStatus = 'succeeded';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registerStatus = 'failed';
                state.registerError = action.payload || 'Registration failed';
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
