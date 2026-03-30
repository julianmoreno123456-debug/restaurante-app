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

  const esParaComer = pedido.tipoPedido === 'sitio';

  const estadoTexto = {
    pendiente: 'Recibido',
    preparando: 'Preparando',
    'en camino': 'En camino',
    entregado: 'Entregado',
  };

  const estadoEmoji = {
    pendiente: '📋',
    preparando: '👨‍🍳',
    'en camino': '🛵',
    entregado: '✅',
  };

  const estadoDescripcion = {
    pendiente: 'Tu pedido fue recibido por el restaurante',
    preparando: 'Tu pedido se está preparando',
    'en camino': 'Tu pedido va en camino',
    entregado: 'Tu pedido fue entregado',
  };

  const fechaPedido = new Date(pedido.fecha);
  const horaFormateada = fechaPedido.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      
      {/* HEADER */}
      <div style={{ background: color, padding: '20px 24px', textAlign: 'center' }}>
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
        <h1 style={{ color: 'white', fontSize: '18px', margin: 0 }}>
          {nombreRestaurante}
        </h1>
      </div>

      <div style={{ maxWidth: '460px', margin: '0 auto', padding: '20px 16px' }}>

        {/* NUMERO DE PEDIDO */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 6px' }}>
            Número de pedido
          </p>
          <p style={{ fontSize: '40px', fontWeight: '700', color: color, margin: '0 0 6px' }}>
            #{pedido.numeroPedido}
          </p>
          <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
            Hora de registro: {horaFormateada}
          </p>
        </div>

        {/* ESTADO */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 10px' }}>
            Estado
          </p>
          <p style={{ fontSize: '36px', margin: '0 0 6px' }}>
            {estadoEmoji[pedido.estado] || '📋'}
          </p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: color, margin: '0 0 4px' }}>
            {estadoTexto[pedido.estado] || 'Recibido'}
          </p>
          <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>
            {estadoDescripcion[pedido.estado] || ''}
          </p>
        </div>

        {/* DETALLE */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#999', marginBottom: '12px', textAlign: 'center' }}>
            Detalle del pedido
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '4px 12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#999', fontWeight: '500' }}>Cant</span>
            <span style={{ fontSize: '12px', color: '#999', fontWeight: '500' }}>Producto</span>
            <span style={{ fontSize: '12px', color: '#999', fontWeight: '500' }}>Valor</span>
          </div>

          {pedido.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '4px 12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {item.cantidad || 1}
              </span>

              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                  {item.nombre}
                </p>

                {item.extra && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                    + {item.extra}
                  </p>
                )}

                {item.opciones && item.opciones.length > 0 && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                    {item.opciones.join(', ')}
                  </p>
                )}
              </div>

              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                ${item.precio.toLocaleString()}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '600' }}>
              <span>Total</span>
              <span style={{ color: color }}>
                ${pedido.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* DIRECCION */}
        {!esParaComer && pedido.direccion && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '13px', color: '#999' }}>
              Dirección de entrega
            </p>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              {pedido.direccion}
            </p>
          </div>
        )}

        {esParaComer && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', marginBottom: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '20px' }}>🪑</p>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              Para comer en el sitio
            </p>
          </div>
        )}

        {/* TIEMPO */}
        {pedido.estado !== 'entregado' && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', marginBottom: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>
              Tiempo de entrega {tiempoEntrega} min
            </p>
          </div>
        )}

        {/* WHATSAPP */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=Hola, tengo una pregunta sobre mi pedido %23${pedido.numeroPedido}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              background: '#e8f8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '14px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <p style={{ fontSize: '14px', color: '#25d366', margin: '0 0 2px', fontWeight: '500' }}>
              Comunícate con nosotros 💬
            </p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a9e50', margin: 0 }}>
              {whatsapp}
            </p>
          </a>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#ccc', marginTop: '20px' }}>
          Software elaborado por Lovecraft
        </p>

      </div>
    </div>
  );
}

export default Seguimiento;