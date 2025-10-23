import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import {
    updateMyProfile,
    removeMyAvatar,
    uploadMyAvatar,
    sendPasswordReset,
    clearProfileStatus,
    clearAvatarStatus,
    clearPasswordStatus,
    deleteMyAccount,
    clearDeleteStatus
} from '../../features/users/usersSlice';
import { fetchMe } from '../../features/auth/authSlice';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user: authUser } = useSelector(s => s.auth);
    const usersState = useSelector(s => s.users);
    const me = usersState.me || authUser;

    const [login, setLogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [emailForReset, setEmailForReset] = useState('');

    const fileInputRef = useRef(null);

    const [confirmInput, setConfirmInput] = useState('');
    const canDelete = confirmInput.trim().toUpperCase() === 'DELETE';

    const deleting = usersState?.profile?.deleting;
    const deleteError = usersState?.profile?.deleteError;
    const deleteSuccess = usersState?.profile?.deleteSuccess;

    useEffect(() => {
        dispatch(clearDeleteStatus());
        dispatch(clearProfileStatus());
        dispatch(clearAvatarStatus());
        dispatch(clearPasswordStatus());
    }, [dispatch]);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        if (!me && authUser?.id) dispatch(fetchMe(authUser.id));
    }, [token, me, authUser?.id, dispatch, navigate]);

    useEffect(() => {
        if (me) {
            setLogin(me.login || '');
            setFullName(me.fullName || '');
            setEmailForReset(me.email || '');
        }
    }, [me]);

    useEffect(() => {
        if (deleteSuccess) {
            navigate('/');
        }
    }, [deleteSuccess, navigate]);

    if (!token) return null;

    const onSaveProfile = (e) => {
        e.preventDefault();
        if (!me?.id) return;
        dispatch(clearProfileStatus());
        const patch = { login, fullName };
        dispatch(updateMyProfile({ id: me.id, patch }));
    };

    const onAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch(clearAvatarStatus());
            dispatch(uploadMyAvatar(file));
        }
    };

    const onAvatarRemove = () => {
        dispatch(clearAvatarStatus());
        dispatch(removeMyAvatar());
    };

    const onSendReset = (e) => {
        e.preventDefault();
        if (!emailForReset) return;
        dispatch(clearPasswordStatus());
        dispatch(sendPasswordReset(emailForReset));
    };

    const handleDeleteAccount = async () => {
        // додатковий native confirm — на випадок якщо користувач натиснув випадково
        if (!canDelete) return;
        const ok = window.confirm(
            'This will permanently delete your profile, all posts, comments, and related data. Continue?'
        );
        if (!ok) return;

        await dispatch(deleteMyAccount({ id: me?.id }));
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.h1}>Settings</h1>

            {/* Profile */}
            <form className={styles.card} onSubmit={onSaveProfile} style={{ display: 'grid', gap: 12 }}>
                <h2 className="h2" style={{ margin: 0 }}>Profile</h2>

                <div className={styles.avatarRow}>
                    <Avatar src={me?.profilePicture} alt={me?.login} size={96} className={styles.avatarLg} />
                    <div className={styles.btnGroup}>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => fileInputRef.current?.click()}>
                            Change avatar
                        </button>

                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onAvatarRemove}>
                            Remove avatar
                        </button>
                        {(usersState.avatar.success || usersState.avatar.error) && (
                            <div className={styles.actions}>
                                {usersState.avatar.success && <span className={styles.statusOk}>Avatar updated</span>}
                                {usersState.avatar.error && <span className={styles.statusErr}>{usersState.avatar.error}</span>}
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onAvatarPick}
                        />
                    </div>
                </div>

                <label className={styles.field}>
                    <span className={styles.label}>Login</span>
                    <input
                        className={styles.input}
                        value={login}
                        onChange={e => { if (usersState.profile.success) dispatch(clearProfileStatus()); setLogin(e.target.value); }}
                        required
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Full name</span>
                    <input
                        className={styles.input}
                        value={fullName}
                        onChange={e => { if (usersState.profile.success) dispatch(clearProfileStatus()); setFullName(e.target.value); }}
                    />
                </label>

                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={usersState.profile.saving}>Save</button>
                    {usersState.profile.success && <span className={styles.statusOk}>Saved</span>}
                    {usersState.profile.error && <span className={styles.statusErr}>{usersState.profile.error}</span>}
                </div>
            </form>

            {/* Password */}
            <form className={styles.card} onSubmit={onSendReset}>
                <h2 className={styles.h2}>Change password</h2>
                <p className={styles.subtle}>
                    We'll send an email with a link to change your password.
                </p>

                <label className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <input className={styles.input} type="email" value={emailForReset} onChange={e => setEmailForReset(e.target.value)} required />
                </label>

                <div className={styles.actions}>
                    <button className={styles.btn} type="submit" disabled={usersState.password.pending}>Send email</button>
                    {usersState.password.sent && <span className={styles.statusOk}>Email sent</span>}
                    {usersState.password.error && <span className={styles.statusErr}>{usersState.password.error}</span>}
                </div>
            </form>

            {/* DANGER ZONE */}
            <section className={styles.dangerBox} aria-labelledby="danger-title">
                <h2 id="danger-title" className={styles.dangerTitle}>Danger zone</h2>

                <p className={styles.dangerText}>
                    Deleting your account is a <strong>permanent action</strong>. Your profile, posts, comments,
                    and all associated data will be permanently removed and <strong>cannot be recovered</strong>.
                </p>

                <label className={styles.confirmField}>
                    <span>To confirm, please type <code>DELETE</code> below:</span>
                    <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder="DELETE"
                        className={styles.input}
                    />
                </label>

                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.dangerBtn}
                        disabled={!canDelete || deleting}
                        onClick={handleDeleteAccount}
                        title="Permanently delete your account"
                    >
                        {deleting ? 'Deleting…' : 'Delete account'}
                    </button>

                    {deleteError && <span className={styles.statusErr}>{deleteError}</span>}
                </div>
            </section>
        </div>
    );
}
