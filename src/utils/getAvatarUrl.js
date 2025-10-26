const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:3000';

export function getAvatarUrl(value) {
    if (!value) return null;

    if (/^https?:\/\//i.test(value)) return value;

    if (value.startsWith('/static/avatars/')) return `${API_ORIGIN}${value}`;

    return `${API_ORIGIN}/static/avatars/${value}`;
}
