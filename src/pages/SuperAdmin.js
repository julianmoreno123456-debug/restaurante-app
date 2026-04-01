import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const auth = getAuth();

const saStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .sa-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .sa-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #0d0d0d; }

  /* LOGIN */
  .sa-login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0d0d;
    position: relative;
    overflow: hidden;
  }

  .sa-login-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  .sa-login-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(142,68,173,0.15) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .sa-login-card {
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
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .sa-login-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: rgba(142,68,173,0.2);
    border: 1px solid rgba(142,68,173,0.3);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    color: #c39bd3;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }

  .sa-login-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .sa-login-sub { font-size: 13.5px; color: rgba(255,255,255,0.35); margin-bottom: 28px; font-weight: 300; }

  .sa-input {
    width: 100%;
    padding: 13px 15px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    margin-bottom: 12px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .sa-input::placeholder { color: rgba(255,255,255,0.2); }
  .sa-input:focus { border-color: rgba(142,68,173,0.6); background: rgba(255,255,255,0.08); }

  .sa-error {
    background: rgba(231,76,60,0.1);
    border: 1px solid rgba(231,76,60,0.3);
    border-radius: 10px;
    padding: 10px 14px;
    color: #ff6b6b;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .sa-btn-purple {
    width: 100%;
    padding: 14px;
    background: #8e44ad;
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.2px;
  }
  .sa-btn-purple:hover { opacity: 0.88; transform: translateY(-1px); }
  .sa-btn-purple:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* DASHBOARD */
  .sa-header {
    background: #111;
    padding: 16px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .sa-header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sa-header-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #8e44ad;
    box-shadow: 0 0 8px rgba(142,68,173,0.6);
  }

  .sa-header-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.2px;
  }

  .sa-header-sub { font-size: 12px; color: rgba(255,255,255,0.35); }

  .sa-header-logout {
    padding: 8px 16px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.55);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }
  .sa-header-logout:hover { background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.3); color: #e74c3c; }

  .sa-content { padding: 28px; max-width: 960px; margin: 0 auto; }

  /* STATS */
  .sa-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
  .sa-stat-card {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
  }
  .sa-stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .sa-stat-label { font-size: 12px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }

  /* SECTION HEADER */
  .sa-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .sa-section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }

  /* FORM CARD */
  .sa-form-card {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 18px;
    animation: fadeUp 0.2s ease both;
  }
  .sa-form-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 16px; }
  .sa-form-actions { display: flex; gap: 10px; margin-top: 4px; }

  .sa-btn-cancel {
    flex: 1;
    padding: 12px;
    background: rgba(255,255,255,0.06);
    border: none;
    border-radius: 10px;
    color: rgba(255,255,255,0.4);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .sa-btn-cancel:hover { background: rgba(255,255,255,0.1); }

  /* RESTAURANTE CARD */
  .sa-rest-card {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 12px;
    transition: border-color 0.15s;
  }
  .sa-rest-card:hover { border-color: rgba(255,255,255,0.13); }
  .sa-rest-card.suspendido { opacity: 0.65; }

  .sa-rest-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .sa-rest-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; letter-spacing: -0.2px; }
  .sa-rest-email { font-size: 12.5px; color: rgba(255,255,255,0.35); }
  .sa-rest-fecha { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 2px; }

  .sa-status-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .sa-status-active { background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.25); }
  .sa-status-suspended { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.25); }

  .sa-rest-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .sa-action-btn {
    padding: 9px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
    text-align: center;
  }
  .sa-action-btn:hover { opacity: 0.85; }
  .sa-action-btn-activate { background: rgba(46,204,113,0.15); color: #2ecc71; }
  .sa-action-btn-suspend { background: rgba(231,76,60,0.12); color: #e74c3c; }
  .sa-action-btn-enable { background: rgba(52,152,219,0.12); color: #3498db; }
  .sa-action-btn-disable { background: rgba(230,126,34,0.12); color: #e67e22; }

  .sa-link-row {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .sa-link-row:last-child { margin-bottom: 0; }
  .sa-link-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .sa-link-url { font-size: 12px; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }

  .sa-copy-btn {
    padding: 5px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
    flex-shrink: 0;
    margin-left: 10px;
  }
  .sa-copy-btn:hover { opacity: 0.85; }

  .sa-delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 6px;
    border-radius: 8px;
    transition: background 0.15s;
    margin-left: 10px;
    flex-shrink: 0;
  }
  .sa-delete-btn:hover { background: rgba(231,76,60,0.15); }

  .sa-empty {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 50px;
    text-align: center;
    color: rgba(255,255,255,0.25);
    font-size: 14px;
  }
  .sa-empty-icon { font-size: 40px; margin-bottom: 12px; }
`;

function SuperAdmin() {
  const [logueado, setLogueado] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [restaurantes, setRestaurantes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoRestaurante, setNuevoRestaurante] = useState({ nombre: '', email: '', password: '' });
  const [cargando, setCargando] = useState(false);

  const SUPER_ADMIN_EMAIL = 'julianmoreno123456@gmail.com';

  useEffect(() => {
    if (!logueado) return;
    const unsub = onSnapshot(collection(db, 'restaurantes'), (snap) => {
      setRestaurantes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [logueado]);

  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.email === SUPER_ADMIN_EMAIL) {
        setLogueado(true);
        setError('');
      } else {
        await signOut(auth);
        setError('No tienes permisos de super admin');
      }
    } catch (e) {
      setError('Email o contraseña incorrectos');
    }
  };

  const crearSlug = (nombre) => nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

  const handleCrearRestaurante = async () => {
    if (!nuevoRestaurante.nombre || !nuevoRestaurante.email || !nuevoRestaurante.password) { alert('Completa todos los campos'); return; }
    setCargando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, nuevoRestaurante.email, nuevoRestaurante.password);
      const slug = crearSlug(nuevoRestaurante.nombre);
      await setDoc(doc(db, 'restaurantes', cred.user.uid), {
        nombre: nuevoRestaurante.nombre, email: nuevoRestaurante.email,
        uid: cred.user.uid, slug, fechaCreacion: new Date().toISOString(),
        activo: true, suspendido: false, pedidosHabilitados: true,
      });
      await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password);
      setNuevoRestaurante({ nombre: '', email: '', password: '' });
      setMostrarForm(false);
      alert('Restaurante creado con éxito');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setCargando(false);
  };

  const handleEliminarRestaurante = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este restaurante?')) return;
    await deleteDoc(doc(db, 'restaurantes', id));
  };

  const handleToggleSuspendido = async (r) => {
    await updateDoc(doc(db, 'restaurantes', r.id), { suspendido: !r.suspendido });
  };

  const handleTogglePedidos = async (r) => {
    await updateDoc(doc(db, 'restaurantes', r.id), { pedidosHabilitados: !r.pedidosHabilitados });
  };

  const handleLogout = async () => { await signOut(auth); setLogueado(false); };

  const copiar = (texto) => { navigator.clipboard.writeText(texto); alert('¡Copiado!'); };

  if (!logueado) {
    return (
      <div className="sa-root">
        <style>{saStyles}</style>
        <div className="sa-login">
          <div className="sa-login-grid" />
          <div className="sa-login-glow" />
          <div className="sa-login-card">
            <div className="sa-login-badge">⚡ Super Admin</div>
            <h1 className="sa-login-title">Panel Maestro</h1>
            <p className="sa-login-sub">Solo para administradores autorizados</p>
            <input className="sa-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <input className="sa-input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            {error && <div className="sa-error">⚠️ {error}</div>}
            <button className="sa-btn-purple" onClick={handleLogin}>Entrar →</button>
          </div>
        </div>
      </div>
    );
  }

  const activos = restaurantes.filter(r => !r.suspendido).length;
  const suspendidos = restaurantes.filter(r => r.suspendido).length;

  return (
    <div className="sa-root">
      <style>{saStyles}</style>

      {/* HEADER */}
      <div className="sa-header">
        <div className="sa-header-brand">
          <div className="sa-header-dot" />
          <div>
            <div className="sa-header-title">Panel Maestro — Lovecraft</div>
            <div className="sa-header-sub">{restaurantes.length} restaurantes registrados</div>
          </div>
        </div>
        <button className="sa-header-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
      </div>

      <div className="sa-content">

        {/* STATS */}
        <div className="sa-stats">
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#8e44ad' }}>{restaurantes.length}</div>
            <div className="sa-stat-label">Total</div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#2ecc71' }}>{activos}</div>
            <div className="sa-stat-label">Activos</div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#e74c3c' }}>{suspendidos}</div>
            <div className="sa-stat-label">Suspendidos</div>
          </div>
        </div>

        {/* HEADER SECCIÓN */}
        <div className="sa-section-header">
          <div className="sa-section-title">Restaurantes</div>
          <button className="sa-btn-purple" style={{ width: 'auto', padding: '10px 20px', fontSize: '13.5px' }} onClick={() => setMostrarForm(!mostrarForm)}>
            + Nuevo restaurante
          </button>
        </div>

        {/* FORM CREAR */}
        {mostrarForm && (
          <div className="sa-form-card">
            <div className="sa-form-title">Crear nuevo restaurante</div>
            <input className="sa-input" placeholder="Nombre del restaurante" value={nuevoRestaurante.nombre} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, nombre: e.target.value })} />
            <input className="sa-input" type="email" placeholder="Email del admin" value={nuevoRestaurante.email} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, email: e.target.value })} />
            <input className="sa-input" type="password" placeholder="Contraseña para el admin" value={nuevoRestaurante.password} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, password: e.target.value })} />
            <div className="sa-form-actions">
              <button className="sa-btn-purple" style={{ flex: 1 }} onClick={handleCrearRestaurante} disabled={cargando}>
                {cargando ? 'Creando...' : 'Crear restaurante'}
              </button>
              <button className="sa-btn-cancel" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* LISTA */}
        {restaurantes.length === 0 && (
          <div className="sa-empty">
            <div className="sa-empty-icon">🍽️</div>
            <div>No hay restaurantes aún</div>
          </div>
        )}

        {restaurantes.map((r) => (
          <div key={r.id} className={`sa-rest-card ${r.suspendido ? 'suspendido' : ''}`}>
            <div className="sa-rest-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span className="sa-rest-name">{r.nombre}</span>
                  <span className={`sa-status-badge ${r.suspendido ? 'sa-status-suspended' : 'sa-status-active'}`}>
                    {r.suspendido ? '⛔ Suspendido' : '✅ Activo'}
                  </span>
                </div>
                <div className="sa-rest-email">{r.email}</div>
                <div className="sa-rest-fecha">Creado: {new Date(r.fechaCreacion).toLocaleDateString('es-CO')}</div>
              </div>
              <button className="sa-delete-btn" onClick={() => handleEliminarRestaurante(r.id)}>🗑️</button>
            </div>

            <div className="sa-rest-actions">
              <button
                className={`sa-action-btn ${r.suspendido ? 'sa-action-btn-activate' : 'sa-action-btn-suspend'}`}
                onClick={() => handleToggleSuspendido(r)}
              >
                {r.suspendido ? '✅ Activar restaurante' : '⛔ Suspender restaurante'}
              </button>
              <button
                className={`sa-action-btn ${r.pedidosHabilitados === false ? 'sa-action-btn-enable' : 'sa-action-btn-disable'}`}
                onClick={() => handleTogglePedidos(r)}
              >
                {r.pedidosHabilitados === false ? '🟢 Habilitar pedidos' : '🔴 Deshabilitar pedidos'}
              </button>
            </div>

            <div className="sa-link-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sa-link-label">Página cliente</div>
                <div className="sa-link-url" style={{ color: '#a17bc7' }}>{window.location.origin}/restaurante/{r.slug || r.uid}</div>
              </div>
              <button className="sa-copy-btn" style={{ background: 'rgba(142,68,173,0.2)', color: '#c39bd3' }} onClick={() => copiar(`${window.location.origin}/restaurante/${r.slug || r.uid}`)}>
                Copiar
              </button>
            </div>
            <div className="sa-link-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sa-link-label">Panel admin</div>
                <div className="sa-link-url" style={{ color: '#e8a59c' }}>{window.location.origin}/admin</div>
              </div>
              <button className="sa-copy-btn" style={{ background: 'rgba(231,76,60,0.15)', color: '#e8a59c' }} onClick={() => copiar(`${window.location.origin}/admin`)}>
                Copiar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuperAdmin;
