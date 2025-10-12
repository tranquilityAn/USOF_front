import { useMemo, useRef, useState, useEffect } from 'react';
import styles from './CategoryMultiSelect.module.css';

export default function CategoryMultiSelect({
    value = [],                         // Array<number>
    options = [],                       // Array<{id:number, name?:string, title?:string}>
    onChange,                           // (ids:number[]) => void
    placeholder = 'Categories...',
    disabled = false,
    className = '',
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const onDocClick = (e) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const categoryMap = useMemo(() => {
        const m = new Map();
        (options || []).forEach(c => m.set(c.id, c.name || c.title || String(c.id)));
        return m;
    }, [options]);

    const selected = useMemo(
        () => (value || []).map(id => ({ id, name: categoryMap.get(id) || String(id) })),
        [value, categoryMap]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options || [];
        return (options || []).filter(c => (c.name || c.title || '').toLowerCase().includes(q));
    }, [options, query]);

    const setIds = (ids) => onChange?.(ids);

    const toggle = (id) => {
        const set = new Set(value || []);
        set.has(id) ? set.delete(id) : set.add(id);
        setIds([...set]);
    };

    const remove = (id) => setIds((value || []).filter(x => x !== id));

    const handleKey = (e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(v => !v);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className={`${styles.wrap} ${className}`} ref={dropdownRef} aria-disabled={disabled}>
            <div
                className={styles.multiSelect}
                role="button"
                tabIndex={0}
                onClick={() => !disabled && setOpen(v => !v)}
                onKeyDown={handleKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selected.length ? (
                    <div className={styles.chips}>
                        {selected.map(c => (
                            <span key={c.id} className={styles.chip} onClick={(e) => { e.stopPropagation(); }}>
                                {c.name}
                                <button
                                    className={styles.chipClose}
                                    onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                                    aria-label={`Remove ${c.name}`}
                                >×</button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}
            </div>

            {open && !disabled && (
                <div className={styles.dropdown}>
                    <input
                        className={styles.search}
                        placeholder="Search categories..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className={styles.list} role="listbox">
                        {filtered.map(c => {
                            const checked = value?.includes(c.id);
                            const name = c.name || c.title || String(c.id);
                            return (
                                <label key={c.id} className={styles.option} onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggle(c.id)}
                                    />
                                    <span>{name}</span>
                                </label>
                            );
                        })}
                        {!filtered.length && (
                            <div className={styles.empty}>Nothing found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
