import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-['Poppins'] pt-32 pb-20">
      <Helmet>
        <title>Syarat & Ketentuan | Web Pro Solutions</title>
        <meta name="description" content="Syarat dan ketentuan penggunaan layanan Web Pro Solutions. Baca sebelum menggunakan website kami." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-8 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-slate-500 text-sm mb-8 border-b border-slate-100 pb-4">
            Berlaku efektif: 1 Januari 2026 | Terakhir diperbarui: 10 Juli 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">
              Dengan mengakses dan menggunakan website Web Pro Solutions ("kami", "kita", atau "milik kami"), Anda menyetujui untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, harap tidak menggunakan website kami.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">1. Penggunaan Website</h2>
            <p className="text-slate-600 leading-relaxed">
              Anda setuju untuk menggunakan website kami hanya untuk tujuan yang sah dan tidak dengan cara yang melanggar hak orang lain atau membatasi penggunaan website oleh pihak lain.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">2. Pemesanan Template</h2>
            <p className="text-slate-600 leading-relaxed">
              Saat Anda melakukan pemesanan template melalui PortfolioCard atau PriceCalculator, Anda setuju untuk memberikan informasi yang akurat dan lengkap. Kami berhak menolak pesanan jika informasi yang diberikan tidak valid.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">3. Pembayaran</h2>
            <p className="text-slate-600 leading-relaxed">
              Sistem pembayaran yang berlaku:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li>DP 50% di awal pengerjaan.</li>
              <li>Pelunasan 50% setelah website selesai dan siap publikasi.</li>
              <li>Pembayaran dapat dilakukan melalui transfer bank atau QRIS.</li>
            </ul>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">4. Revisi</h2>
            <p className="text-slate-600 leading-relaxed">
              Kami menjamin kepuasan klien dengan revisi sampai website benar-benar siap sesuai kesepakatan awal. Revisi maksimal 3x untuk perubahan besar, sisanya gratis untuk perubahan kecil.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">5. Hak Kekayaan Intelektual</h2>
            <p className="text-slate-600 leading-relaxed">
              Semua template, desain, kode, dan konten di website ini adalah milik Web Pro Solutions dan dilindungi oleh hak cipta. Anda tidak diperbolehkan menyalin, memodifikasi, atau mendistribusikan tanpa izin tertulis.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">6. Batasan Tanggung Jawab</h2>
            <p className="text-slate-600 leading-relaxed">
              Web Pro Solutions tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan website kami.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">7. Perubahan Layanan</h2>
            <p className="text-slate-600 leading-relaxed">
              Kami berhak mengubah harga, paket, atau layanan sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku setelah dipublikasikan di website.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">8. Kontak Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
            </p>
            <ul className="list-none pl-0 text-slate-600 mt-2">
              <li>📧 Email: <a href="mailto:iqbal.alhuda1007@gmail.com" className="text-blue-600 hover:underline">iqbal.alhuda1007@gmail.com</a></li>
              <li>📱 WhatsApp: <a href="https://wa.me/6285710379820" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">0857-1037-9820</a></li>
            </ul>

            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p>© 2026 Web Pro Solutions. Seluruh hak cipta dilindungi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}