import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvatarUrl } from '../../../utils/getAvatarUrl';
import {
    getUserByIdRequest,
    updateUserRequest,
    adminRemoveAvatarByIdRequest,
    deleteAccountByIdRequest
} from '../../../features/users/usersApi';
import styles from './UserDetailsPage.module.css';

export default function UserDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const u = await getUserByIdRequest(id);
                setUser(u);
                setEmail(u.email || '');
                setRole(u.role || 'user');
            } catch (e) {
                setError(e?.response?.data?.error || 'Failed to load user');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const avatarSrc = useMemo(
        () => getAvatarUrl(user?.profilePicture) || 'https://via.placeholder.com/96?text=User',
        [user?.profilePicture]
    );

    const onSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const patch = { email, role };
            const updated = await updateUserRequest(id, patch);
            setUser(updated);
            alert('Saved');
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const onRemoveAvatar = async () => {
        if (!window.confirm('Remove avatar?')) return;
        try {
            const updated = await adminRemoveAvatarByIdRequest(id);
            setUser(updated);
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to remove avatar');
        }
    };

    const onDelete = async () => {
        if (!window.confirm('This will permanently delete the account and related data. Continue?')) return;
        try {
            await deleteAccountByIdRequest(id);
            navigate('/admin/users');
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to delete user');
        }
    };

    if (loading) return <div className={styles.pageWrap}><h1>User</h1><p>Loading…</p></div>;
    if (error) return <div className={styles.pageWrap}><h1>User</h1><p style={{ color: '#f88' }}>{error}</p></div>;
    if (!user) return <div className={styles.pageWrap}><h1>User</h1><p>Not found</p></div>;

    return (
        <div className={styles.pageWrap}>
            <h1 className={styles.pageTitle}>User</h1>

            <div className={styles.card}>
                <div className={styles.userHeader}>
                    <img src={avatarSrc} alt="" className={styles.avatarLg} />
                    <div className={styles.meta}>
                        <div className={styles.metaRow}><span>ID:</span><strong>{user.id}</strong></div>
                        <div className={styles.metaRow}><span>Login:</span><strong>{user.login}</strong></div>
                        <div className={styles.metaRow}><span>Full name:</span><strong>{user.fullName || '—'}</strong></div>
                        <div className={styles.metaRow}><span>Rating:</span><strong>{user.rating ?? 0}</strong></div>
                        <div className={styles.metaRow}><span>Email verified:</span><strong>{user.emailVerified ? 'Yes' : 'No'}</strong></div>
                        <div className={styles.metaRow}><span>Created:</span><strong>{new Date(user.createdAt).toLocaleString()}</strong></div>
                        <div className={styles.metaRow}><span>Updated:</span><strong>{new Date(user.updatedAt).toLocaleString()}</strong></div>
                    </div>
                </div>

                <div className={styles.btnRow}>
                    <button className="btn btn--ghost" onClick={onRemoveAvatar}>Remove avatar</button>
                    <button className="btn btn--danger" onClick={onDelete}>Delete user</button>
                    <button className="btn btn--ghost" onClick={() => navigate(-1)}>Back</button>
                </div>
            </div>

            <form className={styles.formGrid} onSubmit={onSave}>
                <label className={styles.labelWrap}>
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className={styles.field}
                        required
                    />
                </label>

                <label className={styles.labelWrap}>
                    <span>Role</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={styles.field}
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                </label>

                <div className={styles.btnRow}>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/users')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
