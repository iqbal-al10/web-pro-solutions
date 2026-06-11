import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials({ t }) {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  useEffect(() => {
    if (reviews.length > itemsPerPage && !isPaused) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [reviews, totalPages, isPaused]);

  if (loading || reviews.length === 0) return null;

  const visibleReviews = reviews.slice(currentIndex * itemsPerPage, (currentIndex * itemsPerPage) + itemsPerPage);

  return (
    <div 
      className="h-full flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mb-10 text-left">
        <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] mb-2">{t.testimonials.badge}</h2>
        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{t.testimonials.title}</h3>
      </div>

      <div className="flex-grow min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {visibleReviews.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.387.197-.855-.171-.77-.635l.999-4.583-3.23-3.228c-.34-.34-.159-.926.312-1.01l4.587-.665L7.545.433c.21-.433.813-.433 1.023 0l2.032 4.09 4.587.665c.471.084.652.67.312 1.01l-3.23 3.228.999 4.583c.085.464-.383.197-.77-.635z"/></svg>
                  ))}
                </div>
                <p className="text-slate-500 text-sm italic mb-8 flex-grow leading-relaxed">"{item.comment}"</p>
                <div className="mt-auto border-t border-slate-50 pt-6">
                  <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wider">{item.name}</h4>
                  <p className="text-blue-900 text-[9px] font-bold uppercase mt-1">{item.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex gap-2 mt-8">
        {[...Array(totalPages)].map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-8 bg-blue-900' : 'w-2 bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}