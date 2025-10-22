import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserByLoginRequest } from '../../features/users/usersApi';
import styles from './CommandSearch.module.css';

export default function CommandSearch({ placeholder = 'Go to page or @login…' }) {
    const nav = useNavigate();
    const me = useSelector(s => s.auth?.user);
    const isAuthed = !!me?.id;
    const isAdmin = me?.role === 'admin';
    const [q, setQ] = useState('');
    const [err, setErr] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);

    const routes = useMemo(() => {
        const common = [
            { k: 'home', label: 'Home', to: '/' },
        ];
        const authedOnly = [
            { k: 'favorites', label: 'Favorites', to: '/favorites' },
            { k: 'new post', label: 'Create post', to: '/post/new' },
            { k: 'settings', label: 'Profile settings', to: '/settings/profile' },
        ];
        const authScreens = [
            { k: 'login', label: 'Sign in', to: '/login' },
            { k: 'register', label: 'Sign up', to: '/register' },
        ];
        const misc = [
            { k: 'verify', label: 'Verify email', to: '/verify' },
            { k: 'reset', label: 'Reset password', to: '/reset' },
        ];
        const admin = [
            { k: 'admin users', label: 'Admin • Users list', to: '/admin/users' },
            { k: 'admin categories', label: 'Admin • Categories', to: '/admin/categories' },
            { k: 'new user', label: 'Admin • Create user', to: '/admin/users/new' },
        ];

        return [
            ...common,
            ...(isAuthed ? authedOnly : authScreens),
            ...misc,
            ...(isAdmin ? admin : []),
        ];
    }, [isAuthed, isAdmin]);

    const hints = useMemo(() => {
        const t = q.trim();

        if (t.startsWith('@')) {
            const login = t.slice(1) || 'john_doe';
            return [
                { k: '@', label: 'Open user by login', example: `@${login}` }
            ];
        }
        if (/^user:/.test(t)) {
            const login = t.split(':')[1] || 'john_doe';
            return [
                { k: 'user:', label: 'Open user by login', example: `user:${login}` }
            ];
        }

        // Navigation hints
        const base = [
            ...(isAuthed ? [
                { k: 'favorites', label: 'Go to favorites', example: 'favorites' },
                { k: 'new post', label: 'Create a post', example: 'new post' },
                { k: 'settings', label: 'Open profile settings', example: 'settings' },
            ] : [
                { k: 'login', label: 'Open sign in', example: 'login' },
                { k: 'register', label: 'Open sign up', example: 'register' },
            ]),
            { k: 'verify', label: 'Open email verification', example: 'verify' },
            { k: 'reset', label: 'Open password reset', example: 'reset' },
            ...(isAdmin ? [
                { k: 'admin users', label: 'Admin: Users', example: 'admin users' },
                { k: 'admin categories', label: 'Admin: Categories', example: 'admin categories' },
                { k: 'new user', label: 'Admin: Create user', example: 'new user' },
            ] : []),
            { k: '@login', label: 'Open user by @login', example: '@john_doe' },
            { k: 'user:login', label: 'Open user by user:login', example: 'user:john_doe' },
        ];

        if (!t) return base.slice(0, 6);

        const low = t.toLowerCase();
        return base.filter(h =>
            h.k.toLowerCase().includes(low) ||
            h.label.toLowerCase().includes(low) ||
            h.example.toLowerCase().includes(low)
        ).slice(0, 8);
    }, [q, isAdmin, isAuthed]);

    const run = async (valueRaw) => {
        const value = (valueRaw ?? q).trim();
        setErr('');

        if (!value) return;

        if (value.startsWith('/')) {
            nav(value);
            setQ('');
            setOpen(false);
            return;
        }

        // 2) User search
        const mAt = /^@([\w.-]+)$/.exec(value);
        const mUser = /^user:([\w.-]+)$/.exec(value);
        const login = (mAt?.[1] || mUser?.[1])?.trim();
        if (login) {
            try {
                const u = await getUserByLoginRequest(login);
                if (!u?.id) {
                    setErr('User not found');
                    return;
                }
                nav(`/profile/${u.id}`);
                setQ('');
                setOpen(false);
                return;
            } catch (e) {
                setErr(e?.response?.data?.error || 'User not found');
                return;
            }
        }

        // 3) Command navigation
        const key = value.toLowerCase();
        const hit = routes.find(r => r.k === key);
        if (hit) {
            nav(hit.to);
            setQ('');
            setOpen(false);
            return;
        }

        setErr('Unknown command. Try @login, user:login, /path or a known command (e.g., "home").');
    };

    const onKeyDown = (e) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setOpen(true);

        if (e.key === 'Enter') {
            e.preventDefault();
            if (open && hints[active]) {
                run(hints[active].example);
            } else {
                run(q);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setErr('');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(a => (a + 1) % Math.max(hints.length || 1, 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(a => (a - 1 + Math.max(hints.length || 1, 1)) % Math.max(hints.length || 1, 1));
        } else if (e.key === 'Tab') {
            if (open && hints[active]) {
                e.preventDefault();
                setQ(hints[active].example);
            }
        }
    };

    useEffect(() => {
        if (!q) setActive(0);
        setOpen(q.length > 0);
    }, [q]);

    return (
        <div className={styles.wrap}>
            <input
                ref={inputRef}
                className={styles.input}
                placeholder={placeholder}
                aria-label="Command search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setOpen(!!q)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
            />

            {open && hints?.length > 0 && (
                <div className={styles.dropdown} role="listbox">
                    {hints.map((h, i) => (
                        <button
                            type="button"
                            key={`${h.k}-${i}`}
                            className={`${styles.item} ${i === active ? styles.active : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => run(h.example)}
                        >
                            <span className={styles.key}>{h.k}</span>
                            <span className={styles.label}>{h.label}</span>
                            <span className={styles.example}>{h.example}</span>
                        </button>
                    ))}
                </div>
            )}

            {!!err && <div className={styles.error}>{err}</div>}
        </div>
    );
}
