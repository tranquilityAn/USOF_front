import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice';
import posts from '../features/posts/postsSlice';
import categories from '../features/categories/categoriesSlice';
import authors from '../features/authors/authorsSlice';
import comments from '../features/comments/commentsSlice';
import favorites from '../features/favorites/favoritesSlice';

export const store = configureStore({
    reducer: { auth, posts, categories, authors, comments, favorites },
    devTools: process.env.NODE_ENV !== 'production',
});
