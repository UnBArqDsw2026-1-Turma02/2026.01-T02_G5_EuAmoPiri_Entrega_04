import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MdEdit, MdOutlineDelete, MdLocationOn } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import Avatar from '../presentation/atoms/Avatar';
import Button from '../presentation/atoms/Button';
import Badge from '../presentation/atoms/Badge';
import StarRating from '../presentation/atoms/StarRating';
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

/* ─── mock de dados (substituir por API quando disponível) ─── */
const MOCK_RELATOS_MORADOR = [
  { id: 1, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas em vários restaurantes pelo país e tenho propriedade para dizer que já cansara de restaurantes melhores em Pirenópolis.', likes: 3 },
  { id: 2, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas.', likes: 3 },
  { id: 3, local: 'Restaurante LovePiri', autor: 'Josefina Souza', dias: 5, texto: 'Já tive experiências melhores. Olha, meus 65 anos de vida eu já tive experiências muito diversas.', likes: 3 },
];

const MOCK_LOCAIS_MORADOR = [
  { id: 1, nome: 'Botequim Mercatto Piri', categoria: 'Gastronomia', rating: 4.4, avaliacoes: 1 },
  { id: 2, nome: 'Cachoeira da Rosário',   categoria: 'Natureza',    rating: 4.3, avaliacoes: 1 },
  { id: 3, nome: 'Galeria de Arte Local',  categoria: 'Cultura',     rating: 4.3, avaliacoes: 1 },
  { id: 4, nome: 'Trilha do Poço Azul',    categoria: 'Natureza',    rating: 4.5, avaliacoes: 1 },
  { id: 5, nome: 'Igreja Matriz de N. S. do Rosário', categoria: 'Cultura', rating: 4.5, avaliacoes: 1 },
];

const MOCK_AVALIACOES_TURISTA = [
  { id: 1, local: 'Cachoeiras da região', titulo: 'Vista incrível!', texto: 'Com certeza voltarei na próxima viagem! O lugar é simplesmente deslumbrante.', rating: 5, dias: 6 },
  { id: 2, local: 'Restaurante típico',   titulo: 'Comida deliciosa',  texto: 'Atendimento ótimo, ambiente acolhedor. Recomendo o prato do dia.', rating: 4, dias: 12 },
  { id: 3, local: 'Trilha das pedras',    titulo: 'Paisagem incrível', texto: 'Recomendo muito! A trilha é bem sinalizada e o visual compensa cada passo.', rating: 5, dias: 24 },
  { id: 4, local: 'Pousada das Cavalhadas', titulo: 'Quero morar aqui...', texto: 'Sempre indico para os amigos que vêm visitar. O café da manhã tem aquele gostinho de fazenda.', rating: 5, dias: 66 },
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
  return (
    <>
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>ÚLTIMOS RELATOS</h2>
        <div className={styles.relatosGrid}>
          {MOCK_RELATOS_MORADOR.map((r) => (
            <div key={r.id} className={styles.relatoCard}>
              <div className={styles.relatoHeader}>
                <span className={styles.relatoLocal}>{r.local}</span>
                <span className={styles.relatoMeta}>{r.autor} · {r.dias}d atrás</span>
              </div>
              <p className={styles.relatoTexto}>{r.texto}</p>
              <div className={styles.relatoFooter}>
                <div className={styles.relatoActions}>
                  <Button variant="outline" size="sm">Editar Avaliação</Button>
                  <Button variant="outline" size="sm">Excluir Avaliação</Button>
                </div>
                <span>👍 {r.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>MEUS LOCAIS</h2>
        <div className={styles.locaisGrid}>
          {MOCK_LOCAIS_MORADOR.map((l) => (
            <Link key={l.id} to={`/locais/${l.id}`} className={styles.localCard}>
              <span className={styles.localNome}>{l.nome}</span>
              <span className={styles.localCat}>{l.categoria}</span>
              <div className={styles.localRating}>
                <StarRating value={Math.round(l.rating)} readonly size="sm" />
                <span>{l.rating.toFixed(1)} · {l.avaliacoes} Avaliação</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── seção Turista ─── */
function TuristaSections() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>AVALIAÇÕES CADASTRADAS</h2>
      <div className={styles.avaliacoesGrid}>
        {MOCK_AVALIACOES_TURISTA.map((a) => (
          <div key={a.id} className={styles.avaliacaoCard}>
            <div className={styles.avaliacaoMeta}>
              <MdLocationOn size={16} className={styles.pinIcon} />
              <span className={styles.avaliacaoLocal}>{a.local}</span>
              <span className={styles.avaliacaoDias}>há {a.dias} dias</span>
            </div>
            <StarRating value={a.rating} readonly size="sm" />
            {a.titulo && <p className={styles.avaliacaoTitulo}>{a.titulo}</p>}
            <p className={styles.avaliacaoTexto}>"{a.texto}"</p>
            <div className={styles.relatoActions}>
              <Button variant="secondary" size="sm">Editar Avaliação</Button>
              <Button variant="rust" size="sm">Excluir Avaliação</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── componente principal ─── */
export default function ProfilePage() {
  const { user, updateProfile, isMorador } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
      // Comprime para max 200x200px antes de salvar (evita estourar localStorage)
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setAvatarPreview(canvas.toDataURL('image/jpeg', 0.8));
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
  }

  async function onSubmit(data) {
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile({ ...data, avatarUrl: avatarPreview ?? user?.avatarUrl });
      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      setAvatarPreview(null);
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
              {isMorador ? 'Quantidade de relatos sobre os seus locais' : 'Relatos Cadastrados'}
            </span>
            <span className={styles.statNumber}>5</span>
          </div>
        </div>

        {/* ── Botões de ação ── */}
        {!editing && (
          <div className={styles.actionBtns}>
            <Button variant="danger" size="sm" onClick={() => {}}>
              <MdOutlineDelete size={16} /> Deletar Perfil
            </Button>
            <Button variant="primary" size="sm" onClick={startEditing}>
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

        {/* ── Seções por role (só no modo leitura) ── */}
        {!editing && (
          isMorador ? <MoradorSections /> : <TuristaSections />
        )}

      </div>
    </div>
  );
}
