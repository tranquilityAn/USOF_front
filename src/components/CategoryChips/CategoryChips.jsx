import { Link } from 'react-router-dom';
import styles from './CategoryChips.module.css';
import { useSelector } from 'react-redux';

export default function CategoryChips({ categories, categoryIds, size = 'md' }) {
    const allCats = useSelector(s => s.categories.items);

    let list = Array.isArray(categories) ? categories : [];
   
    if (list.length && typeof list[0] === 'number' && allCats?.length) {
        const map = new Map(allCats.map(c => [c.id, c]));
        list = list.map(id => map.get(id)).filter(Boolean);
    }
    if ((!list || !list.length) && Array.isArray(categoryIds) && allCats?.length) {
        const map = new Map(allCats.map(c => [c.id, c]));
        list = categoryIds.map(id => map.get(id)).filter(Boolean);
    }
    if (!list || !list.length) return null;

    return (
        <div className={styles.wrap}>
            {list.map(c => (
                <Link
                    key={c.id}
                    to={`/?categories=${c.id}`}
                    className={`${styles.chip} ${size === 'sm' ? styles.sm : ''}`}
                    title={`Показати пости у категорії “${c.title}”`}
                >
                    {c.title}
                </Link>
            ))}
        </div>
    );
}
