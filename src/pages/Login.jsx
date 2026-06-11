import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/admin');
        }
      } catch (err) {
        console.error("Gagal mengecek sesi:", err);
      }
    }
    checkSession();
  }, [navigate]);

  const onSubmit = async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      alert("Gagal Login: " + error.message);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">Admin Login</h2>
          <p className="text-slate-500 mt-2 font-medium">Masuk untuk mengelola katalog</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Admin</label>
            <input 
              {...register("email", { required: "Email wajib diisi" })}
              type="email" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
              placeholder="nama@email.com"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input 
                {...register("password", { required: "Password wajib diisi" })}
                type={showPassword ? "text" : "password"} 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition pr-14"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="21" y1="3" x2="3" y2="21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-slate-400 text-sm hover:text-blue-900 transition font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}