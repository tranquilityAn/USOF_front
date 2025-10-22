import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../../../features/categories/categoriesSlice';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
    const dispatch = useDispatch();
    const { items, loading, saving, error } = useSelector(s => s.categories);

    const [form, setForm] = useState({ id: null, title: '', description: '' });
    const isEditing = useMemo(() => form.id != null, [form.id]);

    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items || [];
        return (items || []).filter(c => (c.title || '').toLowerCase().includes(q));
    }, [items, query]);

    useEffect(() => {
        if (!items?.length) dispatch(fetchCategories());
    }, [dispatch, items?.length]);

    const resetForm = () => setForm({ id: null, title: '', description: '' });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.title?.trim()) return;

        if (isEditing) {
            await dispatch(updateCategory({
                id: form.id,
                title: form.title.trim(),
                description: form.description?.trim() || null
            }));
        } else {
            await dispatch(createCategory({
                title: form.title.trim(),
                description: form.description?.trim() || null
            }));
        }
        resetForm();
    };

    const onEdit = (cat) => setForm({
        id: cat.id,
        title: cat.title || '',
        description: cat.description || ''
    });

    const onDelete = async (cat) => {
        if (!window.confirm(`Delete category “${cat.title}”? This action cannot be undone.`)) return;
        await dispatch(deleteCategory(cat.id));
        if (form.id === cat.id) resetForm();
    };

    return (
        <div className={styles.wrap}>
            <h1 className={styles.title}>Categories</h1>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>{isEditing ? 'Edit category' : 'Create category'}</h2>
                    <form onSubmit={onSubmit} className={styles.form}>
                        <label className={styles.label}>
                            <span>Title</span>
                            <input
                                className={styles.input}
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Enter title"
                                required
                            />
                        </label>

                        <label className={styles.label}>
                            <span>Description</span>
                            <textarea
                                className={styles.textarea}
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                rows={4}
                            />
                        </label>

                        <div className={styles.actions}>
                            {isEditing && (
                                <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className={styles.primaryBtn} disabled={saving}>
                                {isEditing ? 'Save changes' : 'Create'}
                            </button>
                        </div>

                        {error && <p className={styles.error} role="alert">{error}</p>}
                    </form>
                </section>

                <section className={styles.card}>
                    <div className={styles.listHeader}>
                        <h2 className={styles.cardTitle}>All categories</h2>

                        <div className={styles.searchBox}>
                            <input
                                className={styles.searchInput}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by title…"
                                aria-label="Search categories by title"
                            />
                        </div>

                        {loading && <span className={styles.dim}>Loading…</span>}
                    </div>

                    {(!filtered || filtered.length === 0) ? (
                        <p className={styles.dim}>
                            {query ? 'No matches.' : 'No categories yet.'}
                        </p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th className={styles.thActions}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.title}</td>
                                        <td className={styles.tdDesc}>
                                            {c.description || <span className={styles.dim}>—</span>}
                                        </td>
                                        <td className={styles.tdActions}>
                                            <button
                                                className={styles.linkBtn}
                                                onClick={() => onEdit(c)}
                                                disabled={saving}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => onDelete(c)}
                                                disabled={saving}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </div>
    );
}
