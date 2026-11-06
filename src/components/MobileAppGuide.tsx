import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Cpu,
  Share2,
  QrCode
} from 'lucide-react';

export function MobileAppGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [appUrl, setAppUrl] = useState<string>('');

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPwa);
    setAppUrl(window.location.href);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Tippe im Handy-Browser (Chrome oder Safari) oben/unten rechts auf das Menü (3 Punkte bzw. Teilen-Icon) und wähle "App installieren" oder "Zum Startbildschirm hinzufügen"!');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "de.fisi.praktikumradar",
  "appName": "FISI Praktikum Radar",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  const buildApkCommands = `# 1. App für Produktion kompilieren
npm run build

# 2. Capacitor Android initialisieren (falls noch nicht getan)
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "FISI Praktikum Radar" "de.fisi.praktikumradar" --web-dir dist
npx cap add android

# 3. Web-Assets in Android-Ordner kopieren & APK erstellen
npx cap copy android
npx cap sync android

# 4. APK direkt im Terminal kompilieren (Debug-APK)
cd android
./gradlew assembleDebug

# -> Fertige APK liegt in:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono font-medium">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Handy-App &amp; APK Architektur</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wie bauen wir deine Handy App / APK?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Hier erfährst du genau, was eine <strong>APK</strong> ist, warum du sie dank <strong>PWA</strong> in 3 Sekunden auf deinem Handy hast, und wie wir eine eigenständige Android-Installationsdatei erstellen.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isStandalone ? (
              <div className="px-4 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Bereits als App installiert!</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Jetzt auf Handy installieren</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 text-center font-mono">
              Kein Google Play Account nötig
            </span>
          </div>
        </div>
      </div>

      {/* Comparison: PWA vs. APK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: PWA (Recommended) */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            Empfohlen &bull; Sofort fertig
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">1. PWA (Progressive Web App)</h3>
              <p className="text-xs text-emerald-400 font-medium">Haben wir bereits 100% fertig gebaut</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Eine moderne Web-App, die sich auf Android und iPhone exakt wie eine native Handy-App verhält:
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Eigenes App-Icon</strong> auf deinem Android/iPhone Startbildschirm.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Echter Vollbild-Modus:</strong> Keine störende Browser-Adressleiste.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Push-Nachrichten &amp; Offline:</strong> Echte Web-Push-Alarme für neue Firmen.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Automatische Updates:</strong> Bei jeder Änderung aktualisiert sich die App von allein.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-2">So installierst du sie in 5 Sekunden:</div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div>1. Öffne die URL dieser Seite auf deinem Smartphone (Chrome / Safari).</div>
              <div>2. Tippe auf das Menü (3 Punkte oder "Teilen").</div>
              <div>3. Wähle <strong>"App installieren"</strong> oder <strong>"Zum Startbildschirm"</strong>.</div>
            </div>
          </div>
        </div>

        {/* Option 2: Native APK */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 transition rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="absolute top-4 right-4 bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            Echtes Android Paket
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cpu className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">2. Echte Android APK (.apk)</h3>
              <p className="text-xs text-sky-400 font-medium">Mit Capacitor oder Bubblewrap gebaut</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Eine <code>.apk</code> ist die Installationsdatei für Android (wie <code>.exe</code> für Windows).
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Wird über USB oder Download auf das Handy übertragen ("Sideloading").</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Kann im Google Play Store veröffentlicht werden.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Benötigt zum Kompilieren das Android SDK (Java/Gradle Compiler).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Keine Unterschiede im Design oder Verhalten zur PWA!</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-2">Was musst du dafür tun?</div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              Ich habe dir unten die <strong>Capacitor-Konfiguration</strong> und das <strong>Kompilier-Skript</strong> vorbereitet. Du kannst es direkt ausführen oder per GitHub Action kompilieren lassen.
            </div>
          </div>
        </div>
      </div>

      {/* URL Sharing / QR Code Helper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">App direkt am Smartphone öffnen</h4>
              <p className="text-xs text-slate-400">Kopiere die App-URL oder teile sie mit deinem Smartphone</p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(appUrl || window.location.href, 'app-url')}
            className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            {copiedCode === 'app-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'app-url' ? 'Kopiert!' : 'URL kopieren'}</span>
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 break-all select-all flex items-center justify-between">
          <span>{appUrl || 'https://ais-dev-...run.app'}</span>
        </div>
      </div>

      {/* Technical: Capacitor & APK Build Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Schritt-für-Schritt: Die .apk Datei erzeugen</h4>
            <p className="text-xs text-slate-400">
              Mit diesen Befehlen erstellst du aus diesem Quellcode eine eigenständige <code>app-debug.apk</code>
            </p>
          </div>
        </div>

        {/* 1. Capacitor Config */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 font-mono">capacitor.config.json (bereits im Root hinterlegt)</span>
            <button
              onClick={() => copyToClipboard(capacitorConfig, 'cap-config')}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              {copiedCode === 'cap-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Kopieren</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto">
            {capacitorConfig}
          </pre>
        </div>

        {/* 2. Build Commands */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 font-mono">Terminal-Befehle zum Kompilieren der APK</span>
            <button
              onClick={() => copyToClipboard(buildApkCommands, 'build-cmd')}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              {copiedCode === 'build-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Befehle kopieren</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
            {buildApkCommands}
          </pre>
        </div>

        {/* Summary note */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Fazit: Was ist der beste Weg für dich?</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Nimm die <strong>PWA-Option</strong>! Du öffnest einfach die Web-Adresse auf deinem Handy, tippst auf <em>"App installieren"</em>, und du hast in 3 Sekunden das offizielle <strong>FISI Praktikum-Radar Icon</strong> auf deinem Smartphone. Es läuft blitzschnell, verbraucht kaum Speicher und schickt dir sofort Push-Mitteilungen bei neuen Firmen!
          </p>
        </div>
      </div>
    </div>
  );
}
