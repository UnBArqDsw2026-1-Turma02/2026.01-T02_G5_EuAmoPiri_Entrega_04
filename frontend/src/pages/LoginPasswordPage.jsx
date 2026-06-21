import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import styles from './LoginPasswordPage.module.css';

export default function LoginPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

 async function onSubmit(data) {
  setServerError(null);
  try {
    console.log('Solicitando recuperação para:', data.email);
    
    navigate('/recuperar-senha/codigo');
    
  } catch (err) {
    setServerError(err.message ?? 'Erro ao solicitar recuperação de senha.');
  }
}
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.logo}>❤ EuAmoPiri</p>
        
        <h1 className={styles.title}>Recuperar Senha</h1>
        <p className={styles.subtitle}>Digite o seu e-mail cadastrado para receber as instruções de redefinição.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Reutilizando a mesma molécula FormField */}
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

          {serverError && (
            <p className={styles.serverError} role="alert">{serverError}</p>
          )}

          {/* Reutilizando o átomo Button com a classe para o verde oliva */}
          <Button 
            variant="teal" 
            type="submit" 
            fullWidth 
            loading={isSubmitting}
            className={styles.primaryButton}
          >
            Enviar Instruções
          </Button>
        </form>

        <div className={styles.footerLinks}>
          <Link to="/login" className={styles.link}>Voltar para o login</Link>
          <Link to="/cadastro" className={styles.link}>Criar conta</Link>
        </div>
      </div>
    </div>
  );
}