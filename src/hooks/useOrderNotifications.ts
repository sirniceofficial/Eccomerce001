import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusMessages: Record<string, { message: string; icon: React.ElementType }> = {
  pending: { message: 'Your order has been placed!', icon: Clock },
  processing: { message: 'Your order is now being processed!', icon: Package },
  shipped: { message: 'Great news! Your order has been shipped!', icon: Truck },
  delivered: { message: 'Your order has been delivered!', icon: CheckCircle },
  cancelled: { message: 'Your order has been cancelled.', icon: AlertCircle },
};

export const useOrderNotifications = () => {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to order changes for the current user
    const channel = supabase
      .channel(`order-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const orderId = (payload.new.id as string).slice(0, 8).toUpperCase();
          
          const statusInfo = statusMessages[newStatus] || { 
            message: `Order status updated to: ${newStatus}`, 
            icon: Package 
          };

          // Show toast notification with appropriate styling
          if (newStatus === 'delivered') {
            toast.success(`Order #${orderId}: ${statusInfo.message}`, {
              duration: 6000,
              icon: '🎉',
            });
          } else if (newStatus === 'cancelled') {
            toast.error(`Order #${orderId}: ${statusInfo.message}`, {
              duration: 6000,
            });
          } else if (newStatus === 'shipped') {
            toast.success(`Order #${orderId}: ${statusInfo.message}`, {
              duration: 5000,
              icon: '📦',
            });
          } else {
            toast.info(`Order #${orderId}: ${statusInfo.message}`, {
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const orderId = (payload.new.id as string).slice(0, 8).toUpperCase();
          toast.success(`Order #${orderId} has been created!`, {
            duration: 5000,
            icon: '✅',
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);
};
