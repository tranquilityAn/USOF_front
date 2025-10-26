import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, setFilters, setPage } from '../../features/posts/postsSlice';
import { fetchUserById } from '../../features/authors/authorsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import FiltersBar from '../../components/FiltersBar/FiltersBar';
import PostCard from '../../components/PostCard/PostCard';
import Pagination from '../../components/Pagination/Pagination';
import { useQuerySync } from '../../hooks/useQuerySync';

export default function HomePage() {
    const dispatch = useDispatch();
    const posts = useSelector(s => s.posts);
    const filters = useSelector(s => s.posts.filters);
    const cats = useSelector(s => s.categories);
    const auth = useSelector(s => s.auth);
    const isAdmin = auth?.user?.role === 'admin';
    const isLoggedIn = Boolean(auth?.user);
    const authorsById = useSelector(s => s.authors.byId);
    
    const [draft, setDraft] = useState({
        page: 1,
        limit: 10,
        sort: 'date',
        order: 'desc',
        categories: [],
        dateFrom: '',
        dateTo: '',
        status: undefined, 
    });
    
    useQuerySync(posts.filters, (parsed) => {
        dispatch(setFilters(parsed));
        setDraft(d => ({ ...d, ...parsed }));
    });

    useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

    useEffect(() => {
        const f = filters;
        const params = {
            page: f.page,
            limit: f.limit,
            sort: f.sort,
            order: f.order,
        };
        if (f.categories?.length) params.categories = f.categories.join(',');
        if (f.dateFrom) params.dateFrom = f.dateFrom;
        if (f.dateTo) params.dateTo = f.dateTo;
        if (isAdmin && f.status) params.status = f.status;
        dispatch(fetchPosts(params));
    }, [dispatch, filters, isAdmin]);
    useEffect(() => {
        if (!posts.items?.length) return;

        const missing = [...new Set(
            posts.items
                .map(p => p.authorId)
                .filter(Boolean)
                .filter(id => !authorsById?.[id])
        )];

        missing.forEach(id => dispatch(fetchUserById(id)));
    }, [posts.items, authorsById, dispatch]);

    const onChangeDraft = (patch) => setDraft(d => ({ ...d, ...patch }));

    const onApply = () => {
        const applied = { ...draft, page: 1 };
        setDraft(applied);
        dispatch(setFilters(applied));
    };

    const content = useMemo(() => {
        if (posts.loading) return <div style={{ color: '#aaa' }}>Loading……</div>;
        if (posts.error) return <div style={{ color: '#ff6b6b' }}>{posts.error}</div>;
        if (!posts.items.length) return <div style={{ color: '#aaa' }}>Nothing found</div>;
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                {posts.items.map(p => <PostCard key={p.id} post={p} />)}
            </div>
        );
    }, [posts]);

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <FiltersBar
                sort={draft.sort}
                order={draft.order}
                status={draft.status}
                limit={draft.limit}
                categories={draft.categories}
                allCategories={cats.items}
                dateFrom={draft.dateFrom}
                dateTo={draft.dateTo}
                onChange={onChangeDraft}
                onApply={onApply}
                canFilterStatus={isAdmin}
                isLoggedIn={isLoggedIn}
            />

            {content}

            <div style={{ marginTop: 12 }}>
                <Pagination
                    page={posts.filters.page}
                    limit={posts.filters.limit}
                    total={posts.total}
                    onChange={(p) => dispatch(setPage(p))}
                />
            </div>
        </div>
    );
}
