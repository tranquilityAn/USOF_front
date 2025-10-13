import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice';
import posts from '../features/posts/postsSlice';
import categories from '../features/categories/categoriesSlice';
import authors from '../features/authors/authorsSlice';
import comments from '../features/comments/commentsSlice';
import favorites from '../features/favorites/favoritesSlice';
import users from '../features/users/usersSlice';

export const store = configureStore({
    reducer: { auth, posts, categories, authors, comments, favorites, users },
    devTools: process.env.NODE_ENV !== 'production',
});
