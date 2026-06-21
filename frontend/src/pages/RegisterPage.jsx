import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('turista');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    //etapa de cadastro 1
    console.log('Dados da Etapa 1:', { ...data, accountType });
    
    //etapa de cadastro 2
    navigate('/cadastro/seguranca');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        
        <p className={styles.logo}>❤ EuAmoPiri</p>
        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.subtitle}>Junte-se à comunidade de viajantes apaixonados por Pirenópolis</p>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
          <span className={styles.progressText}>ETAPA 1 DE 3: INFORMAÇÕES BÁSICAS</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          
          <div className={styles.accountTypeSection}>
            <label className={styles.label}>TIPO DE CONTA</label>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${accountType === 'turista' ? styles.activeToggle : ''}`}
                onClick={() => setAccountType('turista')}
              >
                Turista
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${accountType === 'morador' ? styles.activeToggle : ''}`}
                onClick={() => setAccountType('morador')}
              >
                Morador
              </button>
            </div>
          </div>

          <FormField
            id="fullName"
            label="NOME COMPLETO"
            type="text"
            placeholder="Seu nome completo"
            registration={register('fullName', { required: 'Nome completo é obrigatório' })}
            error={errors.fullName?.message}
          />

          <FormField
            id="email"
            label="EMAIL"
            type="email"
            placeholder="seu@email.com"
            registration={register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' },
            })}
            error={errors.email?.message}
          />

          <FormField
            id="birthDate"
            label="DATA DE NASCIMENTO"
            type="date"
            registration={register('birthDate', { required: 'Data de nascimento é obrigatória' })}
            error={errors.birthDate?.message}
          />

          <FormField
            id="phone"
            label="TELEFONE"
            type="tel"
            placeholder="(XX) XXXXX-XXXX"
            registration={register('phone', { required: 'Telefone é obrigatório' })}
            error={errors.phone?.message}
          />

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => navigate('/login')}>
              Cancelar
            </Button>
            <Button variant="teal" type="submit" loading={isSubmitting}>
              Próximo
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}