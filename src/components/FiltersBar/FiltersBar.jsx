import styles from './FiltersBar.module.css';
import CategoryMultiSelect from '../CategoryMultiSelect/CategoryMultiSelect';

export default function FiltersBar({
    sort, order, status, categories, allCategories, dateFrom, dateTo, limit,
    onChange, onApply,
    canFilterStatus = false, // only for admin (or owner in "My posts")
    isLoggedIn = false,
}) {
    // Helper to update draft fields
    const patch = (p) => onChange?.(p);

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

                <label className={styles.field}>
                    <span className={styles.prefix}>From</span>
                    <input
                        className={styles.input}
                        type="date"
                        value={dateFrom || ''}
                        onChange={(e) => patch({ dateFrom: e.target.value })}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.prefix}>To</span>
                    <input
                        className={styles.input}
                        type="date"
                        value={dateTo || ''}
                        onChange={(e) => patch({ dateTo: e.target.value })}
                    />
                </label>

                <select
                    className={styles.select}
                    value={String(limit)}
                    onChange={(e) => patch({ limit: Number(e.target.value), page: 1 })}
                >
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pages.</option>)}
                </select>

                {/* Status filter shown only if allowed (admin / owner in "My posts") */}
                {canFilterStatus && (
                    <select
                        className={styles.select}
                        value={status || 'all'}
                        onChange={(e) => patch({ status: e.target.value })}
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}
            </div>

            {/* Categories: dropdown with search + selected chips */}
            <div className={styles.row}>
                <CategoryMultiSelect
                    value={categories || []}
                    options={allCategories || []}
                    onChange={(ids) => patch({ categories: ids })}
                    placeholder="Categories..."
                />
            </div>

            <div className={styles.row}>
                <button className="btn btn--primary" onClick={onApply}>Apply</button>
            </div>
        </div>
    );
}