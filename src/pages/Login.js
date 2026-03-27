import React, { useState } from 'react';

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (usuario === 'admin' && contrasena === '1234') {
      onLogin();
    } else {
      setError('Usuario o contrasena incorrectos');
    }
  };

  return (
    <div style={{ maxWidth: '340px', margin: '100px auto', padding: '30px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Panel Admin</h2>

      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
      />

      <input
        type="password"
        placeholder="Contrasena"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
      />

      {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer' }}
      >
        Entrar
      </button>
    </div>
  );
}

export default Login;