import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, clearCurrent, togglePostReaction, deletePost } from '../../features/posts/postsSlice';
import {
    fetchCommentsByPost,
    addComment,
    deleteComment,
    toggleCommentReaction,
    fetchRepliesByComment
} from '../../features/comments/commentsSlice';
import CategoryChips from '../../components/CategoryChips/CategoryChips';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { toggleFavorite, selectIsFavorite, selectFavPending } from '../../features/favorites/favoritesSlice';

export default function PostPage() {
    const { id } = useParams();
    const postId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { current: post, currentLoading, currentError, myReactionByPost, deleteLoading, deleteError } = useSelector(s => s.posts);
    const myReaction = myReactionByPost?.[postId] ?? null;
    const { byPost, repliesByComment, loading: commentsLoading, myReactionByComment } = useSelector(s => s.comments);
    const comments = byPost[postId] || [];
    const auth = useSelector(s => s.auth);
    const isLoggedIn = Boolean(auth?.user);
    const isFav = useSelector(s => selectIsFavorite(s, postId));
    const isFavPending = useSelector(s => selectFavPending(s, postId));
    const [commentDraft, setCommentDraft] = useState('');
    const [commentUIOpen, setCommentUIOpen] = useState(false);
    const commentRef = useRef(null);
    const { user, token } = useSelector(s => s.auth);
    const [openReplies, setOpenReplies] = useState({});
    const [replyDrafts, setReplyDrafts] = useState({});

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isOwner = !!(post?.author?.id && user?.id && post.author.id === user.id);

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
        if (!token) { navigate('/login'); return; }
        if (!isOwner) return;
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

    const toggleReplies = (commentId) => {
        const next = !openReplies[commentId];
        setOpenReplies(prev => ({ ...prev, [commentId]: next }));
        if (next) {
            const bucket = repliesByComment[commentId];
            if (!bucket || (bucket && bucket.items.length === 0)) {
                dispatch(fetchRepliesByComment({ postId, commentId, page: 1, limit: 20 }));
            }
        }
    };

    const onReplyChange = (commentId, v) => setReplyDrafts(prev => ({ ...prev, [commentId]: v }));

    const submitReply = (e, parentId) => {
        e.preventDefault();
        if (requireAuth()) return;
        const content = (replyDrafts[parentId] || '').trim();
        if (!content) return;
        dispatch(addComment({ postId, content, parentId }));
        setReplyDrafts(prev => ({ ...prev, [parentId]: '' }));
    };


    const authorLabel = post.author?.name || post.author?.login || `@user_${post.author?.id || 'anon'}`;

    return (
        <div style={{ maxWidth: 860, margin: '24px auto', padding: 16 }}>
            {/* Block with menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ marginBottom: 4, marginRight: 'auto' }}>{post.title}</h1>

                {isOwner && (
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
                    {comments.map((c) => {
                        const u = c.author;
                        const label = u?.name || u?.login || `@user_${u?.id || 'anon'}`;
                        const canDelete = isLoggedIn && auth.user?.id === (c.authorId ?? u?.id);

                        return (
                            <li key={c.id} style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', borderRadius: 12, padding: 12 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                                    @{label} • {new Date(c.publishDate || c.createdAt).toLocaleString()}
                                    {c.status === 'inactive' ? <span style={{ color: '#f99' }}> • inactive</span> : null}
                                </div>

                                <div style={{ whiteSpace: 'pre-wrap' }}>{c.content}</div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {(() => {
                                        const my = myReactionByComment?.[c.id] ?? null;
                                        const likeActive = my === 'like';
                                        const dislikeActive = my === 'dislike';
                                        const btnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #3a3a3a' };
                                        return (
                                            <>
                                                <button
                                                    aria-pressed={likeActive}
                                                    onClick={() => { if (requireAuth()) return; dispatch(toggleCommentReaction({ commentId: c.id, type: 'like' })); }}
                                                    title={likeActive ? 'Remove like' : 'Like'}
                                                    style={btnStyle}
                                                >
                                                    {likeActive ? <AiFillLike /> : <AiOutlineLike />}
                                                    {c.likesCount ?? 0}
                                                </button>
                                                <button
                                                    aria-pressed={dislikeActive}
                                                    onClick={() => { if (requireAuth()) return; dispatch(toggleCommentReaction({ commentId: c.id, type: 'dislike' })); }}
                                                    title={dislikeActive ? 'Remove dislike' : 'Dislike'}
                                                    style={btnStyle}
                                                >
                                                    {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />}
                                                    {c.dislikesCount ?? 0}
                                                </button>
                                                <button
                                                    className='btn btn--ghost'
                                                    onClick={() => onReplyChange(c.id, (replyDrafts[c.id] || '')) || setOpenReplies(p => ({ ...p, [c.id]: true }))}
                                                    title='Reply'
                                                >
                                                    Reply
                                                </button>

                                                {(c.replyCount || 0) > 0 && (
                                                    <button
                                                        className='btn btn--ghost'
                                                        onClick={() => toggleReplies(c.id)}
                                                        title='View replies'
                                                    >
                                                        {openReplies[c.id] ? 'Hide replies' : `View replies (${c.replyCount})`}
                                                    </button>
                                                )}
                                            </>
                                        );
                                    })()}
                                    {canDelete && (
                                        <button className='btn btn--ghost' onClick={() => dispatch(deleteComment(c.id))} style={{ marginLeft: 'auto' }}>
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* Reply form */}
                                {openReplies[c.id] && (
                                    <form onSubmit={(e) => submitReply(e, c.id)} style={{ marginTop: 8 }}>
                                        <textarea
                                            value={replyDrafts[c.id] || ''}
                                            onChange={e => onReplyChange(c.id, e.target.value)}
                                            placeholder='Write a reply...'
                                            style={{ width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, padding: 8 }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                                            <button type='button' className='btn btn--ghost' onClick={() => setReplyDrafts(p => ({ ...p, [c.id]: '' }))}>Clear</button>
                                            <button type='submit' className='btn btn--primary'>Reply</button>
                                        </div>
                                    </form>
                                )}

                                {/* Reply list */}
                                {openReplies[c.id] && (() => {
                                    const bucket = repliesByComment[c.id];
                                    if (!bucket) return <div style={{ opacity: .7, marginTop: 8 }}>Loading replies…</div>;
                                    return (
                                        <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 8, display: 'grid', gap: 10 }}>
                                            {bucket.items.map(r => {
                                                const u = r.author;
                                                const label = u?.name || u?.login || `@user_${u?.id || 'anon'}`;
                                                const canDelete = isLoggedIn && auth.user?.id === (r.authorId ?? u?.id);
                                                const likeActive = myReactionByComment?.[r.id] === 'like';
                                                const dislikeActive = myReactionByComment?.[r.id] === 'dislike';

                                                return (
                                                    <li key={r.id} style={{ background: '#151515', border: '1px solid #2c2c2c', borderRadius: 10, padding: 10 }}>
                                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
                                                            @{label} • {new Date(r.publishDate || r.createdAt).toLocaleString()}
                                                            {r.status === 'inactive' ? <span style={{ color: '#f99' }}> • inactive</span> : null}
                                                        </div>

                                                        <div style={{ whiteSpace: 'pre-wrap' }}>{r.content}</div>

                                                        <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <button
                                                                aria-pressed={likeActive}
                                                                onClick={() => { if (requireAuth()) return; dispatch(toggleCommentReaction({ commentId: r.id, type: 'like' })); }}
                                                                className='btn btn--ghost'
                                                                title={likeActive ? 'Remove like' : 'Like'}
                                                            >
                                                                {likeActive ? <AiFillLike /> : <AiOutlineLike />} {r.likesCount ?? 0}
                                                            </button>
                                                            <button
                                                                aria-pressed={dislikeActive}
                                                                onClick={() => { if (requireAuth()) return; dispatch(toggleCommentReaction({ commentId: r.id, type: 'dislike' })); }}
                                                                className='btn btn--ghost'
                                                                title={dislikeActive ? 'Remove dislike' : 'Dislike'}
                                                            >
                                                                {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />} {r.dislikesCount ?? 0}
                                                            </button>

                                                            {canDelete && (
                                                                <button className='btn btn--danger' onClick={() => dispatch(deleteComment(r.id))} style={{ marginLeft: 'auto' }}>
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}

                                            {/* Reply pagination */}
                                            {(bucket.items.length < (bucket.total || 0)) && (
                                                <li>
                                                    <button
                                                        className='btn btn--ghost'
                                                        onClick={() => dispatch(fetchRepliesByComment({ postId, commentId: c.id, page: (bucket.page || 1) + 1, limit: bucket.limit || 20 }))}
                                                    >
                                                        Load more replies
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    );
                                })()}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
