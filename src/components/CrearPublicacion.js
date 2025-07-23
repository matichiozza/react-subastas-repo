import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

const pasos = [
  { label: 'Datos Básicos', icon: '📝' },
  { label: 'Detalles', icon: '📄' },
  { label: 'Imagen y Precio', icon: '💰' },
  { label: 'Confirmación', icon: '✅' },
];

const categorias = [
  'ELECTRONICA',
  'COMPUTACION',
  'TELEFONOS',
  'HOGAR',
  'MUEBLES',
  'COCINA',
  'MODA',
  'CALZADO',
  'ACCESORIOS',
  'JOYERIA',
  'DEPORTES',
  'AIRE_LIBRE',
  'VEHICULOS',
  'HERRAMIENTAS',
  'JUGUETES',
  'BEBES',
  'MASCOTAS',
  'LIBROS',
  'MUSICA',
  'ARTE',
].sort((a, b) => a.localeCompare(b));

const CrearPublicacion = ({ onPublicacionCreada }) => {
  const { token } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    titulo: '',
    categoria: '',
    condicion: '',
    descripcion: '',
    imagenes: [],
    precioInicial: '',
    incrementoMinimo: '',
    fechaFin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    if (form.imagenes.length + files.length > 5) {
      alert('Solo puedes subir hasta 5 imágenes.');
      return;
    }
    const nuevasImagenes = [...form.imagenes, ...files].slice(0, 5);
    setForm(f => ({ ...f, imagenes: nuevasImagenes }));
    // Previews
    const nuevasPreviews = [...imagenesPreview];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        nuevasPreviews.push(reader.result);
        if (nuevasPreviews.length === nuevasImagenes.length) {
          setImagenesPreview([...nuevasPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (files.length === 0) setImagenesPreview([...nuevasPreviews]);
  };

  const handleEliminarImagen = idx => {
    const nuevasImagenes = form.imagenes.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, imagenes: nuevasImagenes }));
    const nuevasPreviews = imagenesPreview.filter((_, i) => i !== idx);
    setImagenesPreview(nuevasPreviews);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, pasos.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      // Construir el objeto de datos de la publicación (sin imágenes)
      const publicacionData = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        condicion: form.condicion,
        precioInicial: parseFloat(form.precioInicial),
        incrementoMinimo: parseFloat(form.incrementoMinimo),
        fechaFin: form.fechaFin,
      };
      formData.append('publicacion', new Blob([JSON.stringify(publicacionData)], { type: 'application/json' }));
      form.imagenes.forEach((img, idx) => {
        formData.append('imagenes', img);
      });
      const res = await fetch('http://localhost:8080/publicaciones', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al crear la publicación');
      setSuccess(true);
      setForm({
        titulo: '', categoria: '', condicion: '', descripcion: '', imagenes: [], precioInicial: '', incrementoMinimo: '', fechaFin: '',
      });
      setImagenesPreview([]);
      setStep(0);
      if (onPublicacionCreada) onPublicacionCreada();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validaciones simples por paso
  const validStep = () => {
    if (step === 0) return form.titulo && form.categoria;
    if (step === 1) return form.condicion && form.descripcion;
    if (step === 2) return form.imagenes.length > 0 && form.precioInicial && form.incrementoMinimo && form.fechaFin;
    return true;
  };

  return (
    <div className="container py-4">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 520 }}>
        {/* Indicador de pasos */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          {pasos.map((p, idx) => (
            <div key={p.label} className="text-center flex-fill" style={{ opacity: idx <= step ? 1 : 0.4 }}>
              <div style={{ fontSize: '2em' }}>{p.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.98em', color: idx === step ? '#5a48f6' : '#888' }}>{p.label}</div>
              {idx < pasos.length - 1 && <div style={{ height: 2, background: idx < step ? '#5a48f6' : '#ececf3', margin: '0.5em 0' }} />}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          {/* Paso 1: Datos básicos */}
          {step === 0 && (
            <>
              <div className="mb-3">
                <label className="form-label">Título <span style={{ color: '#5a48f6' }}>*</span></label>
                <input type="text" name="titulo" className="form-control" placeholder="Ej: Zapatillas Nike Air Max" value={form.titulo} onChange={handleChange} required />
                <small className="text-muted">Elige un título claro y atractivo para tu publicación.</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Categoría <span style={{ color: '#5a48f6' }}>*</span></label>
                <select name="categoria" className="form-select" value={form.categoria} onChange={handleChange} required>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ').charAt(0) + cat.replace(/_/g, ' ').slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <small className="text-muted">¿A qué categoría pertenece tu producto?</small>
              </div>
            </>
          )}
          {/* Paso 2: Detalles */}
          {step === 1 && (
            <>
              <div className="mb-3">
                <label className="form-label">Condición <span style={{ color: '#5a48f6' }}>*</span></label>
                <select name="condicion" className="form-select" value={form.condicion} onChange={handleChange} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                </select>
                <small className="text-muted">¿El producto es nuevo o usado?</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción <span style={{ color: '#5a48f6' }}>*</span></label>
                <textarea name="descripcion" className="form-control" placeholder="Describe tu producto, estado, detalles relevantes..." value={form.descripcion} onChange={handleChange} required rows={3} />
                <small className="text-muted">Agrega detalles que ayuden a los compradores a decidirse.</small>
              </div>
            </>
          )}
          {/* Paso 3: Imagen y precio */}
          {step === 2 && (
            <>
              <div className="mb-3">
                <label className="form-label">Imágenes <span style={{ color: '#5a48f6' }}>*</span></label>
                <div className="d-flex flex-wrap gap-3 mb-2">
                  {imagenesPreview.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(90,72,246,0.10)' }}>
                      <img src={img} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                      <button type="button" onClick={() => handleEliminarImagen(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>×</button>
                    </div>
                  ))}
                  {form.imagenes.length < 5 && (
                    <button type="button" className="d-flex flex-column align-items-center justify-content-center" style={{ width: 90, height: 90, border: '2px dashed #ececf3', borderRadius: 12, background: '#fafbff', color: '#5a48f6', fontSize: 32, cursor: 'pointer', outline: 'none' }} onClick={() => fileInputRef.current.click()}>
                      <span style={{ fontSize: 32, lineHeight: 1 }}>+</span>
                      <span style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Agregar</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImagenesChange}
                  disabled={form.imagenes.length >= 5}
                />
                <small className="text-muted">Puedes subir hasta 5 imágenes. Arrastra o haz clic para seleccionar.</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Precio Inicial <span style={{ color: '#5a48f6' }}>*</span></label>
                <input type="number" name="precioInicial" className="form-control" placeholder="$0.00" value={form.precioInicial} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="mb-3">
                <label className="form-label">Incremento Mínimo <span style={{ color: '#5a48f6' }}>*</span></label>
                <input type="number" name="incrementoMinimo" className="form-control" placeholder="$100" value={form.incrementoMinimo} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha de Finalización <span style={{ color: '#5a48f6' }}>*</span></label>
                <input type="date" name="fechaFin" className="form-control" value={form.fechaFin} onChange={handleChange} required />
              </div>
            </>
          )}
          {/* Paso 4: Confirmación */}
          {step === 3 && (
            <div className="mb-3">
              <div className="alert alert-info mb-3">
                <strong>Revisa tu publicación antes de confirmar:</strong>
              </div>
              <ul className="list-group mb-3">
                <li className="list-group-item"><strong>Título:</strong> {form.titulo}</li>
                <li className="list-group-item"><strong>Categoría:</strong> {form.categoria}</li>
                <li className="list-group-item"><strong>Condición:</strong> {form.condicion}</li>
                <li className="list-group-item"><strong>Descripción:</strong> {form.descripcion}</li>
                <li className="list-group-item"><strong>Imágenes:</strong> {form.imagenes.length} seleccionada(s)</li>
                <li className="list-group-item"><strong>Precio Inicial:</strong> ${form.precioInicial}</li>
                <li className="list-group-item"><strong>Incremento Mínimo:</strong> ${form.incrementoMinimo}</li>
                <li className="list-group-item"><strong>Fecha de Finalización:</strong> {form.fechaFin}</li>
              </ul>
              <div className="alert alert-warning">
                <span role="img" aria-label="alerta">⚠️</span> Una vez creada la publicación, no podrás modificar algunos datos clave.
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          {success && <div className="alert alert-success">¡Publicación creada con éxito!</div>}
          <div className="d-flex justify-content-between mt-4">
            {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>Anterior</button>}
            {step < pasos.length - 1 && (
              <button type="button" className="btn btn-primary ms-auto" onClick={nextStep} disabled={!validStep()}>Siguiente</button>
            )}
            {step === pasos.length - 1 && (
              <button type="submit" className="btn btn-success ms-auto" disabled={loading}>{loading ? 'Creando...' : 'Confirmar y Publicar'}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPublicacion; 