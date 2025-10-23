import Avatar from '../Avatar/Avatar';
import './UserHeader.css';

export default function UserHeader({ user }) {
    if (!user) return null;
    const { login, fullName, profilePicture, role } = user;

    return (
        <div className="user-header card card-lg">
            <Avatar src={profilePicture} alt={login} className="user-header-avatar" />
            <div>
                <div className="user-header-info">
                    <h1 className="h1">{login}</h1>
                    <span className={`badge ${role === 'admin' ? 'badge-admin' : ''}`} title={`Role: ${role}`}>
                        {role}
                    </span>
                </div>
                {fullName && <p className="text-dim" style={{ margin: 0 }}>{fullName}</p>}
            </div>
        </div>
    );
}
