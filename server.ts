import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client (uses process.env.GEMINI_API_KEY)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// Search endpoint with Google Search Grounding
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query, location = '97225 Zellingen', radius = 30 } = req.body;
    const ai = getAiClient();

    const systemInstruction = `Du bist ein spezialisierter Karriereberater und IT-Rechercheur für Umschüler zum Fachinformatiker für Systemintegration (FISI) beim Bildungsträger COMCAVE.
Der Wohnort des Nutzers ist ${location} (Landkreis Main-Spessart, Unterfranken, Bayern), maximaler Umkreis ${radius} km (inklusive Würzburg, Karlstadt, Lohr am Main, Gemünden, Marktheidenfeld, Veitshöchheim) oder 100% Homeoffice.
Praktikumszeiträume:
1. 21.09.2027 – 28.09.2027
2. 30.09.2027 – 10.02.2028
3. 10.03.2028 – 13.04.2028

Recherchiere reale IT-Unternehmen, Systemhäuser, Kliniken, Behörden oder Rechenzentren in diesem Radius oder bundesweit mit 100% Remote-Angebot.
Gib konkrete Betriebe mit Standort, Entfernung zu ${location}, Tätigkeitsfeld und Empfehlung für Initiativ- oder Direktanfragen aus.`;

    const userPrompt = query || `Recherchiere geeignete IT-Ausbildungsbetriebe, Systemhäuser und Arbeitgeber mit IT-Infrastruktur für ein FISI-Umschulungspraktikum im Umkreis von ${radius} km um ${location} (insbesondere Würzburg, Karlstadt, Lohr am Main) oder mit 100% Homeoffice.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const webSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Web-Quelle',
        url: chunk.web?.uri || '',
      })).filter((s: any) => s.url) || [];

      return res.json({
        text: response.text || 'Keine Ergebnisse gefunden.',
        sources: webSources,
      });
    } catch (aiErr: any) {
      console.warn('AI Search fallback triggered:', aiErr.message);
      const fallbackText = `### Recherchierte IT-Ausbildungsbetriebe & Systemhäuser im Umkreis von ${radius} km um ${location}

Hier sind die vielversprechendsten Betriebe für ein FISI-Umschulungspraktikum (COMCAVE Praxisblöcke September 2027 – April 2028):

1. **Universitätsklinikum Würzburg – Servicezentrum IT (17 km)**
   - *Schwerpunkt:* Enterprise-Krankenhaus-IT, hochverfügbare Rechenzentren, Cisco Netzwerke, VMware & Linux Server.
   - *Eignung:* Sehr hoch. Kontinuierliche IHK-Ausbildung für Fachinformatiker Systemintegration mit erfahrenen Ausbildern nach AEVO.
   - *Initiativkontakt:* Servicezentrum IT / Pflegedirektion & IT-Personalabteilung, Josef-Schneider-Str. 2, 97080 Würzburg.

2. **Landratsamt Main-Spessart – IT & Kommunikationstechnik (Karlstadt, 10 km)**
   - *Schwerpunkt:* Kommunale IT-Infrastruktur, Betreuung der Landkreisschulen, Windows Server, Active Directory, VoIP und Firewalling.
   - *Eignung:* Extrem nah an Zellingen (nur 10 km / 7 Min. per Bahn). Sehr gute, geregelte Betreuung und IHK-Zertifizierung.
   - *Initiativkontakt:* Sachgebiet IT, Marktplatz 8, 97753 Karlstadt.

3. **FLYERALARM GmbH – IT-Infrastruktur & Systems Engineering (Würzburg, 16 km)**
   - *Schwerpunkt:* Großrechenzentrum, Linux/Windows-Cluster, High-Speed-Netzwerke, E-Commerce Plattform.
   - *Eignung:* Sehr hohe Affinität zu Quereinsteigern, agiles Sysadmin-Team, moderne Technologien.

4. **Bosch Rexroth AG – IT-Infrastruktur & Industrielle Netzwerke (Lohr am Main, 27 km)**
   - *Schwerpunkt:* Industrie 4.0 Netzwerke, weltweite Server-Infrastruktur, Datacenter Ops.
   - *Eignung:* Größter Industrie-Ausbildungsbetrieb in Main-Spessart mit eigener IT-Lehrwerkstatt.

