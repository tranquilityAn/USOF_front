import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../../../utils/getAvatarUrl';
import { getUsersRequest, deleteAccountByIdRequest } from '../../../features/users/usersApi';
import styles from './UsersPage.module.css';

export default function UsersPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');

    // client-side pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getUsersRequest(); // admin-only
                setUsers(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e?.response?.data?.error || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u => {
            const login = (u.login || '').toLowerCase();
            const fullName = (u.fullName || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return login.includes(q) || fullName.includes(q) || email.includes(q);
        });
    }, [users, query]);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const pageItems = filtered.slice(start, start + limit);

    useEffect(() => {
        setPage(1);
    }, [query]);

    const onDelete = async (id) => {
        if (!window.confirm('This will permanently delete the account and related data. Continue?')) return;
        try {
            await deleteAccountByIdRequest(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to delete user');
        }
    };

    if (loading) return <div className="page"><h1>Users</h1><p>Loading…</p></div>;
    if (error) return <div className="page"><h1>Users</h1><p style={{ color: '#f88' }}>{error}</p></div>;

    return (
        <div className={styles.pageWrap}>
            <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Users</h1>
                <button className="btn btn--primary" onClick={() => navigate('/admin/users/new')}>Create user</button>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    type="search"
                    placeholder="Search by login, name or email…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Login</th>
                            <th>Full name</th>
                            <th>Email</th>
                            <th>Verified</th>
                            <th>Rating</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <img
                                        src={getAvatarUrl(u.profilePicture) || 'https://via.placeholder.com/40?text=U'}
                                        alt=""
                                        className={styles.avatar}
                                    />
                                </td>
                                <td>{u.login}</td>
                                <td>{u.fullName || '—'}</td>
                                <td>{u.email}</td>
                                <td>{u.emailVerified ? '✓' : '–'}</td>
                                <td>{u.rating ?? 0}</td>
                                <td>{u.role}</td>
                                <td className={styles.actions}>
                                    <button className="btn btn--ghost" onClick={() => navigate(`/admin/users/${u.id}`)}>View / Edit</button>
                                    <button className="btn btn--danger" onClick={() => onDelete(u.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {pageItems.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', opacity: .7, padding: 16 }}>
                                    Nothing found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button className="btn btn--ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Previous</button>
                <span>{page} / {Math.max(1, Math.ceil(total / limit))}</span>
                <button className="btn btn--ghost" disabled={start + limit >= total} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
        </div>
    );
}
