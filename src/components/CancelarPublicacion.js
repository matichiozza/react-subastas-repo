import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const motivosCancelacion = [
  { value: 'PRODUCTO_NO_DISPONIBLE', label: 'Producto no disponible' },
  { value: 'ERROR_EN_PUBLICACION', label: 'Error en la publicación' },
  { value: 'VENTA_PRIVADA', label: 'Venta privada' },
  { value: 'PRODUCTO_DANADO', label: 'Producto dañado' },
  { value: 'CAMBIO_DE_PRECIO', label: 'Cambio de precio' },
  { value: 'OTRO', label: 'Otro motivo' }
];

const CancelarPublicacion = ({ publicacion, onClose, onCancelacionExitosa }) => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tieneOfertas = publicacion?.ofertasTotales > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo) {
      setError('Debes seleccionar un motivo de cancelación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8080/publicaciones/${publicacion.id}/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          motivo: motivo,
          comentarioAdicional: comentario
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Verificar si la cuenta fue eliminada
        if (res.status === 401 && data.cuentaEliminada) {
          // Mostrar mensaje de cuenta eliminada
          alert('Tu cuenta ha sido eliminada permanentemente por cancelar una publicación con ofertas activas sin sanciones disponibles.');
          
          // Cerrar sesión y redirigir
          logout();
          navigate('/login');
          return;
        }
        
        throw new Error(data.mensaje || 'Error al cancelar la publicación');
      }

      // Verificar sanciones después de la cancelación exitosa
      try {
        const resSanciones = await fetch('http://localhost:8080/publicaciones/usuario/sanciones', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const dataSanciones = await resSanciones.json();
        
        if (!resSanciones.ok && resSanciones.status === 401 && dataSanciones.cuentaEliminada) {
          // Cuenta eliminada automáticamente después de la cancelación
          alert('Tu cuenta ha sido eliminada por tener 0 sanciones disponibles después de la cancelación.');
          logout();
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error al verificar sanciones:', error);
      }

      onCancelacionExitosa(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#e74c3c', fontWeight: 700, margin: 0 }}>
            <FaExclamationTriangle className="me-2" />
            Cancelar y eliminar publicación
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#666',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ borderRadius: 12 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-4">
          <h5 style={{ color: '#333', marginBottom: '10px' }}>{publicacion?.titulo}</h5>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className={`badge ${publicacion?.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
              {publicacion?.estado}
            </span>
            <span className="text-muted">
              {publicacion?.ofertasTotales || 0} ofertas recibidas
            </span>
          </div>
        </div>

        {tieneOfertas ? (
          <div className="alert alert-danger" style={{ borderRadius: 12 }}>
            <h6 className="alert-heading">
              <FaExclamationTriangle className="me-2" />
              ⚠️ ADVERTENCIA CRÍTICA
            </h6>
            <p className="mb-0">
              Esta publicación tiene ofertas activas. Al cancelarla, se eliminará completamente 
              y se te aplicará una sanción. Si es tu última sanción disponible, tu cuenta será 
              <strong> ELIMINADA PERMANENTEMENTE</strong> y no podrás volver a acceder al sistema.
            </p>
          </div>
        ) : (
          <div className="alert alert-info" style={{ borderRadius: 12 }}>
            <h6 className="alert-heading">
              <FaExclamationTriangle className="me-2" />
              Información
            </h6>
            <p className="mb-0">
              Al cancelar esta publicación, se eliminará completamente del sistema. 
              Esta acción no se puede deshacer.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              Motivo de cancelación <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              style={{ borderRadius: 10 }}
            >
              <option value="">Selecciona un motivo</option>
              {motivosCancelacion.map(motivo => (
                <option key={motivo.value} value={motivo.value}>
                  {motivo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">
              Comentario adicional (opcional)
            </label>
            <textarea
              className="form-control"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Agrega detalles adicionales sobre la cancelación..."
              style={{ borderRadius: 10 }}
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading || !motivo}
              style={{
                borderRadius: 10,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 12px rgba(231, 76, 60, 0.25)'
              }}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cancelando...</span>
                  </div>
                  Cancelando...
                </>
              ) : (
                <>
                                <FaTimes className="me-2" />
              Confirmar cancelación y eliminación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelarPublicacion; 