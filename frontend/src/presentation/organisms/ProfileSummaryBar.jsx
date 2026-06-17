import { Link } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import styles from './ProfileSummaryBar.module.css';

function roleLabel(role) {
  if (role === 'morador') return 'Empresário';
  if (role === 'turista') return 'Turista';
  return role ?? '';
}

export default function ProfileSummaryBar({ user, statLabel, statValue, showActions = true }) {
  if (!user) return null;

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <Avatar src={user.avatarUrl} name={user.name} size="lg" />
        <div className={styles.info}>
          <h1 className={styles.name}>{user.name}</h1>
          <div className={styles.meta}>
            <Badge variant="teal" size="sm">{roleLabel(user.role)}</Badge>
            {user.profession && <span className={styles.profession}>{user.profession}</span>}
          </div>
          <span className={styles.email}>{user.email}</span>
        </div>
      </div>
      {statLabel && (
        <div className={styles.right}>
          <span className={styles.statLabel}>{statLabel}</span>
          <span className={styles.statNumber}>{statValue ?? '—'}</span>
        </div>
      )}
      {showActions && (
        <div className={styles.actions}>
          <Button variant="danger" size="sm" disabled>Deletar Perfil</Button>
          <Button variant="secondary" size="sm" as={Link} to="/perfil">Editar Perfil</Button>
          <Button variant="primary" size="sm" as={Link} to="/morador/locais/novo">Cadastrar Novo Local</Button>
        </div>
      )}
    </div>
  );
}
