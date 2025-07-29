import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Ayuda = () => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: 'General', icon: '🏠' },
    { id: 'vender', title: 'Vender', icon: '📤' },
    { id: 'comprar', title: 'Comprar', icon: '🛒' },
    { id: 'cuenta', title: 'Mi Cuenta', icon: '👤' },
    { id: 'seguridad', title: 'Seguridad', icon: '🔒' },
    { id: 'contacto', title: 'Contacto', icon: '📞' }
  ];

  const faqs = {
    general: [
      {
        question: '¿Qué es SubastasCorp?',
        answer: 'SubastasCorp es una plataforma moderna y segura para gestionar subastas online. Permite a los usuarios publicar productos, hacer ofertas y encontrar oportunidades únicas en un entorno confiable y fácil de usar.'
      },
      {
        question: '¿Cómo funciona el sistema de subastas?',
        answer: 'Las subastas funcionan con un sistema de ofertas en tiempo real. Los usuarios pueden hacer ofertas superando el precio actual, y la subasta termina en la fecha especificada. El usuario con la oferta más alta al finalizar gana la subasta.'
      },
      {
        question: '¿Es gratuito usar la plataforma?',
        answer: 'Sí, registrarse y usar la plataforma es completamente gratuito. Solo se aplican comisiones sobre las ventas exitosas según los términos de servicio.'
      },
      {
        question: '¿Qué tipos de productos puedo subastar?',
        answer: 'Puedes subastar una amplia variedad de productos: electrónica, ropa, muebles, arte, vehículos, y mucho más. Solo asegúrate de que el producto sea legal y cumpla con nuestras políticas.'
      }
    ],
    vender: [
      {
        question: '¿Cómo publico un producto para subastar?',
        answer: 'Para publicar un producto: 1) Inicia sesión en tu cuenta, 2) Haz clic en "Vender" en el menú, 3) Completa el formulario con los detalles del producto, 4) Sube imágenes de calidad, 5) Establece precio inicial y fecha de finalización, 6) Publica tu subasta.'
      },
      {
        question: '¿Cuántas imágenes puedo subir por producto?',
        answer: 'Puedes subir hasta 5 imágenes por producto. Te recomendamos usar imágenes de alta calidad que muestren claramente el estado del producto desde diferentes ángulos.'
      },
      {
        question: '¿Puedo cancelar una subasta en curso?',
        answer: 'Sí, puedes cancelar una subasta, pero ten en cuenta que esto puede afectar tu reputación y tienes un límite de sanciones disponibles. Si hay ofertas activas, se recomienda contactar a los ofertantes antes de cancelar.'
      },
      {
        question: '¿Cómo recibo el pago cuando vendo un producto?',
        answer: 'Una vez que la subasta termine y el comprador confirme la recepción del producto, el pago se procesará automáticamente. Los fondos se transferirán a tu cuenta bancaria registrada en un plazo de 3-5 días hábiles.'
      }
    ],
    comprar: [
      {
        question: '¿Cómo hago una oferta en una subasta?',
        answer: 'Para hacer una oferta: 1) Navega a la subasta que te interese, 2) Revisa los detalles del producto, 3) Haz clic en "Hacer oferta", 4) Ingresa tu oferta (debe ser mayor al precio actual), 5) Confirma tu oferta. Recibirás notificaciones si alguien supera tu oferta.'
      },
      {
        question: '¿Puedo retractarme de una oferta?',
        answer: 'No, las ofertas son vinculantes y no se pueden retractar una vez realizadas. Asegúrate de estar completamente seguro antes de hacer una oferta.'
      },
      {
        question: '¿Qué pasa si gano una subasta?',
        answer: 'Si ganas una subasta, recibirás una notificación inmediata. Deberás completar el pago en un plazo de 48 horas. Una vez confirmado el pago, el vendedor procederá con el envío del producto.'
      },
      {
        question: '¿Cómo sé si mi oferta es la más alta?',
        answer: 'Puedes ver el precio actual de la subasta en tiempo real. Si tu oferta es la más alta, verás tu nombre como "Ofertante actual". También recibirás notificaciones si alguien supera tu oferta.'
      }
    ],
    cuenta: [
      {
        question: '¿Cómo me registro en SubastasCorp?',
        answer: 'Para registrarte: 1) Haz clic en "Iniciar sesión" en el menú, 2) Selecciona "Registrarse", 3) Completa el formulario con tus datos personales, 4) Verifica tu email, 5) ¡Listo! Ya puedes comenzar a usar la plataforma.'
      },
      {
        question: '¿Cómo cambio mi información personal?',
        answer: 'Para cambiar tu información: 1) Inicia sesión, 2) Ve a "Mi cuenta", 3) Haz clic en "Editar perfil", 4) Modifica los campos que desees, 5) Guarda los cambios.'
      },
      {
        question: '¿Qué son las sanciones y cómo funcionan?',
        answer: 'Las sanciones son un sistema de control de calidad. Cada usuario tiene 3 sanciones disponibles. Si cancelas una subasta con ofertas activas, perderás una sanción. Si te quedas sin sanciones, tu cuenta será suspendida.'
      },
      {
        question: '¿Cómo puedo ver mi historial de transacciones?',
        answer: 'En "Mi cuenta" encontrarás una sección de "Historial" donde podrás ver todas tus transacciones, ofertas realizadas, productos vendidos y compras completadas.'
      }
    ],
    seguridad: [
      {
        question: '¿Es seguro usar SubastasCorp?',
        answer: 'Sí, SubastasCorp utiliza las más altas medidas de seguridad para proteger tus datos y transacciones. Todas las comunicaciones están encriptadas y seguimos las mejores prácticas de seguridad del mercado.'
      },
      {
        question: '¿Cómo protegen mis datos personales?',
        answer: 'Tu privacidad es nuestra prioridad. No compartimos tu información personal con terceros sin tu consentimiento. Todos los datos están protegidos con encriptación de nivel bancario.'
      },
      {
        question: '¿Qué debo hacer si encuentro un producto sospechoso?',
        answer: 'Si encuentras un producto que parece fraudulento o ilegal, utiliza el botón "Reportar" en la página del producto. Nuestro equipo revisará el reporte y tomará las medidas necesarias.'
      },
      {
        question: '¿Cómo sé que el vendedor es confiable?',
        answer: 'Cada usuario tiene un sistema de calificaciones y comentarios. Revisa el perfil del vendedor, sus calificaciones y comentarios de otros usuarios antes de hacer una oferta.'
      }
    ],
    contacto: [
      {
        question: '¿Cómo puedo contactar al soporte técnico?',
        answer: 'Puedes contactarnos a través de: Email: soporte@subastascorp.com, Teléfono: +1 (555) 123-4567, o usando el formulario de contacto en nuestra página web. Nuestro equipo responde en menos de 24 horas.'
      },
      {
        question: '¿Cuáles son los horarios de atención?',
        answer: 'Nuestro equipo de soporte está disponible de lunes a viernes de 9:00 AM a 6:00 PM (GMT-5). Para emergencias fuera de horario, puedes enviar un email y responderemos al siguiente día hábil.'
      },
      {
        question: '¿Puedo solicitar una devolución?',
        answer: 'Sí, tienes 7 días desde la recepción del producto para solicitar una devolución si el producto no coincide con la descripción. Contacta a nuestro soporte técnico para iniciar el proceso.'
      },
      {
        question: '¿Cómo reporto un problema técnico?',
        answer: 'Para reportar problemas técnicos, incluye en tu mensaje: 1) Descripción detallada del problema, 2) Pasos para reproducirlo, 3) Captura de pantalla si es posible, 4) Tu información de contacto.'
      }
    ]
  };

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h1 className="display-4 fw-bold mb-3" style={{ color: '#1976d2' }}>
            <span role="img" aria-label="ayuda" style={{ marginRight: '15px' }}>❓</span>
            Centro de Ayuda
          </h1>
          <p className="lead text-muted mb-4">
            Encuentra respuestas a todas tus preguntas sobre SubastasCorp
          </p>
          <div className="d-flex justify-content-center">
            <div className="input-group" style={{ maxWidth: '500px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar en la ayuda..."
                style={{ borderRadius: '25px 0 0 25px', border: '2px solid #e9ecef' }}
              />
              <button className="btn btn-primary" style={{ borderRadius: '0 25px 25px 0', border: '2px solid #1976d2' }}>
                <span role="img" aria-label="buscar">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar de navegación */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#1976d2' }}>Categorías</h5>
              <div className="d-flex flex-column gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`btn text-start d-flex align-items-center gap-3 ${
                      activeSection === section.id ? 'btn-primary' : 'btn-light'
                    }`}
                    style={{
                      borderRadius: '10px',
                      border: 'none',
                      padding: '12px 16px',
                      fontSize: '0.95em',
                      fontWeight: activeSection === section.id ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span style={{ fontSize: '1.2em' }}>{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Información de contacto rápida */}
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">¿No encuentras lo que buscas?</h6>
              <p className="small mb-3">Nuestro equipo está aquí para ayudarte</p>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span role="img" aria-label="email">📧</span>
                  <small>soporte@subastascorp.com</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span role="img" aria-label="phone">📞</span>
                  <small>+1 (555) 123-4567</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span role="img" aria-label="clock">⏰</span>
                  <small>Lun-Vie 9AM-6PM</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span style={{ fontSize: '2em', marginRight: '15px' }}>
                  {sections.find(s => s.id === activeSection)?.icon}
                </span>
                <h3 className="fw-bold mb-0" style={{ color: '#1976d2' }}>
                  {sections.find(s => s.id === activeSection)?.title}
                </h3>
              </div>

              <div className="accordion" id="faqAccordion">
                {faqs[activeSection].map((faq, index) => (
                  <div className="accordion-item border-0 mb-3" key={index} style={{ borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button collapsed fw-semibold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                        style={{
                          borderRadius: '10px',
                          border: 'none',
                          background: '#f8f9fa',
                          color: '#212529',
                          fontSize: '1em',
                          padding: '20px'
                        }}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body" style={{ padding: '20px', color: '#6c757d', lineHeight: '1.6' }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sección de artículos relacionados */}
              <div className="mt-5">
                <h5 className="fw-bold mb-3" style={{ color: '#1976d2' }}>Artículos relacionados</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '10px' }}>
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-2">
                          <span role="img" aria-label="guia" style={{ fontSize: '1.5em', marginRight: '10px' }}>📖</span>
                          <h6 className="fw-bold mb-0">Guía para principiantes</h6>
                        </div>
                        <p className="small text-muted mb-2">Todo lo que necesitas saber para empezar</p>
                        <Link to="/guia-principiantes" className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}>
                          Leer más
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '10px' }}>
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-2">
                          <span role="img" aria-label="video" style={{ fontSize: '1.5em', marginRight: '10px' }}>🎥</span>
                          <h6 className="fw-bold mb-0">Tutoriales en video</h6>
                        </div>
                        <p className="small text-muted mb-2">Aprende paso a paso con nuestros videos</p>
                        <Link to="/tutoriales" className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }}>
                          Ver videos
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de contacto */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="card-body p-5 text-center">
              <h4 className="fw-bold mb-3" style={{ color: '#1976d2' }}>
                <span role="img" aria-label="contacto" style={{ marginRight: '10px' }}>💬</span>
                ¿Necesitas ayuda personalizada?
              </h4>
              <p className="lead text-muted mb-4">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button className="btn btn-primary btn-lg" style={{ borderRadius: '25px', padding: '12px 30px' }}>
                  <span role="img" aria-label="chat">💬</span> Chat en vivo
                </button>
                <button className="btn btn-outline-primary btn-lg" style={{ borderRadius: '25px', padding: '12px 30px' }}>
                  <span role="img" aria-label="email">📧</span> Enviar email
                </button>
                <button className="btn btn-outline-primary btn-lg" style={{ borderRadius: '25px', padding: '12px 30px' }}>
                  <span role="img" aria-label="phone">📞</span> Llamar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ayuda; 