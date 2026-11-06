export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  name?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  location?: string;
  previousJobs?: string[];
  itSkills?: string[];
  certifications?: string[];
  transferableStrengths?: string[];
  summary?: string;
}

export interface PromptConfig {
  location: string;
  radiusKm: number;
  priorityRemote: boolean;
  priorityRegion: boolean;
  block1Start: string;
  block1End: string;
  block2Start: string;
  block2End: string;
  block3Start: string;
  block3End: string;
  provider: string;
  ihk: string;
  targetCities: string[];
  includeProfileInPrompt?: boolean;
  userProfile?: UserProfileData;
}

export const defaultPromptConfig: PromptConfig = {
  location: '97225 Zellingen (Landkreis Main-Spessart, Bayern)',
  radiusKm: 30,
  priorityRemote: true,
  priorityRegion: true,
  block1Start: '21.09.2027',
  block1End: '28.09.2027',
  block2Start: '30.09.2027',
  block2End: '10.02.2028',
  block3Start: '10.03.2028',
  block3End: '13.04.2028',
  provider: 'COMCAVE',
  ihk: 'IHK Würzburg-Schweinfurt',
  targetCities: [
    'Würzburg',
    'Karlstadt',
    'Lohr am Main',
    'Gemünden am Main',
    'Marktheidenfeld',
    'Veitshöchheim',
    'Rimpar',
    'Arnstein'
  ],
  includeProfileInPrompt: true,
};

