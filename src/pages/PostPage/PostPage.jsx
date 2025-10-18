import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, clearCurrent, togglePostReaction, deletePost } from '../../features/posts/postsSlice';
import {
    fetchCommentsByPost,
    addComment,
} from '../../features/comments/commentsSlice';
import CategoryChips from '../../components/CategoryChips/CategoryChips';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { toggleFavorite, selectIsFavorite, selectFavPending } from '../../features/favorites/favoritesSlice';
import CommentNode from '../../components/CommentNode/CommentNode';

export default function PostPage() {
    const { id } = useParams();
    const postId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { current: post, currentLoading, currentError, myReactionByPost, deleteLoading, deleteError } = useSelector(s => s.posts);
    const myReaction = myReactionByPost?.[postId] ?? null;
    const { byPost, loading: commentsLoading } = useSelector(s => s.comments);
    const comments = byPost[postId] || [];
    const auth = useSelector(s => s.auth);
    const isLoggedIn = Boolean(auth?.user);
    const isFav = useSelector(s => selectIsFavorite(s, postId));
    const isFavPending = useSelector(s => selectFavPending(s, postId));
    const [commentDraft, setCommentDraft] = useState('');
    const [commentUIOpen, setCommentUIOpen] = useState(false);
    const commentRef = useRef(null);
    const { user, token } = useSelector(s => s.auth);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isOwner = !!(post?.author?.id && user?.id && post.author.id === user.id);
    const isAdmin = user?.role === 'admin';
    const canManage = isOwner || isAdmin;

    const onToggleFav = () => {
        if (requireAuth()) return;
        if (isFavPending) return; // захист від дабл-кліків/гонок
        dispatch(toggleFavorite({ postId, isFav })); // всередині вирішує: DELETE чи POST
    };

    useEffect(() => {
        if (!Number.isFinite(postId)) return;
        dispatch(fetchPostById(postId));
        dispatch(fetchCommentsByPost(postId));
        return () => dispatch(clearCurrent());
    }, [dispatch, postId]);

    // menu closing
    useEffect(() => {
        const onDocClick = (e) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const onDelete = async () => {
        setMenuOpen(false);
        if (!token) { navigate('/login'); return; }
        if (!canManage) return;
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        const res = await dispatch(deletePost(postId));
        if (deletePost.fulfilled.match(res)) {
            navigate('/');
        }
    };

    if (currentLoading) return <div>Loading…</div>;
    if (currentError) return <div style={{ color: 'tomato' }}>Error: {currentError}</div>;
    if (!post) return null;

    const requireAuth = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return true;
        }
        return false;
    };

    const likeActive = myReaction === 'like';
    const dislikeActive = myReaction === 'dislike';

    const handleTogglePostReaction = (type) => {
        if (requireAuth()) return;
        dispatch(togglePostReaction({ id: postId, type }));
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (requireAuth()) return;

        const content = commentDraft.trim();
        if (!content) return;
        dispatch(addComment({ postId: post.id, content }));
        setCommentDraft('');
        setCommentUIOpen(false);
        commentRef.current?.blur();
    };

    const authorLabel = post.author?.name || post.author?.login || `@user_${post.author?.id || 'anon'}`;

    return (
        <div style={{ maxWidth: 860, margin: '24px auto', padding: 16 }}>
            {/* Block with menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ marginBottom: 4, marginRight: 'auto' }}>{post.title}</h1>

                {canManage && (
                    <div ref={menuRef} style={{ position: 'relative' }}>
                        <button
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(v => !v)}
                            title="Options"
                            style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: '1px solid #2c2c2c', background: '#111',
                                color: '#f5f5f5', cursor: 'pointer', lineHeight: 1
                            }}
                        >
                            &#8942;
                        </button>

                        {menuOpen && (
                            <div
                                role="menu"
                                style={{
                                    position: 'absolute', right: 0, marginTop: 6, minWidth: 170,
                                    background: '#111', border: '1px solid #2c2c2c', borderRadius: 10,
                                    boxShadow: '0 6px 26px rgba(0,0,0,.35)', overflow: 'hidden', zIndex: 10
                                }}
                            >
                                <button
                                    role="menuitem"
                                    onClick={() => { setMenuOpen(false); navigate(`/post/${postId}/edit`); }}
                                    className="btn btn--ghost"
                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #222' }}
                                >
                                    Edit
                                </button>
                                <button
                                    role="menuitem"
                                    onClick={onDelete}
                                    className="btn btn--ghost"
                                    disabled={deleteLoading}
                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', color: '#ff6b6b', opacity: deleteLoading ? .7 : 1 }}
                                >
                                    {deleteLoading ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Author / categories */}
            <div style={{ opacity: .8, marginBottom: 8, marginTop: 8 }}>
                by <strong>{authorLabel}</strong>
            </div>
            <CategoryChips categories={post.categories} />

            {/* Post body */}
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: 8 }}>{post.content}</div>

            {/* Post reactions panel */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                <button
                    aria-pressed={likeActive}
                    onClick={() => handleTogglePostReaction('like')}
                    title={likeActive ? 'Remove like' : 'Like'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #3a3a3a' }}
                >
                    {likeActive ? <AiFillLike /> : <AiOutlineLike />}
                    {post.likesCount ?? 0}
                </button>

                <button
                    aria-pressed={dislikeActive}
                    onClick={() => handleTogglePostReaction('dislike')}
                    title={dislikeActive ? 'Remove dislike' : 'Dislike'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #3a3a3a' }}
                >
                    {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />}
                    {post.dislikesCount ?? 0}
                </button>

                <div style={{ marginLeft: 'auto', opacity: .8 }}>
                    {post.commentsCount ?? comments.length ?? 0} comments
                </div>

                <button
                    onClick={onToggleFav}
                    aria-pressed={!!isFav}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className="btn btn--ghost"
                    disabled={isFavPending}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        opacity: isFavPending ? 0.6 : 1,
                        cursor: isFavPending ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isFav ? <AiFillHeart /> : <AiOutlineHeart />} {isFav ? 'In favorites' : 'Add to favorites'}
                </button>
            </div>

            {deleteError && (
                <div style={{ color: 'tomato', marginTop: 8 }}>
                    Error: {deleteError}
                </div>
            )}

            <hr style={{ margin: '16px 0' }} />

            {/* Comments */}
            <section>
                <h3>Comments</h3>

                <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
                    <textarea
                        ref={commentRef}
                        name="content"
                        placeholder="Write a comment…"
                        rows={3}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        onFocus={() => setCommentUIOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setCommentDraft('');
                                setCommentUIOpen(false);
                                commentRef.current?.blur();
                            }
                        }}
                        style={{
                            width: '100%',
                            background: '#1e1e1e',
                            color: '#f5f5f5',
                            border: '1px solid #333',
                            borderRadius: 8,
                            padding: 8
                        }}
                    />

                    {/* Action panel */}
                    <div
                        style={{
                            display: (commentUIOpen || commentDraft.length > 0) ? 'flex' : 'none',
                            justifyContent: 'flex-end',
                            gap: 8,
                            marginTop: 8
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => {
                                setCommentDraft('');
                                setCommentUIOpen(false);
                                commentRef.current?.blur();
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            className='btn btn--primary'
                            type="submit"
                            disabled={!commentDraft.trim()}
                        >
                            Comment
                        </button>
                    </div>
                </form>

                {commentsLoading && <p>Loading comments…</p>}
                {!commentsLoading && comments.length === 0 && <p>No comments yet.</p>}

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                    {comments.map((c) => (
                        <CommentNode key={c.id} postId={postId} comment={c} depth={0} />
                    ))}
                </ul>
            </section>
        </div>
    );
}
