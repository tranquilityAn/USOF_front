import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addComment,
    deleteComment,
    toggleCommentReaction,
    fetchRepliesByComment,
    toggleCommentStatus,
    lockComment,
    unlockComment,
} from '../../features/comments/commentsSlice';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';

export default function CommentNode({ postId, postAuthorId, comment, depth = 0, maxDepth = 50 }) {
    const dispatch = useDispatch();
    const { user: me } = useSelector((s) => s.auth);
    const isAdmin = me?.role === 'admin';
    const isMine = !!(me?.id && (comment.author?.id === me.id || comment.userId === me.id || comment.authorId === me.id));
    const canManage = isMine || isAdmin;
    const parentIdNorm = (comment.parentId !== undefined ? comment.parentId : comment.parent_id);
    const isTopLevel = parentIdNorm == null; // true тільки якщо справді немає батька
    const canPin = isTopLevel && (!!me?.id && me.id === postAuthorId);

    const repliesBucket = useSelector((s) => s.comments.repliesByComment[comment.id]);

    const myCommentReaction = useSelector((s) => s.comments?.myReactionByComment?.[comment.id] ?? comment.myReaction ?? null);
    const likeActive = myCommentReaction === 'like';
    const dislikeActive = myCommentReaction === 'dislike';

    const [repliesOpen, setRepliesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [replyDraftOpen, setReplyDraftOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const menuRef = useRef(null);

    const repliesTotal = repliesBucket?.total ?? comment.replyCount ?? 0;
    const children = repliesBucket?.items || [];
    const hasMore = (repliesBucket?.items?.length || 0) < (repliesBucket?.total || 0);

    const liveStatus = useSelector(s => {
        const fromArr = (arr) => {
            const it = arr?.find(c => c.id === comment.id);
            if (!it) return undefined;
            if (typeof it.status === 'string') return it.status;
            if (typeof it.isActive === 'boolean') return it.isActive ? 'active' : 'inactive';
            return undefined;
        };

        const top = fromArr(s.comments.byPost?.[postId]);
        if (top) return top;
        for (const k in (s.comments.repliesByComment || {})) {
            const bucket = s.comments.repliesByComment[k]?.items;
            const v = fromArr(bucket);
            if (v) return v;
        }
        if (typeof comment.status === 'string') return comment.status;
        if (typeof comment.isActive === 'boolean') return comment.isActive ? 'active' : 'inactive';
        return undefined;
    });

    const liveLocked = useSelector(s => {
        const fromArr = (arr) => {
            const it = arr?.find(c => c.id === comment.id);
            return it?.locked;
        };
        const top = fromArr(s.comments.byPost?.[postId]);
        if (typeof top === 'boolean') return top;
        for (const k in (s.comments.repliesByComment || {})) {
            const v = fromArr(s.comments.repliesByComment[k]?.items);
            if (typeof v === 'boolean') return v;
        }
        return !!comment.locked;
    });

    // close menu on outside click
    useEffect(() => {
        const onDocClick = (e) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    // load replies once when opening
    useEffect(() => {
        if (repliesOpen && !repliesBucket && repliesTotal > 0) {
            dispatch(
                fetchRepliesByComment({ postId, commentId: comment.id, page: 1, limit: 20 })
            );
        }
    }, [repliesOpen, repliesBucket, repliesTotal, dispatch, postId, comment.id]);

    const onLike = () => dispatch(toggleCommentReaction({ commentId: comment.id, type: 'like' }));
    const onDislike = () => dispatch(toggleCommentReaction({ commentId: comment.id, type: 'dislike' }));

    const onReply = () => {
        setReplyDraftOpen(true);
    };

    const onCancelReply = () => {
        setReplyText('');
        setReplyDraftOpen(false);
    };

    const onSubmitReply = async (e) => {
        e?.preventDefault?.();
        const content = replyText.trim();
        if (!content) return;
        try {
            await dispatch(addComment({ postId, content, parentId: comment.id })).unwrap();
            setReplyText('');
            setReplyDraftOpen(false);
            // ensure replies are visible after posting
            if (!repliesOpen) setRepliesOpen(true);
        } catch (err) {
            // optional: show toast
            console.error('Failed to add reply', err);
        }
    };

    const onDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await dispatch(deleteComment(comment.id)).unwrap();
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const onToggleStatus = async () => {
        const curr = (liveStatus === 'active' || liveStatus === 'inactive') ? liveStatus : 'active';
        const next = curr === 'active' ? 'inactive' : 'active';
        try {
            await dispatch(toggleCommentStatus({ commentId: comment.id, nextStatus: next })).unwrap();
            setMenuOpen(false);
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const onTogglePin = async () => {
        if (!canPin) return;
        try {
            if (liveLocked) {
                await dispatch(unlockComment({ postId, commentId: comment.id })).unwrap();
            } else {
                await dispatch(lockComment({ postId, commentId: comment.id })).unwrap();
            }
            setMenuOpen(false);
        } catch (err) {
            console.error('Failed to toggle pin', err);
        }
    };

    // util: format date/time from createdAt/updatedAt
    const dt = new Date(comment.createdAt || comment.updatedAt || Date.now());
    const dateStr = isNaN(dt.getTime()) ? '' : dt.toLocaleDateString();
    const timeStr = isNaN(dt.getTime()) ? '' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <li style={{
            opacity: liveStatus === 'inactive' ? 0.6 : 1,
            pointerEvents: 'auto',
            marginLeft: depth ? 16 : 0,
            listStyle: 'none',
        }}>
            {/* comment card */}
            <div
                style={{
                    padding: 12,
                    border: '1px solid #222',
                    borderRadius: 12,
                    background: '#151515',
                }}
            >
                {/* HEADER: author • date • time  + optional owner menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>
                        {comment.author?.name || comment.author?.login || comment.author?.fullName || comment.author?.username || comment.author?.email || 'user'}
                    </div>

                    {/* Inactive */}
                    {liveStatus === 'inactive' && (
                        <span style={{ fontSize: 12, padding: '2px 6px', border: '1px solid #444', borderRadius: 6, textTransform: 'uppercase' }}>
                            Inactive
                        </span>
                    )}
                    {isTopLevel && liveLocked && (
                        <span style={{ fontSize: 12, padding: '2px 6px', border: '1px solid #444', borderRadius: 6, textTransform: 'uppercase' }}>
                            Pinned
                        </span>
                    )}

                    <div style={{ opacity: .8 }}>•</div>
                    <div style={{ fontSize: 13, opacity: .9 }}>{dateStr} {timeStr && <>• {timeStr}</>}</div>

                    {(canManage || canPin) && (
                        <div ref={menuRef} style={{ position: 'relative' }}>
                            <button
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen(v => !v)}
                                title="Options"
                                style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid #2c2c2c', background: '#111', color: '#f5f5f5', cursor: 'pointer',
                                }}
                            >
                                {'\u22EE'}
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    style={{
                                        position: 'absolute', right: 0, marginTop: 6, minWidth: 160,
                                        background: '#111', border: '1px solid #2c2c2c', borderRadius: 10,
                                        boxShadow: '0 6px 26px rgba(0,0,0,.35)', overflow: 'hidden', zIndex: 10,
                                    }}
                                >
                                    {canPin && (
                                        <button
                                            role="menuitem"
                                            onClick={() => { setMenuOpen(false); onTogglePin(); }}
                                            className="btn btn--ghost"
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px' }}
                                        >
                                            {liveLocked ? 'Unpin comment' : 'Pin comment'}
                                        </button>
                                    )}
                                    {/* toggle status — for owner and admin */}
                                    {canManage && (
                                        <button
                                            role="menuitem"
                                            onClick={() => { setMenuOpen(false); onToggleStatus(); }}
                                            className="btn btn--ghost"
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px' }}
                                        >
                                            {liveStatus === 'inactive' ? 'Activate' : 'Inactivate'}
                                        </button>
                                    )}

                                    {canManage && (
                                        <button
                                            role="menuitem"
                                            onClick={() => { setMenuOpen(false); onDelete(); }}
                                            className="btn btn--ghost"
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* BODY: comment text */}
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, marginTop: 8 }}>
                    {comment.content}
                </div>

                {/* FOOTER: reactions (left) + Reply (right) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                        aria-pressed={likeActive}
                        onClick={onLike}
                        title={likeActive ? 'Remove like' : 'Like'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #3a3a3a' }}
                    >
                        {likeActive ? <AiFillLike /> : <AiOutlineLike />} {comment.likesCount ?? 0}
                    </button>

                    <button
                        aria-pressed={dislikeActive}
                        onClick={onDislike}
                        title={dislikeActive ? 'Remove dislike' : 'Dislike'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px solid #3a3a3a' }}
                    >
                        {dislikeActive ? <AiFillDislike /> : <AiOutlineDislike />} {comment.dislikesCount ?? 0}
                    </button>

                    <div style={{ marginLeft: 'auto' }}>
                        {depth + 1 < maxDepth && (
                            <button onClick={onReply} className="btn btn--ghost" style={{ padding: '6px 10px' }}>Reply</button>
                        )}
                    </div>
                </div>

                {/* Reply editor (appears only after clicking Reply) */}
                {replyDraftOpen && (
                    <form onSubmit={onSubmitReply} style={{ marginTop: 10 }}>
                        <textarea
                            rows={3}
                            placeholder="Write a reply…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') onCancelReply();
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmitReply(e);
                            }}
                            style={{
                                width: '100%', background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #2c2c2c',
                                padding: 10, borderRadius: 8, resize: 'vertical',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" onClick={onCancelReply} className="btn btn--secondary">Cancel</button>
                            <button type="submit" disabled={!replyText.trim()} className="btn btn--primary">Comment</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Replies toggle & list */}
            {repliesTotal > 0 && (
                <div style={{ marginTop: 10 }}>
                    <button
                        onClick={() => setRepliesOpen((v) => !v)}
                        className="btn btn--ghost"
                        style={{ padding: '6px 10px' }}
                    >
                        {repliesOpen ? 'Hide replies' : `View replies (${repliesTotal})`}
                    </button>
                </div>
            )}

            {repliesOpen && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 12px', display: 'grid', gap: 10 }}>
                    {children.map((child) => (
                        <CommentNode
                            key={child.id}
                            postId={postId}
                            postAuthorId={postAuthorId}
                            comment={child}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}

                    {hasMore && (
                        <li>
                            <button
                                className="btn btn--ghost"
                                style={{ padding: '6px 10px' }}
                                onClick={() =>
                                    dispatch(
                                        fetchRepliesByComment({
                                            postId,
                                            commentId: comment.id,
                                            page: (repliesBucket?.page || 1) + 1,
                                            limit: repliesBucket?.limit || 20,
                                        })
                                    )
                                }
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
