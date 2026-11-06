import React, { useState, useEffect } from 'react';
import { 
  Linkedin, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Building2, 
  ShieldCheck, 
  Share2, 
  Layers, 
  MessageSquare, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { UserProfileData } from '../data/promptTemplate';
import { curatedCompanies } from '../data/curatedCompanies';

interface LinkedInContact {
  id: string;
  name: string;
  company: string;
  role: string;
  linkedInUrl?: string;
  dateSent: string;
  status: 'gesendet' | 'vernetzt' | 'antwort_erhalten' | 'vorstellungsgespraech' | 'abgelehnt';
  note: string;
}

interface LinkedInManagerProps {
  userProfile: UserProfileData;
  onUpdateUserProfile?: (profile: UserProfileData) => void;
  onNavigateToLetter?: () => void;
}

export function LinkedInManager({ userProfile, onUpdateUserProfile, onNavigateToLetter }: LinkedInManagerProps) {
  // LinkedIn profile state
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [isOpenToWork, setIsOpenToWork] = useState<boolean>(true);
  const [customHeadline, setCustomHeadline] = useState<string>(
    'Angehender Fachinformatiker Systemintegration (IHK) | COMCAVE Umschulung | Praktikum ab 21.09.2027 – 13.04.2028 | Raum Würzburg & 97225 Zellingen'
  );
  const [aboutBio, setAboutBio] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Outreach Message State
  const [targetRecipientType, setTargetRecipientType] = useState<'it_lead' | 'recruiter' | 'trainer'>('it_lead');
  const [selectedCompany, setSelectedCompany] = useState<string>(curatedCompanies[0]?.name || 'Konecranes Noell GmbH');
  const [customCompanyInput, setCustomCompanyInput] = useState<string>('');
  const [contactPersonName, setContactPersonName] = useState<string>('');
  const [messageMode, setMessageMode] = useState<'invite' | 'inmail'>('invite'); // invite = max 300 chars, inmail = full

  // LinkedIn CRM Tracker
  const [contacts, setContacts] = useState<LinkedInContact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactCompany, setNewContactCompany] = useState<string>('');
  const [newContactRole, setNewContactRole] = useState<string>('');
  const [newContactNote, setNewContactNote] = useState<string>('');
  const [newContactUrl, setNewContactUrl] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem('fisi_linkedin_url');
      if (savedUrl) setProfileUrl(savedUrl);

      const savedHeadline = localStorage.getItem('fisi_linkedin_headline');
      if (savedHeadline) setCustomHeadline(savedHeadline);

      const savedOpen = localStorage.getItem('fisi_linkedin_open');
      if (savedOpen !== null) setIsOpenToWork(savedOpen === 'true');

      const savedContacts = localStorage.getItem('fisi_linkedin_contacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        // Initial sample tracker entries for top regional targets
        setContacts([
          {
            id: 'c1',
            name: 'IT-Leitung / Talent Team',
            company: 'Konecranes Noell GmbH (Würzburg)',
            role: 'Head of Infrastructure / IT Operations',
            linkedInUrl: 'https://www.linkedin.com/company/konecranes/',
            dateSent: '2026-10-20',
            status: 'gesendet',
            note: 'Vernetzungsanfrage gesendet bezüglich 7-monatigem Betriebspraktikum (21.09.2027).'
          },
          {
            id: 'c2',
            name: 'Recruiting & Ausbildung',
            company: 'Universitätsklinikum Würzburg (UKW)',
            role: 'IT-Personalreferent',
            linkedInUrl: 'https://www.linkedin.com/company/universit-tsklinikum-w-rzburg/',
            dateSent: '2026-10-18',
            status: 'vernetzt',
            note: 'Vernetzung angenommen! InMail nachgereicht mit Zeugnissen und COMCAVE Daten.'
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save profile updates
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('fisi_linkedin_url', profileUrl);
      localStorage.setItem('fisi_linkedin_headline', customHeadline);
      localStorage.setItem('fisi_linkedin_open', isOpenToWork.toString());
      setCopiedId('saved-profile');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate About Bio
  const candidateName = userProfile.name || 'Umschüler Fachinformatiker Systemintegration';
  const defaultAboutBio = `Ich absolviere derzeit eine zielgerichtete Umschulung zum Fachinformatiker für Systemintegration (IHK) bei COMCAVE und suche mein 7-monatiges betriebliches Fachpraktikum im Zeitraum vom 21.09.2027 bis 13.04.2028 im Raum Würzburg / 97225 Zellingen oder 100% Remote.

Kernschwerpunkte & Praxiswissen:
• Windows Server (Active Directory, Benutzerverwaltung, Gruppenrichtlinien, DNS/DHCP)
• Netzwerktechnik (TCP/IP Grundlagen, Subnetting, VLAN, Switch-Konfiguration)
• Linux Grundlagen & Server-Administration
• 1st & 2nd Level Support, Client-Rollout, Hardware-Troubleshooting
• Führerschein Klasse B vorhanden

Warum ich mich für die IT entschieden habe:
Als strukturierter, analytisch denkender Kopf schätze ich es, Ausfälle zu verhindern, stabile Infrastrukturen aufzubauen und Kolleginnen und Kollegen zuverlässig bei technischen Problemen zu unterstützen.

Ich freue mich über den Austausch mit IT-Leitern, Systemadministratoren und Personalverantwortlichen aus Unterfranken!`;

  // Active Company name for templates
  const activeCompany = customCompanyInput.trim() || selectedCompany;

  // Outreach message generators
  const getInviteNote = () => {
    if (targetRecipientType === 'it_lead') {
      return `Hallo ${contactPersonName ? contactPersonName : 'Herr/Frau Kollege/in'}, ich absolviere eine Umschulung zum Fachinformatiker Systemintegration (IHK, COMCAVE) und suche für 21.09.27–13.04.28 ein Praktikum bei ${activeCompany}. Ich würde mich sehr freuen, mich mit Ihnen als IT-Leitung zu vernetzen! Beste Grüße`;
    } else if (targetRecipientType === 'recruiter') {
      return `Guten Tag ${contactPersonName ? contactPersonName : 'Team'}, ich bin Umschüler zum Fachinformatiker Systemintegration (COMCAVE) und interessiere mich für das 7-monatige Pflichtpraktikum (21.09.27–13.04.28) bei ${activeCompany} im Raum Würzburg. Gern vernetze ich mich mit Ihnen!`;
    } else {
      return `Hallo ${contactPersonName ? contactPersonName : 'Herr/Frau Kollege/in'}, als angehender Fachinformatiker Systemintegration (COMCAVE, Praktikum ab 21.09.27) freue ich mich über den fachlichen Austausch mit IT-Ausbildern bei ${activeCompany}. Viele Grüße!`;
    }
  };

  const getInMailMessage = () => {
    return `Sehr geehrte(r) ${contactPersonName || 'Damen und Herren'},

vielen Dank für die Vernetzung hier auf LinkedIn!

Ich wende mich an Sie, da ich derzeit meine IHK-zertifizierte Umschulung zum Fachinformatiker für Systemintegration bei COMCAVE absolviere und mich intensiv auf das 7-monatige betriebliche Fachpraktikum (21.09.2027 – 13.04.2028) vorbereite.

Die IT-Infrastruktur von ${activeCompany} begeistert mich sehr. Durch meine praxisnahe Ausbildung bringe ich solide Kenntnisse in Windows Server / Active Directory, TCP/IP-Netzwerktechnik, Virtualisierung sowie Client- & Hardware-Support mit. Zudem besitze ich den Führerschein Klasse B und bin mit Wohnort in 97225 Zellingen verkehrstechnisch absolut flexibel im Großraum Würzburg / Main-Spessart.

Haben Sie im genannten Zeitraum Bedarf an einem engagierten, lernhungrigen Praktikanten im Systemintegrations-Team?

Sehr gerne lasse ich Ihnen meine vollständigen Bewerbungsunterlagen (Lebenslauf, IHK-Praktikumsleitfaden) zukommen.

Ich freue mich auf Ihre Rückmeldung oder einen kurzen fachlichen Austausch!

Mit besten Grüßen,
${userProfile.name || 'Ihr Name'}
${userProfile.email ? `E-Mail: ${userProfile.email}` : ''}
${userProfile.phone ? `Telefon: ${userProfile.phone}` : ''}`;
  };

  // Add Contact to Tracker
  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactCompany.trim()) return;

    const newEntry: LinkedInContact = {
      id: 'c_' + Date.now(),
      name: newContactName,
      company: newContactCompany,
      role: newContactRole || 'IT-Ansprechpartner',
      linkedInUrl: newContactUrl,
      dateSent: new Date().toISOString().split('T')[0],
      status: 'gesendet',
      note: newContactNote || 'Erstkontakt über LinkedIn hergestellt.'
    };

    const updated = [newEntry, ...contacts];
    setContacts(updated);
    try {
      localStorage.setItem('fisi_linkedin_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setNewContactName('');
    setNewContactCompany('');
    setNewContactRole('');
    setNewContactNote('');
    setNewContactUrl('');
    setShowAddContactModal(false);
  };

  const handleUpdateContactStatus = (id: string, status: LinkedInContact['status']) => {
    const updated = contacts.map(c => c.id === id ? { ...c, status } : c);
    setContacts(updated);
    try {
      localStorage.setItem('fisi_linkedin_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    try {
      localStorage.setItem('fisi_linkedin_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 border border-blue-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium">
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn Profil-Steuerung &amp; Outreach</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>LinkedIn Karriere-Zentrale</span>
              {isOpenToWork && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  #OpenToWork
                </span>
              )}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Verknüpfe dein LinkedIn-Profil, generiere perfekte FISI-Profilelemente (Headline, Info-Bio, Such-Keywords) und schreibe IT-Entscheider in Würzburg &amp; Unterfranken mit 1 Klick an.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {profileUrl ? (
              <a
                href={profileUrl.startsWith('http') ? profileUrl : `https://${profileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
              >
                <Linkedin className="w-4 h-4" />
                <span>Mein LinkedIn öffnen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={() => {
                  const input = prompt('Gib deinen LinkedIn Profil-Link ein (z.B. https://www.linkedin.com/in/dein-name):');
                  if (input) {
                    setProfileUrl(input);
                    localStorage.setItem('fisi_linkedin_url', input);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>LinkedIn-Profil verknüpfen</span>
              </button>
            )}
            <span className="text-[10px] text-slate-400 text-center font-mono">
              Lokale Datenspeicherung in der App
            </span>
          </div>
        </div>
      </div>

      {/* Profile Card & Algorithm Optimizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{userProfile.name || 'Dein LinkedIn Profil'}</span>
                {isOpenToWork && (
                  <span className="text-[10px] bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    Aktiv suchend
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Optimiert für IT-Recruiter im Raum Würzburg, Main-Spessart (97225 Zellingen) &amp; Remote
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenToWork(!isOpenToWork)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                isOpenToWork 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span>#OpenToWork:</span>
              <strong className={isOpenToWork ? 'text-emerald-400' : 'text-slate-500'}>
                {isOpenToWork ? 'Aktiviert' : 'Pausiert'}
              </strong>
            </button>
          </div>
        </div>

        {/* LinkedIn Profil-Link Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Dein LinkedIn Profil-Link:</span>
              <span className="text-[10px] text-slate-500">Wird in der App gespeichert</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/dein-name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-slate-200 pl-9 font-mono"
              />
              <Linkedin className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              onClick={handleSaveProfile}
              className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              {copiedId === 'saved-profile' ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{copiedId === 'saved-profile' ? 'Gespeichert!' : 'Profil sichern'}</span>
            </button>
          </div>
        </div>

        {/* 1. Headline Generator (Der wichtigste Hebel auf LinkedIn) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Optimierter Profil-Slogan (Headline für Recruiter-Suche):</span>
            </span>
            <button
              onClick={() => copyText(customHeadline, 'headline')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              {copiedId === 'headline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'headline' ? 'Kopiert!' : 'Kopieren für LinkedIn'}</span>
            </button>
          </div>
          <textarea
            value={customHeadline}
            onChange={(e) => setCustomHeadline(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-slate-300 font-mono leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">
            Tipp: LinkedIn-Algorithmen ranken Profile nach Berufsbezeichnung, IHK-Zertifikat, Standort und Praktikumsdatum ganz oben in der Headhunter-Suche.
          </p>
        </div>

        {/* 2. About / Info Section Generator */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileTextIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Vollständiger LinkedIn "Info"-Text (Über mich):</span>
            </span>
            <button
              onClick={() => copyText(aboutBio || defaultAboutBio, 'bio')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              {copiedId === 'bio' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'bio' ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>
          <textarea
            value={aboutBio || defaultAboutBio}
            onChange={(e) => setAboutBio(e.target.value)}
            rows={7}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-slate-300 font-sans leading-relaxed"
          />
        </div>

        {/* Top Keywords Pill Cloud */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Top Keywords für deinen LinkedIn-Auftritt (Relevanz für Würzburg &amp; Bayern)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Fachinformatiker Systemintegration',
              'COMCAVE Umschulung',
              'Active Directory',
              'Windows Server 2022',
              'TCP/IP & VLAN',
              'Linux Server',
              '1st & 2nd Level Support',
              'Führerschein Klasse B',
              '97225 Zellingen',
              'Großraum Würzburg',
              'Praktikum 2027/2028'
            ].map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
              >
                #{kw.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 1-Click Outreach Generator (Direktansprache von IT-Leitern) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">1-Klick LinkedIn Direktansprache (Outreach)</h3>
            <p className="text-xs text-slate-400">
              Generiere perfekte Nachrichten für IT-Leiter, Recruiter und Ausbilder bei regionalen Zielfirmen
            </p>
          </div>
        </div>

        {/* Select Target & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Recipient Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Empfänger-Rolle:</label>
            <select
              value={targetRecipientType}
              onChange={(e) => setTargetRecipientType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="it_lead">IT-Leiter / Abteilungsleiter</option>
              <option value="recruiter">Recruiting / HR Personal</option>
              <option value="trainer">IT-Ausbilder / Fachbereich</option>
            </select>
          </div>

          {/* Company Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Firma wählen:</label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCustomCompanyInput('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              {curatedCompanies.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Or Custom Company & Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Oder eigene Firma / Ansprechpartner:</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Name (optional)"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Mode Toggle: 300 Chars Invite Note vs. Full InMail */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setMessageMode('invite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              messageMode === 'invite'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vernetzungsanfrage (unter 300 Zeichen mit Notiz)
          </button>
          <button
            onClick={() => setMessageMode('inmail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              messageMode === 'inmail'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ausführliche InMail / Direktnachricht
          </button>
        </div>

        {/* Message Output Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 font-mono">
              {messageMode === 'invite' ? 'Persönliche Notiz zur LinkedIn-Kontaktanfrage:' : 'Vollständige Nachricht:'}
            </span>
            <div className="flex items-center gap-2">
              {messageMode === 'invite' && (
                <span className="text-[11px] font-mono text-slate-400">
                  {getInviteNote().length} / 300 Zeichen
                </span>
              )}
              <button
                onClick={() => copyText(messageMode === 'invite' ? getInviteNote() : getInMailMessage(), 'outreach-msg')}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedId === 'outreach-msg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'outreach-msg' ? 'Kopiert!' : 'Text kopieren'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line select-all">
            {messageMode === 'invite' ? getInviteNote() : getInMailMessage()}
          </div>
        </div>

        {/* Action Buttons: Search on LinkedIn */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <a
            href={`https://www.linkedin.com/search/results/people/?keywords=IT+Leiter+${encodeURIComponent(activeCompany)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Search className="w-3.5 h-3.5" />
            <span>IT-Leiter bei {activeCompany} auf LinkedIn finden</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <a
            href={`https://www.linkedin.com/search/results/people/?keywords=Recruiter+${encodeURIComponent(activeCompany)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Recruiting bei {activeCompany}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* LinkedIn Regional Search Quick-Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Schnellsuche: IT-Entscheider Würzburg &amp; Unterfranken</h4>
            <p className="text-xs text-slate-400">Öffnet direkte LinkedIn-Suchen nach relevanten Kontakten</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            { label: 'IT-Leiter Würzburg', query: 'IT-Leiter Würzburg' },
            { label: 'Head of IT Unterfranken', query: 'Head of IT Unterfranken' },
            { label: 'Systemintegration Ausbilder Main-Spessart', query: 'Fachinformatiker Ausbilder Main-Spessart' },
            { label: 'Systemhaus Geschäftsführer Würzburg', query: 'Systemhaus Würzburg Geschäftsführer' },
            { label: 'IT Infrastruktur Manager Würzburg', query: 'IT Infrastruktur Würzburg' },
            { label: 'IT Recruiter Würzburg', query: 'IT Recruiter Würzburg' },
          ].map((item) => (
            <a
              key={item.label}
              href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(item.query)}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition flex items-center justify-between text-slate-300 group"
            >
              <span>{item.label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
            </a>
          ))}
        </div>
      </div>

      {/* LinkedIn Outreach Tracker (Mini CRM) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">LinkedIn Kontakt-Tracker ({contacts.length})</h3>
              <p className="text-xs text-slate-400">Behalte im Blick, wen du auf LinkedIn kontaktiert hast</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddContactModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Neuen Kontakt eintragen</span>
          </button>
        </div>

        {/* Contact List */}
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Noch keine Kontakte eingetragen. Klicke auf "Neuen Kontakt eintragen", um deine LinkedIn-Aktivitäten zu tracken!
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-medium text-sky-300">{c.company}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-2">
                    <span>{c.role}</span>
                    <span>&bull;</span>
                    <span className="font-mono">Kontaktiert am: {c.dateSent}</span>
                  </div>
                  {c.note && (
                    <p className="text-slate-300 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 mt-1">
                      {c.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={c.status}
                    onChange={(e) => handleUpdateContactStatus(c.id, e.target.value as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                      c.status === 'vorstellungsgespraech'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : c.status === 'vernetzt'
                        ? 'bg-blue-950 text-blue-300 border-blue-500'
                        : c.status === 'antwort_erhalten'
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : c.status === 'abgelehnt'
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="gesendet">Gesendet</option>
                    <option value="vernetzt">Vernetzt</option>
                    <option value="antwort_erhalten">Antwort erhalten</option>
                    <option value="vorstellungsgespraech">Interview!</option>
                    <option value="abgelehnt">Kein Bedarf</option>
                  </select>

                  {c.linkedInUrl && (
                    <a
                      href={c.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 hover:text-blue-300"
                      title="Profil öffnen"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Neuen Kontakt manuell hinzufügen */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>Neuen LinkedIn-Kontakt tracken</span>
              </h4>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Schließen
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Name der Person:</label>
                <input
                  type="text"
                  placeholder="z.B. Max Mustermann"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Firma:</label>
                <input
                  type="text"
                  placeholder="z.B. Konecranes Noell GmbH"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Rolle / Position:</label>
                <input
                  type="text"
                  placeholder="z.B. Head of IT / Recruiter"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">LinkedIn Profil-URL (optional):</label>
                <input
                  type="text"
                  placeholder="https://www.linkedin.com/in/..."
                  value={newContactUrl}
                  onChange={(e) => setNewContactUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notiz / Nächster Schritt:</label>
                <textarea
                  rows={2}
                  placeholder="z.B. Vernetzung geschickt, nach 7 Tagen nachhaken wenn keine Antwort"
                  value={newContactNote}
                  onChange={(e) => setNewContactNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddContact}
                disabled={!newContactName.trim() || !newContactCompany.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
