import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Configuracion from './Configuracion';
import Estadisticas from './Estadisticas';

function Admin({ platos, categorias, guardarCategoria, eliminarCategoria, guardarPlato, eliminarPlato, pedidos = [], config, guardarConfig }) {
  const [vista, setVista] = useState('menu');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [mostrarFormPlato, setMostrarFormPlato] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [nuevoPlato, setNuevoPlato] = useState({ nombre: '', precio: '', imagen: null, extras: [], opciones: [] });
  const [nuevoExtra, setNuevoExtra] = useState({ nombre: '', precio: 0, gratis: false });
  const [nuevaOpcion, setNuevaOpcion] = useState('');

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
    const actualizada = { ...cat, activa: cat.activa === false ? true : false };
    guardarCategoria(actualizada);
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
    const actualizado = {
      ...plato,
      extras: [...plato.extras, {
        nombre: nuevoExtra.nombre,
        precio: nuevoExtra.gratis ? 0 : Number(nuevoExtra.precio),
      }],
    };
    guardarPlato(actualizado);
    setNuevoExtra({ nombre: '', precio: 0, gratis: false });
    setPlatoSeleccionado(null);
  };

  const handleEliminarExtra = (plato, i) => {
    const actualizado = { ...plato, extras: plato.extras.filter((_, idx) => idx !== i) };
    guardarPlato(actualizado);
  };

  const handleAgregarOpcion = (plato) => {
    if (!nuevaOpcion) return;
    const actualizado = { ...plato, opciones: [...plato.opciones, nuevaOpcion] };
    guardarPlato(actualizado);
    setNuevaOpcion('');
    setPlatoSeleccionado(null);
  };

  const handleEliminarOpcion = (plato, i) => {
    const actualizado = { ...plato, opciones: plato.opciones.filter((_, idx) => idx !== i) };
    guardarPlato(actualizado);
  };

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    await updateDoc(doc(db, 'pedidos', pedidoId), { estado: nuevoEstado });
  };

  const platosFiltrados = platos.filter((p) => p.categoriaId === categoriaActiva);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>

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
          <button onClick={() => setVista('estadisticas')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', background: vista === 'estadisticas' ? color : '#f5f5f5', color: vista === 'estadisticas' ? 'white' : '#333' }}>Estadisticas</button>
        </div>

        <h2 style={{ fontSize: '14px', marginBottom: '12px', color: '#999' }}>CATEGORIAS</h2>

        {categorias.map((cat) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', background: categoriaActiva === cat.id && vista === 'menu' ? color : 'transparent', color: categoriaActiva === cat.id && vista === 'menu' ? 'white' : '#333' }}>
            <span onClick={() => { setCategoriaActiva(cat.id); setVista('menu'); }} style={{ flex: 1, fontSize: '13px', opacity: cat.activa === false ? 0.4 : 1 }}>
              {cat.emoji} {cat.nombre}
            </span>
            <button onClick={() => handleToggleCategoria(cat)} title={cat.activa === false ? 'Activar' : 'Desactivar'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
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

      <div style={{ flex: 1, padding: '24px' }}>

        {vista === 'configuracion' && <Configuracion config={config} guardarConfig={guardarConfig} />}
        {vista === 'estadisticas' && <Estadisticas pedidos={pedidos} config={config} />}

        {vista === 'pedidos' && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Pedidos en tiempo real</h2>
            {pedidos.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No hay pedidos aun</p>}
            {[...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((pedido) => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontWeight: '500', fontSize: '15px', margin: 0 }}>{pedido.nombre}</p>
                    <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{pedido.telefono}</p>
                    <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>{pedido.direccion}</p>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                      {pedido.tipoPedido === 'sitio' ? '🪑 Comer en el sitio' : '🛵 Domicilio'} — Pedido #{pedido.numeroPedido}
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