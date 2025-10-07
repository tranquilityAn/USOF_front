import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginRequest, meRequest, registerRequest } from './authApi';

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
    async (_, { rejectWithValue }) => {
        try {
            const user = await meRequest();
            return user;
        } catch (err) {
            return rejectWithValue('Failed to load profile');
        }
    }
);

const initialToken = localStorage.getItem('token');

// const authSlice = createSlice({
//     name: 'auth',
//     initialState: {
//         user: null,
//         token: initialToken || null,
//         status: 'idle',   // idle | loading | succeeded | failed
//         error: null,
//     },
//     reducers: {
//         logout(state) {
//             state.user = null;
//             state.token = null;
//             localStorage.removeItem('token');
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             // LOGIN
//             .addCase(login.pending, (state) => {
//                 state.status = 'loading';
//                 state.error = null;
//             })
//             .addCase(login.fulfilled, (state, action) => {
//                 state.status = 'succeeded';
//                 const { token, user } = action.payload || {};
//                 if (token) {
//                     state.token = token;
//                     localStorage.setItem('token', token);
//                 }
//                 if (user) state.user = user;
//             })
//             .addCase(login.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.payload || 'Login failed';
//             })
//             // ME
//             .addCase(fetchMe.pending, (state) => {
//                 // не обов’язково міняти статус, щоб не мигало в UI
//             })
//             .addCase(fetchMe.fulfilled, (state, action) => {
//                 state.user = action.payload;
//             })
//             .addCase(fetchMe.rejected, (state) => {
//                 // якщо токен невалідний — чистимо
//                 state.user = null;
//             });
//     },
// });
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: initialToken || null,
        status: 'idle',
        error: null,
        // опційно: окремий стан для реєстрації
        registerStatus: 'idle',
        registerError: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
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
                if (user) state.user = user;
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
