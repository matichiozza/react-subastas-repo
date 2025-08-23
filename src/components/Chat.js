import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API_BASE_URL from '../config/api';
import Footer from './Footer';

const Chat = () => {
  const { chatId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const mensajesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const mensajesProcesadosRef = useRef(new Set()); // Para evitar duplicados

  // Auto-scroll simple al final del chat
  const scrollToBottom = () => {
    if (!mensajesEndRef.current) return;
    
    // Buscar el contenedor con scroll del chat
    const chatContainer = mensajesEndRef.current.closest('.card');
    if (chatContainer) {
      // Buscar el contenedor de mensajes por clase específica
      let scrollContainer = chatContainer.querySelector('.chat-messages-container');
      
      // Si no se encuentra, buscar por la estructura específica
      if (!scrollContainer) {
        scrollContainer = chatContainer.querySelector('div[style*="overflowY: auto"]');
      }
      
      // Si aún no se encuentra, buscar por flex: 1
      if (!scrollContainer) {
        scrollContainer = chatContainer.querySelector('div[style*="flex: 1"]');
      }
      
      if (scrollContainer) {
        // Hacer scroll suave al final
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        // Intentar con el contenedor principal como fallback
        try {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
          });
        } catch (error) {
          // Silenciar errores de scroll
        }
      }
    }
  };

  useEffect(() => {
    // Solo hacer scroll si hay mensajes
    if (mensajes.length > 0) {
      scrollToBottom();
    }
  }, [mensajes]);

  useEffect(() => {
    if (!chatId || !token) return;

    const fetchChatData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener datos del chat
        const resChat = await fetch(`${API_BASE_URL}/chats/${chatId}/mensajes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!resChat.ok) {
          if (resChat.status === 403) {
            throw new Error('No tienes acceso a este chat');
          } else if (resChat.status === 404) {
            throw new Error('Chat no encontrado');
          }
          throw new Error('Error al cargar el chat');
        }
        
        const mensajesData = await resChat.json();
        setMensajes(mensajesData);

        // Hacer scroll al final después de cargar los mensajes
        setTimeout(() => scrollToBottom(), 200);

        // Obtener información básica del chat por publicación
        // (necesitamos crear un endpoint para esto o modificar la respuesta)
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Función para verificar nuevos mensajes
    const checkNewMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats/${chatId}/mensajes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const nuevosMensajes = await res.json();
                      setMensajes(prev => {
              // Solo actualizar si hay nuevos mensajes
              if (nuevosMensajes.length > prev.length) {
                // Hacer scroll al final cuando se detectan nuevos mensajes
                setTimeout(() => scrollToBottom(), 100);
                return nuevosMensajes;
              }
              return prev;
            });
        }
             } catch (error) {
         // Silenciar errores de polling
       }
    };

         // Iniciar polling cada 2 segundos como respaldo (desactivado temporalmente)
     // pollingIntervalRef.current = setInterval(checkNewMessages, 2000);

    // Configurar WebSocket para mensajes en tiempo real
    try {
      // Intentar WebSocket nativo primero
      const wsUrl = `${API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/ws`;
      
      const stompClient = new Client({
        webSocketFactory: () => new WebSocket(wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
                 onConnect: () => {
          
          // Suscribirse al topic del chat
                     stompClient.subscribe(`/topic/chat.${chatId}`, (message) => {
                            try {
                 const nuevoMensaje = JSON.parse(message.body);

                 // Crear una clave única para el mensaje (sin logs)
                 const mensajeKey = `${nuevoMensaje.id}-${nuevoMensaje.contenido}-${nuevoMensaje.emisor?.id}-${nuevoMensaje.fechaEnvio}`;
                 
                 // Verificar si ya procesamos este mensaje
                 if (mensajesProcesadosRef.current.has(mensajeKey)) {
                   return;
                 }
                 
                 // Marcar como procesado
                 mensajesProcesadosRef.current.add(mensajeKey);
                 
                 // Agregar el mensaje
                 setMensajes(prev => [...prev, nuevoMensaje]);
               
                 // Hacer scroll al final cuando llega un nuevo mensaje
                 setTimeout(() => scrollToBottom(), 100);
               } catch (error) {
                 // Silenciar errores de parsing
               }
          });

          
        },
                 onStompError: (frame) => {
           // Silenciar errores STOMP
         },
         onDisconnect: () => {
           // Silenciar desconexiones
         },
         onWebSocketError: (error) => {
           // Silenciar errores WebSocket
         }
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
      
                } catch (error) {
         // Silenciar errores de configuración WebSocket
       }

         return () => {
       if (stompClientRef.current) {
         stompClientRef.current.deactivate();
       }
       if (pollingIntervalRef.current) {
         clearInterval(pollingIntervalRef.current);
       }
     };
  }, [chatId, token]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    const contenidoMensaje = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    // Crear mensaje optimista (se muestra inmediatamente)
    const mensajeOptimista = {
      id: Date.now(), // ID temporal
      contenido: contenidoMensaje,
      fechaEnvio: new Date().toISOString(),
      emisor: {
        id: user.id,
        nombre: user.nombre || user.username,
        username: user.username
      },
      leido: false
    };

    // Agregar mensaje optimista a la lista
    setMensajes(prev => [...prev, mensajeOptimista]);
    
    // Hacer scroll al final inmediatamente
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contenido: contenidoMensaje }),
      });

      if (!res.ok) {
        throw new Error('Error al enviar mensaje');
      }

      const mensajeReal = await res.json();
      
             // Reemplazar mensaje optimista con el real
       setMensajes(prev => {
         // Filtrar el mensaje optimista y agregar el real
         const mensajesSinOptimista = prev.filter(m => m.id !== mensajeOptimista.id);
         return [...mensajesSinOptimista, mensajeReal];
       });

         } catch (err) {
       // Remover mensaje optimista en caso de error
       setMensajes(prev => prev.filter(m => m.id !== mensajeOptimista.id));
       alert('Error: ' + err.message);
     } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const esHoy = date.toDateString() === ahora.toDateString();
    
    if (esHoy) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Función para manejar el input del mensaje
  const handleInputChange = (e) => {
    setNuevoMensaje(e.target.value);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
                          <div style={{ fontSize: 48, marginBottom: 16 }}>
                  <i className="fas fa-comments"></i>
                </div>
          <div>Cargando chat...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="card p-4 text-center mx-auto" style={{ maxWidth: 400 }}>
                          <div style={{ fontSize: 48, marginBottom: 16, color: '#dc3545' }}>
                  <i className="fas fa-times-circle"></i>
                </div>
          <h4 style={{ color: '#dc3545', marginBottom: 16 }}>Error</h4>
          <p style={{ marginBottom: 16 }}>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/mispublicaciones')}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            Volver a mis publicaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', paddingTop: 0 }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <div className="container py-4">
        {/* Header del chat */}
        <div className="card mb-3" style={{ borderRadius: 16, padding: '1rem' }}>
                  <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
                         <button 
               onClick={() => navigate('/mispublicaciones')}
               style={{ 
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 color: '#fff',
                 border: 'none',
                 borderRadius: 25,
                 padding: '0.75rem 1.5rem',
                 fontWeight: 600,
                 fontSize: '0.95rem',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease',
                 boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem'
               }}
               onMouseOver={(e) => {
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
               }}
               onMouseOut={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
               }}
             >
               <span style={{ fontSize: '1.2rem' }}>←</span>
               Volver
             </button>
            <div>
              <h4 style={{ margin: 0, color: '#1976d2' }}>
                <i className="fas fa-comments" style={{ marginRight: 8 }}></i>Chat de coordinación
              </h4>
              <small style={{ color: '#666' }}>Coordina la entrega con el ganador</small>
            </div>
          </div>
          
        </div>
        </div>

        {/* Área de mensajes */}
        <div className="card" style={{ borderRadius: 16, height: '70vh', display: 'flex', flexDirection: 'column' }}>
          {/* Lista de mensajes */}
                     <div 
             className="chat-messages-container"
             style={{ 
               flex: 1, 
               overflowY: 'auto', 
               padding: '1rem', 
               background: '#fafafa',
               borderTopLeftRadius: 16,
               borderTopRightRadius: 16
             }}
           >
            {mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗨️</div>
                <div>No hay mensajes aún</div>
                <div style={{ fontSize: '0.9em', marginTop: 8 }}>Envía el primer mensaje para comenzar la coordinación</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                 {mensajes.map((mensaje, index) => {
                   const esMio = mensaje.emisor.id === user.id;
                   // Crear una key única combinando ID y timestamp
                   const uniqueKey = mensaje.id ? `msg-${mensaje.id}` : `temp-${mensaje.fechaEnvio}-${index}`;
                   return (
                     <div
                       key={uniqueKey}
                       style={{
                        display: 'flex',
                        justifyContent: esMio ? 'flex-end' : 'flex-start',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '0.75rem 1rem',
                          borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: esMio ? '#1976d2' : '#fff',
                          color: esMio ? '#fff' : '#333',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          position: 'relative'
                        }}
                      >
                        {!esMio && (
                          <div style={{ 
                            fontSize: '0.8em', 
                            fontWeight: 600, 
                            marginBottom: '0.25rem',
                            color: '#1976d2'
                          }}>
                            {mensaje.emisor.nombre}
                          </div>
                        )}
                        <div style={{ wordWrap: 'break-word', lineHeight: 1.4 }}>
                          {mensaje.contenido}
                        </div>
                        <div style={{ 
                          fontSize: '0.75em', 
                          marginTop: '0.25rem',
                          color: esMio ? 'rgba(255,255,255,0.8)' : '#999',
                          textAlign: 'right'
                        }}>
                          {formatearFecha(mensaje.fechaEnvio)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                                 <div ref={mensajesEndRef} />
               </div>
             )}
           </div>

          {/* Formulario de envío */}
          <div style={{ 
            padding: '1rem', 
            borderTop: '1px solid #e0e0e0',
            background: '#fff',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16
          }}>
            <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={handleInputChange}
                  placeholder="Escribe tu mensaje..."
                  disabled={enviando}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 25,
                    background: '#f8f9fa',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              <button
                type="submit"
                disabled={!nuevoMensaje.trim() || enviando}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 25,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: 100
                }}
                onMouseOver={(e) => e.target.style.background = '#1565c0'}
                onMouseOut={(e) => e.target.style.background = '#1976d2'}
              >
                {enviando ? 
                  <i className="fas fa-spinner fa-spin"></i> : 
                  <>
                    <i className="fas fa-paper-plane" style={{ marginRight: 8 }}></i>Enviar
                  </>
                }
              </button>
            </form>
            
             <div style={{ 
               fontSize: '0.8em', 
               color: '#666', 
               marginTop: '0.5rem',
               textAlign: 'center'
             }}>
               <i className="fas fa-lightbulb" style={{ marginRight: 8 }}></i>Usa este chat para coordinar el pago del resto y la entrega del producto
             </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chat;
