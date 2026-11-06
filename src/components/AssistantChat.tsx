import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader2, HelpCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const AssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `Hallo! Ich bin dein KI-Umschulungsassistent für die Fachinformatiker Systemintegration (FISI) Umschulung bei COMCAVE.

Ich unterstütze dich speziell bei deiner Praktikumssuche rund um **97225 Zellingen**, Würzburg, Main-Spessart oder bundesweit im **100% Homeoffice**.

Wie kann ich dir helfen? Du kannst mich z. B. fragen:
- *„Wie begründe ich Betrieben gegenüber die Aufteilung in 3 Praxisblöcke?“*
- *„Welche IHK-Projektarbeiten passen gut zu Systemhäusern in Unterfranken?“*
- *„Wie formuliere ich im Gespräch, dass die Umschulung gefördert wird und keine Lohnkosten anfallen?“*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Wie argumentiere ich die 3 getrennten Praktikumsblöcke gegenüber Betrieben?',
    'Welche IHK-Projektideen eignen sich für FISI Umschüler (IHK Würzburg-Schweinfurt)?',
    'Wie formuliere ich, dass das Praktikum den Betrieb kein Gehalt kostet?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error('Fehler bei der Antwort');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', content: data.text || 'Keine Antwort erhalten.' }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Entschuldigung, es gab ein Verbindungsproblem zum KI-Dienst.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase mb-1">
          <Bot className="w-4 h-4" />
          <span>FISI Karriere- &amp; Umschulungs-Assistent</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">
          Persönliche Beratung zur Praktikumssuche
        </h2>
        <p className="text-slate-400 text-xs mt-1 max-w-2xl">
          Frage nach Tipps für Vorstellungsgespräche, IHK-Projektarbeit bei der IHK Würzburg-Schweinfurt,
          oder wie du mit Betrieben in Zellingen, Karlstadt und Würzburg in Kontakt trittst.
        </p>

        {/* Suggestion Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-left text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg transition"
            >
              &bull; {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4 selection:bg-sky-500/30">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-xs sm:text-sm ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-4 leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Assistent tippt eine Antwort...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Stelle eine Frage zu COMCAVE, IHK-Projekt, Zellingen..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center p-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
