import React, { useState } from 'react';
import { Search, Sparkles, ExternalLink, Loader2, RefreshCw, AlertCircle, MapPin, Globe } from 'lucide-react';

interface AiSearchResult {
  text: string;
  sources: Array<{ title: string; url: string }>;
}

export const AiSearchTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    'Recherchiere aktuelle IT-Systemhäuser und Ausbildungsbetriebe im Umkreis von 30 km um 97225 Zellingen (Würzburg, Karlstadt, Lohr)',
    'Finde Behörden, Kliniken und Stadtverwaltungen mit eigener IT-Infrastruktur im Landkreis Main-Spessart und Würzburg für FISI Praktika',
    'Finde deutsche IT-Unternehmen mit 100% Homeoffice / Remote Angebot für Fachinformatiker Systemintegration Praxisphasen',
    'Welche IHK-Ausbildungsbetriebe in Unterfranken (IHK Würzburg-Schweinfurt) bilden Fachinformatiker Systemintegration aus?',
  ];

  const handleSearch = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    if (customQuery) setQuery(customQuery);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          location: '97225 Zellingen',
          radius: 30,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Serverfehler: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Die KI-Recherche konnte nicht durchgeführt werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Live-Recherche &bull; Gemini 3.8 Flash mit Google Search Grounding</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">
          Live-Praktikums- und Firmenrecherche
        </h2>
        <p className="text-slate-400 text-xs mt-1 max-w-3xl">
          Führe den Such-Prompt direkt im Web aus. Gemini durchsucht das Internet mit echten Websuchdaten
          nach Ausbildungsbetrieben, IT-Systemhäusern und Stellenangeboten für 97225 Zellingen (+30 km) und 100% Remote.
        </p>

        {/* Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="z.B. IT-Systemhäuser Würzburg Karlstadt Initiativbewerbung..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Recherchiere...' : 'Recherche starten'}</span>
          </button>
        </div>

        {/* Quick Suggestion Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Schnell-Recherchen für Zellingen:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(p)}
                disabled={loading}
                className="text-left text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900 rounded-xl p-4 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Hinweis:</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-300 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-100 text-sm">Gemini durchsucht das Web für 97225 Zellingen...</h3>
            <p className="text-slate-400 text-xs">
              Recherchiere Unternehmenswebseiten, IHK-Listen und Stellenbörsen in Main-Spessart, Würzburg und Remote.
            </p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Ergebnisse der Recherche für Zellingen &amp; 30 km Umkreis</span>
            </div>
            <button
              onClick={() => handleSearch()}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Aktualisieren</span>
            </button>
          </div>

          <div className="p-6 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-sky-500/30">
            {result.text}
          </div>

          {/* Web Sources & Grounding */}
          {result.sources && result.sources.length > 0 && (
            <div className="bg-slate-900/60 p-4 border-t border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Ermittelte Online-Quellen &amp; Referenzen:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {result.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-sky-300 transition truncate"
                  >
                    <span className="truncate pr-2">{src.title || src.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
