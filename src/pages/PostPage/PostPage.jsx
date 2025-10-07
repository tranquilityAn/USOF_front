// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { fetchPostById, clearCurrent, togglePostReaction } from '../../features/posts/postsSlice';
// import { fetchCommentsByPost, addComment, deleteComment, reactToComment, removeCommentReaction } from '../../features/comments/commentsSlice';
// import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';

// export default function PostPage() {
//     const { id } = useParams();
//     const postId = Number(id);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const { current: post, currentLoading, currentError, myReactionByPost } = useSelector(s => s.posts);
//     const myReaction = myReactionByPost?.[postId] ?? null; // 'like' | 'dislike' | null

//     const comments = useSelector(s => s.comments.byPost[postId]) || [];
//     const commentsLoading = useSelector(s => s.comments.loading);
//     const auth = useSelector(s => s.auth);
//     const isLoggedIn = Boolean(auth?.user);

//     useEffect(() => {
//         if (!Number.isFinite(postId)) return;
//         dispatch(fetchPostById(postId));
//         dispatch(fetchCommentsByPost(postId));
//         return () => { dispatch(clearCurrent()); };
//     }, [postId, dispatch]);

//     if (currentLoading) return <div className="page"><p>Loading...</p></div>;
//     if (currentError) return <div className="page"><p>Error: {currentError}</p></div>;
//     if (!post) return null;

//     const requireAuth = () => { if (!isLoggedIn) { navigate('/login'); return true; } return false; };

//     const handleToggleReaction = (type) => {
//         if (requireAuth()) return;
//         // One thunk handles all logic: same type removes, different replaces
//         dispatch(togglePostReaction({ id: post.id, type }));
//     };

//     const handleAddComment = (e) => {
//         e.preventDefault();
//         if (requireAuth()) return;
//         const form = new FormData(e.currentTarget);
//         const content = (form.get('content') || '').toString().trim();
//         if (!content) return;
//         dispatch(addComment({ postId: post.id, content }));
//         e.currentTarget.reset();
//     };

//     const likeActive = myReaction === 'like';
//     const dislikeActive = myReaction === 'dislike';

//     return (
//         <div className="page" style={{ color: '#f5f5f5' }}>
//             <nav style={{ margin: '8px 0' }}>
//                 <Link to="/">← Back to posts</Link>
//             </nav>

//             <article style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', borderRadius: 12, padding: 16 }}>
//                 <h1 style={{ marginTop: 0 }}>{post.title}</h1>
//                 <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
//                     @{post.author?.login || 'anon'} • {new Date(post.publishDate || post.createdAt || Date.now()).toLocaleString()}
//                     {post.categories?.length ? <> • Categories: {post.categories.map(c => c.name || c).join(', ')}</> : null}
//                 </div>

//                 <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
//                     {post.content}
//                 </div>

//                 {/* Reaction panel with counters */}
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
//                     <button
//                         aria-pressed={likeActive}
//                         onClick={() => handleToggleReaction('like')}
//                         title={likeActive ? 'Remove like' : 'Add like'}
//                         style={{
//                             display: 'inline-flex', alignItems: 'center', gap: 6,
//                             padding: '6px 10px', borderRadius: 8,
//                             border: '1px solid #3a3a3a',
//                             background: likeActive ? '#1f6feb22' : '#2a2a2a',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         {likeActive ? <AiFillLike /> : <AiOutlineLike />}
//                         <span>{post.likesCount ?? 0}</span>
//                     </button>

//                     <button
//                         aria-pressed={dislikeActive}
//                         onClick={() => handleToggleReaction('dislike')}
//                         title={dislikeActive ? 'Remove dislike' : 'Add dislike'}
//                         style={{
//                             display: 'inline-flex', alignItems: 'center', gap: 6,
//                             padding: '6px 10px', borderRadius: 8,
//                             border: '1px solid #3a3a3a',
//                             background: dislikeActive ? '#ef444422' : '#2a2a2a',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />}
//                         <span>{post.dislikesCount ?? 0}</span>
//                     </button>
//                 </div>
//             </article>

