import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchExperiencesByPlace, updateExperience } from '../infra/adaptor/experienceAdaptor';
import ExperienceForm from '../presentation/organisms/ExperienceForm';
import Button from '../presentation/atoms/Button';
import Spinner from '../presentation/atoms/Spinner';
import styles from './CreateExperiencePage.module.css'; /* reutiliza o css */

export default function EditExperiencePage() {
  const { placeId, id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExperiencesByPlace(placeId).then((exps) => {
      setExperience(exps.find((e) => String(e.id) === String(id)) ?? null);
      setLoading(false);
    });
  }, [placeId, id]);

  async function handleSubmit(data) {
    setSaving(true);
    try {
      await updateExperience(placeId, id, data);
      // não navigate aqui — ExperienceForm mostrará o modal de sucesso
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={styles.page}><div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size="lg" /></div></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Button variant="neutral" size="sm" as={Link} to="/perfil">
            ← Voltar ao perfil
          </Button>
        </nav>
        <h1 className={styles.title}>Editar relato</h1>
        <div className={styles.formCard}>
          <ExperienceForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/perfil')}
            loading={saving}
            defaultValues={experience ?? {}}
            successTitle="Avaliação atualizada com sucesso!"
            successText="Suas edições já estão disponíveis no local."
            successPrimary={{ label: 'Voltar ao meu perfil', to: '/perfil' }}
            successSecondary={null}
            errorTitle="Falha ao atualizar avaliação"
            errorText="Revise os dados e tente novamente."
          />
        </div>
      </div>
    </div>
  );
}
