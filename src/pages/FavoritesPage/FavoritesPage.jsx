import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../../features/favorites/favoritesSlice';
import PostCard from '../../components/PostCard/PostCard';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector(s => s.auth);
    const { items, loading, error } = useSelector(s => s.favorites);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        dispatch(fetchFavorites());
    }, [dispatch, token, navigate]);

    if (!token) return null;
    if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
    if (error) return <div style={{ padding: 16, color: 'tomato' }}>Error: {error}</div>;

    return (
        <div style={{ maxWidth: 980, margin: '24px auto', padding: 16, display: 'grid', gap: 16 }}>
            <h1 style={{ margin: 0 }}>My favorites</h1>
            {items.length === 0 && <p>No favorites yet.</p>}
            {items.map(p => (<PostCard key={p.id} post={p} />))}
        </div>
    );
}
