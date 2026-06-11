import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddTestimonial({ t }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: ''
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showModal = (type, title, message) => {
    setModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', title: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.comment.length < 10) {
      showModal('error', 'Ulasan Terlalu Pendek', 'Ulasan minimal 10 karakter. Silakan tulis ulasan yang lebih lengkap.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('testimonials')
        .insert([{ ...formData, is_approved: false }]);

      if (error) throw error;

      showModal('success', 'Terima Kasih!', 'Ulasan Anda berhasil dikirim dan akan tampil setelah disetujui oleh admin kami.');
      setFormData({ name: '', role: '', rating: 5, comment: '' });
    } catch (error) {
      showModal('error', 'Gagal Mengirim', 'Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl h-full flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/10 blur-3xl rounded-full"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-4 text-center">{t.addTestimonial.title}</h3>
          
          <input 
            placeholder={t.addTestimonial.name} required
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500 transition"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          />
          
          <input 
            placeholder={t.addTestimonial.role} required
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500 transition"
            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
          />
          
          <select 
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-sm outline-none focus:border-blue-500 transition"
            value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
          >
            <option value="5" className="bg-slate-800">{t.addTestimonial.rating5}</option>
            <option value="4" className="bg-slate-800">{t.addTestimonial.rating4}</option>
            <option value="3" className="bg-slate-800">{t.addTestimonial.rating3}</option>
            <option value="2" className="bg-slate-800">{t.addTestimonial.rating2}</option>
            <option value="1" className="bg-slate-800">{t.addTestimonial.rating1}</option>
          </select>

          <textarea 
            placeholder={t.addTestimonial.comment} required
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm h-24 resize-none outline-none focus:border-blue-500 transition"
            value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})}
          />
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-900 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? t.addTestimonial.submitting : t.addTestimonial.submit}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  modal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {modal.type === 'success' ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {modal.title}
                </h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  {modal.message}
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeModal}
                  className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all ${
                    modal.type === 'success'
                      ? 'bg-blue-900 text-white hover:bg-slate-900'
                      : 'bg-red-900 text-white hover:bg-red-800'
                  }`}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}