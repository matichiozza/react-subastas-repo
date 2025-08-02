import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)', 
      color: '#fff', 
      padding: '3em 0 1.5em 0', 
      marginTop: 60,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="row g-4">
          {/* Logo y descripción */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 15,
                boxShadow: '0 4px 16px rgba(255,255,255,0.2)'
              }}>
                <span style={{ fontSize: 24, color: '#1976d2' }}>🏢</span>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: '#fff', fontSize: '1.5em' }}>
                  Subastas<span style={{ color: '#fff', fontWeight: 400 }}>Corp</span>
                </h4>
                <small style={{ color: '#e8eaf6', fontSize: '0.9em' }}>Plataforma líder en subastas</small>
              </div>
            </div>
            <p style={{ color: '#e8eaf6', fontSize: '1.05em', lineHeight: 1.6, marginBottom: 20 }}>
              La plataforma más moderna y segura para comprar y vender en subastas online. 
              Conectamos compradores y vendedores de manera eficiente y confiable.
            </p>
            <div className="d-flex gap-3">
              <a href="#" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                📘
              </a>
              <a href="#" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                🐦
              </a>
              <a href="#" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                📸
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3" style={{ color: '#fff', fontSize: '1.1em' }}>
              <span style={{ marginRight: 8 }}>⚡</span>Acceso Rápido
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/publicaciones" style={{ 
                  color: '#e8eaf6', 
                  textDecoration: 'none',
                  fontSize: '0.95em',
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#e8eaf6';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  🛒 Ver subastas
                </a>
              </li>
              <li className="mb-2">
                <a href="/crear-publicacion" style={{ 
                  color: '#e8eaf6', 
                  textDecoration: 'none',
                  fontSize: '0.95em',
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#e8eaf6';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  📤 Vender producto
                </a>
              </li>
              <li className="mb-2">
                <a href="/ayuda" style={{ 
                  color: '#e8eaf6', 
                  textDecoration: 'none',
                  fontSize: '0.95em',
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#e8eaf6';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  ❓ Centro de ayuda
                </a>
              </li>
            </ul>
          </div>



          {/* Contacto */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3" style={{ color: '#fff', fontSize: '1.1em' }}>
              <span style={{ marginRight: 8 }}>📞</span>Contacto
            </h6>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <div style={{
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  fontSize: 16
                }}>
                  📧
                </div>
                <div>
                  <div style={{ color: '#e8eaf6', fontSize: '0.9em', fontWeight: 600 }}>Email</div>
                  <div style={{ color: '#fff', fontSize: '0.95em' }}>contacto@subastascorp.com</div>
                </div>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  fontSize: 16
                }}>
                  📱
                </div>
                <div>
                  <div style={{ color: '#e8eaf6', fontSize: '0.9em', fontWeight: 600 }}>Teléfono</div>
                  <div style={{ color: '#fff', fontSize: '0.95em' }}>+54 11 1234-5678</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div style={{
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  fontSize: 16
                }}>
                  🌍
                </div>
                <div>
                  <div style={{ color: '#e8eaf6', fontSize: '0.9em', fontWeight: 600 }}>Horarios</div>
                  <div style={{ color: '#fff', fontSize: '0.95em' }}>Lun-Vie: 9:00-18:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          margin: '2em 0 1.5em 0'
        }} />

        {/* Copyright */}
        <div className="text-center" style={{ color: '#e8eaf6', fontSize: '0.95em' }}>
          <div className="mb-2">
            © {new Date().getFullYear()} SubastasCorp. Todos los derechos reservados.
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            Desarrollado con ❤️ para la comunidad de subastas
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 