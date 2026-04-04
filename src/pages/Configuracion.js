import React, { useState } from 'react';

const configStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .cfg-root * { box-sizing: border-box; }
  .cfg-root { font-family: 'DM Sans', sans-serif; max-width: 620px; }

  .cfg-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #111;
    margin-bottom: 24px;
    letter-spacing: -0.3px;
  }

  .cfg-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    padding: 22px;
    margin-bottom: 14px;
  }

  .cfg-card-label {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #111;
    margin-bottom: 4px;
  }

  .cfg-card-hint {
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
  }

  .cfg-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
    background: #fff;
  }
  .cfg-input:focus { border-color: #111; }
  .cfg-input::placeholder { color: #bbb; }

  .cfg-color-preview {
    margin-top: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    color: white;
    font-size: 13px;
    text-align: center;
    font-weight: 500;
  }

  .cfg-time-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .cfg-time-btn {
    padding: 10px 6px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    text-align: center;
  }

  .cfg-toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .cfg-toggle {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .cfg-toggle-knob {
    position: absolute;
    top: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .cfg-horario-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .cfg-horario-label {
    font-size: 12px;
    color: #888;
    margin-bottom: 6px;
  }

  .cfg-horario-info {
    margin-top: 12px;
    padding: 10px 14px;
    background: #f7f7f5;
    border-radius: 10px;
    font-size: 13px;
    color: #555;
    text-align: center;
  }

  .cfg-img-preview {
    position: relative;
    display: inline-block;
  }

  .cfg-img-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(0,0,0,0.55);
    color: white;
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cfg-save-btn {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.2px;
  }
  .cfg-save-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .cfg-color-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .cfg-color-input {
    width: 54px;
    height: 42px;
    border-radius: 10px;
    border: 1.5px solid #e8e8e8;
    cursor: pointer;
    padding: 3px;
    flex-shrink: 0;
  }

  .cfg-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
    background: #fff;
    resize: vertical;
    min-height: 110px;
    line-height: 1.5;
  }
  .cfg-textarea:focus { border-color: #111; }

  .cfg-vars {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .cfg-var-chip {
    padding: 4px 10px;
    background: #f0f0ee;
    border-radius: 20px;
    font-size: 12px;
    font-family: 'DM Sans', monospace;
    color: #555;
    cursor: pointer;
    border: none;
    transition: background 0.15s;
  }
  .cfg-var-chip:hover { background: #e0e0dd; color: #111; }

  .cfg-preview-box {
    margin-top: 12px;
    padding: 12px 14px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    font-size: 13px;
    color: #166534;
    line-height: 1.5;
  }
  .cfg-preview-label {
    font-size: 11px;
    font-weight: 600;
    color: #16a34a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
`;

function Configuracion({ config, guardarConfig }) {
  const [form, setForm] = useState({
    nombre: config.nombre || '',
    descripcion: config.descripcion || '',
    colorPrincipal: config.colorPrincipal || '#e74c3c',
    banner: config.banner || '',
    logo: config.logo || '',
    direccionRestaurante: config.direccionRestaurante || '',
    whatsapp: config.whatsapp || '',
    tiempoEntrega: config.tiempoEntrega || '30-45',
    mensajeWhatsapp: config.mensajeWhatsapp || 'Hola {nombre}! 🎉 Tu pedido #{numero} ya está {estado}. Total: ${total}. Tiempo estimado: {tiempo} min. ¡Gracias! 🍔',
    horarioApertura: config.horarioApertura || '08:00',
    horarioCierre: config.horarioCierre || '22:00',
    horarioActivo: config.horarioActivo !== false,
    costoDomicilio: config.costoDomicilio ?? 2000,
  });

  const handleImagen = (campo, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, [campo]: reader.result });
    reader.readAsDataURL(file);
  };

  const handleGuardar = () => {
    guardarConfig(form);
    alert('Configuracion guardada con exito');
  };

  return (
    <div className="cfg-root">
      <style>{configStyles}</style>
      <h1 className="cfg-title">Configuración</h1>

      {/* Nombre */}
      <div className="cfg-card">
        <div className="cfg-card-label">Nombre del restaurante</div>
        <div className="cfg-card-hint">Se muestra en la pantalla de carga y encabezado</div>
        <input className="cfg-input" placeholder="Ej: Pizzeria Roma" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </div>

      {/* Descripción */}
      <div className="cfg-card">
        <div className="cfg-card-label">Descripción corta</div>
        <input className="cfg-input" placeholder="Ej: La mejor pizza de la ciudad" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      </div>

      {/* Color */}
      <div className="cfg-card">
        <div className="cfg-card-label">Color principal</div>
        <div className="cfg-card-hint">Afecta botones, acentos y elementos de marca</div>
        <div className="cfg-color-row">
          <input type="color" value={form.colorPrincipal} onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })} className="cfg-color-input" />
          <span style={{ fontSize: '13px', color: '#888' }}>Color de botones y menú</span>
        </div>
        <div className="cfg-color-preview" style={{ background: form.colorPrincipal }}>
          Así se verá tu color
        </div>
      </div>

      {/* WhatsApp */}
      <div className="cfg-card">
        <div className="cfg-card-label">Número de WhatsApp</div>
        <div className="cfg-card-hint">Con código de país — para notificar clientes</div>
        <input className="cfg-input" placeholder="Ej: 573001234567" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
      </div>

      {/* Tiempo de entrega */}
      <div className="cfg-card">
        <div className="cfg-card-label">Tiempo estimado de entrega</div>
        <div className="cfg-card-hint">Se muestra al cliente al confirmar el pedido</div>
        <select
          className="cfg-input"
          value={form.tiempoEntrega}
          onChange={(e) => setForm({ ...form, tiempoEntrega: e.target.value })}
        >
          <option value="15-25">15-25 minutos</option>
          <option value="20-30">20-30 minutos</option>
          <option value="30-45">30-45 minutos</option>
          <option value="45-60">45-60 minutos</option>
          <option value="60-90">60-90 minutos</option>
        </select>
      </div>

      {/* Costo de domicilio */}
      <div className="cfg-card">
        <div className="cfg-card-label">🛵 Costo del domicilio</div>
        <div className="cfg-card-hint">Se suma automáticamente al total cuando el cliente elige domicilio</div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#888', fontWeight: 500 }}>$</span>
          <input
            className="cfg-input"
            type="number"
            min="0"
            step="500"
            value={form.costoDomicilio}
            onChange={(e) => setForm({ ...form, costoDomicilio: Number(e.target.value) })}
            style={{ paddingLeft: '26px' }}
          />
        </div>
        {form.costoDomicilio === 0 && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⚠️ Domicilio gratis — el cliente no pagará recargo
          </div>
        )}
        {form.costoDomicilio > 0 && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✅ Se cobrarán ${Number(form.costoDomicilio).toLocaleString()} por domicilio
          </div>
        )}
      </div>

      {/* Horario */}
      <div className="cfg-card">
        <div className="cfg-toggle-row">
          <div>
            <div className="cfg-card-label" style={{ marginBottom: '2px' }}>Horario de atención</div>
            <div className="cfg-card-hint" style={{ marginBottom: 0 }}>Fuera de este horario los pedidos se desactivan automáticamente</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>{form.horarioActivo ? 'Activo' : 'Inactivo'}</span>
            <div
              className="cfg-toggle"
              style={{ background: form.horarioActivo ? form.colorPrincipal : '#ddd' }}
              onClick={() => setForm({ ...form, horarioActivo: !form.horarioActivo })}
            >
              <div className="cfg-toggle-knob" style={{ left: form.horarioActivo ? '23px' : '3px' }} />
            </div>
          </div>
        </div>

        {form.horarioActivo && (
          <>
            <div className="cfg-horario-grid">
              <div>
                <div className="cfg-horario-label">Hora de apertura</div>
                <input type="time" value={form.horarioApertura} onChange={(e) => setForm({ ...form, horarioApertura: e.target.value })} className="cfg-input" />
              </div>
              <div>
                <div className="cfg-horario-label">Hora de cierre</div>
                <input type="time" value={form.horarioCierre} onChange={(e) => setForm({ ...form, horarioCierre: e.target.value })} className="cfg-input" />
              </div>
            </div>
            <div className="cfg-horario-info">
              🕐 Abierto de {form.horarioApertura} a {form.horarioCierre}
            </div>
            <button
              onClick={() => { guardarConfig({ ...form }); alert('✅ Horario aplicado'); }}
              style={{ marginTop: '12px', width: '100%', padding: '11px', background: form.colorPrincipal, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600, transition: 'opacity 0.15s' }}
              onMouseOver={e => e.target.style.opacity = '0.88'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Aplicar horario
            </button>
          </>
        )}
      </div>

      {/* Banner */}
      <div className="cfg-card">
        <div className="cfg-card-label">Banner del restaurante</div>
        <div className="cfg-card-hint">Sube una foto desde tu computador</div>
        <input type="file" accept="image/*" onChange={(e) => handleImagen('banner', e)} style={{ fontSize: '13px', marginBottom: '12px', width: '100%' }} />
        {form.banner && (
          <div className="cfg-img-preview">
            <img src={form.banner} alt="banner" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <button className="cfg-img-remove" onClick={() => setForm({ ...form, banner: '' })}>✕</button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="cfg-card">
        <div className="cfg-card-label">Logo del restaurante</div>
        <div className="cfg-card-hint">Aparece en la barra lateral y pantalla de carga</div>
        <input type="file" accept="image/*" onChange={(e) => handleImagen('logo', e)} style={{ fontSize: '13px', marginBottom: '12px', width: '100%' }} />
        {form.logo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={form.logo} alt="logo" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #f0f0ee' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <button onClick={() => setForm({ ...form, logo: '' })} style={{ padding: '8px 14px', background: '#f5f5f3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#555' }}>Eliminar</button>
          </div>
        )}
      </div>

      {/* Dirección */}
      <div className="cfg-card">
        <div className="cfg-card-label">Dirección del restaurante</div>
        <div className="cfg-card-hint">Para centrar el mapa de estadísticas</div>
        <input className="cfg-input" placeholder="Ej: Calle 100 # 15-20, Bogotá" value={form.direccionRestaurante} onChange={(e) => setForm({ ...form, direccionRestaurante: e.target.value })} />
      </div>

      {/* Mensaje WhatsApp */}
      <div className="cfg-card">
        <div className="cfg-card-label">💬 Mensaje de notificación al cliente</div>
        <div className="cfg-card-hint">
          Este mensaje se envía por WhatsApp al notificar al cliente. Toca una variable para copiarla.
        </div>
        <textarea
          className="cfg-textarea"
          value={form.mensajeWhatsapp}
          onChange={(e) => setForm({ ...form, mensajeWhatsapp: e.target.value })}
          placeholder="Escribe el mensaje que recibirá el cliente..."
        />
        <div className="cfg-vars">
          {[
            { var: '{nombre}', desc: 'Nombre cliente' },
            { var: '{numero}', desc: '# Pedido' },
            { var: '{estado}', desc: 'Estado' },
            { var: '{total}', desc: 'Total $' },
            { var: '{tiempo}', desc: 'Tiempo entrega' },
          ].map(v => (
            <button
              key={v.var}
              className="cfg-var-chip"
              title={v.desc}
              onClick={() => {
                const campo = document.querySelector('.cfg-textarea');
                const start = campo?.selectionStart ?? form.mensajeWhatsapp.length;
                const nuevo = form.mensajeWhatsapp.slice(0, start) + v.var + form.mensajeWhatsapp.slice(start);
                setForm({ ...form, mensajeWhatsapp: nuevo });
              }}
            >
              {v.var}
            </button>
          ))}
        </div>
        <div className="cfg-preview-box">
          <div className="cfg-preview-label">Vista previa</div>
          {form.mensajeWhatsapp
            .replace('{nombre}', 'Juan')
            .replace('{numero}', '3')
            .replace('{estado}', 'en camino')
            .replace('{total}', '45.000')
            .replace('{tiempo}', form.tiempoEntrega)
          }
        </div>
      </div>

      <button className="cfg-save-btn" style={{ background: form.colorPrincipal }} onClick={handleGuardar}>
        Guardar configuración →
      </button>
    </div>
  );
}

export default Configuracion;