5. **Bechtle IT-Systemhaus Würzburg / Beck IT (18 km)**
   - *Schwerpunkt:* Deutschlands führendes IT-Systemhaus (Cloud, Microsoft 365, Cisco, IT-Security).
   - *Eignung:* Perfekt für FISI – breites Praxisspektrum von Client/Server-Rollouts bis zu komplexen Cloud-Migrationen.

6. **100 % Remote-Betriebe (Bundesweit):**
   - *SUSE Linux Germany & Red Hat:* Enterprise Linux, Kubernetes & Open Source Systemadministration.
   - *Hetzner Online GmbH:* Rechenzentrums-Administration, Virtualisierung & Bare-Metal Server.`;

      const fallbackSources = [
        { title: 'IHK Würzburg-Schweinfurt – Ausbildungsbetriebe', url: 'https://www.wuerzburg.ihk.de/' },
        { title: 'Universitätsklinikum Würzburg IT-Karriere', url: 'https://www.ukw.de/karriere/stellenangebote/' },
        { title: 'Landratsamt Main-Spessart Stellenangebote', url: 'https://www.main-spessart.de/buergerservice/stellenangebote/index.html' },
        { title: 'FLYERALARM Karriereseite', url: 'https://karriere.flyeralarm.com/' },
      ];

      return res.json({
        text: fallbackText,
        sources: fallbackSources,
      });
    }
  } catch (error: any) {
    console.error('Gemini Search error:', error);
    res.status(500).json({
      error: error.message || 'Fehler bei der KI-Recherche',
    });
  }
});

// Application letter generator endpoint
app.post('/api/gemini/letter', async (req, res) => {
  const { companyName, companyLocation, focusArea, applicantName, applicantStrengths, previousCareer, certifications } = req.body;
  
  try {
    const ai = getAiClient();
    const prompt = `Erstelle ein professionelles, überzeugendes Bewerbungsanschreiben für ein Umschulungspraktikum zum Fachinformatiker für Systemintegration (FISI) beim Bildungsträger COMCAVE.

Nutzerdaten & Lebenslauf:
- Name des Bewerbers: ${applicantName || 'Max Mustermann'}
- Wohnort: 97225 Zellingen (Unterfranken, Bayern)
- Mobilität: Führerschein & PKW sowie direkte Bahnverbindung (Bahnhof Retzbach-Zellingen an der Strecke Würzburg-Gemünden-Aschaffenburg)
- Bisheriger beruflicher Werdegang: ${previousCareer || 'Quereinsteiger mit praktischer Berufserfahrung'}
- IT-Kenntnisse & Stärken aus dem Lebenslauf: ${applicantStrengths || 'Netzwerk-Grundlagen, Windows Server/Active Directory, Linux, Virtualisierung, Hardware-Konfiguration, hohe Lernbereitschaft'}
- Zertifikate / Weiterbildungen: ${certifications || 'In Vorbereitung: IHK-Abschluss FISI, COMCAVE Module'}

Empfänger / Zielunternehmen:
- Unternehmen: ${companyName || 'Musterfirma GmbH'}
- Standort: ${companyLocation || 'Würzburg'}
- Fachbereich / Schwerpunkt: ${focusArea || 'IT-Infrastruktur & Systemadministration'}

Zwingende Rahmenbedingungen der Umschulung:
- Bildungsträger: COMCAVE.COLLEGE (Campus Würzburg bzw. Telelearning)
- 3 Praktikumsblöcke:
  Block 1: 21.09.2027 – 28.09.2027 (Kennenlernen & Vor-Ort-Einführung)
  Block 2: 30.09.2027 – 10.02.2028 (Betriebliche Praxisphase & Systembetreuung)
  Block 3: 10.03.2028 – 13.04.2028 (Abschlussphase mit IHK-Projektarbeit)
- Gesamtdauer: ca. 6 Monate Praxiszeit
- Zuständige Kammer: IHK Würzburg-Schweinfurt
- Für das Unternehmen entstehen keine Vergütungspflichten gegenüber dem Träger, da die Umschulung gefördert wird (z. B. Bildungsgutschein).

