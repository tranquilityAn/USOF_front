export default function Pagination({ page, limit, total, onChange }) {
    const pages = Math.max(1, Math.ceil(total / limit));
    const canPrev = page > 1;
    const canNext = page < pages;

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <button className="btn btn--ghost" disabled={!canPrev} onClick={() => onChange(page - 1)}>‹ Previous</button>
            <span style={{ color: '#f5f5f5' }}>{page} / {pages}</span>
            <button className="btn btn--ghost" disabled={!canNext} onClick={() => onChange(page + 1)}>Next ›</button>
        </div>
    );
}
