import React, { useState, useEffect } from 'react';
import { CompanyEntry } from '../data/curatedCompanies';
import { 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  MapPin, 
  Calendar, 
  Info,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  Wrench,
  Mail,
  Send,
  ExternalLink,
  CalendarClock,
  Clock
} from 'lucide-react';
import { UserProfileData } from '../data/promptTemplate';

interface CoverLetterGeneratorProps {
  initialCompany?: CompanyEntry | null;
  userProfile?: UserProfileData;
  onUpdateUserProfile?: (profile: UserProfileData) => void;
}

export interface ValidationError {
  id: string;
  field: string;
  message: string;
  suggestion: string;
  autoFixValue?: string;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ 
  initialCompany, 
  userProfile,
  onUpdateUserProfile 
}) => {
  const [companyName, setCompanyName] = useState(initialCompany ? initialCompany.name : 'Mediengruppe Main-Post');
  const [companyLocation, setCompanyLocation] = useState(initialCompany ? initialCompany.city : 'Würzburg');
  const [companyEmail, setCompanyEmail] = useState(initialCompany ? initialCompany.emailRecipient : 'personal@mainpost.de');
  const [recipient, setRecipient] = useState('Sehr geehrte Damen und Herren');
  
  // Sender Details
  const [applicantName, setApplicantName] = useState(userProfile?.name && userProfile.name !== 'Max Mustermann' ? userProfile.name : '');
  const [applicantStreet, setApplicantStreet] = useState(userProfile?.street && userProfile.street !== 'Musterstraße 1' ? userProfile.street : '');
  const [applicantPostalCode, setApplicantPostalCode] = useState(userProfile?.postalCode || '97225');
  const [applicantCity, setApplicantCity] = useState(userProfile?.city || 'Zellingen');
  const [applicantPhone, setApplicantPhone] = useState(userProfile?.phone && !userProfile.phone.includes('123456') ? userProfile.phone : '');
  const [applicantEmail, setApplicantEmail] = useState(userProfile?.email && userProfile.email !== 'bewerber@email.de' ? userProfile.email : '');
  
  const [previousCareer, setPreviousCareer] = useState(userProfile?.previousJobs?.join('; ') || 'Praktische Berufserfahrung & Quereinstieg in die IT');
  const [strengths, setStrengths] = useState(
    userProfile?.itSkills && userProfile.itSkills.length > 0 
      ? userProfile.itSkills.join(', ') + (userProfile.transferableStrengths ? ` (${userProfile.transferableStrengths.join(', ')})` : '')
      : 'Windows Server & Active Directory, Netzwerktechnik (TCP/IP, VLAN, DHCP/DNS), Linux-Administration (Debian/Ubuntu), Virtualisierung (VMware/Proxmox), Hardware-Troubleshooting'
  );
  
  const [letterText, setLetterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentInfo, setSentInfo] = useState<{ date: string; followUp: string } | null>(null);
  const [showAutoMailerModal, setShowAutoMailerModal] = useState(false);

  // Sync when userProfile updates externally
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && userProfile.name !== 'Max Mustermann') setApplicantName(userProfile.name);
      if (userProfile.street && userProfile.street !== 'Musterstraße 1') setApplicantStreet(userProfile.street);
      if (userProfile.postalCode) setApplicantPostalCode(userProfile.postalCode);
      if (userProfile.city) setApplicantCity(userProfile.city);
      if (userProfile.phone && !userProfile.phone.includes('123456')) setApplicantPhone(userProfile.phone);
      if (userProfile.email && userProfile.email !== 'bewerber@email.de') setApplicantEmail(userProfile.email);
      if (userProfile.previousJobs && userProfile.previousJobs.length > 0) {
        setPreviousCareer(userProfile.previousJobs.join('; '));
      }
      if (userProfile.itSkills && userProfile.itSkills.length > 0) {
        setStrengths(userProfile.itSkills.join(', ') + (userProfile.transferableStrengths ? ` (${userProfile.transferableStrengths.join(', ')})` : ''));
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (initialCompany) {
      setCompanyName(initialCompany.name);
      setCompanyLocation(initialCompany.city);
      setCompanyEmail(initialCompany.emailRecipient);

      // Check if already dispatched in localStorage
      try {
        const savedStatus = localStorage.getItem('fisi_company_status');
        const savedDates = localStorage.getItem('fisi_company_sent_dates');
        if (savedStatus) {
          const statusMap = JSON.parse(savedStatus);
          if (statusMap[initialCompany.id] === 'Abgeschickt') {
            setIsSent(true);
            if (savedDates) {
              const datesMap = JSON.parse(savedDates);
              if (datesMap[initialCompany.id]) {
                setSentInfo(datesMap[initialCompany.id]);
              }
            }
          } else {
            setIsSent(false);
            setSentInfo(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [initialCompany]);

  // Validation Engine
  const validateFields = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // 1. Name Check
    if (!applicantName.trim() || applicantName.trim().length < 3) {
      errors.push({
        id: 'name-missing',
        field: 'Vor- & Nachname',
        message: 'Dein Name fehlt komplett.',
        suggestion: 'Trage deinen echten Vor- und Nachnamen ein (z. B. Florian Schmitt).',
        autoFixValue: 'Florian Schmitt',
      });
    } else if (applicantName.toLowerCase().includes('mustermann')) {
      errors.push({
        id: 'name-placeholder',
        field: 'Vor- & Nachname',
        message: 'Platzhalter "Max Mustermann" erkannt.',
        suggestion: 'Ersetze den Platzhalter durch deinen tatsächlichen Namen.',
        autoFixValue: 'Florian Schmitt',
      });
    }

    // 2. Street Check
    if (!applicantStreet.trim() || applicantStreet.trim().length < 4) {
      errors.push({
        id: 'street-missing',
        field: 'Straße & Hausnummer',
        message: 'Deine Anschrift in 97225 Zellingen fehlt.',
        suggestion: 'Trage deine reale Straße und Hausnummer ein (z. B. Würzburger Str. 14).',
        autoFixValue: 'Würzburger Str. 14',
      });
    } else if (applicantStreet.toLowerCase().includes('musterstraße')) {
      errors.push({
        id: 'street-placeholder',
        field: 'Straße & Hausnummer',
        message: 'Platzhalter "Musterstraße 1" erkannt.',
        suggestion: 'Gib deine echte Adresse in Zellingen an, um peinliche Fehler bei Betrieben zu vermeiden.',
        autoFixValue: 'Würzburger Str. 14',
      });
    }

    // 3. Location Check
    if (!applicantCity.trim() || !applicantPostalCode.trim()) {
      errors.push({
        id: 'location-missing',
        field: 'PLZ & Wohnort',
        message: 'PLZ oder Wohnort fehlt.',
        suggestion: 'Standard ist 97225 Zellingen.',
        autoFixValue: '97225 Zellingen',
      });
    }

    // 4. Phone Check
    if (!applicantPhone.trim() || applicantPhone.length < 6) {
      errors.push({
        id: 'phone-missing',
        field: 'Telefonnummer',
        message: 'Deine Telefon- oder Mobilnummer fehlt.',
        suggestion: 'Gib eine erreichbare Telefonnummer für Rückrufe der Betriebe an.',
        autoFixValue: '0171 / 8923451',
      });
    } else if (applicantPhone.includes('123456')) {
      errors.push({
        id: 'phone-placeholder',
        field: 'Telefonnummer',
        message: 'Platzhalter-Telefonnummer erkannt (123456...).',
        suggestion: 'Trage deine echte Handynummer ein.',
        autoFixValue: '0171 / 8923451',
      });
    }

    // 5. Email Check
    if (!applicantEmail.trim() || !applicantEmail.includes('@') || !applicantEmail.includes('.')) {
      errors.push({
        id: 'email-invalid',
        field: 'E-Mail-Adresse',
        message: 'E-Mail-Adresse ist unvollständig oder ungültig.',
        suggestion: 'Trage deine gültige E-Mail-Adresse ein.',
        autoFixValue: 'f.schmitt@gmx.de',
      });
    } else if (applicantEmail === 'bewerber@email.de') {
      errors.push({
        id: 'email-placeholder',
        field: 'E-Mail-Adresse',
        message: 'Platzhalter "bewerber@email.de" erkannt.',
        suggestion: 'Trage deine persönliche E-Mail ein.',
        autoFixValue: 'f.schmitt@gmx.de',
      });
    }

    // 6. Target Company Check
    if (!companyName.trim() || companyName.trim().length < 3 || companyName === 'Musterfirma GmbH') {
      errors.push({
        id: 'company-missing',
        field: 'Zielunternehmen',
        message: 'Kein konkretes Unternehmen gewählt.',
        suggestion: 'Wähle einen Betrieb aus dem Firmen-Radar (z.B. Main-Post, UKW, Konecranes, Bosch Rexroth) oder tippe den Firmennamen ein.',
        autoFixValue: 'Mediengruppe Main-Post',
      });
    }

    // 7. Company Location
    if (!companyLocation.trim()) {
      errors.push({
        id: 'company-location',
        field: 'Standort des Unternehmens',
        message: 'Standort des Unternehmens fehlt.',
        suggestion: 'Trage die Stadt ein (z. B. Würzburg oder Karlstadt).',
        autoFixValue: 'Würzburg',
      });
    }

    // 8. Strengths Check
    if (!strengths.trim() || strengths.trim().length < 15) {
      errors.push({
        id: 'strengths-short',
        field: 'Technische Kenntnisse',
        message: 'Deine Kenntnisse sind zu kurz oder leer.',
        suggestion: 'Nenne konkrete IT-Begriffe: Windows Server, Linux, Active Directory, Cisco VLANs, Hardware.',
        autoFixValue: 'Windows Server 2022, Active Directory, Linux Ubuntu, TCP/IP, VLAN, Hardware-Troubleshooting',
      });
    }

    return errors;
  };

  const validationErrors = validateFields();
  const isValid = validationErrors.length === 0;

  // Auto-fix handler
  const handleAutoFix = (error: ValidationError) => {
    if (!error.autoFixValue) return;

    if (error.id.includes('name')) setApplicantName(error.autoFixValue);
    if (error.id.includes('street')) setApplicantStreet(error.autoFixValue);
    if (error.id.includes('location')) {
      setApplicantPostalCode('97225');
      setApplicantCity('Zellingen');
    }
    if (error.id.includes('phone')) setApplicantPhone(error.autoFixValue);
    if (error.id.includes('email')) setApplicantEmail(error.autoFixValue);
    if (error.id.includes('company')) setCompanyName(error.autoFixValue);
    if (error.id.includes('company-location')) setCompanyLocation(error.autoFixValue);
    if (error.id.includes('strengths')) setStrengths(error.autoFixValue);
  };

  const generateLocalLetter = () => {
    const today = new Date().toLocaleDateString('de-DE');
    const displayName = applicantName.trim() || '[DEIN VOR- & NACHNAME FEHLT]';
    const displayStreet = applicantStreet.trim() || '[DEINE STRASSE FEHLT]';
    const displayPhone = applicantPhone.trim() || '[DEINE TELEFONNUMMER FEHLT]';
    const displayEmail = applicantEmail.trim() || '[DEINE E-MAIL FEHLT]';

    return `${displayName}
${displayStreet}
${applicantPostalCode} ${applicantCity}
Telefon: ${displayPhone}
E-Mail: ${displayEmail}

${companyName}
Personalabteilung / IT-Leitung
${companyLocation}

${applicantCity}, den ${today}

Bewerbung um eine betriebliche Praxisphase im Rahmen der Umschulung zum Fachinformatiker für Systemintegration (FISI)
Referenz: COMCAVE.COLLEGE – 3 betriebliche Praxisphasen 2027 / 2028

${recipient},

als angehender Fachinformatiker für Systemintegration beim Bildungsträger COMCAVE.COLLEGE (Standort Würzburg bzw. Telelearning) suche ich für meine insgesamt sechsmonatige betriebliche Praxisphase einen engagierten und verlässlichen Partner in der Region.

Ihr Unternehmen in ${companyLocation} hat mich durch seine etablierte Marktposition und die moderne technische Infrastruktur besonders überzeugt. Als Bürger mit Wohnsitz in ${applicantPostalCode} ${applicantCity} bin ich durch meinen eigenen PKW sowie die direkte Anbindung (Bahnhof Retzbach-Zellingen an der Strecke Würzburg–Gemünden) flexibel, pünktlich und zuverlässig bei Ihnen vor Ort einsatzbereit.

Bisheriger Werdegang & Motivation zum Quereinstieg:
In meiner bisherigen beruflichen Laufbahn (${previousCareer}) habe ich mir eine strukturierte, lösungsorientierte Arbeitsweise, hohes Verantwortungsbewusstsein und praktische Problemlösungskompetenz angeeignet. Durch meine Umschulung verbinde ich diese Reife nun gezielt mit aktuellem IT-System- und Netzwerk-Fachwissen.

Die Umschulung bereitet mich intensiv und praxisnah auf die IHK-Abschlussprüfung vor der IHK Würzburg-Schweinfurt vor. Die betriebliche Praxis gliedert sich in folgende drei Abschnitte:

1. Praxisblock 1 (Einführung & Systemumfeld): 21.09.2027 – 28.09.2027
2. Praxisblock 2 (Vertiefte Praxisphase & Systembetreuung): 30.09.2027 – 10.02.2028
3. Praxisblock 3 (Abschlussphase & betriebliches IHK-Projekt): 10.03.2028 – 13.04.2028

Wichtiger finanzieller Vorteil für Ihren Betrieb:
Die gesamte Umschulungsmaßnahme wird öffentlich über die Agentur für Arbeit gefördert. Für Ihr Unternehmen fallen daher keinerlei Pflicht-Ausbildungsvergütungen oder Schulungskosten an. Sie gewinnen für diesen Zeitraum eine motivierte, reife Fachkraft, die Ihre IT-Abteilung im Tagesgeschäft, im Support oder bei der Umsetzung Ihres betrieblichen Abschlussprojekts tatkräftig entlastet.

Meine bisherigen Schwerpunkte und Interessen umfassen unter anderem:
- ${strengths}
- Zuverlässiger Hardware- und Netzwerk-Support, Troubleshooting und Dokumentation
- Hohe Lern- und Leistungsbereitschaft sowie ausgeprägte Teamorientierung

Gerne möchte ich mein erlerntes Fachwissen vom ersten Tag an produktiv in Ihr Team einbringen und von Ihren erfahrenen IT-Spezialisten lernen.

Über die Gelegenheit, mich Ihnen in einem persönlichen Vorstellungsgespräch in ${companyLocation} oder per Videokonferenz vorzustellen, freue ich mich sehr.

Mit freundlichen Grüßen

${displayName}`;
  };

  useEffect(() => {
    setLetterText(generateLocalLetter());
  }, [
    companyName, 
    companyLocation, 
    recipient, 
    applicantName, 
    applicantStreet, 
    applicantPostalCode, 
    applicantCity, 
    applicantPhone, 
    applicantEmail, 
    strengths, 
    previousCareer
  ]);

  const subjectLine = `Bewerbung um Umschulungspraktikum Fachinformatiker Systemintegration (COMCAVE) – ${applicantName || 'Florian Schmitt'}`;
  const mailtoUrl = `mailto:${companyEmail}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(letterText)}`;

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(subjectLine);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsSent = () => {
    const companyId = initialCompany ? initialCompany.id : companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const today = new Date();
    const followUpDate = new Date();
    followUpDate.setDate(today.getDate() + 14);

    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const sentDateStr = today.toLocaleDateString('de-DE', dateOptions);
    const followUpDateStr = followUpDate.toLocaleDateString('de-DE', dateOptions);

    const info = { date: sentDateStr, followUp: followUpDateStr };
    setSentInfo(info);
    setIsSent(true);

    try {
      const savedStatus = localStorage.getItem('fisi_company_status');
      const statusMap = savedStatus ? JSON.parse(savedStatus) : {};
      statusMap[companyId] = 'Abgeschickt';
      localStorage.setItem('fisi_company_status', JSON.stringify(statusMap));

      const savedDates = localStorage.getItem('fisi_company_sent_dates');
      const datesMap = savedDates ? JSON.parse(savedDates) : {};
      datesMap[companyId] = info;
      localStorage.setItem('fisi_company_sent_dates', JSON.stringify(datesMap));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSent = () => {
    const companyId = initialCompany ? initialCompany.id : companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setIsSent(false);
    setSentInfo(null);
    try {
      const savedStatus = localStorage.getItem('fisi_company_status');
      if (savedStatus) {
        const statusMap = JSON.parse(savedStatus);
        statusMap[companyId] = 'Offen';
        localStorage.setItem('fisi_company_status', JSON.stringify(statusMap));
      }
      const savedDates = localStorage.getItem('fisi_company_sent_dates');
      if (savedDates) {
        const datesMap = JSON.parse(savedDates);
        delete datesMap[companyId];
        localStorage.setItem('fisi_company_sent_dates', JSON.stringify(datesMap));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiRefine = async () => {
    if (!isValid) {
      setShowErrorDrawer(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyLocation,
          applicantName,
          applicantStrengths: strengths,
          previousCareer,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setLetterText(data.text);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!isValid) {
      setShowErrorDrawer(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!isValid) {
      setShowErrorDrawer(true);
      return;
    }

    const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
    const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bewerbungsanschreiben_FISI_Zellingen_${cleanName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info with Security Gate Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Bewerbungs- &amp; Initiativanschreiben &bull; Sicherheitsgeprüft</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Bewerbungs-Generator mit Sicherheits-Prüfung
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              Erstellt ein DIN 5008-konformes Initiativanschreiben für Betriebe in Unterfranken (auch ohne offizielle Praktikumsausschreibung).
              <strong>Sicherheits-Gate aktiv:</strong> Kopieren und Download werden erst freigeschaltet, wenn alle Pflichtangaben vollständig sind und keine Platzhalter mehr existieren.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status indicator */}
            {isValid ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Freigabe erteilt (0 Fehler)</span>
              </div>
            ) : (
              <button
                onClick={() => setShowErrorDrawer(!showErrorDrawer)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-300 hover:bg-amber-900/60 transition text-xs font-semibold"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{validationErrors.length} Fehler zu beheben</span>
              </button>
            )}

            <button
              onClick={handleAiRefine}
              disabled={loading || !isValid}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-semibold transition ${
                isValid
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
              <span>{loading ? 'Optimiert...' : 'Mit KI verfeinern'}</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!isValid}
              className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold rounded-lg text-xs transition shadow-sm ${
                !isValid
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {!isValid ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gesperrt</span>
                </>
              ) : copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Kopiert</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Anschreiben kopieren</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Audit Panel when Errors Exist */}
        {!isValid && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sicherheits-Checkliste: Folgende {validationErrors.length} Punkte müssen korrigiert werden:</span>
              </span>
              <span className="text-[11px] text-slate-400">Klicke auf "Vorschlag anwenden", um direkt zu reparieren</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {validationErrors.map((err) => (
                <div 
                  key={err.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-amber-900/60 text-slate-200 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-amber-300 flex items-center gap-1">
                      <span>{err.field}:</span>
                      <span className="text-slate-300 font-normal">{err.message}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Vorschlag:</strong> {err.suggestion}
                    </div>
                  </div>

                  {err.autoFixValue && (
                    <button
                      onClick={() => handleAutoFix(err)}
                      className="shrink-0 px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Vorschlag anwenden</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                <span>Bewerbungsangaben</span>
              </h3>
              <span className="text-[11px] text-slate-400">97225 Zellingen</span>
            </div>

            {/* Target Company */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Zielunternehmen</span>
                <span className="text-[11px] text-slate-500 font-normal">Industrie, Medien, Klinik, Handel</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                placeholder="z.B. Mediengruppe Main-Post oder Konecranes Noell"
              />
            </div>

            {/* Target Company Email for Direct Send */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>E-Mail-Empfänger (Bewerbungsadresse)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">HR / IT-Abteilung</span>
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                placeholder="z.B. bewerbung@unternehmen.de"
              />
            </div>

            {/* Target Location & Salutation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Standort des Betriebs</label>
                <input
                  type="text"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  placeholder="z.B. Würzburg oder Karlstadt"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Anrede</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  placeholder="z.B. Sehr geehrte Damen und Herren"
                />
              </div>
            </div>

            {/* Applicant Name & Street */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Dein Vor- &amp; Nachname</label>
                {applicantName && !applicantName.includes('Mustermann') ? (
                  <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Geprüft
                  </span>
                ) : (
                  <span className="text-amber-400 text-[10px] font-medium">Pflichtfeld</span>
                )}
              </div>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="z.B. Florian Schmitt"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 ${
                  !applicantName || applicantName.includes('Mustermann')
                    ? 'border-amber-700/80 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              />
            </div>

            {/* Street */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Straße &amp; Hausnummer</label>
                {applicantStreet && !applicantStreet.includes('Musterstraße') ? (
                  <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Geprüft
                  </span>
                ) : (
                  <span className="text-amber-400 text-[10px] font-medium">Pflichtfeld</span>
                )}
              </div>
              <input
                type="text"
                value={applicantStreet}
                onChange={(e) => setApplicantStreet(e.target.value)}
                placeholder="z.B. Hauptstraße 14"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 ${
                  !applicantStreet || applicantStreet.includes('Musterstraße')
                    ? 'border-amber-700/80 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              />
            </div>

            {/* Postal & City */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">PLZ &amp; Ort</label>
                <div className="grid grid-cols-5 gap-1.5">
                  <input
                    type="text"
                    value={applicantPostalCode}
                    onChange={(e) => setApplicantPostalCode(e.target.value)}
                    className="col-span-2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    value={applicantCity}
                    onChange={(e) => setApplicantCity(e.target.value)}
                    className="col-span-3 px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Telefon</label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="z.B. 0171 / 8923451"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 ${
                    !applicantPhone || applicantPhone.includes('123456')
                      ? 'border-amber-700/80 bg-amber-950/20'
                      : 'border-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">E-Mail-Adresse</label>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                placeholder="deine.email@anbieter.de"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 ${
                  !applicantEmail || applicantEmail === 'bewerber@email.de' || !applicantEmail.includes('@')
                    ? 'border-amber-700/80 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              />
            </div>

            {/* Previous Career */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Bisheriger beruflicher Hintergrund</label>
              <input
                type="text"
                value={previousCareer}
                onChange={(e) => setPreviousCareer(e.target.value)}
                placeholder="z.B. Industriemechaniker, Bürokaufmann, Monteur"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Strengths */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Deine IT-Schwerpunkte</label>
              <textarea
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {/* 3 Block Verification Box */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COMCAVE Praxisblöcke verbindlich verankert:</span>
              </div>
              <div>&bull; Block 1: 21.09.2027 – 28.09.2027 (Kennenlernen)</div>
              <div>&bull; Block 2: 30.09.2027 – 10.02.2028 (Haupt-Praxisphase)</div>
              <div>&bull; Block 3: 10.03.2028 – 13.04.2028 (IHK-Projektarbeit)</div>
            </div>
          </div>
        </div>

        {/* Right Column: DIN 5008 Live Preview & Safety Lock */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              {isValid ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Freigegeben &bull; Bereit zum Versand</span>
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Gesperrt &bull; Bitte {validationErrors.length} Fehler links beheben</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!isValid}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition text-xs font-medium ${
                  !isValid
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Download className="w-3 h-3" />
                <span>Als .txt</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!isValid}
                className={`inline-flex items-center gap-1 px-3 py-1 font-semibold rounded transition text-xs ${
                  !isValid
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
              >
                {copied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
              </button>
            </div>
          </div>

          {/* Letter Text Preview */}
          <div className="p-6 overflow-y-auto max-h-[500px] font-sans text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed selection:bg-sky-500/30">
            {letterText}
          </div>

          {/* Dispatch Cockpit & E-Mail Center */}
          <div className="bg-slate-900 border-t border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block">
                  Bewerbungs-Versand Cockpit &bull; 97225 Zellingen
                </span>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Jetzt an {companyName} abschicken</span>
                </h4>
              </div>

              {/* Status Badge */}
              {isSent ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abgeschickt am {sentInfo?.date || 'heute'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Noch nicht versendet</span>
                </div>
              )}
            </div>

            {/* Follow-up Reminder Banner if sent */}
            {isSent && sentInfo && (
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-3 text-xs text-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold">Bewerbung im Firmen-Radar erfasst!</span>{' '}
                    <span>Falls keine Rückmeldung kommt, empfohlenes Nachfassen am: <strong>{sentInfo.followUp}</strong> (14 Tage Frist).</span>
                  </div>
                </div>
                <button
                  onClick={handleResetSent}
                  className="text-[11px] underline text-emerald-400 hover:text-emerald-300 shrink-0"
                >
                  Status zurücksetzen
                </button>
              </div>
            )}

            {/* Subject Line Quick Copy */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="truncate text-slate-300 font-mono text-[11px]">
                <span className="text-slate-500 font-sans mr-1">Betreff:</span>
                {subjectLine}
              </div>
              <button
                onClick={handleCopySubject}
                className="shrink-0 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSubject ? 'Kopiert' : 'Kopieren'}</span>
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: 1-Click Mail Client */}
              <a
                href={isValid && companyEmail ? mailtoUrl : undefined}
                onClick={(e) => {
                  if (!isValid || !companyEmail) {
                    e.preventDefault();
                    setShowErrorDrawer(true);
                  } else {
                    handleMarkAsSent();
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                  !isValid || !companyEmail
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
                title={isValid ? 'Öffnet dein E-Mail-Programm mit vorbereiteter E-Mail' : 'Zuerst Fehler beheben'}
              >
                <Mail className="w-4 h-4" />
                <span>1-Klick: Im Mail-Programm öffnen</span>
              </a>

              {/* Option 2: Mark as sent manually */}
              {!isSent ? (
                <button
                  onClick={() => {
                    if (!isValid) {
                      setShowErrorDrawer(true);
                    } else {
                      handleMarkAsSent();
                    }
                  }}
                  disabled={!isValid}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition ${
                    !isValid
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-700 text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Als 'Abgeschickt' erfassen</span>
                </button>
              ) : (
                <button
                  onClick={handleResetSent}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <span>Erneut versenden / Bearbeiten</span>
                </button>
              )}
            </div>

            {/* Secondary Portal and Automation Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                {initialCompany?.careerUrl && (
                  <a
                    href={initialCompany.careerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline"
                  >
                    <span>Karriereportal {companyName} öffnen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <button
                onClick={() => setShowAutoMailerModal(!showAutoMailerModal)}
                className="text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Automatischer Batch-Versand (Python SMTP-Bot)</span>
              </button>
            </div>

            {/* Auto Mailer Explainer / Code */}
            {showAutoMailerModal && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Wie funktioniert automatisches Abschicken per Skript?</span>
                  </h5>
                  <button 
                    onClick={() => setShowAutoMailerModal(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕ Schließen
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Beim automatischen Versand liest ein lokales Python-Skript deine Bewerberdaten und schickt per SMTP (z.B. über dein Gmail-, GMX- oder Web.de-Konto mit App-Passwort) die E-Mails an die ausgewählten Betriebe.
                  <strong>Wichtig:</strong> Es wird eine 30-sekündige Pause zwischen jedem Versand eingelegt, damit deine E-Mail-Adresse nicht von Spam-Filtern blockiert wird.
                </p>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-[10px] text-slate-300 overflow-x-auto border border-slate-800">
                  <pre>{`# Python SMTP Auto-Mailer für ${companyName}
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg['Subject'] = "${subjectLine}"
msg['From'] = "${applicantEmail || 'deine.email@gmx.de'}"
msg['To'] = "${companyEmail}"
msg.set_content("""${letterText.replace(/"/g, '\\"').substring(0, 300)}...""")

# Optional: PDF-Anhang
# with open("Lebenslauf_${(applicantName || 'Bewerber').replace(/\s+/g, '_')}.pdf", "rb") as f:
#     msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename="Lebenslauf.pdf")

# Versand via SMTP (z.B. smtp.gmx.net:587 oder smtp.gmail.com:587)
# server = smtplib.SMTP("smtp.gmx.net", 587)
# server.starttls()
# server.login("${applicantEmail || 'deine.email@gmx.de'}", "DEIN_APP_PASSWORT")
# server.send_message(msg)
# server.quit()`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
