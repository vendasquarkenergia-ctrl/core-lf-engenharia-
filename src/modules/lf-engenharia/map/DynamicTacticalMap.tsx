import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Navigation, Plus, MapPin, Building2, BellRing, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../../../core/components/layout/MainLayout';

// ===============================================
// MOCK DATA
// ===============================================
interface ObraMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'No Prazo' | 'Em Alerta' | 'Crítico';
}

const INITIAL_OBRAS: ObraMarker[] = [
  { id: '1', name: 'Residencial Alpha', lat: -9.6659, lng: -35.7350, status: 'No Prazo' },
  { id: '2', name: 'Corporate Norte', lat: -9.6450, lng: -35.7150, status: 'Em Alerta' },
  { id: '3', name: 'Complexo Logístico', lat: -9.6850, lng: -35.7550, status: 'Crítico' },
];

// ===============================================
// HELPER: CUSTOM GLOW MARKERS
// ===============================================
const getStatusColor = (status: string) => {
  switch (status) {
    case 'No Prazo': return '#10B981'; // lf-green
    case 'Em Alerta': return '#C89B3C'; // lf-gold
    case 'Crítico': return '#EF4444'; // red
    default: return '#C89B3C';
  }
};

const createPulseIcon = (status: string) => {
  const color = getStatusColor(status);
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style="background-color: ${color};"></span>
        <span class="relative inline-flex w-4 h-4 rounded-full border-2 border-black" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// ===============================================
// SUBCOMPONENT: MAP FLY-TO UPDATER
// ===============================================
const MapUpdater = ({ lastAdded }: { lastAdded: ObraMarker | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lastAdded) {
      map.flyTo([lastAdded.lat, lastAdded.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [lastAdded, map]);

  return null;
};

// ===============================================
// MAIN COMPONENT
// ===============================================
export const DynamicTacticalMap = () => {
  const [obrasAtivas, setObrasAtivas] = useState<ObraMarker[]>(INITIAL_OBRAS);
  const [lastAdded, setLastAdded] = useState<ObraMarker | null>(INITIAL_OBRAS[0]); // Centers initially on first

  // Form State
  const [nomeObra, setNomeObra] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [status, setStatus] = useState<'No Prazo' | 'Em Alerta' | 'Crítico'>('No Prazo');
  const [errorMsg, setErrorMsg] = useState('');

  const handleImplantar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!nomeObra || !lat || !lng) return;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Geographic Validations
    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg('Coordenadas devem ser números válidos.');
      return;
    }
    if (latNum < -90 || latNum > 90) {
      setErrorMsg('Latitude deve estar entre -90 e 90 graus.');
      return;
    }
    if (lngNum < -180 || lngNum > 180) {
      setErrorMsg('Longitude deve estar entre -180 e 180 graus.');
      return;
    }

    const newObra: ObraMarker = {
      id: Math.random().toString(36).substr(2, 9),
      name: nomeObra,
      lat: latNum,
      lng: lngNum,
      status
    };

    setObrasAtivas([...obrasAtivas, newObra]);
    setLastAdded(newObra);
    
    // Clear inputs
    setNomeObra('');
    setLat('');
    setLng('');
  };

  const handleRemoveObra = (id: string) => {
    setObrasAtivas(obrasAtivas.filter(o => o.id !== id));
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex flex-col pt-4">
      <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="text-lf-gold" size={24} /> Implantação Tática
          </h1>
          <p className="text-sm font-bold text-lf-muted mt-1 uppercase tracking-widest">Controle Geoespacial das Obras</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-0 pb-4">
        
        {/* 1. FORMULÁRIO DE IMPLANTAÇÃO (Painel Lateral) */}
        <div className="w-full lg:w-80 shrink-0 glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-lf-gold/10 text-lf-gold rounded-xl border border-lf-gold/20">
              <Navigation size={20} />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Nova Implantação</h2>
          </div>

          <form onSubmit={handleImplantar} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Nome da Obra</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={nomeObra} 
                  onChange={e => setNomeObra(e.target.value)}
                  placeholder="Ex: Torre Alpha"
                  className="w-full bg-lf-bg border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:border-lf-gold transition-colors"
                />
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lf-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Latitude</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any"
                    value={lat} 
                    onChange={e => setLat(e.target.value)}
                    placeholder="-9.6659"
                    className="w-full bg-lf-bg border border-white/10 rounded-xl pl-8 pr-3 py-3 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:border-lf-gold transition-colors"
                  />
                  <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lf-muted" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Longitude</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any"
                    value={lng} 
                    onChange={e => setLng(e.target.value)}
                    placeholder="-35.7350"
                    className="w-full bg-lf-bg border border-white/10 rounded-xl pl-8 pr-3 py-3 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:border-lf-gold transition-colors"
                  />
                  <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lf-muted" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-lf-muted uppercase tracking-widest mb-1.5 block">Status Inicial</label>
              <div className="relative">
                <select 
                  value={status} 
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-lf-bg border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white appearance-none focus:outline-none focus:border-lf-gold transition-colors"
                >
                  <option value="No Prazo">No Prazo</option>
                  <option value="Em Alerta">Em Alerta</option>
                  <option value="Crítico">Crítico</option>
                </select>
                <BellRing size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lf-muted" />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={!nomeObra || !lat || !lng}
              className="w-full mt-4 h-12 bg-lf-gold text-black shrink-0 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-lf-gold/90 transition-all active:scale-95 shadow-[0_4px_15px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:active:scale-100"
            >
              <Plus size={18} strokeWidth={3} />
              Implantar no Mapa
            </button>
          </form>
        </div>

        {/* 2. O MAPA TÁTICO */}
        <div className="flex-1 bg-lf-bg border border-white/10 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-0 isolate">
          <MapContainer 
            center={[-9.6659, -35.7350]} 
            zoom={13} 
            zoomControl={false}
            style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
          >
            {/* TileLayer do CartoDB Dark Matter */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {obrasAtivas.map(obra => (
              <Marker 
                key={obra.id} 
                position={[obra.lat, obra.lng]} 
                icon={createPulseIcon(obra.status)}
              >
                <Popup 
                  className="custom-dark-popup"
                  autoPanPadding={[50, 50]}
                >
                  <div className="glass-panel text-white p-3 rounded-lg border border-white/10 min-w[200px]">
                     <h3 className="font-black uppercase tracking-wide text-sm border-b border-white/10 pb-2 mb-2">{obra.name}</h3>
                     <p className="text-[10px] text-lf-muted font-mono mb-2">{obra.lat.toFixed(4)}, {obra.lng.toFixed(4)}</p>
                     <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-1.5">
                         <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(obra.status)}} />
                         <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getStatusColor(obra.status)}}>{obra.status}</span>
                       </div>
                       <button 
                         onClick={() => handleRemoveObra(obra.id)}
                         className="text-lf-muted hover:text-red-500 transition-colors p-1"
                         title="Remover Obra"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapUpdater lastAdded={lastAdded} />
          </MapContainer>
          
          {/* Radar Overlay Estético (Crosshairs) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
             <div className="w-[1px] h-full bg-lf-gold" />
             <div className="absolute w-full h-[1px] bg-lf-gold" />
             <div className="absolute w-64 h-64 border border-lf-gold rounded-full" />
             <div className="absolute w-96 h-96 border border-lf-gold rounded-full" />
             <div className="absolute w-[500px] h-[500px] border border-lf-gold rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Estilos Globais para o Popup do Leaflet (Evitar criar CSS separado para poucas linhas) */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 100% !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: white;
          top: 12px;
          right: 12px;
        }
      `}</style>
    </div>
  );
};
