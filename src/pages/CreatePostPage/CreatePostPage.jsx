import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { createPost, clearCreation } from '../../features/posts/postsSlice';
import CategoryMultiSelect from '../../components/CategoryMultiSelect/CategoryMultiSelect';

export default function CreatePostPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: categories, loading: catsLoading } = useSelector(s => s.categories);
    const { createLoading, createError, lastCreatedId } = useSelector(s => s.posts);
    const { token } = useSelector(s => s.auth);


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selected, setSelected] = useState([]);


    useEffect(() => { if (!categories?.length) dispatch(fetchCategories()); }, [dispatch, categories?.length]);
    useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);
    useEffect(() => { dispatch(clearCreation()); }, [dispatch]);
    useEffect(() => { if (lastCreatedId) navigate(`/post/${lastCreatedId}`); }, [lastCreatedId, navigate]);


    const canSubmit = title.trim() && content.trim() && selected.length > 0 && !createLoading;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        await dispatch(createPost({ title: title.trim(), content: content.trim(), categories: selected }));
    };

    return (
        <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
            <h1 style={{ margin: '0 0 16px' }}>Create post</h1>


            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                    <span>Categories</span>
                    {catsLoading && <div>Loading categories…</div>}
                    {!catsLoading && (!categories?.length ? (
                        <div style={{ color: 'tomato' }}>Nothing found</div>
                    ) : (
                        <CategoryMultiSelect
                            value={selected}
                            options={categories}
                            onChange={setSelected}
                            placeholder="Select categories..."
                        />
                    ))}
                </div>

                <label style={{ display: 'grid', gap: 8 }}>
                    <span>Title</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        style={{ padding: '10px 12px', background: '#111', color: '#f5f5f5', border: '1px solid #2c2c2c', borderRadius: 8 }}
                    />
                </label>


                <label style={{ display: 'grid', gap: 8 }}>
                    <span>Content</span>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Body text..."
                        rows={12}
                        style={{ padding: 12, background: '#111', color: '#f5f5f5', border: '1px solid #2c2c2c', borderRadius: 8, resize: 'vertical' }}
                    />
                </label>

                {createError && (
                    <div style={{ color: 'tomato' }}>Error: {createError}</div>
                )}


                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" disabled={!canSubmit} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #2c2c2c', background: canSubmit ? '#1f6feb' : '#333', color: '#fff', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                        {createLoading ? 'Publishing…' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #2c2c2c', background: '#111', color: '#f5f5f5' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
}