import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import Login from './pages/Login';
import './App.css';

const configInicial = {
  nombre: 'Mi Restaurante',
  descripcion: 'Bienvenido a nuestro restaurante',
  colorPrincipal: '#e74c3c',
  banner: null,
  logo: null,
};

function App() {
  const [autorizado, setAutorizado] = useState(false);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [config, setConfig] = useState(configInicial);

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, 'categorias'), (snap) => {
      setCategorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPlat = onSnapshot(collection(db, 'platos'), (snap) => {
      setPlatos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubPed = onSnapshot(collection(db, 'pedidos'), (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubConfig = onSnapshot(collection(db, 'config'), (snap) => {
      if (!snap.empty) {
        setConfig({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    });
    return () => { unsubCat(); unsubPlat(); unsubPed(); unsubConfig(); };
  }, []);

  const guardarCategoria = async (cat) => {
    await setDoc(doc(db, 'categorias', String(cat.id)), cat);
  };

  const eliminarCategoria = async (id) => {
    await deleteDoc(doc(db, 'categorias', String(id)));
  };

  const guardarPlato = async (plato) => {
    await setDoc(doc(db, 'platos', String(plato.id)), plato);
  };

  const eliminarPlato = async (id) => {
    await deleteDoc(doc(db, 'platos', String(id)));
  };

  const guardarConfig = async (nuevaConfig) => {
    await setDoc(doc(db, 'config', 'restaurante'), nuevaConfig);
    setConfig(nuevaConfig);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Cliente platos={platos} categorias={categorias} config={config} />}
        />
        <Route
          path="/admin"
          element={
            autorizado === true
              ? <Admin
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
              : <Login onLogin={() => setAutorizado(true)} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;