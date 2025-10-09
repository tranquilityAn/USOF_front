import { getAvatarUrl } from '../../utils/getAvatarUrl';

export default function UserHeader({ user }) {
    if (!user) return null;
    const { login, fullName, profilePicture, role } = user;

    const avatarSrc = getAvatarUrl(profilePicture) || 'https://via.placeholder.com/96?text=User';
    return (
        <div className="card card-lg" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <img
                src={avatarSrc}
                alt=""
                className="avatar"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/96?text=User'; }}
            />
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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