import { motion } from "framer-motion";
import { supabase } from "../services/supabaseClient";
import { useState } from "react";

export default function PortfolioCard({ project, t }) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal untuk validasi error
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: ""
  });

  const MASTER_STANDARD_FEATURES = [
    "Responsive & Adaptive Design",
    "SSL Security Certificate",
    "Performance Optimization",
    "Basic CMS Management",
    "Contact Form Integration",
    "Basic SEO Optimization",
    "Premium UI/UX Design"
  ];

  const showErrorModal = (message) => {
    setErrorModal({ isOpen: true, message });
  };

  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: "" });
  };

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 min-h-[400px] font-['Poppins'] shadow-inner"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 p-6 rounded-3xl bg-blue-50 text-blue-900/30 border border-blue-100/50"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
          </svg>
        </motion.div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">{t.catalog.emptyTitle}</h3>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed italic font-medium">{t.catalog.emptyDesc}</p>
      </motion.div>
    );
  }

  const handleOpenModal = () => {
    setOrderForm({ name: "", phone: "", notes: "" });
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setOrderForm({ name: "", phone: "", notes: "" });
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.name.trim()) {
      showErrorModal("Nama tidak boleh kosong!");
      return;
    }
    if (!orderForm.phone.trim()) {
      showErrorModal("Nomor WhatsApp tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);

    const featuresText = project.features || "";

    try {
      await supabase.from('projects').insert([{
        client_name:      orderForm.name.trim(),
        no_hp:            orderForm.phone.trim(),
        project_title:    project.title,
        website_category: project.category,
        features:         featuresText,
        price:            project.base_price || 0,
        estimate_days:    0,
        assigned_to:      '',
        status:           'Pending',
        progress_percent: 0,
        daily_task:       '',
        checklist:        [],
        notes:            orderForm.notes.trim() || ''
      }]);

      const phoneNumber = "6285710379820";
      const message =
        `*ORDER DATA - WEB PRO SOLUTIONS*%0A` +
        `----------------------------------------%0A` +
        `*Nama:* ${orderForm.name.trim()}%0A` +
        `*No. WA:* ${orderForm.phone.trim()}%0A` +
        `*Template:* ${project.title}%0A` +
        `*Kategori:* ${project.category}%0A` +
        `*Investasi:* Rp ${project.base_price?.toLocaleString()}%0A` +
        (orderForm.notes.trim() ? `*Catatan:* ${orderForm.notes.trim()}%0A` : '') +
        `----------------------------------------%0A` +
        `Halo Web Pro Solutions, saya ingin berkonsultasi mengenai pemesanan template ini.`;
      
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
      
      handleCloseModal();
      showErrorModal("✅ Permintaan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.");
    } catch (err) {
      console.error('Supabase insert error:', err.message);
      showErrorModal("❌ Gagal mengirim permintaan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawFeatures = project.features && typeof project.features === "string" && project.features.trim() !== ""
    ? project.features.split(",").map((f) => f.trim())
    : [];

  const activeStandard = rawFeatures.filter(f => MASTER_STANDARD_FEATURES.includes(f));
  const activeProfessional = rawFeatures.filter(f => !MASTER_STANDARD_FEATURES.includes(f));
  const isAllStandardChecked = activeStandard.length === MASTER_STANDARD_FEATURES.length;

  // Optimasi gambar: gunakan WebP jika tersedia, fallback ke original
  const getOptimizedImageUrl = (url) => {
    if (!url) return url;
    // Coba ganti ekstensi ke webp (jika supabase storage mendukung)
    // Atau bisa tambahkan parameter ?format=webp jika storage support
    return url;
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -15 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="group bg-white rounded-[2.5rem] mt-6 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_20px_50px_-15px_rgba(30,58,138,0.55)] hover:border-blue-900 transition-all duration-500 flex flex-col h-full font-['Poppins']"
      >
        <div className="h-64 overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <img 
            src={project.thumbnail_url}
            loading="lazy"
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-1000 ease-in-out transform group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 z-20">
            <span className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md text-[8px] border border-slate-200 font-black text-blue-900 uppercase tracking-[0.2em] shadow-md">
              {project.category}
            </span>
          </div>
        </div>

        <div className="p-9 flex flex-col flex-grow">
          <h3 className="text-xl text-center font-black text-slate-900 px-2 mb-3 border-transparent border-b-[0.25rem] group-hover:text-blue-900 group-hover:border-b-[0.25rem] group-hover:border-blue-900 transition-colors uppercase tracking-tighter leading-tight">
            {project.title}
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-5 italic font-medium">
            {project.description || "Website profesional dengan desain modern dan fitur lengkap untuk kebutuhan bisnis Anda."}
          </p>

          <div className="mb-8 flex flex-wrap gap-2" role="list" aria-label="Daftar fitur">
            {rawFeatures.length > 0 ? (
              <>
                {isAllStandardChecked ? (
                  <span className="text-[9px] font-black bg-blue-900 text-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-blue-100">
                    ✓ Standard Features Included
                  </span>
                ) : (
                  activeStandard.map((feature, index) => (
                    <span key={`std-${index}`} className="text-[9px] font-bold bg-blue-900/10 text-blue-900 px-2 py-1 rounded-lg uppercase tracking-wider border border-blue-100">
                      ✓ {feature}
                    </span>
                  ))
                )}
                {activeProfessional.map((feature, index) => (
                  <span key={`pro-${index}`} className="text-[9px] font-bold bg-blue-50 text-blue-900 px-2 py-1 rounded-lg uppercase tracking-wider border border-purple-100">
                    ★ {feature}
                  </span>
                ))}
              </>
            ) : (
              <span className="text-[10px] text-slate-400 italic font-medium">{t.catalog.noFeatures}</span>
            )}
          </div>

          <div className="mt-auto pt-7 border-t border-slate-50 flex items-center justify-between">
            <div>
              <span className="block text-slate-500 text-[9px] font-black uppercase tracking-[0.25em] mb-1">{t.catalog.price}</span>
              <span className="text-2xl pr-5 font-black text-blue-900">
                <span className="text-sm mr-1">Rp</span>{project.base_price?.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`/preview/${project.slug}`, "_blank")}
                className="bg-blue-900/10 text-blue-950 px-4 py-3 rounded-2xl font-black hover:bg-blue-900 hover:text-white transition-all text-[11px] uppercase tracking-wider border border-blue-900/20"
                aria-label={`Preview template ${project.title}`}
              >
                {t.catalog.preview}
              </button>
              <button
                onClick={handleOpenModal}
                className="bg-blue-900 text-white px-4 py-2 rounded-2xl hover:bg-slate-950 transition-all shadow-[0_10px_20px_-5px_rgba(30,58,138,0.4)] active:scale-90"
                aria-label={`Pesan template ${project.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Form Pemesanan Template">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{t.orderModal.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{project.title}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">{t.orderModal.nameLabel}</label>
                <input
                  type="text"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                  aria-label="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">{t.orderModal.phoneLabel}</label>
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                  aria-label="Nomor WhatsApp"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">{t.orderModal.notesLabel}</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Contoh: Butuh integration dengan API tertentu, request desain khusus, dll..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition h-24 resize-none"
                  aria-label="Catatan tambahan"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-600">{t.orderModal.totalLabel}</span>
                <span className="text-blue-900 text-lg">Rp {project.base_price?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
                aria-label="Batal pesan"
              >
                {t.orderModal.cancelBtn}
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-900 transition-all disabled:opacity-50"
                aria-label="Kirim pesanan"
              >
                {isSubmitting ? t.orderModal.submitting : t.orderModal.submitBtn}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error/Success Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Notifikasi">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeErrorModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                errorModal.message.includes("✅") ? "bg-green-100" : "bg-red-100"
              }`}>
                {errorModal.message.includes("✅") ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {errorModal.message.includes("✅") ? "Berhasil!" : "Perhatian"}
              </h3>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                {errorModal.message}
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={closeErrorModal}
                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-900 transition-all"
                aria-label="Tutup notifikasi"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}