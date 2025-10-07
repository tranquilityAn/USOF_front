import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import styles from './Header.module.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, token } = useSelector((s) => s.auth);

    const isAuth = !!token;

    // Header without search/user block on login and register pages
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.brand}>USOF</Link>

                {!isAuthPage && (
                    <>
                        <div className={styles.search}>
                            <input placeholder="Search" aria-label="Search" />
                        </div>

                        <div className={styles.userBlock}>
                            {isAuth ? (
                                <>
                                    <Link to={`/profile/${user?.id || 'me'}`} className={styles.userLink}>
                                        {user?.login ? `@${user.login}` : '@user'} • {user?.role || 'user'}
                                    </Link>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="avatar" className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatar} />
                                    )}
                                    <button
                                        onClick={() => { dispatch(logout()); navigate('/'); }}
                                        className={styles.button}
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className={styles.userLink}>Sing in</Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
