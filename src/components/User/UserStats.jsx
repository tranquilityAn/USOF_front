export default function UserStats({ rating = 0, postsCount = 0 }) {
    return (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
                <div className="small text-dim">Rating</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{rating}</div>
            </div>
            <div className="card" style={{ padding: 12 }}>
                <div className="small text-dim">Posts</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{postsCount}</div>
            </div>
        </div>
    );
}