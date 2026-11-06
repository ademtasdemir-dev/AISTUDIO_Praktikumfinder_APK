import React, { useState, useEffect } from 'react';
import { UserProfileData } from '../data/promptTemplate';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Briefcase, 
  Cpu, 
  Award, 
  ShieldCheck, 
  Loader2, 
  Copy,
  RefreshCw,
  HelpCircle,
  UserCheck
} from 'lucide-react';

interface ResumeManagerProps {
  userProfile: UserProfileData;
  onUpdateProfile: (profile: UserProfileData) => void;
  onNavigateToPrompt: () => void;
  onNavigateToLetter: () => void;
}

export const ResumeManager: React.FC<ResumeManagerProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigateToPrompt,
  onNavigateToLetter,
}) => {
  const [cvRawText, setCvRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'feedback'>('profile');

  // Load raw CV text from local storage if available
  useEffect(() => {
    try {
      const storedCv = localStorage.getItem('fisi_cv_raw_text');
      if (storedCv) setCvRawText(storedCv);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCvRawText(text);
        try {
          localStorage.setItem('fisi_cv_raw_text', text);
        } catch (err) {
          console.error(err);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleParseWithAi = async () => {
    if (!cvRawText.trim()) return;

    setIsParsing(true);
    try {
      const res = await fetch('/api/gemini/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cvRawText }),
      });

      if (!res.ok) {
        throw new Error('Fehler bei der Lebenslauf-Analyse');
      }

      const data = await res.json();
      if (data.parsed) {
        const merged: UserProfileData = {
          ...userProfile,
          name: data.parsed.name || userProfile.name,
          phone: data.parsed.phone || userProfile.phone,
          email: data.parsed.email || userProfile.email,
          location: data.parsed.location || '97225 Zellingen',
          previousJobs: data.parsed.previousJobs || userProfile.previousJobs || [],
          itSkills: data.parsed.itSkills || userProfile.itSkills || [],
          certifications: data.parsed.certifications || userProfile.certifications || [],
          transferableStrengths: data.parsed.transferableStrengths || userProfile.transferableStrengths || [],
          summary: data.parsed.summary || userProfile.summary,
        };

        onUpdateProfile(merged);
        localStorage.setItem('fisi_user_profile', JSON.stringify(merged));
        localStorage.setItem('fisi_cv_raw_text', cvRawText);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      alert('Konnte den Lebenslauf nicht parsen: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGetFeedback = async () => {
    setIsGettingFeedback(true);
    try {
      const res = await fetch('/api/gemini/cv-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvRawText,
          parsedData: userProfile,
        }),
      });

      if (!res.ok) {
        throw new Error('Feedback konnte nicht generiert werden');
      }

      const data = await res.json();
      setFeedback(data.feedback);
      setActiveSubTab('feedback');
    } catch (err: any) {
      console.error(err);
      alert('Feedback-Generierung fehlgeschlagen.');
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const loadSampleProfile = (type: 'mechatronik' | 'kaufmann' | 'it-beginner') => {
    let sample = '';
    if (type === 'mechatronik') {
      sample = `Lebenslauf
Name: Markus Bauer
Wohnort: 97225 Zellingen
Telefon: 0151 / 98765432
E-Mail: markus.bauer@gmx.de

Aktuell: Umschulung zum Fachinformatiker für Systemintegration (FISI) bei COMCAVE (Start 2026, Praxisphase ab 21.09.2027)

Beruflicher Werdegang:
2020 – 2026: Industriemechaniker / Instandhaltungstechniker (Automobilzulieferer Raum Würzburg)
- Wartung von Produktionsanlagen und SPS-gesteuerten Systemen
- Fehlersuche an elektrischen und pneumatischen Steuerungen
- Dokumentation von Störungsbeseitigungen

2016 – 2020: Ausbildung zum Industriemechaniker (IHK)

IT-Kenntnisse & Interessen:
- Heimnetzwerk mit Linux-Homeserver (Debian, Docker, Pi-hole)
- Grundlegendes Verständnis von TCP/IP, Router-Konfiguration, VLAN
- Hardware-Bau, Troubleshooting, Komponenten-Tausch
- Windows 10/11, erste Gehversuche Windows Server

Stärken: Handwerkliches Geschick, analytische Fehlerbehebung, Schichtbereitschaft, Zuverlässigkeit, Teamgeist
Führerschein Klasse B & eigener PKW vorhanden`;
    } else if (type === 'kaufmann') {
      sample = `Lebenslauf
Name: Sabine Weber
Wohnort: 97225 Zellingen
Telefon: 0172 / 87654321
E-Mail: s.weber@outlook.de

Aktuell: Umschulung zur Fachinformatikerin für Systemintegration (COMCAVE Würzburg)

Beruflicher Werdegang:
2018 – 2026: Bürokauffrau / Vertriebsinnendienst (Großhandel Raum Mainfranken)
- Kundenbetreuung und technischer Support für ERP-Nutzer
- Betreuung der internen IT-Arbeitsplätze und MS Office / Teams Einweisung
- Schnittstelle zwischen Vertrieb und technischer Abwicklung

2015 – 2018: Ausbildung zur Kauffrau für Büromanagement

Kenntnisse:
- MS Windows 10/11, Microsoft 365 Administration (Basic), Benutzerverwaltung
- Sehr gutes Verständnis für betriebswirtschaftliche IT-Prozesse
- Ausgeprägte Kommunikationsfähigkeit und Servicedenken für First-Level-Support
- Führerschein Klasse B & Mobilität`;
    } else {
      sample = `Lebenslauf
Name: Florian Schmitt
Wohnort: 97225 Zellingen
Telefon: 0160 / 11223344
E-Mail: florian.schmitt@mail.de

Aktuell: Angehender Fachinformatiker Systemintegration (COMCAVE Umschulung)

Berufliche Stationen:
2019 – 2026: Servicetechniker / Kundendienst im Außendienst (Raum Unterfranken)
- Installation vor Ort beim Kunden, Verkabelung, Hardware-Konfiguration
- Direkter Kundenkontakt und Problemlösung unter Zeitdruck

IT-Schwerpunkte:
- Netzwerk-Grundlagen: Subnetting, IPv4/IPv6, DHCP, DNS, Switch-Konfiguration
- Virtualisierung mit Proxmox VE und VMware Workstation
- Windows Server 2022 (Active Directory, Benutzer & Gruppen, Gruppenrichtlinien)
- Linux CLI (Bash Scripting Grundlagen)
- AEVO-Vorbereitung und hohe Lernbereitschaft`;
    }

    setCvRawText(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase mb-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Lebenslauf &bull; Profil-Synchronisation</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Meinen Lebenslauf &amp; Werdegang einbinden
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              Füge deinen aktuellen Lebenslauf oder deine bisherige Berufserfahrung hier ein. 
              Die KI analysiert deine Stärken und übernimmt sie <strong>automatisch in den Such-Prompt</strong> und in 
              <strong>deine Bewerbungsanschreiben</strong> für die COMCAVE-Praxisphase 2027/2028.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {userProfile.summary && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profil aktiv verknüpft</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Master Personal Contact & Address Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Meine festen Stammdaten (Name, Anschrift &amp; Kontaktdaten)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Wird fest in allen Anschreiben und im Such-Prompt verwendet &bull; Keine Platzhalter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Vor- &amp; Nachname</label>
            <input
              type="text"
              value={userProfile.name || ''}
              onChange={(e) => {
                const updated = { ...userProfile, name: e.target.value };
                onUpdateProfile(updated);
              }}
              placeholder="z.B. Florian Schmitt"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs ${
                !userProfile.name || userProfile.name === 'Max Mustermann'
                  ? 'border-amber-700/80 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            />
          </div>

          {/* Street & Number */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Straße &amp; Hausnummer</label>
            <input
              type="text"
              value={userProfile.street || ''}
              onChange={(e) => {
                const updated = { ...userProfile, street: e.target.value };
                onUpdateProfile(updated);
              }}
              placeholder="z.B. Hauptstraße 12"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs ${
                !userProfile.street || userProfile.street === 'Musterstraße 1'
                  ? 'border-amber-700/80 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            />
          </div>

          {/* Postal Code & Town */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">PLZ &amp; Wohnort</label>
            <div className="grid grid-cols-5 gap-1.5">
              <input
                type="text"
                value={userProfile.postalCode || '97225'}
                onChange={(e) => {
                  const updated = { ...userProfile, postalCode: e.target.value };
                  onUpdateProfile(updated);
                }}
                className="col-span-2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs text-center focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                value={userProfile.city || 'Zellingen'}
                onChange={(e) => {
                  const updated = { ...userProfile, city: e.target.value };
                  onUpdateProfile(updated);
                }}
                className="col-span-3 px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Telefon / Mobilnummer</label>
            <input
              type="text"
              value={userProfile.phone || ''}
              onChange={(e) => {
                const updated = { ...userProfile, phone: e.target.value };
                onUpdateProfile(updated);
              }}
              placeholder="z.B. 0170 / 1234567"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs ${
                !userProfile.phone || userProfile.phone.includes('123456')
                  ? 'border-amber-700/80 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Second Row: Email & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">E-Mail-Adresse</label>
            <input
              type="email"
              value={userProfile.email || ''}
              onChange={(e) => {
                const updated = { ...userProfile, email: e.target.value };
                onUpdateProfile(updated);
              }}
              placeholder="deine.email@anbieter.de"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs ${
                !userProfile.email || userProfile.email === 'bewerber@email.de'
                  ? 'border-amber-700/80 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <div>
              <strong className="text-slate-100 block">Absender-Vorschau für Anschreiben:</strong>
              <span className="text-sky-300 font-mono">
                {userProfile.name || 'Vor- & Nachname'} &bull; {userProfile.street || 'Straße'} &bull; {userProfile.postalCode || '97225'} {userProfile.city || 'Zellingen'} &bull; {userProfile.phone || 'Telefon'}
              </span>
            </div>
            {userProfile.name && userProfile.name !== 'Max Mustermann' && userProfile.street && userProfile.street !== 'Musterstraße 1' ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0 ml-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vollständig</span>
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1 shrink-0 ml-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Bitte vervollständigen</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Paste / Upload on Left, Structured Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Text & Samples */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Lebenslauf als Text einfügen</span>
              </h3>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded transition text-[11px]">
                <Upload className="w-3 h-3" />
                <span>Textdatei (.txt) laden</span>
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Quick Sample Profiles for Convenience */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-medium">
                Oder Beispielprofil für Quereinsteiger laden:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadSampleProfile('mechatronik')}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition"
                >
                  Handwerk / Mechatronik
                </button>
                <button
                  onClick={() => loadSampleProfile('kaufmann')}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition"
                >
                  Kaufmännisch / Büro
                </button>
                <button
                  onClick={() => loadSampleProfile('it-beginner')}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition"
                >
                  Kundendienst &amp; IT-Interesse
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <textarea
                rows={14}
                value={cvRawText}
                onChange={(e) => setCvRawText(e.target.value)}
                placeholder="Füge hier deinen Lebenslauf oder deinen Werdegang in Stichpunkten ein (bisherige Berufe, Ausbildung, IT-Kenntnisse, private IT-Projekte, Interessen)..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleParseWithAi}
                disabled={isParsing || !cvRawText.trim()}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isParsing ? 'KI analysiert Lebenslauf...' : 'Lebenslauf mit KI strukturieren'}</span>
              </button>

              <button
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || (!cvRawText.trim() && !userProfile.summary)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
              >
                {isGettingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
                <span>IHK-Prüfer Feedback</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Lebenslauf erfolgreich analysiert und im lokalen Profil gespeichert!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Output or IHK Feedback */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            {/* Sub Tabs */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('profile')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    activeSubTab === 'profile'
                      ? 'bg-slate-800 text-sky-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Extrahiertes FISI-Profil
                </button>
                <button
                  onClick={() => setActiveSubTab('feedback')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                    activeSubTab === 'feedback'
                      ? 'bg-slate-800 text-sky-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>IHK &amp; Umschulungs-Feedback</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">97225 Zellingen</span>
            </div>

            {/* Sub Tab: Profile */}
            {activeSubTab === 'profile' && (
              <div className="p-5 space-y-4 flex-1 text-xs text-slate-200 overflow-y-auto max-h-[580px]">
                {/* Personal Summary */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-1.5">
                  <span className="font-semibold text-sky-400 uppercase tracking-wider text-[11px] block">
                    Bewerberprofil Zusammenfassung:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {userProfile.summary || (
                      <span className="text-slate-500 italic">
                        Noch kein Profil analysiert. Füge links deinen Lebenslauf ein und klicke auf "Lebenslauf mit KI strukturieren".
                      </span>
                    )}
                  </p>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[11px]">Name / Kontakt</span>
                    <div className="font-semibold text-slate-200">{userProfile.name || 'Max Mustermann'}</div>
                    <div className="text-slate-400 text-[11px]">{userProfile.email || 'bewerber@email.de'} &bull; {userProfile.phone || '0170/12345678'}</div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[11px]">Wohnort &amp; Mobilität</span>
                    <div className="font-semibold text-slate-200">97225 Zellingen (Main-Spessart)</div>
                    <div className="text-slate-400 text-[11px]">PKW vorhanden &bull; Bahnlinie Würzburg–Gemünden</div>
                  </div>
                </div>

                {/* Previous Jobs */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bisheriger Werdegang &amp; Erfahrungen:</span>
                  </span>
                  <div className="space-y-1">
                    {userProfile.previousJobs && userProfile.previousJobs.length > 0 ? (
                      userProfile.previousJobs.map((job, i) => (
                        <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-300">
                          {job}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic p-2 bg-slate-950 border border-slate-800 rounded">
                        Keine Berufe extrahiert
                      </div>
                    )}
                  </div>
                </div>

                {/* IT Skills */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Cpu className="w-3.5 h-3.5 text-sky-400" />
                    <span>IT- &amp; Technische Kenntnisse:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile.itSkills && userProfile.itSkills.length > 0 ? (
                      userProfile.itSkills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-sky-300 rounded font-mono text-[11px]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Noch keine IT-Kenntnisse erfasst</span>
                    )}
                  </div>
                </div>

                {/* Transferable Skills */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Übertragbare Stärken (Quereinsteiger-Vorteile):</span>
                  </span>
                  <div className="space-y-1">
                    {userProfile.transferableStrengths && userProfile.transferableStrengths.length > 0 ? (
                      userProfile.transferableStrengths.map((str, i) => (
                        <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded text-emerald-300/90 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Werden automatisch aus deinem Werdegang ermittelt</span>
                    )}
                  </div>
                </div>

                {/* Bottom CTA to sync with Prompt & Letter */}
                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onNavigateToPrompt}
                    className="inline-flex items-center justify-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-sky-300 rounded-lg text-xs font-semibold transition"
                  >
                    <span>Im Such-Prompt ansehen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onNavigateToLetter}
                    className="inline-flex items-center justify-center gap-2 p-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-bold transition"
                  >
                    <span>Anschreiben mit Profil erstellen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Sub Tab: Feedback */}
            {activeSubTab === 'feedback' && (
              <div className="p-5 space-y-4 flex-1 text-xs text-slate-200 overflow-y-auto max-h-[580px]">
                {feedback ? (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    <div className="bg-sky-950/40 border border-sky-900/60 p-3.5 rounded-lg text-sky-200">
                      <strong>Experten-Tipp für 97225 Zellingen &amp; IHK Würzburg-Schweinfurt:</strong>
                      <p className="mt-1 text-slate-300 text-[11px]">
                        Ausbilder in Unterfranken schätzen Quereinsteiger mit praktischer Lebenserfahrung besonders,
                        wenn Zuverlässigkeit und lösungsorientiertes Denken nachgewiesen sind.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg leading-relaxed text-slate-200">
                      {feedback}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-slate-400">
                      Klicke links auf <strong>"IHK-Prüfer Feedback"</strong>, um eine maßgeschneiderte Bewertung
                      deines Profils für die FISI-Umschulung zu erhalten.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
