export function extractApiError(err, fallback = 'Something went wrong') {
    const data = err?.response?.data;
    return (
        data?.error ||
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.map(e => e?.message || e).join(', ') : null) ||
        err?.message ||
        fallback
    );
}
