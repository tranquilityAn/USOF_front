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

    // Локальна "чернетка" фільтрів для панелі
    const [draft, setDraft] = useState({
        page: 1,
        limit: 10,
        sort: 'date',
        order: 'desc',
        categories: [],
        dateFrom: '',
        dateTo: '',
        status: undefined, // показуємо/ховаємо в UI за роллю
    });

    // URL -> застосовані фільтри в Redux + синхронізуємо чернетку
    useQuerySync(posts.filters, (parsed) => {
        dispatch(setFilters(parsed));
        setDraft(d => ({ ...d, ...parsed }));
    });

    // початкове завантаження категорій (для чекбоксів)
    useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

    // Робимо запит лише коли ЗАСТОСОВАНІ фільтри змінюються
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
                .filter(id => !authorsById?.[id])   // ще нема в кеші
        )];

        missing.forEach(id => dispatch(fetchUserById(id)));
    }, [posts.items, authorsById, dispatch]);

    // Зміни в панелі — лише у draft
    const onChangeDraft = (patch) => setDraft(d => ({ ...d, ...patch }));

    // "Застосувати" — переносимо draft у Redux (це запустить useEffect вище)
    const onApply = () => {
        // коли застосовуєш фільтри — варто скидати на першу сторінку
        const applied = { ...draft, page: 1 };
        setDraft(applied);
        dispatch(setFilters(applied));
    };

    // Контент
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
                // передаємо ЧЕРНЕТКУ в панель
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
                // керування правами:
                canFilterStatus={isAdmin /* тут true лише для адміна на загальній сторінці */}
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
