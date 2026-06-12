import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { UAParser } from 'ua-parser-js';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CookiesConsent from './components/CookiesConsent';

// LAZY LOADING - Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Preview = lazy(() => import('./pages/Preview'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-900 border-r-4 border-r-transparent"></div>
  </div>
);

// Komponen 404
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
    <h1 className="text-9xl font-black text-slate-100 absolute z-0">404</h1>
    <div className="relative z-10">
      <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Halaman Tidak Ditemukan</h2>
      <a href="/" className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
        Kembali ke Beranda
      </a>
    </div>
  </div>
);

// ========== TRACKING VISITOR (HANYA 1 DATA PER SESSION) ==========
function useVisitorTracking() {
  const location = useLocation();
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [hasRecordedSession, setHasRecordedSession] = useState(false);
  
  useEffect(() => {
    // Cek cookies consent
    const checkConsent = () => {
      const consent = localStorage.getItem('cookies_consent');
      const enabled = consent === 'accepted';
      setTrackingEnabled(enabled);
    };
    
    checkConsent();
    
    window.addEventListener('cookiesAccepted', checkConsent);
    window.addEventListener('cookiesRejected', checkConsent);
    
    return () => {
      window.removeEventListener('cookiesAccepted', checkConsent);
      window.removeEventListener('cookiesRejected', checkConsent);
    };
  }, []);
  
  useEffect(() => {
    const recordSession = async () => {
      // Jangan track jika tidak ada consent
      if (!trackingEnabled) return;
      
      // Jangan track di halaman admin, preview, login, legal
      if (location.pathname.startsWith('/admin') || 
          location.pathname.startsWith('/preview') || 
          location.pathname === '/login' ||
          location.pathname === '/privacy-policy' ||
          location.pathname === '/terms') {
        return;
      }
      
      // CEK: Apakah sudah merekam session untuk session_id ini?
      if (hasRecordedSession) return;
      
      try {
        // Ambil atau buat session_id
        let sessionId = localStorage.getItem('visitor_session_id');
        let lastActive = localStorage.getItem('visitor_last_active');
        const now = Date.now();
        const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 menit
        
        let isNewSession = false;
        
        if (!sessionId || !lastActive || (now - parseInt(lastActive)) > SESSION_TIMEOUT) {
          // Session baru
          sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          isNewSession = true;
        }
        
        // Update last active
        localStorage.setItem('visitor_session_id', sessionId);
        localStorage.setItem('visitor_last_active', now.toString());
        
        // CEK: Apakah session ini sudah pernah tercatat di database?
        const { data: existingData } = await supabase
          .from('visitors')
          .select('id')
          .eq('session_id', sessionId)
          .limit(1);
        
        // HANYA rekam jika session BELUM pernah tercatat di database
        if (existingData && existingData.length > 0) {
          // Session sudah pernah tercatat, jangan rekam lagi
          setHasRecordedSession(true);
          return;
        }
        
        // Jika session baru, rekam ke database
        if (isNewSession || existingData.length === 0) {
          // Dapatkan sumber traffic (hanya untuk session baru)
          let source = 'direct';
          const urlParams = new URLSearchParams(window.location.search);
          const utmSource = urlParams.get('utm_source');
          const referrer = document.referrer;
          
          if (utmSource) {
            source = utmSource;
          } else if (referrer && referrer !== '') {
            if (referrer.includes('google')) source = 'google';
            else if (referrer.includes('facebook') || referrer.includes('instagram') || 
                     referrer.includes('twitter') || referrer.includes('tiktok') ||
                     referrer.includes('youtube')) source = 'social';
            else source = 'referral';
          }
          
          // Parse User Agent
          const userAgent = navigator.userAgent;
          const parser = new UAParser();
          parser.setUA(userAgent);
          const result = parser.getResult();
          
          // Deteksi perangkat
          let device = 'desktop';
          if (/(mobile|iphone|android)/i.test(userAgent)) device = 'mobile';
          else if (/(tablet|ipad)/i.test(userAgent)) device = 'tablet';
          
          // Detail perangkat
          const deviceBrand = result.device.vendor || 'Unknown';
          const deviceModel = result.device.model || 'Unknown';
          const browserName = result.browser.name || 'Unknown';
          const osName = result.os.name || 'Unknown';
          const osVersion = result.os.version || 'Unknown';
          
          // Simpan ke Supabase (HANYA SEKALI per session)
          await supabase.from('visitors').insert({
            session_id: sessionId,
            page: location.pathname || '/',
            source: source,
            device: device,
            device_brand: deviceBrand,
            device_model: deviceModel,
            browser_name: browserName,
            os_name: osName,
            os_version: osVersion,
            referrer: referrer || null,
            visited_at: new Date().toISOString()
          });
          
          setHasRecordedSession(true);
          console.log('Session recorded:', sessionId);
        }
        
      } catch (err) {
        console.error('Visitor tracking error:', err);
      }
    };
    
    // Jalankan record session setelah halaman stabil
    const timer = setTimeout(() => {
      recordSession();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location, trackingEnabled, hasRecordedSession]);
}

function AppContent() {
  const location = useLocation();
  const isPreviewPage = location.pathname.startsWith('/preview/');
  
  useVisitorTracking();

  return (
    <>
      {!isPreviewPage && <Navbar />}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/preview/:slug" element={<Preview />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookiesConsent />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}