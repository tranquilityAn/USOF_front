import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resendVerify, changeVerifyEmail, getVerifyTtl } from '../../features/auth/authApi';
import styles from './ConfirmEmailPage.module.css';

export default function ConfirmEmailPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();
   
    const initial = useMemo(
        () => ({
            login: sp.get('login') || '',
            email: sp.get('email') || '',
        }),
        [sp]
    );
    
    const [targetEmail, setTargetEmail] = useState(initial.email);
    
    const [ttl, setTtl] = useState(60);
    const [cooldown, setCooldown] = useState(60);
    
    const [left, setLeft] = useState(0);
    const [mode, setMode] = useState('default');
    const [newEmail, setNewEmail] = useState(initial.email);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getVerifyTtl()
            .then(r => {
                setTtl(r?.data?.ttlMinutes ?? 60);
                setCooldown(r?.data?.cooldownSec ?? 60);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (left <= 0) return;
        const t = setInterval(() => setLeft(v => Math.max(0, v - 1)), 1000);
        return () => clearInterval(t);
    }, [left]);

    const startCooldown = () => setLeft(cooldown);

    const doResend = async () => {
        setErr(''); setMsg('');
        setLoading(true);
        try {
            await resendVerify({ login: initial.login, email: targetEmail });
            setMsg('Verification email has been sent again.');
            startCooldown();
        } catch (e) {
            setErr(e?.response?.data?.error || 'Failed to resend verification email.');
        } finally {
            setLoading(false);
        }
    };

    const doChange = async () => {
        setErr(''); setMsg('');
        const looksLikeEmail = /\S+@\S+\.\S+/.test(newEmail);
        if (!looksLikeEmail) {
            setErr('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const r = await changeVerifyEmail({ login: initial.login, newEmail });
            const updated = r?.data?.email || newEmail;
            setTargetEmail(updated);
            setMsg('Email updated. Check your inbox for a new verification message.');
            setMode('default');
            setNewEmail(updated);
            startCooldown();
        } catch (e) {
            setErr(e?.response?.data?.error || 'Failed to change email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Confirm your email</h1>

            <p className={styles.lead}>
                We’ve sent a verification link to <strong>{targetEmail}</strong>.
                {' '}To sign in, please confirm your email. The link is valid for {ttl} minute{ttl === 1 ? '' : 's'}.
            </p>

            {msg && (
                <div className={`${styles.alert} ${styles.success}`} role="status" aria-live="polite">
                    {msg}
                </div>
            )}
            {err && (
                <div className={`${styles.alert} ${styles.error}`} role="alert" aria-live="assertive">
                    {err}
                </div>
            )}

            {mode === 'default' ? (
                <div className={styles.actions}>
                    <button
                        className={styles.primaryBtn}
                        onClick={doResend}
                        disabled={left > 0 || loading}
                    >
                        {left > 0 ? `Resend (${left}s)` : 'Resend verification email'}
                    </button>
                    <button
                        className={styles.ghostBtn}
                        onClick={() => setMode('change')}
                        disabled={loading}
                    >
                        Change email
                    </button>
                </div>
            ) : (
                <div className={styles.changeBlock}>
                    <label className={styles.label}>
                        New email
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="name@example.com"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            disabled={loading}
                        />
                    </label>
                    <div className={styles.actions}>
                        <button
                            className={styles.ghostBtn}
                            onClick={() => { setMode('default'); setErr(''); }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.primaryBtn}
                            onClick={doChange}
                            disabled={loading}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <button className={styles.linkBtn} onClick={() => navigate('/login')}>
                    Back to sign in
                </button>
            </div>
        </div>
    );
}
