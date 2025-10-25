import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';

const schema = z.object({
    login: z.string().min(3, 'Minimum 3 symbols'),
    password: z.string().min(6, 'Minimum 6 symbols'),
});

export default function LoginPage() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, token } = useSelector((s) => s.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { login: '', password: '' },
    });

    const onSubmit = (values) => {
        console.log('[LOGIN SUBMIT]', values);
        dispatch(login(values));
    };

    useEffect(() => {
        if (token) navigate('/');
    }, [token, navigate]);

    return (
        <div className={styles.wrap}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
                <h1 className={styles.title}>Log in</h1>
                <p className={styles.subtitle}>Welcome back</p>

                <div className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Login</label>
                        <input className={styles.input} {...register('login')} />
                        {errors.login && <div className={styles.errorText}>{errors.login.message}</div>}
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Password</label>
                        <input className={styles.input} type="password" {...register('password')} />
                        {errors.password && <div className={styles.errorText}>{errors.password.message}</div>}
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" disabled={status === 'loading'} className={styles.button}>
                            {status === 'loading' ? 'Logging…' : 'Log in'}
                        </button>
                        {error && <div className={styles.errorText}>{error}</div>}
                    </div>

                    <div className={styles.footer}>
                        Don’t have an account? <Link to="/register" className={styles.link}>Register</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