//             <section style={{ marginTop: 24 }}>
//                 <h3>Comments</h3>

//                 {!post.lockedByAuthor && (
//                     <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
//                         <textarea
//                             name="content"
//                             placeholder="Write a comment…"
//                             rows={3}
//                             style={{ width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, padding: 8 }}
//                         />
//                         <div style={{ marginTop: 8 }}>
//                             <button type="submit">Send</button>
//                         </div>
//                     </form>
//                 )}

//                 {commentsLoading && <p>Loading comments…</p>}
//                 {!commentsLoading && comments.length === 0 && <p>No comments yet.</p>}

//                 <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
//                     {comments.map((c) => (
//                         <li key={c.id} style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', borderRadius: 12, padding: 12 }}>
//                             <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
//                                 @{c.author?.login || 'anon'} • {new Date(c.publishDate || c.createdAt).toLocaleString()}
//                                 {c.status === 'inactive' ? <span style={{ color: '#f99' }}> • inactive</span> : null}
//                                 {c.lockedByAuthor ? <span style={{ color: '#ff9' }}> • locked</span> : null}
//                             </div>

//                             <div style={{ whiteSpace: 'pre-wrap' }}>{c.content}</div>

//                             <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
//                                 <button onClick={() => { if (requireAuth()) return; dispatch(reactToComment({ commentId: c.id, type: 'like' })); }}>
//                                     👍 <span style={{ marginLeft: 6 }}>{c.likesCount ?? 0}</span>
//                                 </button>

//                                 <button onClick={() => { if (requireAuth()) return; dispatch(reactToComment({ commentId: c.id, type: 'dislike' })); }}>
//                                     👎 <span style={{ marginLeft: 6 }}>{c.dislikesCount ?? 0}</span>
//                                 </button>

//                                 <button onClick={() => { if (requireAuth()) return; dispatch(removeCommentReaction(c.id)); }} title="Прибрати мою реакцію">
//                                     ↩︎
//                                 </button>

//                                 {isLoggedIn && auth.user?.id === c.authorId && (
//                                     <button onClick={() => dispatch(deleteComment(c.id))} style={{ marginLeft: 'auto' }}>
//                                         Delete
//                                     </button>
//                                 )}
//                             </div>
//                         </li>
//                     ))}
//                 </ul>
//             </section>
//         </div>
//     );
// }
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPostById, clearCurrent, togglePostReaction } from '../../features/posts/postsSlice';
import { fetchCommentsByPost, addComment, deleteComment, reactToComment, removeCommentReaction } from '../../features/comments/commentsSlice';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';

