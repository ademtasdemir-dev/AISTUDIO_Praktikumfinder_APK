export interface LocationPreset {
  id: string;
  name: string;
  postalCode: string;
  lat: number;
  lng: number;
  tag: string;
  description: string;
}

export const locationPresets: LocationPreset[] = [
  {
    id: 'zellingen',
    name: 'Zellingen',
    postalCode: '97225',
    lat: 49.8965,
    lng: 9.8163,
    tag: 'Heimatort (Main-Spessart)',
    description: 'Ausgangsort mit Retzbach-Zellingen Bahnhof (direkte Bahnanbindung nach Karlstadt, Würzburg & Lohr).',
  },
  {
    id: 'wuerzburg',
    name: 'Würzburg',
    postalCode: '97070',
    lat: 49.7913,
    lng: 9.9534,
    tag: 'Zentrum & Uni-Stadt',
    description: 'Große Dichte an Systemhäusern, UKW, Behörden und Rechenzentren.',
  },
  {
    id: 'karlstadt',
    name: 'Karlstadt',
    postalCode: '97753',
    lat: 49.9632,
    lng: 9.7654,
    tag: 'Kreisstadt Main-Spessart',
    description: 'Sitz des Landratsamts Main-Spessart (IT-Fachbereich) & regionaler Mittelstand.',
  },
  {
    id: 'lohr',
    name: 'Lohr am Main',
    postalCode: '97816',
    lat: 49.9941,
    lng: 9.5768,
    tag: 'Industrie-Schwergewicht',
    description: 'Hauptstandort Bosch Rexroth Automation & Steuerungstechnik.',
  },
  {
    id: 'marktheidenfeld',
    name: 'Marktheidenfeld',
    postalCode: '97828',
    lat: 49.8436,
    lng: 9.6002,
    tag: 'Industrie & Hightech',
    description: 'Hauptsitz WAREMA Renkhoff SE & Schneider Electric Automation.',
  },
  {
    id: 'gemuenden',
    name: 'Gemünden am Main',
    postalCode: '97737',
    lat: 50.0524,
    lng: 9.6912,
    tag: 'Eisenbahnknotenpunkt',
    description: 'Direkte Zugverbindungen, Handwerks- und Kommunal-IT.',
  },
  {
    id: 'schweinfurt',
    name: 'Schweinfurt',
    postalCode: '97421',
    lat: 50.0463,
    lng: 10.2285,
    tag: 'Großindustrie Mainfranken',
    description: 'Großkonzerne (SKF, ZF, Schaeffler, Fresenius) mit riesigen IT-Abteilungen.',
  },
];

// Approximate coordinates for regional companies
export const companyCoordinates: Record<string, { lat: number; lng: number }> = {
  'lra-msp': { lat: 49.9632, lng: 9.7654 }, // Karlstadt
  'ukw-it': { lat: 49.7980, lng: 9.9580 }, // Würzburg Grombühl
  'memo-ag': { lat: 49.8150, lng: 9.8050 }, // Greußenheim
  'bosch-rexroth': { lat: 49.9941, lng: 9.5768 }, // Lohr am Main
  'warema': { lat: 49.8436, lng: 9.6002 }, // Marktheidenfeld
  'brose-wue': { lat: 49.7750, lng: 9.9400 }, // Würzburg Heuchelhof
  'basf-wue': { lat: 49.7890, lng: 9.9320 }, // Würzburg
  'main-post': { lat: 49.7750, lng: 9.9300 }, // Würzburg Heuchelhof
  'rockenstein': { lat: 49.7850, lng: 9.9200 }, // Würzburg
  'konecranes': { lat: 49.7980, lng: 9.9050 }, // Würzburg Neuer Hafen
  'landratsamt-wue': { lat: 49.7913, lng: 9.9534 }, // Würzburg
  'uni-wue': { lat: 49.7850, lng: 9.9700 }, // Würzburg Hubland
  'stadtreiniger': { lat: 49.7913, lng: 9.9534 }, // Würzburg
  'schneider-electric': { lat: 49.8436, lng: 9.6002 }, // Marktheidenfeld
  'duttenhofer': { lat: 49.7913, lng: 9.9534 }, // Würzburg
  'fraenkische': { lat: 50.0800, lng: 9.9800 }, // Königsberg / Hassberge
  'knauf': { lat: 49.7050, lng: 10.2200 }, // Iphofen
  'obi-wue': { lat: 49.7780, lng: 9.9250 }, // Würzburg
  'hornbach-wue': { lat: 49.7780, lng: 9.9250 }, // Würzburg
  'ikea-wue': { lat: 49.7750, lng: 9.9350 }, // Würzburg
  'remote-cloud': { lat: 51.1657, lng: 10.4515 }, // Germany center (Remote)
};

// Haversine formula to compute distance in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
