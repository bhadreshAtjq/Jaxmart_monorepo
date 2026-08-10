'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { clsx } from 'clsx';
import {
  FaMagnifyingGlass,
  FaFolder,
  FaTag,
  FaBuilding,
  FaArrowRight,
  FaClock,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { useSearchSuggestions } from '@/lib/hooks';

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  initialValue?: string;
  compact?: boolean;
  onSearchSubmit?: (query: string) => void;
}

export function SearchAutocomplete({
  placeholder = 'Search products, categories, suppliers...',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  initialValue = '',
  compact = false,
  onSearchSubmit,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialValue
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounce query change (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions
  const { data, isLoading } = useSearchSuggestions(debouncedQuery);
  const suggestions = data || { categories: [], listings: [], brands: [], recent: [] };

  // Combine flat list of nav items for keyboard arrow navigation
  const flatItems: Array<{
    type: 'recent' | 'category' | 'brand' | 'listing' | 'all';
    id?: string;
    title: string;
    subtitle?: string;
    price?: string;
    image?: string | null;
    url: string;
  }> = [];

  if (!query.trim() && suggestions.recent?.length) {
    suggestions.recent.forEach((r: string) => {
      flatItems.push({
        type: 'recent',
        title: r,
        url: `/search?q=${encodeURIComponent(r)}`,
      });
    });
  }

  if (query.trim()) {
    if (suggestions.categories?.length) {
      suggestions.categories.forEach((c: any) => {
        flatItems.push({
          type: 'category',
          id: c.id,
          title: c.name,
          subtitle: c.parentName ? `In ${c.parentName}` : 'Category',
          url: `/search?category=${encodeURIComponent(c.id)}`,
        });
      });
    }

    if (suggestions.brands?.length) {
      suggestions.brands.forEach((b: string) => {
        flatItems.push({
          type: 'brand',
          title: b,
          subtitle: 'Verified Brand / Supplier',
          url: `/search?q=${encodeURIComponent(b)}`,
        });
      });
    }

    if (suggestions.listings?.length) {
      suggestions.listings.forEach((l: any) => {
        flatItems.push({
          type: 'listing',
          id: l.id,
          title: l.title,
          subtitle: l.sellerName || l.categoryName,
          price: l.pricePerUnit ? `₹${l.pricePerUnit.toLocaleString('en-IN')}/${l.unitOfMeasure || 'Unit'}` : undefined,
          image: l.image,
          url: `/listings/${l.id}`,
        });
      });
    }

    flatItems.push({
      type: 'all',
      title: `View all results for "${query.trim()}"`,
      url: `/search?q=${encodeURIComponent(query.trim())}`,
    });
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search submit
  const triggerSearch = (urlOrTerm?: string) => {
    setIsOpen(false);
    setActiveIndex(-1);

    if (typeof urlOrTerm === 'string' && urlOrTerm.startsWith('/')) {
      router.push(urlOrTerm);
      return;
    }

    const searchTerm = (urlOrTerm || query).trim();
    if (!searchTerm) return;

    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      if (e.key === 'Enter') {
        triggerSearch();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        triggerSearch(flatItems[activeIndex].url);
      } else {
        triggerSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-jungle-green-500 focus-within:ring-2 focus-within:ring-jungle-green-500/20 transition-all bg-white shadow-sm">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={clsx(
              'w-full text-sm outline-none px-4 text-gray-800 placeholder-gray-400 bg-transparent font-medium',
              compact ? 'h-10' : 'h-12',
              inputClassName
            )}
          />

          {/* Loading or Clear Icon */}
          <div className="flex items-center gap-1.5 pr-3">
            {isLoading && (
              <FaSpinner className="h-3.5 w-3.5 text-jungle-green-500 animate-spin" />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              >
                <FaXmark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => triggerSearch()}
          className={clsx(
            'bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white px-5 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider',
            buttonClassName
          )}
        >
          <FaMagnifyingGlass className="h-3.5 w-3.5" />
          {!compact && <span>Search</span>}
        </button>
      </div>

      {/* Dropdown Suggestions Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {!query.trim() && (
            <div className="p-3 bg-slate-50/60 border-b border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2">
                Popular Searches
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5 px-2">
                {suggestions.recent?.map((term: string, idx: number) => {
                  const isHighlighted = flatItems[idx]?.title === term && activeIndex === idx;
                  return (
                    <button
                      key={term}
                      onClick={() => triggerSearch(`/search?q=${encodeURIComponent(term)}`)}
                      className={clsx(
                        'text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all',
                        isHighlighted
                          ? 'bg-jungle-green-50 border-jungle-green-300 text-jungle-green-700 font-semibold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-jungle-green-300 hover:text-jungle-green-600'
                      )}
                    >
                      <FaClock className="h-3 w-3 text-gray-400" />
                      <span>{term}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {query.trim() && flatItems.length === 1 && flatItems[0].type === 'all' && (
            <div className="p-4 text-center text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded font-mono text-[10px]">Enter</kbd> to search for "{query}"
            </div>
          )}

          {query.trim() && flatItems.length > 0 && (
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 py-1">
              {/* Render items by category */}
              {suggestions.categories?.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaFolder className="h-3 w-3 text-amber-500" /> Categories
                  </div>
                  {suggestions.categories.map((c: any) => {
                    const itemUrl = `/search?category=${encodeURIComponent(c.id)}`;
                    const itemIdx = flatItems.findIndex((i) => i.url === itemUrl);
                    const isSelected = activeIndex === itemIdx;
                    return (
                      <div
                        key={c.id}
                        onClick={() => triggerSearch(itemUrl)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                        className={clsx(
                          'px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs font-medium',
                          isSelected ? 'bg-jungle-green-50/80 text-jungle-green-900' : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{c.name}</span>
                          {c.parentName && (
                            <span className="text-[11px] text-gray-400 font-normal">
                              in {c.parentName}
                            </span>
                          )}
                        </div>
                        <FaArrowRight className={clsx('h-3 w-3 transition-transform', isSelected ? 'text-jungle-green-600 translate-x-1' : 'text-gray-300')} />
                      </div>
                    );
                  })}
                </div>
              )}

              {suggestions.brands?.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaBuilding className="h-3 w-3 text-blue-500" /> Suppliers & Brands
                  </div>
                  {suggestions.brands.map((b: string) => {
                    const itemUrl = `/search?q=${encodeURIComponent(b)}`;
                    const itemIdx = flatItems.findIndex((i) => i.url === itemUrl);
                    const isSelected = activeIndex === itemIdx;
                    return (
                      <div
                        key={b}
                        onClick={() => triggerSearch(itemUrl)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                        className={clsx(
                          'px-4 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs font-medium',
                          isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{b}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-100">
                            Verified
                          </span>
                        </div>
                        <FaArrowRight className={clsx('h-3 w-3 transition-transform', isSelected ? 'text-blue-600 translate-x-1' : 'text-gray-300')} />
                      </div>
                    );
                  })}
                </div>
              )}

              {suggestions.listings?.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaTag className="h-3 w-3 text-emerald-500" /> Matching Products
                  </div>
                  {suggestions.listings.map((l: any) => {
                    const itemUrl = `/listings/${l.id}`;
                    const itemIdx = flatItems.findIndex((i) => i.url === itemUrl);
                    const isSelected = activeIndex === itemIdx;
                    return (
                      <div
                        key={l.id}
                        onClick={() => triggerSearch(itemUrl)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                        className={clsx(
                          'px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors text-xs',
                          isSelected ? 'bg-jungle-green-50/80' : 'hover:bg-gray-50'
                        )}
                      >
                        {l.image ? (
                          <div className="h-10 w-10 relative rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                            <Image
                              src={l.image}
                              alt={l.title}
                              fill
                              sizes="40px"
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                            📦
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{l.title}</p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {l.sellerName || l.categoryName}
                          </p>
                        </div>

                        {l.pricePerUnit && (
                          <div className="text-right shrink-0">
                            <span className="font-bold text-jungle-green-600 block">
                              ₹{l.pricePerUnit.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-gray-400">/{l.unitOfMeasure || 'Unit'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Row: View All Results */}
              <div
                onClick={() => triggerSearch(`/search?q=${encodeURIComponent(query.trim())}`)}
                onMouseEnter={() => setActiveIndex(flatItems.length - 1)}
                className={clsx(
                  'px-4 py-3 bg-gradient-to-r from-gray-50 to-emerald-50/50 cursor-pointer flex items-center justify-between text-xs font-bold transition-colors',
                  activeIndex === flatItems.length - 1 ? 'text-jungle-green-700 bg-jungle-green-100/50' : 'text-gray-700 hover:text-jungle-green-600'
                )}
              >
                <span>View all results for "{query.trim()}"</span>
                <FaArrowRight className="h-3.5 w-3.5 text-jungle-green-600" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
