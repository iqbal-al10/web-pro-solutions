import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioFilter from '../components/PortfolioFilter';
import PriceCalculator from '../components/PriceCalculator';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import AddTestimonial from '../components/AddTestimonial';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// FAQ Component dengan terjemahan dari JSON
const FAQ = ({ id, t }) => {
  const [active, setActive] = useState(null);
  const faqItems = t.faq?.items || [
    { q: "Berapa lama pengerjaan website?", a: "Untuk Landing Page rata-rata 2-3 hari pengerjaan setelah data lengkap kami terima." },
    { q: "Apakah website sudah termasuk Hosting dan Domain?", a: "Ya, paket kami sudah termasuk setup hosting dan domain (.com/.id) selama 1 tahun pertama." },
    { q: "Bagaimana jika saya belum punya konten/tulisan?", a: "Jangan khawatir, tim kami akan membantu menyusun copywriting yang persuasif berdasarkan profil bisnis Anda." },
    { q: "Apakah website-nya bisa dibuka dengan lancar di HP?", a: "Tentu. Semua website yang kami buat bersifat Responsive, artinya tampilan akan menyesuaikan secara otomatis baik di HP, tablet, maupun laptop." },
    { q: "Bisa bantu kelola website setelah jadi?", a: "Bisa. Kami menyediakan layanan maintenance bulanan jika Anda memerlukan bantuan untuk update konten atau pemantauan performa." },
    { q: "Apakah saya bisa melakukan revisi?", a: "Tentu, kami menjamin kepuasan klien dengan adanya jaminan revisi sampai website benar-benar siap sesuai kesepakatan awal." },
    { q: "Bagaimana sistem pembayarannya?", a: "Pembayaran dilakukan dengan DP 50% di awal, dan pelunasan 50% setelah website selesai dan siap dipublikasikan." },
    { q: "Apakah ada garansi setelah website selesai?", a: "Ya, kami memberikan garansi 3 bulan untuk perbaikan bug dan maintenance ringan setelah website live." }
  ];

  return (
    <div id={id} className="max-w-4xl mx-auto py-32 px-6 font-['Poppins']">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{t.faq?.title || "Frequently Asked Questions"}</h3>
      </div>
      <div className="space-y-4">
        {faqItems.map((item, i) => (
          <div key={i} className="border border-slate-100 rounded-[2.5rem] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => setActive(active === i ? null : i)}
              className="w-full p-8 text-left font-bold flex justify-between items-center hover:bg-slate-50 outline-none"
            >
              <span className={`leading-snug transition-colors ${active === i ? 'text-blue-900' : 'text-slate-800'}`}>{item.q}</span>
              <span className={`text-blue-900 transition-transform duration-500 flex-shrink-0 ml-4 ${active === i ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-8 pb-8 text-slate-500 text-sm italic leading-relaxed overflow-hidden"
                >
                  <div className="pt-2 border-t border-slate-50">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('portfolios').select('*');
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter + Sort menggunakan useMemo
  const displayProjects = useMemo(() => {
    let result = [...projects];

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest')     return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest')     return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'price-high') return (b.base_price || 0) - (a.base_price || 0);
      if (sortBy === 'price-low')  return (a.base_price || 0) - (b.base_price || 0);
      if (sortBy === 'alpha-az')   return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'alpha-za')   return (b.title || '').localeCompare(a.title || '');
      return 0;
    });

    return result;
  }, [projects, activeCategory, sortBy, searchTerm]);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Helmet>
        <title>Web Pro Solutions | Jasa Pembuatan Website Profesional</title>
        <meta name="description" content="Web Pro Solutions - Digital Agency menyediakan jasa pembuatan website profesional untuk Corporate, E-Commerce, Landing Page, dan Portfolio. Konsultasi gratis!" />
        <meta name="keywords" content="jasa pembuatan website, web developer, website corporate, website e-commerce, landing page, portfolio website" />
        <link rel="canonical" href="https://webprosolutions.com/" />
      </Helmet>

      <Hero t={t} />
      <Navbar />

      {/* CATALOG SECTION */}
      <div id="catalog" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-blue-900 uppercase tracking-[0.5em] mb-4"
          >
            {t.catalog.badge}
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic"
          >
            {t.catalog.title}
          </motion.h3>
        </div>

        <PortfolioFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          t={t}
        />

        {loading ? (
          <div className="flex justify-center py-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-t-4 border-blue-900 border-r-4 border-r-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {displayProjects.length === 0 && (searchTerm || activeCategory !== 'All') && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                  {t.catalog.emptyTitle}
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  {t.catalog.emptyDesc}
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchTerm('');
                    setSortBy('newest');
                  }}
                  className="mt-6 px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-900 transition"
                  aria-label="Reset semua filter pencarian"
                >
                  {t.catalog.emptyBtn}
                </button>
              </div>
            )}
            
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {displayProjects.length > 0 ? (
                  displayProjects.map((p) => (
                    <PortfolioCard key={p.id} project={p} t={t} />
                  ))
                ) : (
                  !(searchTerm || activeCategory !== 'All') && (
                    <PortfolioCard project={null} key="empty-state" t={t} />
                  )
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* PRICING SECTION */}
      <div id="pricing" className="bg-slate-50 py-32 border-y border-slate-100/50">
        <div className="max-w-4xl mx-auto px-6">
          <PriceCalculator t={t} />
        </div>
      </div>

      {/* TESTIMONIALS SECTION */}
      <div id="testimonials-section" className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-8 bg-slate-50/50 p-10 md:p-16 rounded-[3.5rem] border border-slate-100 flex flex-col justify-center">
            <Testimonials t={t} />
          </div>
          <div className="lg:col-span-4">
            <AddTestimonial t={t} />
          </div>
        </div>
      </div>

      <FAQ id="faq" t={t} />

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div>
              <h4 className="font-extrabold text-2xl tracking-tighter mb-4 italic">
                WEB PRO <span className="text-blue-400">SOLUTIONS</span>
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Solusi website profesional untuk bisnis Anda. Ciptakan ekosistem digital premium dengan desain modern dan fitur lengkap.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-black text-sm uppercase tracking-wider mb-4">Tautan Cepat</h5>
              <ul className="space-y-2">
                <li><a href="#catalog" className="text-slate-400 hover:text-white transition text-sm">Katalog</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition text-sm">Harga</a></li>
                <li><a href="#testimonials-section" className="text-slate-400 hover:text-white transition text-sm">Testimonial</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-white transition text-sm">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-black text-sm uppercase tracking-wider mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-slate-400 hover:text-white transition text-sm">Privacy Policy</a></li>
                <li><a href="/terms" className="text-slate-400 hover:text-white transition text-sm">Terms of Service</a></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="font-black text-sm uppercase tracking-wider mb-4">Ikuti Kami</h5>
              <div className="flex gap-4">
                <a href="https://instagram.com/iqbal_alh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85 0 3.205-.012 3.585-.069 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.645-.07-4.85 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="https://github.com/iqbal-al10" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
                <a href="https://wa.me/6285710379820" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-all">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.596 2.081.914 3.15.915h.003c3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.767-5.766-5.767zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.068-.552-.174-1.044-.478-1.822-.956-.091-.056-.18-.115-.265-.177-.564-.406-.99-.797-1.274-1.192-.302-.423-.548-.888-.722-1.375-.176-.494-.224-.926-.148-1.285.076-.358.233-.642.466-.845.21-.182.437-.275.655-.275.103 0 .192.015.273.044.156.055.305.164.414.312.249.336.447.918.626 1.384.048.125.084.255.108.372.054.264.014.525-.109.729-.093.153-.21.27-.302.36-.056.054-.107.104-.154.15l-.062.058c-.139.131-.284.268-.109.526.176.258.423.517.738.809.512.474.988.688 1.266.798.12.047.202.079.256.099.156.057.328.039.444-.054.082-.066.143-.157.179-.257.054-.15.033-.316-.019-.447l-.205-.521c-.067-.17-.068-.313.04-.464.108-.152.276-.27.494-.359.444-.182.772-.282.96-.343.066-.021.118-.039.156-.057.092-.044.125-.092.132-.158.015-.143-.099-.395-.253-.657-.144-.246-.317-.526-.454-.699-.079-.1-.157-.194-.226-.274-.191-.22-.398-.437-.573-.629-.195-.213-.435-.455-.608-.597-.077-.064-.14-.117-.192-.158-.258-.203-.483-.346-.678-.44-.124-.06-.227-.107-.31-.142-.067-.028-.13-.05-.189-.06-.117-.02-.256-.012-.395.036-.155.053-.34.183-.464.347l-.064.085c-.206.274-.313.576-.313.877 0 .192.027.37.08.536.043.135.106.271.185.41.15.265.35.521.55.776l.114.148c.198.256.393.51.53.772.136.261.215.502.215.727 0 .125-.014.243-.041.353l-.014.053z"/>
                  </svg>
                </a>
              </div>
              <p className="text-slate-400 text-xs mt-4">
                WhatsApp: <a href="https://wa.me/6285710379820" className="hover:text-white">0857-1037-9820</a>
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
              © 2026 Crafted with Perfection • Mojokerto, Indonesia
            </p>
          </div>
        </div>
      </footer>
      
      {/* CHAT BOT */}
      <ChatBot />
    </div>
  );
}