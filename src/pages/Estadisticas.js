import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const estStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .est-root * { box-sizing: border-box; }
  .est-root { font-family: 'DM Sans', sans-serif; max-width: 900px; }

  .est-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #111;
    margin-bottom: 20px;
    letter-spacing: -0.3px;
  }

  /* FILTRO */
  .est-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    padding: 18px;
    margin-bottom: 14px;
  }

  .est-filter-label {
    font-size: 11px;
    font-weight: 600;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 12px;
  }

  .est-filter-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }

  .est-filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .est-filter-btn {
    padding: 10px 8px;
    border-radius: 10px;
    border: 1.5px solid #e8e8e8;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    text-align: center;
    background: white;
    color: #555;
  }
  .est-filter-btn:hover { border-color: #bbb; color: #111; }
  .est-filter-btn.active { border-color: var(--accent, #e74c3c); background: color-mix(in srgb, var(--accent, #e74c3c) 10%, white); color: var(--accent, #e74c3c); font-weight: 600; }

  .est-fecha-box {
    background: #f7f7f5;
    border-radius: 12px;
    padding: 14px;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .est-fecha-label {
    font-size: 11.5px;
    color: #888;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .est-date-input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1.5px solid #e8e8e8;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    outline: none;
    background: white;
    transition: border-color 0.15s;
  }
  .est-date-input:focus { border-color: #999; }

  .est-intervalo-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .est-intervalo-row .est-date-input { flex: 1; }
  .est-intervalo-sep { font-size: 12px; color: #bbb; flex-shrink: 0; }

  /* STATS GRID */
  .est-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .est-stat-card {
    background: white;
    border-radius: 16px;
    padding: 16px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    text-align: center;
  }

  .est-stat-label {
    font-size: 11px;
    color: #aaa;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }

  .est-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  /* BARRAS */
  .est-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #111;
    margin-bottom: 14px;
    letter-spacing: -0.2px;
  }

  .est-bar-row {
    margin-bottom: 13px;
  }
  .est-bar-row:last-child { margin-bottom: 0; }

  .est-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 13px;
    color: #444;
    margin-bottom: 6px;
    gap: 8px;
  }

  .est-bar-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .est-bar-val {
    font-weight: 600;
    color: #111;
    flex-shrink: 0;
    font-size: 12px;
  }

  .est-bar-track {
    background: #f0f0ee;
    border-radius: 6px;
    height: 8px;
    overflow: hidden;
  }

  .est-bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.4s ease;
  }

  /* MAPA */
  .est-map-hint {
    font-size: 12px;
    color: #bbb;
    margin-bottom: 12px;
  }

  .est-map-wrap {
    border-radius: 12px;
    overflow: hidden;
    height: 340px;
  }

  /* EMPTY */
  .est-empty {
    color: #ccc;
    font-size: 13px;
    padding: 10px 0 4px;
    text-align: center;
  }

  @media (max-width: 480px) {
    .est-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .est-stat-val { font-size: 16px; }
    .est-stat-label { font-size: 10px; }
    .est-filter-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;

function CapaCalor({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (!puntos || puntos.length === 0) return;
    const heat = L.heatLayer(puntos, { radius: 35, blur: 25, maxZoom: 17, gradient: { 0.2: 'blue', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' } });
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [puntos, map]);
  return null;
}

function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => { if (centro) map.setView(centro, 14); }, [centro, map]);
  return null;
}

function Estadisticas({ pedidos = [], config = {} }) {
  const [vistaFecha, setVistaFecha] = useState('semana');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechaUnica, setFechaUnica] = useState('');
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [centroMapa, setCentroMapa] = useState([4.711, -74.0721]);

  const color = config?.colorPrincipal || '#e74c3c';
  const hoy = new Date();

  useEffect(() => {
    if (!config.direccionRestaurante) return;
    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(config.direccionRestaurante))
      .then(r => r.json())
      .then(data => { if (data?.length > 0) setCentroMapa([parseFloat(data[0].lat), parseFloat(data[0].lon)]); })
      .catch(() => {});
  }, [config.direccionRestaurante]);

  const filtrarPedidos = () => pedidos.filter(p => {
    const fecha = new Date(p.fecha);
    if (vistaFecha === 'hoy') return fecha.toDateString() === hoy.toDateString();
    if (vistaFecha === 'fecha_unica' && fechaUnica) return fecha.toDateString() === new Date(fechaUnica + 'T00:00:00').toDateString();
    if (vistaFecha === 'intervalo' && fechaDesde && fechaHasta) {
      return fecha >= new Date(fechaDesde + 'T00:00:00') && fecha <= new Date(fechaHasta + 'T23:59:59');
    }
    const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
    if (vistaFecha === 'semana') return diff < 7;
    if (vistaFecha === 'mes') return diff < 30;
    return true;
  });

  const pedidosFiltrados = filtrarPedidos();
  const totalVentas = pedidosFiltrados.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalPedidos = pedidosFiltrados.length;
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0;

  const ventasPorDia = () => {
    const mapa = {};
    pedidosFiltrados.forEach(p => {
      const dia = new Date(p.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      mapa[dia] = (mapa[dia] || 0) + (p.total || 0);
    });
    return Object.entries(mapa).slice(-7);
  };

  const productosMasPedidos = () => {
    const mapa = {};
    pedidosFiltrados.forEach(p => (p.items || []).forEach(item => { mapa[item.nombre] = (mapa[item.nombre] || 0) + 1; }));
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const horariosPico = () => {
    const mapa = {};
    pedidosFiltrados.forEach(p => { const rango = new Date(p.fecha).getHours() + ':00'; mapa[rango] = (mapa[rango] || 0) + 1; });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const puntosCalor = pedidosFiltrados.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng, 1]);
  const diasData = ventasPorDia();
  const maxVenta = Math.max(...diasData.map(d => d[1]), 1);
  const productos = productosMasPedidos();
  const maxProducto = Math.max(...productos.map(p => p[1]), 1);
  const horarios = horariosPico();
  const maxHorario = Math.max(...horarios.map(h => h[1]), 1);

  const filtros = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mes' },
    { key: 'todo', label: 'Todo' },
  ];

  const esFechaEspecial = vistaFecha === 'fecha_unica' || vistaFecha === 'intervalo';

  return (
    <div className="est-root" style={{ '--accent': color }}>
      <style>{estStyles}</style>
      <h1 className="est-title">Estadísticas</h1>

      {/* FILTRO */}
      <div className="est-card">
        <div className="est-filter-label">Filtrar por período</div>
        <div className="est-filter-grid">
          {filtros.map(f => (
            <button
              key={f.key}
              className={`est-filter-btn ${vistaFecha === f.key ? 'active' : ''}`}
              onClick={() => { setVistaFecha(f.key); setMostrarFecha(false); }}
            >
              {f.label}
            </button>
          ))}
          <button
            className={`est-filter-btn ${esFechaEspecial ? 'active' : ''}`}
            style={{ gridColumn: '1 / -1' }}
            onClick={() => setMostrarFecha(!mostrarFecha)}
          >
            {mostrarFecha ? '▴ Fecha específica' : '▾ Fecha específica'}
          </button>
        </div>

        {mostrarFecha && (
          <div className="est-fecha-box">
            <div>
              <div className="est-fecha-label">Día específico</div>
              <input
                type="date"
                className="est-date-input"
                value={fechaUnica}
                onChange={e => { setFechaUnica(e.target.value); setVistaFecha('fecha_unica'); }}
              />
            </div>
            <div>
              <div className="est-fecha-label">Intervalo de fechas</div>
              <div className="est-intervalo-row">
                <input
                  type="date"
                  className="est-date-input"
                  value={fechaDesde}
                  onChange={e => { setFechaDesde(e.target.value); setVistaFecha('intervalo'); }}
                />
                <span className="est-intervalo-sep">→</span>
                <input
                  type="date"
                  className="est-date-input"
                  value={fechaHasta}
                  onChange={e => { setFechaHasta(e.target.value); setVistaFecha('intervalo'); }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="est-stats-grid">
        <div className="est-stat-card">
          <div className="est-stat-label">Ventas totales</div>
          <div className="est-stat-val" style={{ color }}>${totalVentas.toLocaleString()}</div>
        </div>
        <div className="est-stat-card">
          <div className="est-stat-label">Pedidos</div>
          <div className="est-stat-val" style={{ color: '#3498db' }}>{totalPedidos}</div>
        </div>
        <div className="est-stat-card">
          <div className="est-stat-label">Boleto promedio</div>
          <div className="est-stat-val" style={{ color: '#2ecc71' }}>${ticketPromedio.toLocaleString()}</div>
        </div>
      </div>

      {/* VENTAS POR DÍA */}
      <div className="est-card">
        <div className="est-card-title">📈 Ventas por día</div>
        {diasData.length === 0
          ? <div className="est-empty">Sin datos aún</div>
          : diasData.map(([dia, valor]) => (
            <div key={dia} className="est-bar-row">
              <div className="est-bar-header">
                <span className="est-bar-name">{dia}</span>
                <span className="est-bar-val">${valor.toLocaleString()}</span>
              </div>
              <div className="est-bar-track">
                <div className="est-bar-fill" style={{ width: Math.round((valor / maxVenta) * 100) + '%', background: color }} />
              </div>
            </div>
          ))
        }
      </div>

      {/* PRODUCTOS MÁS PEDIDOS */}
      <div className="est-card">
        <div className="est-card-title">🍔 Productos más pedidos</div>
        {productos.length === 0
          ? <div className="est-empty">Sin datos aún</div>
          : productos.map(([nombre, cantidad]) => (
            <div key={nombre} className="est-bar-row">
              <div className="est-bar-header">
                <span className="est-bar-name">{nombre}</span>
                <span className="est-bar-val">{cantidad} pedidos</span>
              </div>
              <div className="est-bar-track">
                <div className="est-bar-fill" style={{ width: Math.round((cantidad / maxProducto) * 100) + '%', background: '#3498db' }} />
              </div>
            </div>
          ))
        }
      </div>

      {/* HORARIOS PICO */}
      <div className="est-card">
        <div className="est-card-title">🕐 Horarios pico</div>
        {horarios.length === 0
          ? <div className="est-empty">Sin datos aún</div>
          : horarios.map(([hora, cantidad]) => (
            <div key={hora} className="est-bar-row">
              <div className="est-bar-header">
                <span className="est-bar-name">{hora}</span>
                <span className="est-bar-val">{cantidad} pedidos</span>
              </div>
              <div className="est-bar-track">
                <div className="est-bar-fill" style={{ width: Math.round((cantidad / maxHorario) * 100) + '%', background: '#2ecc71' }} />
              </div>
            </div>
          ))
        }
      </div>

      {/* MAPA DE CALOR */}
      <div className="est-card">
        <div className="est-card-title">🗺️ Mapa de calor — zonas de entrega</div>
        <div className="est-map-hint">
          {puntosCalor.length === 0
            ? 'Haz pedidos con direcciones reales para ver el mapa'
            : `${puntosCalor.length} pedidos con ubicación`}
        </div>
        <div className="est-map-wrap">
          <MapContainer center={centroMapa} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <CentrarMapa centro={centroMapa} />
            {puntosCalor.length > 0 && <CapaCalor puntos={puntosCalor} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Estadisticas;
