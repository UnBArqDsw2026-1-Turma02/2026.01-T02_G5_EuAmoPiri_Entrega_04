import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyExperiences, updateExperience } from '../infra/adaptor/experienceAdaptor';
import ExperienceForm from '../presentation/organisms/ExperienceForm';
import Button from '../presentation/atoms/Button';
import Spinner from '../presentation/atoms/Spinner';
import styles from './CreateExperiencePage.module.css';

function formatDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditExperiencePage() {
  const { placeId, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoadErr('Faça login para editar seu relato.');
      setLoading(false);
      return;
    }

    fetchMyExperiences(user.id)
      .then((exps) => {
        const found = exps.find(
          (e) => String(e.id) === String(id) && String(e.placeId) === String(placeId)
        );
        if (!found) {
          setLoadErr('Relato não encontrado ou você não tem permissão para editá-lo.');
        } else {
          setExperience({
            ...found,
            visitDate: formatDateInput(found.visitDate),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadErr('Não foi possível carregar o relato.');
        setLoading(false);
      });
  }, [placeId, id, user?.id]);

  async function handleSubmit(data) {
    setSaving(true);
    try {
      await updateExperience(placeId, id, data, data.photos ?? []);
    } catch (err) {
      setSaving(false);
      throw err;
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{loadErr}</p>
          <Button variant="neutral" as={Link} to="/perfil">← Voltar ao perfil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Button variant="neutral" size="sm" as={Link} to="/perfil">
            ← Voltar ao perfil
          </Button>
        </div>
        <h1 className={styles.pageTitle}>Editar relato</h1>
        <div className={styles.formWrap}>
          <ExperienceForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/perfil')}
            loading={saving}
            defaultValues={experience ?? {}}
            existingPhotos={experience?.photos ?? []}
            submitLabel="Salvar alterações"
            successTitle="Relato atualizado com sucesso!"
            successPrimary={{ label: 'Voltar ao local', to: `/locais/${placeId}`, replace: true }}
            successSecondary={{ label: 'Voltar ao meu perfil', to: '/perfil' }}
            errorTitle="Falha ao atualizar relato"
          />
        </div>
      </div>
    </div>
  );
}
