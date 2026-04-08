import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer style={{ 
      background: '#1a1210', 
      color: '#a8a29e', 
      padding: '1em 0 1.5em 0', 
      marginTop: 0,
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(245, 158, 11, 0.12)'
    }}>
      <div className="footer-container" style={{ background: 'linear-gradient(165deg, #292524 0%, #1f1815 100%)', padding: '3em 2em 1em 2em', borderRadius: '30px', margin: '0 auto', maxWidth: '1300px', border: '1px solid rgba(245, 158, 11, 0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
        <div className="footer-content">
          {/* Logo y descripción */}
          <div className="footer-section footer-logo-section">
            <div className="d-flex align-items-center mb-3">
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: 'rgba(41,37,36,0.9)',
                border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 15,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
              }}>
                <span style={{ fontSize: 24, filter: 'grayscale(1) brightness(2)' }}>🏢</span>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: '#fff7ed', fontSize: '1.5em', letterSpacing: '-0.5px' }}>
                  Subastas<span style={{ color: '#f59e0b', fontWeight: 400 }}>Corp</span>
                </h4>
                <small style={{ color: '#a8a29e', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Mercado en Vivo</small>
              </div>
            </div>
            <p style={{ color: '#d6d3d1', fontSize: '1.05em', lineHeight: 1.6, marginBottom: 20 }}>
              La terminal de subastas online más avanzada y veloz. 
              Monitorea, puja y gana lotes en tiempo real con transacciones 100% blindadas.
            </p>
            <div className="footer-social-links" style={{ display: 'flex', gap: '15px' }}>
              <a href="#" className="footer-social-link" title="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="footer-social-link" title="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="footer-social-link" title="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="footer-section footer-links-section">
                    <h6 className="fw-bold mb-3" style={{ color: '#fff7ed', fontSize: '1.1em', letterSpacing: '1px' }}>
              Acceso Rápido
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/publicaciones" className="footer-link">
                  Ver subastas
                </a>
              </li>
              <li className="mb-2">
                <a href="/crear-publicacion" className="footer-link">
                  Crear publicación
                </a>
              </li>
              <li className="mb-2">
                <a href="/mis-ofertas" className="footer-link">
                  Mis ofertas
                </a>
              </li>
              <li className="mb-2">
                <a href="/mis-publicaciones" className="footer-link">
                  Mis publicaciones
                </a>
              </li>
            </ul>
          </div>

          {/* Enlaces de soporte */}
          <div className="footer-section footer-support-section">
                    <h6 className="fw-bold mb-3" style={{ color: '#fff7ed', fontSize: '1.1em', letterSpacing: '1px' }}>
              Soporte
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/ayuda" className="footer-link">
                  Centro de ayuda
                </a>
              </li>
              <li className="mb-2">
                <a href="/terminos" className="footer-link">
                  Términos y condiciones
                </a>
              </li>
              <li className="mb-2">
                <a href="/privacidad" className="footer-link">
                  Política de privacidad
                </a>
              </li>
              <li className="mb-2">
                <a href="/contacto" className="footer-link">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="footer-section footer-contact-section">
                    <h6 className="fw-bold mb-3" style={{ color: '#fff7ed', fontSize: '1.1em', letterSpacing: '1px' }}>
              Contacto
            </h6>
            <div className="mb-3">
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <div style={{ color: '#a8a29e', fontSize: '0.9em', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                  <div style={{ color: '#e7e5e4', fontSize: '0.95em' }}>contacto@subastascorp.com</div>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <div style={{ color: '#a8a29e', fontSize: '0.9em', fontWeight: 600, textTransform: 'uppercase' }}>Teléfono</div>
                  <div style={{ color: '#e7e5e4', fontSize: '0.95em' }}>+54 11 1234-5678</div>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <div style={{ color: '#a8a29e', fontSize: '0.9em', fontWeight: 600, textTransform: 'uppercase' }}>Horarios</div>
                  <div style={{ color: '#e7e5e4', fontSize: '0.95em' }}>Lun-Vie: 9:00-18:00 (Trading en vivo 24/7)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="footer-divider" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '2em 0' }} />

        {/* Copyright */}
        <div className="footer-copyright" style={{ color: '#a8a29e', textAlign: 'center', fontSize: '0.9em' }}>
          <div className="mb-2">
            © {new Date().getFullYear()} SubastasCorp. Secured & Powered by Tech & Electric Architecture.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 