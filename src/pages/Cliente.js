import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function Cliente({ platos = [], categorias = [], config = {}, uid, pedidosHabilitados = true }) {
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [opcionesElegidas, setOpcionesElegidas] = useState({});
  const [extrasElegidos, setExtrasElegidos] = useState({});
  const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [datosPedido, setDatosPedido] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    tipoPedido: 'domicilio',
    mesa: '',
  });
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  const color = config?.colorPrincipal || '#e74c3c';

  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('datosPedido');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      setDatosPedido({ ...datos, tipoPedido: 'domicilio', mesa: '' });
    }
  }, []);

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: color }}>
        {config?.logo ? (
          <img src={config.logo} alt="logo" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', marginBottom: '20px' }} />
        ) : (
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🍽️</div>
        )}
        <p style={{ color: 'white', fontSize: '20px', fontWeight: '500', margin: '0 0 6px' }}>{config?.nombre || 'Cargando...'}</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 24px' }}>{config?.descripcion || ''}</p>
        <div style={{ width: '48px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', background: 'white', borderRadius: '2px', animation: 'slide 1s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
      </div>
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
    const precioExtra = extraElegido
      ? plato.extras.find((e) => e.nombre === extraElegido)?.precio || 0
      : 0;
    setCarrito([
      ...carrito,
      {
        ...plato,
        extraElegido,
        opcionesElegidas: opcionesElegidas[plato.id] || [],
        precioFinal: plato.precio + precioExtra,
      },
    ]);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((sum, p) => sum + p.precioFinal, 0);

  const categoriasFiltradas = categorias.filter((c) => c.activa !== false);
  const platosFiltrados = categoriaActiva
    ? platos.filter((p) => p.categoriaId === categoriaActiva)
    : platos.filter((p) => {
        const cat = categorias.find((c) => c.id === p.categoriaId);
        return cat && cat.activa !== false;
      });

  const obtenerCoordenadas = async (direccion) => {
    try {
      const resp = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=' +
        encodeURIComponent(direccion + ', Colombia')
      );
      const data = await resp.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {}
    return null;
  };

  const handleEnviarPedido = async () => {
    if (!datosPedido.nombre || !datosPedido.telefono) {
      alert('Por favor completa nombre y telefono');
      return;
    }
    if (datosPedido.tipoPedido === 'domicilio' && !datosPedido.direccion) {
      alert('Por favor ingresa la direccion de entrega');
      return;
    }
    if (datosPedido.tipoPedido === 'mesa' && !datosPedido.mesa) {
      alert('Por favor selecciona tu mesa');
      return;
    }
    try {
      localStorage.setItem('datosPedido', JSON.stringify(datosPedido));
      const coords = datosPedido.tipoPedido === 'domicilio'
        ? await obtenerCoordenadas(datosPedido.direccion)
        : null;
      const numeroPedido = Math.floor(Math.random() * 9000 + 1000);
      await addDoc(collection(db, `restaurantes/${uid}/pedidos`), {
        nombre: datosPedido.nombre,
        telefono: datosPedido.telefono,
        direccion: datosPedido.tipoPedido === 'domicilio' ? datosPedido.direccion : datosPedido.tipoPedido === 'mesa' ? `Mesa ${datosPedido.mesa}` : 'En el sitio',
        tipoPedido: datosPedido.tipoPedido,
        mesa: datosPedido.mesa || null,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        items: carrito.map((p) => ({
          nombre: p.nombre,
          precio: p.precioFinal,
          extra: p.extraElegido || null,
          opciones: p.opcionesElegidas || [],
        })),
        total,
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* CARRITO FLOTANTE */}
      <div
        onClick={() => setCarritoAbierto(!carritoAbierto)}
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 200, background: color, color: 'white', borderRadius: '50px', padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: '500' }}
      >
        <span>🛒</span>
        <span>{carrito.length} items</span>
        {carrito.length > 0 && <span>— ${total.toLocaleString()}</span>}
      </div>

      {/* PANEL CARRITO */}
      {carritoAbierto && (
        <div style={{ position: 'fixed', top: '64px', right: '16px', zIndex: 200, background: 'white', borderRadius: '14px', padding: '16px', width: '300px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Carrito ({carrito.length} items)</h2>
          {carrito.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No hay productos aun</p>}
          {carrito.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '500' }}>{p.nombre}</p>
                {p.extraElegido && <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>+ {p.extraElegido}</p>}
                {p.opcionesElegidas.length > 0 && <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>{p.opcionesElegidas.join(', ')}</p>}
                <p style={{ margin: 0, color: color }}>${p.precioFinal.toLocaleString()}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); eliminarDelCarrito(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
            </div>
          ))}
          {carrito.length > 0 && (
            <div>
              <h3 style={{ marginTop: '12px', color: color }}>Total: ${total.toLocaleString()}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); setMostrarFormPedido(true); setCarritoAbierto(false); }}
                style={{ width: '100%', marginTop: '12px', padding: '12px', background: color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px' }}
              >
                Hacer pedido
              </button>
            </div>
          )}
        </div>
      )}

      {/* BANNER */}
      {config?.banner ? (
        <div style={{ width: '100%', height: '200px', position: 'relative' }}>
          <img src={config.banner} alt="banner" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {config?.logo && <img src={config.logo} alt="logo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />}
              <div>
                <h1 style={{ color: 'white', fontSize: '22px', margin: 0 }}>{config?.nombre || 'Mi Restaurante'}</h1>
                {config?.descripcion && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>{config.descripcion}</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: color, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {config?.logo && <img src={config.logo} alt="logo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />}
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', margin: 0 }}>{config?.nombre || 'Mi Restaurante'}</h1>
            {config?.descripcion && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>{config.descripcion}</p>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex' }}>

        {/* SIDEBAR */}
        <div style={{ width: '200px', background: 'white', padding: '20px', borderRight: '1px solid #eee', flexShrink: 0, minHeight: 'calc(100vh - 200px)' }}>
          <h2 style={{ fontSize: '14px', marginBottom: '12px', color: '#999' }}>MENU</h2>
          <div
            onClick={() => setCategoriaActiva(null)}
            style={{ padding: '10px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px', background: categoriaActiva === null ? color : 'transparent', color: categoriaActiva === null ? 'white' : '#333' }}
          >
            Todos
          </div>
          {categoriasFiltradas.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              style={{ padding: '10px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px', background: categoriaActiva === cat.id ? color : 'transparent', color: categoriaActiva === cat.id ? 'white' : '#333' }}
            >
              {cat.emoji} {cat.nombre}
            </div>
          ))}
        </div>

        {/* PLATOS */}
        <div style={{ flex: 1, padding: '24px' }}>

          {pedidoEnviado && (
            <div style={{ background: '#2ecc71', color: 'white', padding: '14px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '15px' }}>
              Pedido enviado con exito
            </div>
          )}

          {!pedidosHabilitados && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', color: '#856404' }}>
              Los pedidos en linea estan temporalmente deshabilitados
            </div>
          )}

          {categorias.length === 0 && (
            <p style={{ color: '#aaa' }}>El menu aun no tiene platos disponibles</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            {platosFiltrados.map((plato) => (
              <div key={plato.id} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                {plato.imagen ? (
                  <img src={plato.imagen} alt={plato.nombre} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '130px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                    🍔
                  </div>
                )}
                <div style={{ padding: '12px' }}>
                  <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{plato.nombre}</p>
                  <p style={{ color: color, fontSize: '14px', marginBottom: '8px' }}>${plato.precio.toLocaleString()}</p>

                  {plato.extras.length > 0 && (
                    <select
                      onChange={(e) => setExtrasElegidos({ ...extrasElegidos, [plato.id]: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', marginBottom: '8px' }}
                    >
                      <option value="">Sin extra</option>
                      {plato.extras.map((extra, i) => (
                        <option key={i} value={extra.nombre}>
                          {extra.nombre} {extra.precio > 0 ? '+$' + extra.precio.toLocaleString() : '(gratis)'}
                        </option>
                      ))}
                    </select>
                  )}

                  {plato.opciones.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      {plato.opciones.map((op, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '4px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={(opcionesElegidas[plato.id] || []).includes(op)}
                            onChange={() => toggleOpcion(plato.id, op)}
                          />
                          {op}
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => pedidosHabilitados && agregarAlCarrito(plato)}
                    style={{ width: '100%', padding: '8px', background: pedidosHabilitados ? color : '#ccc', color: 'white', border: 'none', borderRadius: '10px', cursor: pedidosHabilitados ? 'pointer' : 'not-allowed', fontSize: '13px' }}
                  >
                    {pedidosHabilitados ? 'Agregar' : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORMULARIO PEDIDO */}
      {mostrarFormPedido && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', width: '320px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Datos del pedido</h3>

            {/* TIPO DE PEDIDO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setDatosPedido({ ...datosPedido, tipoPedido: 'domicilio' })}
                style={{ padding: '10px 6px', borderRadius: '8px', border: datosPedido.tipoPedido === 'domicilio' ? `2px solid ${color}` : '1px solid #ddd', background: datosPedido.tipoPedido === 'domicilio' ? color + '15' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
              >
                🛵 Domicilio
              </button>
              <button
                onClick={() => setDatosPedido({ ...datosPedido, tipoPedido: 'sitio' })}
                style={{ padding: '10px 6px', borderRadius: '8px', border: datosPedido.tipoPedido === 'sitio' ? `2px solid ${color}` : '1px solid #ddd', background: datosPedido.tipoPedido === 'sitio' ? color + '15' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
              >
                🪑 Comer aqui
              </button>
              <button
                onClick={() => setDatosPedido({ ...datosPedido, tipoPedido: 'mesa' })}
                style={{ padding: '10px 6px', borderRadius: '8px', border: datosPedido.tipoPedido === 'mesa' ? `2px solid ${color}` : '1px solid #ddd', background: datosPedido.tipoPedido === 'mesa' ? color + '15' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
              >
                🍽️ Mesa
              </button>
            </div>

            <input
              placeholder="Tu nombre"
              value={datosPedido.nombre}
              onChange={(e) => setDatosPedido({ ...datosPedido, nombre: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }}
            />
            <input
              placeholder="Telefono"
              value={datosPedido.telefono}
              onChange={(e) => setDatosPedido({ ...datosPedido, telefono: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }}
            />

            {datosPedido.tipoPedido === 'domicilio' && (
              <input
                placeholder="Direccion de entrega"
                value={datosPedido.direccion}
                onChange={(e) => setDatosPedido({ ...datosPedido, direccion: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }}
              />
            )}

            {datosPedido.tipoPedido === 'mesa' && (
              <select
                value={datosPedido.mesa}
                onChange={(e) => setDatosPedido({ ...datosPedido, mesa: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }}
              >
                <option value="">Selecciona tu mesa</option>
                {mesas.map((m) => (
                  <option key={m} value={m}>Mesa {m}</option>
                ))}
              </select>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={handleEnviarPedido}
                style={{ flex: 1, padding: '12px', background: color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
              >
                Confirmar pedido
              </button>
              <button
                onClick={() => setMostrarFormPedido(false)}
                style={{ flex: 1, padding: '12px', background: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cliente;