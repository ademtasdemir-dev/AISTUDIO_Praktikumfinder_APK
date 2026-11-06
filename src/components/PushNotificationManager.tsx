import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Send, 
  Smartphone,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'job' | 'reminder' | 'system';
}

export const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [intervalMin, setIntervalMin] = useState(30);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Neuer IT-Betrieb im Radar erfasst',
      body: 'Landratsamt Main-Spessart (Karlstadt, 10 km) hat passende Infrastruktur für FISI-Praktikum 2027/2028.',
      timestamp: 'Vor 15 Min.',
      type: 'job',
    },
    {
      id: 'notif-2',
      title: 'Erinnerung: Nachfass-Frist',
      body: 'Bewerbung bei UKW Servicezentrum IT: 14-Tage Frist läuft am 08.11. ab.',
      timestamp: 'Vor 2 Stunden',
      type: 'reminder',
    },
  ]);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        const saved = localStorage.getItem('fisi_push_enabled');
        if (saved !== null) {
          setEnabled(saved === 'true');
        } else {
          setEnabled(true);
        }
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Dieser Browser unterstützt keine Web-Push-Benachrichtigungen.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem('fisi_push_enabled', 'true');
        sendNativePush(
          '🔔 Push-Benachrichtigungen aktiv!',
          'Du erhältst ab jetzt alle 30 Min. Benachrichtigungen über neue FISI-Praktikumsplätze rund um Zellingen.'
        );
      } else {
        setEnabled(false);
        localStorage.setItem('fisi_push_enabled', 'false');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
    } else {
      const next = !enabled;
      setEnabled(next);
      localStorage.setItem('fisi_push_enabled', next ? 'true' : 'false');
    }
  };

  const sendNativePush = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.svg',
          badge: '/pwa-192x192.svg',
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Add to in-app log
    const newItem: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: 'Gerade eben',
      type: 'job',
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const handleSendTestPush = () => {
    setTestSent(true);
    sendNativePush(
      '🚀 Neuer Praktikumsplatz gefunden!',
      'Mediengruppe Main-Post in Würzburg (18 km von Zellingen) – Umschulungs-Praxisphase 2027/2028 möglich!'
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-5 text-slate-200">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Handy-Push-Benachrichtigungen
                </h3>
                {enabled ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    Aktiv
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    Inaktiv
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Automatische Meldungen bei neuen Praktikumsplätzen in 97225 Zellingen &amp; Unterfranken.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              enabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{enabled ? 'Push aktiv (Ausschalten)' : 'Push aktivieren'}</span>
          </button>
        </div>

        {/* Test Push Button */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Teste sofort, wie Benachrichtigungen auf deinem Smartphone ankommen:</span>
          </div>

          <button
            onClick={handleSendTestPush}
            disabled={testSent}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Send className="w-3 h-3" />
            <span>{testSent ? '✓ Push gesendet!' : 'Test-Push jetzt senden'}</span>
          </button>
        </div>
      </div>

      {/* Interval & Settings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Intervall &amp; Filter-Einstellungen</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => setIntervalMin(30)}
            className={`p-3 rounded-xl border text-left transition ${
              intervalMin === 30
                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-slate-200">Alle 30 Minuten</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Prompt-Standard für Umschulungssuche</div>
          </button>

          <button
            onClick={() => setIntervalMin(60)}
            className={`p-3 rounded-xl border text-left transition ${
              intervalMin === 60
                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-slate-200">Stündlich</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Schont Smartphone-Akku</div>
          </button>

          <button
            onClick={() => setIntervalMin(1440)}
            className={`p-3 rounded-xl border text-left transition ${
              intervalMin === 1440
                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-slate-200">1x täglich</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tägliche Zusammenfassung um 09:00 Uhr</div>
          </button>
        </div>
      </div>

      {/* Notification Center History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Benachrichtigungs-Zentrale (Letzte Meldungen)</span>
          </h4>
          <span className="text-[11px] text-slate-500">{notifications.length} Meldungen</span>
        </div>

        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs">{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
