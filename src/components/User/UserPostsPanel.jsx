import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../PostCard/PostCard';
import { fetchPosts, setPage } from '../../features/posts/postsSlice';

export default function UserPostsPanel({ userId }) {
    const dispatch = useDispatch();
    const { items = [], page = 1, limit = 10, total = 0, loading } = useSelector(s => s.posts);

    const [sort, setSort] = useState('date');   // 'date' | 'likes'
    const [order, setOrder] = useState('desc'); // 'desc' | 'asc'

    useEffect(() => {
        dispatch(fetchPosts({ page, limit, sort, order, authorId: userId }));
    }, [dispatch, userId, page, limit, sort, order]);

    const list = useMemo(() => items || [], [items]);

    const onPrev = () => {
        const nextPage = Math.max(1, page - 1);
        dispatch(setPage(nextPage));
    };

    const onNext = () => {
        dispatch(setPage(page + 1));
    };

    const onChangeSort = (value) => {
        setSort(value);
        dispatch(setPage(1));
    };

    const onChangeOrder = (value) => {
        setOrder(value);
        dispatch(setPage(1));
    };

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label className="text-dim">Sort:</label>
                <select className="input" value={sort} onChange={(e) => onChangeSort(e.target.value)}>
                    <option value="date">By date</option>
                    <option value="likes">By likes</option>
                </select>

                <select className="input" value={order} onChange={(e) => onChangeOrder(e.target.value)}>
                    <option value="desc">↓ Descending</option>
                    <option value="asc">↑ Ascending</option>
                </select>
            </div>

            {loading && <div className="text-dim">Loading…</div>}
            {!loading && !list.length && <div className="text-dim">No posts yet.</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {list.map(post => <PostCard key={post.id} post={post} />)}
            </div>

            {total > limit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                    <button className="btn" onClick={onPrev} disabled={page <= 1}>Prev</button>
                    <span className="text-dim">Page {page}</span>
                    <button className="btn" onClick={onNext} disabled={items.length < limit}>Next</button>
                </div>
            )}
        </div>
    );
}