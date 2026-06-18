import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import PaymentModal from './PaymentModal';

const STANDARD_FEATURES = [
  "Responsive & Adaptive Design",
  "SSL Security Certificate",
  "Performance Optimization",
  "Basic CMS Management",
  "Contact Form Integration",
  "Basic SEO Optimization",
  "Premium UI/UX Design"
];

const webTypes = [
  { id: 'landing',   name: 'Premium Landing Page', price: 799000,  desc: 'Fokus konversi & penjualan tinggi.', icon: '🚀', category: 'Landing Page' },
  { id: 'corporate', name: 'Corporate Business',   price: 1750000, desc: 'Profil perusahaan profesional.',      icon: '🏢', category: 'Corporate'    },
  { id: 'ecommerce', name: 'Advanced E-Commerce',  price: 3500000, desc: 'Sistem belanja & payment gateway.',   icon: '🛒', category: 'E-Commerce'   },
  { id: 'portfolio', name: 'Creative Portfolio',   price: 1250000, desc: 'Showcase karya & personal branding.', icon: '🎨', category: 'Portfolio'    },
];

const professionalFeatures = [
  { id: 1,  name: 'Secure Cloud Infrastructure',       price: 850000,  icon: '☁️'  },
  { id: 2,  name: 'Advanced CMS & Content Management', price: 1000000, icon: '⚙️'  },
  { id: 3,  name: 'Payment Gateway Integration',       price: 1500000, icon: '💳'  },
  { id: 4,  name: 'WhatsApp API Integration',          price: 1000000, icon: '💬'  },
  { id: 5,  name: 'Advanced Analytics Dashboard',      price: 900000,  icon: '📊'  },
  { id: 6,  name: 'Role-Based Access Control',         price: 850000,  icon: '🔐'  },
  { id: 7,  name: 'Advanced SEO Optimization',         price: 700000,  icon: '🔍'  },
  { id: 8,  name: 'Automated Backup & Recovery',       price: 550000,  icon: '🔄'  },
  { id: 9,  name: 'Third-Party API Integration',       price: 1250000, icon: '🔗'  },
  { id: 10, name: 'Enterprise Security Features',      price: 1300000, icon: '🛡️'  },
];

