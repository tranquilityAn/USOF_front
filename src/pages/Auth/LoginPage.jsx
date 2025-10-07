import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

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
        <div className={styles.wrapper}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h1 className={styles.title}>Login</h1>

                <label className={styles.label}>
                    Login
                    <input {...register('login')} className={styles.input} placeholder="login" />
                    {errors.login && <span className={styles.error}>{errors.login.message}</span>}
                </label>

                <label className={styles.label}>
                    Password
                    <input type="password" {...register('password')} className={styles.input} placeholder="••••••" />
                    {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                </label>

                <button type="submit" disabled={status === 'loading'} className={styles.button}>
                    {status === 'loading' ? 'Loggin...' : 'Log in'}
                </button>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.footer}>
                    Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
                </div>
            </form>
        </div>
    );
}
