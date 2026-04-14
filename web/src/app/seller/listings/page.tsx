'use client';
import { useQuery } from '@tanstack/react-query';
import { 
  FaPlus, FaPenToSquare, FaTrash, 
  FaArrowUpRightFromSquare, FaCubes, FaFilter,
  FaMagnifyingGlass, FaIndustry, FaBoxOpen
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { listingApi } from '@/lib/api';
import { Card, Badge, Button, PageLoader, EmptyState, Container } from '@/components/ui';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SellerListingsPage() {
  const router = useRouter();
  const { data: listings, isLoading } = useQuery({
    queryKey: ['seller', 'listings'],
    queryFn: () => listingApi.getMine().then(r => r.data),
  });

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;
  const items = listings?.listings ?? [];

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-100 mb-8">
        <Container size="xl" className="py-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <FaIndustry className="text-jax-accent h-3 w-3" />
                   <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Supplier Inventory Management</span>
                </div>
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2">My Sourcing Catalog</h1>
                <p className="text-sm text-gray-500 font-medium">Control your active factory output and global distribution listings.</p>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-8 px-8 py-3 bg-gray-50 rounded-2xl border border-gray-100 mr-2">
                    <div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">Active SKUs</p>
                       <p className="text-xl font-black text-jax-dark text-right leading-none">{items.length}</p>
                    </div>
                 </div>
                 <Button className="h-14 px-8 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 font-black uppercase tracking-widest text-[10px]" icon={<FaPlus />} onClick={() => router.push('/seller/listings/new')}>
                    Add New Product
                 </Button>
              </div>
           </div>
        </Container>
      </div>

      <Container size="xl" className="pb-24">
        {!items.length ? (
          <EmptyState
            icon={<FaBoxOpen className="h-12 w-12 text-gray-200" />}
            title="Registry Empty"
            description="Your supplier catalog currently has no indexed products. Start broadcasting your capabilities to the marketplace."
            action={<Button className="h-12 px-10 bg-jax-dark text-white" onClick={() => router.push('/seller/listings/new')}>Initial SKU Upload</Button>}
          />
        ) : (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-8">
                   <h2 className="text-[10px] font-black text-jax-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <FaCubes className="text-jax-accent" /> Active Inventory Ledger
                   </h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative group">
                      <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input placeholder="Filter SKUs..." className="h-10 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-[10px] font-black uppercase outline-none focus:border-jax-accent w-48 shadow-sm" />
                   </div>
                </div>
             </div>

             <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-black/[0.02]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {['Product / SKU Details', 'Market Segment', 'Commercial Quote', 'Registry Status', 'Management'].map((h, i) => (
                        <th key={h} className={`px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((l: any, i: number) => (
                      <motion.tr 
                        key={l.id} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white overflow-hidden border border-gray-100 shadow-sm shrink-0 flex items-center justify-center">
                              {l.media?.[0] ? 
                                <img src={l.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : 
                                <FaCubes className="h-5 w-5 text-gray-200" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-jax-dark uppercase tracking-tight text-sm group-hover:text-jax-accent transition-colors truncate max-w-[280px]">{l.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge status={l.listingType} className="text-[8px] bg-jax-blue/5 text-jax-blue border-none" />
                                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">ID: #{l.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{l.category?.name}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-base font-heading font-black text-jax-dark tracking-tighter">
                            {l.productDetail?.priceOnRequest ? 
                              <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Quote Req</span> : 
                              `₹${l.productDetail?.pricePerUnit?.toLocaleString() || '-'}`
                            }
                          </p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Per {l.productDetail?.unitOfMeasure || 'Unit'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <Badge status={l.status} className="text-[8px]" />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => router.push(`/listings/${l.id}`)} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-jax-blue hover:bg-jax-blue/5 transition-all"><FaArrowUpRightFromSquare className="h-4 w-4" /></button>
                            <button className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-jax-accent hover:bg-jax-accent/5 transition-all"><FaPenToSquare className="h-4 w-4" /></button>
                            <button onClick={() => toast.error('Shielded: Cannot delete active inventory')} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><FaTrash className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
