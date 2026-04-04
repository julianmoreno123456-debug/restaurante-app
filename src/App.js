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

// Cambia título y favicon dinámicamente
function setPageMeta(nombre, logo) {
  document.title = nombre || 'Lovecraft';

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  if (logo) {
    link.href = logo;
    link.type = 'image/png';
  } else {
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍽️</text></svg>";
    link.type = 'image/svg+xml';
  }
}

function AdminWrapper() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [config, setConfig] = useState(configInicial);
  const [restauranteInfo, setRestauranteInfo] = useState(null);

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

    const unsubInfo = onSnapshot(doc(db, 'restaurantes', uid), (snap) => {
      if (snap.exists()) setRestauranteInfo(snap.data());
    });

    return () => {
      unsubCat();
      unsubPlat();
      unsubPed();
      unsubConfig();
      unsubInfo();
    };
  }, [usuario]);

  useEffect(() => {
    if (config?.nombre && config.nombre !== 'Mi Restaurante') {
      setPageMeta('Admin — ' + config.nombre, config.logo);
    }
  }, [config]);

  const uid = usuario?.uid;

  const guardarCategoria = async (cat) => {
    await setDoc(doc(db, `restaurantes/${uid}/categorias`, String(cat.id)), cat);
  };

  const eliminarCategoria = async (id) => {
    await deleteDoc(doc(db, `restaurantes/${uid}/categorias`, String(id)));
    platos.filter((p) => p.categoriaId === id).forEach((p) => eliminarPlato(p.id));
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
      uid={uid}
      pedidosHabilitados={restauranteInfo?.pedidosHabilitados !== false}
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
          if (directSnap.empty) { setEstado('noexiste'); return; }
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
      if (!snap.exists()) { setEstado('noexiste'); return; }
      setRestauranteInfo(snap.data());
      if (snap.data().suspendido) setEstado('suspendido');
      else setEstado('listo');
    });

    return () => {
      unsubConfig();
      unsubCat();
      unsubPlat();
      unsubInfo();
    };
  }, [uid]);

  useEffect(() => {
    if (config?.nombre && config.nombre !== 'Mi Restaurante') {
      setPageMeta(config.nombre, config.logo);
    }
  }, [config]);

  if (estado === 'cargando') return <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando...</div>;
  if (estado === 'noexiste') return <div style={{ textAlign: 'center', marginTop: '100px' }}>No existe</div>;
  if (estado === 'suspendido') return <div style={{ textAlign: 'center', marginTop: '100px' }}>Suspendido</div>;

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

function SuperAdminWrapper() {
  useEffect(() => {
    setPageMeta('Panel Maestro — Lovecraft', null);
  }, []);
  return <SuperAdmin />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div style={{ textAlign: 'center', marginTop: '100px' }}><h1>Bienvenido a Lovecraft</h1></div>} />
        <Route path="/superadmin" element={<SuperAdminWrapper />} />
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/restaurante/:slug" element={<ClienteWrapperRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
