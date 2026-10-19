import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverLogout, getDriverProfile } from '../api/driverAuthApi';
import {
  createParent,
  deleteParent,
  getParent,
  getParents,
  ParentPayload,
  updateParent,
} from '../api/parentsApi';
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  StudentPayload,
  updateStudent,
} from '../api/studentsApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { useAuth } from '../context/AuthContext';
import { ParentRecord, StudentRecord } from '../types/management';
import { DriverUser } from '../types/user';

type Section = 'parents' | 'students';

interface PageState {
  current: number;
  last: number;
  total: number;
}

const initialPage: PageState = { current: 1, last: 1, total: 0 };
const pageSizes = [5, 10, 25, 50];

const Screen4_DriverDashboard: React.FC = () => {
  const [section, setSection] = useState<Section>('parents');
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState<DriverUser | null>(
    user?.role === 'driver' ? user : null
  );
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getDriverProfile();
        setProfile(currentUser);
        setUser(currentUser);
      } catch (error) {
        setProfileError(getApiErrorMessage(error));
      }
    };
    void loadProfile();
  }, [setUser]);

  const signOut = async () => {
    try {
      await driverLogout();
    } catch (error) {
      window.alert(`Could not contact the logout endpoint: ${getApiErrorMessage(error)}`);
    } finally {
      logout();
      navigate('/select-school', { replace: true });
    }
  };

  return (
    <main className="management-page">
      <header className="management-header">
        <div>
          <p className="management-eyebrow">School bus administration</p>
          <h1>People</h1>
          <p>{profile?.school_name ?? 'Manage the parents and students in your school.'}</p>
        </div>
        <div className="management-account">
          <span>{profile?.full_name ?? 'Loading profile...'}</span>
          <button type="button" className="management-secondary" onClick={() => void signOut()}>Sign out</button>
        </div>
      </header>
      {profileError && <p className="management-error" role="alert">Could not load your profile: {profileError}</p>}
      <nav className="management-tabs" aria-label="People management">
        <button
          type="button"
          className={section === 'parents' ? 'management-tab active' : 'management-tab'}
          onClick={() => setSection('parents')}
        >
          Parents
        </button>
        <button
          type="button"
          className={section === 'students' ? 'management-tab active' : 'management-tab'}
          onClick={() => setSection('students')}
        >
          Students
        </button>
      </nav>
      {section === 'parents' ? <ParentManagement /> : <StudentManagement />}
    </main>
  );
};

