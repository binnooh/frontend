import React from 'react';
import { useNavigate } from 'react-router-dom';

const Screen2_ChooseLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button type="button" className="auth-back" onClick={() => navigate('/select-school')}>
          Change school
        </button>
        <p className="management-eyebrow">School bus</p>
        <h1>How are you signing in?</h1>
        <p>Choose the account type for this school.</p>
        <div className="auth-options">
          <button type="button" onClick={() => navigate('/parent-login')}>
            <strong>Parent</strong>
            <span>View your family information</span>
          </button>
          <button type="button" onClick={() => navigate('/driver-login')}>
            <strong>Driver / Transport Admin</strong>
            <span>Manage school transport</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default Screen2_ChooseLogin;
