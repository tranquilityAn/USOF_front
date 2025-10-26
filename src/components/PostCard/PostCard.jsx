import { Link, useNavigate } from 'react-router-dom';
import CategoryChips from '../CategoryChips/CategoryChips';
import { AiTwotoneLike, AiTwotoneDislike, AiOutlineComment } from 'react-icons/ai';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, selectIsFavorite, selectFavPending } from '../../features/favorites/favoritesSlice';
import { formatDateISO } from '../../utils/formatDate';

export default function PostCard({ post }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector(s => s.auth);
    const isFav = useSelector(s => selectIsFavorite(s, post?.id));
    const isPending = useSelector(s => selectFavPending(s, post?.id));

    const liveStatus = useSelector((s) => {
        const fromArr = (arr = []) => arr.find(p => p?.id === post?.id);
        const it = fromArr(s.posts?.items) || (s.posts?.current?.id === post?.id ? s.posts.current : null);
        const pick = it || post || {};
        if (typeof pick.status === 'string') return pick.status;                 // 'active' | 'inactive' | ...
        if (typeof pick.isActive === 'boolean') return pick.isActive ? 'active' : 'inactive';
        return undefined;
    });

    if (!post) return null;

    const onToggleFav = (e) => {
        e.preventDefault();
        if (!token || isPending) {
            navigate('/login');
            return;
        }
        dispatch(toggleFavorite({ postId: post.id, isFav }));
    };

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

    const authorId = author?.id ?? post.userId ?? post.authorId;
    const authorLogin = author?.login ?? author?.name ?? `user_${authorId || 'anon'}`;

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
                opacity: liveStatus === 'inactive' ? 0.6 : 1,
            }}
        >
            {/* Clicking the title opens the post page */}
            <h3 style={{ margin: 0, lineHeight: 1.25 }}>
                <Link to={`/post/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {title || 'Без назви'}
                </Link>
            </h3>
            {/* Categories */}
            <CategoryChips
                categories={Array.isArray(categories) && typeof categories[0] === 'object' ? categories : undefined}
                categoryIds={Array.isArray(categories) && typeof categories[0] === 'number' ? categories : post.categoryIds}
                size="sm"
            />
            {/* Author */}
            <div style={{ fontSize: 12, opacity: 0.85 }}>
                <Link
                    to={authorId ? `/profile/${authorId}` : '#'}
                    onClick={(e) => {
                        if (!authorId) e.preventDefault();
                    }}
                    style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        fontWeight: '500',
                        cursor: authorId ? 'pointer' : 'default',
                    }}
                    title={`Перейти в профіль ${authorLogin}`}
                >
                    @{author?.login || 'anon'}
                </Link>{' '}
                • {formatDateISO(date)}
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
                    fontSize: 16,
                    opacity: 0.9,
                }}
            >
                <span><AiTwotoneLike style={{ verticalAlign: 'middle' }} /> {post.likesCount ?? 0}</span>
                <span><AiTwotoneDislike style={{ verticalAlign: 'middle' }} /> {post.dislikesCount ?? 0}</span>
                <span><AiOutlineComment style={{ verticalAlign: 'middle' }} /> {post.commentsCount ?? 0}</span>

                {/* Favorite toggle */}
                <button
                    onClick={onToggleFav}
                    aria-pressed={!!isFav}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className="btn btn--ghost"
                    disabled={isPending}
                    style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                >
                    {isFav ? <AiFillHeart /> : <AiOutlineHeart />}
                    {isFav ? 'In favorites' : 'Add to favorites'}
                </button>

                <Link
                    to={`/post/${post.id}`}
                    className='btn btn--ghost'
                    style={{ marginLeft: 'auto' }}
                >
                    Read
                </Link>
            </div>
        </article>
    );
}
