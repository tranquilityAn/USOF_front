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

// GET /users/me -> user
export const meRequest = async () => {
    const { data } = await api.get('/users/me');
    return data;
};
