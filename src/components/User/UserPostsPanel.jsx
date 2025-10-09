import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../PostCard/PostCard';
import { fetchPosts, setPage } from '../../features/posts/postsSlice';


export default function UserPostsPanel({ userId }) {
    const dispatch = useDispatch();
    const { items = [], page, limit, total, loading } = useSelector(s => s.posts);


    useEffect(() => {
        dispatch(fetchPosts({ page: 1, limit: 10, sort: 'date', order: 'desc', authorId: userId }));
    }, [dispatch, userId]);


    const list = useMemo(() => items.filter(p => p?.author?.id === Number(userId)), [items, userId]);


    return (
        <div className="card card-lg">
            <h2 className="h2">Posts</h2>
            <hr className="hr" />
            {loading && <p className="text-dim">Loading posts…</p>}
            {!loading && list.length === 0 && <p className="text-dim">No posts yet.</p>}


            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {list.map(post => <PostCard key={post.id} post={post} />)}
            </div>


            {total > limit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn" onClick={() => dispatch(setPage(Math.max(1, page - 1)))} disabled={page <= 1}>Prev</button>
                    <span className="text-dim">Page {page}</span>
                    <button className="btn" onClick={() => dispatch(setPage(page + 1))} disabled={items.length < limit}>Next</button>
                </div>
            )}
        </div>
    );
}