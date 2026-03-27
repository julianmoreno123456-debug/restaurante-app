import React, { useState } from 'react';

function Configuracion({ config, guardarConfig }) {
  const [form, setForm] = useState({
    nombre: config.nombre || '',
    descripcion: config.descripcion || '',
    colorPrincipal: config.colorPrincipal || '#e74c3c',
    banner: config.banner || '',
    logo: config.logo || '',
    direccionRestaurante: config.direccionRestaurante || '',
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Configuracion del restaurante</h2>

      {/* NOMBRE */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '10px' }}>Nombre del restaurante</p>
        <input
          placeholder="Ej: Pizzeria Roma"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
        />
      </div>

      {/* DESCRIPCION */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '10px' }}>Descripcion corta</p>
        <input
          placeholder="Ej: La mejor pizza de la ciudad"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
        />
      </div>

      {/* COLOR */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '10px' }}>Color principal</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="color"
            value={form.colorPrincipal}
            onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })}
            style={{ width: '60px', height: '40px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', padding: '2px' }}
          />
          <span style={{ fontSize: '14px', color: '#777' }}>Este color se aplica a botones y menu de tu pagina</span>
        </div>
        <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: form.colorPrincipal, color: 'white', fontSize: '13px', textAlign: 'center' }}>
          Asi se ve tu color en los botones
        </div>
      </div>

      {/* BANNER */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '10px' }}>Banner del restaurante</p>
        <p style={{ fontSize: '12px', color: '#777', marginBottom: '10px' }}>Imagen que aparece en la parte superior de tu pagina</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImagen('banner', e)}
          style={{ fontSize: '13px', marginBottom: '10px' }}
        />
        {form.banner && (
          <img src={form.banner} alt="banner" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }} />
        )}
      </div>

      {/* LOGO */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '10px' }}>Logo del restaurante</p>
        <p style={{ fontSize: '12px', color: '#777', marginBottom: '10px' }}>Aparece en la barra superior de tu pagina</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImagen('logo', e)}
          style={{ fontSize: '13px', marginBottom: '10px' }}
        />
        {form.logo && (
          <img src={form.logo} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginTop: '8px' }} />
        )}
      </div>
      {/* DIRECCION RESTAURANTE */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '6px' }}>Direccion del restaurante</p>
        <p style={{ fontSize: '12px', color: '#777', marginBottom: '10px' }}>Se usa para centrar el mapa de estadisticas</p>
        <input
          placeholder="Ej: Calle 100 # 15-20, Bogota"
          value={form.direccionRestaurante}
          onChange={(e) => setForm({ ...form, direccionRestaurante: e.target.value })}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
        />
      </div>
      <button
        onClick={handleGuardar}
        style={{ width: '100%', padding: '14px', background: form.colorPrincipal, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
      >
        Guardar configuracion
      </button>
    </div>
  );
}

export default Configuracion;