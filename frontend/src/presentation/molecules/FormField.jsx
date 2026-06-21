/**
 * MOLÉCULA — FormField
 *
 * Combina Label + Input (ou Textarea) em um bloco coeso de formulário.
 * Integra com React Hook Form via prop `registration` (retorno de register()).
 *
 * Uso:
 *   const { register, formState: { errors } } = useForm();
 *   <FormField
 *     id="email"
 *     label="E-mail"
 *     type="email"
 *     registration={register('email', { required: 'Campo obrigatório' })}
 *     error={errors.email?.message}
 *   />
 *
 * Reutilizado em: LoginPage, SignupPage, CreatePlacePage, ExperienceForm.
 */
import Input from '../atoms/Input';
import Textarea from '../atoms/Textarea';
import styles from './FormField.module.css';

export default function FormField({
  id,
  label,
  type = 'text',
  multiline = false,
  placeholder,
  error,
  registration = {},
  watch,
  icon,
  rows,
  maxLength,
  className = '',
}) {
  let currentLength = 0;
  if (multiline && maxLength && watch && registration?.name) {
    const value = watch(registration.name);
    currentLength = typeof value === 'string' ? value.length : 0;
  }

  return (
    <div className={[styles.field, className].join(' ').trim()}>
      {multiline ? (
        <Textarea
          id={id}
          label={label}
          placeholder={placeholder}
          error={error}
          rows={rows}
          maxLength={maxLength}
          currentLength={currentLength}
          {...registration}
        />
      ) : (
        <Input
          id={id}
          label={label}
          type={type}
          placeholder={placeholder}
          error={error}
          icon={icon}
          {...registration}
        />
      )}
    </div>
  );
}
