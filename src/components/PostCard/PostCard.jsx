import { Link } from 'react-router-dom';

/**
 * Post card for the list on the homepage.
 * Makes the title clickable: leads to /post/:id
 */
export default function PostCard({ post }) {
    if (!post) return null;

    const {
        id,
        title,
        content,
        excerpt,
        author,
        categories = [],
        createdAt,
        publishDate,
        coverUrl,
    } = post;

    const date = new Date(createdAt || publishDate || Date.now());
    const short =
        (excerpt && String(excerpt)) ||
        (content ? String(content).slice(0, 180) + (String(content).length > 180 ? '…' : '') : '');

    return (
        <article
            style={{
                background: '#1e1e1e',
                border: '1px solid #2c2c2c',
                borderRadius: 12,
                padding: 16,
                display: 'grid',
                gap: 8,
            }}
        >
            {/* Clicking the title opens the post page */}
            <h3 style={{ margin: 0, lineHeight: 1.25 }}>
                <Link to={`/post/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {title || 'Без назви'}
                </Link>
            </h3>

            <div style={{ fontSize: 12, opacity: 0.85 }}>
                @{author?.login || 'anon'} • {date.toLocaleString()}
                {categories.length > 0 && (
                    <> • Categories: {categories.map((c) => c?.name ?? c).join(', ')}</>
                )}
            </div>

            {coverUrl && (
                <Link to={`/post/${id}`} aria-label="Open post">
                    <img
                        src={coverUrl}
                        alt=""
                        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                        loading="lazy"
                    />
                </Link>
            )}

            {short && <p style={{ margin: 0, opacity: 0.95 }}>{short}</p>}

            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    marginTop: 4,
                    fontSize: 13,
                    opacity: 0.9,
                }}
            >
                <span>👍 {post.likesCount ?? 0}</span>
                <span>👎 {post.dislikesCount ?? 0}</span>
                <span>💬 {post.commentsCount ?? 0}</span>

                <Link
                    to={`/post/${post.id}`}
                    style={{
                        marginLeft: 'auto',
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        padding: '6px 10px',
                        borderRadius: 8,
                    }}
                >
                    Read
                </Link>
            </div>
        </article>
    );
}
