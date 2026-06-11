import { useState } from "react";

export default function PortfolioFilter({ 
  activeCategory, 
  setActiveCategory, 
  sortBy, 
  setSortBy, 
  searchTerm, 
  setSearchTerm,
  showFilters,
  setShowFilters,
  t
}) {
  const categories = ["All", "Corporate", "E-Commerce", "Landing Page", "Portfolio"];
  
  const sortOptions = [
    { v: "newest", l: t.catalog.newest, icon: "🕐" },
    { v: "oldest", l: t.catalog.oldest, icon: "📅" },
    { v: "price-high", l: t.catalog.priceHigh, icon: "💰" },
    { v: "price-low", l: t.catalog.priceLow, icon: "💸" },
    { v: "alpha-az", l: t.catalog.alphaAz, icon: "🔤" },
    { v: "alpha-za", l: t.catalog.alphaZa, icon: "🔤" },
  ];

  const resetAllFilters = () => {
    setActiveCategory("All");
    setSearchTerm("");
    setSortBy("newest");
  };

  const hasActiveFilters = activeCategory !== "All" || searchTerm !== "";
  const activeFiltersCount = [activeCategory !== "All", searchTerm !== ""].filter(Boolean).length;

  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-12 font-['Poppins']">
      
      {/* SEARCH BAR & FILTER TOGGLE */}
      <div className="w-full max-w-2xl flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full px-5 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-blue-900 outline-none transition-all text-sm font-medium shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all border-2 flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? "bg-blue-900 text-white border-blue-900"
              : "bg-white text-slate-800 border-slate-900 hover:border-blue-600"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t.catalog.filterBtn}
          {hasActiveFilters && (
            <span className="ml-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* FILTER PANEL (EXPANDABLE) */}
      {showFilters && (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                {t.catalog.sortBy}
              </label>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setSortBy(opt.v)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center gap-1 ${
                      sortBy === opt.v
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <span>{opt.icon}</span> {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.catalog.filterActive}</span>
              {activeCategory !== "All" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-bold flex items-center gap-1">
                  {t.catalog.category}: {activeCategory}
                  <button onClick={() => setActiveCategory("All")} className="hover:text-red-500 ml-1">✕</button>
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-bold flex items-center gap-1">
                  {t.catalog.search}: {searchTerm.length > 20 ? searchTerm.substring(0, 20) + "..." : searchTerm}
                  <button onClick={() => setSearchTerm("")} className="hover:text-red-500 ml-1">✕</button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold hover:bg-red-600 hover:text-white transition"
              >
                {t.catalog.reset}
              </button>
            </div>
          )}
        </div>
      )}

      {/* KATEGORI BUTTONS */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[12px] md:text-[14px] font-black uppercase transition-all duration-300 border-2 ${
              activeCategory === cat
                ? "bg-blue-900 text-white border-blue-900 shadow-lg"
                : "bg-white text-slate-800 border-slate-900 hover:border-blue-600"
            }`}
          >
            {cat === "All" ? t.catalog.all : cat === "Corporate" ? t.catalog.corporate : cat === "E-Commerce" ? t.catalog.ecommerce : cat === "Landing Page" ? t.catalog.landingPage : t.catalog.portfolio}
          </button>
        ))}
      </div>

      {/* INFO TEXT */}
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {hasActiveFilters ? `${t.catalog.filterResult} (${activeFiltersCount} ${t.catalog.filterActive.toLowerCase()})` : t.catalog.catalogAvailable}
      </div>
    </div>
  );
}