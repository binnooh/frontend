import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errorMessage';
import { getParentProfile, parentLogout } from '../api/parentAuthApi';
import { useAuth } from '../context/AuthContext';
import { ParentUser } from '../types/user';

const Screen4_ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState<ParentUser | null>(
    user?.role === 'parent' ? user : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getParentProfile();
        setProfile(currentUser);
        setUser(currentUser);
      } catch (profileError) {
        setError(getApiErrorMessage(profileError));
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [setUser]);

  const signOut = async () => {
    try {
      await parentLogout();
    } catch (logoutError) {
      window.alert(`Could not contact the logout endpoint: ${getApiErrorMessage(logoutError)}`);
    } finally {
      logout();
      navigate('/select-school', { replace: true });
    }
  };

  return (
    <main className="management-page">
      <header className="management-header">
        <div>
          <p className="management-eyebrow">Parent portal</p>
          <h1>Welcome{profile ? `, ${profile.full_name}` : ''}</h1>
          <p>{profile?.school_name ?? 'Your school'}</p>
        </div>
        <button type="button" className="management-secondary" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>
      <section className="management-panel parent-profile">
        <h2>Your profile</h2>
        {loading && <p className="management-empty">Loading your profile...</p>}
        {error && <p className="management-error" role="alert">Could not load your profile: {error}</p>}
        {profile && (
          <dl>
            <div><dt>Name</dt><dd>{profile.full_name}</dd></div>
            <div><dt>Username</dt><dd>{profile.username}</dd></div>
            <div><dt>Phone</dt><dd>{profile.phone}</dd></div>
            <div><dt>Email</dt><dd>{profile.email || '—'}</dd></div>
            <div><dt>Address</dt><dd>{profile.address || '—'}</dd></div>
            <div><dt>Emergency contact</dt><dd>{profile.emergency_contact_name || '—'}</dd></div>
            <div><dt>Emergency phone</dt><dd>{profile.emergency_contact_phone || '—'}</dd></div>
          </dl>
        )}
      </section>
    </main>
  );
};

export default Screen4_ParentDashboard;
