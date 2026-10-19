import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSchool, getSchools } from '../api/schoolApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { useAuth } from '../context/AuthContext';
import { School } from '../types/school';

const Screen1_SelectSchool: React.FC = () => {
  const navigate = useNavigate();
  const { setSchoolId } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getSchools();
        if (!response.data) {
          throw new Error(response.message ?? 'The school list was empty.');
        }
        setSchools(response.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const visibleSchools = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return schools;
    return schools.filter((school) =>
      `${school.school_name} ${school.school_code}`.toLowerCase().includes(normalized)
    );
  }, [schools, search]);

  const chooseSchool = async (school: School) => {
    setSelectedId(school.id);
    setError('');
    try {
      const response = await checkSchool(String(school.id));
      if (!response.data) {
        throw new Error(response.message ?? 'School details were not returned.');
      }
      if (!response.data.can_login) {
        throw new Error('Login is not available for this school yet.');
      }
      setSchoolId(String(school.id));
      navigate('/choose-login');
    } catch (selectError) {
      setError(getApiErrorMessage(selectError));
    } finally {
      setSelectedId(null);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card school-card">
        <p className="management-eyebrow">School bus</p>
        <h1>Select your school</h1>
        <p>Choose your school to continue to sign in.</p>
        <label className="management-search">
          Search by school name or code
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search schools" />
        </label>
        {error && <p className="management-error" role="alert">{error}</p>}
        {loading ? <p className="management-empty">Loading schools...</p> : (
          <div className="school-list">
            {visibleSchools.map((school) => (
              <button
                type="button"
                key={school.id}
                disabled={selectedId !== null || !school.can_login}
                onClick={() => void chooseSchool(school)}
              >
                <span><strong>{school.school_name}</strong><small>{school.school_code}</small></span>
                <span>{selectedId === school.id ? 'Checking...' : school.can_login ? 'Continue' : 'Unavailable'}</span>
              </button>
            ))}
            {visibleSchools.length === 0 && <p className="management-empty">No schools found.</p>}
          </div>
        )}
      </section>
    </main>
  );
};

export default Screen1_SelectSchool;
