import React, { useState } from 'react';
import { 
  Terminal, 
  Clock, 
  Workflow, 
  Bell, 
  Copy, 
  Check, 
  Download, 
  Code, 
  ShieldAlert, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const AutomationGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'n8n' | 'rss'>('python');
  const [copiedPython, setCopiedPython] = useState(false);

  const pythonScript = `#!/usr/bin/env python3
"""
FISI Praktikumssuche Automatisierung für 97225 Zellingen (max. 30 km Umkreis)
Läuft alle 30 Minuten via Cronjob oder Endlosschleife und sendet neue Betriebe per Telegram / Webhook.
"""

import os
import time
import json
import requests
from google import genai
from google.genai import types

# 1. Konfiguration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "DEIN_GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")  # Optional: für Push-Benachrichtigungen
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")      # Optional: Telegram Chat ID
HISTORY_FILE = "gefundene_betriebe_zellingen.json"

PROMPT_TEXT = """
Recherchiere im Internet nach Ausbildungs- und Praktikumsbetrieben für eine Umschulung zum 
Fachinformatiker Systemintegration (FISI) im Raum 97225 Zellingen (Main-Spessart, Bayern) 
und einem Umkreis von max. 30 km (insbesondere Würzburg, Karlstadt, Lohr am Main, Marktheidenfeld) 
oder mit 100% Homeoffice.
Praktikumszeiträume:
- 21.09.2027 – 28.09.2027
- 30.09.2027 – 10.02.2028
- 10.03.2028 – 13.04.2028
Bildungsträger: COMCAVE (Campus Würzburg / bundesweit).

Gib gefundene Betriebe strukturiert aus mit:
- Unternehmensname
- Standort und Distanz zu 97225 Zellingen
- Arbeitsmodell (Remote / Vor Ort / Hybrid)
- Eignung für Umschulung / Initiativbewerbung
- Link zur Karriereseite
"""

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

def send_telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[INFO] Kein Telegram konfiguriert. Konsole-Ausgabe:")
        print(message)
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    requests.post(url, json=payload)

def run_fisi_search():
    print(f"[{time.strftime('%H:%M:%S')}] Starte 30-Minuten-Recherche für Zellingen...")
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Aufruf mit Google Search Grounding für aktuelle Internetdaten
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=PROMPT_TEXT,
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}],
            temperature=0.2,
        ),
    )
    
    found_text = response.text or ""
    history = load_history()
    
    # Ausgabe & Benachrichtigung
    print(found_text)
    send_telegram_alert(f"🚀 *Neue FISI-Recherche für 97225 Zellingen (30 km)*:\\n\\n{found_text[:3500]}")

if __name__ == "__main__":
    print("=== Starte automatische Praktikumssuche (Intervall: 30 Minuten) ===")
    while True:
        try:
            run_fisi_search()
        except Exception as e:
            print(f"[FEHLER] Recherche fehlgeschlagen: {e}")
        
        # 30 Minuten warten (1800 Sekunden)
        print("Warte 30 Minuten bis zur nächsten Überprüfung...")
        time.sleep(1800)
`;

  const handleCopyPython = async () => {
    try {
      await navigator.clipboard.writeText(pythonScript);
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPython = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fisi_suche_zellingen_30min.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Automatisierungs-Leitfaden</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">
          Wie die 30-Minuten-Überwachung technisch funktioniert
        </h2>
        <p className="text-slate-400 text-xs mt-1 max-w-3xl">
          Ein LLM im normalen Web-Browser-Chat kann von alleine keine zeitgesteuerten Aktionen starten. 
          Damit dein Prompt wirklich <strong>alle 30 Minuten</strong> im Internet sucht und dich bei neuen Firmen benachrichtigt,
          hast du drei einfache, praxiserprobte Wege:
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('python')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'python'
              ? 'border-sky-400 text-sky-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Option A: Python-Skript (Empfohlen für FISI)</span>
        </button>

        <button
          onClick={() => setActiveTab('n8n')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'n8n'
              ? 'border-sky-400 text-sky-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Option B: No-Code (Make.com / n8n)</span>
        </button>

        <button
          onClick={() => setActiveTab('rss')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'rss'
              ? 'border-sky-400 text-sky-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Option C: Arbeitsagentur &amp; Google Alerts</span>
        </button>
      </div>

      {/* Content A: Python */}
      {activeTab === 'python' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Eigenes Überwachungsskript mit Gemini 3.8 Flash &amp; Google Search</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Als angehender Fachinformatiker für Systemintegration ist dieses Skript ideal: Es nutzt die offizielle
              Google GenAI Bibliothek, aktiviert Google Search Grounding und läuft im Hintergrund auf deinem PC, einem
              Raspberry Pi oder einem kleinen Linux-Server.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">1. Bibliothek installieren</span>
                <code className="text-sky-300 font-mono text-[11px]">pip install google-genai requests</code>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">2. API-Key setzen</span>
                <code className="text-sky-300 font-mono text-[11px]">export GEMINI_API_KEY="dein_key"</code>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">3. Skript starten</span>
                <code className="text-sky-300 font-mono text-[11px]">python3 fisi_suche.py</code>
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-200">fisi_suche_zellingen_30min.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPython}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .py</span>
                </button>
                <button
                  onClick={handleCopyPython}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded transition ${
                    copiedPython ? 'bg-emerald-600 text-white' : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  {copiedPython ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPython ? 'Kopiert' : 'Code kopieren'}</span>
                </button>
              </div>
            </div>
            <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[450px] leading-relaxed selection:bg-sky-500/30">
              {pythonScript}
            </pre>
          </div>
        </div>
      )}

      {/* Content B: n8n / Make */}
      {activeTab === 'n8n' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 text-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-sky-400" />
            <span>Workflow-Automation ohne eigenen Code (z.B. Make.com oder n8n)</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Wenn du keinen dauerhaft laufenden PC oder Server hast, kannst du den Prompt in einem kostenlosen
            Cloud-Automatisierer (wie Make.com mit 1.000 kostenlosen Ops/Monat oder selbstgehostetem n8n) laufen lassen:
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <strong className="text-slate-200 block">Schedule Trigger einrichten:</strong>
                <span className="text-slate-400">Intervall auf 30 Minuten (oder z.B. stündlich von 08:00 bis 18:00 Uhr zur Schonung von Kontingenten) einstellen.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <strong className="text-slate-200 block">Gemini API Node / HTTP Request:</strong>
                <span className="text-slate-400">Den angepassten Zellingen-Prompt an die Gemini 3.8 Flash API schicken (inkl. Google Search Grounding).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <strong className="text-slate-200 block">Deduplizierung &amp; Benachrichtigung:</strong>
                <span className="text-slate-400">Vergleiche den Firmennamen mit einem Google Sheet oder Data Store. Nur wenn eine neue Firma gefunden wurde, wird eine Nachricht an dein Smartphone gesendet (Telegram Bot, Discord Webhook oder E-Mail).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content C: RSS & Jobsuche */}
      {activeTab === 'rss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 text-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <span>Kombination mit offiziellen Jobbörsen &amp; Google Alerts</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Für maximale Abdeckung empfiehlt es sich, neben dem KI-Prompt auch automatische Suchaufträge bei den
            großen Stellenbörsen für die Postleitzahl <strong>97225 Zellingen (30 km Umkreis)</strong> anzulegen:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <strong className="text-slate-200 block text-xs">Arbeitsagentur Jobsuche (Offiziell)</strong>
              <p className="text-slate-400 text-[11px]">
                Suchbegriff: "Fachinformatiker Systemintegration" | Ort: "97225 Zellingen" | Umkreis: "30 km" | Art: "Praktikum / Ausbildung".
              </p>
              <a
                href="https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Fachinformatiker%20Systemintegration&wo=97225%20Zellingen&umkreis=30"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold text-[11px] pt-1"
              >
                <span>Zur Arbeitsagentur-Suche Zellingen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <strong className="text-slate-200 block text-xs">Google Alerts für Unterfranken</strong>
              <p className="text-slate-400 text-[11px]">
                Erstelle Google Alerts für Suchphrasen wie:<br />
                <code>"Fachinformatiker Systemintegration" Praktikum (Würzburg OR Karlstadt OR Lohr)</code>
              </p>
              <a
                href="https://www.google.de/alerts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold text-[11px] pt-1"
              >
                <span>Google Alerts öffnen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
