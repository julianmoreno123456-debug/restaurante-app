import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const clienteStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .cl-root * { box-sizing: border-box; }
  .cl-root {
    min-height: 100vh;
    background: #f7f7f5;
    font-family: 'DM Sans', sans-serif;
  }

  /* SPLASH */
  .cl-splash {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center;
    animation: splashIn 0.4s ease both;
  }
  @keyframes splashIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

  .cl-splash-logo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.4);
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }
  .cl-splash-emoji { font-size: 64px; margin-bottom: 20px; }
  .cl-splash-name {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: white;
    margin: 0 0 6px;
    text-align: center;
    letter-spacing: -0.3px;
  }
  .cl-splash-desc { color: rgba(255,255,255,0.75); font-size: 13px; margin: 0 0 28px; text-align: center; }

  .cl-splash-bar {
    width: 48px;
    height: 3px;
    background: rgba(255,255,255,0.25);
    border-radius: 2px;
    overflow: hidden;
  }
  .cl-splash-fill {
    width: 40%;
    height: 100%;
    background: white;
    border-radius: 2px;
    animation: fillSlide 1s ease-in-out infinite;
  }
  @keyframes fillSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }

  /* CARRITO FLOTANTE */
  .cl-cart-fab {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 200;
    color: white;
    border-radius: 50px;
    padding: 11px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    transition: transform 0.15s, box-shadow 0.15s;
    border: none;
    letter-spacing: 0.2px;
  }
  .cl-cart-fab:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

  .cl-cart-count {
    background: rgba(255,255,255,0.25);
    border-radius: 20px;
    padding: 1px 8px;
    font-size: 12px;
  }

  /* PANEL CARRITO */
  .cl-cart-panel {
    position: fixed;
    top: 64px;
    right: 16px;
    z-index: 200;
    background: white;
    border-radius: 20px;
    padding: 20px;
    width: 320px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    animation: dropIn 0.2s ease both;
  }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .cl-cart-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #111;
    margin-bottom: 14px;
    letter-spacing: -0.2px;
  }

  .cl-cart-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f3;
  }
  .cl-cart-item:last-child { border-bottom: none; }
  .cl-cart-item-name { font-weight: 500; font-size: 13.5px; color: #111; margin-bottom: 2px; }
  .cl-cart-item-detail { font-size: 11.5px; color: #aaa; }
  .cl-cart-item-price { font-size: 13px; font-weight: 600; margin-top: 3px; }
  .cl-cart-remove { background: none; border: none; cursor: pointer; font-size: 15px; padding: 4px; border-radius: 6px; transition: background 0.15s; flex-shrink: 0; margin-left: 8px; }
  .cl-cart-remove:hover { background: #fee; }

  .cl-cart-total { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #111; margin: 14px 0 12px; }
  .cl-cart-empty { color: #bbb; font-size: 13.5px; text-align: center; padding: 20px 0; }

  /* BANNER */
  .cl-banner {
    width: 100%;
    height: 260px;
    position: relative;
    overflow: hidden;
  }

  .cl-banner-slide {
    position: absolute;
    inset: 0;
    transition: opacity 0.8s ease;
  }

  .cl-banner-img { width: 100%; height: 100%; object-fit: cover; }

  .cl-banner-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 140px;
    background: linear-gradient(transparent, rgba(0,0,0,0.72));
  }

  .cl-banner-info {
    position: absolute;
    bottom: 18px;
    left: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cl-banner-logo {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid rgba(255,255,255,0.7);
    flex-shrink: 0;
  }

  .cl-banner-name {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0 0 2px;
    text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    letter-spacing: -0.3px;
  }

  .cl-banner-desc {
    font-size: 12px;
    color: rgba(255,255,255,0.85);
    margin: 0;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .cl-banner-dots {
    position: absolute;
    bottom: 10px;
    right: 18px;
    display: flex;
    gap: 5px;
  }

  .cl-dot {
    height: 5px;
    border-radius: 3px;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
  }

  /* ALERTAS */
  .cl-alert {
    margin: 14px 16px 0;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cl-alert-success { background: #e8f8f0; color: #1a7a4a; border: 1px solid #b2dfca; }
  .cl-alert-warning { background: #fff8e1; color: #8a6200; border: 1px solid #ffe082; }
  .cl-alert-closed { background: #fce8e8; color: #b71c1c; border: 1px solid #ffcdd2; text-align: center; flex-direction: column; padding: 20px; }
  .cl-alert-closed-icon { font-size: 28px; margin-bottom: 6px; }
  .cl-alert-closed-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 3px; }

  /* CATEGORÍAS */
  .cl-cats {
    display: flex;
    gap: 8px;
    padding: 14px 16px;
    background: white;
    overflow-x: auto;
    border-bottom: 1px solid #f0f0ee;
    scrollbar-width: none;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .cl-cats::-webkit-scrollbar { display: none; }

  .cl-cat-pill {
    padding: 7px 16px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  /* PLATOS GRID */
  .cl-platos { padding: 18px 16px; }

  .cl-platos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  .cl-plato-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .cl-plato-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

  .cl-plato-img { width: 100%; height: 120px; object-fit: cover; }
  .cl-plato-placeholder { width: 100%; height: 120px; background: #f5f5f3; display: flex; align-items: center; justify-content: center; font-size: 36px; }
  .cl-plato-body { padding: 12px; }
  .cl-plato-name { font-weight: 500; font-size: 14px; color: #111; margin-bottom: 3px; line-height: 1.3; }
  .cl-plato-price { font-size: 14px; font-weight: 600; margin-bottom: 10px; }

  .cl-extra-select {
    width: 100%;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1.5px solid #e8e8e8;
    font-size: 12px;
    margin-bottom: 8px;
    font-family: 'DM Sans', sans-serif;
    color: #444;
    outline: none;
  }

  .cl-opcion-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    margin-bottom: 4px;
    cursor: pointer;
    color: #555;
  }

  .cl-add-btn {
    width: 100%;
    padding: 9px;
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s;
    letter-spacing: 0.2px;
  }
  .cl-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cl-add-btn:not(:disabled):hover { opacity: 0.88; }

  /* MODAL PEDIDO */
  .cl-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 300;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .cl-modal {
    background: white;
    border-radius: 24px 24px 0 0;
    padding: 24px 20px 32px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .cl-modal-handle {
    width: 40px;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin: 0 auto 20px;
  }

  .cl-modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #111;
    margin-bottom: 18px;
    letter-spacing: -0.3px;
  }

  .cl-tipo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .cl-tipo-btn {
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    text-align: center;
  }

  .cl-modal-input {
    width: 100%;
    padding: 13px 14px;
    border: 1.5px solid #e8e8e8;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    outline: none;
    margin-bottom: 10px;
    transition: border-color 0.15s;
  }
  .cl-modal-input:focus { border-color: #111; }
  .cl-modal-input::placeholder { color: #bbb; }

  .cl-modal-actions { display: flex; gap: 10px; margin-top: 6px; }

  .cl-btn-confirm {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    letter-spacing: 0.2px;
  }
  .cl-btn-confirm:hover { opacity: 0.88; }

  .cl-btn-cancel {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: #f5f5f3;
    color: #555;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cl-btn-cancel:hover { background: #eeeeeb; }
`;

function Cliente({ platos = [], categorias = [], config = {}, uid, pedidosHabilitados = true }) {
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [opcionesElegidas, setOpcionesElegidas] = useState({});
  const [extrasElegidos, setExtrasElegidos] = useState({});
  const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [datosPedido, setDatosPedido] = useState({ nombre: '', telefono: '', direccion: '', mesa: '', tipoPedido: 'domicilio' });
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const categoriasRef = useRef(null);

  const color = config?.colorPrincipal || '#e74c3c';

  const estaAbierto = () => {
    if (!config?.horarioActivo) return true;
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [hA, mA] = (config.horarioApertura || '08:00').split(':').map(Number);
    const [hC, mC] = (config.horarioCierre || '22:00').split(':').map(Number);
    return horaActual >= (hA * 60 + mA) && horaActual < (hC * 60 + mC);
  };

  const restauranteAbierto = estaAbierto();
  const imagenesPlatos = platos.filter((p) => p.imagen).map((p) => ({ imagen: p.imagen, nombre: p.nombre }));
  const imagenesCarrusel = config?.banner
    ? [{ imagen: config.banner, nombre: config.nombre }, ...imagenesPlatos]
    : imagenesPlatos;

  useEffect(() => {
    if (config?.nombre && config.nombre !== 'Mi Restaurante') {
      const timer = setTimeout(() => setCargando(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [config]);

  useEffect(() => {
    if (imagenesCarrusel.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % imagenesCarrusel.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [imagenesCarrusel.length]);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('datosPedido');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      setDatosPedido({ ...datos, tipoPedido: 'domicilio', mesa: '' });
    }
  }, []);

  if (cargando) {
    return (
      <>
        <style>{clienteStyles}</style>
        <div className="cl-splash" style={{ background: color }}>
          {config?.logo
            ? <img src={config.logo} alt="logo" className="cl-splash-logo" />
            : <div className="cl-splash-emoji">🍽️</div>
          }
          <p className="cl-splash-name">{config?.nombre || 'Cargando...'}</p>
          {config?.descripcion && <p className="cl-splash-desc">{config.descripcion}</p>}
          <div className="cl-splash-bar">
            <div className="cl-splash-fill" />
          </div>
        </div>
      </>
    );
  }

  const toggleOpcion = (platoId, opcion) => {
    const actuales = opcionesElegidas[platoId] || [];
    if (actuales.includes(opcion)) {
      setOpcionesElegidas({ ...opcionesElegidas, [platoId]: actuales.filter((o) => o !== opcion) });
    } else {
      setOpcionesElegidas({ ...opcionesElegidas, [platoId]: [...actuales, opcion] });
    }
  };

  const agregarAlCarrito = (plato) => {
    const extraElegido = extrasElegidos[plato.id] || null;
    const precioExtra = extraElegido ? plato.extras.find((e) => e.nombre === extraElegido)?.precio || 0 : 0;
    setCarrito([...carrito, { ...plato, extraElegido, opcionesElegidas: opcionesElegidas[plato.id] || [], precioFinal: plato.precio + precioExtra }]);
  };

  const eliminarDelCarrito = (index) => { setCarrito(carrito.filter((_, i) => i !== index)); };
  const COSTO_DOMICILIO = config?.costoDomicilio ?? 2000;
  const total = carrito.reduce((sum, p) => sum + p.precioFinal, 0);
  const totalConDomicilio = total + (datosPedido.tipoPedido === 'domicilio' ? COSTO_DOMICILIO : 0);
  const categoriasFiltradas = categorias.filter((c) => c.activa !== false);
  const platosFiltrados = categoriaActiva
    ? platos.filter((p) => p.categoriaId === categoriaActiva)
    : platos.filter((p) => { const cat = categorias.find((c) => c.id === p.categoriaId); return cat && cat.activa !== false; });

  const obtenerCoordenadas = async (direccion) => {
    try {
      const resp = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(direccion + ', Colombia'));
      const data = await resp.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) {}
    return null;
  };

  const handleEnviarPedido = async () => {
    if (!datosPedido.nombre || !datosPedido.telefono) { alert('Por favor completa nombre y telefono'); return; }
    if (datosPedido.tipoPedido === 'domicilio' && !datosPedido.direccion) { alert('Por favor ingresa la direccion de entrega'); return; }
    if (datosPedido.tipoPedido === 'sitio' && !datosPedido.mesa) { alert('Por favor selecciona tu mesa'); return; }
    try {
      localStorage.setItem('datosPedido', JSON.stringify(datosPedido));
      const coords = datosPedido.tipoPedido === 'domicilio' ? await obtenerCoordenadas(datosPedido.direccion) : null;
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
        nombre: datosPedido.nombre,
        telefono: datosPedido.telefono,
        direccion: datosPedido.tipoPedido === 'domicilio' ? datosPedido.direccion : `Mesa ${datosPedido.mesa}`,
        tipoPedido: datosPedido.tipoPedido,
        mesa: datosPedido.mesa || null,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        items: carrito.map((p) => ({ nombre: p.nombre, precio: p.precioFinal, extra: p.extraElegido || null, opciones: p.opcionesElegidas || [] })),
        total: totalConDomicilio,
        numeroPedido,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      });
      setCarrito([]);
      setMostrarFormPedido(false);
      setCarritoAbierto(false);
      setPedidoEnviado(true);
      setTimeout(() => setPedidoEnviado(false), 5000);
    } catch (error) {
      alert('Error al enviar el pedido: ' + error.message);
    }
  };

  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);
  const puedeAgregar = pedidosHabilitados && restauranteAbierto;

  return (
    <>
      <style>{clienteStyles}</style>
      <div className="cl-root">

        {/* CARRITO FAB */}
        <button
          className="cl-cart-fab"
          style={{ background: color }}
          onClick={() => setCarritoAbierto(!carritoAbierto)}
        >
          🛒
          <span className="cl-cart-count">{carrito.length}</span>
          {carrito.length > 0 && <span>— ${total.toLocaleString()}</span>}        </button>

        {/* PANEL CARRITO */}
        {carritoAbierto && (
          <div className="cl-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cl-cart-title">🛒 Tu carrito</div>
            {carrito.length === 0
              ? <p className="cl-cart-empty">Aún no hay productos</p>
              : carrito.map((p, i) => (
                  <div key={i} className="cl-cart-item">
                    <div style={{ flex: 1 }}>
                      <div className="cl-cart-item-name">{p.nombre}</div>
                      {p.extraElegido && <div className="cl-cart-item-detail">+ {p.extraElegido}</div>}
                      {p.opcionesElegidas.length > 0 && <div className="cl-cart-item-detail">{p.opcionesElegidas.join(', ')}</div>}
                      <div className="cl-cart-item-price" style={{ color }}>${p.precioFinal.toLocaleString()}</div>
                    </div>
                    <button className="cl-cart-remove" onClick={() => eliminarDelCarrito(i)}>🗑️</button>
                  </div>
                ))
            }
            {carrito.length > 0 && (
              <>
                <div className="cl-cart-total">Total: ${totalConDomicilio.toLocaleString()}</div>
                <button
                  onClick={() => { setMostrarFormPedido(true); setCarritoAbierto(false); }}
                  className="cl-add-btn"
                  style={{ background: color }}
                >
                  Hacer pedido →
                </button>
              </>
            )}
          </div>
        )}

        {/* BANNER */}
        <div className="cl-banner" style={{ background: color }}>
          {imagenesCarrusel.length > 0
            ? imagenesCarrusel.map((img, i) => (
                <div key={i} className="cl-banner-slide" style={{ opacity: i === bannerIndex ? 1 : 0 }}>
                  <img src={img.imagen} alt={img.nombre} className="cl-banner-img" />
                </div>
              ))
            : null
          }
          <div className="cl-banner-overlay" />
          <div className="cl-banner-info">
            {config?.logo && <img src={config.logo} alt="logo" className="cl-banner-logo" />}
            <div>
              <h1 className="cl-banner-name">{config?.nombre || 'Mi Restaurante'}</h1>
              {config?.descripcion && <p className="cl-banner-desc">{config.descripcion}</p>}
            </div>
          </div>
          {imagenesCarrusel.length > 1 && (
            <div className="cl-banner-dots">
              {imagenesCarrusel.map((_, i) => (
                <div
                  key={i}
                  className="cl-dot"
                  onClick={() => setBannerIndex(i)}
                  style={{ width: i === bannerIndex ? '18px' : '6px', opacity: i === bannerIndex ? 1 : 0.45 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* CATEGORÍAS */}
        <div className="cl-cats" ref={categoriasRef}>
          <button
            className="cl-cat-pill"
            onClick={() => setCategoriaActiva(null)}
            style={{ background: categoriaActiva === null ? color : '#f0f0ee', color: categoriaActiva === null ? 'white' : '#555' }}
          >
            Todos
          </button>
          {categoriasFiltradas.map((cat) => (
            <button
              key={cat.id}
              className="cl-cat-pill"
              onClick={() => setCategoriaActiva(cat.id)}
              style={{ background: categoriaActiva === cat.id ? color : '#f0f0ee', color: categoriaActiva === cat.id ? 'white' : '#555' }}
            >
              {cat.emoji} {cat.nombre}
            </button>
          ))}
        </div>

        {/* ALERTAS */}
        <div className="cl-platos" style={{ paddingTop: '14px', paddingBottom: '6px' }}>
          {pedidoEnviado && (
            <div className="cl-alert cl-alert-success">
              ✅ ¡Pedido enviado con éxito! Te contactaremos pronto.
            </div>
          )}
          {!pedidosHabilitados && (
            <div className="cl-alert cl-alert-warning">
              ⏸️ Los pedidos en línea están temporalmente deshabilitados.
            </div>
          )}
          {pedidosHabilitados && !restauranteAbierto && (
            <div className="cl-alert cl-alert-closed">
              <div className="cl-alert-closed-icon">🔒</div>
              <div className="cl-alert-closed-title">Restaurante cerrado</div>
              <div style={{ fontSize: '13px' }}>Horario: {config?.horarioApertura || '08:00'} – {config?.horarioCierre || '22:00'}</div>
            </div>
          )}
        </div>

        {/* PLATOS */}
        <div className="cl-platos">
          {categorias.length === 0 && (
            <p style={{ color: '#bbb', textAlign: 'center', fontSize: '14px', padding: '40px 0' }}>El menú aún no tiene platos disponibles</p>
          )}
          <div className="cl-platos-grid">
            {platosFiltrados.map((plato) => (
              <div key={plato.id} className="cl-plato-card">
                {plato.imagen
                  ? <img src={plato.imagen} alt={plato.nombre} className="cl-plato-img" />
                  : <div className="cl-plato-placeholder">🍔</div>
                }
                <div className="cl-plato-body">
                  <div className="cl-plato-name">{plato.nombre}</div>
                  <div className="cl-plato-price" style={{ color }}>${plato.precio.toLocaleString()}</div>

                  {plato.extras.length > 0 && (
                    <select
                      className="cl-extra-select"
                      onChange={(e) => setExtrasElegidos({ ...extrasElegidos, [plato.id]: e.target.value })}
                    >
                      <option value="">Sin extra</option>
                      {plato.extras.map((extra, i) => (
                        <option key={i} value={extra.nombre}>{extra.nombre} {extra.precio > 0 ? `+$${extra.precio.toLocaleString()}` : '(gratis)'}</option>
                      ))}
                    </select>
                  )}

                  {plato.opciones.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      {plato.opciones.map((op, i) => (
                        <label key={i} className="cl-opcion-label">
                          <input type="checkbox" checked={(opcionesElegidas[plato.id] || []).includes(op)} onChange={() => toggleOpcion(plato.id, op)} />
                          {op}
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    className="cl-add-btn"
                    style={{ background: puedeAgregar ? color : '#ccc' }}
                    disabled={!puedeAgregar}
                    onClick={() => puedeAgregar && agregarAlCarrito(plato)}
                  >
                    {!pedidosHabilitados ? 'No disponible' : !restauranteAbierto ? 'Cerrado' : 'Agregar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL PEDIDO */}
        {mostrarFormPedido && (
          <div className="cl-modal-overlay" onClick={() => setMostrarFormPedido(false)}>
            <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cl-modal-handle" />
              <div className="cl-modal-title">Datos del pedido</div>

              <div className="cl-tipo-grid">
                <button
                  className="cl-tipo-btn"
                  onClick={() => setDatosPedido({ ...datosPedido, tipoPedido: 'domicilio', mesa: '' })}
                  style={{ border: datosPedido.tipoPedido === 'domicilio' ? `2px solid ${color}` : '1.5px solid #e8e8e8', background: datosPedido.tipoPedido === 'domicilio' ? color + '14' : 'white', color: datosPedido.tipoPedido === 'domicilio' ? color : '#555' }}
                >
                  🛵 Domicilio
                </button>
                <button
                  className="cl-tipo-btn"
                  onClick={() => setDatosPedido({ ...datosPedido, tipoPedido: 'sitio', direccion: '' })}
                  style={{ border: datosPedido.tipoPedido === 'sitio' ? `2px solid ${color}` : '1.5px solid #e8e8e8', background: datosPedido.tipoPedido === 'sitio' ? color + '14' : 'white', color: datosPedido.tipoPedido === 'sitio' ? color : '#555' }}
                >
                  🪑 Comer aquí
                </button>
              </div>

              <input className="cl-modal-input" placeholder="Tu nombre" value={datosPedido.nombre} onChange={(e) => setDatosPedido({ ...datosPedido, nombre: e.target.value })} />
              <input className="cl-modal-input" placeholder="Teléfono" value={datosPedido.telefono} onChange={(e) => setDatosPedido({ ...datosPedido, telefono: e.target.value })} />
              {datosPedido.tipoPedido === 'domicilio' && (
                <input className="cl-modal-input" placeholder="Dirección de entrega" value={datosPedido.direccion} onChange={(e) => setDatosPedido({ ...datosPedido, direccion: e.target.value })} />
              )}
              {datosPedido.tipoPedido === 'sitio' && (
                <select className="cl-modal-input" value={datosPedido.mesa} onChange={(e) => setDatosPedido({ ...datosPedido, mesa: e.target.value })}>
                  <option value="">Selecciona tu mesa</option>
                  {mesas.map((m) => <option key={m} value={m}>Mesa {m}</option>)}
                </select>
              )}

              <div className="cl-modal-actions">
                {datosPedido.tipoPedido === 'domicilio' && (
                  <div style={{ gridColumn: '1/-1', background: '#f7f7f5', borderRadius: '10px', padding: '12px 14px', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Subtotal productos</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>🛵 Domicilio</span>
                      <span>${COSTO_DOMICILIO.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', color: '#111', borderTop: '1px solid #e8e8e8', paddingTop: '6px' }}>
                      <span>Total</span>
                      <span style={{ color }}>${totalConDomicilio.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <button className="cl-btn-confirm" style={{ background: color }} onClick={handleEnviarPedido}>
                  Confirmar →
                </button>
                <button className="cl-btn-cancel" onClick={() => setMostrarFormPedido(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cliente;
