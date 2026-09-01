'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container, Card, Skeleton } from '@/components/ui';
import { useCategories } from '@/lib/hooks';
import {
  FaIndustry,
  FaBuilding,
  FaBolt,
  FaBoxesStacked,
  FaFlask,
  FaBoxOpen,
  FaWheatAwn,
  FaBriefcase,
  FaCubes,
  FaMagnifyingGlass,
  FaArrowRight,
  FaChevronRight,
} from 'react-icons/fa6';
import { clsx } from 'clsx';
import { DEFAULT_CATEGORIES } from '@/lib/taxonomy';

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  'industrial-supplies': { icon: FaIndustry, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300' },
  'construction': { icon: FaBuilding, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-300' },
  'electronics': { icon: FaBolt, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300' },
  'textiles': { icon: FaBoxesStacked, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-300' },
  'chemicals': { icon: FaFlask, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300' },
  'packaging': { icon: FaBoxOpen, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-300' },
  'agriculture': { icon: FaWheatAwn, color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-300' },
  'services': { icon: FaBriefcase, color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300' },
};

export default function CategoriesDirectoryPage() {
  const router = useRouter();
  const { data: serverCategories } = useCategories();
  const categories = (serverCategories && serverCategories.length > 0) ? serverCategories : DEFAULT_CATEGORIES;
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter((cat: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (cat.name.toLowerCase().includes(q)) return true;
    return cat.children?.some((c: any) => c.name.toLowerCase().includes(q));
  });

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-12 border-b border-gray-200">
        <Container size="xl">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 text-jungle-green-700 font-bold text-xs uppercase tracking-wider mb-2">
              <FaBoxesStacked className="h-3.5 w-3.5" /> Complete Industry Taxonomy
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 tracking-tight mb-4">
              All Manufacturing Markets & Categories
            </h1>
            <p className="text-base text-gray-600 leading-relaxed font-normal">
              Explore India&apos;s most comprehensive directory of verified B2B suppliers, manufacturers, exporters, and wholesale distributors.
            </p>

            {/* Search filter */}
            <div className="mt-8 relative max-w-xl">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Filter categories (e.g. Fasteners, Chemicals, Textiles, Solar)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-jungle-green-600 rounded-2xl pl-11 pr-4 py-3.5 text-sm shadow-sm outline-none"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCategories.length === 0 ? (
              <div className="col-span-2 text-center py-20 text-gray-400">
                No categories matched your search &quot;{search}&quot;.
              </div>
            ) : (
              filteredCategories.map((cat: any) => {
                const meta = CATEGORY_META[cat.slug] || {
                  icon: FaCubes,
                  color: 'text-jungle-green-600',
                  bg: 'bg-jungle-green-50',
                  border: 'hover:border-jungle-green-300',
                };
                const Icon = meta.icon;
                const children = cat.children || [];

                return (
                  <div
                    key={cat.id}
                    className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top bar with Icon & Title */}
                      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div
                            className={clsx(
                              'h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
                              meta.bg,
                              meta.color
                            )}
                          >
                            <Icon className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="font-heading font-black text-gray-900 text-xl">
                              {cat.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {children.length} Major Subcategories
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/search?category=${cat.id}`}
                          className="text-xs font-bold text-jungle-green-700 hover:underline flex items-center gap-1 shrink-0"
                        >
                          View All <FaChevronRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>

                      {/* Subcategories list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {children.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/search?category=${sub.id}`}
                            className="p-3 rounded-2xl bg-gray-50 hover:bg-jungle-green-50 hover:text-jungle-green-800 text-gray-700 text-xs font-bold transition-all flex items-center justify-between group"
                          >
                            <span className="truncate">{sub.name}</span>
                            <FaArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-jungle-green-600 shrink-0 ml-1 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>Verified Indian Manufacturers & Wholesalers</span>
                      <Link
                        href={`/rfq/create?categoryId=${cat.id}`}
                        className="font-bold text-jungle-green-700 hover:underline"
                      >
                        Post Buy Requirement →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
