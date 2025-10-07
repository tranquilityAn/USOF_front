import { useMemo, useRef, useState, useEffect } from 'react';
import styles from './FiltersBar.module.css';

export default function FiltersBar({
    sort, order, status, categories, allCategories, dateFrom, dateTo, limit,
    onChange, onApply,
    canFilterStatus = false, // only for admin (or owner in "My posts")
    isLoggedIn = false,
}) {
    // Local search in the categories dropdown
    const [catOpen, setCatOpen] = useState(false);
    const [catQuery, setCatQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const onDocClick = (e) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target)) setCatOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // Derived data
    const categoryMap = useMemo(() => {
        const m = new Map();
        (allCategories || []).forEach(c => m.set(c.id, c.name || c.title || String(c.id)));
        return m;
    }, [allCategories]);

    const selectedCats = useMemo(
        () => (categories || []).map(id => ({ id, name: categoryMap.get(id) || String(id) })),
        [categories, categoryMap]
    );

    const filteredCats = useMemo(() => {
        const q = catQuery.trim().toLowerCase();
        const pool = (allCategories || []);
        if (!q) return pool;
        return pool.filter(c => (c.name || c.title || '').toLowerCase().includes(q));
    }, [allCategories, catQuery]);

    // Helper to update draft fields
    const patch = (p) => onChange?.(p);

    const toggleCategory = (id) => {
        const set = new Set(categories || []);
        set.has(id) ? set.delete(id) : set.add(id);
        patch({ categories: [...set] });
    };

    const removeCategory = (id) => {
        const next = (categories || []).filter(x => x !== id);
        patch({ categories: next });
    };

    return (
        <div className={styles.bar}>
            <div className={styles.row}>
                <select
                    className={styles.select}
                    value={sort}
                    onChange={(e) => patch({ sort: e.target.value })}
                >
                    <option value="date">By date</option>
                    <option value="likes">By likes</option>
                </select>

                <select
                    className={styles.select}
                    value={order}
                    onChange={(e) => patch({ order: e.target.value })}
                >
                    <option value="desc">↓ Descending</option>
                    <option value="asc">↑ Ascending</option>
                </select>

                <input
                    className={styles.input}
                    type="date"
                    value={dateFrom || ''}
                    onChange={(e) => patch({ dateFrom: e.target.value })}
                    placeholder="From date"
                />
                <input
                    className={styles.input}
                    type="date"
                    value={dateTo || ''}
                    onChange={(e) => patch({ dateTo: e.target.value })}
                    placeholder="To date"
                />

                <select
                    className={styles.select}
                    value={String(limit)}
                    onChange={(e) => patch({ limit: Number(e.target.value), page: 1 })}
                >
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/стор.</option>)}
                </select>

                {/* Status filter shown only if allowed (admin / owner in "My posts") */}
                {canFilterStatus && (
                    <select
                        className={styles.select}
                        value={status || 'all'}
                        //onChange={(e) => patch({ status: e.target.value === 'all' ? undefined : e.target.value })}
                        onChange={(e) => patch({ status: e.target.value })}
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}
            </div>

            {/* Categories: dropdown with search + selected chips */}
            <div className={styles.row} ref={dropdownRef}>
                <div
                    className={styles.multiSelect}
                    onClick={() => setCatOpen(v => !v)}
                    role="button"
                    tabIndex={0}
                >
                    {selectedCats.length ? (
                        <div className={styles.chips}>
                            {selectedCats.map(c => (
                                <span key={c.id} className={styles.chip} onClick={(e) => { e.stopPropagation(); }}>
                                    {c.name}
                                    <button
                                        className={styles.chipClose}
                                        onClick={(e) => { e.stopPropagation(); removeCategory(c.id); }}
                                        aria-label={`Remove ${c.name}`}
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.placeholder}>Categories...</span>
                    )}
                </div>

                {catOpen && (
                    <div className={styles.dropdown}>
                        <input
                            className={styles.search}
                            placeholder="Search categories..."
                            value={catQuery}
                            onChange={(e) => setCatQuery(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className={styles.list}>
                            {filteredCats.map(c => {
                                const checked = categories?.includes(c.id);
                                const name = c.name || c.title || String(c.id);
                                return (
                                    <label key={c.id} className={styles.option} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleCategory(c.id)}
                                        />
                                        <span>{name}</span>
                                    </label>
                                );
                            })}
                            {!filteredCats.length && (
                                <div className={styles.empty}>Nothing found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.row}>
                <button className={styles.button} onClick={onApply}>Apply</button>
            </div>
        </div>
    );
}