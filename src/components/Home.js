import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const categorias = [
  { nombre: 'Computación', icono: '🖥️', color: '#1976d2', grad: 'linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)' },
  { nombre: 'Calzado', icono: '👟', color: '#e67e22', grad: 'linear-gradient(135deg, #e67e22 60%, #f6c16a 100%)' },
  { nombre: 'Moda', icono: '👗', color: '#8e24aa', grad: 'linear-gradient(135deg, #8e24aa 60%, #ce93d8 100%)' },
  { nombre: 'Vehículos', icono: '🚗', color: '#388e3c', grad: 'linear-gradient(135deg, #388e3c 60%, #81c784 100%)' },
];

const beneficios = [
  { icono: '🔒', titulo: 'Seguridad', desc: 'Tus datos y transacciones están protegidos.' },
  { icono: '⚡', titulo: 'Rapidez', desc: 'Encuentra y oferta en segundos.' },
  { icono: '💬', titulo: 'Soporte', desc: 'Atención personalizada ante cualquier duda.' },
  { icono: '🌎', titulo: 'Variedad', desc: 'Miles de productos y categorías.' },
];

const testimonios = [
  { nombre: 'Lucía', texto: '¡Vendí mi bici en menos de 24hs! Súper fácil y seguro.', avatar: '👩' },
  { nombre: 'Carlos', texto: 'Me encanta la variedad y la atención al cliente.', avatar: '🧔' },
  { nombre: 'Sofía', texto: 'Ofertar es adictivo, ya gané varias subastas.', avatar: '👩‍🦰' },
];

const preguntas = [
  { q: '¿Cómo participo en una subasta?', a: 'Solo debes registrarte, buscar un producto y hacer tu oferta.' },
  { q: '¿Es seguro pagar por la plataforma?', a: 'Sí, usamos métodos de pago protegidos y cifrado de datos.' },
  { q: '¿Puedo vender cualquier cosa?', a: 'Sí, siempre que cumpla con nuestras políticas y leyes vigentes.' },
];

