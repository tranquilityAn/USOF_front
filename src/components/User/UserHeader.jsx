export default function UserHeader({ user }) {
    if (!user) return null;
    const { login, fullName, profilePicture, role } = user;


    return (
        <div className="card card-lg" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <img
                src={profilePicture || 'https://via.placeholder.com/96?text=User'}
                alt=""
                className="avatar"
                loading="lazy"
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