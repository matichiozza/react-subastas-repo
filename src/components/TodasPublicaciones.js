import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const categorias = [
  'Electrónica',
  'Computación',
  'Teléfonos',
  'Hogar',
  'Muebles',
  'Cocina',
  'Moda',
  'Calzado',
  'Accesorios',
  'Joyería',
  'Deportes',
  'Aire libre',
  'Vehículos',
  'Herramientas',
  'Juguetes',
  'Bebés',
  'Mascotas',
  'Libros',
  'Música',
  'Arte',
];

const TodasPublicaciones = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

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

  const publicacionesFiltradas = categoriaSeleccionada
    ? publicaciones.filter(pub => (pub.categoria || '').toLowerCase() === categoriaSeleccionada.toLowerCase())
    : publicaciones;

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filtros laterales */}
        <div className="col-lg-3 mb-4">
          <div className="card p-3">
            <h6 className="mb-3" style={{ color: '#5a48f6', fontWeight: 700 }}>Categorías</h6>
            <ul className="list-unstyled mb-0">
              <li className={`d-flex align-items-center mb-2${categoriaSeleccionada === '' ? ' fw-bold' : ''}`} style={{ fontSize: '1.05em', cursor: 'pointer' }} onClick={() => setCategoriaSeleccionada('')}>
                <span style={{ marginRight: 8 }}>🔎</span>
                <span>Todas</span>
              </li>
              {categorias.map(cat => (
                <li
                  key={cat}
                  className={`d-flex align-items-center mb-2${categoriaSeleccionada === cat ? ' fw-bold' : ''}`}
                  style={{ fontSize: '1.05em', cursor: 'pointer' }}
                  onClick={() => setCategoriaSeleccionada(cat)}
                >
                  <span style={{ marginRight: 8 }}>📦</span>
                  <span>{cat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Publicaciones */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Publicaciones</h4>
            {categoriaSeleccionada && (
              <span style={{ color: '#5a48f6', fontWeight: 500 }}>
                Filtrando por: {categoriaSeleccionada}
                <button className="btn btn-link btn-sm ms-2" style={{ color: '#e74c3c', textDecoration: 'none' }} onClick={() => setCategoriaSeleccionada('')}>
                  Quitar filtro
                </button>
              </span>
            )}
          </div>
          {loading ? (
            <div>Cargando...</div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="alert alert-info">No hay publicaciones para esta categoría.</div>
          ) : (
            <div className="row g-4">
              {publicacionesFiltradas.slice(0, 8).map((pub, idx) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
                  <div className="card h-100 shadow-sm p-3" style={{ border: '1.5px solid #ececf3', minHeight: 220 }}>
                    {pub.imagenes && pub.imagenes.length > 0 && (
                      <div className="mb-2 text-center">
                        <img src={`http://localhost:8080${pub.imagenes[0]}`} alt={pub.titulo} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 10, objectFit: 'cover' }} />
                      </div>
                    )}
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

export default TodasPublicaciones; 