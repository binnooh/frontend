import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost/schoolbus/backend/src/index.php';

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend response was not OK');
        }
        return response.json();
      })
      .then((data) => {
        setBackendData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header>
        <h1>School Bus Application</h1>
      </header>
      <main>
        <p>Welcome to the School Bus App</p>

        {loading && <p>Loading backend connection...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {backendData && (
          <div>
            <p>Status: {backendData.status}</p>
            <p>Message: {backendData.message}</p>
            <pre>{JSON.stringify(backendData, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
