import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc, addDoc, collection, getDoc, setDoc, increment } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Configuracion from './Configuracion';
import Estadisticas from './Estadisticas';

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  .admin-root * { box-sizing: border-box; }
  .admin-root { display: flex; min-height: 100vh; background: #f7f7f5; font-family: 'DM Sans', sans-serif; }

  /* SIDEBAR */
  .admin-sidebar {
    width: 240px;
    background: #111;
    display: flex;
    flex-direction: column;
    padding: 0;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sidebar-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    object-fit: cover;
  }

  .sidebar-logo-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #e74c3c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .sidebar-brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-section {
    padding: 16px 12px 8px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .sidebar-btn {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
    transition: all 0.15s;
    text-align: left;
    color: rgba(255,255,255,0.55);
    background: transparent;
  }

  .sidebar-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .sidebar-btn.active { background: rgba(255,255,255,0.1); color: #fff; font-weight: 500; }
  .sidebar-btn.active .sidebar-icon { opacity: 1; }

  .sidebar-icon { font-size: 15px; opacity: 0.6; flex-shrink: 0; }

  .sidebar-badge {
    margin-left: auto;
    background: #e74c3c;
    color: white;
    border-radius: 20px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 600;
  }

  .sidebar-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 12px; }

  .sidebar-cat-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 2px;
    transition: all 0.15s;
    gap: 8px;
  }
  .sidebar-cat-item:hover { background: rgba(255,255,255,0.06); }
  .sidebar-cat-item.active { background: rgba(255,255,255,0.1); }
  .sidebar-cat-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-cat-item.active .sidebar-cat-name { color: #fff; }
  .sidebar-cat-actions { display: flex; gap: 2px; opacity: 0; transition: opacity 0.15s; }
  .sidebar-cat-item:hover .sidebar-cat-actions { opacity: 1; }
  .sidebar-cat-action-btn { background: none; border: none; cursor: pointer; padding: 3px; border-radius: 6px; font-size: 12px; }
  .sidebar-cat-action-btn:hover { background: rgba(255,255,255,0.1); }

  .sidebar-add-cat {
    width: calc(100% - 24px);
    margin: 4px 12px;
    padding: 9px 12px;
    background: transparent;
    border: 1px dashed rgba(255,255,255,0.15);
    border-radius: 10px;
    color: rgba(255,255,255,0.35);
    font-size: 12.5px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    text-align: center;
  }
  .sidebar-add-cat:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.6); }

  .sidebar-logout {
    margin: auto 12px 16px;
    width: calc(100% - 24px);
    padding: 9px 12px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.35);
    font-size: 12.5px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .sidebar-logout:hover { background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.3); color: #e74c3c; }

  /* HAMBURGER */
  .sidebar-hamburger {
    display: none;
    position: fixed;
    top: 14px;
    left: 14px;
    z-index: 400;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #111;
    border: none;
    cursor: pointer;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    transition: background 0.15s;
  }
  .sidebar-hamburger:hover { background: #222; }
  .sidebar-hamburger span {
    display: block;
    width: 18px;
    height: 2px;
    background: white;
    border-radius: 2px;
    transition: all 0.25s;
    transform-origin: center;
  }
  .sidebar-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .sidebar-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .sidebar-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* OVERLAY MOBILE */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 300;
    animation: fadeInOverlay 0.2s ease;
  }
  @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar-hamburger { display: flex; }
    .sidebar-overlay.visible { display: block; }

    .admin-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 350;
      transform: translateX(-100%);
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: none;
    }
    .admin-sidebar.open {
      transform: translateX(0);
      box-shadow: 4px 0 32px rgba(0,0,0,0.35);
    }

    .admin-main {
      padding: 72px 16px 24px;
      width: 100%;
    }

    .admin-page-title {
      padding-left: 0;
    }

    /* Empujar contenido de subpáginas en móvil */
    .cfg-root,
    .cfg-title {
      padding-top: 0 !important;
    }
  }

  /* MAIN */
  .admin-main { flex: 1; padding: 28px 32px; min-width: 0; }

  .admin-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #111;
    margin-bottom: 20px;
    letter-spacing: -0.3px;
  }

  /* CARDS */
  .admin-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    margin-bottom: 14px;
    overflow: hidden;
  }

  /* FORM CARD */
  .form-card { padding: 22px; }
  .form-card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #111; margin-bottom: 16px; }

  .form-row { display: flex; gap: 12px; margin-bottom: 12px; }
  .form-input {
    flex: 1;
    padding: 11px 14px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
    background: #fff;
  }
  .form-input:focus { border-color: #111; }
  .form-input::placeholder { color: #bbb; }

  .form-actions { display: flex; gap: 10px; margin-top: 4px; }

  /* BOTONES */
  .btn-primary {
    padding: 10px 20px;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.2px;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

  .btn-secondary {
    padding: 10px 20px;
    background: #f0f0ee;
    color: #555;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: #e8e8e5; }

  .btn-accent {
    padding: 10px 20px;
    background: var(--accent, #e74c3c);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn-accent:hover { opacity: 0.88; transform: translateY(-1px); }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    font-size: 14px;
    transition: background 0.15s;
    display: flex;
    align-items: center;
  }
  .btn-icon:hover { background: #f5f5f3; }

  .btn-dashed {
    padding: 8px 14px;
    background: transparent;
    border: 1.5px dashed #ddd;
    border-radius: 8px;
    font-size: 12.5px;
    color: #888;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .btn-dashed:hover { border-color: #999; color: #555; }

  /* PLATO CARD */
  .plato-card { padding: 18px; border-bottom: 1px solid #f5f5f3; }
  .plato-card:last-child { border-bottom: none; }
  .plato-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .plato-img { width: 64px; height: 64px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
  .plato-img-placeholder { width: 64px; height: 64px; background: #f5f5f3; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
  .plato-info { flex: 1; }
  .plato-name { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: #111; margin-bottom: 3px; }
  .plato-price { font-size: 14px; color: var(--accent, #e74c3c); font-weight: 500; }

  .plato-section { border-top: 1px solid #f5f5f3; padding-top: 12px; margin-top: 12px; }
  .plato-section-title { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
  .extra-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #444; padding: 5px 0; border-bottom: 1px solid #f8f8f6; }
  .extra-item:last-child { border-bottom: none; }

  /* PEDIDOS */
  .pedido-card { padding: 18px; }
  .pedido-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .pedido-nombre { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: #111; }
  .pedido-meta { font-size: 12.5px; color: #888; margin-top: 2px; }
  .pedido-tag { display: inline-block; font-size: 10px; background: #f0f0ee; padding: 2px 8px; border-radius: 20px; color: #777; margin-left: 6px; vertical-align: middle; }
  .pedido-tag.manual { background: #fff3e0; color: #e67e22; }

  .pedido-estado {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1.5px solid #e8e8e8;
    font-size: 12.5px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    outline: none;
    font-weight: 500;
    background: white;
  }

  .pedido-items { border-top: 1px solid #f5f5f3; padding-top: 12px; }
  .pedido-item-row { display: flex; justify-content: space-between; font-size: 13px; color: #444; padding: 4px 0; }
  .pedido-total-row { display: flex; justify-content: space-between; font-weight: 600; padding-top: 10px; margin-top: 6px; border-top: 1px solid #f0f0ee; font-size: 14px; color: #111; }
  .pedido-fecha { font-size: 11px; color: #bbb; margin-top: 8px; }

  .btn-whatsapp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 14px;
    background: #25d366;
    color: white;
    border-radius: 10px;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .btn-whatsapp:hover { opacity: 0.88; }

  /* PEDIDO MANUAL */
  .manual-layout { display: flex; gap: 20px; }
  .manual-menu { flex: 1; }
  .manual-sidebar { width: 300px; flex-shrink: 0; }
  .manual-sticky { position: sticky; top: 0; }

  .cat-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  .cat-pill {
    padding: 7px 16px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
  }

  .platos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .plato-mini-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .plato-mini-img { width: 100%; height: 100px; object-fit: cover; }
  .plato-mini-placeholder { width: 100%; height: 100px; background: #f5f5f3; display: flex; align-items: center; justify-content: center; font-size: 30px; }
  .plato-mini-body { padding: 10px; }
  .plato-mini-name { font-weight: 500; font-size: 13px; margin-bottom: 3px; color: #111; }
  .plato-mini-price { font-size: 13px; margin-bottom: 8px; }
  .plato-mini-select { width: 100%; padding: 5px 8px; border-radius: 8px; border: 1px solid #e8e8e8; font-size: 11px; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; }

  .datos-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 18px; }
  .datos-card-title { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: #111; margin-bottom: 14px; }
  .tipo-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .tipo-btn {
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    text-align: center;
  }

  .carrito-items { border-top: 1px solid #f5f5f3; padding-top: 10px; margin: 10px 0; }
  .carrito-item { display: flex; justify-content: space-between; align-items: flex-start; font-size: 12.5px; margin-bottom: 8px; color: #444; }
  .carrito-empty { color: #bbb; font-size: 13px; text-align: center; padding: 16px 0; }
  .carrito-total { font-weight: 600; font-size: 14px; margin-bottom: 12px; }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 60px 20px; color: #aaa; }
  .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state-text { font-size: 14px; }

  /* CHIP */
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  /* FILE INPUT */
  .file-label {
    font-size: 12.5px;
    color: #777;
    display: block;
    margin-bottom: 6px;
  }
`;

function Admin({ platos, categorias, guardarCategoria, eliminarCategoria, guardarPlato, eliminarPlato, pedidos = [], config, guardarConfig, pedidosHabilitados = false, uid }) {
  const [vista, setVista] = useState('menu');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [mostrarFormPlato, setMostrarFormPlato] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editandoCategoria, setEditandoCategoria] = useState(null); // { id, nombre }
  const [editandoPlato, setEditandoPlato] = useState(null); // plato completo
  const [editandoPlatoImagen, setEditandoPlatoImagen] = useState(null);
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [nuevoPlato, setNuevoPlato] = useState({ nombre: '', precio: '', imagen: null, extras: [], opciones: [] });
  const [nuevoExtra, setNuevoExtra] = useState({ nombre: '', precio: 0, gratis: false });
  const [nuevaOpcion, setNuevaOpcion] = useState('');

  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [carritoManual, setCarritoManual] = useState([]);
  const [extrasElegidosManual, setExtrasElegidosManual] = useState({});
  const [opcionesElegidasManual, setOpcionesElegidasManual] = useState({});
  const [categoriaActivaManual, setCategoriaActivaManual] = useState(null);
  const [datosManual, setDatosManual] = useState({ nombre: '', telefono: '', direccion: '', tipoPedido: 'domicilio', mesa: '' });

  const color = config?.colorPrincipal || '#e74c3c';

  const handleCerrarSesion = async () => { await signOut(auth); };

  const handleGuardarEdicionCategoria = () => {
    if (!editandoCategoria?.nombre.trim()) return;
    const cat = categorias.find(c => c.id === editandoCategoria.id);
    if (cat) guardarCategoria({ ...cat, nombre: editandoCategoria.nombre.trim() });
    setEditandoCategoria(null);
  };

  const handleImagenEdicion = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditandoPlatoImagen(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGuardarEdicionPlato = () => {
    if (!editandoPlato?.nombre || !editandoPlato?.precio) return;
    guardarPlato({
      ...editandoPlato,
      precio: Number(editandoPlato.precio),
      imagen: editandoPlatoImagen !== null ? editandoPlatoImagen : editandoPlato.imagen,
    });
    setEditandoPlato(null);
    setEditandoPlatoImagen(null);
  };

  const handleAgregarCategoria = () => {
    if (!nuevaCategoria) return;
    const cat = { id: Date.now() + Math.random().toString(36).substr(2, 9), nombre: nuevaCategoria, emoji: '🍽️', activa: true };
    guardarCategoria(cat);
    setNuevaCategoria('');
    setMostrarFormCategoria(false);
  };

  const handleEliminarCategoria = (id) => {
    eliminarCategoria(id);
    platos.filter((p) => p.categoriaId === id).forEach((p) => eliminarPlato(p.id));
    setCategoriaActiva(null);
  };

  const handleToggleCategoria = (cat) => {
    guardarCategoria({ ...cat, activa: cat.activa === false ? true : false });
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNuevoPlato({ ...nuevoPlato, imagen: reader.result });
    reader.readAsDataURL(file);
  };

  const handleAgregarPlato = () => {
    if (!nuevoPlato.nombre || !nuevoPlato.precio) return;
    const plato = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      categoriaId: categoriaActiva,
      nombre: nuevoPlato.nombre,
      precio: Number(nuevoPlato.precio),
      imagen: nuevoPlato.imagen || null,
      extras: [],
      opciones: [],
      emoji: '🍔',
    };
    guardarPlato(plato);
    setNuevoPlato({ nombre: '', precio: '', imagen: null, extras: [], opciones: [] });
    setMostrarFormPlato(false);
  };

  const handleAgregarExtra = (plato) => {
    if (!nuevoExtra.nombre) return;
    guardarPlato({ ...plato, extras: [...plato.extras, { nombre: nuevoExtra.nombre, precio: nuevoExtra.gratis ? 0 : Number(nuevoExtra.precio) }] });
    setNuevoExtra({ nombre: '', precio: 0, gratis: false });
    setPlatoSeleccionado(null);
  };

  const handleEliminarExtra = (plato, i) => {
    guardarPlato({ ...plato, extras: plato.extras.filter((_, idx) => idx !== i) });
  };

  const handleAgregarOpcion = (plato) => {
    if (!nuevaOpcion) return;
    guardarPlato({ ...plato, opciones: [...plato.opciones, nuevaOpcion] });
    setNuevaOpcion('');
    setPlatoSeleccionado(null);
  };

  const handleEliminarOpcion = (plato, i) => {
    guardarPlato({ ...plato, opciones: plato.opciones.filter((_, idx) => idx !== i) });
  };

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    await updateDoc(doc(db, `restaurantes/${uid}/pedidos`, pedidoId), { estado: nuevoEstado });
  };

  const agregarAlCarritoManual = (plato) => {
    const extraElegido = extrasElegidosManual[plato.id] || null;
    const precioExtra = extraElegido ? plato.extras.find((e) => e.nombre === extraElegido)?.precio || 0 : 0;
    setCarritoManual([...carritoManual, { ...plato, extraElegido, opcionesElegidas: opcionesElegidasManual[plato.id] || [], precioFinal: plato.precio + precioExtra }]);
  };

  const eliminarDelCarritoManual = (i) => { setCarritoManual(carritoManual.filter((_, idx) => idx !== i)); };

  const toggleOpcionManual = (platoId, opcion) => {
    const actuales = opcionesElegidasManual[platoId] || [];
    if (actuales.includes(opcion)) {
      setOpcionesElegidasManual({ ...opcionesElegidasManual, [platoId]: actuales.filter((o) => o !== opcion) });
    } else {
      setOpcionesElegidasManual({ ...opcionesElegidasManual, [platoId]: [...actuales, opcion] });
    }
  };

  const COSTO_DOMICILIO = config?.costoDomicilio ?? 2000;
  const totalManual = carritoManual.reduce((sum, p) => sum + p.precioFinal, 0);
  const totalManualConDomicilio = totalManual + (datosManual.tipoPedido === 'domicilio' ? COSTO_DOMICILIO : 0);

  const handleEnviarPedidoManual = async () => {
    if (!datosManual.nombre || !datosManual.telefono) { alert('Completa nombre y telefono'); return; }
    if (datosManual.tipoPedido === 'domicilio' && !datosManual.direccion) { alert('Ingresa la direccion'); return; }
    if (datosManual.tipoPedido === 'sitio' && !datosManual.mesa) { alert('Selecciona la mesa'); return; }
    if (carritoManual.length === 0) { alert('Agrega al menos un producto'); return; }
    const hoy = new Date().toISOString().slice(0, 10);
    const contadorRef = doc(db, `restaurantes/${uid}/contadores`, hoy);
    let numeroPedido = 1;
    try {
      const snap = await getDoc(contadorRef);
      if (snap.exists()) {
        numeroPedido = (snap.data().contador || 0) + 1;
        await updateDoc(contadorRef, { contador: increment(1) });
      } else {
        await setDoc(contadorRef, { contador: 1, fecha: hoy });
        numeroPedido = 1;
      }
    } catch (e) {
      numeroPedido = Math.floor(Math.random() * 90 + 1);
    }
    await addDoc(collection(db, `restaurantes/${uid}/pedidos`), {
      nombre: datosManual.nombre,
      telefono: datosManual.telefono,
      direccion: datosManual.tipoPedido === 'domicilio' ? datosManual.direccion : `Mesa ${datosManual.mesa}`,
      tipoPedido: datosManual.tipoPedido,
      mesa: datosManual.mesa || null,
      lat: null, lng: null,
      items: carritoManual.map((p) => ({ nombre: p.nombre, precio: p.precioFinal, extra: p.extraElegido || null, opciones: p.opcionesElegidas || [] })),
      total: totalManualConDomicilio,
      numeroPedido,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      manual: true,
    });
    setCarritoManual([]);
    setDatosManual({ nombre: '', telefono: '', direccion: '', tipoPedido: 'domicilio', mesa: '' });
    alert('Pedido creado con exito');
  };

  const platosFiltrados = platos.filter((p) => p.categoriaId === categoriaActiva);
  const platosFiltradosManual = categoriaActivaManual ? platos.filter((p) => p.categoriaId === categoriaActivaManual) : platos;
  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;

  const navItems = [
    { key: 'menu', icon: '🍽️', label: 'Menú' },
    { key: 'pedidos', icon: '📋', label: 'Pedidos', badge: pendientes > 0 ? pendientes : null },
    { key: 'configuracion', icon: '⚙️', label: 'Configuración' },
    { key: 'estadisticas', icon: '📊', label: 'Estadísticas' },
    ...(pedidosHabilitados ? [{ key: 'pedido_manual', icon: '➕', label: 'Nuevo pedido' }] : []),
  ];

  const getEstadoStyle = (estado) => {
    if (estado === 'pendiente') return { background: '#fff8e1', borderColor: '#f9a825', color: '#e65100' };
    if (estado === 'preparando') return { background: '#e3f2fd', borderColor: '#1976d2', color: '#1565c0' };
    if (estado === 'en camino') return { background: '#e8f5e9', borderColor: '#43a047', color: '#2e7d32' };
    return { background: '#f5f5f3', borderColor: '#ddd', color: '#777' };
  };

  return (
    <div className="admin-root" style={{ '--accent': color }}>
      <style>{adminStyles}</style>

      {/* HAMBURGER */}
      <button
        className={`sidebar-hamburger ${sidebarAbierto ? 'open' : ''}`}
        onClick={() => setSidebarAbierto(!sidebarAbierto)}
        aria-label="Abrir menú"
      >
        <span /><span /><span />
      </button>

      {/* OVERLAY MOBILE */}
      <div
        className={`sidebar-overlay ${sidebarAbierto ? 'visible' : ''}`}
        onClick={() => setSidebarAbierto(false)}
      />

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${sidebarAbierto ? 'open' : ''}`}>
        <div className="sidebar-brand">
          {config?.logo
            ? <img src={config.logo} alt="logo" className="sidebar-logo" />
            : <div className="sidebar-logo-placeholder">🍽️</div>
          }
          <span className="sidebar-brand-name">{config?.nombre || 'Mi Restaurante'}</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navegación</div>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-btn ${vista === item.key ? 'active' : ''}`}
              onClick={() => { setVista(item.key); setSidebarAbierto(false); }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-section-label">Categorías</div>
          {categorias.map((cat) => (
            <div key={cat.id}>
              {editandoCategoria?.id === cat.id ? (
                <div style={{ padding: '6px 8px' }}>
                  <input
                    className="form-input"
                    value={editandoCategoria.nombre}
                    onChange={(e) => setEditandoCategoria({ ...editandoCategoria, nombre: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGuardarEdicionCategoria(); if (e.key === 'Escape') setEditandoCategoria(null); }}
                    style={{ marginBottom: '6px', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleGuardarEdicionCategoria} style={{ flex: 1, padding: '7px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>Guardar</button>
                    <button onClick={() => setEditandoCategoria(null)} style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div
                  className={`sidebar-cat-item ${categoriaActiva === cat.id && vista === 'menu' ? 'active' : ''}`}
                  onClick={() => { setCategoriaActiva(cat.id); setVista('menu'); setSidebarAbierto(false); }}
                >
                  <span style={{ fontSize: '14px', opacity: cat.activa === false ? 0.35 : 1 }}>{cat.emoji}</span>
                  <span className="sidebar-cat-name" style={{ opacity: cat.activa === false ? 0.4 : 1 }}>
                    {cat.nombre}
                  </span>
                  <div className="sidebar-cat-actions">
                    <button className="sidebar-cat-action-btn" onClick={(e) => { e.stopPropagation(); setEditandoCategoria({ id: cat.id, nombre: cat.nombre }); }} title="Editar">✏️</button>
                    <button className="sidebar-cat-action-btn" onClick={(e) => { e.stopPropagation(); handleToggleCategoria(cat); }} title={cat.activa === false ? 'Mostrar' : 'Ocultar'}>
                      {cat.activa === false ? '👁️' : '🙈'}
                    </button>
                    <button className="sidebar-cat-action-btn" onClick={(e) => { e.stopPropagation(); handleEliminarCategoria(cat.id); }} title="Eliminar">🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {mostrarFormCategoria ? (
            <div style={{ padding: '8px 8px 4px' }}>
              <input
                className="form-input"
                placeholder="Nombre categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAgregarCategoria()}
                style={{ marginBottom: '8px', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleAgregarCategoria} style={{ flex: 1, padding: '8px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>Guardar</button>
                <button onClick={() => setMostrarFormCategoria(false)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="sidebar-add-cat" onClick={() => setMostrarFormCategoria(true)}>
              + Nueva categoría
            </button>
          )}
        </div>

        <button className="sidebar-logout" onClick={handleCerrarSesion}>
          🚪 Cerrar sesión
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main">

        {vista === 'configuracion' && <Configuracion config={config} guardarConfig={guardarConfig} />}
        {vista === 'estadisticas' && <Estadisticas pedidos={pedidos} config={config} />}

        {/* PEDIDO MANUAL */}
        {vista === 'pedido_manual' && (
          <div>
            <h1 className="admin-page-title">Nuevo pedido manual</h1>
            <div className="manual-layout">
              <div className="manual-menu">
                <div className="cat-pills">
                  <button
                    className="cat-pill"
                    onClick={() => setCategoriaActivaManual(null)}
                    style={{ background: categoriaActivaManual === null ? color : '#eee', color: categoriaActivaManual === null ? 'white' : '#555' }}
                  >
                    Todos
                  </button>
                  {categorias.filter(c => c.activa !== false).map((cat) => (
                    <button
                      key={cat.id}
                      className="cat-pill"
                      onClick={() => setCategoriaActivaManual(cat.id)}
                      style={{ background: categoriaActivaManual === cat.id ? color : '#eee', color: categoriaActivaManual === cat.id ? 'white' : '#555' }}
                    >
                      {cat.emoji} {cat.nombre}
                    </button>
                  ))}
                </div>

                <div className="platos-grid">
                  {platosFiltradosManual.map((plato) => (
                    <div key={plato.id} className="plato-mini-card">
                      {plato.imagen
                        ? <img src={plato.imagen} alt={plato.nombre} className="plato-mini-img" />
                        : <div className="plato-mini-placeholder">🍔</div>
                      }
                      <div className="plato-mini-body">
                        <p className="plato-mini-name">{plato.nombre}</p>
                        <p className="plato-mini-price" style={{ color }}>${plato.precio.toLocaleString()}</p>
                        {plato.extras.length > 0 && (
                          <select
                            className="plato-mini-select"
                            onChange={(e) => setExtrasElegidosManual({ ...extrasElegidosManual, [plato.id]: e.target.value })}
                          >
                            <option value="">Sin extra</option>
                            {plato.extras.map((extra, i) => (
                              <option key={i} value={extra.nombre}>{extra.nombre} {extra.precio > 0 ? '+$' + extra.precio.toLocaleString() : '(gratis)'}</option>
                            ))}
                          </select>
                        )}
                        {plato.opciones.length > 0 && (
                          <div style={{ marginBottom: '6px' }}>
                            {plato.opciones.map((op, i) => (
                              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', marginBottom: '3px', cursor: 'pointer', color: '#555' }}>
                                <input type="checkbox" checked={(opcionesElegidasManual[plato.id] || []).includes(op)} onChange={() => toggleOpcionManual(plato.id, op)} />
                                {op}
                              </label>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => agregarAlCarritoManual(plato)}
                          style={{ width: '100%', padding: '7px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="manual-sidebar">
                <div className="datos-card manual-sticky">
                  <h3 className="datos-card-title">Datos del pedido</h3>
                  <div className="tipo-btns">
                    <button
                      className="tipo-btn"
                      onClick={() => setDatosManual({ ...datosManual, tipoPedido: 'domicilio', mesa: '' })}
                      style={{ border: datosManual.tipoPedido === 'domicilio' ? `2px solid ${color}` : '1.5px solid #e8e8e8', background: datosManual.tipoPedido === 'domicilio' ? color + '12' : 'white', color: datosManual.tipoPedido === 'domicilio' ? color : '#555' }}
                    >
                      🛵 Domicilio
                    </button>
                    <button
                      className="tipo-btn"
                      onClick={() => setDatosManual({ ...datosManual, tipoPedido: 'sitio', direccion: '' })}
                      style={{ border: datosManual.tipoPedido === 'sitio' ? `2px solid ${color}` : '1.5px solid #e8e8e8', background: datosManual.tipoPedido === 'sitio' ? color + '12' : 'white', color: datosManual.tipoPedido === 'sitio' ? color : '#555' }}
                    >
                      🪑 Mesa
                    </button>
                  </div>

                  <input className="form-input" placeholder="Nombre del cliente" value={datosManual.nombre} onChange={(e) => setDatosManual({ ...datosManual, nombre: e.target.value })} style={{ marginBottom: '8px' }} />
                  <input className="form-input" placeholder="Teléfono" value={datosManual.telefono} onChange={(e) => setDatosManual({ ...datosManual, telefono: e.target.value })} style={{ marginBottom: '8px' }} />
                  {datosManual.tipoPedido === 'domicilio' && (
                    <input className="form-input" placeholder="Dirección" value={datosManual.direccion} onChange={(e) => setDatosManual({ ...datosManual, direccion: e.target.value })} style={{ marginBottom: '8px' }} />
                  )}
                  {datosManual.tipoPedido === 'sitio' && (
                    <select className="form-input" value={datosManual.mesa} onChange={(e) => setDatosManual({ ...datosManual, mesa: e.target.value })} style={{ marginBottom: '8px' }}>
                      <option value="">Selecciona la mesa</option>
                      {mesas.map((m) => <option key={m} value={m}>Mesa {m}</option>)}
                    </select>
                  )}

                  <div className="carrito-items">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Productos</p>
                    {carritoManual.length === 0
                      ? <p className="carrito-empty">Sin productos aún</p>
                      : carritoManual.map((p, i) => (
                          <div key={i} className="carrito-item">
                            <div>
                              <div style={{ fontWeight: 500, color: '#111' }}>{p.nombre}</div>
                              {p.extraElegido && <div style={{ color: '#888', fontSize: '11px' }}>+ {p.extraElegido}</div>}
                              {p.opcionesElegidas.length > 0 && <div style={{ color: '#888', fontSize: '11px' }}>{p.opcionesElegidas.join(', ')}</div>}
                              <div style={{ color, fontWeight: 500 }}>${p.precioFinal.toLocaleString()}</div>
                            </div>
                            <button className="btn-icon" onClick={() => eliminarDelCarritoManual(i)} style={{ marginLeft: '8px', fontSize: '13px' }}>🗑️</button>
                          </div>
                        ))
                    }
                  </div>

                  {carritoManual.length > 0 && (
                    <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: '10px', marginBottom: '12px' }}>
                      {datosManual.tipoPedido === 'domicilio' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#888', marginBottom: '4px' }}>
                            <span>Subtotal</span>
                            <span>${totalManual.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#888', marginBottom: '6px' }}>
                            <span>🛵 Domicilio</span>
                            <span>${COSTO_DOMICILIO.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <p className="carrito-total" style={{ color, margin: 0 }}>Total: ${totalManualConDomicilio.toLocaleString()}</p>
                    </div>
                  )}

                  <button
                    onClick={handleEnviarPedidoManual}
                    style={{ width: '100%', padding: '12px', background: color, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600 }}
                  >
                    Confirmar pedido →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {vista === 'pedidos' && (
          <div>
            <h1 className="admin-page-title">Pedidos en tiempo real</h1>
            {pedidos.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-text">No hay pedidos aún</p>
              </div>
            )}
            {[...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((pedido) => {
              const estadoStyle = getEstadoStyle(pedido.estado);
              return (
                <div key={pedido.id} className="admin-card">
                  <div className="pedido-card">
                    <div className="pedido-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="pedido-nombre">{pedido.nombre}</span>
                          {pedido.manual && <span className="pedido-tag manual">Manual</span>}
                        </div>
                        <div className="pedido-meta">{pedido.telefono}</div>
                        <div className="pedido-meta">{pedido.direccion}</div>
                        <div style={{ fontSize: '11.5px', color: '#aaa', marginTop: '2px' }}>
                          {pedido.tipoPedido === 'sitio' ? '🪑 Mesa' : '🛵 Domicilio'} — #{pedido.numeroPedido}
                        </div>
                      </div>
                      <select
                        value={pedido.estado}
                        onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                        className="pedido-estado"
                        style={estadoStyle}
                      >
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="preparando">👨‍🍳 En preparación</option>
                        <option value="en camino">🛵 En camino</option>
                        <option value="entregado">✅ Entregado</option>
                      </select>
                    </div>

                    <div className="pedido-items">
                      {pedido.items.map((item, i) => (
                        <div key={i} className="pedido-item-row">
                          <span>{item.nombre}{item.extra ? ` + ${item.extra}` : ''}{item.opciones && item.opciones.length > 0 ? ` (${item.opciones.join(', ')})` : ''}</span>
                          <span style={{ fontWeight: 500 }}>${item.precio.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pedido-total-row">
                        <span>Total</span>
                        <span style={{ color }}>${pedido.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="pedido-fecha">{new Date(pedido.fecha).toLocaleString()}</p>

                    {pedido.telefono && (
                      <a
                        href={`https://wa.me/${pedido.telefono.replace(/\D/g, '').startsWith('57') ? pedido.telefono.replace(/\D/g, '') : '57' + pedido.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                          (config?.mensajeWhatsapp || 'Hola {nombre}! 🎉 Tu pedido #{numero} ya está {estado}. Total: \${total}. Tiempo estimado: {tiempo} min. ¡Gracias! 🍔')
                            .replace('{nombre}', pedido.nombre)
                            .replace('{numero}', pedido.numeroPedido)
                            .replace('{estado}', pedido.estado === 'preparando' ? 'en preparación' : pedido.estado === 'en camino' ? 'en camino, pronto llegará' : pedido.estado === 'entregado' ? 'entregado' : 'recibido')
                            .replace('{total}', pedido.total.toLocaleString())
                            .replace('{tiempo}', config?.tiempoEntrega || '30-45')
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp"
                      >
                        💬 Notificar al cliente
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MENU - sin categoría */}
        {vista === 'menu' && !categoriaActiva && (
          <div className="empty-state">
            <div className="empty-state-icon">👈</div>
            <p className="empty-state-text">Selecciona una categoría del panel lateral</p>
          </div>
        )}

        {/* MENU - con categoría */}
        {vista === 'menu' && categoriaActiva && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 className="admin-page-title" style={{ marginBottom: 0 }}>
                {categorias.find((c) => c.id === categoriaActiva)?.emoji} {categorias.find((c) => c.id === categoriaActiva)?.nombre}
              </h1>
              <button
                onClick={() => setMostrarFormPlato(!mostrarFormPlato)}
                className="btn-accent"
              >
                + Nuevo plato
              </button>
            </div>

            {mostrarFormPlato && (
              <div className="admin-card form-card" style={{ marginBottom: '20px' }}>
                <h3 className="form-card-title">Nuevo plato</h3>
                <div className="form-row">
                  <input className="form-input" placeholder="Nombre del plato" value={nuevoPlato.nombre} onChange={(e) => setNuevoPlato({ ...nuevoPlato, nombre: e.target.value })} />
                  <input className="form-input" type="number" placeholder="Precio" value={nuevoPlato.precio} onChange={(e) => setNuevoPlato({ ...nuevoPlato, precio: e.target.value })} style={{ maxWidth: '140px' }} />
                </div>
                <span className="file-label">Foto del plato</span>
                <input type="file" accept="image/*" onChange={handleImagen} style={{ marginBottom: '12px', fontSize: '13px', width: '100%' }} />
                {nuevoPlato.imagen && <img src={nuevoPlato.imagen} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />}
                <div className="form-actions">
                  <button className="btn-accent" onClick={handleAgregarPlato}>Guardar plato</button>
                  <button className="btn-secondary" onClick={() => setMostrarFormPlato(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {platosFiltrados.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <p className="empty-state-text">No hay platos en esta categoría aún</p>
              </div>
            )}

            {platosFiltrados.length > 0 && (
              <div className="admin-card">
                {/* MODAL EDICIÓN PLATO */}
                {editandoPlato && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, marginBottom: '18px', color: '#111' }}>Editar plato</h3>
                      <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Nombre</label>
                      <input
                        className="form-input"
                        value={editandoPlato.nombre}
                        onChange={(e) => setEditandoPlato({ ...editandoPlato, nombre: e.target.value })}
                        style={{ marginBottom: '12px' }}
                        autoFocus
                      />
                      <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Precio</label>
                      <input
                        className="form-input"
                        type="number"
                        value={editandoPlato.precio}
                        onChange={(e) => setEditandoPlato({ ...editandoPlato, precio: e.target.value })}
                        style={{ marginBottom: '12px' }}
                      />
                      <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Foto del plato</label>
                      <input type="file" accept="image/*" onChange={handleImagenEdicion} style={{ fontSize: '13px', marginBottom: '10px', width: '100%' }} />
                      {(editandoPlatoImagen || editandoPlato.imagen) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                          <img
                            src={editandoPlatoImagen || editandoPlato.imagen}
                            alt="preview"
                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px' }}
                          />
                          <button
                            onClick={() => { setEditandoPlatoImagen(''); setEditandoPlato({ ...editandoPlato, imagen: null }); }}
                            style={{ padding: '6px 12px', background: '#fee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#c0392b' }}
                          >
                            Quitar foto
                          </button>
                        </div>
                      )}
                      <div className="form-actions" style={{ marginTop: '4px' }}>
                        <button className="btn-accent" onClick={handleGuardarEdicionPlato}>Guardar cambios</button>
                        <button className="btn-secondary" onClick={() => { setEditandoPlato(null); setEditandoPlatoImagen(null); }}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                )}

                {platosFiltrados.map((plato) => (
                  <div key={plato.id} className="plato-card">
                    <div className="plato-card-header">
                      {plato.imagen
                        ? <img src={plato.imagen} alt={plato.nombre} className="plato-img" />
                        : <div className="plato-img-placeholder">🍔</div>
                      }
                      <div className="plato-info">
                        <div className="plato-name">{plato.nombre}</div>
                        <div className="plato-price">${plato.precio.toLocaleString()}</div>
                      </div>
                      <button className="btn-icon" onClick={() => { setEditandoPlato({ ...plato }); setEditandoPlatoImagen(null); }} style={{ fontSize: '15px' }} title="Editar">✏️</button>
                      <button className="btn-icon" onClick={() => eliminarPlato(plato.id)} style={{ fontSize: '15px' }} title="Eliminar">🗑️</button>
                    </div>

                    <div className="plato-section">
                      <div className="plato-section-title">Extras</div>
                      {plato.extras.map((extra, i) => (
                        <div key={i} className="extra-item">
                          <span>{extra.nombre} — {extra.precio > 0 ? '$' + extra.precio.toLocaleString() : 'Gratis'}</span>
                          <button className="btn-icon" onClick={() => handleEliminarExtra(plato, i)} style={{ fontSize: '13px' }}>🗑️</button>
                        </div>
                      ))}
                      {platoSeleccionado === plato.id + 'extra' ? (
                        <div style={{ marginTop: '10px' }}>
                          <div className="form-row">
                            <input className="form-input" placeholder="Nombre del extra" value={nuevoExtra.nombre} onChange={(e) => setNuevoExtra({ ...nuevoExtra, nombre: e.target.value })} />
                          </div>
                          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', cursor: 'pointer', color: '#555' }}>
                            <input type="checkbox" checked={nuevoExtra.gratis} onChange={(e) => setNuevoExtra({ ...nuevoExtra, gratis: e.target.checked })} />
                            Gratis
                          </label>
                          {!nuevoExtra.gratis && (
                            <input className="form-input" type="number" placeholder="Precio" value={nuevoExtra.precio} onChange={(e) => setNuevoExtra({ ...nuevoExtra, precio: e.target.value })} style={{ marginBottom: '8px' }} />
                          )}
                          <div className="form-actions">
                            <button className="btn-accent" onClick={() => handleAgregarExtra(plato)}>Guardar</button>
                            <button className="btn-secondary" onClick={() => setPlatoSeleccionado(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn-dashed" style={{ marginTop: '8px' }} onClick={() => setPlatoSeleccionado(plato.id + 'extra')}>+ Agregar extra</button>
                      )}
                    </div>

                    <div className="plato-section">
                      <div className="plato-section-title">Opciones</div>
                      {plato.opciones.map((op, i) => (
                        <div key={i} className="extra-item">
                          <span>{op}</span>
                          <button className="btn-icon" onClick={() => handleEliminarOpcion(plato, i)} style={{ fontSize: '13px' }}>🗑️</button>
                        </div>
                      ))}
                      {platoSeleccionado === plato.id + 'opcion' ? (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <input className="form-input" placeholder="Ej: Sin cebolla" value={nuevaOpcion} onChange={(e) => setNuevaOpcion(e.target.value)} />
                          <button className="btn-accent" onClick={() => handleAgregarOpcion(plato)}>Guardar</button>
                          <button className="btn-secondary" onClick={() => setPlatoSeleccionado(null)}>Cancelar</button>
                        </div>
                      ) : (
                        <button className="btn-dashed" style={{ marginTop: '8px' }} onClick={() => setPlatoSeleccionado(plato.id + 'opcion')}>+ Agregar opción</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
