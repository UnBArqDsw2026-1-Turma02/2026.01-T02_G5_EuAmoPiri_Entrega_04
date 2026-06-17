import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MdEdit, MdOutlineDelete, MdLocationOn } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import Avatar from '../presentation/atoms/Avatar';
import Button from '../presentation/atoms/Button';
import Badge from '../presentation/atoms/Badge';
import StarRating from '../presentation/atoms/StarRating';
import FormField from '../presentation/molecules/FormField';
import { deletePlace } from '../infra/adaptor/placeAdaptor';
import { deleteExperience, fetchMyExperiences } from '../infra/adaptor/experienceAdaptor';
import styles from './ProfilePage.module.css';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

function roleLabel(role) {
  if (role === 'morador') return 'Morador';
  if (role === 'turista') return 'Turista';
  return role ?? 'Usuário';
}

function hasLocalChanges(form, user, selectedPhotoFile) {
  if (selectedPhotoFile) return true;

  const fields = ['name', 'email', 'profession', 'contact', 'birthDate', 'bio'];
  return fields.some((field) => (form[field] ?? '') !== (user?.[field] ?? ''));
}

function validatePhotoFile(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return 'Use uma imagem JPG ou PNG.';
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return 'A imagem deve ter no máximo 5 MB.';
  }
  return null;
}

const MOCK_RELATOS_MORADOR = [
  { id: 1, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas em vários restaurantes pelo país e tenho propriedade para dizer que já cansara de restaurantes melhores em Pirenópolis.', likes: 3 },
  { id: 2, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas.', likes: 3 },
  { id: 3, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas.', likes: 3 },
];

const MOCK_LOCAIS_MORADOR = [
  { id: 1, nome: 'Botequim Mercatto Piri', categoria: 'gastronomia', icon: '🏛️', price: '$$', rating: 4.9, avaliacoes: 100 },
  { id: 2, nome: 'Cachoeira da Rosário', categoria: 'natureza', icon: '🏞️', price: '$', rating: 4.8, avaliacoes: 50 },
  { id: 3, nome: 'Galeria de Arte Local', categoria: 'experiencia', icon: '🎨', price: '$$', rating: 4.7, avaliacoes: 10 },
  { id: 4, nome: 'Trilha do Poço Azul', categoria: 'natureza', icon: '🌿', price: '$$$', rating: 4.6, avaliacoes: 300 },
  { id: 5, nome: 'Igreja Matriz de Pirenópolis', categoria: 'histórico', icon: '⛪', price: '$', rating: 4.9, avaliacoes: 1000 },
];


/* ─── sub-componente: linha de info em modo leitura ─── */
function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || '—'}</span>
    </div>
  );
}

