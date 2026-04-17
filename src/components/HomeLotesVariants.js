import React from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/api';
import './HomeLotesVariants.css';

function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

function precioMostrar(pub) {
  return pub.precioActual || pub.precioInicial;
}

function fechaCorta(fechaFin) {
  if (!fechaFin) return '—';
  try {
    return new Date(fechaFin).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

/**
 * Vista previa de 4 diseños distintos para «Lotes en exhibición».
 * Ruta: /dev/lotes
 */
export default function HomeLotesVariants() {
  const loaderData = useLoaderData();
  const publicaciones = Array.isArray(loaderData) ? loaderData : [];
  const items = publicaciones.slice(0, 8);
  const navigate = useNavigate();

  const go = (id) => navigate(`/publicaciones/${id}`);

  return (
    <div className="lotes-lab">
      <nav className="lotes-lab__nav" aria-label="Ir a variante">
        <a href="#lotes-v-a">A · Malla salón</a>
        <a href="#lotes-v-b">B · Editorial</a>
        <a href="#lotes-v-c">C · Listado</a>
        <a href="#lotes-v-d">D · Vitrina</a>
      </nav>
      <p className="lotes-lab__intro">
        Compará cuatro versiones del bloque de catálogo.{' '}
        <Link to="/">Volver al inicio</Link>
      </p>

      {/* A */}
      <section id="lotes-v-a" className="lotes-lab__block lotes-v-a">
        <p className="lotes-lab__label">Variante A</p>
        <h2 className="lotes-lab__block-title">Malla clásica · marco ámbar</h2>
        <div className="container px-3 px-lg-4">
          <div className="lotes-v-a__head">
            <div>
              <p className="lotes-v-a__eyebrow">En sala ahora</p>
              <h3 className="lotes-v-a__title">Lotes en exhibición</h3>
              <p className="lotes-v-a__lead">
                Fichas compactas para recorrer rápido: título, categoría, puja y cierre. Ideal si tenés muchos lotes y
                querés densidad sin perder legibilidad.
              </p>
            </div>
            <button type="button" className="lotes-v-a__cta" onClick={() => navigate('/publicaciones')}>
              Abrir catálogo completo
            </button>
          </div>
          {items.length === 0 ? (
            <div className="lotes-v-a__empty">No hay publicaciones para previsualizar.</div>
          ) : (
            <div className="lotes-v-a__grid">
              {items.map((pub) => (
                <article
                  key={`a-${pub.id}`}
                  className="lotes-v-a__card"
                  role="button"
                  tabIndex={0}
                  onClick={() => go(pub.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') go(pub.id);
                  }}
                >
                  <div className="lotes-v-a__fig">
                    {pub.imagenes?.length > 0 ? (
                      <img src={getImageUrl(pub.imagenes[0])} alt="" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 bg-dark">
                        <i className="fas fa-image fa-2x" style={{ opacity: 0.15 }} />
                      </div>
                    )}
                    <span className="lotes-v-a__lot">Lote {pub.id}</span>
                  </div>
                  <div className="lotes-v-a__body">
                    <h4 className="lotes-v-a__card-title">{pub.titulo}</h4>
                    <div className="lotes-v-a__foot">
                      <div>
                        <div className="lotes-v-a__price-lab">Puja vigente</div>
                        <div className="lotes-v-a__price">${formatearMonto(precioMostrar(pub))}</div>
                      </div>
                      <div className="lotes-v-a__date">
                        Cierre
                        <br />
                        {fechaCorta(pub.fechaFin)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* B */}
      <section id="lotes-v-b" className="lotes-lab__block lotes-v-b">
        <p className="lotes-lab__label">Variante B</p>
        <h2 className="lotes-lab__block-title">Editorial · fotografía protagonista</h2>
        <div className="container px-3 px-lg-4">
          <header className="lotes-v-b__head">
            <div className="lotes-v-b__rule" aria-hidden />
            <p className="lotes-v-b__eyebrow">Curaduría del salón</p>
            <h3 className="lotes-v-b__title">
              Selección bajo luz baja
            </h3>
            <p className="lotes-v-b__lead">
              Menos fichas, más presencia: el titular vive sobre la imagen como en una revista de arte. Pensado para
              destacar pocas piezas fuertes.
            </p>
          </header>
          {items.length === 0 ? (
            <div className="lotes-v-a__empty">No hay publicaciones para previsualizar.</div>
          ) : (
            <div className="lotes-v-b__grid">
              {items.slice(0, 6).map((pub) => (
                <article
                  key={`b-${pub.id}`}
                  className="lotes-v-b__card"
                  role="button"
                  tabIndex={0}
                  onClick={() => go(pub.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') go(pub.id);
                  }}
                >
                  {pub.imagenes?.length > 0 ? (
                    <img src={getImageUrl(pub.imagenes[0])} alt="" />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-dark w-100 h-100" style={{ minHeight: 280 }}>
                      <i className="fas fa-image fa-3x" style={{ opacity: 0.15 }} />
                    </div>
                  )}
                  <div className="lotes-v-b__overlay">
                    <span className="lotes-v-b__lot-num">N.º {pub.id}</span>
                    <h4 className="lotes-v-b__card-title">{pub.titulo}</h4>
                    <div className="lotes-v-b__row">
                      <span className="lotes-v-b__price">${formatearMonto(precioMostrar(pub))}</span>
                      <span className="lotes-v-b__meta">
                        {pub.categoria ? `${pub.categoria} · ` : ''}
                        cierra {fechaCorta(pub.fechaFin)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* C */}
      <section id="lotes-v-c" className="lotes-lab__block lotes-v-c">
        <p className="lotes-lab__label">Variante C</p>
        <h2 className="lotes-lab__block-title">Listado denso · tipografía sans</h2>
        <div className="container px-3 px-lg-4">
          <header className="lotes-v-c__head">
            <p className="lotes-v-c__eyebrow">Inventario en línea</p>
            <h3 className="lotes-v-c__title">Tabla de lotes activos</h3>
            <p className="lotes-v-c__lead">
              Una fila por publicación: miniatura, datos esenciales y monto a la derecha. Muy escaneable en desktop;
              en móvil el precio baja debajo del título.
            </p>
          </header>
          {items.length === 0 ? (
            <div className="lotes-v-a__empty">No hay publicaciones para previsualizar.</div>
          ) : (
            <div className="lotes-v-c__list">
              {items.map((pub) => (
                <div
                  key={`c-${pub.id}`}
                  className="lotes-v-c__row"
                  role="button"
                  tabIndex={0}
                  onClick={() => go(pub.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') go(pub.id);
                  }}
                >
                  <div className="lotes-v-c__thumb">
                    {pub.imagenes?.length > 0 ? (
                      <img src={getImageUrl(pub.imagenes[0])} alt="" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="fas fa-image" style={{ opacity: 0.2 }} />
                      </div>
                    )}
                  </div>
                  <div className="lotes-v-c__mid">
                    <h3>{pub.titulo}</h3>
                    <span>
                      Lote {pub.id}
                      {pub.categoria ? ` · ${pub.categoria}` : ''}
                    </span>
                  </div>
                  <div className="lotes-v-c__price-col">
                    <div className="lotes-v-c__price">${formatearMonto(precioMostrar(pub))}</div>
                    <div className="lotes-v-c__sub">Cierre {fechaCorta(pub.fechaFin)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* D */}
      <section id="lotes-v-d" className="lotes-lab__block lotes-v-d">
        <p className="lotes-lab__label">Variante D</p>
        <h2 className="lotes-lab__block-title">Vitrina redondeada · etiquetas tipo pastilla</h2>
        <div className="container px-3 px-lg-4">
          <header className="lotes-v-d__head">
            <span className="lotes-v-d__pill">Hoy en vitrina</span>
            <h3 className="lotes-v-d__title">Piezas que pasan frente a tu café</h3>
            <p className="lotes-v-d__lead">
              Tarjetas amplias, bordes redondos y chips de categoría. Sensación más “app” y amigable, sin perder el tono
              cálido del salón.
            </p>
          </header>
          {items.length === 0 ? (
            <div className="lotes-v-a__empty">No hay publicaciones para previsualizar.</div>
          ) : (
            <div className="lotes-v-d__grid">
              {items.map((pub) => (
                <article
                  key={`d-${pub.id}`}
                  className="lotes-v-d__card"
                  role="button"
                  tabIndex={0}
                  onClick={() => go(pub.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') go(pub.id);
                  }}
                >
                  <div className="lotes-v-d__fig">
                    {pub.imagenes?.length > 0 ? (
                      <img src={getImageUrl(pub.imagenes[0])} alt="" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="fas fa-image fa-3x" style={{ opacity: 0.15 }} />
                      </div>
                    )}
                    {pub.estado === 'ACTIVO' && <span className="lotes-v-d__badge">Abierto</span>}
                  </div>
                  <div className="lotes-v-d__body">
                    <div className="lotes-v-d__tags">
                      <span className="lotes-v-d__tag">Lote {pub.id}</span>
                      {pub.categoria && <span className="lotes-v-d__tag">{pub.categoria}</span>}
                    </div>
                    <h4 className="lotes-v-d__card-title">{pub.titulo}</h4>
                    <div className="lotes-v-d__foot">
                      <div>
                        <div className="lotes-v-d__price-lab">Mejor oferta</div>
                        <div className="lotes-v-d__price">${formatearMonto(precioMostrar(pub))}</div>
                      </div>
                      <div className="lotes-v-d__date">{fechaCorta(pub.fechaFin)}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
