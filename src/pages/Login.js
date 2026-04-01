import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .login-bg-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(231,76,60,0.12) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .login-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    margin: 24px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 40px;
    backdrop-filter: blur(20px);
    animation: fadeUp 0.5s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .login-logo {
    width: 48px;
    height: 48px;
    background: #e74c3c;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 28px;
  }

  .login-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .login-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 32px;
    font-weight: 300;
  }

  .login-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    display: block;
  }

  .login-input {
    width: 100%;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    margin-bottom: 20px;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }

  .login-input::placeholder { color: rgba(255,255,255,0.2); }
  .login-input:focus {
    border-color: rgba(231,76,60,0.6);
    background: rgba(255,255,255,0.08);
  }

  .login-error {
    background: rgba(231,76,60,0.1);
    border: 1px solid rgba(231,76,60,0.3);
    border-radius: 10px;
    padding: 10px 14px;
    color: #ff6b6b;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .login-btn {
    width: 100%;
    padding: 15px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: opacity 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }

  .login-btn:not(:disabled):hover { opacity: 0.9; transform: translateY(-1px); }
  .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: rgba(255,255,255,0.2);
  }
`;

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
      if (onLogin) onLogin();
      setError('');
    } catch (e) {
      setError('Email o contraseña incorrectos');
    }
    setCargando(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-bg-grid" />
        <div className="login-bg-glow" />
        <div className="login-card">
          <div className="login-logo">🍽️</div>
          <h1 className="login-title">Panel Admin</h1>
          <p className="login-sub">Ingresa con tus credenciales</p>

          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <label className="login-label">Contraseña</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {error && <div className="login-error">⚠️ {error}</div>}

          <button className="login-btn" onClick={handleLogin} disabled={cargando}>
            {cargando ? 'Entrando...' : 'Entrar →'}
          </button>

          <p className="login-footer">Lovecraft © {new Date().getFullYear()}</p>
        </div>
      </div>
    </>
  );
}

export default Login;
