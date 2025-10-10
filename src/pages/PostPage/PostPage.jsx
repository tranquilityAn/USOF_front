import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, clearCurrent, togglePostReaction } from '../../features/posts/postsSlice';
import {
    fetchCommentsByPost,
    addComment,
    deleteComment,
    toggleCommentReaction,
} from '../../features/comments/commentsSlice';
import CategoryChips from '../../components/CategoryChips/CategoryChips';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';

export default function PostPage() {
    const { id } = useParams();
    const postId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { current: post, currentLoading, currentError, myReactionByPost } = useSelector(s => s.posts);
    const myReaction = myReactionByPost?.[postId] ?? null;
    const { byPost, loading: commentsLoading, myReactionByComment } = useSelector(s => s.comments);
    const comments = byPost[postId] || [];
    const auth = useSelector(s => s.auth);
    const isLoggedIn = Boolean(auth?.user);

    useEffect(() => {
        if (!Number.isFinite(postId)) return;
        dispatch(fetchPostById(postId));
        dispatch(fetchCommentsByPost(postId));
        return () => dispatch(clearCurrent());
    }, [dispatch, postId]);

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
        const form = new FormData(e.currentTarget);
        const content = (form.get('content') || '').toString().trim();
        if (!content) return;
        dispatch(addComment({ postId: post.id, content }));
        e.currentTarget.reset();
    };

    const authorLabel = post.author?.name || post.author?.login || `@user_${post.author?.id || 'anon'}`;

    return (
        <div style={{ maxWidth: 860, margin: '24px auto', padding: 16 }}>
            <h1 style={{ marginBottom: 4 }}>{post.title}</h1>
            <CategoryChips categories={post.categories} />
            <div style={{ opacity: .8, marginBottom: 16 }}>
                by <strong>{authorLabel}</strong>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</div>

            {/* Post reactions panel */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
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
            </div>

            <hr style={{ margin: '16px 0' }} />

            {/* Comments */}
            <section>
                <h3>Comments</h3>

                <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
                    <textarea
                        name="content"
                        placeholder="Write a comment…"
                        rows={3}
                        style={{ width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, padding: 8 }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <button className='btn btn--primary' type="submit">Send</button>
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
                                            </>
                                        );
                                    })()}
                                    {canDelete && (
                                        <button onClick={() => dispatch(deleteComment(c.id))} style={{ marginLeft: 'auto' }}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}