export default function PostPage() {
    const { id } = useParams();
    const postId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { current: post, currentLoading, currentError, myReactionByPost } = useSelector(s => s.posts);
    const myReaction = myReactionByPost?.[postId] ?? null; // 'like' | 'dislike' | null

    const comments = useSelector(s => s.comments.byPost[postId]) || [];
    const commentsLoading = useSelector(s => s.comments.loading);
    const auth = useSelector(s => s.auth);
    const isLoggedIn = Boolean(auth?.user);

    useEffect(() => {
        if (!Number.isFinite(postId)) return;
        dispatch(fetchPostById(postId));
        dispatch(fetchCommentsByPost(postId));
        return () => { dispatch(clearCurrent()); };
    }, [postId, dispatch]);

    if (currentLoading) return <div className="page"><p>Loading...</p></div>;
    if (currentError) return <div className="page"><p>Error: {currentError}</p></div>;
    if (!post) return null;

    const requireAuth = () => { if (!isLoggedIn) { navigate('/login'); return true; } return false; };

    const handleToggleReaction = (type) => {
        if (requireAuth()) return;
        dispatch(togglePostReaction({ id: post.id, type }));
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

    const likeActive = myReaction === 'like';
    const dislikeActive = myReaction === 'dislike';

    // treat "locked" as "pinned"
    const isPostPinned = Boolean(post.lockedByAuthor || post.locked);

    return (
        <div className="page" style={{ color: '#f5f5f5' }}>
            <nav style={{ margin: '8px 0' }}>
                <Link to="/">← Back to posts</Link>
            </nav>

            <article style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', borderRadius: 12, padding: 16 }}>
                <h1 style={{ marginTop: 0 }}>
                    {/*isPostPinned && <span title="Pinned" style={{ marginRight: 8 }}>📌</span>*/}
                    {post.title}
                </h1>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                    @{post.author?.login || 'anon'} • {new Date(post.publishDate || post.createdAt || Date.now()).toLocaleString()}
                    {post.categories?.length ? <> • Categories: {post.categories.map(c => c.name || c).join(', ')}</> : null}
                    {isPostPinned ? <> • <span title="Pinned">pinned</span></> : null}
                </div>

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {post.content}
                </div>

                {/* Reaction panel with counters */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                    <button
                        aria-pressed={likeActive}
                        onClick={() => handleToggleReaction('like')}
                        title={likeActive ? 'Remove like' : 'Add like'}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 10px', borderRadius: 8,
                            border: '1px solid #3a3a3a',
                            background: likeActive ? '#1f6feb22' : '#2a2a2a',
                            cursor: 'pointer'
                        }}
                    >
                        {likeActive ? <AiFillLike /> : <AiOutlineLike />}
                        <span>{post.likesCount ?? 0}</span>
                    </button>

                    <button
                        aria-pressed={dislikeActive}
                        onClick={() => handleToggleReaction('dislike')}
                        title={dislikeActive ? 'Remove dislike' : 'Add dislike'}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 10px', borderRadius: 8,
                            border: '1px solid #3a3a3a',
                            background: dislikeActive ? '#ef444422' : '#2a2a2a',
                            cursor: 'pointer'
                        }}
                    >
                        {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />}
                        <span>{post.dislikesCount ?? 0}</span>
                    </button>
                </div>
            </article>

            <section style={{ marginTop: 24 }}>
                <h3>Comments</h3>

                {/* форма комментирования всегда доступна; "locked" больше не скрывает её */}
                <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
                    <textarea
                        name="content"
                        placeholder="Write a comment…"
                        rows={3}
                        style={{ width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, padding: 8 }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <button type="submit">Send</button>
                    </div>
                </form>

                {commentsLoading && <p>Loading comments…</p>}
                {!commentsLoading && comments.length === 0 && <p>No comments yet.</p>}

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                    {comments.map((c) => {
                        const isPinned = Boolean(c.lockedByAuthor || c.locked);
                        return (
                            <li key={c.id} style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', borderRadius: 12, padding: 12 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                                    @{c.author?.login || 'anon'} • {new Date(c.publishDate || c.createdAt).toLocaleString()}
                                    {c.status === 'inactive' ? <span style={{ color: '#f99' }}> • inactive</span> : null}
                                    {/*isPinned ? <span title="Pinned"> • 📌 pinned</span> : null*/}
                                </div>

                                <div style={{ whiteSpace: 'pre-wrap' }}>{c.content}</div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={() => { if (requireAuth()) return; dispatch(reactToComment({ commentId: c.id, type: 'like' })); }}>
                                        👍 <span style={{ marginLeft: 6 }}>{c.likesCount ?? 0}</span>
                                    </button>

                                    <button onClick={() => { if (requireAuth()) return; dispatch(reactToComment({ commentId: c.id, type: 'dislike' })); }}>
                                        👎 <span style={{ marginLeft: 6 }}>{c.dislikesCount ?? 0}</span>
                                    </button>

                                    <button onClick={() => { if (requireAuth()) return; dispatch(removeCommentReaction(c.id)); }} title="Прибрати мою реакцію">
                                        ↩︎
                                    </button>

                                    {isLoggedIn && auth.user?.id === c.authorId && (
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