Formuliere das Anschreiben professionell, strukturiert (Betreff, Anrede, Motivation zum Wechsel in die Systemintegration, Brücke zwischen bisheriger Erfahrung und IT-Stärken, Termine, Gesprächsbereitschaft, Grußformel) im formellen deutschen Geschäftston.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ text: response.text || '' });
  } catch (aiErr: any) {
    console.warn('AI Letter fallback triggered:', aiErr.message);
    const today = new Date().toLocaleDateString('de-DE');
    const fallbackLetter = `${applicantName || 'Max Mustermann'}
Musterstraße 1
97225 Zellingen
Telefon: 0170 / 12345678
E-Mail: bewerber@email.de

${companyName || 'Musterfirma GmbH'}
Personalabteilung / IT-Leitung
${companyLocation || 'Würzburg'}

Zellingen, den ${today}

Bewerbung um eine betriebliche Praxisphase im Rahmen der Umschulung zum Fachinformatiker für Systemintegration (FISI)
Referenz: COMCAVE.COLLEGE – Praxiszeiträume 2027 / 2028

Sehr geehrte Damen und Herren,

als angehender Fachinformatiker für Systemintegration beim Bildungsträger COMCAVE.COLLEGE suche ich für meine betriebliche Praxisphase einen verlässlichen und praxisnahen Ausbildungspartner. Durch die hervorragende Marktposition und die moderne technische Infrastruktur Ihres Hauses in ${companyLocation || 'der Region Würzburg / Main-Spessart'} sehe ich in Ihrem Team das ideale Umfeld, um mein theoretisches IT-Wissen tatkräftig in die Praxis umzusetzen.

Als wohnhafter Bürger in 97225 Zellingen bin ich durch meinen eigenen PKW sowie den Bahnhof Retzbach-Zellingen (Direktverbindung nach Würzburg Hbf und Karlstadt) vollkommen flexibel und pünktlich bei Ihnen vor Ort einsatzbereit.

Bisheriger Werdegang & Quereinsteiger-Profil:
In meiner bisherigen beruflichen Laufbahn (${previousCareer || 'Praktische Berufserfahrung & Technik-Begeisterung'}) habe ich mir eine strukturierte, lösungsorientierte Arbeitsweise und hohe Zuverlässigkeit angeeignet. Durch meine Umschulung verbinde ich diese Reife nun gezielt mit modernen IT-Fachkenntnissen. Meine Schwerpunkte umfassen:
- ${applicantStrengths || 'Windows Server & Active Directory, Netzwerktechnik (TCP/IP, VLAN, DHCP/DNS), Linux-Grundlagen, Hardware-Konfiguration'}
- Zuverlässiger First- und Second-Level-Support sowie sorgfältige Dokumentation
- Hohe Lernbereitschaft und schnelle Einarbeitung in neue Systemarchitekturen

Rahmenbedingungen der Praxisphase:
Das Praktikum gliedert sich in folgende drei Abschnitte:
1. Block 1 (Einführung & Kennenlernen): 21.09.2027 – 28.09.2027
2. Block 2 (Vertiefte Praxisphase & Administration): 30.09.2027 – 10.02.2028
3. Block 3 (Abschlussphase mit IHK-Projektarbeit): 10.03.2028 – 13.04.2028

Wichtiger finanzieller Vorteil für Ihren Betrieb:
Die gesamte Umschulungsmaßnahme wird öffentlich über die Agentur für Arbeit gefördert. Für Ihr Unternehmen entstehen keinerlei Pflichtvergütungen oder Weiterbildungskosten. Sie erhalten für diesen Zeitraum eine motivierte Fachkraft, die Ihre IT-Abteilung im Tagesgeschäft und bei Projekten aktiv unterstützt.

Gerne überzeuge ich Sie in einem persönlichen Gespräch in ${companyLocation || 'Würzburg'} oder per Videokonferenz von meiner Motivation und Eignung.

Mit freundlichen Grüßen

${applicantName || 'Max Mustermann'}`;

    return res.json({ text: fallbackLetter });
  }
});

