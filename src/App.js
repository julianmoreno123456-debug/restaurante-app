import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Seguimiento from './pages/Seguimiento';
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

function ClienteWrapper({ uidRestaurante }) {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [config, setConfig] = useState(configInicial);
  const [restauranteInfo, setRestauranteInfo] = useState(null);

  useEffect(() => {
    if (!uidRestaurante) return;
    const unsubCat = onSnapshot(collection(db, `restaurantes/${uidRestaurante}/categorias`), (snap) => {
      setCategorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPlat = onSnapshot(collection(db, `restaurantes/${uidRestaurante}/platos`), (snap) => {
      setPlatos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(collection(db, `restaurantes/${uidRestaurante}/config`), (snap) => {
      if (!snap.empty) setConfig({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    const unsubInfo = onSnapshot(doc(db, 'restaurantes', uidRestaurante), (snap) => {
      if (snap.exists()) setRestauranteInfo(snap.data());
    });
    return () => { unsubCat(); unsubPlat(); unsubConfig(); unsubInfo(); };
  }, [uidRestaurante]);

  if (restauranteInfo?.suspendido) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <p style={{ fontSize: '50px' }}>🔒</p>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Pagina temporalmente suspendida</h2>
        <p style={{ color: '#999', fontSize: '14px' }}>Por favor contacta al restaurante para mas informacion</p>
      </div>
    );
  }

  return (
    <Cliente
      platos={platos}
      categorias={categorias}
      config={config}
      uid={uidRestaurante}
      pedidosHabilitados={restauranteInfo?.pedidosHabilitados !== false}
    />
  );
}

function ClienteWrapperRoute() {
  const { slug } = useParams();
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const buscarUid = async () => {
      const q = query(collection(db, 'restaurantes'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUid(snap.docs[0].data().uid);
      } else {
        setUid(slug);
      }
    };
    buscarUid();
  }, [slug]);

  if (!uid) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando...</div>;
  return <ClienteWrapper uidRestaurante={uid} />;
}

function SeguimientoRoute() {
  const { uid, pedidoId } = useParams();
  const [config, setConfig] = useState(configInicial);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, `restaurantes/${uid}/config`), (snap) => {
      if (!snap.empty) setConfig({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return () => unsub();
  }, [uid]);

  return <Seguimiento pedidoId={pedidoId} uid={uid} config={config} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/restaurante/:slug" element={<ClienteWrapperRoute />} />
        <Route path="/seguimiento/:uid/:pedidoId" element={<SeguimientoRoute />} />
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Bienvenido a Lovecraft</h1>
            <p>Accede a tu restaurante con el enlace que te proporcionaron</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;