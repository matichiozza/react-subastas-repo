import React from 'react';
import './Footer.css';

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
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo y descripción */}
          <div className="footer-section footer-logo-section">
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
            <div className="footer-social-links">
              <a href="#" className="footer-social-link">
                📘
              </a>
              <a href="#" className="footer-social-link">
                🐦
              </a>
              <a href="#" className="footer-social-link">
                📸
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="footer-section footer-links-section">
            <h6 className="fw-bold mb-3" style={{ color: '#fff', fontSize: '1.1em' }}>
              <span style={{ marginRight: 8 }}>⚡</span>Acceso Rápido
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/publicaciones" className="footer-link">
                  🛒 Ver subastas
                </a>
              </li>
              <li className="mb-2">
                <a href="/crear-publicacion" className="footer-link">
                  📤 Vender producto
                </a>
              </li>
              <li className="mb-2">
                <a href="/ayuda" className="footer-link">
                  ❓ Centro de ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="footer-section footer-contact-section">
            <h6 className="fw-bold mb-3" style={{ color: '#fff', fontSize: '1.1em' }}>
              <span style={{ marginRight: 8 }}>📞</span>Contacto
            </h6>
            <div className="mb-3">
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  📧
                </div>
                <div>
                  <div style={{ color: '#e8eaf6', fontSize: '0.9em', fontWeight: 600 }}>Email</div>
                  <div style={{ color: '#fff', fontSize: '0.95em' }}>contacto@subastascorp.com</div>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  📱
                </div>
                <div>
                  <div style={{ color: '#e8eaf6', fontSize: '0.9em', fontWeight: 600 }}>Teléfono</div>
                  <div style={{ color: '#fff', fontSize: '0.95em' }}>+54 11 1234-5678</div>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
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
        <div className="footer-divider" />

        {/* Copyright */}
        <div className="footer-copyright">
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