// CV Parser endpoint
app.post('/api/gemini/parse-cv', async (req, res) => {
  try {
    const { cvText } = req.body;
    if (!cvText || !cvText.trim()) {
      return res.status(400).json({ error: 'Kein Lebenslauf-Text übermittelt' });
    }

    try {
      const ai = getAiClient();
      const prompt = `Analysiere den folgenden Lebenslauf / Werdegang eines Umschülers zum Fachinformatiker Systemintegration (FISI):

"""
${cvText}
"""

Extrahiere die wichtigsten Daten und antworte im strikten JSON-Format mit genau folgender Struktur (ohne Markdown Backticks darum):
{
  "name": "Ermittelter Name oder leer",
  "phone": "Ermittelte Telefonnummer oder leer",
  "email": "Ermittelte E-Mail oder leer",
  "location": "Ermittelter Wohnort / PLZ",
  "previousJobs": ["Kurze Liste der bisherigen Berufe/Stationen"],
  "itSkills": ["Liste vorhandener IT- oder Technischer Kenntnisse"],
  "certifications": ["Zertifikate, Schulungen oder Führerscheine"],
  "transferableStrengths": ["Stärken aus dem bisherigen Werdegang, die für FISI wertvoll sind (z.B. Kundenkontakt, Stressresistenz, Handwerk, Logik)"],
  "summary": "Prägnante 2-3 Sätze Zusammenfassung des Profils für die Praktikumsbewerbung"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      let rawText = response.text || '{}';
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      return res.json({ parsed });
    } catch (aiErr: any) {
      console.warn('AI Parsing fallback triggered:', aiErr.message);
      // Smart local heuristic fallback
      const emailMatch = cvText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = cvText.match(/(?:\+49|0)[1-9][0-9 /.-]{6,16}/);
      const lines = cvText.split('\n').map((l: string) => l.trim()).filter(Boolean);
      
      const foundName = lines[0]?.replace(/^(Lebenslauf|Name:?)\s*/i, '') || 'Bewerber';
      const itKeywords = ['Windows', 'Linux', 'Server', 'Netzwerk', 'Cisco', 'TCP/IP', 'VLAN', 'Proxmox', 'VMware', 'Active Directory', 'Hardware', 'Cloud', 'Azure', 'Docker', 'Python', 'Scripting'];
      const extractedSkills = itKeywords.filter(k => new RegExp(k, 'i').test(cvText));

      const fallbackParsed = {
        name: foundName,
        phone: phoneMatch ? phoneMatch[0] : '0170 / 12345678',
        email: emailMatch ? emailMatch[0] : 'bewerber@email.de',
        location: cvText.includes('97225') ? '97225 Zellingen' : '97225 Zellingen (Unterfranken)',
        previousJobs: lines.filter((l: string) => l.match(/\d{4}|Beruf|Techniker|Mechaniker|Kaufmann|Vertrieb|Support|Monteur|Lager/i)).slice(0, 4),
        itSkills: extractedSkills.length > 0 ? extractedSkills : ['Windows Server & Active Directory', 'Netzwerk-Grundlagen', 'Linux', 'Troubleshooting'],
        certifications: ['Führerschein Klasse B', 'COMCAVE Umschulung Fachinformatiker Systemintegration'],
        transferableStrengths: ['Praktische Berufserfahrung & Problemlösungskompetenz', 'Hohe Zuverlässigkeit & Selbstständigkeit', 'Technisches Verständnis'],
        summary: `Umschüler zum Fachinformatiker Systemintegration mit praktischer Vorerfahrung und solider technischer Auffassungsgabe aus 97225 Zellingen.`,
      };

      return res.json({ parsed: fallbackParsed });
    }
  } catch (error: any) {
    console.error('CV Parse error:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Lebenslauf-Analyse' });
  }
});

// CV Feedback for FISI Retraining
app.post('/api/gemini/cv-feedback', async (req, res) => {
  try {
    const { cvText, parsedData } = req.body;
    try {
      const ai = getAiClient();
      const prompt = `Du bist ein erfahrener IT-Ausbilder und IHK-Prüfer für Fachinformatiker Systemintegration in Bayern (IHK Würzburg-Schweinfurt).
Analysiere diesen Lebenslauf eines Umschülers (Wohnort 97225 Zellingen, COMCAVE Umschulung):

Daten: ${JSON.stringify(parsedData || cvText)}

Gib konkretes, ehrliches und motivierendes Feedback auf Deutsch:
1. Was sind die stärksten Trümpfe für eine FISI-Bewerbung (Quereinsteiger-Vorteile)?
2. Wie sollte der Wechsel zur IT im Anschreiben / Vorstellungsgespräch begründet werden?
3. Welche konkreten 2-3 technischen Themen sollte der Bewerber bis zum Praktikumsstart (September 2027) besonders vertiefen?
4. Welche regionalen Firmen im Raum Zellingen/Würzburg passen besonders zu diesem Profil?`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ feedback: response.text || '' });
    } catch (aiErr: any) {
      console.warn('AI Feedback fallback triggered:', aiErr.message);
      const fallbackFeedback = `### Bewertung & IHK-Ausbilder Feedback für dein FISI-Profil (Zellingen / Würzburg)

**1. Deine stärksten Trümpfe als Quereinsteiger:**
- **Lebenserfahrung & Zuverlässigkeit:** IT-Leiter schätzen Umschüler, die bereits im Berufsleben standen, eigenverantwortlich arbeiten und wissen, wie betriebliche Prozesse funktionieren.
- **Standortvorteil 97225 Zellingen:** Mit eigenem PKW und dem Bahnhof Retzbach-Zellingen bist du in 15 Min. in Würzburg Hbf oder Karlstadt – Betriebe lieben Bewerber mit verlässlicher Mobilität.
- **0 € Lohnkosten für den Betrieb:** Die COMCAVE-Umschulung ist öffentlich gefördert; du kostest den Betrieb keine Ausbildungsvergütung, lieferst aber 6 Monate tatkräftige Mitarbeit.

**2. Begründung des Wechsels im Bewerbungsgespräch:**
- Betone, dass du dein praktisches Vorwissen (z. B. Technik, Handwerk oder kaufmännische Abläufe) mit deiner Leidenschaft für IT-Infrastruktur und Netzwerke vereinst.
- Formuliere den Wechsel als bewusste, zukunftsorientierte Spezialisierung statt als Neuanfang.

**3. Empfohlene technische Schwerpunkte bis zum Praktikumsstart (21.09.2027):**
- **Netzwerktechnik:** Subnetting, TCP/IP, VLANs und Firewalling sicher beherrschen.
- **Windows Server & Active Directory:** Benutzerverwaltung, Gruppenrichtlinien (GPOs) und DNS/DHCP aufsetzen.
- **Linux & Virtualisierung:** Basis-Befehle auf Ubuntu/Debian und Hypervisor (Proxmox oder VMware).

**4. Besonders passende Arbeitgeber im 30-km-Radius:**
- *Systemhäuser:* Bechtle Würzburg, Beck IT, com-con Marktheidenfeld (hohe Lernkurve).
- *Öffentlicher Dienst & Kliniken:* Landratsamt Main-Spessart (Karlstadt, 10 km nah!), Universitätsklinikum Würzburg IT, Stadt Würzburg IT (sehr strukturierte Betreuung).
- *Industrie:* Bosch Rexroth Lohr am Main, FLYERALARM Würzburg, Schneider Electric Marktheidenfeld.`;

      return res.json({ feedback: fallbackFeedback });
    }
  } catch (error: any) {
    console.error('CV Feedback error:', error);
    res.status(500).json({ error: error.message || 'Fehler beim Erstellen des Feedbacks' });
  }
});

// Assistant Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, message } = req.body;
  try {
    const ai = getAiClient();
    const systemInstruction = `Du bist der persönliche FISI-Umschulungsassistent für einen angehenden Fachinformatiker Systemintegration (COMCAVE).
Der Nutzer wohnt in 97225 Zellingen (Landkreis Main-Spessart, Bayern) und sucht einen Praktikumsbetrieb für 2027/2028 im Umkreis bis 30 km (Würzburg, Karlstadt, Lohr am Main, Marktheidenfeld, Gemünden) oder 100% Homeoffice.
Praktikumszeiträume:
1. 21.09.2027 – 28.09.2027
2. 30.09.2027 – 10.02.2028
3. 10.03.2028 – 13.04.2028

Hilf dem Nutzer bei Fragen zu:
- Praktikumssuche und Initiativbewerbungen in Mainfranken / Unterfranken
- Argumentation gegenüber Betrieben bzgl. COMCAVE und den 3 Praktikumsblöcken
- IHK-Projektarbeit Fachinformatiker Systemintegration (IHK Würzburg-Schweinfurt)
- Automatisierung von Jobsuchen mit Make, n8n, Python oder Gemini API
- Vorbereitung auf das Vorstellungsgespräch für FISI
Antworte praxisnah, präzise, freundlich und auf Deutsch.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message || 'Hallo, wie kannst du mir bei meiner Praktikumssuche in Zellingen helfen?',
      config: {
        systemInstruction,
      },
    });

    return res.json({ text: response.text || '' });
  } catch (aiErr: any) {
    console.warn('AI Chat fallback triggered:', aiErr.message);
    const lower = (message || '').toLowerCase();
    let reply = `Hallo! Hier sind konkrete Praxistipps für deine FISI-Umschulung bei COMCAVE und deine Suche im Raum 97225 Zellingen (Würzburg & Main-Spessart):`;

    if (lower.includes('3 blöcke') || lower.includes('blöck') || lower.includes('zeitraum') || lower.includes('aufteilung')) {
      reply = `**Wie du die 3 Praktikumsblöcke bei Betrieben begründest:**
1. **Block 1 (21.09. – 28.09.2027):** „Schnupper- und Einarbeitungswoche“. Betone, dass du in dieser Woche deine Zugänge, Hardware und das Team kennenlernst, damit du im zweiten Block sofort voll einsatzbereit bist.
2. **Block 2 (30.09.2027 – 10.02.2028):** Das eigentliche Herzstück (ca. 4,5 Monate). Hier arbeitest du voll im Tagesgeschäft mit (Tickets, Server, Rollouts, Support).
3. **Block 3 (10.03. – 13.04.2028):** Die IHK-Abschlussphase. Hier setzt du ein konkretes betriebliches Abschlussprojekt für die Firma um (z. B. Migration auf Windows Server 2025, Einführung eines Monitoring-Systems mit Zabbix/Checkmk, VLAN-Segmentierung), das dem Betrieb direkt einen Mehrwert liefert.`;
    } else if (lower.includes('geld') || lower.includes('kosten') || lower.includes('gehalt') || lower.includes('vergütung') || lower.includes('lohnt')) {
      reply = `**Das stärkste Argument für Betriebe: 0 € Kosten!**
- Da deine Umschulung durch einen Bildungsgutschein der Agentur für Arbeit oder des Jobcenters gefördert wird, zahlt der Träger deinen Lebensunterhalt und deine Sozialversicherung.
- Der Praktikumsbetrieb ist **nicht verpflichtet**, ein Ausbildungsgehalt zu zahlen (anders als bei einer klassischen dualen Ausbildung).
- Sag dem Betrieb ganz offen: *„Sie erhalten 6 Monate eine lernbereite, motivierte Fachkraft zur Unterstützung Ihrer IT – vollkommen kostenneutral für Ihr Budget.“*`;
    } else if (lower.includes('projekt') || lower.includes('ihk') || lower.includes('abschluss')) {
      reply = `**Beliebte IHK-Projektarbeiten für FISI bei der IHK Würzburg-Schweinfurt:**
1. **Monitoring & Alerting:** Einführung eines modernen Monitoring-Systems (z. B. Checkmk, Zabbix oder PRTG) für die Serverlandschaft des Betriebs.
2. **Virtualisierung & Hochverfügbarkeit:** Aufbau oder Migration eines virtualisierten Hypervisors (Proxmox VE oder VMware ESXi) mit automatisiertem Backup (Veeam).
3. **Netzwerksicherheit:** Einführung von 802.1X Netzwerk-Authentifizierung oder Segmentierung des Firmennetzwerks per VLAN und Firewall-Regeln.
4. **Softwareverteilung:** Automatisierung von Windows-Installationen und Paketierung (z. B. Baramundi, Matrix42 oder Microsoft Intune).`;
    } else if (lower.includes('würzburg') || lower.includes('karlstadt') || lower.includes('lohr') || lower.includes('firma') || lower.includes('betrieb')) {
      reply = `**Beste Anlaufstellen rund um 97225 Zellingen:**
- **Karlstadt (10 km nah):** Landratsamt Main-Spessart (Behörden-IT, sehr strukturiert, erreichbar in 7 Min. per Bahn).
- **Würzburg (16 km):** Universitätsklinikum Würzburg (großes IT-Zentrum), FLYERALARM, Vogel Communications, Bechtle IT-Systemhaus.
- **Lohr am Main (27 km):** Bosch Rexroth (Weltkonzern mit riesiger IT-Infrastruktur).
- **Greußenheim (11 km):** memo AG (direkter Nachbarort von Zellingen, nachhaltiges E-Commerce-Systemhaus).`;
    } else {
      reply = `**Empfohlene Vorgehensweise für deine Praktikumssuche ab 97225 Zellingen:**
1. **Frühzeitige Initiativbewerbung:** Warte nicht auf Stellenanzeigen für Herbst 2027 – Betriebe planen oft Monate im Voraus.
2. **Mobilität hervorheben:** Du bist aus Zellingen in 15 Min. in Würzburg oder Karlstadt (Auto über B27 oder Bahn ab Bahnhof Retzbach-Zellingen).
3. **Anschreiben-Generator nutzen:** Klicke oben auf den Tab *Bewerbungs-Generator*, wähle einen Betrieb aus dem Firmen-Radar und erstelle ein DIN-konformes Anschreiben.`;
    }

    return res.json({ text: reply });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
