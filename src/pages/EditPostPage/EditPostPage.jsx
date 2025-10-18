import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { fetchPostById, updatePost } from '../../features/posts/postsSlice';
import CategoryMultiSelect from '../../components/CategoryMultiSelect/CategoryMultiSelect';

export default function EditPostPage() {
    const { id } = useParams();
    const postId = Number(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items: categories } = useSelector(s => s.categories);
    const { current: post, updateLoading, updateError } = useSelector(s => s.posts);
    const { user, token } = useSelector(s => s.auth);
    const isAdmin = user?.role === 'admin';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selected, setSelected] = useState([]); // number[]
    const [status, setStatus] = useState('active'); // 'active' | 'inactive'

    // preload
    useEffect(() => {
        if (!categories?.length) dispatch(fetchCategories());
    }, [categories?.length, dispatch]);

    useEffect(() => {
        if (!Number.isFinite(postId)) return;
        dispatch(fetchPostById(postId));
    }, [postId, dispatch]);

    useEffect(() => {
        if (!post || post.id !== postId) return;
        setTitle(post.title ?? '');
        setContent(post.content ?? '');
        const catIds = (post.categories || []).map(c => c.id);
        setSelected(catIds);
        if (post.status) setStatus(post.status); // наповнюємо статус
    }, [post, postId]);

    useEffect(() => {
        if (!token || !post) return;
        const isOwner = post?.author?.id === user?.id;
        if (!isOwner && !isAdmin) {
            navigate(`/post/${postId}`);
        }
    }, [token, user?.id, post, isAdmin, navigate, postId]);

    const isOwner = post?.author?.id === user?.id;
    const canSubmit = isOwner
        ? (title.trim() && content.trim() && selected.length)
        : (isAdmin && selected.length && (status === 'active' || status === 'inactive'));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const payload = isOwner
            ? { id: postId, title, content, categories: selected }
            : { id: postId, categories: selected, status };
        const resAction = await dispatch(updatePost(payload));
        if (updatePost.fulfilled.match(resAction)) {
            navigate(`/post/${postId}`);
        }
    };

    if (!token) return null;

    return (
        <div style={{ maxWidth: 980, margin: '24px auto', padding: 16, display: 'grid', gap: 16 }}>
            <h1>Edit post</h1>

            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
                <label>
                    <div style={{ marginBottom: 6 }}>Title</div>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        readOnly={!isOwner}
                        disabled={!isOwner}
                        placeholder="Post title"
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #2c2c2c', background: '#111', color: '#f5f5f5' }}
                    />
                </label>

                <label>
                    <div style={{ marginBottom: 6 }}>Content</div>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        readOnly={!isOwner}
                        disabled={!isOwner}
                        placeholder="Write your content…"
                        rows={12}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #2c2c2c', background: '#111', color: '#f5f5f5' }}
                    />
                </label>

                <div>
                    <div style={{ marginBottom: 6 }}>Categories</div>
                    <CategoryMultiSelect
                        options={categories || []}
                        value={selected}
                        onChange={setSelected}
                        disabled={!categories?.length}
                    />
                </div>

                {/* Status toggle — only for admins */}
                {isAdmin && !isOwner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>Status:</span>
                        <button
                            type="button"
                            onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                            style={{
                                position: 'relative',
                                width: 48,
                                height: 26,
                                borderRadius: 20,
                                border: '1px solid #333',
                                background: status === 'active' ? '#4caf50' : '#777',
                                transition: 'background 0.25s',
                                cursor: 'pointer',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 2,
                                    left: status === 'active' ? 24 : 2,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: '#fff',
                                    transition: 'left 0.25s',
                                }}
                            />
                        </button>
                        <span style={{ color: status === 'active' ? '#4caf50' : '#aaa' }}>
                            {status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                )}

                {updateError && <div style={{ color: 'tomato' }}>Error: {updateError}</div>}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" disabled={!canSubmit || updateLoading}
                        className='btn btn--primary'
                        style={{ cursor: canSubmit && !updateLoading ? 'pointer' : 'not-allowed' }}>
                        {updateLoading ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" onClick={() => navigate(`/post/${postId}`)} className='btn btn--ghost'>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
