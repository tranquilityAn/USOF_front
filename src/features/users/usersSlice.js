import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateUserRequest, uploadAvatarRequest, removeAvatarRequest, requestPasswordReset, deleteAccountByIdRequest, createUserRequest } from './usersApi';
import { meRequest } from '../auth/authApi';
import { logout } from '../auth/authSlice';

export const updateMyProfile = createAsyncThunk(
    'users/updateMyProfile',
    async ({ id, patch }, { rejectWithValue }) => {
        try {
            await updateUserRequest(id, patch);
            const me = await meRequest(id);
            return me;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to update profile');
        }
    }
);

export const uploadMyAvatar = createAsyncThunk(
    'users/uploadMyAvatar',
    async (file, { getState, rejectWithValue }) => {
        try {
            await uploadAvatarRequest(file);
            const id = getState()?.auth?.user?.id;
            const me = await meRequest(id);
            return me;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to upload avatar');
        }
    }
);

export const removeMyAvatar = createAsyncThunk(
    'users/removeMyAvatar',
    async (_, { getState, rejectWithValue }) => {
        try {
            await removeAvatarRequest();
            const id = getState()?.auth?.user?.id;
            const me = await meRequest(id);
            return me;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to remove avatar');
        }
    }
);

export const sendPasswordReset = createAsyncThunk(
    'users/sendPasswordReset',
    async (email, { rejectWithValue }) => {
        try {
            await requestPasswordReset(email);
            return true;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to send reset email');
        }
    }
);

export const deleteMyAccount = createAsyncThunk(
    'users/deleteMyAccount',
    async ({ id } = {}, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState();
            const fallbackId = state?.users?.me?.id ?? state?.auth?.user?.id;
            const targetId = id ?? fallbackId;
            if (!targetId) throw new Error('Missing user id');
            await deleteAccountByIdRequest(targetId);
            dispatch(logout());
            return true;
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to delete account';
            return rejectWithValue(msg);
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (payload, { rejectWithValue }) => {
        try {
            const created = await createUserRequest(payload);
            return created || null; // якщо бек нічого не повернув
        } catch (err) {
            const msg = err?.response?.data?.message
                || err?.response?.data?.error
                || 'Failed to create user';
            return rejectWithValue(msg);
        }
    }
);

const profileSlice = createSlice({
    name: 'users',
    initialState: {
        me: null,
        profile: { saving: false, error: null, success: false },
        avatar: { pending: false, error: null, success: false },
        password: { pending: false, error: null, sent: false },
        createUserLoading: false,
        createUserError: null,
        createdUser: null,
    },
    reducers: {
        setMe(state, action) { state.me = action.payload; },
        clearProfileStatus(state) { state.profile = { saving: false, error: null, success: false }; },
        clearAvatarStatus(state) { state.avatar = { pending: false, error: null, success: false }; },
        clearPasswordStatus(state) { state.password = { pending: false, error: null, sent: false }; },
        clearCreateUserStatus(state) {
            state.createUserLoading = false;
            state.createUserError = null;
            state.createdUser = null;
        },
    },
    extraReducers: (b) => {
        // PROFILE
        b.addCase(updateMyProfile.pending, (s) => { s.profile.saving = true; s.profile.error = null; s.profile.success = false; })
            .addCase(updateMyProfile.fulfilled, (s, a) => { s.profile.saving = false; s.profile.success = true; s.me = a.payload; })
            .addCase(updateMyProfile.rejected, (s, a) => { s.profile.saving = false; s.profile.error = a.payload; s.profile.success = false; })

            // AVATAR (upload)
            .addCase(uploadMyAvatar.pending, (s) => { s.avatar.pending = true; s.avatar.error = null; s.avatar.success = false; })
            .addCase(uploadMyAvatar.fulfilled, (s, a) => { s.avatar.pending = false; s.avatar.success = true; s.me = a.payload; })
            .addCase(uploadMyAvatar.rejected, (s, a) => { s.avatar.pending = false; s.avatar.error = a.payload; s.avatar.success = false; })

            // AVATAR (remove)
            .addCase(removeMyAvatar.pending, (s) => { s.avatar.pending = true; s.avatar.error = null; s.avatar.success = false; })
            .addCase(removeMyAvatar.fulfilled, (s, a) => { s.avatar.pending = false; s.avatar.success = true; s.me = a.payload; })
            .addCase(removeMyAvatar.rejected, (s, a) => { s.avatar.pending = false; s.avatar.error = a.payload; s.avatar.success = false; })

            // PASSWORD RESET
            .addCase(sendPasswordReset.pending, (s) => { s.password.pending = true; s.password.sent = false; s.password.error = null; })
            .addCase(sendPasswordReset.fulfilled, (s) => { s.password.pending = false; s.password.sent = true; })
            .addCase(sendPasswordReset.rejected, (s, a) => { s.password.pending = false; s.password.error = a.payload; })

            // DELETE ACCOUNT
            .addCase(deleteMyAccount.pending, (s) => {
                s.profile = s.profile || {};
                s.profile.deleting = true;
                s.profile.deleteError = null;
                s.profile.deleteSuccess = false;
            })
            .addCase(deleteMyAccount.fulfilled, (s) => {
                s.profile.deleting = false;
                s.profile.deleteSuccess = true;
                s.me = null;
            })
            .addCase(deleteMyAccount.rejected, (s, a) => {
                s.profile.deleting = false;
                s.profile.deleteError = a.payload || 'Failed to delete account';
                s.profile.deleteSuccess = false;
            })
            .addCase(createUser.pending, (state) => {
                state.createUserLoading = true;
                state.createUserError = null;
                state.createdUser = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.createUserLoading = false;
                state.createdUser = action.payload; // може бути null, якщо бек не поверне body
            })
            .addCase(createUser.rejected, (state, action) => {
                state.createUserLoading = false;
                state.createUserError = action.payload || 'Failed to create user';
            });
    }
});

export default profileSlice.reducer;
export const { setMe, clearProfileStatus, clearAvatarStatus, clearPasswordStatus, clearCreateUserStatus } = profileSlice.actions;