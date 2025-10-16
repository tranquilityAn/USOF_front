//import { useEffect, useMemo } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//import { useParams, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { fetchUserById, fetchUserPostsCount } from '../../features/authors/authorsSlice';
import UserLayout from '../../components/User/UserLayout';
import UserHeader from '../../components/User/UserHeader';
import UserStats from '../../components/User/UserStats';
//import UserActions from '../../components/User/UserActions';
import UserPostsPanel from '../../components/User/UserPostsPanel';


export default function ProfilePage() {
    const { id } = useParams();
    const userId = Number(id);
    const dispatch = useDispatch();
    const authors = useSelector(s => s.authors);
    const user = authors.byId?.[userId];
    const loading = authors.loading?.[userId];
    const error = authors.error?.[userId];

    useEffect(() => {
        if (!user && !loading) dispatch(fetchUserById(userId));
    }, [dispatch, userId, user, loading]);

    useEffect(() => {
        dispatch(fetchUserPostsCount(userId));
    }, [dispatch, userId]);

    if (loading && !user) return <div className="container"><div className="card">Loading user…</div></div>;
    if (error) return <div className="container"><div className="card" style={{ borderColor: 'var(--danger)' }}>Failed to load user</div></div>;
    if (!user) return <div className="container"><div className="card">User not found.</div></div>;

    const left = (
        <>
            <UserHeader user={user} />
            <UserStats rating={user?.rating ?? 0} postsCount={user?.postsCount ?? 0} />
        </>
    );


    const right = <UserPostsPanel userId={userId} />;


    return <UserLayout left={left} right={right} />;
}