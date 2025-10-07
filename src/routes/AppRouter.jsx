import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import PostPage from '../pages/PostPage/PostPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    );
}
