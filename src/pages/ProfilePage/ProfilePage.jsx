import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById } from '../../features/authors/authorsSlice';
import UserLayout from '../../components/User/UserLayout';
import UserHeader from '../../components/User/UserHeader';
import UserStats from '../../components/User/UserStats';
import UserActions from '../../components/User/UserActions';
import UserPostsPanel from '../../components/User/UserPostsPanel';


export default function ProfilePage() {
    const { id } = useParams();
    const userId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const authors = useSelector(s => s.authors);
    const me = useSelector(s => s.auth?.user);


    const user = authors.byId?.[userId];
    const loading = authors.loading?.[userId];
    const error = authors.error?.[userId];


    useEffect(() => {
        if (!user && !loading) dispatch(fetchUserById(userId));
    }, [dispatch, userId, user, loading]);


    const canEdit = useMemo(() => !!me && me.id === userId, [me, userId]);


    if (loading && !user) return <div className="container"><div className="card">Loading user…</div></div>;
    if (error) return <div className="container"><div className="card" style={{ borderColor: 'var(--danger)' }}>Failed to load user</div></div>;
    if (!user) return <div className="container"><div className="card">User not found.</div></div>;


    const left = (
        <>
            <UserHeader user={user} />
            <UserStats rating={user.rating ?? 0} postsCount={undefined} />
            <UserActions canEdit={canEdit} onEdit={() => navigate('/settings/profile')} />
        </>
    );


    const right = <UserPostsPanel userId={userId} />;


    return <UserLayout left={left} right={right} />;
}