import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
      setError('');
    } catch (e) {
      setError('Email o contrasena incorrectos');
    }
    setCargando(false);
  };

  return (
    <div style={{ maxWidth: '340px', margin: '100px auto', padding: '30px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '18px' }}>Panel Admin</h2>
      <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginBottom: '20px' }}>Ingresa con tus credenciales</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
      />
      <input
        type="password"
        placeholder="Contrasena"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
      />
      {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
      <button
        onClick={handleLogin}
        disabled={cargando}
        style={{ width: '100%', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer' }}
      >
        {cargando ? 'Entrando...' : 'Entrar'}
      </button>
    </div>
  );
}

export default Login;