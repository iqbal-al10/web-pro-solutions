import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preview() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error('Error:', error.message);
        // Jika gagal load, coba tutup tab atau kembali ke home
        if (window.opener) window.close(); else navigate('/');
      } finally {
        setLoading(false);
      }
    };
    getProject();
  }, [slug, navigate]);

  const handleClose = () => {
    // Karena dibuka via _blank di PortfolioCard, kita gunakan window.close
    if (window.opener) {
      window.close();
    } else {
      navigate('/');
    }
  };

  const handleOrderWhatsApp = () => {
    const phoneNumber = "6285710379820";
    const message = `Halo Web Pro Solutions, saya ingin memesan template ini setelah melihat Live Preview:%0A%0A` +
                    `*Judul:* ${project.title}%0A` +
                    `*Slug:* ${project.slug}%0A%0A` +
                    `Mohon info pengerjaan selanjutnya.`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-['Poppins'] z-[999999]">
      <Helmet>
        <title>Live Preview: {project.title} | Web Pro Solutions</title>
      </Helmet>

      {/* TRIGGER FLOATING - Tombol untuk memunculkan kembali Menu */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000001]">
        <AnimatePresence>
          {!showNavbar && (
            <motion.button 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              onClick={() => setShowNavbar(true)}
              className="bg-slate-950 text-white px-7 py-1 rounded-b-[5rem] border-x border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-3 group active:scale-95 transition-all"
            >
              <svg 
                className="animate-bounce text-white"
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* DROPDOWN TOOLBAR */}
      <AnimatePresence>
        {showNavbar && (
          <motion.div 
            initial={{ y: -120 }}
            animate={{ y: 0 }}
            exit={{ y: -120 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed top-0 left-0 w-full h-20 bg-slate-950/95 backdrop-blur-2xl px-8 border-b border-white/10 flex justify-between items-center z-[1000002]"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setShowNavbar(false)} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all group"
              >
                <svg className="group-hover:-translate-y-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <div>
                <h1 className="text-white font-black text-sm uppercase tracking-widest leading-none">{project.title}</h1>
                <p className="text-blue-600 text-[9px] font-bold uppercase tracking-[0.4em] mt-2">Live Demo Mode</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Close Preview
              </button>
              <button 
                onClick={handleOrderWhatsApp}
                className="bg-blue-900 border-2 border-blue-900 hover:text-blue-600 hover:bg-transparent hover:border-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_15px_30px_-5px_rgba(37,99,235,0.2)] active:scale-95"
              >
                Buy This Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN IFRAME CONTROLLER */}
      <div className="absolute inset-0 w-full h-full pt-0 z-0">
        <iframe 
          src={project.preview_url} 
          className="w-full h-full border-none"
          title={`Preview ${project.title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}