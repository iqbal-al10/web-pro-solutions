import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import qrisImage from '../assets/QR.jpeg';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  project, 
  selectedType, 
  selectedFeatures, 
  totalPrice,
  t 
}) {
  const [step, setStep] = useState(1); // 1: Form, 2: Pembayaran, 3: Sukses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [orderData, setOrderData] = useState(null);
  const fileInputRef = useRef(null);

  // Hitung PPN 11%
  const tax = Math.round(totalPrice * 0.11);
  const grandTotal = totalPrice + tax;

  // Reset state saat modal ditutup
  const resetModal = () => {
    setStep(1);
    setOrderForm({ name: "", phone: "", notes: "" });
    setPaymentMethod("qris");
    setProofFile(null);
    setProofPreview(null);
    setUploadProgress(0);
    setOrderData(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Step 1: Submit form data ke Supabase (status: Menunggu Konfirmasi)
  const handleSubmitOrder = async () => {
    if (!orderForm.name.trim()) {
      alert("Nama tidak boleh kosong!");
      return;
    }
    if (!orderForm.phone.trim()) {
      alert("Nomor WhatsApp tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Siapkan data features
      let featuresText = "";
      if (project) {
        featuresText = project.features || "";
      } else if (selectedType) {
        const allFeatures = [
          "Responsive & Adaptive Design",
          "SSL Security Certificate",
          "Performance Optimization",
          "Basic CMS Management",
          "Contact Form Integration",
          "Basic SEO Optimization",
          "Premium UI/UX Design",
          ...selectedFeatures.map(f => f.name)
        ];
        featuresText = allFeatures.join(', ');
      }

      // Insert ke projects dengan status "Menunggu Konfirmasi"
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          client_name: orderForm.name.trim(),
          no_hp: orderForm.phone.trim(),
          project_title: project ? project.title : selectedType.name,
          website_category: project ? project.category : selectedType.category,
          features: featuresText,
          price: grandTotal,
          estimate_days: 0,
          assigned_to: '',
          status: 'Menunggu Konfirmasi',
          progress_percent: 0,
          daily_task: '',
          checklist: [],
          notes: orderForm.notes.trim() || ''
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Simpan project data untuk digunakan di step selanjutnya
      setOrderData(projectData);
      
      // Lanjut ke step pembayaran
      setStep(2);
      
    } catch (err) {
      console.error('Error creating order:', err);
      alert("❌ Gagal membuat order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Upload bukti pembayaran
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB!");
      return;
    }
    
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan (JPG, PNG)!");
      return;
    }
    
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      alert("Silakan pilih bukti transfer terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Upload gambar ke Supabase Storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const proofUrl = urlData.publicUrl;

      setUploadProgress(85);

      // Simpan ke tabel payments
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          project_id: orderData.id,
          payment_proof_url: proofUrl,
          payment_method: paymentMethod,
          amount: grandTotal,
          tax: tax,
          payment_status: 'waiting',
          paid_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      setUploadProgress(95);

      // Update project dengan payment_id
      await supabase
        .from('projects')
        .update({ payment_id: paymentData.id })
        .eq('id', orderData.id);

      setUploadProgress(100);

      // Lanjut ke step sukses
      setStep(3);

      // Kirim notifikasi ke WhatsApp admin (opsional, lewat link)
      // Admin akan melihat di AdminDashboard

    } catch (err) {
      console.error('Upload error:', err);
      alert("❌ Gagal mengupload bukti: " + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Render metode pembayaran
  const renderPaymentMethods = () => {
    const methods = [
      { id: 'bri', label: 'BRI', icon: '🏦' },
      { id: 'seabank', label: 'SeaBank', icon: '🏦' },
      { id: 'dana', label: 'Dana', icon: '📱' },
      { id: 'gopay', label: 'Gopay', icon: '📱' },
      { id: 'qris', label: 'QRIS', icon: '📷' },
    ];

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${
              paymentMethod === method.id
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400'
            }`}
          >
            {method.icon} {method.label}
          </button>
        ))}
      </div>
    );
  };

  // Render detail pembayaran berdasarkan metode
  const renderPaymentDetail = () => {
    const rekening = {
      bri: { bank: 'BRI', number: '7879-0100-1474-509', name: 'Mukhammad Iqballudin Al Huda' },
      seabank: { bank: 'SeaBank', number: '9018-3249-1733', name: 'Mukhammad Iqballudin Al Huda' },
      dana: { bank: 'Dana', number: '085710379820', name: 'Mukhammad Iqballudin Al Huda' },
      gopay: { bank: 'Gopay', number: '085710379820', name: 'Mukhammad Iqballudin Al Huda' },
    };

    if (paymentMethod === 'qris') {
      return (
        <div className="text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-3">
            Scan QRIS di bawah ini
          </p>
          <div className="flex justify-center">
            <img 
              src={qrisImage} 
              alt="QRIS Payment"
              className="w-48 h-48 object-contain rounded-xl border border-slate-200 bg-white p-2"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            Buka aplikasi OVO, Gopay, DANA, LinkAja, atau mobile banking
          </p>
        </div>
      );
    }

    const rek = rekening[paymentMethod];
    if (!rek) return null;

    return (
      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
        <p className="text-[11px] font-bold text-slate-600">
          Bank: <span className="text-slate-900">{rek.bank}</span>
        </p>
        <p className="text-[11px] font-bold text-slate-600">
          No. Rekening: <span className="text-slate-900">{rek.number}</span>
        </p>
        <p className="text-[11px] font-bold text-slate-600">
          Atas Nama: <span className="text-slate-900">{rek.name}</span>
        </p>
        <p className="text-[10px] text-slate-400 italic mt-2">
          ⚠️ Transfer sesuai dengan total yang tertera di atas
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[2.5rem] max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl border border-slate-100"
      >
        {/* STEP 1: FORM ORDER */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {project ? t.orderModal.title : "Pesan Custom Website"}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {project ? project.title : selectedType?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  {t.orderModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder={t.orderModal.namePlaceholder}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  {t.orderModal.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder={t.orderModal.phonePlaceholder}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  {t.orderModal.notesLabel}
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder={t.orderModal.notesPlaceholder}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition h-24 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-600">{t.orderModal.totalLabel}</span>
                <span className="text-blue-900 text-lg">Rp {totalPrice?.toLocaleString()}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic">
                *Belum termasuk PPN 11%
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleClose}
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
              >
                {t.orderModal.cancelBtn}
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Lanjut ke Pembayaran"}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: PEMBAYARAN */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Pembayaran
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {orderData?.project_title || project?.title || selectedType?.name}
              </p>
            </div>

            {/* Rincian Harga */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold">Rp {totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-600">PPN 11%</span>
                <span className="font-bold">Rp {tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-[15px] font-black">
                <span className="text-slate-900">TOTAL</span>
                <span className="text-blue-900">Rp {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Pilih Metode Pembayaran */}
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                Pilih Metode Pembayaran
              </label>
              {renderPaymentMethods()}
            </div>

            {/* Detail Pembayaran */}
            <div className="mb-4">
              {renderPaymentDetail()}
            </div>

            {/* Upload Bukti */}
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                Upload Bukti Transfer
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-200 transition"
                  >
                    📎 Pilih File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {proofFile && (
                    <span className="text-[10px] text-green-600 font-medium truncate max-w-[150px]">
                      {proofFile.name}
                    </span>
                  )}
                </div>
                {proofPreview && (
                  <div className="mt-2">
                    <img 
                      src={proofPreview} 
                      alt="Preview Bukti"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-blue-900 rounded-full"
                    />
                  </div>
                )}
                <p className="text-[8px] text-slate-400">
                  Format: JPG, PNG (max 2MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleUploadProof}
                disabled={isSubmitting || !proofFile}
                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Pembayaran"}
              </button>
            </div>
          </>
        )}

        {/* STEP 3: SUKSES */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                ✅ Pembayaran Dikirim!
              </h3>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                Bukti pembayaran Anda berhasil dikirim. Tim kami akan memverifikasi dan menghubungi Anda segera.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-600">Order ID</span>
                <span className="font-mono text-[11px] font-bold text-slate-900">
                  #{orderData?.id?.toString().slice(-6) || '...'}
                </span>
              </div>
              <div className="flex justify-between text-[13px] mt-1">
                <span className="text-slate-600">Total</span>
                <span className="font-bold text-blue-900">Rp {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] mt-1">
                <span className="text-slate-600">Status</span>
                <span className="font-bold text-yellow-600">Menunggu Konfirmasi</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/6285710379820?text=Halo%20Web%20Pro%20Solutions%2C%20saya%20sudah%20melakukan%20pembayaran%20untuk%20order%20%23${orderData?.id?.toString().slice(-6) || '...'}%20sebesar%20Rp%20${grandTotal.toLocaleString()}%2C%20tolong%20dikonfirmasi.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326z"/>
                </svg>
                Konfirmasi via WhatsApp
              </a>
              <button
                onClick={handleClose}
                className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}