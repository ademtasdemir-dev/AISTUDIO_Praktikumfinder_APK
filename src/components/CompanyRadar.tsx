import React, { useState, useEffect } from 'react';
import { CompanyEntry, curatedCompanies } from '../data/curatedCompanies';
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  Train, 
  Car,
  Bookmark,
  Send,
  Sparkles,
  Info,
  Award,
  Crown,
  Mail,
  ArrowUpDown,
  Filter,
  CalendarClock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Linkedin
} from 'lucide-react';
import { LocationPreset, calculateDistanceKm, companyCoordinates } from '../data/locations';

interface CompanyRadarProps {
  onGenerateLetter: (company: CompanyEntry) => void;
  currentLocation?: LocationPreset;
  currentRadius?: number;
  onOpenLocationModal?: () => void;
}

export const CompanyRadar: React.FC<CompanyRadarProps> = ({ 
  onGenerateLetter,
  currentLocation,
  currentRadius = 30,
  onOpenLocationModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Alle');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'tier1' | 'tier2' | 'tier3' | 'hidden' | 'sent'>('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'distance' | 'name'>('ranking');
  const [maxDistance, setMaxDistance] = useState<number>(35);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [sentDatesMap, setSentDatesMap] = useState<Record<string, { date: string; followUp: string }>>({});
  const [showRankingInfo, setShowRankingInfo] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fisi_company_status');
      if (saved) {
        setStatusMap(JSON.parse(saved));
      }
      const savedDates = localStorage.getItem('fisi_company_sent_dates');
      if (savedDates) {
        setSentDatesMap(JSON.parse(savedDates));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = { ...statusMap, [id]: newStatus };
    setStatusMap(updated);
    try {
      localStorage.setItem('fisi_company_status', JSON.stringify(updated));
      
      if (newStatus === 'Abgeschickt' && !sentDatesMap[id]) {
        const today = new Date();
        const followUp = new Date();
        followUp.setDate(today.getDate() + 14);
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const info = {
          date: today.toLocaleDateString('de-DE', dateOptions),
          followUp: followUp.toLocaleDateString('de-DE', dateOptions),
        };
        const updatedDates = { ...sentDatesMap, [id]: info };
        setSentDatesMap(updatedDates);
        localStorage.setItem('fisi_company_sent_dates', JSON.stringify(updatedDates));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const countTier1 = curatedCompanies.filter(c => c.tier === 1).length;
  const countTier2 = curatedCompanies.filter(c => c.tier === 2).length;
  const countTier3 = curatedCompanies.filter(c => c.tier === 3).length;
  const countHidden = curatedCompanies.filter(c => c.strategy === 'Versteckter Stellenmarkt (Initiativ-Fokus)').length;
  const countSent = Object.values(statusMap).filter(s => s === 'Abgeschickt').length;

  const getCompanyDistance = (company: CompanyEntry): number => {
    if (company.category === 'Remote') return 0;
    if (currentLocation) {
      const coords = companyCoordinates[company.id];
      if (coords) {
        return calculateDistanceKm(currentLocation.lat, currentLocation.lng, coords.lat, coords.lng);
      }
    }
    return company.distanceKm;
  };

  const filtered = curatedCompanies
    .filter((company) => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.focus.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'Alle' || company.category === selectedCategory;

      const matchesStrategy = 
        selectedStrategy === 'Alle' || company.strategy === selectedStrategy;

      const matchesTier = 
        selectedTier === 'all' || company.tier.toString() === selectedTier;

      const dist = getCompanyDistance(company);
      const effectiveMaxDist = currentRadius > 0 ? currentRadius : maxDistance;
      const matchesDistance = 
        company.category === 'Remote' || dist <= effectiveMaxDist;

      // Quick filter pill logic
      let matchesQuick = true;
      if (quickFilter === 'tier1') matchesQuick = company.tier === 1;
      else if (quickFilter === 'tier2') matchesQuick = company.tier === 2;
      else if (quickFilter === 'tier3') matchesQuick = company.tier === 3;
      else if (quickFilter === 'hidden') matchesQuick = company.strategy === 'Versteckter Stellenmarkt (Initiativ-Fokus)';
      else if (quickFilter === 'sent') matchesQuick = statusMap[company.id] === 'Abgeschickt';

      return matchesSearch && matchesCategory && matchesStrategy && matchesTier && matchesDistance && matchesQuick;
    })
    .sort((a, b) => {
      if (sortBy === 'ranking') {
        return b.matchScore - a.matchScore; // Highest score / Tier 1 first
      } else if (sortBy === 'distance') {
        return getCompanyDistance(a) - getCompanyDistance(b); // Closest first
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const categories = [
    'Alle', 
    'Systemhaus', 
    'Großindustrie & Fabriken', 
    'Öffentlicher Dienst, Uni & Kliniken', 
    'Handel, Medien & Logistik', 
    'Remote'
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-mono text-xs tracking-wider uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>Firmen-Ranking</span>
              </div>
              <span className="text-slate-600">&bull;</span>
              {onOpenLocationModal ? (
                <button
                  onClick={onOpenLocationModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-700 text-sky-300 hover:bg-sky-900/80 transition text-xs font-mono font-medium"
                  title="Standort jetzt wechseln"
                >
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>{currentLocation?.name || 'Zellingen'} ({currentRadius > 0 ? `${currentRadius} km` : 'Remote'})</span>
                  <span className="text-[10px] text-sky-400 underline ml-0.5">Wechseln ▾</span>
                </button>
              ) : (
                <span className="text-xs text-sky-300 font-mono">
                  {currentLocation?.name || 'Zellingen'} ({currentRadius} km)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Top-Arbeitgeber Ranking &amp; Firmen-Radar
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              Gerankte Betriebe nach Eignung für die FISI-Umschulung bei COMCAVE (Lehrwerkstatt, AEVO-Betreuung, Übernahmechancen, Entfernung zu {currentLocation?.name || 'Zellingen'}).
              Enthält offizielle Ausbildungsbetriebe und den <strong>verdeckten Stellenmarkt</strong> (Fabriken, Medien, Handel, Kliniken ohne aktive Praktikumsanzeige).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 shrink-0">
            <div>
              <span className="text-slate-500 block text-[10px]">Tier 1 Top-Picks</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {countTier1} Betriebe
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Gesamt</span>
              <span className="font-mono text-base font-bold text-sky-400">{curatedCompanies.length} Betriebe</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Abgeschickt</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {countSent} in Pipeline
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Schnellfilter:</span>
          
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              quickFilter === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Alle ({curatedCompanies.length})
          </button>

          <button
            onClick={() => setQuickFilter('tier1')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              quickFilter === 'tier1'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Tier 1: Top-Favoriten ({countTier1})</span>
          </button>

          <button
            onClick={() => setQuickFilter('tier2')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              quickFilter === 'tier2'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-sky-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Tier 2: Industrie &amp; Rechenzentren ({countTier2})</span>
          </button>

          <button
            onClick={() => setQuickFilter('tier3')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              quickFilter === 'tier3'
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-slate-950 text-indigo-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>Tier 3: Handel &amp; Mittelstand ({countTier3})</span>
          </button>

          <button
            onClick={() => setQuickFilter('hidden')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              quickFilter === 'hidden'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-amber-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Verdeckter Stellenmarkt ({countHidden})</span>
          </button>

          <button
            onClick={() => setQuickFilter('sent')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              quickFilter === 'sent'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Abgeschickt ({countSent})</span>
          </button>
        </div>

        {/* Ranking Criteria Toggle Guide */}
        <div className="mt-3">
          <button
            onClick={() => setShowRankingInfo(!showRankingInfo)}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Wie funktioniert das Ranking (Tier 1 vs. Industrie vs. Handel)?</span>
            {showRankingInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRankingInfo && (
            <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-3">
              <h4 className="font-bold text-slate-200">Kriterien für das Zellingen-Firmenranking (75% bis 99% Match-Score):</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 p-3 rounded border border-emerald-900/40 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tier 1: Top-Favoriten (95–99%)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong>Karlstadt (10 km), UKW (17 km), memo AG (11 km), Rexroth (27 km).</strong> Höchste Übernahmequoten, feste AEVO-Ausbilder, perfekte Bahnanbindung ab Retzbach-Zellingen oder kurze Fahrzeiten.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded border border-sky-900/40 space-y-1">
                  <div className="font-bold text-sky-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Tier 2: Industrie &amp; Rechenzentren (88–94%)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong>Warema, Brose, BASF, Main-Post, rockenstein Rechenzentrum, Konecranes Noell.</strong> Riesige IT-Infrastruktur, Enterprise VMware/Cisco-Netzwerke, Top-Referenz im Lebenslauf.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3 rounded border border-indigo-900/40 space-y-1">
                  <div className="font-bold text-indigo-400 flex items-center gap-1">
                    <span>Tier 3: Handel &amp; Mittelstand (75–87%)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong>OBI, Hornbach, IKEA, Duttenhofer, Fränkische Rohrwerke, Knauf.</strong> Hoher IT-Bedarf im Filialbetrieb, Logistik-WLAN, ERP &amp; Kassensysteme. Dank 0 € Gehaltskosten für Betriebe lohnen sich Initiativbewerbungen extrem!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Firma, Ort (z.B. Karlstadt, Main-Post, Bosch) oder Technik suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400 whitespace-nowrap">Sortierung:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="ranking">Beste Empfehlungen (Tier 1 &amp; Match-Score zuerst)</option>
              <option value="distance">Kürzeste Entfernung zu Zellingen</option>
              <option value="name">Alphabetisch (A-Z)</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Tier / Güte:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Alle Tiers (1, 2 und 3)</option>
              <option value="1">Tier 1: Absolute Top-Favoriten (95-99%)</option>
              <option value="2">Tier 2: Industrie &amp; Groß-IT (85-94%)</option>
              <option value="3">Tier 3: Handel &amp; Mittelstand (75-84%)</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Distanz:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value={15}>Bis 15 km (Zellingen, Karlstadt, Greußenheim, Veitshöchheim)</option>
              <option value={20}>Bis 20 km (+ Würzburg Stadt)</option>
              <option value={30}>Bis 30 km (+ Lohr am Main, Marktheidenfeld, Gemünden)</option>
              <option value={50}>Bis 50 km (Erweitert)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Branche:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Strategy Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Strategie:</span>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="Alle">Alle Strategien</option>
              <option value="Versteckter Stellenmarkt (Initiativ-Fokus)">Versteckter Stellenmarkt (Initiativ-Geheimtipps)</option>
              <option value="Offizieller Ausbildungsbetrieb">Offizielle IHK-Ausbildungsbetriebe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List with Ranking Badges */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            Keine Betriebe gefunden, die den gewählten Filtern entsprechen.
          </div>
        ) : (
          filtered.map((company, index) => {
            const currentStatus = statusMap[company.id] || 'Offen';

            const dynamicDist = getCompanyDistance(company);

            return (
              <div
                key={company.id}
                className={`bg-slate-900/90 border rounded-xl p-5 hover:border-slate-700 transition flex flex-col md:flex-row justify-between gap-5 text-slate-200 ${
                  company.tier === 1 
                    ? 'border-emerald-900/60 shadow-sm' 
                    : company.tier === 2 
                    ? 'border-sky-900/50' 
                    : 'border-slate-800'
                }`}
              >
                {/* Main Info */}
                <div className="space-y-3 flex-1">
                  {/* Top Bar with Ranking Tier and Score */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tier badge */}
                    {company.tier === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tier 1 &bull; Match: {company.matchScore}%</span>
                      </span>
                    ) : company.tier === 2 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-950 border border-sky-700 text-sky-300 font-bold text-xs">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        <span>Tier 2 &bull; Match: {company.matchScore}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs">
                        <span>Tier 3 &bull; Match: {company.matchScore}%</span>
                      </span>
                    )}

                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs font-semibold text-slate-200">{company.city} ({company.postalCode})</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs text-sky-400/90 font-mono">
                      {dynamicDist === 0 ? '100% Remote' : `${dynamicDist} km von ${currentLocation?.name || 'Zellingen'}`}
                    </span>

                    <span className="text-slate-600">&bull;</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      company.strategy === 'Versteckter Stellenmarkt (Initiativ-Fokus)'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                        : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60'
                    }`}>
                      {company.strategy === 'Versteckter Stellenmarkt (Initiativ-Fokus)' ? 'Initiativ-Geheimtipp (Keine Anzeige nötig)' : 'IHK-Ausbildungsbetrieb'}
                    </span>
                  </div>

                  {/* Company Name */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{company.name}</span>
                    </h3>
                  </div>

                  {/* Ranking Reason Box */}
                  <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <strong className="text-sky-300">Warum dieses Ranking: </strong>
                    <span className="text-slate-300">{company.rankingReason}</span>
                  </div>

                  {/* Travel & Mobility notes */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      {company.category === 'Remote' ? (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{company.travelMode}</span>
                    </div>
                    {company.distanceKm > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>ca. {company.travelTimeMin} Min. Fahrzeit</span>
                      </div>
                    )}
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-300 font-sans">{company.category}</span>
                  </div>

                  {/* Tech Focus */}
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-medium">IT-Fokus: </span>
                    <span>{company.focus}</span>
                  </div>

                  {/* Contact & E-Mail Dispatch Tip */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span>{company.emailRecipient}</span>
                    </div>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400 text-[11px]">{company.contactTip}</span>
                  </div>
                </div>

                {/* Actions & Pipeline Status Sidebar */}
                <div className="flex flex-col justify-between items-start md:items-end gap-3 shrink-0 min-w-[220px] pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Status Selector */}
                  <div className="w-full space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block md:text-right">
                      Bewerbungs-Status
                    </span>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(company.id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none transition ${
                        currentStatus === 'Abgeschickt'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 font-bold'
                          : currentStatus === 'Im Gespräch'
                          ? 'bg-sky-950/50 text-sky-300 border-sky-800'
                          : currentStatus === 'Zusage erhalten'
                          ? 'bg-emerald-950 text-emerald-200 border-emerald-600'
                          : currentStatus === 'Gemerkt'
                          ? 'bg-indigo-950/50 text-indigo-300 border-indigo-800'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <option value="Offen">Offen / Noch nicht kontaktiert</option>
                      <option value="Gemerkt">Gemerkt für Bewerbung</option>
                      <option value="Abgeschickt">Bewerbung abgeschickt</option>
                      <option value="Im Gespräch">Im Gespräch / Rückmeldung</option>
                      <option value="Zusage erhalten">Zusage erhalten!</option>
                      <option value="Absage">Absage</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => onGenerateLetter(company)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Bewerbung vorbereiten &amp; abschicken</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5 w-full">
                      <a
                        href={`mailto:${company.emailRecipient}?subject=${encodeURIComponent(`Bewerbung betriebliche Praxisphase FISI 2027/2028 – COMCAVE – 97225 Zellingen`)}`}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                        title="E-Mail Client direkt öffnen"
                      >
                        <Mail className="w-3 h-3 text-sky-400" />
                        <span>Direkt-Mail</span>
                      </a>

                      <a
                        href={company.careerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                      >
                        <span>Karriere</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>

                    <a
                      href={`https://www.linkedin.com/search/results/people/?keywords=IT+Leiter+${encodeURIComponent(company.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 transition"
                      title="IT-Entscheider bei dieser Firma auf LinkedIn finden"
                    >
                      <Linkedin className="w-3 h-3 text-blue-400" />
                      <span>LinkedIn IT-Leiter suchen</span>
                      <ExternalLink className="w-2.5 h-2.5 text-blue-400/80" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
