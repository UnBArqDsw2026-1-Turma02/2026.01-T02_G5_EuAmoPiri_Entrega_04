import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../presentation/atoms/Button';
import styles from './LoginCodePage.module.css';

export default function LoginCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value) && element.value !== '') return false;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // Foca automaticamente no próximo input
    if (element.value !== '' && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Espaço Vazio
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const finalCode = code.join('');
    console.log('Código enviado:', finalCode);

    // Simula validação e avança para a Etapa 3 (Nova Senha)
    setTimeout(() => {
      setLoading(false);
    
      navigate('/recuperar-senha/nova-senha'); 
      
    }, 1000);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        
        <div className={styles.stepsContainer}>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>EMAIL</span>
          </div>
          <div className={styles.stepLineActive}></div>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>CÓDIGO</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.stepItem} ${styles.inactiveStep}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>NOVA SENHA</span>
          </div>
        </div>

        <p className={styles.logo}>❤ EuAmoPiri</p>
        <h1 className={styles.title}>Código de Verificação</h1>
        <p className={styles.subtitle}>
          Caso haja uma conta no e-mail informado será enviado um código de confirmação para fins de verificação de identidade
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>INSIRA O CÓDIGO ENVIADO</label>
          
          <div className={styles.codeGrid}>
            {code.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className={styles.codeInput}
                value={data}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => navigate('/recuperar-senha')}>
              Voltar
            </Button>
            <Button 
              variant="teal" 
              type="submit" 
              loading={loading}
              className={styles.primaryButton}
            >
              Enviar Código
            </Button>
          </div>
        </form>

        <p className={styles.footerText}>
          Código expirado ou não recebeu? <span className={styles.resendLink}>Enviar novo código</span>
        </p>
      </div>
    </div>
  );
}