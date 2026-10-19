import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverLogin } from '../api/driverAuthApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { parentLogin } from '../api/parentAuthApi';
import { useAuth } from '../context/AuthContext';
import { AuthUser } from '../types/user';

interface LoginFormProps {
  role: 'parent' | 'driver';
}

const LoginForm: React.FC<LoginFormProps> = ({ role }) => {
  const { schoolId, setSchoolId, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!schoolId) {
    return (
      <section className="auth-card">
        <h1>Select a school first</h1>
        <p>Your selected school is needed to sign in.</p>
        <button className="management-primary" type="button" onClick={() => navigate('/select-school')}>
          Choose school
        </button>
      </section>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { school_id: Number(schoolId), username: username.trim(), password };
      const session = role === 'parent'
        ? await parentLogin(payload)
        : await driverLogin(payload);
      const user: AuthUser = session.data;
      setSchoolId(String(user.school_id));
      setToken(session.token);
      setUser(user);
      navigate(role === 'parent' ? '/parent-dashboard' : '/driver-dashboard', { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <button type="button" className="auth-back" onClick={() => navigate('/choose-login')}>
        Back to account type
      </button>
      <p className="management-eyebrow">School bus</p>
      <h1>{role === 'parent' ? 'Parent login' : 'Driver / transport admin login'}</h1>
      <form className="management-form auth-form" onSubmit={submit}>
        <label>Username<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="management-error" role="alert">{error}</p>}
        <button className="management-primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};

export default LoginForm;
