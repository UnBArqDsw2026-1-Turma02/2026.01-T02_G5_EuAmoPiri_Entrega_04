import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { MdEdit, MdOutlineDelete, MdLocationOn } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { deleteMyAccount } from '../api/auth/authFacade';
import Avatar from '../presentation/atoms/Avatar';
import Button from '../presentation/atoms/Button';
import Badge from '../presentation/atoms/Badge';
import StarRating from '../presentation/atoms/StarRating';
import FormField from '../presentation/molecules/FormField';
import Input from '../presentation/atoms/Input';
import { deletePlace, fetchMyPlaces } from '../infra/adaptor/placeAdaptor';
import {
  deleteExperience,
  fetchExperiencesByPlaces,
  fetchMyExperiences,
} from '../infra/adaptor/experienceAdaptor';
import { categoryLabel } from '../utils/placeCategories';
import styles from './ProfilePage.module.css';

/* ─── helpers ─── */
function roleLabel(role) {
  if (role === 'morador') return 'Morador';
  if (role === 'turista') return 'Turista';
  if (role === 'admin') return 'Admin';
  return role ?? 'Usuário';
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function useHorizontalDragScroll(draggingClass) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let dragPending = false;
    let startX = 0;
    let scrollStart = 0;
    let activePointerId = null;

    function isInteractiveTarget(target) {
      return Boolean(
        target.closest('a, button, input, select, textarea, label, [role="button"]')
      );
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;

      dragPending = true;
      activePointerId = e.pointerId;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
    }

    function endDrag(e) {
      dragPending = false;
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove(draggingClass);
      if (el.hasPointerCapture?.(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
      activePointerId = null;
    }

    function onPointerMove(e) {
      if (!dragPending && !isDragging) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;

      const dx = e.clientX - startX;
      if (!isDragging) {
        if (Math.abs(dx) < 6) return;
        isDragging = true;
        dragPending = false;
        el.setPointerCapture?.(e.pointerId);
        el.classList.add(draggingClass);
      }

      el.scrollLeft = scrollStart - dx;
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
    };
  }, [draggingClass]);

  return ref;
}

