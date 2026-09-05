import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HeartPulse } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import registerImage from '../assets/register-veterinaria.png';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { getErrorMessage } from '../services/api';
import PageState from '../components/PageState';

type LoginData = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const { login, usuario, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <PageState type="loading" message="Verificando sesión…" />;
  if (usuario) return <Navigate to={usuario.rol === 'Administrador' ? '/admin' : '/'} replace />;

  const submit = async (data: LoginData) => {
    try {
      setError('');
      setSubmitting(true);
      const loggedUser = await login(data.email, data.password);
      navigate(loggedUser.rol === 'Administrador' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'El email o la contraseña son incorrectos.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="login-panel">
        <div className="login-image-wrap">
          <img
            className="login-image"
            src={registerImage}
            alt="Equipo veterinario con mascotas"
          />
          <div className="login-image-caption">
            <HeartPulse aria-hidden="true" />
            <span>Cuidamos a quienes más querés</span>
          </div>
        </div>

        <form className="auth-card login-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="brand mark"><HeartPulse aria-hidden="true" /> PetCare</div>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresá para cuidar mejor a quienes más querés.</p>

          {error && (
            <div className="alert" role="alert">{error}</div>
          )}

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nombre@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email', {
                required: 'Ingresá tu email',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Ingresá un email válido con dominio completo (ej: usuario@gmail.com)',
                },
              })}
            />
          </label>
          {errors.email && <small id="email-error" className="field-error">{errors.email.message}</small>}

          <label htmlFor="password">
            Contraseña
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password', { required: 'Ingresá tu contraseña' })}
            />
          </label>
          {errors.password && <small id="password-error" className="field-error">{errors.password.message}</small>}

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <p className="center">
            ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
