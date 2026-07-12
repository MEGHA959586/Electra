import React from "react";
import { Star, RotateCcw, Filter, ChevronRight } from "lucide-react";

interface SidebarFiltersProps {
  brands: string[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  onlyInStock: boolean;
  setOnlyInStock: (stock: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  clearFilters: () => void;
  maxPriceLimit: number;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  brands,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onlyInStock,
  setOnlyInStock,
  sortBy,
  setSortBy,
  clearFilters,
  maxPriceLimit
}) => {
  return (
    <aside id="sidebar-filters" className="w-full lg:w-64 shrink-0 bg-white border border-zinc-200 rounded-none p-5 shadow-none space-y-6">
      
      {/* Title & Clear Filters */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 font-display font-bold uppercase tracking-wider text-zinc-900 text-xs">
          <Filter className="h-3 w-3" />
          <span>Catalog Filters</span>
        </div>
        <button
          id="clear-filters-btn"
          onClick={clearFilters}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-950 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sort By</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block w-full py-1.5 px-2.5 border border-zinc-200 bg-white rounded-none text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
        >
          <option value="popular">Popularity</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="stock">In Stock First</option>
        </select>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price Range</label>
          <span className="text-xs font-mono font-bold text-zinc-800">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <input
          id="price-range-slider"
          type="range"
          min="0"
          max={Math.ceil(maxPriceLimit) || 1200}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
          className="w-full h-1 bg-zinc-200 appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>Min: $0</span>
          <span>Max: ${Math.ceil(maxPriceLimit)}</span>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Brand</label>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
          <label className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors">
            <input
              type="radio"
              name="brand-filter"
              checked={selectedBrand === "All"}
              onChange={() => setSelectedBrand("All")}
              className="rounded-none border-zinc-300 text-zinc-950 focus:ring-blue-600 h-3 w-3 accent-zinc-950"
            />
            <span className="tracking-wide">All Brands</span>
          </label>
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors">
              <input
                type="radio"
                name="brand-filter"
                checked={selectedBrand === brand}
                onChange={() => setSelectedBrand(brand)}
                className="rounded-none border-zinc-300 text-zinc-950 focus:ring-blue-600 h-3 w-3 accent-zinc-950"
              />
              <span className="tracking-wide">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Minimum Rating</label>
        <div className="flex flex-col gap-1">
          {[4.5, 4.0, 3.5, 0].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`flex items-center justify-between text-left px-2 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all border ${
                minRating === rating
                  ? "bg-zinc-950 text-white border-zinc-950 font-black"
                  : "bg-white border-zinc-150 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Star className={`h-3 w-3 ${minRating === rating ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
                <span>{rating === 0 ? "Any Rating" : `${rating} & Up`}</span>
              </div>
              <ChevronRight className="h-3 w-3 opacity-55" />
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="pt-3 border-t border-zinc-100">
        <label className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
          <input
            id="stock-toggle-checkbox"
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="rounded-none border-zinc-300 text-zinc-950 focus:ring-blue-600 h-3.5 w-3.5 accent-zinc-950"
          />
          <span>In Stock Only</span>
        </label>
      </div>

    </aside>
  );
};
