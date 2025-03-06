import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/publicaciones', {
          headers: { Authorization: `Bearer ${token}` } // Corregido el formato de la cabecera
        });
        setPublicaciones(response.data);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
      }
    };

    if (token) {
      fetchPublicaciones();
    }
  }, [token]);

  return (
    <div>
      <h1>Mis Publicaciones</h1>
      {publicaciones.length === 0 ? (
        <p>No tienes publicaciones.</p>
      ) : (
        publicaciones.map((pub) => (
          <div key={pub.id}>
            <h2>{pub.titulo}</h2>
          </div>
        ))
      )}
    </div>
  );
};

export default MisPublicaciones;
