import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../app/api';
import styles from './VerifyEmailPage.module.css';

export default function VerifyEmailPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => sp.get('token') || '', [sp]);
    const [state, setState] = useState({
        loading: true,
        ok: false,
        title: 'Verifying…',
        detail: '',
    });

    useEffect(() => {
        if (!token) {
            setState({ loading: false, ok: false, title: 'Verification failed', detail: 'Missing token.' });
            return;
        }

        (async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`, {
                    validateStatus: (s) => (s >= 200 && s < 300) || s === 409,
                });

                const msg = res?.data?.message || '';
                const already = /already verified/i.test(msg) || res?.status === 409;

                setState({
                    loading: false,
                    ok: true,
                    title: already ? 'Email already verified' : 'Email verified',
                    detail: already ? 'Your email is already verified. You can log in now.' : 'Your email was verified successfully.',
                });
            } catch (err) {
                const data = err?.response?.data || {};
                const msg = data.error || data.message || 'Verification failed';
                setState({ loading: false, ok: false, title: 'Verification failed', detail: msg });
            }
        })();
    }, [token]);

    if (state.loading) {
        return (
            <div className={styles.wrap}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Verifying…</h1>
                    <p className={styles.text}>Please wait a moment.</p>
                </div>
            </div>
        );
    }

    if (state.ok) {
        return (
            <div className={styles.wrap}>
                <div className={styles.card}>
                    <h1 className={styles.title}>{state.title} 🎉</h1>
                    {state.detail && <p className={styles.text}>{state.detail}</p>}
                    <div className={styles.actions}>
                        <button className={styles.primary} onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrap}>
            <div className={styles.card}>
                <h1 className={styles.title}>{state.title}</h1>
                {state.detail && <p className={styles.error}>{state.detail}</p>}
                <div className={styles.actions}>
                    <button className={styles.secondary} onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
