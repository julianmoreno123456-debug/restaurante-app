import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function Seguimiento({ pedidoId, uid, config }) {
  const [pedido, setPedido] = useState(null);

  const color = config?.colorPrincipal || '#e74c3c';
  const whatsapp = config?.whatsapp || '';
  const tiempoEntrega = config?.tiempoEntrega || '30-45';
  const nombreRestaurante = config?.nombre || 'El restaurante';

  useEffect(() => {
    if (!pedidoId || !uid) return;

    const unsub = onSnapshot(
      doc(db, `restaurantes/${uid}/pedidos`, pedidoId),
      (snap) => {
        if (snap.exists()) {
          setPedido({ id: snap.id, ...snap.data() });
        }
      }
    );

    return () => unsub();
  }, [pedidoId, uid]);

  if (!pedido) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p style={{ color: '#aaa' }}>Cargando tu pedido...</p>
      </div>
    );
  }

  const pasos = [
    { key: 'pendiente', label: 'Pedido recibido', emoji: '📋' },
    { key: 'preparando', label: 'En preparación', emoji: '👨‍🍳' },
    { key: 'en camino', label: 'En camino', emoji: '🛵' },
    { key: 'entregado', label: 'Entregado', emoji: '✅' },
  ];

  const pasoActual = pasos.findIndex(p => p.key === pedido.estado);
  const esParaComer = pedido.tipoPedido === 'sitio';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* HEADER */}
      <div style={{ background: color, padding: '24px', textAlign: 'center' }}>
        {config?.logo && (
          <img
            src={config.logo}
            alt="logo"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid white',
              display: 'block',
              margin: '0 auto 10px'
            }}
          />
        )}
        <h1 style={{ color: 'white', fontSize: '18px', margin: '0 0 4px' }}>
          {nombreRestaurante}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
          Pedido #{pedido.numeroPedido}
        </p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px 16px' }}>

        {/* TIEMPO */}
        {!esParaComer && pedido.estado !== 'entregado' && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '13px', color: '#999' }}>Tiempo estimado</p>
            <p style={{ fontSize: '36px', fontWeight: '600', color: color }}>
              {tiempoEntrega} min
            </p>
          </div>
        )}

        {esParaComer && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '30px' }}>🪑</p>
            <p>Para comer en el sitio</p>
          </div>
        )}

        {/* ESTADO */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {pasos.map((paso, i) => {
            const completado = i <= pasoActual;
            const activo = i === pasoActual;
            return (
              <div key={paso.key} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: completado ? color : '#eee'
                    }}
                  >
                    {paso.emoji}
                  </div>

                  {i < pasos.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        height: '28px',
                        background: completado ? color : '#eee'
                      }}
                    />
                  )}
                </div>

                <div>
                  <p style={{ margin: 0 }}>
                    {paso.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* PEDIDO */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {pedido.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <p style={{ margin: 0 }}>{item.nombre}</p>
                {item.extra && <p style={{ margin: 0 }}>+ {item.extra}</p>}
              </div>
              <span>${item.precio.toLocaleString()}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span>
            <span>${pedido.total.toLocaleString()}</span>
          </div>
        </div>

        {/* WHATSAPP */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=Hola, tengo una pregunta sobre mi pedido %23${pedido.numeroPedido}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              background: '#25d366',
              color: 'white',
              borderRadius: '14px',
              padding: '16px',
              textDecoration: 'none'
            }}
          >
            💬 Contactar por WhatsApp
          </a>
        )}

      </div>
    </div>
  );
}

export default Seguimiento;