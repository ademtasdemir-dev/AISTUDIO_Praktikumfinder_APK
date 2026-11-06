import React, { useState } from 'react';
import { 
  MapPin, 
  X, 
  Check, 
  Navigation, 
  Sliders, 
  Building2, 
  Sparkles,
  Info
} from 'lucide-react';
import { LocationPreset, locationPresets } from '../data/locations';

interface LocationSwitcherModalProps {
  currentLocation: LocationPreset;
  currentRadius: number;
  onSelectLocation: (location: LocationPreset) => void;
  onUpdateRadius: (radius: number) => void;
  onClose: () => void;
}

export const LocationSwitcherModal: React.FC<LocationSwitcherModalProps> = ({
  currentLocation,
  currentRadius,
  onSelectLocation,
  onUpdateRadius,
  onClose,
}) => {
  const [customCity, setCustomCity] = useState('');
  const [customPostal, setCustomPostal] = useState('');
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation wird von diesem Gerät nicht unterstützt.');
      return;
    }
    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const customLoc: LocationPreset = {
          id: 'custom-gps',
          name: 'Mein aktueller GPS-Standort',
          postalCode: 'GPS',
          lat,
          lng,
          tag: 'Live-Standort per GPS',
          description: `Koordinaten: ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        };
        onSelectLocation(customLoc);
        onClose();
      },
      (err) => {
        setLocating(false);
        setGpsError('GPS-Signal nicht gefunden oder Zugriff verweigert.');
      },
      { timeout: 8000 }
    );
  };

  const handleSaveCustom = () => {
    if (!customCity.trim()) return;
    const customLoc: LocationPreset = {
      id: `custom-${Date.now()}`,
      name: customCity.trim(),
      postalCode: customPostal.trim() || '97xxx',
      lat: 49.8965, // Approximation in Main-Spessart region
      lng: 9.8163,
      tag: 'Benutzerdefinierter Standort',
      description: `Manuell eingegeben: ${customPostal} ${customCity}`,
    };
    onSelectLocation(customLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Standort wechseln</h3>
              <p className="text-[11px] text-slate-400">Distanz &amp; Fahrzeit neu berechnen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          {/* Radius Slider Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Maximaler Suchumkreis:</span>
              </span>
              <span className="font-mono text-sm font-bold text-sky-400">
                {currentRadius === 0 ? 'Nur Remote' : `${currentRadius} km`}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={currentRadius}
              onChange={(e) => onUpdateRadius(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 km (Nahbereich)</span>
              <span>30 km (Standard)</span>
              <span>60 km (Großraum)</span>
            </div>
          </div>

          {/* Quick Select Presets */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
              Empfohlene Standorte in Unterfranken
            </label>

            <div className="grid grid-cols-1 gap-2">
              {locationPresets.map((loc) => {
                const isSelected = currentLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500/80 text-sky-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {loc.name}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {loc.postalCode}
                        </span>
                        {loc.id === 'zellingen' && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            Heimatort
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {loc.tag} &bull; {loc.description}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleUseGps}
            disabled={locating}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition"
          >
            <Navigation className={`w-3.5 h-3.5 text-sky-400 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Ermittle GPS-Koordinaten...' : 'Aktuellen Standort per GPS verwenden'}</span>
          </button>
          {gpsError && (
            <p className="text-[11px] text-amber-400 text-center">{gpsError}</p>
          )}

          {/* Manual Input Accordion */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 text-[11px] block">
              Anderen Wohnort / PLZ manuell eintragen:
            </span>
            <div className="grid grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="PLZ"
                value={customPostal}
                onChange={(e) => setCustomPostal(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-center focus:outline-none focus:border-sky-500 text-xs"
              />
              <input
                type="text"
                placeholder="Ort (z.B. Arnstein)"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="col-span-3 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
            {customCity.trim() && (
              <button
                onClick={handleSaveCustom}
                className="w-full mt-2 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                Standort '{customCity}' aktivieren
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
