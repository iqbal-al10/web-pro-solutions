import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import qrisImage from "../assets/QR.jpeg"; // Pastikan path sesuai dengan lokasi file QR.jpeg Anda

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! 👋 Selamat datang di Web Pro Solutions.\n\nAda yang bisa saya bantu? Klik tombol di bawah atau ketik pertanyaan Anda langsung.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const socialButtonRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Quick replies buttons (9 tombol)
  const quickReplies = [
    { label: "💰 Harga", query: "Harga paket website berapa?", type: "query" },
    { label: "⏱️ Proses", query: "Proses pengerjaan berapa lama?", type: "query" },
    { label: "📋 Fitur", query: "Apa saja fitur yang tersedia?", type: "query" },
    { label: "🎨 Custom", query: "Bisa custom website sendiri?", type: "query" },
    { label: "🌐 Domain", query: "Apakah termasuk domain dan hosting?", type: "query" },
    { label: "✏️ Revisi", query: "Apakah bisa revisi?", type: "query" },
    { label: "💳 Bayar", query: "Sistem pembayarannya bagaimana?", type: "query" },
    { label: "📱 Admin", query: "Nomor WhatsApp admin?", type: "query" },
    { label: "📱 Sosmed", type: "social" },
  ];

  // Social media links
  const socialLinks = [
    { name: "Instagram", url: "https://instagram.com/iqbal_alh", icon: "📷", color: "hover:bg-pink-100" },
    { name: "GitHub", url: "https://github.com/iqbal-al10", icon: "🐙", color: "hover:bg-gray-100" },
    { name: "WhatsApp", url: "https://wa.me/6285710379820", icon: "💬", color: "hover:bg-green-100" },
  ];

  // Professional Features list
  const professionalFeatures = [
    "Secure Cloud Infrastructure (+Rp 850k)",
    "Advanced CMS & Content Management (+Rp 1.200k)",
    "Payment Gateway Integration (+Rp 1.500k)",
    "WhatsApp API Integration (+Rp 750k)",
    "Advanced Analytics Dashboard (+Rp 950k)",
    "Role-Based Access Control (+Rp 1.100k)",
    "Advanced SEO Optimization (+Rp 800k)",
    "Automated Backup & Recovery (+Rp 650k)",
    "Third-Party API Integration (+Rp 1.300k)",
    "Enterprise Security Features (+Rp 1.400k)",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (socialButtonRef.current && !socialButtonRef.current.contains(event.target)) {
        setShowSocialDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format waktu
  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  // Cek apakah pesan adalah sapaan (HANYA sapaan singkat, di Paling Bawah Prioritas)
  const isGreeting = (msg) => {
    const greetings = ["hai", "halo", "hello", "hi", "hey", "oi", "mamen", "cuy", "bro", "bang", "mas", "kak", "mbak", "teh", "p", "pe", "selamat pagi", "selamat siang", "selamat malam"];
    const msgLower = msg.toLowerCase().trim();
    
    // Jika pesan panjang (> 30 karakter), BUKAN sapaan
    if (msgLower.length > 30) return false;
    
    // Cek apakah pesan sama persis dengan salah satu sapaan
    if (greetings.includes(msgLower)) return true;
    
    // Cek apakah pesan dimulai dengan sapaan (contoh: "halo admin")
    for (const g of greetings) {
      if (msgLower.startsWith(g + " ") || msgLower.startsWith(g)) {
        return true;
      }
    }
    return false;
  };

  // Reset unanswered counter
  const resetUnansweredCounter = () => {
    setUnansweredCount(0);
  };

  // Keyword responses - URUTAN PENTING: Spesifik di atas, umum di bawah
  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase().trim();

    // ========== 1. PROSES PENGERJAAN ==========
    if (msg.includes("proses") || msg.includes("berapa lama") || msg.includes("estimasi") || msg.includes("waktu") || msg.includes("pengerjaan") || msg.includes("durasi") || msg.includes("lama") || msg.includes("hari")) {
      resetUnansweredCounter();
      return `⏱️ *Proses Pengerjaan Website:*\n\n1️⃣ Konsultasi & Analisis Kebutuhan (1-2 hari)\n2️⃣ Desain UI/UX (2-3 hari)\n3️⃣ Development & Coding (3-7 hari)\n4️⃣ Revisi & Penyesuaian (sesuai kebutuhan)\n5️⃣ Testing & Quality Control (1-2 hari)\n6️⃣ Launching & Deployment (1 hari)\n\n📌 *Total estimasi: 7-21 hari kerja*\n(Tergantung kompleksitas website dan ketersediaan konten dari klien)\n\n💡 Proses lebih cepat jika data sudah lengkap!`;
    }

    // ========== 2. HARGA ==========
    if ((msg.includes("harga") || msg.includes("price")) && (msg.includes("paket") || msg.includes("semua") || msg.includes("list"))) {
      resetUnansweredCounter();
      return `💰 *Daftar Harga Paket Website:*\n\n• Premium Landing Page: Rp 1.500.000\n• Corporate Business: Rp 3.500.000\n• Advanced E-Commerce: Rp 6.500.000\n• Creative Portfolio: Rp 2.000.000\n\nKetik "harga landing page" untuk info lebih lengkap.`;
    }

    // Harga Landing Page
    if ((msg.includes("landing") || msg.includes("landing page")) && (msg.includes("harga") || msg.includes("berapa"))) {
      resetUnansweredCounter();
      return `🚀 *Premium Landing Page*\n💰 Harga: Rp 1.500.000\n\n📋 *Fitur Standard:*\n• Responsive & Adaptive Design\n• SSL Security Certificate\n• Performance Optimization\n• Contact Form Integration\n• Basic SEO Optimization\n• Premium UI/UX Design\n\n💎 *Professional Features* (add-on):\n${professionalFeatures.slice(0, 5).map(f => `• ${f}`).join('\n')}\n\nTanyakan "proses" untuk info pengerjaan.`;
    }

    // Harga Corporate
    if ((msg.includes("corporate") || msg.includes("bisnis") || msg.includes("company")) && (msg.includes("harga") || msg.includes("berapa"))) {
      resetUnansweredCounter();
      return `🏢 *Corporate Business*\n💰 Harga: Rp 3.500.000\n\n📋 *Fitur Standard:*\n• Responsive & Adaptive Design\n• SSL Security Certificate\n• Performance Optimization\n• Basic CMS Management\n• Contact Form Integration\n• Basic SEO Optimization\n• Premium UI/UX Design\n\n💎 *Professional Features* (add-on):\n${professionalFeatures.slice(0, 5).map(f => `• ${f}`).join('\n')}\n\nTanyakan "proses" untuk info pengerjaan.`;
    }

    // Harga E-Commerce
    if ((msg.includes("ecommerce") || msg.includes("e-commerce") || msg.includes("toko") || msg.includes("shop")) && (msg.includes("harga") || msg.includes("berapa"))) {
      resetUnansweredCounter();
      return `🛒 *Advanced E-Commerce*\n💰 Harga: Rp 6.500.000\n\n📋 *Fitur Standard:*\n• Responsive & Adaptive Design\n• SSL Security Certificate\n• Performance Optimization\n• CMS Management\n• Payment Gateway Integration\n• Basic SEO Optimization\n• Premium UI/UX Design\n\n💎 *Professional Features* (add-on):\n${professionalFeatures.map(f => `• ${f}`).join('\n')}\n\nTanyakan "proses" untuk info pengerjaan.`;
    }

    // Harga Portfolio
    if ((msg.includes("portfolio") || msg.includes("portofolio")) && (msg.includes("harga") || msg.includes("berapa"))) {
      resetUnansweredCounter();
      return `🎨 *Creative Portfolio*\n💰 Harga: Rp 2.000.000\n\n📋 *Fitur Standard:*\n• Responsive & Adaptive Design\n• SSL Security Certificate\n• Performance Optimization\n• Basic CMS Management\n• Contact Form Integration\n• Basic SEO Optimization\n• Premium UI/UX Design\n\n💎 *Professional Features* (add-on):\n${professionalFeatures.slice(0, 5).map(f => `• ${f}`).join('\n')}\n\nTanyakan "proses" untuk info pengerjaan.`;
    }

    // ========== 3. FITUR LENGKAP ==========
    if (msg.includes("fitur") || msg.includes("fitur yang tersedia") || msg.includes("apa saja fitur") || (msg.includes("fitur") && msg.includes("tersedia"))) {
      resetUnansweredCounter();
      let response = `✅ *Fitur Yang Tersedia:*\n\n`;
      response += `📋 *Standard Features (Termasuk Semua Paket):*\n`;
      response += `• Responsive & Adaptive Design\n`;
      response += `• SSL Security Certificate\n`;
      response += `• Performance Optimization\n`;
      response += `• Basic CMS Management\n`;
      response += `• Contact Form Integration\n`;
      response += `• Basic SEO Optimization\n`;
      response += `• Premium UI/UX Design\n\n`;
      response += `💎 *Professional Features (Add-on, harga tambahan):*\n`;
      professionalFeatures.forEach((f) => {
        response += `• ${f}\n`;
      });
      response += `\n💡 Ketik "harga" untuk lihat paket dasar atau "custom" untuk request khusus.`;
      return response;
    }

    // ========== 4. CUSTOM WEBSITE ==========
    if (msg.includes("custom") || msg.includes("kustom") || msg.includes("buat sendiri") || msg.includes("request sendiri") || (msg.includes("bisa") && msg.includes("sendiri"))) {
      resetUnansweredCounter();
      return `🎨 *Custom Website Development*\n\nTentu bisa! Kami menerima request custom website sesuai kebutuhan spesifik Anda.\n\n✅ *Yang bisa kami custom:*\n• Desain UI/UX unik (tidak pakai template)\n• Fitur khusus sesuai request\n• Integrasi API tertentu\n• Sistem yang kompleks\n• Database custom\n\n💡 *Cara order custom:*\n1. Konsultasikan kebutuhan Anda\n2. Kami akan berikan penawaran harga\n3. Proses development dimulai\n\n📱 *Untuk konsultasi custom website, langsung hubungi tim kami via WhatsApp:*\n[wa.me/6285710379820](wa.me/6285710379820)`;
    }

    // ========== 5. DOMAIN & HOSTING ==========
    if (msg.includes("domain") || msg.includes("hosting") || msg.includes("url")) {
      resetUnansweredCounter();
      return `🌐 *Domain & Hosting:*\n\n✅ *Termasuk dalam paket:*\n• Domain .com / .id / .net (1 tahun pertama)\n• Hosting gratis (1 tahun pertama)\n• SSL Certificate (keamanan website)\n• Email professional (nama@domainanda.com)\n• Bandwidth unlimited\n\n💡 Anda juga bisa menggunakan domain sendiri jika sudah punya.`;
    }

    // ========== 6. REVISI ==========
    if (msg.includes("revisi") || msg.includes("ubah") || msg.includes("perubahan")) {
      resetUnansweredCounter();
      return `✏️ *Jaminan Revisi:*\n\nKami menjamin kepuasan klien dengan revisi sampai website benar-benar siap sesuai kesepakatan awal. Tidak ada biaya tambahan untuk revisi dalam lingkup yang disepakati.\n\n📌 *Revisi maksimal 3x* untuk perubahan besar, sisanya gratis untuk perubahan kecil.`;
    }

    // ========== 7. PEMBAYARAN ==========
    if (msg.includes("bayar") || msg.includes("dp") || msg.includes("transfer") || msg.includes("pembayaran") || msg.includes("cara bayar") || msg.includes("metode") || msg.includes("qris") || msg.includes("scan")) {
      resetUnansweredCounter();
      setTimeout(() => {
        const qrMessage = {
          id: Date.now() + 999,
          text: `📱 *Scan QRIS untuk pembayaran:*\n\nSilakan scan QR Code di bawah ini menggunakan aplikasi OVO, Gopay, DANA, LinkAja, atau mobile banking.\n\nAtau transfer ke rekening bank yang akan diinformasikan oleh admin.\n\nSetelah transfer, konfirmasi ke admin via WhatsApp: [wa.me/6285710379820](wa.me/6285710379820)`,
          sender: "bot",
          timestamp: new Date(),
          showQR: true,
        };
        setMessages((prev) => [...prev, qrMessage]);
      }, 500);
      
      return `💰 *Sistem Pembayaran:*\n\n📌 *Cicilan 2x:*\n• DP 50% di awal pengerjaan\n• Pelunasan 50% setelah website selesai\n\n📌 *Metode Pembayaran:*\n• Transfer Bank (BCA, Mandiri, BRI, BNI)\n• QRIS (Scan QR Code via OVO, Gopay, DANA, LinkAja)\n\n💳 *QRIS akan muncul di pesan berikutnya.*`;
    }

    // ========== 8. ADMIN / KONTAK ==========
    if (msg.includes("admin") || msg.includes("kontak") || msg.includes("wa") || msg.includes("whatsapp") || msg.includes("telepon") || msg.includes("hubungi") || msg.includes("no")) {
      resetUnansweredCounter();
      return `📱 *Hubungi Admin:*\n\nWhatsApp: 0857-1037-9820\n\nKlik link ini untuk chat langsung:\n[wa.me/6285710379820](wa.me/6285710379820)\n\nTim admin siap membantu 24/7! 🚀`;
    }

    // ========== 9. TENTANG BOT (siapa nama anda, apa tugas anda, apa yang harus saya lakukan) ==========
    if (msg.includes("siapa nama") || msg.includes("nama anda") || msg.includes("kamu siapa") || msg.includes("siapa anda") || 
        msg.includes("apa tugas") || msg.includes("tugas anda") || msg.includes("fungsi kamu") || msg.includes("bisa apa") ||
        msg.includes("apa yang harus saya lakukan") || msg.includes("yang harus saya lakukan")) {
      resetUnansweredCounter();
      return `🤖 *Tentang Saya:*\n\nNama saya *Web Pro Assistant*, asisten virtual dari Web Pro Solutions.\n\n📋 *Tugas saya:*\n• Memberi informasi harga paket website\n• Menjelaskan proses pengerjaan\n• Menampilkan fitur yang tersedia\n• Menjawab pertanyaan tentang domain, hosting, pembayaran\n• Membantu Anda terhubung dengan tim admin\n\n💡 *Yang harus Anda lakukan:*\nCukup ketik pertanyaan Anda, atau klik tombol di bawah ini:\n• "Harga paket website berapa?"\n• "Proses pengerjaan berapa lama?"\n• "Apa saja fitur yang tersedia?"\n• "Bisa custom website sendiri?"\n\nSaya siap membantu! 🚀`;
    }

    // ========== 10. TENTANG PEMBUAT (siapa bos/ceo/owner/developer, siapa yang buat anda) ==========
    if (msg.includes("siapa bos") || msg.includes("siapa juragan") || msg.includes("siapa ceo") || msg.includes("siapa owner") || 
        msg.includes("siapa developer") || msg.includes("siapa yang buat") || msg.includes("pembuat anda") || msg.includes("creator anda") ||
        msg.includes("bos") || msg.includes("juragan") || msg.includes("ceo") || msg.includes("owner") || msg.includes("developer")) {
      resetUnansweredCounter();
      return `👨‍💼 *Tentang Bos/Owner:*\n\nWeb Pro Solutions didirikan dan dikelola oleh bos Iqbal Al, seorang web developer dan digital entrepreneur berpengalaman.\n\n👨‍💻 *Tentang Pembuat Saya:*\n\nSaya dibuat oleh tim Web Pro Solutions, tepatnya oleh bos Iqbal Al sebagai full-stack developer, untuk membantu calon klien mendapatkan informasi dengan cepat dan mudah.\n\n🌐 *Portofolio & Kontak:*\n• Instagram: @iqbal_alh\n• GitHub: @iqbal-al10\n• WhatsApp: 0857-1037-9820\n\nAda yang bisa saya bantu hari ini? 😊`;
    }

    // ========== 11. MENU ==========
    if (msg.includes("menu") || msg.includes("bantuan") || msg.includes("help")) {
      resetUnansweredCounter();
      return `📋 *Yang bisa saya bantu:*\n\n• Harga paket website\n• Detail paket (Landing Page, Corporate, E-Commerce, Portfolio)\n• Proses pengerjaan\n• Fitur yang tersedia (Standard & Professional)\n• Custom website\n• Info domain & hosting\n• Sistem pembayaran (Transfer Bank & QRIS)\n• Admin\n\nKlik tombol di bawah atau ketik pertanyaan Anda.`;
    }

    // ========== 12. TERIMA KASIH ==========
    if (msg.includes("terima kasih") || msg.includes("makasih") || msg.includes("thanks") || msg.includes("thank")) {
      resetUnansweredCounter();
      return `Sama-sama! 😊 Senang bisa membantu.\n\nJika ada pertanyaan lain, tanyakan saja ya! Klik tombol di bawah untuk pertanyaan cepat.\n\nJangan lupa follow Instagram kami @iqbal_alh untuk melihat portofolio terbaru!`;
    }

    // ========== 13. SAPAAN ==========
    if (isGreeting(msg)) {
      resetUnansweredCounter();
      return `Halo juga! 👋 Senang berkenalan dengan Anda.\n\nAda yang bisa saya bantu hari ini? Coba tanyakan:\n• "proses pengerjaan"\n• "harga landing page"\n• "fitur website"\n• "custom website"\n\nAtau klik tombol di bawah untuk pertanyaan cepat.`;
    }

    // ========== 14. TIDAK BISA DIJAWAB ==========
    return null;
  };

  const handleSendMessage = async (text) => {
    const messageText = text || inputMessage;
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      let response = getBotResponse(userMessage.text);
      
      if (response && response.includes("wa.me/6285710379820") && !response.includes("[wa.me")) {
        response = response.replace(/wa\.me\/6285710379820/g, '[wa.me/6285710379820](wa.me/6285710379820)');
      }

      let botMessage;
      if (response) {
        botMessage = {
          id: Date.now() + 1,
          text: response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      } else {
        const newUnansweredCount = unansweredCount + 1;
        setUnansweredCount(newUnansweredCount);

        let fallbackMessage;

        if (newUnansweredCount === 1) {
          fallbackMessage = {
            id: Date.now() + 1,
            text: `Maaf, saya belum bisa memahami pertanyaan Anda 😅\n\nCoba tanyakan dengan kata kunci seperti:\n• "proses pengerjaan"\n• "harga landing page"\n• "fitur website"\n• "custom website"\n\nAtau ketik "menu" untuk melihat daftar lengkap yang bisa saya bantu.`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else {
          const encodedQuestion = encodeURIComponent(userMessage.text);
          const waLink = `https://wa.me/6285710379820?text=Halo%20Web%20Pro%20Solutions%2C%20saya%20mau%20bertanya%3A%20${encodedQuestion}`;
          fallbackMessage = {
            id: Date.now() + 1,
            text: `Maaf, saya masih belum bisa memahami pertanyaan Anda 😅\n\nSepertinya pertanyaan Anda butuh sentuhan manusia! 🚀\n\n📱 *Yuk langsung ngobrol dengan tim admin kami!*\nKlik link di bawah ini untuk chat via WhatsApp:\n\n[wa.me/6285710379820](wa.me/6285710379820)\n\nTim admin akan dengan senang hati membantu Anda! 💙`,
            sender: "bot",
            timestamp: new Date(),
            isWhatsAppLink: true,
            waLink: waLink,
          };
        }
        setMessages((prev) => [...prev, fallbackMessage]);
        setIsTyping(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply) => {
    if (reply.type === "social") {
      setShowSocialDropdown(!showSocialDropdown);
      return;
    }
    handleSendMessage(reply.query);
  };

  const handleSocialLink = (url) => {
    window.open(url, "_blank");
    setShowSocialDropdown(false);
  };

  const renderMessageText = (text) => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={`https://${match[2]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline font-bold inline-flex items-center gap-1"
        >
          {match[1]}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-900 text-white p-4 rounded-full shadow-2xl hover:bg-blue-800 transition-all duration-300"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-['Poppins']"
          >
            {/* Header */}
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tighter">
                    Web Pro Assistant
                  </h3>
                  <p className="text-[9px] text-blue-200 font-medium">Online • Fast Response</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-900 text-white rounded-br-none"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.sender === "bot" ? (
                        renderMessageText(msg.text)
                      ) : (
                        msg.text.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))
                      )}
                    </div>
                    {msg.showQR && (
                      <div className="mt-3 flex justify-center">
                        <img 
                          src={qrisImage} 
                          alt="QRIS Payment"
                          className="w-48 h-48 object-contain rounded-xl border border-slate-200 bg-white p-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(qrisImage, "_blank")}
                        />
                      </div>
                    )}
                    <p
                      className={`text-[9px] mt-1 ${
                        msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {formatTime(new Date(msg.timestamp))}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Buttons */}
            <div className="p-3 bg-white border-t border-slate-100 relative">
              <AnimatePresence mode="wait">
                {!inputMessage.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {quickReplies.map((reply, index) => (
                      <div key={index} className="relative" ref={reply.type === "social" ? socialButtonRef : null}>
                        <button
                          onClick={() => handleQuickReply(reply)}
                          className="w-full px-2 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                        >
                          {reply.label}
                        </button>

                        {reply.type === "social" && showSocialDropdown && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 min-w-[140px]">
                            {socialLinks.map((link, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSocialLink(link.url)}
                                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all ${link.color} hover:bg-opacity-100`}
                              >
                                <span className="text-base">{link.icon}</span>
                                <span className="text-[11px] font-bold text-slate-700">
                                  {link.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                rows="1"
                className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:border-blue-900 transition"
                style={{ maxHeight: "100px" }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-3 rounded-2xl bg-blue-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Footer Note */}
            <div className="bg-slate-50 px-4 py-2 text-center border-t border-slate-100">
              <p className="text-[8px] text-slate-400 font-medium">
                Bot akan terhubung ke admin jika 2x tidak bisa menjawab
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}