const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:3000';

export function getAvatarUrl(value) {
    if (!value) return null;

    // Якщо вже повний URL — повертаємо як є
    if (/^https?:\/\//i.test(value)) return value;

    // Якщо фронт отримав шлях, що вже починається зі /static/avatars
    if (value.startsWith('/static/avatars/')) return `${API_ORIGIN}${value}`;

    // Стандартний випадок: у відповіді тільки ім'я файла
    return `${API_ORIGIN}/static/avatars/${value}`;
}