/* ─── seção Morador ─── */
function MoradorSections() {
  const [locais, setLocais] = useState(MOCK_LOCAIS_MORADOR);
  const [confirmId, setConfirmId] = useState(null); // id do local a excluir
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const toDelete = locais.find((l) => l.id === confirmId);

  function closeConfirm() {
    setConfirmId(null);
    setDeleteSuccess(false);
    setDeleteErr(null);
  }

  async function handleDeleteLocal() {
    setDeleting(true);
    setDeleteErr(null);
    try {
      await deletePlace(confirmId);
      setLocais((prev) => prev.filter((l) => l.id !== confirmId));
      setDeleteSuccess(true);
    } catch {
      setDeleteErr('Erro ao excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>ÚLTIMOS RELATOS</h2>
        <div className={styles.relatosGrid}>
          {MOCK_RELATOS_MORADOR.map((r) => (
            <div key={r.id} className={styles.relatoCard}>
              <div className={styles.avaliacaoMeta}>
                <MdLocationOn size={16} className={styles.relatoPinIcon} />
                <span className={styles.relatoLocal}>{r.local}</span>
                <span className={styles.avaliacaoDias}>há {r.dias} dias</span>
              </div>
              <span className={styles.relatoAutor}>{r.autor}</span>
              <p className={styles.relatoTexto}>{r.texto}</p>
              <span className={styles.relatoLikes}>👍 {r.likes}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>LOCAIS CADASTRADOS</h2>
        <div className={styles.locaisLista}>
          {locais.length === 0 && (
            <p className={styles.empty}>Nenhum local cadastrado.</p>
          )}
          {locais.map((l) => (
            <div key={l.id} className={styles.localRow}>
              <div className={styles.localInfo}>
                <span className={styles.localIcon} aria-hidden="true">{l.icon}</span>
                <div>
                  <span className={styles.localNome}>{l.nome}</span>
                  <span className={styles.localCat}>{l.categoria}</span>
                  <div className={styles.localRating}>
                    <StarRating value={Math.round(l.rating)} readonly size="sm" />
                    <span className={styles.localMeta}>
                      {l.rating.toFixed(1)} &nbsp;{l.price}&nbsp; {l.avaliacoes} Avaliações
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.localActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  as={Link}
                  to={`/morador/locais/${l.id}/editar`}
                >
                  Editar Local
                </Button>
                <Button
                  variant="rust"
                  size="sm"
                  onClick={() => { setDeleteErr(null); setConfirmId(l.id); }}
                >
                  Excluir Local
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal de confirmação / sucesso / erro de exclusão ── */}
      {confirmId && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => e.target === e.currentTarget && !deleting && closeConfirm()}
        >
          <div className={`${styles.confirmDialog} ${deleteSuccess ? styles.confirmDialogSuccess : deleteErr ? styles.confirmDialogError : ''}`}>
            {deleteSuccess ? (
              /* Estado de sucesso */
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={styles.confirmSuccessIcon} aria-hidden="true">✓</p>
                <h3 className={styles.confirmTitle}>Local excluído com sucesso!</h3>
                <p className={styles.confirmBody}>O local foi removido da sua lista.</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="primary" fullWidth onClick={closeConfirm}>Fechar</Button>
                </div>
              </>
            ) : deleteErr ? (
              /* Estado de erro */
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={`${styles.confirmSuccessIcon} ${styles.confirmErrIcon}`} aria-hidden="true">⚠️</p>
                <h3 className={styles.confirmTitle}>Erro ao excluir local</h3>
                <p className={styles.confirmBody}>{deleteErr}</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="neutral" fullWidth onClick={() => setDeleteErr(null)}>Voltar</Button>
                </div>
              </>
            ) : (
              /* Estado de confirmação */
              <>
                <h3 className={styles.confirmTitle}>Excluir local</h3>
                <p className={styles.confirmBody}>
                  Tem certeza que deseja excluir{' '}
                  <strong>{toDelete?.nome}</strong>?{' '}
                  Esta ação não pode ser desfeita.
                </p>
                <div className={styles.confirmActions}>
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={closeConfirm}
                    disabled={deleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="rust"
                    size="sm"
                    loading={deleting}
                    onClick={handleDeleteLocal}
                  >
                    Excluir
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TuristaSections() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [confirmId, setConfirmId] = useState(null); // id da avaliação a excluir
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  /* Carrega do adaptor para sempre refletir edições recentes */
  useEffect(() => {
    fetchMyExperiences().then(setAvaliacoes);
  }, []);

  const toDelete = avaliacoes.find((a) => a.id === confirmId);

  function closeConfirm() {
    setConfirmId(null);
    setDeleteSuccess(false);
    setDeleteErr(null);
  }

  async function handleDeleteAvaliacao() {
    setDeleting(true);
    setDeleteErr(null);
    try {
      await deleteExperience(toDelete.placeId, confirmId);
      setAvaliacoes((prev) => prev.filter((a) => a.id !== confirmId));
      setDeleteSuccess(true);
    } catch {
      setDeleteErr('Erro ao excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>AVALIAÇÕES CADASTRADAS</h2>
        <div className={styles.avaliacoesGrid}>
          {avaliacoes.length === 0 && (
            <p className={styles.empty}>Nenhuma avaliação cadastrada.</p>
          )}
          {avaliacoes.map((a) => (
            <div key={a.id} className={styles.avaliacaoCard}>
              <div className={styles.avaliacaoMeta}>
                <MdLocationOn size={16} className={styles.pinIcon} />
                <span className={styles.avaliacaoLocal}>{a.placeName}</span>
                <span className={styles.avaliacaoDias}>há {a.dias} dias</span>
              </div>
              <StarRating value={a.rating} readonly size="sm" />
              {a.title && <p className={styles.avaliacaoTitulo}>{a.title}</p>}
              <p className={styles.avaliacaoTexto}>"{a.text}"</p>
              <div className={styles.relatoActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  as={Link}
                  to={`/locais/${a.placeId}/relatos/${a.id}/editar`}
                >
                  Editar Avaliação
                </Button>
                <Button
                  variant="rust"
                  size="sm"
                  onClick={() => { setDeleteErr(null); setConfirmId(a.id); }}
                >
                  Excluir Avaliação
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal de confirmação / sucesso / erro de exclusão ── */}
      {confirmId && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => e.target === e.currentTarget && !deleting && closeConfirm()}
        >
          <div className={`${styles.confirmDialog} ${deleteSuccess ? styles.confirmDialogSuccess : deleteErr ? styles.confirmDialogError : ''}`}>
            {deleteSuccess ? (
              /* Estado de sucesso */
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={styles.confirmSuccessIcon} aria-hidden="true">✓</p>
                <h3 className={styles.confirmTitle}>Avaliação excluída com sucesso!</h3>
                <p className={styles.confirmBody}>Sua avaliação foi removida.</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="primary" fullWidth onClick={closeConfirm}>Fechar</Button>
                </div>
              </>
            ) : deleteErr ? (
              /* Estado de erro */
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={`${styles.confirmSuccessIcon} ${styles.confirmErrIcon}`} aria-hidden="true">⚠️</p>
                <h3 className={styles.confirmTitle}>Erro ao excluir avaliação</h3>
                <p className={styles.confirmBody}>{deleteErr}</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="neutral" fullWidth onClick={() => setDeleteErr(null)}>Voltar</Button>
                </div>
              </>
            ) : (
              /* Estado de confirmação */
              <>
                <h3 className={styles.confirmTitle}>Excluir avaliação</h3>
                <p className={styles.confirmBody}>
                  Tem certeza que deseja excluir sua avaliação de{' '}
                  <strong>{toDelete?.placeName}</strong>?{' '}
                  Esta ação não pode ser desfeita.
                </p>
                <div className={styles.confirmActions}>
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={closeConfirm}
                    disabled={deleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="rust"
                    size="sm"
                    loading={deleting}
                    onClick={handleDeleteAvaliacao}
                  >
                    Excluir
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── componente principal ─── */
export default function ProfilePage() {
  const { user, updateProfile, isMorador } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Estado da seção de senha ── */
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      profession: user?.profession ?? '',
      contact: user?.contact ?? '',
      birthDate: user?.birthDate ?? '',
      bio: user?.bio ?? '',
    },
  });

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const photoError = validatePhotoFile(file);
    if (photoError) {
      setFeedback({ type: 'error', msg: photoError });
      e.target.value = '';
      return;
    }

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedPhotoFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setFeedback(null);
  }

  function startEditing() {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      profession: user?.profession ?? '',
      contact: user?.contact ?? '',
      birthDate: user?.birthDate ?? '',
      bio: user?.bio ?? '',
    });
    setFeedback(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setFeedback(null);
    setSelectedPhotoFile(null);
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(data) {
    setSaving(true);
    setFeedback(null);

    if (!hasLocalChanges(data, user, selectedPhotoFile)) {
      setFeedback({ type: 'error', msg: 'Nenhuma alteração detectada' });
      setSaving(false);
      return;
    }

    try {
      await updateProfile(data, selectedPhotoFile ?? undefined);
      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      setSelectedPhotoFile(null);
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditing(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message ?? 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPasswordFeedback(null);
    const { current, next, confirm } = passwordData;
    if (!current || !next || !confirm) {
      return setPasswordFeedback({ type: 'error', msg: 'Preencha todos os campos de senha.' });
    }
    if (next !== confirm) {
      return setPasswordFeedback({ type: 'error', msg: 'Nova senha e confirmação não coincidem.' });
    }
    if (next.length < 6) {
      return setPasswordFeedback({ type: 'error', msg: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    setSavingPassword(true);
    try {
      // TODO: chamar API real — await updatePassword({ current, next });
      await new Promise((r) => setTimeout(r, 600)); // mock de latência
      setPasswordData({ current: '', next: '', confirm: '' });
      setPasswordFeedback({ type: 'success', msg: 'Senha atualizada com sucesso!' });
    } catch {
      setPasswordFeedback({ type: 'error', msg: 'Erro ao atualizar senha. Tente novamente.' });
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>
          Você precisa estar logado para ver seu perfil.{' '}
          <Link to="/login">Fazer login</Link>
        </p>
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? user.avatarUrl;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.profileHeader}>
          <div className={styles.profileLeft}>
            <div className={styles.avatarWrap}>
              <Avatar src={avatarSrc} name={user.name} size="xl" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className={styles.avatarFileInput}
                onChange={handleAvatarChange}
                aria-label="Alterar foto de perfil"
              />
              {editing && (
                <button
                  type="button"
                  className={styles.avatarUploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto"
                >
                  <MdEdit size={14} />
                </button>
              )}
            </div>

            <div className={styles.headerInfo}>
              <h1 className={styles.userName}>{user.name}</h1>
              <div className={styles.userMeta}>
                <Badge variant="teal" size="sm">{roleLabel(user.role)}</Badge>
                {user.profession && (
                  <span className={styles.profession}>{user.profession}</span>
                )}
              </div>
              <span className={styles.userEmail}>{user.email}</span>
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
            </div>
          </div>

          <div className={styles.profileRight}>
            <span className={styles.statLabel}>
              {isMorador ? 'Quantidade de relatos sobre os seus locais' : 'Relatos Cadastrados'}
            </span>
            <span className={styles.statNumber}>5</span>
          </div>
        </div>

        {!editing && (
          <div className={styles.actionBtns}>
            <Button variant="danger" size="sm" onClick={() => { }}>
              <MdOutlineDelete size={16} /> Deletar Perfil
            </Button>
            <Button variant="secondary" size="sm" onClick={startEditing}>
              Editar Perfil
            </Button>
            {isMorador ? (
              <Button variant="primary" size="sm" as={Link} to="/morador/locais/novo">
                Cadastrar Novo Local
              </Button>
            ) : (
              <Button variant="primary" size="sm" as={Link} to="/locais">
                Cadastrar Novo Relato
              </Button>
            )}
          </div>
        )}

        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`} role="alert">
            {feedback.msg}
          </div>
        )}

        {editing && (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className={styles.sectionTitle}>EDITAR PERFIL</h2>

            <div className={styles.formGrid}>
              <FormField
                id="name"
                label="Nome completo"
                placeholder="Seu nome completo"
                registration={register('name')}
                error={errors.name?.message}
              />
              <FormField
                id="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                registration={register('email', {
                  validate: (value) => {
                    if (!value?.trim()) return true;
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'E-mail inválido';
                  },
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
                label="Contato"
                placeholder="Ex: (62) 99999-0000"
                registration={register('contact')}
              />
              <FormField
                id="birthDate"
                label="Data de nascimento"
                type="date"
                registration={register('birthDate')}
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
              <Button variant="neutral" type="button" onClick={cancelEditing} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={saving}>
                Atualizar Perfil
              </Button>
            </div>
          </form>
        )}

        {/* ── Seção: Cadastrar Nova Senha (só no modo edição) ── */}
        {editing && <form className={styles.passwordForm} onSubmit={handlePasswordUpdate} noValidate>
          <h2 className={styles.sectionTitle}>CADASTRAR NOVA SENHA</h2>

          <div className={styles.passwordFields}>
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="Senha Atual"
              value={passwordData.current}
              onChange={(e) => setPasswordData((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
              aria-label="Senha atual"
            />
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="Nova Senha"
              value={passwordData.next}
              onChange={(e) => setPasswordData((p) => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
              aria-label="Nova senha"
            />
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="Confirmar Nova Senha"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData((p) => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
              aria-label="Confirmar nova senha"
            />
          </div>

          {passwordFeedback && (
            <div className={`${styles.feedback} ${styles[passwordFeedback.type]}`} role="alert">
              {passwordFeedback.msg}
            </div>
          )}

          <div className={styles.passwordActions}>
            <Button variant="secondary" type="submit" loading={savingPassword}>
              Atualizar Senha
            </Button>
          </div>
        </form>}

        {/* ── Seções por role (só no modo leitura) ── */}
        {!editing && (
          isMorador ? <MoradorSections /> : <TuristaSections />
        )}

      </div>
    </div>
  );
}
