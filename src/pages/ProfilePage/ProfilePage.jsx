import { useParams } from 'react-router-dom';

export default function ProfilePage() {
  const { id } = useParams();
  return (
    <div style={{ color:'#f5f5f5' }}>
      <h1>Профіль {id}</h1>
      <p>Тут буде профіль користувача та його пости.</p>
    </div>
  );
}
