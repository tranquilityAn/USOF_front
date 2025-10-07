import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import AppRouter from './routes/AppRouter';
import { fetchMe } from './features/auth/authSlice';

export default function App() {
    const dispatch = useDispatch();
    const token = useSelector((s) => s.auth.token);

    useEffect(() => {
        if (token) dispatch(fetchMe());
    }, [token, dispatch]);

    return (
        <BrowserRouter>
            <MainLayout>
                <AppRouter />
            </MainLayout>
        </BrowserRouter>
    );
}
