import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Orbit, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, authStatus, authError, setCurrentView } = useMissionStore();

  const [missionId, setMissionId] = useState('');
  const [credential, setCredential] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showQuickAuth, setShowQuickAuth] = useState(false);

  // Sync theme with document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionId.trim() || !credential.trim()) {
      setErrorMessage('Please enter both Mission ID and Secure Credential.');
      setLocalStatus('ERROR');
      return;
    }

    setLocalStatus('LOADING');
    setErrorMessage(null);

    const res = await login(missionId, credential, rememberDevice);

    if (res.success) {
      setLocalStatus('SUCCESS');
      // Navigation is handled inside store login method
    } else {
      setLocalStatus('ERROR');
      setErrorMessage(res.error || 'Unable to authenticate. Please verify your mission credentials.');
    }
  };

  const fillQuickCredential = (id: string, pass: string) => {
    setMissionId(id);
    setCredential(pass);
    setErrorMessage(null);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 select-none ${
      isDarkMode ? 'bg-[#060B19] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Header / Navigation Bar */}
      <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors ${
        isDarkMode ? 'border-slate-800/80 bg-[#081026]/90' : 'border-slate-200 bg-white/90'
      } backdrop-blur-md sticky top-0 z-20`}>
        
        {/* Left: Branding */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Public Overview"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Orbit className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide">VYOM DRISHTI AI</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                On-board Experiment Assistant
              </span>
            </div>
            <p className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bharatiya Antariksh Station (BAS) & Gaganyaan
            </p>
          </div>
        </div>

        {/* Right: Controls & Theme Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-750' 
                : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Home</span>
          </button>

          <button
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-2 rounded-xl border transition ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/70 text-slate-300 hover:text-amber-400 hover:border-slate-600' 
                : 'border-slate-300 bg-white text-slate-600 hover:text-blue-600 hover:border-slate-400'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        
        {/* Subtle Background Radial Depth */}
        <div className={`absolute inset-0 pointer-events-none ${
          isDarkMode 
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/25 via-transparent to-transparent' 
            : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent'
        }`} />

        <div className="w-full max-w-md relative z-10 space-y-6 my-auto">
          
          {/* Card Surface */}
          <div className={`rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
            isDarkMode 
              ? 'bg-[#0B132B]/95 border-slate-800/90 shadow-black/40' 
              : 'bg-white border-slate-200/80 shadow-slate-300/40'
          }`}>
            
            {/* Heading & Shield Icon */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 mb-1">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold tracking-wide uppercase">
                SECURE MISSION ACCESS
              </h1>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Authorized access for astronauts, experiment operators and scientific personnel.
              </p>
            </div>

            {/* Error / Alert Feedback Banner */}
            {(errorMessage || authError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">
                  <span className="font-semibold block mb-0.5">Authentication Notice</span>
                  <span>{errorMessage || authError}</span>
                </div>
              </div>
            )}

            {/* Success Feedback Banner */}
            {localStatus === 'SUCCESS' && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">✓ Authentication successful. Redirecting to Mission Dashboard...</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Mission ID Field */}
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Government / Mission ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={missionId}
                    onChange={(e) => setMissionId(e.target.value)}
                    placeholder="Enter secure ID (e.g. AST-042)"
                    disabled={localStatus === 'LOADING' || localStatus === 'SUCCESS'}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border transition outline-none ${
                      isDarkMode 
                        ? 'bg-slate-900/80 border-slate-750 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Secure Credential Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Secure Credential
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Enter password / passkey"
                    disabled={localStatus === 'LOADING' || localStatus === 'SUCCESS'}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-mono border transition outline-none ${
                      isDarkMode 
                        ? 'bg-slate-900/80 border-slate-750 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember device toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    Remember this workstation
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={localStatus === 'LOADING' || localStatus === 'SUCCESS'}
                className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition transform active:scale-[0.99] mt-2 ${
                  localStatus === 'LOADING'
                    ? 'bg-blue-700 text-blue-200 cursor-wait'
                    : localStatus === 'SUCCESS'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                }`}
              >
                {localStatus === 'LOADING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating mission credentials...</span>
                  </>
                ) : localStatus === 'SUCCESS' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>SECURE LOGIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Profiles Collapsible (For Review / Evaluator Ease) */}
            <div className="mt-5 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowQuickAuth(!showQuickAuth)}
                className={`w-full flex items-center justify-between text-[11px] font-medium transition ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Authorized Mission Test Profiles</span>
                </span>
                <span className="text-[10px] underline">{showQuickAuth ? 'Hide' : 'Show Profiles'}</span>
              </button>

              {showQuickAuth && (
                <div className={`mt-2.5 p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div 
                    onClick={() => fillQuickCredential('AST-042', 'Gaganyaan@2026')}
                    className="p-1.5 rounded-lg hover:bg-blue-600/15 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-blue-400">Astronaut A. Bhardwaj</span>
                      <span className="block text-[10px] text-slate-400">ID: AST-042 • Pass: Gaganyaan@2026</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Autofill</span>
                  </div>

                  <div 
                    onClick={() => fillQuickCredential('SCI-108', 'Mission@BAS1')}
                    className="p-1.5 rounded-lg hover:bg-indigo-600/15 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-indigo-400">Flight Scientist Dr. S. Sharma</span>
                      <span className="block text-[10px] text-slate-400">ID: SCI-108 • Pass: Mission@BAS1</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Autofill</span>
                  </div>

                  <div 
                    onClick={() => fillQuickCredential('OPS-204', 'Isro@Secure2026')}
                    className="p-1.5 rounded-lg hover:bg-emerald-600/15 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-emerald-400">Payload Operator R. Verma</span>
                      <span className="block text-[10px] text-slate-400">ID: OPS-204 • Pass: Isro@Secure2026</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Autofill</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Protected Mission Environment Badges */}
          <div className="text-center space-y-2">
            <div className={`text-[11px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Protected Mission Environment
            </div>
            <div className={`flex flex-wrap items-center justify-center gap-3 text-[11px] ${
              isDarkMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Secure Authentication</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Confidential Experiment Data</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Authorized Personnel Only</span>
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`px-6 py-3 border-t text-[11px] text-center transition-colors ${
        isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        VYOM DRISHTI AI • Bharatiya Antariksh Station On-Board Perception • SIH 2026 PS #26174
      </footer>

    </div>
  );
};
