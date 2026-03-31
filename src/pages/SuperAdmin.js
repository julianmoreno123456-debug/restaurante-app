import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const auth = getAuth();

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
      setError('Email o contrasena incorrectos');
    }
  };

  const crearSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleCrearRestaurante = async () => {
    if (!nuevoRestaurante.nombre || !nuevoRestaurante.email || !nuevoRestaurante.password) {
      alert('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, nuevoRestaurante.email, nuevoRestaurante.password);
      const slug = crearSlug(nuevoRestaurante.nombre);
      await setDoc(doc(db, 'restaurantes', cred.user.uid), {
        nombre: nuevoRestaurante.nombre,
        email: nuevoRestaurante.email,
        uid: cred.user.uid,
        slug: slug,
        fechaCreacion: new Date().toISOString(),
        activo: true,
        suspendido: false,
        pedidosHabilitados: true,
      });
      await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password);
      setNuevoRestaurante({ nombre: '', email: '', password: '' });
      setMostrarForm(false);
      alert('Restaurante creado con exito');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setCargando(false);
  };

  const handleEliminarRestaurante = async (id) => {
    if (!window.confirm('Seguro que quieres eliminar este restaurante?')) return;
    await deleteDoc(doc(db, 'restaurantes', id));
  };

  const handleToggleSuspendido = async (r) => {
    await updateDoc(doc(db, 'restaurantes', r.id), {
      suspendido: !r.suspendido,
    });
  };

  const handleTogglePedidos = async (r) => {
    await updateDoc(doc(db, 'restaurantes', r.id), {
      pedidosHabilitados: !r.pedidosHabilitados,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setLogueado(false);
  };

  if (!logueado) {
    return (
      <div style={{ maxWidth: '340px', margin: '100px auto', padding: '30px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '18px' }}>Panel Maestro</h2>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginBottom: '20px' }}>Solo para administradores</p>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
        <input type="password" placeholder="Contrasena" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
        <button onClick={handleLogin} style={{ width: '100%', padding: '12px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer' }}>
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#8e44ad', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Panel Maestro — Lovecraft</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{restaurantes.length} restaurantes registrados</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
          Cerrar sesion
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '22px', fontWeight: '600', color: '#8e44ad', margin: 0 }}>{restaurantes.length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Total</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '22px', fontWeight: '600', color: '#2ecc71', margin: 0 }}>{restaurantes.filter(r => !r.suspendido).length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Activos</p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '22px', fontWeight: '600', color: '#e74c3c', margin: 0 }}>{restaurantes.filter(r => r.suspendido).length}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Suspendidos</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Restaurantes</h2>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={{ padding: '10px 18px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
            + Nuevo restaurante
          </button>
        </div>

        {mostrarForm && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Crear nuevo restaurante</h3>
            <input placeholder="Nombre del restaurante" value={nuevoRestaurante.nombre} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, nombre: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }} />
            <input type="email" placeholder="Email del admin" value={nuevoRestaurante.email} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }} />
            <input type="password" placeholder="Contrasena para el admin" value={nuevoRestaurante.password} onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCrearRestaurante} disabled={cargando} style={{ flex: 1, padding: '12px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                {cargando ? 'Creando...' : 'Crear restaurante'}
              </button>
              <button onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: '12px', background: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {restaurantes.length === 0 && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '40px', margin: '0 0 10px' }}>🍽️</p>
            <p style={{ color: '#aaa', fontSize: '14px' }}>No hay restaurantes aun</p>
          </div>
        )}

        {restaurantes.map((r) => (
          <div key={r.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', opacity: r.suspendido ? 0.8 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontWeight: '500', fontSize: '15px', margin: 0 }}>{r.nombre}</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: r.suspendido ? '#fadbd8' : '#d5f5e3', color: r.suspendido ? '#c0392b' : '#1e8449' }}>
                    {r.suspendido ? 'Suspendido' : 'Activo'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{r.email}</p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Creado: {new Date(r.fechaCreacion).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleEliminarRestaurante(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => handleToggleSuspendido(r)}
                style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: r.suspendido ? '#d5f5e3' : '#fadbd8', color: r.suspendido ? '#1e8449' : '#c0392b' }}
              >
                {r.suspendido ? 'Activar restaurante' : 'Suspender restaurante'}
              </button>
              <button
                onClick={() => handleTogglePedidos(r)}
                style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: r.pedidosHabilitados === false ? '#fdebd0' : '#d6eaf8', color: r.pedidosHabilitados === false ? '#e67e22' : '#2980b9' }}
              >
                {r.pedidosHabilitados === false ? 'Habilitar pedidos' : 'Deshabilitar pedidos'}
              </button>
            </div>

            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#999', margin: '0 0 2px' }}>Pagina cliente</p>
                <p style={{ fontSize: '12px', color: '#8e44ad', margin: 0 }}>{window.location.origin}/restaurante/{r.slug || r.uid}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/restaurante/${r.slug || r.uid}`); alert('Copiado!'); }} style={{ padding: '6px 12px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                Copiar
              </button>
            </div>
            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#999', margin: '0 0 2px' }}>Panel admin</p>
                <p style={{ fontSize: '12px', color: '#e74c3c', margin: 0 }}>{window.location.origin}/admin</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/admin`); alert('Copiado!'); }} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
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