export function generatePromptMarkdown(config: PromptConfig): string {
  const citiesList = config.targetCities.join(', ');

  return `# Automatische Praktikumssuche – Fachinformatiker Systemintegration (FISI)

## 1. Ziel

Suche regelmäßig **alle 30 Minuten** im Internet nach geeigneten Praktikumsplätzen für meine Umschulung zum **Fachinformatiker für Systemintegration (FISI)** beim Bildungsträger **${config.provider}** (Standort Würzburg / bundesweites Virtuelles Klassenzimmer).

Ziel ist es, möglichst früh passende Praktikumsbetriebe zu finden und mich automatisch über neue Möglichkeiten zu informieren.

## 2. Praktikumszeitraum

Das Praktikum umfasst insgesamt ungefähr sechs Monate, aufgeteilt auf folgende drei Zeiträume:

- **${config.block1Start} – ${config.block1End}**
- **${config.block2Start} – ${config.block2End}**
- **${config.block3Start} – ${config.block3End}**

Bevorzugt wird ein Unternehmen, das mich über alle drei Praktikumsabschnitte betreuen kann.

Die zeitlichen Unterbrechungen zwischen den Abschnitten (z. B. IHK-Prüfungsvorbereitung und Theoriephasen bei ${config.provider}) müssen berücksichtigt werden.

## 3. Standort und Arbeitsmodell

Suche ausschließlich nach Praktikumsbetrieben, die mindestens eine dieser Bedingungen erfüllen:

**Priorität 1 – 100 % Homeoffice**
- Vollständig remote innerhalb Deutschlands.
- Keine regelmäßige Anwesenheit im Büro erforderlich.
- Unternehmen aus ganz Deutschland berücksichtigen.

**Priorität 2 – Raum ${config.location} und Umkreis max. ${config.radiusKm} km**
- **Wohnort:** ${config.location}.
- **Maximaler Umkreis:** ${config.radiusKm} km Entfernung (sehr gut angebunden per PKW über B27/A3/A7 sowie Bahnstrecke Würzburg–Gemünden–Aschaffenburg via Bahnhof Retzbach-Zellingen).
- **Wichtige Städte und Regionen im Umkreis:**
  - **Würzburg** (ca. 16 km südöstlich – zentraler IT-Hub in Unterfranken: Uniklinikum IT, Stadt Würzburg, Systemhäuser, E-Commerce)
  - **Karlstadt** (ca. 10 km nördlich – Kreisstadt Main-Spessart, Landratsamt IT, Klinikum)
  - **Lohr am Main** (ca. 25–28 km westlich – Industriestandort mit starker IT-Infrastruktur z. B. Bosch Rexroth)
  - **Marktheidenfeld** (ca. 25–28 km südwestlich – Industrie- und Technologieunternehmen)
  - **Gemünden am Main** (ca. 20–22 km nordwestlich)
  - **Veitshöchheim, Rimpar, Arnstein, Greußenheim, Leinach, Zell am Main** (direkter Nahbereich 5–18 km)
- Vor-Ort- und Hybridpraktika (z. B. 2–3 Tage Büro / Rest Homeoffice) sind hier ausdrücklich erwünscht.

## 4. Zwingende Voraussetzungen

Ein Praktikumsbetrieb muss:

1. Im Bereich IT-Infrastruktur, Systemadministration, Netzwerktechnik (Routing/Switching, VLANs, Firewalls), Cloud (Azure/AWS), Virtualisierung (VMware/Hyper-V/Proxmox), Windows Server / Active Directory oder Linux-Administration arbeiten.
2. Über einen geeigneten Ausbilder (z. B. mit AEVO nach BBiG) oder eine entsprechend qualifizierte Betreuungsperson verfügen, welche die fachliche Betreuung während der betrieblichen Praxisphase gewährleisten kann (Zuständige Kammer: **${config.ihk}**).
3. Grundsätzlich bereit sein, Umschüler im Rahmen einer betrieblichen Praxisphase aufzunehmen (Hinweis: Die Umschulung wird durch die Agentur für Arbeit / Jobcenter gefördert, für den Betrieb fallen keine Pflicht-Ausbildungsvergütungen an).
4. Möglichst alle drei angegebenen Praktikumszeiträume ermöglichen.

**Besonders bevorzugt werden Unternehmen, die:**
- Bereits mit **${config.provider}** (z. B. Standort Würzburg oder bundesweit) zusammenarbeiten.
- Nachweislich Umschüler von ${config.provider} oder vergleichbaren Bildungsträgern betreut haben.
- Regelmäßig Umschulungspraktika oder duale Ausbildungen für Fachinformatiker anbieten (anerkannte IHK-Ausbildungsbetriebe).
- Erfahrung mit der **${config.ihk}** und IHK-Abschlussprojekten für Systemintegratoren haben.

Eine bestehende ${config.provider}-Kooperation ist ein Vorteil, aber keine zwingende Voraussetzung.
${config.includeProfileInPrompt && config.userProfile && (config.userProfile.previousJobs?.length || config.userProfile.itSkills?.length || config.userProfile.summary) ? `
## 4.1 Mein persönliches Bewerberprofil (aus Lebenslauf)

Berücksichtige bei der Suche und Priorisierung mein individuelles Profil als Umschüler:

${config.userProfile.summary ? `- **Kurzprofil:** ${config.userProfile.summary}` : ''}
${config.userProfile.previousJobs && config.userProfile.previousJobs.length > 0 ? `- **Bisheriger beruflicher Hintergrund:** ${config.userProfile.previousJobs.join(', ')}` : ''}
${config.userProfile.itSkills && config.userProfile.itSkills.length > 0 ? `- **Vorhandene IT-Kenntnisse / Schwerpunkte:** ${config.userProfile.itSkills.join(', ')}` : ''}
${config.userProfile.transferableStrengths && config.userProfile.transferableStrengths.length > 0 ? `- **Übertragbare Stärken (Quereinsteiger-Vorteile):** ${config.userProfile.transferableStrengths.join(', ')}` : ''}
${config.userProfile.certifications && config.userProfile.certifications.length > 0 ? `- **Zertifikate & Qualifikationen:** ${config.userProfile.certifications.join(', ')}` : ''}

**Spezifischer Abgleich:** Priorisiere solche Betriebe im 30-km-Radius oder Remote, bei denen mein bisheriger beruflicher Hintergrund oder meine technischen Schwerpunkte einen direkten Mehrwert bieten (z. B. Branchennähe, technisches Verständnis, Kundenorientierung).
` : ''}
## 5. Suchstrategie

Durchsuche systematisch:

- Regionale Unternehmenswebseiten und Karriereseiten in Mainfranken, Main-Spessart und Würzburg.
- Online-Stellenbörsen: Indeed, StepStone, LinkedIn, XING, Monster, Meinestadt.de und Arbeitsagentur Jobsuche (Filter: 97225 Zellingen + ${config.radiusKm} km).
- **IHK-Lehrstellenbörse & IHK-Ausbildungsbetriebsverzeichnis der ${config.ihk}** nach eingetragenen IT-Ausbildungsbetrieben.
- Regionale IT-Dienstleister, Systemhäuser, Managed Service Provider (MSP) und Rechenzentren.
- **Großunternehmen, Fabriken, Medien- & Handelshäuser mit eigener IT-Infrastruktur** (z. B. Mediengruppe Main-Post, Konecranes Noell Würzburg, BASF Coatings Würzburg, s.Oliver Group Rottendorf, Brose Würzburg, Universitätsklinikum Würzburg IT, Uni Würzburg Rechenzentrum, Landratsamt Main-Spessart Karlstadt, Klinikum Main-Spessart, Bosch Rexroth Lohr, Koenig & Bauer, FLYERALARM, Vogel Communications, große Handelsfilialen wie OBI, Hornbach, IKEA Würzburg mit interner PoS-/Warenwirtschafts-IT).
- Bundesweite Stellen für 100 % Remote Praktika im IT-Bereich.

Verwende unter anderem diese Suchbegriffe:

- FISI Umschulungspraktikum 2027 2028 Zellingen Würzburg
- Fachinformatiker Systemintegration Praktikum Würzburg
- Fachinformatiker Systemintegration Praktikum Karlstadt Main-Spessart
- Fachinformatiker Systemintegration Praktikum Lohr am Main
- Fachinformatiker Praktikum Marktheidenfeld
- ${config.provider} Praktikumsbetrieb Systemintegration Würzburg
- IT Umschulungspraktikum Homeoffice
- Fachinformatiker Systemintegration Remote Praktikum Deutschland
- IHK Würzburg Schweinfurt Umschulung betriebliche Praxisphase IT
- IT Systemhaus Umschüler Praktikum Würzburg
- IT Administrator Praktikum 97225 Zellingen
- Fachinformatiker Praktikum 100 % Remote

**Wichtig – Gezielter Zugriff auf den verdeckten Stellenmarkt:**
Suche ausdrücklich **nicht** nur nach explizit als Praktikum ausgeschriebenen Stellen!
Identifiziere sämtliche Betriebe, Konzerne, Behörden, Kliniken, Fabriken, Medien- und Handelsunternehmen im Umkreis von ${config.radiusKm} km um 97225 Zellingen, die eine **eigene IT-Abteilung / interne Systemadministration** betreiben. Wir bewerben uns dort gezielt initiativ für die 3 geförderten Praxisphasen 2027/2028, da für den Betrieb keine Vergütungskosten entstehen.

## 6. Bewertung und Priorisierung

Bewerte jeden Treffer anhand folgender Kriterien:

1. Passendes FISI-Tätigkeitsfeld (Netzwerk, Virtualisierung, Client/Server-Support, Cloud, Storage).
2. Nachgewiesene Bereitschaft zur Aufnahme von Umschülern oder Azubis.
3. Verfügbarkeit einer geeigneten fachlichen Betreuung (IHK-Ausbilder / IT-Leitung).
4. Erfahrung mit ${config.provider} oder vergleichbaren Bildungsträgern.
5. Vollständiges Homeoffice ODER gute Erreichbarkeit von **97225 Zellingen** (maximal ${config.radiusKm} km Entfernung, z. B. Würzburg, Karlstadt, Lohr am Main).
6. Mögliche Betreuung während aller drei Praktikumszeiträume (${config.block1Start} – ${config.block3End}).

Unterscheide unbedingt zwischen:

- **Bestätigter Praktikumsmöglichkeit:** Aktuell ausgeschrieben oder vom Unternehmen bestätigt.
- **Geeignetem potenziellen Praktikumsbetrieb:** Fachlich passender Ausbildungsbetrieb, Aufnahmebereitschaft für Umschulung wird angefragt.
- **Initiativbewerbung empfohlen:** Keine offene Praktikumsanzeige, aber starkes IT-Profil und IHK-Ausbildungsbetrieb im ${config.radiusKm}-km-Umkreis.

Erfinde niemals offene Stellen, Kooperationen oder Ansprechpartner.

## 7. Ausgabeformat

Gib für jeden neu gefundenen Betrieb folgende Informationen aus:

**Unternehmen:**  
**Standort:** (PLZ, Stadt und Straße falls bekannt)  
**Arbeitsmodell:** Remote / Hybrid / Vor Ort  
**Entfernung zu 97225 Zellingen:** (in km & Pendel-Fahrzeit)  
**Tätigkeitsbereich:**  
**Umschulungspraktikum möglich:** Bestätigt / Unbekannt (Initiativanfrage)  
**Ausbilder vorhanden:** Bestätigt / Unbekannt  
**${config.provider}-Erfahrung:** Bestätigt / Unbekannt  
**Eignung:** Sehr hoch / Hoch / Mittel  
**Kontaktperson:** Falls öffentlich verfügbar (z. B. IT-Leiter oder HR)  
**E-Mail / Bewerbungslink:**  
**Quelle:** Direkter Link zur Stellenanzeige oder Unternehmenswebseite  
**Begründung:** Warum dieser Betrieb für meine FISI-Umschulung im Raum Zellingen/Würzburg optimal geeignet ist

Sortiere die Ergebnisse nach Eignung, mit besonderer Priorität für vollständig remote arbeitende Unternehmen sowie Betriebe im Umkreis von bis zu ${config.radiusKm} km um 97225 Zellingen.

## 8. Automatische Überwachung

- Wiederhole die Recherche alle 30 Minuten.
- Vergleiche neue Suchergebnisse mit bereits gefundenen Unternehmen.
- Vermeide doppelte Meldungen.
- Prüfe, ob Stellenangebote noch aktuell sind.
- Informiere mich ausschließlich über neue passende Unternehmen oder relevante Änderungen.
- Melde auch besonders vielversprechende Betriebe für Initiativbewerbungen im Raum Main-Spessart/Würzburg.
- Wenn keine neuen relevanten Ergebnisse vorliegen, sende keine Benachrichtigung.

## 9. Besonders wichtig

Da der Praktikumsbeginn erst am **${config.block1Start}** liegt, sollen auch Unternehmen berücksichtigt werden, die aktuell noch keine Praktikumsstellen für diesen Zeitraum veröffentlicht haben.

Ziel ist es, bereits frühzeitig geeignete Ausbildungsbetriebe im Umkreis von 97225 Zellingen oder Remote zu identifizieren, damit ich mich rechtzeitig initiativ bewerben und meinen Praktikumsplatz für 2027/2028 sichern kann.

**Oberstes Ziel:** Einen geeigneten Praktikumsbetrieb finden, der mich während meiner FISI-Umschulung fachgerecht betreut und möglichst alle drei Praktikumsabschnitte übernimmt.`;
}
