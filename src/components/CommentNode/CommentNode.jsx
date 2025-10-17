import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addComment,
    deleteComment,
    toggleCommentReaction,
    fetchRepliesByComment,
} from '../../features/comments/commentsSlice';

export default function CommentNode({ postId, comment, depth = 0, maxDepth = 50 }) {
    const dispatch = useDispatch();
    const { user } = useSelector(s => s.auth);
    const repliesBucket = useSelector(s => s.comments.repliesByComment[comment.id]);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const repliesTotal = (repliesBucket?.total ?? comment.replyCount ?? 0);
    const isOwner = user?.id && comment.author?.id === user.id;

    const toggleOpen = () => {
        const next = !open;
        setOpen(next);
        if (next) {
            if (!repliesBucket || (repliesBucket && repliesBucket.items.length === 0)) {
                dispatch(fetchRepliesByComment({ postId, commentId: comment.id, page: 1, limit: 20 }));
            }
        }
    };

    const onReply = (e) => {
        e.preventDefault();
        const txt = draft.trim();
        if (!txt) return;
        dispatch(addComment({ postId, content: txt, parentId: comment.id }));
        setDraft('');
        if (!open) setOpen(true);
    };

    const onLike = () => dispatch(toggleCommentReaction({ commentId: comment.id, type: 'like' }));
    const onDislike = () => dispatch(toggleCommentReaction({ commentId: comment.id, type: 'dislike' }));
    const onDelete = () => dispatch(deleteComment(comment.id));

    const children = repliesBucket?.items || [];
    const hasMore = (repliesBucket?.items.length || 0) < (repliesBucket?.total || 0);

    return (
        <li style={{ marginLeft: depth ? 16 : 0, paddingTop: 8 }}>
            {/* header */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>
                    {comment.author?.name || comment.author?.login || `@user_${comment.author?.id || 'anon'}`}
                </div>
                <div style={{ fontSize: 12, opacity: .7 }}>
                    {new Date(comment.publishDate || comment.createdAt).toLocaleString()}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button className="btn btn--ghost" onClick={onLike}>👍 {comment.likesCount ?? 0}</button>
                    <button className="btn btn--ghost" onClick={onDislike}>👎 {comment.dislikesCount ?? 0}</button>
                    <button className="btn btn--ghost" onClick={toggleOpen}>
                        {open ? 'Hide replies' : `View replies (${repliesTotal})`}
                    </button>
                    <button className="btn btn--ghost" onClick={() => setOpen(true)}>Reply</button>
                    {isOwner && (
                        <button className="btn btn--danger" onClick={onDelete}>Delete</button>
                    )}
                </div>
            </div>

            {/* content */}
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{comment.content}</div>

            {/* reply form */}
            {open && (
                <form onSubmit={onReply} style={{ marginTop: 8 }}>
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Write a reply..."
                        style={{ width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, padding: 8 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn btn--ghost" onClick={() => setDraft('')}>Clear</button>
                        <button type="submit" className="btn">Reply</button>
                    </div>
                </form>
            )}

            {/* children */}
            {open && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {children
                        .filter(c => c && (c.id !== undefined && c.id !== null))
                        .map(child => (
                            <CommentNode
                                key={child.id}
                                postId={postId}
                                comment={child}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                            />
                        ))}

                    {hasMore && (
                        <li>
                            <button
                                className="btn btn--ghost"
                                onClick={() => dispatch(fetchRepliesByComment({
                                    postId,
                                    commentId: comment.id,
                                    page: (repliesBucket?.page || 1) + 1,
                                    limit: repliesBucket?.limit || 20,
                                }))}
                            >
                                Load more replies
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </li>
    );
}
