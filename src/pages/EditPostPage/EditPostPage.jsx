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

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selected, setSelected] = useState([]); // number[]

    // preload
    useEffect(() => {
        if (!categories?.length) dispatch(fetchCategories());
    }, [categories?.length, dispatch]);

    useEffect(() => {
        if (!Number.isFinite(postId)) return;
        dispatch(fetchPostById(postId));
    }, [postId, dispatch]);

    // fill inputs
    useEffect(() => {
        if (!post || post.id !== postId) return;
        setTitle(post.title ?? '');
        setContent(post.content ?? '');
        const catIds = (post.categories || []).map(c => c.id);
        setSelected(catIds);
    }, [post, postId]);

    // only author cat edit
    useEffect(() => {
        if (!token || !post) return;
        const isOwner = post?.author?.id === user?.id;
        if (post && token && isOwner === false) {
            navigate(`/post/${postId}`);
        }
    }, [token, user?.id, post, navigate, postId]);

    const canSubmit = title.trim() && content.trim() && selected.length;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const resAction = await dispatch(updatePost({ id: postId, title, content, categories: selected }));
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
                        placeholder="Post title"
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #2c2c2c', background: '#111', color: '#f5f5f5' }}
                    />
                </label>

                <label>
                    <div style={{ marginBottom: 6 }}>Content</div>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
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