const Home = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/publicaciones', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPublicaciones(data.reverse());
      } catch {
        setPublicaciones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicaciones();
  }, [token]);

  // Subastas destacadas: las 6 más recientes
  const subastasDestacadas = publicaciones.slice(0, 6);

  return (
    <div style={{ background: '#f7f8fa' }}>
      {/* HERO PRINCIPAL */}
      <section style={{ background: 'linear-gradient(90deg, #1976d2 60%, #5a48f6 100%)', color: '#fff', padding: '4.5em 0 3.5em 0', position: 'relative' }}>
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          <div style={{ maxWidth: 520 }}>
            <h1 style={{ fontWeight: 800, fontSize: '2.7em', lineHeight: 1.1, marginBottom: 18 }}>¡Descubre, oferta y gana en <span style={{ color: '#ffe082' }}>SubastasCorp</span>!</h1>
            <p style={{ fontSize: '1.25em', color: '#e3e3e3', marginBottom: 28 }}>La plataforma más moderna y segura para comprar y vender en subastas online.</p>
            <button className="btn btn-light btn-lg px-4 py-2 fw-bold" style={{ borderRadius: 16, color: '#1976d2', fontSize: '1.1em', boxShadow: '0 2px 12px rgba(25,118,210,0.10)' }} onClick={() => navigate('/publicaciones')}>Ver subastas</button>
          </div>
          <div className="d-none d-md-block" style={{ flex: 1, textAlign: 'center' }}>
            <img src="https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=600&q=80" alt="Hero" style={{ maxWidth: 340, borderRadius: 24, boxShadow: '0 8px 32px rgba(25,118,210,0.18)' }} />
          </div>
        </div>
      </section>

      {/* BÚSQUEDA RÁPIDA */}
      <section className="container" style={{ marginTop: -38, marginBottom: 32, zIndex: 2, position: 'relative' }}>
        <form className="shadow p-3 bg-white rounded-4 d-flex align-items-center gap-2" style={{ maxWidth: 520, margin: '0 auto', boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }} onSubmit={e => { e.preventDefault(); navigate(`/publicaciones?busqueda=${encodeURIComponent(busqueda)}`); }}>
          <input className="form-control border-0" style={{ fontSize: '1.1em', borderRadius: 12, background: '#f7f8fa' }} type="search" placeholder="Buscar productos, categorías..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <button className="btn btn-primary px-4 py-2 fw-bold" style={{ borderRadius: 12 }} type="submit">Buscar</button>
        </form>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Categorías destacadas</h3>
        <div className="row g-4 justify-content-center">
          {categorias.map(cat => (
            <div className="col-12 col-sm-6 col-lg-3" key={cat.nombre}>
              <div
                className="card text-center p-4 h-100 categoria-destacada"
                style={{
                  borderRadius: 22,
                  border: 'none',
                  background: cat.grad,
                  boxShadow: '0 4px 24px rgba(25,118,210,0.10)',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 170,
                  zIndex: 1,
                }}
                onClick={() => navigate(`/publicaciones?busqueda=${encodeURIComponent(cat.nombre)}`)}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(25,118,210,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(25,118,210,0.10)';
                }}
              >
                <div style={{
                  fontSize: 54,
                  marginBottom: 14,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
                  textShadow: '0 2px 12px rgba(0,0,0,0.10)',
                }}>{cat.icono}</div>
                <div style={{ fontWeight: 700, fontSize: '1.18em', letterSpacing: '-0.5px', textShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>{cat.nombre}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.13)', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBASTAS DESTACADAS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Subastas destacadas</h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : subastasDestacadas.length === 0 ? (
          <div className="alert alert-info text-center">No hay subastas activas en este momento.</div>
        ) : (
          <div className="row g-4 justify-content-center">
            {subastasDestacadas.map(pub => (
              <div className="col-12 col-md-6 col-lg-4" key={pub.id}>
                <div className="card h-100 shadow-sm border-0" style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.08)', minHeight: 320, transition: 'box-shadow 0.2s' }}>
                  {pub.imagenes && pub.imagenes.length > 0 ? (
                    <div style={{ height: 140, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={`http://localhost:8080${pub.imagenes[0]}`} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: 140, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 38 }}>
                      <span role="img" aria-label="sin imagen">🖼️</span>
                    </div>
                  )}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-light text-dark border" style={{ fontWeight: 500, fontSize: '0.92em', background: '#e3f2fd', color: '#1976d2' }}>{pub.categoria || 'Sin categoría'}</span>
                      <span className={`badge ${pub.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.92em' }}>{pub.condicion || 'Condición'}</span>
                      {pub.estado && <span className={`badge ${pub.estado === 'ACTIVO' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.92em' }}>{pub.estado}</span>}
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: '#1976d2', fontSize: '1.08em', minHeight: 28, lineHeight: 1.2 }}>{pub.titulo}</h6>
                    <div className="mb-1 text-truncate" style={{ fontSize: '0.97em', color: '#666', minHeight: 18 }}>{pub.descripcion}</div>
                    <div className="mb-2 d-flex align-items-center gap-2" style={{ fontWeight: 500 }}>
                      <span style={{ color: '#1565c0', fontSize: '1.05em' }}>Precio actual: ${pub.precioActual && pub.precioActual > 0 ? pub.precioActual : pub.precioInicial}</span>
                      <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '0.90em' }}>{pub.ofertasTotales || 0} ofertas</span>
                    </div>
                    <div className="d-grid mt-auto pt-2">
                      <button className="btn btn-primary" style={{ borderRadius: 8, fontWeight: 600 }} onClick={() => navigate(`/publicaciones/${pub.id}`)}>Ver detalles</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>¿Cómo funciona?</h3>
        <div className="row justify-content-center g-4">
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📝</div>
              <h6 className="fw-bold mb-2">1. Regístrate</h6>
              <div>Crea tu cuenta gratis y accede a todas las funciones.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🔎</div>
              <h6 className="fw-bold mb-2">2. Encuentra y oferta</h6>
              <div>Busca productos, haz tu oferta y sigue la subasta en tiempo real.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🏆</div>
              <h6 className="fw-bold mb-2">3. Gana y recibe</h6>
              <div>Si tu oferta es la más alta al finalizar, ¡ganaste! Coordina la entrega fácilmente.</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>¿Por qué elegirnos?</h3>
        <div className="row g-4 justify-content-center">
          {beneficios.map(b => (
            <div className="col-12 col-md-6 col-lg-3" key={b.titulo}>
              <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>{b.icono}</div>
                <h6 className="fw-bold mb-2">{b.titulo}</h6>
                <div>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Testimonios</h3>
        <div className="row g-4 justify-content-center">
          {testimonios.map(t => (
            <div className="col-12 col-md-4" key={t.nombre}>
              <div className="card p-4 h-100 text-center" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>{t.avatar}</div>
                <div style={{ fontWeight: 500, color: '#1976d2', fontSize: '1.08em' }}>{t.nombre}</div>
                <div className="mt-2" style={{ color: '#444', fontSize: '1.05em' }}><em>“{t.texto}”</em></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Preguntas frecuentes</h3>
        <div className="accordion" id="faqAccordion">
          {preguntas.map((p, idx) => (
            <div className="accordion-item mb-2" key={p.q} style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(25,118,210,0.04)' }}>
              <h2 className="accordion-header" id={`heading${idx}`}>
                <button
                  className={`accordion-button${faqOpen === idx ? '' : ' collapsed'}`}
                  type="button"
                  style={{ borderRadius: 12, fontWeight: 600, color: '#1976d2', background: '#f7f8fa' }}
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                >
                  {p.q}
                </button>
              </h2>
              <div className={`accordion-collapse collapse${faqOpen === idx ? ' show' : ''}`}
                style={{ background: '#fff' }}>
                <div className="accordion-body" style={{ color: '#444', fontSize: '1.05em' }}>{p.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER AMPLIADO */}
      <footer style={{ background: '#1976d2', color: '#fff', padding: '2.5em 0 1.2em 0', marginTop: 40 }}>
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4 mb-3 mb-md-0">
              <h5 className="fw-bold mb-2">SubastasCorp</h5>
              <div style={{ color: '#e3e3e3', fontSize: '1.05em' }}>La mejor plataforma para comprar y vender en subastas online.</div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h6 className="fw-bold mb-2">Enlaces útiles</h6>
              <ul className="list-unstyled" style={{ color: '#fff' }}>
                <li><a href="/publicaciones" style={{ color: '#fff', textDecoration: 'underline' }}>Ver subastas</a></li>
                <li><a href="/crear-publicacion" style={{ color: '#fff', textDecoration: 'underline' }}>Vender</a></li>
                <li><a href="/micuenta" style={{ color: '#fff', textDecoration: 'underline' }}>Mi cuenta</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold mb-2">Contacto</h6>
              <div>Email: contacto@subastascorp.com</div>
              <div>Tel: +54 11 1234-5678</div>
              <div className="mt-2">
                <a href="#" style={{ color: '#fff', fontSize: 22, marginRight: 12 }}><span role="img" aria-label="facebook">📘</span></a>
                <a href="#" style={{ color: '#fff', fontSize: 22, marginRight: 12 }}><span role="img" aria-label="twitter">🐦</span></a>
                <a href="#" style={{ color: '#fff', fontSize: 22 }}><span role="img" aria-label="instagram">📸</span></a>
              </div>
            </div>
          </div>
          <div className="text-center mt-3" style={{ color: '#e3e3e3', fontSize: '0.98em' }}>
            © {new Date().getFullYear()} SubastasCorp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 