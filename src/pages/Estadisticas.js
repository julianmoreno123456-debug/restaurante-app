import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

function CapaCalor({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (!puntos || puntos.length === 0) return;
    const heat = L.heatLayer(puntos, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.2: 'blue', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' },
    });
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [puntos, map]);
  return null;
}

function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) {
      map.setView(centro, 14);
    }
  }, [centro, map]);
  return null;
}

function Estadisticas({ pedidos = [], config = {} }) {
  const [vistaFecha, setVistaFecha] = useState('semana');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechaUnica, setFechaUnica] = useState('');
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [centroMapa, setCentroMapa] = useState([4.711, -74.0721]);

  const hoy = new Date();

  useEffect(() => {
    if (!config.direccionRestaurante) return;
    fetch(
      'https://nominatim.openstreetmap.org/search?format=json&q=' +
      encodeURIComponent(config.direccionRestaurante)
    )
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCentroMapa([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch((e) => console.log('Error:', e));
  }, [config.direccionRestaurante]);

  const filtrarPedidos = () => {
    return pedidos.filter((p) => {
      const fecha = new Date(p.fecha);
      if (vistaFecha === 'hoy') {
        return fecha.toDateString() === hoy.toDateString();
      }
      if (vistaFecha === 'fecha_unica' && fechaUnica) {
        return fecha.toDateString() === new Date(fechaUnica + 'T00:00:00').toDateString();
      }
      if (vistaFecha === 'intervalo' && fechaDesde && fechaHasta) {
        const desde = new Date(fechaDesde + 'T00:00:00');
        const hasta = new Date(fechaHasta + 'T23:59:59');
        return fecha >= desde && fecha <= hasta;
      }
      const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
      if (vistaFecha === 'semana') return diff < 7;
      if (vistaFecha === 'mes') return diff < 30;
      return true;
    });
  };

  const pedidosFiltrados = filtrarPedidos();
  const totalVentas = pedidosFiltrados.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalPedidos = pedidosFiltrados.length;
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0;

  const ventasPorDia = () => {
    const mapa = {};
    pedidosFiltrados.forEach((p) => {
      const dia = new Date(p.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      mapa[dia] = (mapa[dia] || 0) + (p.total || 0);
    });
    return Object.entries(mapa).slice(-7);
  };

  const productosMasPedidos = () => {
    const mapa = {};
    pedidosFiltrados.forEach((p) => {
      (p.items || []).forEach((item) => {
        mapa[item.nombre] = (mapa[item.nombre] || 0) + 1;
      });
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const horariosPico = () => {
    const mapa = {};
    pedidosFiltrados.forEach((p) => {
      const hora = new Date(p.fecha).getHours();
      const rango = hora + ':00';
      mapa[rango] = (mapa[rango] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const puntosCalor = pedidosFiltrados
    .filter((p) => p.lat && p.lng)
    .map((p) => [p.lat, p.lng, 1]);

  const diasData = ventasPorDia();
  const maxVenta = Math.max(...diasData.map((d) => d[1]), 1);
  const productos = productosMasPedidos();
  const maxProducto = Math.max(...productos.map((p) => p[1]), 1);
  const horarios = horariosPico();
  const maxHorario = Math.max(...horarios.map((h) => h[1]), 1);

  const cardStyle = {
    background: 'white', borderRadius: '14px', padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px'
  };

  const barStyle = (valor, maximo, color) => ({
    height: '10px', borderRadius: '5px', background: color,
    width: Math.round((valor / maximo) * 100) + '%',
    marginTop: '6px', transition: 'width 0.3s'
  });

  const btnStyle = (activo) => ({
    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500',
    background: activo ? '#e74c3c' : '#f0f0f0',
    color: activo ? 'white' : '#333'
  });

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Estadisticas</h2>

      {/* FILTRO FECHAS */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '13px', color: '#999', marginBottom: '10px' }}>Filtrar por periodo</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button style={btnStyle(vistaFecha === 'hoy')} onClick={() => { setVistaFecha('hoy'); setMostrarFecha(false); }}>Hoy</button>
          <button style={btnStyle(vistaFecha === 'semana')} onClick={() => { setVistaFecha('semana'); setMostrarFecha(false); }}>Esta semana</button>
          <button style={btnStyle(vistaFecha === 'mes')} onClick={() => { setVistaFecha('mes'); setMostrarFecha(false); }}>Este mes</button>
          <button style={btnStyle(vistaFecha === 'todo')} onClick={() => { setVistaFecha('todo'); setMostrarFecha(false); }}>Todo</button>
          <button style={btnStyle(vistaFecha === 'fecha_unica' || vistaFecha === 'intervalo')} onClick={() => setMostrarFecha(!mostrarFecha)}>
            Fecha especifica ▾
          </button>
        </div>

        {mostrarFecha && (
          <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontSize: '12px', color: '#777', marginBottom: '6px' }}>Dia especifico</p>
                <input
                  type="date"
                  value={fechaUnica}
                  onChange={(e) => { setFechaUnica(e.target.value); setVistaFecha('fecha_unica'); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
                />
              </div>
              <div style={{ flex: 2, minWidth: '260px' }}>
                <p style={{ fontSize: '12px', color: '#777', marginBottom: '6px' }}>Intervalo de fechas</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => { setFechaDesde(e.target.value); setVistaFecha('intervalo'); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#999' }}>hasta</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => { setFechaHasta(e.target.value); setVistaFecha('intervalo'); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TARJETAS RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 6px' }}>Total ventas</p>
          <p style={{ fontSize: '22px', fontWeight: '600', color: '#e74c3c', margin: 0 }}>${totalVentas.toLocaleString()}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 6px' }}>Pedidos</p>
          <p style={{ fontSize: '22px', fontWeight: '600', color: '#3498db', margin: 0 }}>{totalPedidos}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 6px' }}>Ticket promedio</p>
          <p style={{ fontSize: '22px', fontWeight: '600', color: '#2ecc71', margin: 0 }}>${ticketPromedio.toLocaleString()}</p>
        </div>
      </div>

      {/* VENTAS POR DIA */}
      <div style={cardStyle}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '16px' }}>Ventas por dia</p>
        {diasData.length === 0 && <p style={{ color: '#aaa', fontSize: '13px' }}>Sin datos aun</p>}
        {diasData.map(([dia, valor]) => (
          <div key={dia} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{dia}</span>
              <span style={{ fontWeight: '500' }}>${valor.toLocaleString()}</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '5px', height: '10px', marginTop: '6px' }}>
              <div style={barStyle(valor, maxVenta, '#e74c3c')} />
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCTOS MAS PEDIDOS */}
      <div style={cardStyle}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '16px' }}>Productos mas pedidos</p>
        {productos.length === 0 && <p style={{ color: '#aaa', fontSize: '13px' }}>Sin datos aun</p>}
        {productos.map(([nombre, cantidad]) => (
          <div key={nombre} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{nombre}</span>
              <span style={{ fontWeight: '500' }}>{cantidad} pedidos</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '5px', height: '10px', marginTop: '6px' }}>
              <div style={barStyle(cantidad, maxProducto, '#3498db')} />
            </div>
          </div>
        ))}
      </div>

      {/* HORARIOS PICO */}
      <div style={cardStyle}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '16px' }}>Horarios pico</p>
        {horarios.length === 0 && <p style={{ color: '#aaa', fontSize: '13px' }}>Sin datos aun</p>}
        {horarios.map(([hora, cantidad]) => (
          <div key={hora} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{hora}</span>
              <span style={{ fontWeight: '500' }}>{cantidad} pedidos</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '5px', height: '10px', marginTop: '6px' }}>
              <div style={barStyle(cantidad, maxHorario, '#2ecc71')} />
            </div>
          </div>
        ))}
      </div>

      {/* MAPA DE CALOR */}
      <div style={cardStyle}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>Mapa de calor — zonas de entrega</p>
        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
          {puntosCalor.length === 0
            ? 'Haz pedidos de prueba con direcciones reales para ver el mapa'
            : puntosCalor.length + ' pedidos con ubicacion'}
        </p>
        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '380px' }}>
          <MapContainer
            center={centroMapa}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <CentrarMapa centro={centroMapa} />
            {puntosCalor.length > 0 && <CapaCalor puntos={puntosCalor} />}
          </MapContainer>
        </div>
      </div>

    </div>
  );
}

export default Estadisticas;