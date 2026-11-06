import React, { useState, useEffect } from 'react';
import { PromptConfig, defaultPromptConfig, UserProfileData } from './data/promptTemplate';
import { CompanyEntry } from './data/curatedCompanies';
import { LocationPreset, locationPresets } from './data/locations';
import { PromptViewer } from './components/PromptViewer';
import { CompanyRadar } from './components/CompanyRadar';
import { AiSearchTab } from './components/AiSearchTab';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';
import { AutomationGuide } from './components/AutomationGuide';
import { AssistantChat } from './components/AssistantChat';
import { ResumeManager } from './components/ResumeManager';
import { LocationSwitcherModal } from './components/LocationSwitcherModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import { MobileAppGuide } from './components/MobileAppGuide';
import { LinkedInManager } from './components/LinkedInManager';
import { 
  FileCode2, 
  Radar, 
  Search, 
  FileText, 
  Clock, 
  MessageSquare, 
  MapPin, 
  CheckCircle2, 
  Train, 
  ExternalLink,
  Sparkles,
  UserCheck,
  Bell,
  BellRing,
  Smartphone,
  Monitor,
  Send,
  Navigation,
  Sliders,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  DownloadCloud,
  Linkedin
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'letter' | 'linkedin' | 'location' | 'push' | 'apk' | 'resume' | 'prompt' | 'guide' | 'chat'>('radar');
  
  // Location & Radius State
  const [currentLocation, setCurrentLocation] = useState<LocationPreset>(locationPresets[0]); // Zellingen (97225)
  const [currentRadius, setCurrentRadius] = useState<number>(30);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  
  // Viewport toggle: on desktop, allow switching between simulated phone frame and desktop wide
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: '',
    street: '',
    postalCode: '97225',
    city: 'Zellingen',
    phone: '',
    email: '',
    location: '97225 Zellingen',
    previousJobs: [],
    itSkills: ['Windows Server & Active Directory', 'Netzwerktechnik (TCP/IP, VLAN, DHCP/DNS)', 'Linux Grundlagen', 'Hardware-Troubleshooting'],
    certifications: ['Führerschein Klasse B', 'COMCAVE Umschulung FISI (in Ausbildung)'],
    transferableStrengths: ['Strukturierte Arbeitsweise', 'Lösungsorientiertes Denken', 'Hohe Zuverlässigkeit'],
    summary: '',
  });

  const [config, setConfig] = useState<PromptConfig>({
    ...defaultPromptConfig,
    radiusKm: currentRadius,
    location: `${currentLocation.postalCode} ${currentLocation.name} (Bayern)`,
    userProfile,
  });

  const [selectedCompanyForLetter, setSelectedCompanyForLetter] = useState<CompanyEntry | null>(null);

  // Load saved profile & location on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('fisi_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
      }

      const savedLoc = localStorage.getItem('fisi_current_location');
      if (savedLoc) {
        const parsedLoc = JSON.parse(savedLoc);
        setCurrentLocation(parsedLoc);
      }

      const savedRad = localStorage.getItem('fisi_current_radius');
      if (savedRad) {
        setCurrentRadius(parseInt(savedRad, 10));
      }

      const pushPref = localStorage.getItem('fisi_push_enabled');
      if (pushPref === 'true' && 'Notification' in window && Notification.permission === 'granted') {
        setIsPushEnabled(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdateProfile = (newProfile: UserProfileData) => {
    setUserProfile(newProfile);
    setConfig(prev => ({
      ...prev,
      userProfile: newProfile,
    }));
    try {
      localStorage.setItem('fisi_user_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectLocation = (loc: LocationPreset) => {
    setCurrentLocation(loc);
    setConfig(prev => ({
      ...prev,
      location: `${loc.postalCode} ${loc.name} (Bayern)`,
    }));
    try {
      localStorage.setItem('fisi_current_location', JSON.stringify(loc));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRadius = (radius: number) => {
    setCurrentRadius(radius);
    setConfig(prev => ({
      ...prev,
      radiusKm: radius,
    }));
    try {
      localStorage.setItem('fisi_current_radius', radius.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateLetter = (company: CompanyEntry) => {
    setSelectedCompanyForLetter(company);
    setActiveTab('letter');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500/30">
      {/* Top Device Bar (Mobile App Header) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* App Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-xs shadow-inner">
                FISI
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-white tracking-tight">
                    Praktikum-Radar
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live &amp; Online" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span>COMCAVE FISI 2027/28</span>
                </div>
              </div>
            </div>

            {/* Center: Standort Switcher Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 border border-sky-500/40 hover:border-sky-400 text-sky-300 transition text-xs font-medium shadow-sm"
              title="Klicke hier, um den Standort zu wechseln"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-100">{currentLocation.name}</span>
              <span className="text-[11px] text-sky-400 font-mono">
                {currentRadius === 0 ? 'Remote' : `±${currentRadius}km`}
              </span>
              <span className="text-[10px] text-sky-400/80">▾</span>
            </button>

            {/* Right: Push Bell, APK Button & Viewport Mode */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick APK & Handy App Button */}
              <button
                onClick={() => setActiveTab('apk')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'apk'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                }`}
                title="Handy App &amp; APK Installer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">APK &amp; App</span>
              </button>

              <button
                onClick={() => setActiveTab('push')}
                className={`p-2 rounded-lg border transition relative ${
                  activeTab === 'push' || isPushEnabled
                    ? 'bg-sky-950/80 border-sky-500/60 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Push-Benachrichtigungen"
              >
                <Bell className="w-4 h-4" />
                {isPushEnabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* Desktop vs Phone Viewport Toggle on Large Screens */}
              <button
                onClick={() => setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile')}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition"
                title={viewMode === 'mobile' ? 'Zur Vollbild-Ansicht' : 'Zur Handy-Ansicht'}
              >
                {viewMode === 'mobile' ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-sky-400" />
                    <span>Desktop</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    <span>Handy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Supports Simulated Smartphone Bezel on Desktop if toggled */}
      <div className={`flex-1 w-full mx-auto ${
        viewMode === 'mobile'
          ? 'max-w-md my-4 border border-slate-800 rounded-3xl shadow-2xl bg-slate-950 overflow-hidden relative'
          : 'max-w-5xl'
      }`}>
        {/* Quick Action Navigation Strip */}
        <div className="px-3 sm:px-6 pt-3 pb-1 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pb-1">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Firmen-Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('letter')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'letter'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Anschreiben</span>
            </button>

            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'linkedin'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/40 border border-blue-500/30'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => setActiveTab('location')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'location'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Standortswitch</span>
            </button>

            <button
              onClick={() => setActiveTab('push')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'push'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Push-Alarm</span>
            </button>

            <button
              onClick={() => setActiveTab('apk')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'apk'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-500/30'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK &amp; Handy-App</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'resume'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mein Profil</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Auto-Pilot &amp; SMTP</span>
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'prompt'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Such-Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Berater</span>
            </button>
          </div>
        </div>

        {/* App Content */}
        <main className="px-3 sm:px-6 py-4 pb-24">
          {/* Tab 1: Radar */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <CompanyRadar 
                onGenerateLetter={handleGenerateLetter}
                currentLocation={currentLocation}
                currentRadius={currentRadius}
                onOpenLocationModal={() => setShowLocationModal(true)}
              />
            </div>
          )}

          {/* Tab 2: Letter / Bewerben */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <CoverLetterGenerator
                initialCompany={selectedCompanyForLetter}
                userProfile={userProfile}
                onUpdateUserProfile={handleUpdateProfile}
              />
            </div>
          )}

          {/* Tab: LinkedIn Profil-Zentrale & Outreach */}
          {activeTab === 'linkedin' && (
            <LinkedInManager
              userProfile={userProfile}
              onUpdateUserProfile={handleUpdateProfile}
              onNavigateToLetter={() => setActiveTab('letter')}
            />
          )}

          {/* Tab 3: Standort Switcher & Radius */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Standort &amp; Suchradius anpassen</h2>
                    <p className="text-xs text-slate-400">
                      Aktuell aktiv: <strong>{currentLocation.name} ({currentLocation.postalCode})</strong> &bull; max. {currentRadius} km
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLocationModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Standort jetzt wechseln (Zellingen, Würzburg, Karlstadt, Lohr...)</span>
                </button>
              </div>

              {/* Radius Quick Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span>Suchumkreis wählen:</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-sky-400">
                    {currentRadius === 0 ? 'Nur Remote' : `${currentRadius} km`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[10, 20, 30, 50].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleUpdateRadius(r)}
                      className={`py-2 rounded-xl font-bold transition border ${
                        currentRadius === r
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Predefined Presets list directly accessible */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Schnellauswahl Standorte Main-Spessart &amp; Würzburg
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {locationPresets.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        currentLocation.id === loc.id
                          ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>{loc.name} ({loc.postalCode})</span>
                          {loc.id === 'zellingen' && (
                            <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              Heimatort
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{loc.tag}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Push Notification Manager */}
          {activeTab === 'push' && (
            <PushNotificationManager />
          )}

          {/* Tab: APK & Handy-App Guide */}
          {activeTab === 'apk' && (
            <MobileAppGuide />
          )}

          {/* Tab 5: Resume / Profil */}
          {activeTab === 'resume' && (
            <ResumeManager
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateToPrompt={() => setActiveTab('prompt')}
              onNavigateToLetter={() => setActiveTab('letter')}
            />
          )}

          {/* Tab 6: Prompt & Live Search */}
          {activeTab === 'prompt' && (
            <PromptViewer
              config={config}
              onUpdateConfig={setConfig}
              onSelectCompanyForLetter={(name, loc) => {
                setSelectedCompanyForLetter({
                  id: 'custom',
                  name,
                  city: loc,
                  postalCode: '',
                  distanceKm: 0,
                  travelTimeMin: 0,
                  travelMode: '',
                  category: 'Systemhaus',
                  strategy: 'Versteckter Stellenmarkt (Initiativ-Fokus)',
                  tier: 2,
                  matchScore: 85,
                  rankingReason: 'Individuell recherchierter Betrieb',
                  emailRecipient: 'personal@betrieb.de',
                  submissionType: 'email',
                  focus: 'IT-Infrastruktur',
                  isIhkTrainer: true,
                  comcaveFit: 'Initiativkontakt',
                  careerUrl: '',
                  contactTip: '',
                  address: loc,
                });
                setActiveTab('letter');
              }}
            />
          )}

          {/* Tab 7: Auto-Pilot Guide & SMTP Auto-Mailer */}
          {activeTab === 'guide' && (
            <AutomationGuide />
          )}

          {/* Tab 8: Chat Berater */}
          {activeTab === 'chat' && (
            <AssistantChat />
          )}
        </main>

        {/* Bottom Thumb-Navigation Bar (Native Mobile App Navigation) */}
        <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 shadow-lg">
          <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5 text-[9px] font-medium">
            {/* 1. Radar */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                activeTab === 'radar'
                  ? 'text-sky-400 font-bold bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radar className="w-4 h-4 mb-0.5" />
              <span>Radar</span>
            </button>

            {/* 2. Bewerben */}
            <button
              onClick={() => setActiveTab('letter')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
                activeTab === 'letter'
                  ? 'text-sky-400 font-bold bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span>Bewerben</span>
              {selectedCompanyForLetter && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute top-1 right-2" />
              )}
            </button>

            {/* 3. LinkedIn */}
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
                activeTab === 'linkedin'
                  ? 'text-blue-400 font-bold bg-blue-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Linkedin className="w-4 h-4 mb-0.5 text-blue-400" />
              <span>LinkedIn</span>
            </button>

            {/* 4. Standort */}
            <button
              onClick={() => setActiveTab('location')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                activeTab === 'location'
                  ? 'text-sky-400 font-bold bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4 mb-0.5 text-amber-400" />
              <span>Standort</span>
            </button>

            {/* 5. Push Alarm */}
            <button
              onClick={() => setActiveTab('push')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
                activeTab === 'push'
                  ? 'text-sky-400 font-bold bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4 mb-0.5" />
              <span>Push</span>
              {isPushEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-2" />
              )}
            </button>

            {/* 6. Profil */}
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                activeTab === 'resume'
                  ? 'text-sky-400 font-bold bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 mb-0.5" />
              <span>Profil</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Location Switcher Modal */}
      {showLocationModal && (
        <LocationSwitcherModal
          currentLocation={currentLocation}
          currentRadius={currentRadius}
          onSelectLocation={handleSelectLocation}
          onUpdateRadius={handleUpdateRadius}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}
