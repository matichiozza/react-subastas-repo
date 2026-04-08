import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, EffectCreative, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-creative';

const mockData = [
  { id: 1, title: 'Zapatillas Nike Air', price: 120000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Laptop Gamer ASUS', price: 950000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'iPhone 13 Pro', price: 850000, img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=400' },
  { id: 4, title: 'Reloj Rolex Daytona', price: 4200000, img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400' },
  { id: 5, title: 'Cámara Sony Alpha', price: 1100000, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' },
];

const CardContent = ({ data }) => (
  <div 
    className="w-100 h-100" 
    style={{ 
      padding: '24px', 
      borderRadius: '24px', 
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', 
      border: '1px solid rgba(255,255,255,0.15)',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff'
    }}
  >
    <div className="d-flex justify-content-between align-items-center mb-4">
      <span className="badge d-flex align-items-center gap-2" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: '12px' }}>
        <i className="fas fa-circle" style={{ fontSize: '8px' }}></i> HOT BID
      </span>
    </div>
    
    <div style={{ width: '100%', height: '230px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
      <img src={data.img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    
    <h3 style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: '16px' }}>
      {data.title}
    </h3>
    <div style={{ color: '#10b981', fontSize: '1.8em', fontWeight: 800 }}>
      ${data.price.toLocaleString('es-AR')}
    </div>
  </div>
);

const SwiperTest = () => {
  return (
    <div style={{ background: '#020617', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', overflowX: 'hidden' }}>
      <div className="container">
        <h1 className="text-center mb-5" style={{ color: '#fff', fontWeight: 800 }}>Mazo de Cartas: 5 Estilos</h1>
        <p className="text-center mb-5" style={{ color: '#94a3b8' }}>Análisis profundo del estilo Tinder con diferentes configuraciones de perspectiva y rotación.</p>

        <div className="row g-5">
          {/* VERSIÓN 1: ORIGINAL TINDER STYLE */}
          <div className="col-lg-6 mb-5">
            <h3 className="text-center mb-4" style={{ color: '#60a5fa' }}>1. Tinder Clásico (Original)</h3>
            <p className="text-center text-muted small mb-4">Rotación moderada, cartas apenas asomando por detrás.</p>
            <div className="d-flex justify-content-center">
              <Swiper
                effect={'cards'}
                grabCursor={true}
                modules={[EffectCards, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                style={{ width: '340px', height: '440px' }}
              >
                {mockData.map((d) => (
                  <SwiperSlide key={`c1-${d.id}`} style={{ borderRadius: '24px' }}>
                    <CardContent data={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* VERSIÓN 2: ABANICO ABIERTO */}
          <div className="col-lg-6 mb-5">
            <h3 className="text-center mb-4" style={{ color: '#60a5fa' }}>2. Efecto "Abanico" (Cartas en Mano)</h3>
            <p className="text-center text-muted small mb-4">Rotación intensa (15deg) para que se vean bien los bordes curvos de atrás.</p>
            <div className="d-flex justify-content-center">
              <Swiper
                effect={'cards'}
                grabCursor={true}
                cardsEffect={{
                  perSlideRotate: 15,
                  perSlideOffset: 12,
                  slideShadows: true,
                }}
                modules={[EffectCards, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                style={{ width: '340px', height: '440px' }}
              >
                {mockData.map((d) => (
                  <SwiperSlide key={`c2-${d.id}`} style={{ borderRadius: '24px' }}>
                    <CardContent data={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* VERSIÓN 3: PILA RECTA */}
          <div className="col-lg-6 mb-5">
            <h3 className="text-center mb-4" style={{ color: '#60a5fa' }}>3. Pila Recta y Ordenada</h3>
            <p className="text-center text-muted small mb-4">Mala rotación 0°. Las cartas solo van haciéndose más chiquitas al fondo.</p>
            <div className="d-flex justify-content-center">
              <Swiper
                effect={'cards'}
                grabCursor={true}
                cardsEffect={{
                  perSlideRotate: 0,
                  perSlideOffset: 14,
                  slideShadows: true,
                }}
                modules={[EffectCards, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                style={{ width: '340px', height: '440px' }}
              >
                {mockData.map((d) => (
                  <SwiperSlide key={`c3-${d.id}`} style={{ borderRadius: '24px' }}>
                    <CardContent data={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* VERSIÓN 4: PILA CAÓTICA */}
          <div className="col-lg-6 mb-5">
            <h3 className="text-center mb-4" style={{ color: '#60a5fa' }}>4. Pila "Caótica" / Escritorio</h3>
            <p className="text-center text-muted small mb-4">Extrema rotación (25deg), dando la sensación de "tiradas de cualquier manera".</p>
            <div className="d-flex justify-content-center">
              <Swiper
                effect={'cards'}
                grabCursor={true}
                cardsEffect={{
                  perSlideRotate: 25,
                  perSlideOffset: 16,
                  slideShadows: true,
                }}
                modules={[EffectCards, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                style={{ width: '340px', height: '440px' }}
              >
                {mockData.map((d) => (
                  <SwiperSlide key={`c4-${d.id}`} style={{ borderRadius: '24px' }}>
                    <CardContent data={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* VERSIÓN 5: CREATIVE DECK DROP */}
          <div className="col-lg-12 mb-5">
            <h3 className="text-center mb-4" style={{ color: '#60a5fa' }}>5. Descarte Lateral (Alternativo)</h3>
            <p className="text-center text-muted small mb-4">Utiliza "Creative" para apilar totalmente en bloque, y la carta descartada vuela brutalmente hacia el costado.</p>
            <div className="d-flex justify-content-center">
              <Swiper
                grabCursor={true}
                effect={'creative'}
                creativeEffect={{
                  prev: {
                    shadow: true,
                    translate: ['-120%', 0, -500],
                  },
                  next: {
                    shadow: true,
                    translate: ['120%', 0, -500],
                  },
                }}
                modules={[EffectCreative, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                style={{ width: '340px', height: '440px' }}
              >
                {mockData.map((d) => (
                  <SwiperSlide key={`c5-${d.id}`} style={{ borderRadius: '24px' }}>
                    <CardContent data={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SwiperTest;
