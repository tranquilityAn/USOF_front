import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import PostPage from '../pages/PostPage/PostPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage';
import CreatePostPage from '../pages/CreatePostPage/CreatePostPage';
import EditPostPage from '../pages/EditPostPage/EditPostPage';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import CreateUserPage from '../pages/Admin/CreateUserPage/CreateUserPage';
import VerifyEmailPage from '../pages/Auth/VerifyEmailPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import CategoriesPage from '../pages/Admin/CategoriesPage/CategoriesPage';
import UsersPage from '../pages/Admin/UserPage/UserPage';
import UserDetailsPage from '../pages/Admin/UserDetailsPage/UserDetailsPage';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/post/new" element={<PrivateRoute><CreatePostPage /></PrivateRoute>} />
            <Route path="/post/:id/edit" element={<PrivateRoute><EditPostPage /></PrivateRoute>} />
            <Route path="/admin/users/new" element={<PrivateRoute><AdminRoute><CreateUserPage /></AdminRoute></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/settings/profile" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />
            <Route path="/admin/categories" element={<PrivateRoute><AdminRoute><CategoriesPage /></AdminRoute></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute><AdminRoute><UsersPage /></AdminRoute></PrivateRoute>}/>
            <Route path="/admin/users/:id" element={<PrivateRoute><AdminRoute><UserDetailsPage /></AdminRoute></PrivateRoute>}/></Routes>
    );
}
