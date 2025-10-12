import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import PostPage from '../pages/PostPage/PostPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage';
import CreatePostPage from '../pages/CreatePostPage/CreatePostPage';
import PrivateRoute from './PrivateRoute'

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/post/new" element={<PrivateRoute><CreatePostPage /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    );
}
