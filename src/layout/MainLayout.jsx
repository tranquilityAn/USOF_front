import Header from './Header/Header';

export default function MainLayout({ children }) {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
                {children}
            </main>
        </>
    );
}
