'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Container, Card, Badge, PageLoader, Button, Avatar, EmptyState } from '@/components/ui';
import { useNotifications, revalidate } from '@/lib/hooks';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaBell, FaCircleCheck, FaBox, FaFileInvoiceDollar, 
  FaTriangleExclamation, FaStore, FaClock, FaCheckDouble 
} from 'react-icons/fa6';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NOTIF_ICONS: Record<string, any> = {
  RFQ_MATCH: { icon: FaStore, color: 'text-jax-blue bg-jax-blue/10' },
  QUOTE_RECEIVED: { icon: FaFileInvoiceDollar, color: 'text-jax-teal bg-jax-teal/10' },
  ORDER_CREATED: { icon: FaBox, color: 'text-emerald-500 bg-emerald-500/10' },
  MILESTONE_SUBMITTED: { icon: FaClock, color: 'text-amber-500 bg-amber-500/10' },
  MILESTONE_APPROVED: { icon: FaCircleCheck, color: 'text-emerald-500 bg-emerald-500/10' },
  DISPUTE_OPENED: { icon: FaTriangleExclamation, color: 'text-red-500 bg-red-500/10' },
  SYSTEM: { icon: FaBell, color: 'text-gray-500 bg-gray-500/10' },
};

export default function NotificationsPage() {
  const { data, isLoading, mutate } = useNotifications();
  const notifications = data?.notifications || [];

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      mutate();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      mutate();
    } catch (err) {}
  };

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-100 mb-8">
        <Container size="lg" className="py-12">
           <div className="flex items-end justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-3">
                    <FaBell className="h-3 w-3 text-jax-accent" />
                    <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Communication Center</span>
                 </div>
                 <h1 className="text-4xl font-heading font-black text-jax-dark tracking-tighter leading-none mb-2">Internal Alerts</h1>
                 <p className="text-sm text-gray-500 font-medium">Real-time signal stream for RFQs, orders, and fulfillment updates.</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllRead}
                icon={<FaCheckDouble />}
                className="text-[10px] font-black uppercase tracking-widest border-gray-200"
              >
                Clear All New
              </Button>
           </div>
        </Container>
      </div>

      <Container size="lg" className="pb-24">
        {!notifications.length ? (
          <EmptyState 
            icon={<FaBell className="h-12 w-12 text-gray-200" />}
            title="Clean State Protocol"
            description="You have no active alerts. New signals from trade partners will appear here in real-time."
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any, i: number) => {
              const Config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.SYSTEM;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className={`group border-transparent transition-all p-0 overflow-hidden ${!notif.isRead ? 'bg-white shadow-xl shadow-jax-blue/5 border-jax-blue/10' : 'bg-gray-50/50'}`}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <div className="flex items-start p-6 gap-6">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${Config.color}`}>
                        <Config.icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-heading font-black text-sm uppercase tracking-tight ${!notif.isRead ? 'text-jax-dark' : 'text-gray-500'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-bold text-gray-400">
                             {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed max-w-2xl ${!notif.isRead ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                          {notif.body}
                        </p>
                        
                        {!notif.isRead && (
                          <div className="mt-4 flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-jax-accent animate-pulse" />
                             <span className="text-[8px] font-black text-jax-accent uppercase tracking-widest">New Priority Signal</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