/* ─── helpers de relatos (morador) ─── */
function diffDaysFrom(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

function countReactionTotal(reactions) {
  if (!reactions) return 0;
  return (reactions.like ?? 0) + (reactions.heart ?? 0);
}

function mapMoradorRelato(exp, placeNamesById) {
  return {
    id: `${exp.placeId}-${exp.id}`,
    placeId: exp.placeId,
    local: exp.placeName ?? placeNamesById[exp.placeId] ?? 'Local',
    autor: exp.userName ?? 'Anônimo',
    dias: exp.dias ?? diffDaysFrom(exp.createdAt),
    texto: exp.text ?? '',
    likes: countReactionTotal(exp.reactions),
  };
}

const MOCK_LOCAIS_MORADOR = [
  { id: 1, nome: 'Botequim Mercatto Piri',          categoria: 'gastronomia', icon: '🏛️', rating: 4.9, avaliacoes: 100 },
  { id: 2, nome: 'Cachoeira da Rosário',             categoria: 'natureza',    icon: '🏞️', rating: 4.8, avaliacoes: 50  },
  { id: 3, nome: 'Galeria de Arte Local',            categoria: 'experiencia', icon: '🎨', rating: 4.7, avaliacoes: 10  },
  { id: 4, nome: 'Trilha do Poço Azul',              categoria: 'natureza',    icon: '🌿', rating: 4.6, avaliacoes: 300 },
  { id: 5, nome: 'Igreja Matriz de Pirenópolis',     categoria: 'histórico',   icon: '⛪', rating: 4.9, avaliacoes: 1000 },
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

/* ─── helper: mapeia dado da API para o formato do template ─── */
function mapPlace(p) {
  const CATEGORY_ICONS = {
    gastronomia: '🍽️', natureza: '🏞️', hospedagem: '🏨',
    cultura: '🎨', compras: '🛍️', aventura: '🌿', histórico: '⛪',
    experiencia: '🎨',
  };
  return {
    id:        p.id,
    nome:      p.name      ?? p.nome      ?? '—',
    categoria: p.category  ?? p.categoria ?? '—',
    icon:      p.icon ?? CATEGORY_ICONS[p.category ?? p.categoria] ?? '📍',
    coverImage: p.coverImage ?? p.photos?.[0]?.url ?? null,
    rating:    p.rating    ?? 0,
    avaliacoes: p.reviewsCount ?? p.avaliacoes ?? 0,
  };
}

/* ─── seção Morador ─── */
function MoradorSections({ onPlacesCountChange }) {
  const [locais, setLocais]             = useState([]);
  const [relatos, setRelatos]           = useState([]);
  const [loadingRelatos, setLoadingRelatos] = useState(true);
  const [confirmId, setConfirmId]       = useState(null); // id do local a excluir
  const [deleting, setDeleting]         = useState(false);
  const [deleteErr, setDeleteErr]       = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const relatosScrollRef = useHorizontalDragScroll(styles.dragging);

  useEffect(() => {
    let cancelled = false;

    async function loadMoradorData() {
      setLoadingRelatos(true);
      try {
        const placesData = await fetchMyPlaces();
        const mappedPlaces = (placesData ?? []).map(mapPlace);
        if (cancelled) return;
        setLocais(mappedPlaces);
        onPlacesCountChange?.(mappedPlaces.length);

        const placeNamesById = Object.fromEntries(
          mappedPlaces.map((p) => [p.id, p.nome])
        );
        const ids = mappedPlaces.map((p) => p.id);

        if (ids.length === 0) {
          setRelatos([]);
          onPlacesCountChange?.(0);
          return;
        }

        const experiences = await fetchExperiencesByPlaces(ids);
        const sorted = [...experiences].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (cancelled) return;
        setRelatos(sorted.map((exp) => mapMoradorRelato(exp, placeNamesById)));
      } catch {
        if (!cancelled) {
          setLocais(MOCK_LOCAIS_MORADOR);
          setRelatos([]);
        }
      } finally {
        if (!cancelled) setLoadingRelatos(false);
      }
    }

    loadMoradorData();
    return () => { cancelled = true; };
  }, []);

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
      setLocais((prev) => {
        const next = prev.filter((l) => l.id !== confirmId);
        onPlacesCountChange?.(next.length);
        return next;
      });
      setRelatos((prev) => prev.filter((r) => r.placeId !== confirmId));
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
        <div className={styles.relatosGrid} ref={relatosScrollRef}>
          {loadingRelatos && (
            <p className={styles.empty}>Carregando relatos...</p>
          )}
          {!loadingRelatos && relatos.length === 0 && (
            <p className={styles.empty}>Nenhum relato nos seus locais ainda.</p>
          )}
          {!loadingRelatos && relatos.map((r) => (
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
                {l.coverImage ? (
                  <img
                    src={l.coverImage}
                    alt=""
                    className={styles.localThumb}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.localIcon} aria-hidden="true">{l.icon}</span>
                )}
                <div>
                  <span className={styles.localNome}>{l.nome}</span>
                  <span className={styles.localCat}>{categoryLabel(l.categoria)}</span>
                  <div className={styles.localRating}>
                    <StarRating value={Math.round(l.rating)} readonly size="sm" />
                    <span className={styles.localMeta}>
                      {l.rating.toFixed(1)} &nbsp;{l.avaliacoes} Avaliações
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

/* ─── seção Turista ─── */
function TuristaSections({ onCountChange }) {
  const [avaliacoes, setAvaliacoes]       = useState([]);
  const [confirmId, setConfirmId]         = useState(null); // id da avaliação a excluir
  const [deleting, setDeleting]           = useState(false);
  const [deleteErr, setDeleteErr]         = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const avaliacoesScrollRef = useHorizontalDragScroll(styles.dragging);

  /* Carrega do adaptor para sempre refletir edições recentes */
  useEffect(() => {
    fetchMyExperiences().then((data) => {
      setAvaliacoes(data);
      onCountChange?.(data.length);
    });
  }, [onCountChange]);

  const toDelete = avaliacoes.find((a) => a.id === confirmId);

  function closeConfirm() {
    setConfirmId(null);
    setDeleteSuccess(false);
    setDeleteErr(null);
  }

  async function handleDeleteAvaliacao() {
    if (!toDelete) {
      setDeleteErr('Relato não encontrado.');
      return;
    }
    setDeleting(true);
    setDeleteErr(null);
    try {
      await deleteExperience(toDelete.placeId, confirmId);
      const next = avaliacoes.filter((a) => a.id !== confirmId);
      setAvaliacoes(next);
      onCountChange?.(next.length);
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
        <h2 className={styles.sectionTitle}>RELATOS CADASTRADOS</h2>
        <div className={styles.avaliacoesGrid} ref={avaliacoesScrollRef}>
          {avaliacoes.length === 0 && (
            <p className={styles.empty}>Nenhum relato cadastrado.</p>
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
              <div
                className={styles.relatoActions}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  as={Link}
                  to={`/locais/${a.placeId}/relatos/${a.id}/editar`}
                >
                  Editar relato
                </Button>
                <Button
                  variant="rust"
                  size="sm"
                  onClick={() => { setDeleteErr(null); setConfirmId(a.id); }}
                >
                  Excluir relato
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
                <h3 className={styles.confirmTitle}>Relato excluído com sucesso!</h3>
                <p className={styles.confirmBody}>Seu relato foi removido.</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="primary" fullWidth onClick={closeConfirm}>Fechar</Button>
                </div>
              </>
            ) : deleteErr ? (
              /* Estado de erro */
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={`${styles.confirmSuccessIcon} ${styles.confirmErrIcon}`} aria-hidden="true">⚠️</p>
                <h3 className={styles.confirmTitle}>Erro ao excluir relato</h3>
                <p className={styles.confirmBody}>{deleteErr}</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="neutral" fullWidth onClick={() => setDeleteErr(null)}>Voltar</Button>
                </div>
              </>
            ) : (
              /* Estado de confirmação */
              <>
                <h3 className={styles.confirmTitle}>Excluir relato</h3>
                <p className={styles.confirmBody}>
                  Tem certeza que deseja excluir seu relato de{' '}
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
  const { user, updateProfile, logout, isMorador, isTurista } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [relatosCount, setRelatosCount] = useState(0);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountErr, setDeleteAccountErr] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user || !isMorador) return;

    fetchMyPlaces()
      .then((places) => setRelatosCount((places ?? []).length))
      .catch(() => setRelatosCount(0));
  }, [user, isMorador]);

  /* ── Estado da seção de senha ── */
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name:       user?.name       ?? '',
      email:      user?.email      ?? '',
      profession: user?.profession ?? '',
      contact:    user?.contact    ?? '',
      birthDate:  user?.birthDate  ?? '',
      bio:        user?.bio        ?? '',
    },
  });

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setAvatarPreview(canvas.toDataURL('image/jpeg', 0.8));
        canvas.toBlob((blob) => {
          if (!blob) return;
          setSelectedPhotoFile(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function startEditing() {
    reset({
      name:       user?.name       ?? '',
      email:      user?.email      ?? '',
      profession: user?.profession ?? '',
      contact:    user?.contact    ?? '',
      birthDate:  user?.birthDate  ?? '',
      bio:        user?.bio        ?? '',
    });
    setFeedback(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setFeedback(null);
    setAvatarPreview(null);
    setSelectedPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(data) {
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile({ ...data, role: user.role }, selectedPhotoFile ?? undefined);
      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      setAvatarPreview(null);
      setSelectedPhotoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditing(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err?.message ?? 'Erro ao salvar. Tente novamente.',
      });
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

  function openDeleteAccountConfirm() {
    setDeleteAccountErr(null);
    setShowDeleteAccount(true);
  }

  function closeDeleteAccountConfirm() {
    if (deletingAccount) return;
    setShowDeleteAccount(false);
    setDeleteAccountErr(null);
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    setDeleteAccountErr(null);
    try {
      await deleteMyAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteAccountErr(err.message ?? 'Erro ao excluir conta. Tente novamente.');
    } finally {
      setDeletingAccount(false);
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
          <div className={styles.profileLeft}>
            <div className={styles.avatarWrap}>
              <Avatar src={avatarPreview ?? user.avatarUrl} name={user.name} size="xl" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
                  aria-label="Alterar foto de perfil"
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
              {isMorador ? 'Quantidade de locais cadastrados no Eu Amo Piri' : 'Relatos Cadastrados'}
            </span>
            <span className={styles.statNumber}>{relatosCount}</span>
          </div>
        </div>

        {/* ── Botões de ação ── */}
        {!editing && (
          <div className={styles.actionBtns}>
            <Button variant="danger" size="sm" onClick={openDeleteAccountConfirm}>
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

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`} role="alert">
            {feedback.msg}
          </div>
        )}

        {/* ── Modo edição ── */}
        {editing && (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className={styles.sectionTitle}>EDITAR PERFIL</h2>

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
              watch={watch}
              placeholder="Conte um pouco sobre você..."
              registration={register('bio')}
            />

            <div className={styles.formActions}>
              <Button type="button" variant="neutral" onClick={cancelEditing} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Atualizar Perfil
              </Button>
            </div>
          </form>
        )}

        {/* ── Seção de senha (só no modo edição) ── */}
        {editing && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>CADASTRAR NOVA SENHA</h2>
            <form className={styles.passwordForm} onSubmit={handlePasswordUpdate} noValidate>
              <div className={styles.formGrid}>
                <Input
                  id="currentPassword"
                  label="Senha atual"
                  type="password"
                  aria-label="Senha atual"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData((p) => ({ ...p, current: e.target.value }))}
                  autoComplete="current-password"
                />
                <Input
                  id="newPassword"
                  label="Nova senha"
                  type="password"
                  aria-label="Nova senha"
                  value={passwordData.next}
                  onChange={(e) => setPasswordData((p) => ({ ...p, next: e.target.value }))}
                  autoComplete="new-password"
                />
                <Input
                  id="confirmPassword"
                  label="Confirmar nova senha"
                  type="password"
                  aria-label="Confirmar nova senha"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData((p) => ({ ...p, confirm: e.target.value }))}
                  autoComplete="new-password"
                  className={styles.passwordConfirmField}
                />
              </div>
              {passwordFeedback && (
                <div
                  className={`${styles.feedback} ${styles[passwordFeedback.type]}`}
                  role="alert"
                >
                  {passwordFeedback.msg}
                </div>
              )}
              <Button type="submit" variant="primary" loading={savingPassword}>
                Atualizar Senha
              </Button>
            </form>
          </div>
        )}

        {showDeleteAccount && (
          <div
            className={styles.confirmOverlay}
            onClick={(e) => e.target === e.currentTarget && !deletingAccount && closeDeleteAccountConfirm()}
          >
            <div className={`${styles.confirmDialog} ${deleteAccountErr ? styles.confirmDialogError : ''}`}>
              <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
              <p className={styles.confirmBody}>
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
              </p>
              {deleteAccountErr && (
                <p className={styles.confirmError} role="alert">{deleteAccountErr}</p>
              )}
              <div className={styles.confirmActions}>
                <Button variant="neutral" size="sm" onClick={closeDeleteAccountConfirm} disabled={deletingAccount}>
                  Cancelar
                </Button>
                <Button variant="rust" size="sm" loading={deletingAccount} onClick={handleDeleteAccount}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}

        {!editing && isMorador && <MoradorSections onPlacesCountChange={setRelatosCount} />}
        {!editing && isTurista && (
          <TuristaSections onCountChange={setRelatosCount} />
        )}

      </div>
    </div>
  );
}