export default function PriceCalculator({ t }) {
  const [selectedType, setSelectedType] = useState(webTypes[0]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showStandard, setShowStandard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", notes: "" });

  const totalPrice = useMemo(() => {
    return selectedType.price + selectedFeatures.reduce((acc, f) => acc + f.price, 0);
  }, [selectedType, selectedFeatures]);

  const toggleFeature = (feat) => {
    setSelectedFeatures(prev =>
      prev.find(f => f.id === feat.id) ? prev.filter(f => f.id !== feat.id) : [...prev, feat]
    );
  };

  const handleClosePaymentModal = () => {
  setShowPaymentModal(false);
  };

  const handleOpenModal = () => {
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.name.trim()) {
      alert("Nama tidak boleh kosong!");
      return;
    }
    if (!orderForm.phone.trim()) {
      alert("Nomor WhatsApp tidak boleh kosong!");
      return;
    }

    setIsProcessing(true);

    try {
      const allFeatures = [
        ...STANDARD_FEATURES,
        ...selectedFeatures.map(f => f.name)
      ];
      const featuresText = allFeatures.join(', ');

      const { error } = await supabase.from('projects').insert([{
        client_name:      orderForm.name.trim(),
        no_hp:            orderForm.phone.trim(),
        project_title:    selectedType.name,
        website_category: selectedType.category,
        features:         featuresText,
        price:            totalPrice,
        estimate_days:    0,
        assigned_to:      '',
        status:           'Pending',
        progress_percent: 0,
        daily_task:       '',
        checklist:        [],
        notes:            orderForm.notes.trim() || ''
      }]);

      if (error) throw error;

      handleCloseModal();
      
      const phoneNumber = "6285710379820";
      const featureList = selectedFeatures.length > 0
        ? selectedFeatures.map(f => `%0A  • ${f.name}`).join('')
        : '%0A  • Tanpa Professional Features tambahan';
      const message = 
        `*ORDER DATA - WEB PRO SOLUTIONS*%0A` +
        `----------------------------------------%0A` +
        `*Nama:* ${orderForm.name.trim()}%0A` +
        `*No. WA:* ${orderForm.phone.trim()}%0A` +
        `*Paket:* ${selectedType.name}%0A` +
        `*Total:* Rp ${totalPrice.toLocaleString()}%0A` +
        `*Professional Features:*${featureList}%0A` +
        (orderForm.notes.trim() ? `*Catatan:* ${orderForm.notes.trim()}%0A` : '') +
        `----------------------------------------%0A` +
        `Halo Web Pro Solutions, saya ingin berkonsultasi mengenai pemesanan paket ini.`;
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");

      alert("✅ Permintaan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.");
    } catch (err) {
      alert("❌ Gagal mengirim: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden font-['Poppins']">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[80px] -z-0" />

        <div className="relative z-10 text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-black text-blue-900 bg-blue-50 px-5 py-2.5 rounded-full uppercase tracking-[0.4em]"
          >
            {t.priceCalculator.badge}
          </motion.span>
          <h3 className="text-4xl font-black text-slate-900 uppercase mt-6 tracking-tighter italic">
            {t.priceCalculator.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-[2px] bg-blue-900" /> {t.priceCalculator.architecture}
            </h4>

            <button
              type="button"
              onClick={() => setShowStandard(!showStandard)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✅</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{t.priceCalculator.standardFeatures}</span>
              </div>
              <span className="text-[10px] font-black text-blue-600">{showStandard ? t.priceCalculator.hide : t.priceCalculator.show}</span>
            </button>

            <AnimatePresence>
              {showStandard && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 grid grid-cols-1 gap-2">
                    <p className="text-[9px] font-black text-blue-800 mb-1">{t.priceCalculator.standardList}</p>
                    {STANDARD_FEATURES.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-blue-800">
                        <span className="text-blue-500 flex-shrink-0">✓</span> {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-4">
              {webTypes.map(type => (
                <button
                  key={type.id} type="button"
                  onClick={() => setSelectedType(type)}
                  className={`group p-6 rounded-[2.2rem] text-left transition-all border-2 flex justify-between items-center ${
                    selectedType.id === type.id
                      ? 'border-blue-900 bg-blue-50/50 shadow-xl shadow-blue-100/20'
                      : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4 max-w-[70%]">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <span className={`font-black text-sm uppercase block ${selectedType.id === type.id ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-900'}`}>
                        {type.name}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase italic leading-tight">{type.desc}</p>
                    </div>
                  </div>
                  <div className={`font-black text-right ${selectedType.id === type.id ? 'text-blue-900' : 'text-slate-500'}`}>
                    <span className="text-[10px] block mb-0.5">mulai dari</span>
                    <span className="text-sm">Rp {type.price.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-[2px] bg-blue-900" /> {t.priceCalculator.professional}
            </h4>
            <p className="text-[10px] text-slate-500 font-bold italic -mt-2">{t.priceCalculator.professionalDesc}</p>

            <div className="grid grid-cols-1 gap-3">
              {professionalFeatures.map((feat) => {
                const isActive = !!selectedFeatures.find(f => f.id === feat.id);
                return (
                  <button
                    key={feat.id} type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 text-left ${
                      isActive ? 'border-blue-900 bg-white shadow-lg shadow-blue-100/30' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all flex-shrink-0 ${isActive ? 'bg-blue-900 rotate-6 shadow-md' : 'bg-white shadow-sm'}`}>
                        {feat.icon}
                      </div>
                      <span className={`font-black text-[11px] uppercase tracking-wide ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {feat.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end ml-2 flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] mb-1 flex-shrink-0 transition-all ${isActive ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-300'}`}>
                        {isActive ? '✓' : ''}
                      </div>
                      <span className={`font-black text-[10px] whitespace-nowrap ${isActive ? 'text-blue-900' : 'text-slate-500'}`}>
                        +Rp {feat.price.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-20 p-10 bg-slate-900 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-[0_20px_50px_rgba(30,41,59,0.3)] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 blur-[100px]" />

          <div className="text-center md:text-left relative z-10">
            <p className="text-blue-400 font-black uppercase text-[9px] tracking-[0.4em] mb-3">{t.priceCalculator.investment}</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-5xl font-black tracking-tighter italic">Rp {totalPrice.toLocaleString()}</span>
              <span className="text-slate-500 font-bold text-xs uppercase opacity-60">{t.priceCalculator.fullBuild}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {t.priceCalculator.delivery}
              </p>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {t.priceCalculator.maintenance}
              </p>
              {selectedFeatures.length > 0 && (
                <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {selectedFeatures.length} {selectedFeatures.length > 1 ? t.priceCalculator.proAddedPlural : t.priceCalculator.proAdded}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={isProcessing}
            className="group/btn w-full md:w-auto bg-white text-slate-900 px-14 py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-900 hover:text-white transition-all duration-500 shadow-xl relative overflow-hidden disabled:opacity-60"
          >
            <span className="relative z-10">{t.priceCalculator.startProject}</span>
            <div className="absolute inset-0 bg-blue-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          project={null}
          selectedType={selectedType}
          selectedFeatures={selectedFeatures}
          totalPrice={totalPrice}
          t={t}
        />
      )}
    </>
  );
}