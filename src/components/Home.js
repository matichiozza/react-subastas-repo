import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const imagenesEjemplo = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
];

const categoriasEjemplo = [
  { nombre: 'Inmuebles', icon: '🏠', cantidad: 13 },
  { nombre: 'Autos y Motos', icon: '🚗', cantidad: 114 },
  { nombre: 'Camiones y Autobuses', icon: '🚌', cantidad: 46 },
  { nombre: 'Maquinaria Agrícola', icon: '🚜', cantidad: 28 },
  { nombre: 'Tecnología', icon: '💻', cantidad: 19 },
  { nombre: 'Otros', icon: '📦', cantidad: 174 },
];

const tiposEvento = [
  { nombre: 'Todos', value: 'todos' },
  { nombre: 'Subastas', value: 'subasta' },
  { nombre: 'Compra Directa', value: 'compra' },
  { nombre: 'Shopping', value: 'shopping' },
];

const Home = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEvento, setFiltroEvento] = useState('todos');

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

  // Filtro simulado por tipo de evento (en este ejemplo, solo filtra por nombre de categoría)
  const publicacionesFiltradas = filtroEvento === 'todos'
    ? publicaciones
    : publicaciones.filter(pub => pub.categoria?.toLowerCase().includes(filtroEvento));

  return (
    <div className="container py-4">
      {/* Carrusel destacado */}
      <div className="row mb-4">
        <div className="col-12">
          <div id="carouselEjemplo" className="carousel slide mb-4" data-bs-ride="carousel">
            <div className="carousel-inner rounded shadow">
              {imagenesEjemplo.map((img, idx) => (
                <div className={`carousel-item${idx === 0 ? ' active' : ''}`} key={img}>
                  <img src={img} className="d-block w-100" alt={`Ejemplo ${idx + 1}`} style={{ maxHeight: 320, objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselEjemplo" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselEjemplo" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </div>
      </div>
      {/* Filtros y destacados */}
      <div className="row">
        {/* Filtros laterales */}
        <div className="col-lg-3 mb-4">
          <div className="card p-3 mb-4">
            <h6 className="mb-3" style={{ color: '#5a48f6', fontWeight: 700 }}>Eventos</h6>
            {tiposEvento.map(tipo => (
              <div className="form-check mb-2" key={tipo.value}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoEvento"
                  id={tipo.value}
                  value={tipo.value}
                  checked={filtroEvento === tipo.value}
                  onChange={() => setFiltroEvento(tipo.value)}
                />
                <label className="form-check-label" htmlFor={tipo.value}>
                  {tipo.nombre}
                </label>
              </div>
            ))}
          </div>
          <div className="card p-3">
            <h6 className="mb-3" style={{ color: '#5a48f6', fontWeight: 700 }}>Categorías</h6>
            <ul className="list-unstyled mb-0">
              {categoriasEjemplo.map(cat => (
                <li key={cat.nombre} className="d-flex align-items-center mb-2" style={{ fontSize: '1.05em' }}>
                  <span style={{ fontSize: '1.3em', marginRight: 8 }}>{cat.icon}</span>
                  <span>{cat.nombre}</span>
                  <span className="ms-auto badge bg-light text-dark" style={{ fontWeight: 500 }}>{cat.cantidad}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Destacados del día */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Destacados del día</h4>
            <span style={{ color: '#5a48f6', fontWeight: 500, cursor: 'pointer' }}>Ver todos los eventos</span>
          </div>
          {loading ? (
            <div>Cargando...</div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="alert alert-info">No hay publicaciones destacadas.</div>
          ) : (
            <div className="row g-4">
              {publicacionesFiltradas.slice(0, 8).map((pub, idx) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
                  <div className="card h-100 shadow-sm p-3" style={{ border: '1.5px solid #ececf3', minHeight: 220 }}>
                    <div className="mb-2" style={{ fontSize: '0.95em', color: '#888' }}>
                      {pub.fechaFin ? new Date(pub.fechaFin).toLocaleDateString() : ''}
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: '#5a48f6' }}>{pub.titulo}</h6>
                    <div className="mb-1" style={{ fontSize: '0.98em' }}>{pub.descripcion}</div>
                    <div className="mb-2" style={{ fontWeight: 500 }}>Precio inicial: <span style={{ color: '#3a2bb7' }}>${pub.precioInicial}</span></div>
                    <div className="mb-2" style={{ fontSize: '0.95em', color: '#555' }}>Usuario: <span className="fw-semibold">{pub.usuario?.username}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Info proyecto */}
      <div className="row mt-5 mb-2">
        <div className="col-12 col-lg-10 mx-auto text-center">
          <h5 className="mb-3" style={{ color: '#5a48f6', fontWeight: 700 }}>¿Qué es SubastasCorp?</h5>
          <p className="lead">SubastasCorp es una plataforma moderna y profesional para gestionar subastas online. Regístrate, publica tus productos, haz ofertas y encuentra oportunidades únicas. ¡Disfruta de una experiencia segura y fácil de usar!</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 