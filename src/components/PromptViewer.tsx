import React, { useState } from 'react';
import { PromptConfig, generatePromptMarkdown } from '../data/promptTemplate';
import { 
  Copy, 
  Check, 
  Download, 
  Sliders, 
  MapPin, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Train,
  Car
} from 'lucide-react';

interface PromptViewerProps {
  config: PromptConfig;
  onUpdateConfig: (newConfig: PromptConfig) => void;
  onSelectCompanyForLetter?: (companyName: string, location: string) => void;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({ config, onUpdateConfig }) => {
  const [copied, setCopied] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const markdownText = generatePromptMarkdown(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FISI_Praktikumssuche_97225_Zellingen_${config.radiusKm}km.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([markdownText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FISI_Praktikumssuche_97225_Zellingen_${config.radiusKm}km.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Key Highlights */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono text-sm tracking-wide font-medium mb-1">
              <MapPin className="w-4 h-4" />
              <span>97225 ZELLINGEN &bull; MAX. {config.radiusKm} KM &bull; 100% HOMEOFFICE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              FISI Praktikumssuche Prompt für Zellingen
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Vollständig angepasst für deine COMCAVE-Umschulung zum Fachinformatiker Systemintegration (Praxisstart 21.09.2027),
              den Standort 97225 Zellingen (Unterfranken / Main-Spessart), Würzburg, Karlstadt, Lohr am Main und 100% Remote.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>{showConfigDrawer ? 'Filter schließen' : 'Prompt anpassen'}</span>
            </button>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopiert!' : 'Prompt kopieren'}</span>
            </button>
          </div>
        </div>

        {/* What was customized overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs text-slate-300">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider block">Standort &amp; Umkreis</span>
            <div className="font-semibold text-sky-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>97225 Zellingen (max. {config.radiusKm} km)</span>
            </div>
            <p className="text-slate-400 text-[11px]">Würzburg, Karlstadt, Lohr, Marktheidenfeld, Gemünden</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider block">Verkehr &amp; Mobilität</span>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Retzbach-Zellingen Bf &bull; B27</span>
            </div>
            <p className="text-slate-400 text-[11px]">14 Min. nach Würzburg Hbf, 7 Min. Karlstadt, 26 Min. Lohr</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider block">IHK &amp; Träger</span>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>IHK Würzburg-Schweinfurt</span>
            </div>
            <p className="text-slate-400 text-[11px]">COMCAVE.COLLEGE Würzburg &amp; Online</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider block">3 Praxiszeiträume</span>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>21.09.27 – 13.04.28</span>
            </div>
            <p className="text-slate-400 text-[11px]">Alle 3 Blöcke exakt integriert</p>
          </div>
        </div>

        {/* Profile Status Banner */}
        {config.userProfile?.summary && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-slate-200">
                <strong>Mein Lebenslauf &amp; Profil: </strong>
                {config.includeProfileInPrompt ? 'Im Prompt integriert (Abschnitt 4.1)' : 'Nicht im Prompt eingebunden'}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={config.includeProfileInPrompt}
                onChange={(e) => onUpdateConfig({ ...config, includeProfileInPrompt: e.target.checked })}
                className="rounded accent-sky-400"
              />
              <span>Profil im Prompt aktivieren</span>
            </label>
          </div>
        )}
      </div>

      {/* Configuration Drawer */}
      {showConfigDrawer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-sm">Parameter des Prompts feinjustieren</h3>
            </div>
            <span className="text-xs text-slate-400">Änderungen werden sofort in den Markdown-Prompt übernommen</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-sm">
            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Suchumkreis um 97225 Zellingen</label>
                <span className="font-mono text-sky-400 font-bold">{config.radiusKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={config.radiusKm}
                onChange={(e) => onUpdateConfig({ ...config, radiusKm: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>10 km (Nahbereich)</span>
                <span>30 km (Standard)</span>
                <span>50 km (Erweitert)</span>
              </div>
            </div>

            {/* Target Location */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Wohnort &amp; Region</label>
              <input
                type="text"
                value={config.location}
                onChange={(e) => onUpdateConfig({ ...config, location: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
              <span className="text-[11px] text-slate-400 block">Zuständige Kammer: {config.ihk}</span>
            </div>

            {/* Fast Quick Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Suchfokus</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.priorityRemote}
                    onChange={(e) => onUpdateConfig({ ...config, priorityRemote: e.target.checked })}
                    className="rounded accent-sky-400"
                  />
                  <span>100% Homeoffice / Deutschlandweit (Priorität 1)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.priorityRegion}
                    onChange={(e) => onUpdateConfig({ ...config, priorityRegion: e.target.checked })}
                    className="rounded accent-sky-400"
                  />
                  <span>Vor-Ort &amp; Hybrid im 30-km-Radius (Priorität 2)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Prompt Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Box Top Bar */}
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-200">FISI_Praktikumssuche_Zellingen_30km.md</span>
            <span className="text-slate-500 hidden sm:inline">&bull; Bereit für ChatGPT, Gemini, Claude, Make oder n8n</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition"
              title="Als Markdown herunterladen"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition"
              title="Als Textdatei herunterladen"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.txt</span>
            </button>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
            </button>
          </div>
        </div>

        {/* Formatted Markdown Content */}
        <div className="p-6 overflow-x-auto text-slate-200 font-sans text-sm leading-relaxed max-h-[650px] overflow-y-auto selection:bg-sky-500/30">
          <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap text-slate-200 font-normal leading-relaxed selection:bg-sky-500/30">
            {markdownText}
          </pre>
        </div>

        {/* Box Footer Advice */}
        <div className="bg-slate-900/60 px-5 py-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Tipp für 2027:</strong> Weil offizielle Ausschreibungen für September 2027 erst 2026/2027 online gehen,
              sucht der Prompt gezielt nach IHK-Ausbildungsbetrieben und Systemhäusern für Initiativanfragen.
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4 self-start sm:self-auto shrink-0"
          >
            Jetzt kopieren &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
