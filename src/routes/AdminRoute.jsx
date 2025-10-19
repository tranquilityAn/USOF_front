import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
    const user = useSelector(s => s.auth.user);
    const role = user?.role;
    if (role !== 'admin') return <Navigate to="/" replace />;
    return children;
}
