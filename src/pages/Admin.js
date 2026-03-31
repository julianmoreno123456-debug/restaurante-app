import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Configuracion from './Configuracion';
import Estadisticas from './Estadisticas';

function Admin({ platos, categorias, guardarCategoria, eliminarCategoria, guardarPlato, eliminarPlato, pedidos = [], config, guardarConfig, pedidosHabilitados = false, uid }) {
  const [vista, setVista] = useState('menu');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [mostrarFormPlato, setMostrarFormPlato] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [nuevoPlato, setNuevoPlato] = useState({ nombre: '', precio: '', imagen: null, extras: [], opciones: [] });
  const [nuevoExtra, setNuevoExtra] = useState({ nombre: '', precio: 0, gratis: false });
  const [nuevaOpcion, setNuevaOpcion] = useState('');

  // Pedido manual
  const [carritoManual, setCarritoManual] = useState([]);
  const [extrasElegidosManual, setExtrasElegidosManual] = useState({});
  const [opcionesElegidasManual, setOpcionesElegidasManual] = useState({});
  const [categoriaActivaManual, setCategoriaActivaManual] = useState(null);
  const [datosManual, setDatosManual] = useState({ nombre: '', telefono: '', direccion: '', tipoPedido: 'domicilio', mesa: '' });

  const color = config?.colorPrincipal || '#e74c3c';

  const handleCerrarSesion = async () => {
    await signOut(auth);
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

  // PEDIDO MANUAL
  const agregarAlCarritoManual = (plato) => {
    const extraElegido = extrasElegidosManual[plato.id] || null;
    const precioExtra = extraElegido ? plato.extras.find((e) => e.nombre === extraElegido)?.precio || 0 : 0;
    setCarritoManual([...carritoManual, {
      ...plato,
      extraElegido,
      opcionesElegidas: opcionesElegidasManual[plato.id] || [],
      precioFinal: plato.precio + precioExtra,
    }]);
  };

  const eliminarDelCarritoManual = (i) => {
    setCarritoManual(carritoManual.filter((_, idx) => idx !== i));
  };

  const toggleOpcionManual = (platoId, opcion) => {
    const actuales = opcionesElegidasManual[platoId] || [];
    if (actuales.includes(opcion)) {
      setOpcionesElegidasManual({ ...opcionesElegidasManual, [platoId]: actuales.filter((o) => o !== opcion) });
    } else {
      setOpcionesElegidasManual({ ...opcionesElegidasManual, [platoId]: [...actuales, opcion] });
    }
  };

  const totalManual = carritoManual.reduce((sum, p) => sum + p.precioFinal, 0);

  const handleEnviarPedidoManual = async () => {
    if (!datosManual.nombre || !datosManual.telefono) {
      alert('Completa nombre y telefono');
      return;
    }
    if (datosManual.tipoPedido === 'domicilio' && !datosManual.direccion) {
      alert('Ingresa la direccion');
      return;
    }
    if (datosManual.tipoPedido === 'sitio' && !datosManual.mesa) {
      alert('Selecciona la mesa');
      return;
    }
    if (carritoManual.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    const numeroPedido = Math.floor(Math.random() * 9000 + 1000);
    await addDoc(collection(db, `restaurantes/${uid}/pedidos`), {
      nombre: datosManual.nombre,
      telefono: datosManual.telefono,
      direccion: datosManual.tipoPedido === 'domicilio' ? datosManual.direccion : `Mesa ${datosManual.mesa}`,
      tipoPedido: datosManual.tipoPedido,
      mesa: datosManual.mesa || null,
      lat: null,
      lng: null,
      items: carritoManual.map((p) => ({
        nombre: p.nombre,
        precio: p.precioFinal,
        extra: p.extraElegido || null,
        opciones: p.opcionesElegidas || [],
      })),
      total: totalManual,
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
  const platosFiltradosManual = categoriaActivaManual
    ? platos.filter((p) => p.categoriaId === categoriaActivaManual)
    : platos;
  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>

      {/* SIDEBAR */}
      <div style={{ width: '220px', background: 'white', padding: '20px', borderRight: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
          {config?.logo && <img src={config.logo} alt="logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} />}
          <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>{config?.nombre || 'Mi Restaurante'}</p>
        </div>

        <button onClick={handleCerrarSesion} style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#999', marginBottom: '16px' }}>
          Cerrar sesion
        </button>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setVista('menu')} style={{ width: '100%', padding: '10px', marginBottom: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'menu' ? color : '#f5f5f5', color: vista === 'menu' ? 'white' : '#333' }}>Menu</button>
          <button onClick={() => setVista('pedidos')} style={{ width: '100%', padding: '10px', marginBottom: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'pedidos' ? color : '#f5f5f5', color: vista === 'pedidos' ? 'white' : '#333' }}>
            Pedidos {pedidos.filter(p => p.estado === 'pendiente').length > 0 && (
              <span style={{ background: '#2ecc71', color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', marginLeft: '6px' }}>
                {pedidos.filter(p => p.estado === 'pendiente').length}
              </span>
            )}
          </button>
          <button onClick={() => setVista('configuracion')} style={{ width: '100%', padding: '10px', marginBottom: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'configuracion' ? color : '#f5f5f5', color: vista === 'configuracion' ? 'white' : '#333' }}>Configuracion</button>
          <button onClick={() => setVista('estadisticas')} style={{ width: '100%', padding: '10px', marginBottom: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'estadisticas' ? color : '#f5f5f5', color: vista === 'estadisticas' ? 'white' : '#333' }}>Estadisticas</button>
          {pedidosHabilitados && (
            <button onClick={() => setVista('pedido_manual')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'pedido_manual' ? color : '#f5f5f5', color: vista === 'pedido_manual' ? 'white' : '#333' }}>
              Nuevo pedido
            </button>
          )}
        </div>

        <h2 style={{ fontSize: '14px', marginBottom: '12px', color: '#999' }}>CATEGORIAS</h2>

        {categorias.map((cat) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', background: categoriaActiva === cat.id && vista === 'menu' ? color : 'transparent', color: categoriaActiva === cat.id && vista === 'menu' ? 'white' : '#333' }}>
            <span onClick={() => { setCategoriaActiva(cat.id); setVista('menu'); }} style={{ flex: 1, fontSize: '13px', opacity: cat.activa === false ? 0.4 : 1 }}>
              {cat.emoji} {cat.nombre}
            </span>
            <button onClick={() => handleToggleCategoria(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
              {cat.activa === false ? '👁️' : '🙈'}
            </button>
            <button onClick={() => handleEliminarCategoria(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>🗑️</button>
          </div>
        ))}

        {mostrarFormCategoria ? (
          <div style={{ marginTop: '10px' }}>
            <input placeholder="Nombre categoria" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px' }} />
            <button onClick={handleAgregarCategoria} style={{ width: '100%', padding: '8px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px' }}>Guardar</button>
            <button onClick={() => setMostrarFormCategoria(false)} style={{ width: '100%', padding: '8px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setMostrarFormCategoria(true)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px dashed #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '10px' }}>
            + Nueva categoria
          </button>
        )}
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, padding: '24px' }}>

        {vista === 'configuracion' && <Configuracion config={config} guardarConfig={guardarConfig} />}
        {vista === 'estadisticas' && <Estadisticas pedidos={pedidos} config={config} />}

        {/* PEDIDO MANUAL */}
        {vista === 'pedido_manual' && (
          <div style={{ display: 'flex', gap: '20px' }}>

            {/* MENU */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuevo pedido manual</h2>

              {/* CATEGORIAS */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button
                  onClick={() => setCategoriaActivaManual(null)}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', background: categoriaActivaManual === null ? color : '#eee', color: categoriaActivaManual === null ? 'white' : '#333' }}
                >
                  Todos
                </button>
                {categorias.filter(c => c.activa !== false).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActivaManual(cat.id)}
                    style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', background: categoriaActivaManual === cat.id ? color : '#eee', color: categoriaActivaManual === cat.id ? 'white' : '#333' }}
                  >
                    {cat.emoji} {cat.nombre}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {platosFiltradosManual.map((plato) => (
                  <div key={plato.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {plato.imagen ? (
                      <img src={plato.imagen} alt={plato.nombre} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🍔</div>
                    )}
                    <div style={{ padding: '10px' }}>
                      <p style={{ fontWeight: '500', fontSize: '13px', margin: '0 0 4px' }}>{plato.nombre}</p>
                      <p style={{ color: color, fontSize: '13px', margin: '0 0 8px' }}>${plato.precio.toLocaleString()}</p>

                      {plato.extras.length > 0 && (
                        <select onChange={(e) => setExtrasElegidosManual({ ...extrasElegidosManual, [plato.id]: e.target.value })} style={{ width: '100%', padding: '5px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '11px', marginBottom: '6px' }}>
                          <option value="">Sin extra</option>
                          {plato.extras.map((extra, i) => (
                            <option key={i} value={extra.nombre}>{extra.nombre} {extra.precio > 0 ? '+$' + extra.precio.toLocaleString() : '(gratis)'}</option>
                          ))}
                        </select>
                      )}

                      {plato.opciones.length > 0 && (
                        <div style={{ marginBottom: '6px' }}>
                          {plato.opciones.map((op, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginBottom: '2px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={(opcionesElegidasManual[plato.id] || []).includes(op)} onChange={() => toggleOpcionManual(plato.id, op)} />
                              {op}
                            </label>
                          ))}
                        </div>
                      )}

                      <button onClick={() => agregarAlCarritoManual(plato)} style={{ width: '100%', padding: '6px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FORMULARIO */}
            <div style={{ width: '300px', flexShrink: 0 }}>
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '24px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Datos del pedido</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                  <button onClick={() => setDatosManual({ ...datosManual, tipoPedido: 'domicilio', mesa: '' })} style={{ padding: '8px', borderRadius: '8px', border: datosManual.tipoPedido === 'domicilio' ? `2px solid ${color}` : '1px solid #ddd', background: datosManual.tipoPedido === 'domicilio' ? color + '15' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                    🛵 Domicilio
                  </button>
                  <button onClick={() => setDatosManual({ ...datosManual, tipoPedido: 'sitio', direccion: '' })} style={{ padding: '8px', borderRadius: '8px', border: datosManual.tipoPedido === 'sitio' ? `2px solid ${color}` : '1px solid #ddd', background: datosManual.tipoPedido === 'sitio' ? color + '15' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                    🪑 Mesa
                  </button>
                </div>

                <input placeholder="Nombre del cliente" value={datosManual.nombre} onChange={(e) => setDatosManual({ ...datosManual, nombre: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px' }} />
                <input placeholder="Telefono" value={datosManual.telefono} onChange={(e) => setDatosManual({ ...datosManual, telefono: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px' }} />

                {datosManual.tipoPedido === 'domicilio' && (
                  <input placeholder="Direccion" value={datosManual.direccion} onChange={(e) => setDatosManual({ ...datosManual, direccion: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px' }} />
                )}

                {datosManual.tipoPedido === 'sitio' && (
                  <select value={datosManual.mesa} onChange={(e) => setDatosManual({ ...datosManual, mesa: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px' }}>
                    <option value="">Selecciona la mesa</option>
                    {mesas.map((m) => <option key={m} value={m}>Mesa {m}</option>)}
                  </select>
                )}

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', marginTop: '4px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Productos</p>
                  {carritoManual.length === 0 && <p style={{ color: '#aaa', fontSize: '12px' }}>No hay productos aun</p>}
                  {carritoManual.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '500' }}>{p.nombre}</p>
                        {p.extraElegido && <p style={{ margin: 0, color: '#777' }}>+ {p.extraElegido}</p>}
                        {p.opcionesElegidas.length > 0 && <p style={{ margin: 0, color: '#777' }}>{p.opcionesElegidas.join(', ')}</p>}
                        <p style={{ margin: 0, color: color }}>${p.precioFinal.toLocaleString()}</p>
                      </div>
                      <button onClick={() => eliminarDelCarritoManual(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </div>
                  ))}
                </div>

                {carritoManual.length > 0 && (
                  <p style={{ fontWeight: '500', fontSize: '14px', color: color, marginBottom: '10px' }}>Total: ${totalManual.toLocaleString()}</p>
                )}

                <button onClick={handleEnviarPedidoManual} style={{ width: '100%', padding: '10px', background: color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                  Confirmar pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {vista === 'pedidos' && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Pedidos en tiempo real</h2>
            {pedidos.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No hay pedidos aun</p>}
            {[...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((pedido) => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <p style={{ fontWeight: '500', fontSize: '15px', margin: 0 }}>{pedido.nombre}</p>
                      {pedido.manual && <span style={{ fontSize: '10px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '10px', color: '#777' }}>Manual</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{pedido.telefono}</p>
                    <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{pedido.direccion}</p>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                      {pedido.tipoPedido === 'sitio' ? '🪑 Mesa' : '🛵 Domicilio'} — #{pedido.numeroPedido}
                    </p>
                  </div>
                  <select
                    value={pedido.estado}
                    onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', background: pedido.estado === 'pendiente' ? '#fff3cd' : pedido.estado === 'preparando' ? '#cce5ff' : pedido.estado === 'en camino' ? '#d4edda' : '#f8f9fa' }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">En preparacion</option>
                    <option value="en camino">En camino</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                  {pedido.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{item.nombre} {item.extra ? '+ ' + item.extra : ''} {item.opciones && item.opciones.length > 0 ? '(' + item.opciones.join(', ') + ')' : ''}</span>
                      <span>${item.precio.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <span>Total</span>
                    <span style={{ color: color }}>${pedido.total.toLocaleString()}</span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#aaa', margin: '8px 0 0' }}>{new Date(pedido.fecha).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {vista === 'menu' && !categoriaActiva && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#aaa' }}>
            <p style={{ fontSize: '40px' }}>👈</p>
            <p>Selecciona una categoria del menu lateral</p>
          </div>
        )}

        {vista === 'menu' && categoriaActiva && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px' }}>{categorias.find((c) => c.id === categoriaActiva)?.nombre}</h2>
              <button onClick={() => setMostrarFormPlato(!mostrarFormPlato)} style={{ padding: '10px 18px', background: color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>+ Nuevo plato</button>
            </div>

            {mostrarFormPlato && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ marginBottom: '14px', fontSize: '15px' }}>Nuevo plato</h3>
                <input placeholder="Nombre del plato" value={nuevoPlato.nombre} onChange={(e) => setNuevoPlato({ ...nuevoPlato, nombre: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }} />
                <input type="number" placeholder="Precio" value={nuevoPlato.precio} onChange={(e) => setNuevoPlato({ ...nuevoPlato, precio: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px' }} />
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Foto del plato</label>
                <input type="file" accept="image/*" onChange={handleImagen} style={{ marginBottom: '10px', fontSize: '13px' }} />
                {nuevoPlato.imagen && <img src={nuevoPlato.imagen} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAgregarPlato} style={{ flex: 1, padding: '10px', background: color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Guardar plato</button>
                  <button onClick={() => setMostrarFormPlato(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            )}

            {platosFiltrados.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No hay platos en esta categoria aun</p>}

            {platosFiltrados.map((plato) => (
              <div key={plato.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {plato.imagen && <img src={plato.imagen} alt={plato.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px' }} />}
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '15px', margin: 0 }}>{plato.nombre}</p>
                      <p style={{ color: color, fontSize: '14px', margin: 0 }}>${plato.precio.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => eliminarPlato(plato.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Extras</p>
                  {plato.extras.map((extra, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{extra.nombre} — {extra.precio > 0 ? '$' + extra.precio.toLocaleString() : 'Gratis'}</span>
                      <button onClick={() => handleEliminarExtra(plato, i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  ))}
                  {platoSeleccionado === plato.id + 'extra' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      <input placeholder="Nombre del extra" value={nuevoExtra.nombre} onChange={(e) => setNuevoExtra({ ...nuevoExtra, nombre: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }} />
                      <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={nuevoExtra.gratis} onChange={(e) => setNuevoExtra({ ...nuevoExtra, gratis: e.target.checked })} />
                        Gratis
                      </label>
                      {!nuevoExtra.gratis && (
                        <input type="number" placeholder="Precio" value={nuevoExtra.precio} onChange={(e) => setNuevoExtra({ ...nuevoExtra, precio: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }} />
                      )}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleAgregarExtra(plato)} style={{ flex: 1, padding: '8px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Guardar</button>
                        <button onClick={() => setPlatoSeleccionado(null)} style={{ flex: 1, padding: '8px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setPlatoSeleccionado(plato.id + 'extra')} style={{ padding: '6px 12px', background: '#fff', border: '1px dashed #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}>+ Agregar extra</button>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Opciones</p>
                  {plato.opciones.map((op, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{op}</span>
                      <button onClick={() => handleEliminarOpcion(plato, i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  ))}
                  {platoSeleccionado === plato.id + 'opcion' ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <input placeholder="Ej: Sin cebolla" value={nuevaOpcion} onChange={(e) => setNuevaOpcion(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }} />
                      <button onClick={() => handleAgregarOpcion(plato)} style={{ padding: '8px 12px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Guardar</button>
                      <button onClick={() => setPlatoSeleccionado(null)} style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setPlatoSeleccionado(plato.id + 'opcion')} style={{ padding: '6px 12px', background: '#fff', border: '1px dashed #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}>+ Agregar opcion</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;