export default function UserActions({ canEdit = false, onEdit }) {
    return (
        <div className="card" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost">Follow</button>
            <button className="btn btn-ghost">Message</button>
            {canEdit && (
                <button className="btn btn-primary" onClick={onEdit}>Edit Profile</button>
            )}
        </div>
    );
}