export default function UserLayout({ left, right }) {
    return (
        <div className="container">
            <div className="grid-2">
                <aside style={{ display: 'grid', gap: 12 }}>{left}</aside>
                <section style={{ display: 'grid', gap: 12 }}>{right}</section>
            </div>
        </div>
    );
}