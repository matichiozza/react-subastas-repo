import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    pais: ''
  });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/micuenta');
    } else {
      setError('No se pudo registrar. Intente con otro usuario o correo.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4 w-100" style={{ maxWidth: 400 }}>
        <h2 className="text-center mb-4">Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre Completo</label>
            <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Dirección</label>
            <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Ciudad</label>
            <input type="text" name="ciudad" className="form-control" value={formData.ciudad} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Código Postal</label>
            <input type="text" name="codigoPostal" className="form-control" value={formData.codigoPostal} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">País</label>
            <input type="text" name="pais" className="form-control" value={formData.pais} onChange={handleChange} required />
          </div>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;