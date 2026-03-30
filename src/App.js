import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import './App.css';

const configInicial = {
  nombre: 'Mi Restaurante',
  descripcion: 'Bienvenido a nuestro restaurante',
  colorPrincipal: '#e74c3c',
  banner: null,
  logo: null,
};

function AdminWrapper() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [config, setConfig] = useState(configInicial);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!usuario) return;
    const uid = usuario.uid;
    const unsubCat = onSnapshot(collection(db, `restaurantes/${uid}/categorias`), (snap) => {
      setCategorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPlat = onSnapshot(collection(db, `restaurantes/${uid}/platos`), (snap) => {
      setPlatos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPed = onSnapshot(collection(db, `restaurantes/${uid}/pedidos`), (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(collection(db, `restaurantes/${uid}/config`), (snap) => {
      if (!snap.empty) setConfig({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return () => { unsubCat(); unsubPlat(); unsubPed(); unsubConfig(); };
  }, [usuario]);

  const uid = usuario?.uid;

  const guardarCategoria = async (cat) => {
    await setDoc(doc(db, `restaurantes/${uid}/categorias`, String(cat.id)), cat);
  };
  const eliminarCategoria = async (id) => {
    await deleteDoc(doc(db, `restaurantes/${uid}/categorias`, String(id)));
  };
  const guardarPlato = async (plato) => {
    await setDoc(doc(db, `restaurantes/${uid}/platos`, String(plato.id)), plato);
  };
  const eliminarPlato = async (id) => {
    await deleteDoc(doc(db, `restaurantes/${uid}/platos`, String(id)));
  };
  const guardarConfig = async (nuevaConfig) => {
    await setDoc(doc(db, `restaurantes/${uid}/config`, 'restaurante'), nuevaConfig);
    setConfig(nuevaConfig);
  };

  if (cargando) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando...</div>;
  if (!usuario) return <Login />;

  return (
    <Admin
      platos={platos}
      categorias={categorias}
      pedidos={pedidos}
      config={config}
      guardarCategoria={guardarCategoria}
      eliminarCategoria={eliminarCategoria}
      guardarPlato={guardarPlato}
      eliminarPlato={eliminarPlato}
      guardarConfig={guardarConfig}
    />
  );
}

function ClienteWrapperRoute() {
  const { slug } = useParams();
  const [uid, setUid] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [config, setConfig] = useState(configInicial);
  const [restauranteInfo, setRestauranteInfo] = useState(null);

  useEffect(() => {
    const buscar = async () => {
      try {
        const q = query(collection(db, 'restaurantes'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (snap.empty) {
          const directSnap = await getDocs(query(collection(db, 'restaurantes'), where('uid', '==', slug)));
          if (directSnap.empty) {
            setEstado('noexiste');
            return;
          }
          const data = directSnap.docs[0].data();
          setRestauranteInfo(data);
          setUid(data.uid);
        } else {
          const data = snap.docs[0].data();
          setRestauranteInfo(data);
          setUid(data.uid);
        }
      } catch (e) {
        setEstado('noexiste');
      }
    };
    buscar();
  }, [slug]);

  useEffect(() => {
    if (!uid) return;
    const unsubConfig = onSnapshot(collection(db, `restaurantes/${uid}/config`), (snap) => {
      if (!snap.empty) setConfig({ id: snap.docs[0].id, ...snap.docs[0].data() });
      setEstado('listo');
    });
    const unsubCat = onSnapshot(collection(db, `restaurantes/${uid}/categorias`), (snap) => {
      setCategorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPlat = onSnapshot(collection(db, `restaurantes/${uid}/platos`), (snap) => {
      setPlatos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubInfo = onSnapshot(doc(db, 'restaurantes', uid), (snap) => {
      if (!snap.exists()) {
        setEstado('noexiste');
        return;
      }
      setRestauranteInfo(snap.data());
      if (snap.data().suspendido) setEstado('suspendido');
      else setEstado('listo');
    });
    return () => { unsubConfig(); unsubCat(); unsubPlat(); unsubInfo(); };
  }, [uid]);

  if (estado === 'cargando') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: config?.colorPrincipal || '#e74c3c' }}>
      {config?.logo ? (
        <img src={config.logo} alt="logo" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', marginBottom: '20px' }} />
      ) : (
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>🍽️</div>
      )}
      <p style={{ color: 'white', fontSize: '18px', fontWeight: '500', margin: '0 0 8px' }}>{config?.nombre || 'Cargando...'}</p>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Por favor espera...</p>
    </div>
  );

  if (estado === 'noexiste') return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
      <p style={{ fontSize: '50px' }}>❌</p>
      <h2>Esta pagina no existe</h2>
      <p style={{ color: '#999' }}>El enlace no es valido o fue eliminado</p>
    </div>
  );

  if (estado === 'suspendido') return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
      <p style={{ fontSize: '50px' }}>🔒</p>
      <h2>Pagina temporalmente suspendida</h2>
      <p style={{ color: '#999' }}>Contacta al restaurante para mas informacion</p>
    </div>
  );

  return (
    <Cliente
      platos={platos}
      categorias={categorias}
      config={config}
      uid={uid}
      pedidosHabilitados={restauranteInfo?.pedidosHabilitados !== false}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Bienvenido a Lovecraft</h1>
            <p>Accede a tu restaurante con el enlace que te proporcionaron</p>
          </div>
        } />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/restaurante/:slug" element={<ClienteWrapperRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
