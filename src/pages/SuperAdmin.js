import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const auth = getAuth();

const saStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .sa-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .sa-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #0d0d0d; }

  .sa-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0d0d0d; position: relative; overflow: hidden; }
  .sa-login-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 44px 44px; }
  .sa-login-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(142,68,173,0.15) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
  .sa-login-card { position: relative; z-index: 1; width: 100%; max-width: 400px; margin: 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; backdrop-filter: blur(20px); animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .sa-login-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(142,68,173,0.2); border: 1px solid rgba(142,68,173,0.3); border-radius: 20px; font-size: 11px; font-weight: 600; color: #c39bd3; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
  .sa-login-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
  .sa-login-sub { font-size: 13.5px; color: rgba(255,255,255,0.35); margin-bottom: 28px; font-weight: 300; }
  .sa-error { background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.3); border-radius: 10px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 14px; }
  .sa-input { width: 100%; padding: 13px 15px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; margin-bottom: 12px; outline: none; transition: border-color 0.15s, background 0.15s; }
  .sa-input::placeholder { color: rgba(255,255,255,0.2); }
  .sa-input:focus { border-color: rgba(142,68,173,0.6); background: rgba(255,255,255,0.08); }

  .sa-header { background: #111; padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sa-header-brand { display: flex; align-items: center; gap: 12px; }
  .sa-header-dot { width: 10px; height: 10px; border-radius: 50%; background: #8e44ad; box-shadow: 0 0 8px rgba(142,68,173,0.6); }
  .sa-header-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .sa-header-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
  .sa-header-logout { padding: 8px 16px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.55); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .sa-header-logout:hover { background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.3); color: #e74c3c; }

  .sa-nav { background: #111; padding: 0 28px; display: flex; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); overflow-x: auto; scrollbar-width: none; }
  .sa-nav::-webkit-scrollbar { display: none; }
  .sa-nav-tab { padding: 14px 18px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: rgba(255,255,255,0.35); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
  .sa-nav-tab:hover { color: rgba(255,255,255,0.7); }
  .sa-nav-tab.active { color: #fff; border-bottom-color: #8e44ad; }
  .sa-nav-badge { padding: 1px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; }

  .sa-content { padding: 28px; max-width: 960px; margin: 0 auto; }

  .sa-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .sa-stat-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; text-align: center; }
  .sa-stat-num { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .sa-stat-label { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.6px; }

  .sa-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .sa-section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }

  .sa-btn-purple { padding: 10px 20px; background: #8e44ad; color: white; border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.2px; }
  .sa-btn-purple:hover { opacity: 0.88; transform: translateY(-1px); }
  .sa-btn-purple:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .sa-btn-purple.full { width: 100%; padding: 14px; font-size: 15px; }
  .sa-btn-cancel { flex: 1; padding: 12px; background: rgba(255,255,255,0.06); border: none; border-radius: 10px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
  .sa-btn-cancel:hover { background: rgba(255,255,255,0.1); }

  .sa-form-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px; margin-bottom: 18px; animation: fadeUp 0.2s ease both; }
  .sa-form-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 16px; }
  .sa-form-actions { display: flex; gap: 10px; margin-top: 4px; }

  .sa-rest-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; margin-bottom: 12px; transition: border-color 0.15s; }
  .sa-rest-card:hover { border-color: rgba(255,255,255,0.13); }
  .sa-rest-card.suspendido { opacity: 0.65; }
  .sa-rest-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .sa-rest-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .sa-rest-email { font-size: 12.5px; color: rgba(255,255,255,0.35); }
  .sa-rest-fecha { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 2px; }

  .sa-status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .sa-status-active { background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.25); }
  .sa-status-suspended { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.25); }

  .sa-rest-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .sa-action-btn { padding: 9px; border-radius: 10px; border: none; cursor: pointer; font-size: 12.5px; font-weight: 500; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; text-align: center; }
  .sa-action-btn:hover { opacity: 0.85; }
  .sa-action-btn-activate { background: rgba(46,204,113,0.15); color: #2ecc71; }
  .sa-action-btn-suspend { background: rgba(231,76,60,0.12); color: #e74c3c; }
  .sa-action-btn-enable { background: rgba(52,152,219,0.12); color: #3498db; }
  .sa-action-btn-disable { background: rgba(230,126,34,0.12); color: #e67e22; }
  .sa-action-btn-prueba { background: rgba(230,126,34,0.12); color: #e67e22; }
  .sa-action-btn-noprueba { background: rgba(52,152,219,0.12); color: #3498db; }

  .sa-link-row { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .sa-link-row:last-child { margin-bottom: 0; }
  .sa-link-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .sa-link-url { font-size: 12px; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
  .sa-copy-btn { padding: 5px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 11.5px; font-weight: 500; font-family: 'DM Sans', sans-serif; flex-shrink: 0; margin-left: 10px; }
  .sa-copy-btn:hover { opacity: 0.85; }
  .sa-delete-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 8px; transition: background 0.15s; margin-left: 8px; flex-shrink: 0; }
  .sa-delete-btn:hover { background: rgba(231,76,60,0.15); }

  .sa-pedido-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; margin-bottom: 12px; }
  .sa-pedido-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 12px; }
  .sa-pedido-nombre { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .sa-pedido-meta { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 2px; }
  .sa-pedido-rest { font-size: 11px; color: #a17bc7; margin-top: 4px; }
  .sa-pedido-estado { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .sa-pedido-items { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; }
  .sa-pedido-item-row { display: flex; justify-content: space-between; font-size: 12.5px; color: rgba(255,255,255,0.5); padding: 3px 0; }
  .sa-pedido-total { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; color: #fff; padding-top: 8px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); }
  .sa-pedido-fecha { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 8px; }

  .sa-filter-bar { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
  .sa-filter-btn { padding: 7px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .sa-filter-btn:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }
  .sa-filter-btn.active { background: rgba(142,68,173,0.2); border-color: rgba(142,68,173,0.4); color: #c39bd3; }

  .sa-search { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; outline: none; margin-bottom: 16px; transition: border-color 0.15s; }
  .sa-search::placeholder { color: rgba(255,255,255,0.2); }
  .sa-search:focus { border-color: rgba(142,68,173,0.5); }

  .sa-empty { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 50px; text-align: center; color: rgba(255,255,255,0.25); font-size: 14px; }
  .sa-empty-icon { font-size: 40px; margin-bottom: 12px; }

  .sa-info-bar { background: rgba(230,126,34,0.08); border: 1px solid rgba(230,126,34,0.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; color: rgba(255,255,255,0.45); display: flex; align-items: flex-start; gap: 8px; }

  @media (max-width: 600px) {
    .sa-stats { grid-template-columns: repeat(2, 1fr); }
    .sa-content { padding: 16px; }
    .sa-header { padding: 14px 16px; }
    .sa-nav { padding: 0 16px; }
  }
`;

function SuperAdmin() {
  const [logueado, setLogueado] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [restaurantes, setRestaurantes] = useState([]);
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoRestaurante, setNuevoRestaurante] = useState({ nombre: '', email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('activos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroPedido, setFiltroPedido] = useState('todos');

  const SUPER_ADMIN_EMAIL = 'julianmoreno123456@gmail.com';

  useEffect(() => {
    if (!logueado) return;
    const unsub = onSnapshot(collection(db, 'restaurantes'), (snap) => {
      setRestaurantes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [logueado]);

  useEffect(() => {
    if (!logueado) return;
    const pedidosPorRest = {};
    let unsubRests;

    unsubRests = onSnapshot(collection(db, 'restaurantes'), (snapRest) => {
      const rests = snapRest.docs.map((d) => ({ id: d.id, ...d.data() }));
      const unsubs = rests.map((r) =>
        onSnapshot(collection(db, `restaurantes/${r.id}/pedidos`), (snapPed) => {
          pedidosPorRest[r.id] = snapPed.docs.map((d) => ({
            id: d.id, ...d.data(),
            restauranteNombre: r.nombre,
            restauranteId: r.id,
          }));
          const todos = Object.values(pedidosPorRest).flat();
          todos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setTodosPedidos([...todos]);
        })
      );
      return () => unsubs.forEach((u) => u());
    });

    return () => unsubRests && unsubRests();
  }, [logueado]);

  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.email === SUPER_ADMIN_EMAIL) { setLogueado(true); setError(''); }
      else { await signOut(auth); setError('No tienes permisos de super admin'); }
    } catch (e) { setError('Email o contraseña incorrectos'); }
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
        activo: true, suspendido: false, pedidosHabilitados: true, prueba: false,
      });
      await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password);
      setNuevoRestaurante({ nombre: '', email: '', password: '' });
      setMostrarForm(false);
      alert('Restaurante creado con éxito');
    } catch (e) { alert('Error: ' + e.message); }
    setCargando(false);
  };

  const handleEliminarRestaurante = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este restaurante?')) return;
    await deleteDoc(doc(db, 'restaurantes', id));
  };

  const handleToggleSuspendido = async (r) => await updateDoc(doc(db, 'restaurantes', r.id), { suspendido: !r.suspendido });
  const handleTogglePedidos = async (r) => await updateDoc(doc(db, 'restaurantes', r.id), { pedidosHabilitados: !r.pedidosHabilitados });
  const handleTogglePrueba = async (r) => await updateDoc(doc(db, 'restaurantes', r.id), { prueba: !r.prueba });
  const handleLogout = async () => { await signOut(auth); setLogueado(false); };
  const copiar = (texto) => { navigator.clipboard.writeText(texto); alert('¡Copiado!'); };

  const activos = restaurantes.filter(r => !r.suspendido && !r.prueba);
  const suspendidos = restaurantes.filter(r => r.suspendido);
  const prueba = restaurantes.filter(r => r.prueba && !r.suspendido);

  const filtrarRests = (lista) => {
    if (!busqueda) return lista;
    const q = busqueda.toLowerCase();
    return lista.filter(r => r.nombre?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
  };

  const pedidosFiltrados = todosPedidos.filter(p => {
    if (filtroPedido !== 'todos' && p.estado !== filtroPedido) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return p.nombre?.toLowerCase().includes(q) || p.restauranteNombre?.toLowerCase().includes(q) || String(p.numeroPedido).includes(q);
    }
    return true;
  });

  const getEstadoStyle = (estado) => {
    if (estado === 'pendiente') return { background: 'rgba(249,168,37,0.15)', color: '#f9a825' };
    if (estado === 'preparando') return { background: 'rgba(33,150,243,0.15)', color: '#42a5f5' };
    if (estado === 'en camino') return { background: 'rgba(46,204,113,0.15)', color: '#2ecc71' };
    return { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' };
  };

  const navTabs = [
    { key: 'activos', icon: '✅', label: 'Activos', count: activos.length, badgeBg: 'rgba(46,204,113,0.2)', badgeColor: '#2ecc71' },
    { key: 'suspendidos', icon: '⛔', label: 'Suspendidos', count: suspendidos.length, badgeBg: 'rgba(231,76,60,0.2)', badgeColor: '#e74c3c' },
    { key: 'prueba', icon: '🧪', label: 'Prueba', count: prueba.length, badgeBg: 'rgba(230,126,34,0.2)', badgeColor: '#e67e22' },
    { key: 'pedidos', icon: '📋', label: 'Pedidos', count: todosPedidos.length, badgeBg: 'rgba(142,68,173,0.2)', badgeColor: '#c39bd3' },
  ];

  const RestCard = ({ r }) => (
    <div className={`sa-rest-card ${r.suspendido ? 'suspendido' : ''}`}>
      <div className="sa-rest-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span className="sa-rest-name">{r.nombre}</span>
            <span className={`sa-status-badge ${r.suspendido ? 'sa-status-suspended' : 'sa-status-active'}`}>
              {r.suspendido ? '⛔ Suspendido' : '✅ Activo'}
            </span>
            {r.prueba && <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'rgba(230,126,34,0.15)', color: '#e67e22', border: '1px solid rgba(230,126,34,0.25)' }}>🧪 Prueba</span>}
            {r.pedidosHabilitados === false && <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>📵 Sin pedidos</span>}
          </div>
          <div className="sa-rest-email">{r.email}</div>
          <div className="sa-rest-fecha">Creado: {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-CO') : '—'}</div>
        </div>
        <button className="sa-delete-btn" onClick={() => handleEliminarRestaurante(r.id)}>🗑️</button>
      </div>

      <div className="sa-rest-actions">
        <button className={`sa-action-btn ${r.suspendido ? 'sa-action-btn-activate' : 'sa-action-btn-suspend'}`} onClick={() => handleToggleSuspendido(r)}>
          {r.suspendido ? '✅ Activar' : '⛔ Suspender'}
        </button>
        <button className={`sa-action-btn ${r.pedidosHabilitados === false ? 'sa-action-btn-enable' : 'sa-action-btn-disable'}`} onClick={() => handleTogglePedidos(r)}>
          {r.pedidosHabilitados === false ? '🟢 Habilitar pedidos' : '🔴 Deshabilitar pedidos'}
        </button>
        <button className={`sa-action-btn ${r.prueba ? 'sa-action-btn-noprueba' : 'sa-action-btn-prueba'}`} style={{ gridColumn: '1 / -1' }} onClick={() => handleTogglePrueba(r)}>
          {r.prueba ? '🔄 Quitar modo prueba' : '🧪 Marcar como prueba'}
        </button>
      </div>

      <div className="sa-link-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sa-link-label">Página cliente</div>
          <div className="sa-link-url" style={{ color: '#a17bc7' }}>{window.location.origin}/restaurante/{r.slug || r.uid}</div>
        </div>
        <button className="sa-copy-btn" style={{ background: 'rgba(142,68,173,0.2)', color: '#c39bd3' }} onClick={() => copiar(`${window.location.origin}/restaurante/${r.slug || r.uid}`)}>Copiar</button>
      </div>
      <div className="sa-link-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sa-link-label">Panel admin</div>
          <div className="sa-link-url" style={{ color: '#e8a59c' }}>{window.location.origin}/admin</div>
        </div>
        <button className="sa-copy-btn" style={{ background: 'rgba(231,76,60,0.15)', color: '#e8a59c' }} onClick={() => copiar(`${window.location.origin}/admin`)}>Copiar</button>
      </div>
    </div>
  );

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
            <button className="sa-btn-purple full" onClick={handleLogin}>Entrar →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-root">
      <style>{saStyles}</style>

      <div className="sa-header">
        <div className="sa-header-brand">
          <div className="sa-header-dot" />
          <div>
            <div className="sa-header-title">Panel Maestro — Lovecraft</div>
            <div className="sa-header-sub">{restaurantes.length} restaurantes · {todosPedidos.length} pedidos totales</div>
          </div>
        </div>
        <button className="sa-header-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
      </div>

      <div className="sa-nav">
        {navTabs.map(tab => (
          <button
            key={tab.key}
            className={`sa-nav-tab ${vistaActiva === tab.key ? 'active' : ''}`}
            onClick={() => { setVistaActiva(tab.key); setBusqueda(''); setFiltroPedido('todos'); }}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span className="sa-nav-badge" style={{ background: tab.badgeBg, color: tab.badgeColor }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="sa-content">

        <div className="sa-stats">
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#8e44ad' }}>{restaurantes.length}</div>
            <div className="sa-stat-label">Total</div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#2ecc71' }}>{activos.length}</div>
            <div className="sa-stat-label">Activos</div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#e74c3c' }}>{suspendidos.length}</div>
            <div className="sa-stat-label">Suspendidos</div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-num" style={{ color: '#f39c12' }}>{todosPedidos.filter(p => p.estado === 'pendiente').length}</div>
            <div className="sa-stat-label">Pendientes</div>
          </div>
        </div>

        {/* ACTIVOS */}
        {vistaActiva === 'activos' && (
          <div>
            <div className="sa-section-header">
              <div className="sa-section-title">Restaurantes activos</div>
              <button className="sa-btn-purple" onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo restaurante</button>
            </div>

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

            <input className="sa-search" placeholder="🔍 Buscar por nombre o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {filtrarRests(activos).length === 0
              ? <div className="sa-empty"><div className="sa-empty-icon">✅</div><div>No hay restaurantes activos</div></div>
              : filtrarRests(activos).map(r => <RestCard key={r.id} r={r} />)
            }
          </div>
        )}

        {/* SUSPENDIDOS */}
        {vistaActiva === 'suspendidos' && (
          <div>
            <div className="sa-section-header">
              <div className="sa-section-title">Restaurantes suspendidos</div>
            </div>
            <input className="sa-search" placeholder="🔍 Buscar por nombre o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {filtrarRests(suspendidos).length === 0
              ? <div className="sa-empty"><div className="sa-empty-icon">⛔</div><div>No hay restaurantes suspendidos</div></div>
              : filtrarRests(suspendidos).map(r => <RestCard key={r.id} r={r} />)
            }
          </div>
        )}

        {/* PRUEBA */}
        {vistaActiva === 'prueba' && (
          <div>
            <div className="sa-section-header">
              <div className="sa-section-title">Restaurantes en prueba</div>
            </div>
            <div className="sa-info-bar">
              🧪 Restaurantes marcados como prueba. Puedes marcarlos desde cualquier vista usando el botón correspondiente.
            </div>
            <input className="sa-search" placeholder="🔍 Buscar por nombre o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {filtrarRests(prueba).length === 0
              ? <div className="sa-empty"><div className="sa-empty-icon">🧪</div><div>No hay restaurantes en modo prueba</div></div>
              : filtrarRests(prueba).map(r => <RestCard key={r.id} r={r} />)
            }
          </div>
        )}

        {/* PEDIDOS */}
        {vistaActiva === 'pedidos' && (
          <div>
            <div className="sa-section-header">
              <div className="sa-section-title">Todos los pedidos</div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>{pedidosFiltrados.length} resultados</span>
            </div>

            <input className="sa-search" placeholder="🔍 Buscar por cliente, restaurante o #pedido..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

            <div className="sa-filter-bar">
              {[
                { key: 'todos', label: '🗂 Todos' },
                { key: 'pendiente', label: '⏳ Pendientes' },
                { key: 'preparando', label: '👨‍🍳 Preparando' },
                { key: 'en camino', label: '🛵 En camino' },
                { key: 'entregado', label: '✅ Entregados' },
              ].map(f => (
                <button key={f.key} className={`sa-filter-btn ${filtroPedido === f.key ? 'active' : ''}`} onClick={() => setFiltroPedido(f.key)}>
                  {f.label}
                  {f.key !== 'todos' && (
                    <span style={{ marginLeft: '5px', opacity: 0.5, fontSize: '11px' }}>
                      ({todosPedidos.filter(p => p.estado === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {pedidosFiltrados.length === 0
              ? <div className="sa-empty"><div className="sa-empty-icon">📋</div><div>No hay pedidos que coincidan</div></div>
              : pedidosFiltrados.map(pedido => (
                  <div key={`${pedido.restauranteId}-${pedido.id}`} className="sa-pedido-card">
                    <div className="sa-pedido-header">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sa-pedido-nombre">{pedido.nombre}</div>
                        <div className="sa-pedido-meta">📞 {pedido.telefono}</div>
                        <div className="sa-pedido-meta">📍 {pedido.direccion}</div>
                        <div className="sa-pedido-meta">#{pedido.numeroPedido} · {pedido.tipoPedido === 'sitio' ? '🪑 Mesa' : '🛵 Domicilio'}</div>
                        <div className="sa-pedido-rest">🍽️ {pedido.restauranteNombre}</div>
                      </div>
                      <span className="sa-pedido-estado" style={getEstadoStyle(pedido.estado)}>
                        {pedido.estado === 'pendiente' ? '⏳ Pendiente'
                          : pedido.estado === 'preparando' ? '👨‍🍳 Preparando'
                          : pedido.estado === 'en camino' ? '🛵 En camino'
                          : '✅ Entregado'}
                      </span>
                    </div>
                    <div className="sa-pedido-items">
                      {(pedido.items || []).map((item, i) => (
                        <div key={i} className="sa-pedido-item-row">
                          <span>{item.nombre}{item.extra ? ` + ${item.extra}` : ''}</span>
                          <span>${item.precio?.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="sa-pedido-total">
                        <span>Total</span>
                        <span style={{ color: '#c39bd3' }}>${pedido.total?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="sa-pedido-fecha">{new Date(pedido.fecha).toLocaleString('es-CO')}</div>
                  </div>
                ))
            }
          </div>
        )}

      </div>
    </div>
  );
}

export default SuperAdmin;
