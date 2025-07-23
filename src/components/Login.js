import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/micuenta');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#f7f8fa' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: 400, borderRadius: 18 }}>
        <div className="text-center mb-3">
          <span style={{ fontSize: '2.7em', color: '#5a48f6' }} role="img" aria-label="login">🔐</span>
        </div>
        <h2 className="text-center mb-2" style={{ fontWeight: 700, color: '#222' }}>Iniciar sesión</h2>
        <div className="text-center mb-3" style={{ color: '#888', fontSize: '1em' }}>
          Ingresa con tu usuario y contraseña para acceder a tu cuenta.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <button type="submit" className="btn btn-primary w-100" style={{ borderRadius: 8, fontWeight: 600 }}>Entrar</button>
        </form>
        <div className="text-center mt-4">
          <div className="alert alert-info p-2" style={{ fontSize: '0.98em', borderRadius: 8, background: '#f0f4ff', color: '#3a2bb7', border: 'none' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: '#5a48f6', fontWeight: 600, textDecoration: 'underline' }}>Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
