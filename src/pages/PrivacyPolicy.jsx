import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-['Poppins'] pt-32 pb-20">
      <Helmet>
        <title>Kebijakan Privasi | Web Pro Solutions</title>
        <meta name="description" content="Kebijakan privasi Web Pro Solutions - Informasi tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda." />
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
            Kebijakan Privasi
          </h1>
          <p className="text-slate-500 text-sm mb-8 border-b border-slate-100 pb-4">
            Berlaku efektif: 1 Januari 2026 | Terakhir diperbarui: 10 Juli 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">
              Di Web Pro Solutions ("kami", "kita", atau "milik kami"), kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda mengunjungi website kami.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-slate-600 leading-relaxed">
              Kami mengumpulkan informasi berikut:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li><strong>Data Pemesanan:</strong> Nama, nomor WhatsApp, catatan requirement (saat Anda melakukan order template atau menggunakan Price Calculator).</li>
              <li><strong>Data Ulasan:</strong> Nama, pekerjaan, rating, dan komentar (saat Anda memberikan testimonial).</li>
              <li><strong>Data Pengunjung (Tracking):</strong> Alamat IP, perangkat (mobile/tablet/desktop), jenis HP, browser, sistem operasi, halaman yang dikunjungi, sumber traffic, dan timestamp.</li>
              <li><strong>Data Cookies:</strong> Kami menggunakan cookies untuk meningkatkan pengalaman Anda dan menganalisis traffic website.</li>
            </ul>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p className="text-slate-600 leading-relaxed">
              Informasi yang kami kumpulkan digunakan untuk:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li>Memproses pesanan template website Anda.</li>
              <li>Menampilkan testimonial yang telah disetujui.</li>
              <li>Menganalisis traffic website untuk meningkatkan layanan.</li>
              <li>Menghubungi Anda via WhatsApp untuk konfirmasi order.</li>
            </ul>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">3. Penyimpanan Data</h2>
            <p className="text-slate-600 leading-relaxed">
              Data Anda disimpan di server Supabase (cloud database) yang aman. Kami tidak menjual, menukar, atau menyewakan data pribadi Anda kepada pihak ketiga.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">4. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Website kami menggunakan cookies untuk melacak aktivitas pengunjung dan menyimpan preferensi. Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi dengan baik.
            </p>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">5. Hak Anda</h2>
            <p className="text-slate-600 leading-relaxed">
              Anda berhak untuk:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li>Meminta akses ke data pribadi yang kami simpan.</li>
              <li>Meminta koreksi data yang tidak akurat.</li>
              <li>Meminta penghapusan data pribadi Anda.</li>
              <li>Menarik persetujuan tracking (melalui pengaturan cookies).</li>
            </ul>

            <h2 className="text-xl font-black text-slate-800 mt-8 mb-4">6. Kontak Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami:
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