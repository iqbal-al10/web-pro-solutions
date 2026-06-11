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

// ========== TRACKING VISITOR ==========
function useVisitorTracking() {
  const location = useLocation();
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  
  useEffect(() => {
    // Cek cookies consent
    const checkConsent = () => {
      const consent = localStorage.getItem('cookies_consent');
      const enabled = consent === 'accepted';
      setTrackingEnabled(enabled);
    };
    
    checkConsent();
    
    // Listen untuk perubahan consent
    window.addEventListener('cookiesAccepted', checkConsent);
    window.addEventListener('cookiesRejected', checkConsent);
    
    return () => {
      window.removeEventListener('cookiesAccepted', checkConsent);
      window.removeEventListener('cookiesRejected', checkConsent);
    };
  }, []);
  
  useEffect(() => {
    const trackPageView = async () => {
      // Jangan track jika tidak ada consent
      if (!trackingEnabled) return;
      
      // Jangan track di halaman admin dan preview
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/preview') || location.pathname === '/login') {
        return;
      }
      
      // Jangan track di halaman legal
      if (location.pathname === '/privacy-policy' || location.pathname === '/terms') {
        return;
      }
      
      try {
        // Ambil atau buat session_id
        let sessionId = localStorage.getItem('visitor_session_id');
        let lastActive = localStorage.getItem('visitor_last_active');
        const now = Date.now();
        const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 menit
        
        if (!sessionId || !lastActive || (now - parseInt(lastActive)) > SESSION_TIMEOUT) {
          sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          localStorage.setItem('visitor_session_id', sessionId);
        }
        
        // Update last active
        localStorage.setItem('visitor_last_active', now.toString());
        
        // Dapatkan sumber traffic
        let source = 'direct';
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const referrer = document.referrer;
        
        // Cek apakah ini kunjungan pertama dalam session
        const { data: existingData } = await supabase
          .from('visitors')
          .select('id')
          .eq('session_id', sessionId)
          .limit(1);
          
        let finalSource = source;
        let referrerValue = null;
        
        if (existingData && existingData.length === 0) {
          if (utmSource) {
            finalSource = utmSource;
          } else if (referrer && referrer !== '') {
            if (referrer.includes('google')) finalSource = 'google';
            else if (referrer.includes('facebook') || referrer.includes('instagram') || 
                     referrer.includes('twitter') || referrer.includes('tiktok') ||
                     referrer.includes('youtube')) finalSource = 'social';
            else finalSource = 'referral';
            referrerValue = referrer;
          }
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
        
        // Simpan ke Supabase
        await supabase.from('visitors').insert({
          session_id: sessionId,
          page: location.pathname || '/',
          source: finalSource,
          device: device,
          device_brand: deviceBrand,
          device_model: deviceModel,
          browser_name: browserName,
          os_name: osName,
          os_version: osVersion,
          referrer: referrerValue,
          visited_at: new Date().toISOString()
        });
        
      } catch (err) {
        console.error('Visitor tracking error:', err);
      }
    };
    
    // Delay sedikit agar tidak mengganggu loading halaman
    const timer = setTimeout(() => {
      trackPageView();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location, trackingEnabled]);
}

function AppContent() {
  const location = useLocation();
  const isPreviewPage = location.pathname.startsWith('/preview/');
  
  // Aktifkan tracking visitor
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