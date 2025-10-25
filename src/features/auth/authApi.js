import { api } from '../../app/api';

// POST /auth/register
// body: { login, password, passwordConfirmation, email, fullName }
export const registerRequest = async (payload) => {
	const { data } = await api.post('/auth/register', payload);
	return data; // очікуємо user-об'єкт з 201 Created
};

// POST /auth/login  body: { login, password }  -> { token, user? }
export const loginRequest = async ({ login, password }) => {
	const { data } = await api.post('/auth/login', { login, password });
	return data; // очікуємо { token, user? }
};

// GET /users/{id} -> user
export const meRequest = async (id) => {
	if (id == null) throw new Error('meRequest: missing user id');
	const { data } = await api.get(`/users/${id}`);
	return data;
}

// --- Confirm email flows ---
export const resendVerify = (payload /* { login?: string, email?: string } */) =>
	api.post('/auth/verify-email/resend', payload);

export const changeVerifyEmail = (payload /* { login: string, newEmail: string } */) =>
	api.post('/auth/verify-email/change', payload);

export const getVerifyTtl = () =>
	api.get('/auth/verify-email/ttl');