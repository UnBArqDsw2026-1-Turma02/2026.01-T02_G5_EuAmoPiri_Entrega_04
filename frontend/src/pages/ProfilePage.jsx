/**
 * PÁGINA — ProfilePage  (RF03: Gestão de Perfil do Usuário)
 *
 * Permite que o usuário autenticado visualize e edite seus dados:
 * nome, email, profissão, contato, data de nascimento, bio e foto.
 *
 * Padrão: leitura do contexto de auth + chamada ao updateProfile do adaptor.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Avatar from '../presentation/atoms/Avatar';
import Button from '../presentation/atoms/Button';
import Badge from '../presentation/atoms/Badge';
import FormField from '../presentation/molecules/FormField';
import styles from './ProfilePage.module.css';

/* ─── helpers ─── */
function roleLabel(role) {
  if (role === 'morador') return 'Morador';
  if (role === 'turista') return 'Turista';
  return role ?? 'Usuário';
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/* ─── sub-componente: linha de info em modo leitura ─── */
function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || '—'}</span>
    </div>
  );
}

/* ─── componente principal ─── */
export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name:       user?.name       ?? '',
      email:      user?.email      ?? '',
      profession: user?.profession ?? '',
      contact:    user?.contact    ?? '',
      birthDate:  user?.birthDate  ?? '',
      bio:        user?.bio        ?? '',
      avatarUrl:  user?.avatarUrl  ?? '',
    },
  });

  function startEditing() {
    reset({
      name:       user?.name       ?? '',
      email:      user?.email      ?? '',
      profession: user?.profession ?? '',
      contact:    user?.contact    ?? '',
      birthDate:  user?.birthDate  ?? '',
      bio:        user?.bio        ?? '',
      avatarUrl:  user?.avatarUrl  ?? '',
    });
    setFeedback(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setFeedback(null);
  }

  async function onSubmit(data) {
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile(data);
      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      setEditing(false);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Cabeçalho do perfil ── */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <Avatar src={user.avatarUrl} name={user.name} size="xl" />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.userName}>{user.name}</h1>
            <Badge variant="teal" size="sm">
              {roleLabel(user.role)}
            </Badge>
            {user.bio && <p className={styles.bio}>{user.bio}</p>}
          </div>
          {!editing && (
            <div className={styles.editBtnWrap}>
              <Button variant="teal" size="sm" onClick={startEditing}>
                Editar perfil
              </Button>
            </div>
          )}
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}
               role="alert">
            {feedback.msg}
          </div>
        )}

        {/* ── Modo leitura ── */}
        {!editing && (
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Informações pessoais</h2>
            <div className={styles.infoGrid}>
              <InfoRow label="Nome completo"      value={user.name} />
              <InfoRow label="E-mail"             value={user.email} />
              <InfoRow label="Profissão"          value={user.profession} />
              <InfoRow label="Contato"            value={user.contact} />
              <InfoRow label="Data de nascimento" value={formatDate(user.birthDate)} />
            </div>
          </div>
        )}

        {/* ── Modo edição ── */}
        {editing && (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className={styles.sectionTitle}>Editar perfil</h2>

            <div className={styles.formGrid}>
              <FormField
                id="name"
                label="Nome completo"
                placeholder="Seu nome completo"
                registration={register('name', { required: 'Nome é obrigatório' })}
                error={errors.name?.message}
              />
              <FormField
                id="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                registration={register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
                })}
                error={errors.email?.message}
              />
              <FormField
                id="profession"
                label="Profissão"
                placeholder="Ex: Guia turístico"
                registration={register('profession')}
              />
              <FormField
                id="contact"
                label="Contato (telefone ou rede social)"
                placeholder="Ex: (62) 99999-0000"
                registration={register('contact')}
              />
              <FormField
                id="birthDate"
                label="Data de nascimento"
                type="date"
                registration={register('birthDate')}
              />
              <FormField
                id="avatarUrl"
                label="URL da foto de perfil"
                placeholder="https://..."
                registration={register('avatarUrl')}
              />
            </div>

            <FormField
              id="bio"
              label="Biografia"
              multiline
              rows={3}
              maxLength={300}
              placeholder="Conte um pouco sobre você..."
              registration={register('bio', { maxLength: { value: 300, message: 'Máximo 300 caracteres' } })}
              error={errors.bio?.message}
            />

            <div className={styles.formActions}>
              <Button variant="ghost" type="button" onClick={cancelEditing} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
