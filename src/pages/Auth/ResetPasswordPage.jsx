import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../app/api';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();

    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);
    const [err, setErr] = useState('');

    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [pending, setPending] = useState(false);

    const token = sp.get('token');

    useEffect(() => {
        if (!token) {
            setErr('Missing token');
            setChecking(false);
            return;
        }
        api
            .get(`/auth/password-reset/${token}/validate`)
            .then(() => setValid(true))
            .catch((e) => setErr(e?.response?.data?.error || 'Invalid or expired link'))
            .finally(() => setChecking(false));
    }, [token]);

    const confirmError = useMemo(() => {
        if (!pwd && !pwd2) return '';
        if (pwd.length > 0 && pwd.length < 6) return 'Password must be at least 6 characters';
        if (pwd2 && pwd !== pwd2) return 'Passwords do not match';
        return '';
    }, [pwd, pwd2]);

    const canSubmit = valid && !pending && pwd.length >= 6 && pwd === pwd2;

    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        if (!canSubmit) return;

        setPending(true);
        try {
            await api.post(`/auth/password-reset/${token}`, { newPassword: pwd });
            navigate('/login', {
                state: { msg: 'Password updated. Please log in.' },
                replace: true,
            });
        } catch (e) {
            setErr(e?.response?.data?.error || 'Something went wrong');
        } finally {
            setPending(false);
        }
    };

    if (checking) return <p>Checking token…</p>;

    if (!valid) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1 className={styles.authTitle}>Reset password</h1>
                    <p className={styles.authError}>{err}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.authTitle}>Set a new password</h1>

                {(err || confirmError) && (
                    <p className={styles.authError}>{err || confirmError}</p>
                )}

                <form onSubmit={submit}>
                    <div className={styles.formRow}>
                        <label htmlFor="pwd">New password</label>
                        <input
                            id="pwd"
                            type="password"
                            className={styles.input}
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className={styles.formRow}>
                        <label htmlFor="pwd2">Confirm new password</label>
                        <input
                            id="pwd2"
                            type="password"
                            className={styles.input}
                            value={pwd2}
                            onChange={(e) => setPwd2(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={!canSubmit}
                    >
                        {pending ? 'Saving…' : 'Save password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
