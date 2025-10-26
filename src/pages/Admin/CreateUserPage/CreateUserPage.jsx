import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createUser, clearCreateUserStatus } from '../../../features/users/usersSlice';
import styles from './CreateUserPage.module.css';

export default function CreateUserPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { createUserLoading, createUserError } = useSelector(s => s.users);

    const [form, setForm] = useState({
        login: '',
        fullName: '',
        email: '',
        role: 'user',
        password: '',
        passwordConfirmation: '',
    });

    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        return () => { dispatch(clearCreateUserStatus()); };
    }, [dispatch]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const validate = () => {
        if (!form.login.trim()) return 'Login is required';
        if (!form.email.trim()) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Invalid email';
        if (!form.password) return 'Password is required';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.passwordConfirmation) return 'Passwords do not match';
        if (!['user', 'admin'].includes(form.role)) return 'Invalid role';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        setLocalError(err);
        if (err) return;

        try {
            const res = await dispatch(createUser({
                login: form.login.trim(),
                fullName: form.fullName.trim() || undefined,
                email: form.email.trim(),
                role: form.role,
                password: form.password,
                passwordConfirmation: form.passwordConfirmation,
            })).unwrap();

            if (res?.id) navigate(`/profile/${res.id}`);
            else navigate('/');
        } catch {
        }
    };

    const showErr = localError || createUserError;
    return (
        <div className={styles.pageWrap}>
            <h1 className={styles.pageTitle}>Create User</h1>

            {showErr && <div role="alert" className={styles.alertBox}>{showErr}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid} autoComplete="off">
                <label className={styles.labelWrap}>
                    <span>Login *</span>
                    <input
                        type="text"
                        name="login"
                        value={form.login}
                        onChange={onChange}
                        placeholder="username"
                        required
                        autoComplete="username"
                        className={styles.field}
                    />
                </label>

                <label className={styles.labelWrap}>
                    <span>Full name</span>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        placeholder="John Doe"
                        className={styles.field}
                    />
                </label>

                <label className={styles.labelWrap}>
                    <span>Email *</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                        className={styles.field}
                    />
                </label>

                <label className={styles.labelWrap}>
                    <span>Role *</span>
                    <div className={styles.selectShell}>
                        <select
                            name="role"
                            value={form.role}
                            onChange={onChange}
                            required
                            className={styles.select}
                        >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                        </select>
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" className={styles.chevronIcon}>
                            <path d="M5.5 7.5l4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </label>

                <label className={styles.labelWrap}>
                    <span>Password *</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder="••••••"
                        required
                        autoComplete="new-password"
                        className={styles.field}
                    />
                </label>

                <label className={styles.labelWrap}>
                    <span>Password confirmation *</span>
                    <input
                        type="password"
                        name="passwordConfirmation"
                        value={form.passwordConfirmation}
                        onChange={onChange}
                        placeholder="••••••"
                        required
                        autoComplete="new-password"
                        className={styles.field}
                    />
                </label>

                <div className={styles.btnRow}>
                    <button type="submit" disabled={createUserLoading} className={styles.primaryBtn}>
                        {createUserLoading ? 'Creating…' : 'Create'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className={styles.ghostBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}