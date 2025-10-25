import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';

const schema = z.object({
    login: z.string().min(3, 'Minimum 3 symbols'),
    fullName: z.string().min(2, 'Minimum 2 symbols'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Minimum 6 symbols'),
    passwordConfirmation: z.string().min(6, 'Minimum 6 symbols'),
}).refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: "Passwords don't match",
});

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { registerStatus, registerError, token } = useSelector((s) => s.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            login: '',
            fullName: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
    });

    const onSubmit = (values) => {
        dispatch(registerUser(values))
            .unwrap()
            .then((payload) => {
                const login = payload?.login || values.login;
                const email = payload?.email || values.email;

                navigate(
                    `/confirm-email?login=${encodeURIComponent(login)}&email=${encodeURIComponent(email)}`
                );
            })
            .catch(() => {
            });
    };

    // if user already authorized
    useEffect(() => {
        if (token) navigate('/');
    }, [token, navigate]);

    return (
        <div className={styles.wrapper}>
            <form onSubmit={handleSubmit(onSubmit)} className={`${styles.card} ${styles.form}`}>
                <h1 className={styles.title}>Registration</h1>

                <div className={styles.group}>
                    <label htmlFor="login" className={styles.label}>Login</label>
                    <input id="login" {...register('login')} className={styles.input} placeholder="your_login" />
                    {errors.login && <span className={styles.errorText}>{errors.login.message}</span>}
                </div>

                <div className={styles.group}>
                    <label htmlFor="fullName" className={styles.label}>Full name</label>
                    <input id="fullName" {...register('fullName')} className={styles.input} placeholder="Your name" />
                    {errors.fullName && <span className={styles.errorText}>{errors.fullName.message}</span>}
                </div>

                <div className={styles.group}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input id="email" type="email" {...register('email')} className={styles.input} placeholder="you@example.com" />
                    {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
                </div>

                <div className={styles.group}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input id="password" type="password" {...register('password')} className={styles.input} placeholder="••••••" />
                    {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
                </div>

                <div className={styles.group}>
                    <label htmlFor="passwordConfirmation" className={styles.label}>Confirm password</label>
                    <input id="passwordConfirmation" type="password" {...register('passwordConfirmation')} className={styles.input} placeholder="••••••" />
                    {errors.passwordConfirmation && <span className={styles.errorText}>{errors.passwordConfirmation.message}</span>}
                </div>

                <button type="submit" disabled={registerStatus === 'loading'} className={styles.button}>
                    {registerStatus === 'loading' ? 'Registering…' : 'Create an account'}
                </button>
                {registerError && <div className={styles.errorText}>{registerError}</div>}

                <div className={styles.footer}>
                    Already have an account? <Link to="/login" className={styles.link}>Log in</Link>
                </div>
            </form>
        </div>
    );
}
