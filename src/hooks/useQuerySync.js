import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useQuerySync = (state, onParsed) => {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const p = Object.fromEntries(searchParams.entries());
        const parsed = {
            page: Number(p.page || 1),
            limit: Number(p.limit || 10),
            sort: p.sort || 'date',
            order: p.order || 'desc',
            categories: p.categories ? p.categories.split(',').filter(Boolean).map(Number) : [],
            dateFrom: p.dateFrom || '',
            dateTo: p.dateTo || '',
            status: p.status || 'active',
        };
        onParsed(parsed);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const p = new URLSearchParams();
        if (state.page) p.set('page', String(state.page));
        if (state.limit) p.set('limit', String(state.limit));
        if (state.sort) p.set('sort', state.sort);
        if (state.order) p.set('order', state.order);
        if (state.categories?.length) p.set('categories', state.categories.join(','));
        if (state.dateFrom) p.set('dateFrom', state.dateFrom);
        if (state.dateTo) p.set('dateTo', state.dateTo);
        if (state.status) p.set('status', state.status);
        setSearchParams(p);
    }, [state, setSearchParams]);
};
