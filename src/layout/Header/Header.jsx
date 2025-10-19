import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import styles from './Header.module.css';
import { CgProfile } from 'react-icons/cg';
import { AiOutlineHeart } from 'react-icons/ai';
import { IoSettingsOutline } from "react-icons/io5";
import { RxExit } from "react-icons/rx";
import { IoCreateOutline } from "react-icons/io5";
import { getAvatarUrl } from '../../utils/getAvatarUrl';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, token } = useSelector((s) => s.auth);

    const isAuth = !!token;

    const avatarSrc = useMemo(() => {
        const raw = user?.profilePicture ?? user?.avatar ?? '';
        return getAvatarUrl(raw) || 'https://via.placeholder.com/32?text=U';
    }, [user]);

    // Header without search/user block on login and register pages
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const closeDropdown = () => setIsDropdownOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        closeDropdown();
        navigate('/login');
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);


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
                                    <Link
                                        to="/post/new"
                                        className='btn btn--primary'
                                        aria-label="Create a new post"
                                    >
                                        <IoCreateOutline />
                                        {/* Create */}
                                        <span className={styles.btnLabel}>Create</span>
                                    </Link>
                                    {/* --- DROPDOWN --- */}
                                    <div className={styles.dropdown} ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen((v) => !v)}
                                            className={styles.dropdownToggle}
                                            aria-haspopup="menu"
                                            aria-expanded={isDropdownOpen ? 'true' : 'false'}
                                            aria-label="User menu"
                                        >
                                            <img
                                                src={avatarSrc}
                                                alt="avatar"
                                                className={styles.avatar}
                                                loading="lazy"
                                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32?text=U'; }}
                                            />
                                            <span className={styles.userHandle}>
                                                {user?.login ? `@${user.login}` : '@user'}
                                            </span>
                                        </button>

                                        {isDropdownOpen && (
                                            <div className={styles.dropdownMenu} role="menu">
                                                <Link
                                                    to={`/profile/${user?.id || 'me'}`}
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={closeDropdown}
                                                >
                                                    <CgProfile />
                                                    Profile
                                                </Link>

                                                <Link
                                                    to="/favorites"
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={closeDropdown}
                                                >
                                                    <AiOutlineHeart />
                                                    Favorites
                                                </Link>

                                                {/* Settings */}
                                                <Link
                                                    to="/settings/profile"
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={closeDropdown}
                                                >
                                                    <IoSettingsOutline />
                                                    Settings
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className={`${styles.dropdownItem} ${styles.logoutButton}`}
                                                    role="menuitem"
                                                >
                                                    <RxExit />
                                                    Log out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* --- /DROPDOWN --- */}
                                </>
                            ) : (
                                <div className={styles.Links}>
                                    <Link to="/login" className={styles.userLink}>Sign in</Link>
                                    <Link to="/register" className={styles.userLink}>Sign up</Link>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