interface RecordListProps {
  page: PageState;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const RecordListFooter: React.FC<RecordListProps> = ({
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => (
  <div className="management-pagination">
    <span>
      {page.total} record{page.total === 1 ? '' : 's'}
    </span>
    <label>
      Per page
      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        {pageSizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
    <div className="pagination-buttons">
      <button type="button" disabled={page.current <= 1} onClick={() => onPageChange(page.current - 1)}>
        Previous
      </button>
      <span>
        Page {page.current} of {page.last}
      </span>
      <button
        type="button"
        disabled={page.current >= page.last}
        onClick={() => onPageChange(page.current + 1)}
      >
        Next
      </button>
    </div>
  </div>
);

interface ParentFormState {
  full_name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
}

const emptyParentForm: ParentFormState = {
  full_name: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  is_active: true,
};

const ParentManagement: React.FC = () => {
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [page, setPage] = useState<PageState>(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<ParentFormState | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getParents({ search, per_page: pageSize, page: page.current });
      setParents(result.data);
      setPage({
        current: result.current_page,
        last: result.last_page,
        total: result.total,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page.current, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage((current) => ({ ...current, current: 1 }));
  };

  const startEdit = async (id: number) => {
    setError('');
    try {
      const parent = await getParent(id);
      setEditingId(id);
      setForm({
        full_name: parent.full_name,
        phone: parent.phone,
        email: parent.email ?? '',
        username: parent.username ?? '',
        password: '',
        address: parent.address ?? '',
        emergency_contact_name: parent.emergency_contact_name ?? '',
        emergency_contact_phone: parent.emergency_contact_phone ?? '',
        is_active: Boolean(parent.is_active),
      });
    } catch (editError) {
      setError(getApiErrorMessage(editError));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    const payload: ParentPayload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      username: form.username.trim() || null,
      address: form.address.trim() || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;

    try {
      if (editingId === null) await createParent(payload);
      else await updateParent(editingId, payload);
      setForm(null);
      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (parent: ParentRecord) => {
    if (!window.confirm(`Delete ${parent.full_name}?`)) return;
    setError('');
    try {
      await deleteParent(parent.id);
      if (parents.length === 1 && page.current > 1) {
        setPage((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await load();
      }
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  };

  const updateForm = <K extends keyof ParentFormState>(key: K, value: ParentFormState[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  return (
    <section className="management-panel">
      <div className="management-toolbar">
        <div>
          <h2>Parents</h2>
          <p>Contact details and account status.</p>
        </div>
        <button
          type="button"
          className="management-primary"
          onClick={() => {
            setEditingId(null);
            setForm({ ...emptyParentForm });
            setError('');
          }}
        >
          Add parent
        </button>
      </div>

      {form && (
        <form className="management-form" onSubmit={submit}>
          <h3>{editingId === null ? 'Add parent' : 'Edit parent'}</h3>
          <div className="management-form-grid">
            <label>Full name<input required maxLength={255} value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} /></label>
            <label>Phone<input required maxLength={20} pattern="[0-9]+" title="Enter digits only" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} /></label>
            <label>Email<input type="email" maxLength={255} value={form.email} onChange={(e) => updateForm('email', e.target.value)} /></label>
            <label>Username<input maxLength={255} value={form.username} onChange={(e) => updateForm('username', e.target.value)} /></label>
            <label>Password<input type="password" minLength={6} maxLength={255} autoComplete="new-password" placeholder={editingId === null ? 'Optional' : 'Leave blank to keep current'} value={form.password} onChange={(e) => updateForm('password', e.target.value)} /></label>
            <label>Emergency contact<input maxLength={255} value={form.emergency_contact_name} onChange={(e) => updateForm('emergency_contact_name', e.target.value)} /></label>
            <label>Emergency phone<input maxLength={20} value={form.emergency_contact_phone} onChange={(e) => updateForm('emergency_contact_phone', e.target.value)} /></label>
            <label className="management-wide">Address<textarea value={form.address} onChange={(e) => updateForm('address', e.target.value)} /></label>
            <label className="management-checkbox"><input type="checkbox" checked={form.is_active} onChange={(e) => updateForm('is_active', e.target.checked)} /> Active</label>
          </div>
          <div className="management-form-actions">
            <button type="button" className="management-secondary" onClick={() => setForm(null)}>Cancel</button>
            <button type="submit" className="management-primary" disabled={saving}>{saving ? 'Saving…' : 'Save parent'}</button>
          </div>
        </form>
      )}

      <div className="management-search">
        <label htmlFor="parent-search">Search parents</label>
        <input id="parent-search" type="search" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Name, phone, or email" />
      </div>
      {error && <p className="management-error" role="alert">{error}</p>}
      {loading ? <p className="management-empty">Loading parents…</p> : (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {parents.map((parent) => (
                <tr key={parent.id}>
                  <td><strong>{parent.full_name}</strong><small>ID: {parent.id}</small></td>
                  <td>{parent.phone}</td>
                  <td>{parent.email || '—'}</td>
                  <td><span className={parent.is_active ? 'management-status active' : 'management-status'}>{parent.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="management-row-actions">
                    <button type="button" onClick={() => void startEdit(parent.id)}>Edit</button>
                    <button type="button" className="management-delete" onClick={() => void remove(parent)}>Delete</button>
                  </td>
                </tr>
              ))}
              {parents.length === 0 && <tr><td colSpan={5} className="management-empty">No parents found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <RecordListFooter
        page={page}
        pageSize={pageSize}
        onPageChange={(current) => setPage((value) => ({ ...value, current }))}
        onPageSizeChange={(size) => { setPageSize(size); setPage((value) => ({ ...value, current: 1 })); }}
      />
    </section>
  );
};

interface StudentFormState {
  admission_no: string;
  full_name: string;
  parent_id: string;
  class_section_id: string;
  pickup_address: string;
  drop_address: string;
  is_active: boolean;
}

const emptyStudentForm: StudentFormState = {
  admission_no: '',
  full_name: '',
  parent_id: '',
  class_section_id: '',
  pickup_address: '',
  drop_address: '',
  is_active: true,
};

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [page, setPage] = useState<PageState>(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<StudentFormState | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getStudents({ search, per_page: pageSize, page: page.current });
      setStudents(result.data);
      setPage({
        current: result.current_page,
        last: result.last_page,
        total: result.total,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page.current, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage((current) => ({ ...current, current: 1 }));
  };

  const startEdit = async (id: number) => {
    setError('');
    try {
      const student = await getStudent(id);
      setEditingId(id);
      setForm({
        admission_no: student.admission_no ?? '',
        full_name: student.full_name,
        parent_id: String(student.parent_id),
        class_section_id: String(student.class_section_id),
        pickup_address: student.pickup_address ?? '',
        drop_address: student.drop_address ?? '',
        is_active: Boolean(student.is_active),
      });
    } catch (editError) {
      setError(getApiErrorMessage(editError));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    const payload: StudentPayload = {
      admission_no: form.admission_no.trim() || null,
      full_name: form.full_name.trim(),
      parent_id: Number(form.parent_id),
      class_section_id: Number(form.class_section_id),
      pickup_address: form.pickup_address.trim() || null,
      drop_address: form.drop_address.trim() || null,
      is_active: form.is_active,
    };

    try {
      if (editingId === null) await createStudent(payload);
      else await updateStudent(editingId, payload);
      setForm(null);
      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (student: StudentRecord) => {
    if (!window.confirm(`Delete ${student.full_name}?`)) return;
    setError('');
    try {
      await deleteStudent(student.id);
      if (students.length === 1 && page.current > 1) {
        setPage((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await load();
      }
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  };

  const updateForm = <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  return (
    <section className="management-panel">
      <div className="management-toolbar">
        <div>
          <h2>Students</h2>
          <p>Student records, class assignment, and pickup details.</p>
        </div>
        <button
          type="button"
          className="management-primary"
          onClick={() => {
            setEditingId(null);
            setForm({ ...emptyStudentForm });
            setError('');
          }}
        >
          Add student
        </button>
      </div>

      {form && (
        <form className="management-form" onSubmit={submit}>
          <h3>{editingId === null ? 'Add student' : 'Edit student'}</h3>
          <div className="management-form-grid">
            <label>Full name<input required maxLength={255} value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} /></label>
            <label>Admission number<input maxLength={255} value={form.admission_no} onChange={(e) => updateForm('admission_no', e.target.value)} /></label>
            <label>Parent ID<input type="number" required min="1" step="1" value={form.parent_id} onChange={(e) => updateForm('parent_id', e.target.value)} /><small>Use the ID shown in the Parents list.</small></label>
            <label>Class / section ID<input type="number" required min="1" step="1" value={form.class_section_id} onChange={(e) => updateForm('class_section_id', e.target.value)} /><small>Use the class-section ID configured in the backend.</small></label>
            <label>Pickup address<textarea value={form.pickup_address} onChange={(e) => updateForm('pickup_address', e.target.value)} /></label>
            <label>Drop-off address<textarea value={form.drop_address} onChange={(e) => updateForm('drop_address', e.target.value)} /></label>
            <label className="management-checkbox"><input type="checkbox" checked={form.is_active} onChange={(e) => updateForm('is_active', e.target.checked)} /> Active</label>
          </div>
          <div className="management-form-actions">
            <button type="button" className="management-secondary" onClick={() => setForm(null)}>Cancel</button>
            <button type="submit" className="management-primary" disabled={saving}>{saving ? 'Saving…' : 'Save student'}</button>
          </div>
        </form>
      )}

      <div className="management-search">
        <label htmlFor="student-search">Search students</label>
        <input id="student-search" type="search" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Name, admission number, or class" />
      </div>
      {error && <p className="management-error" role="alert">{error}</p>}
      {loading ? <p className="management-empty">Loading students…</p> : (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead><tr><th>Student</th><th>Parent</th><th>Class / section</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td><strong>{student.full_name}</strong><small>{student.admission_no || `ID: ${student.id}`}</small></td>
                  <td>{student.parent?.full_name || `Parent #${student.parent_id}`}</td>
                  <td>{student.class_section?.display_name || [student.class_name, student.section].filter(Boolean).join(' - ') || `Class section #${student.class_section_id}`}</td>
                  <td><span className={student.is_active ? 'management-status active' : 'management-status'}>{student.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="management-row-actions">
                    <button type="button" onClick={() => void startEdit(student.id)}>Edit</button>
                    <button type="button" className="management-delete" onClick={() => void remove(student)}>Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan={5} className="management-empty">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <RecordListFooter
        page={page}
        pageSize={pageSize}
        onPageChange={(current) => setPage((value) => ({ ...value, current }))}
        onPageSizeChange={(size) => { setPageSize(size); setPage((value) => ({ ...value, current: 1 })); }}
      />
    </section>
  );
};

export default Screen4_DriverDashboard;
