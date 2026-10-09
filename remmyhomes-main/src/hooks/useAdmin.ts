import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  recentOrders: {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
  }[];
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number }[];
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Fetch admin statistics
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(o => o.user_id)).size;

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      orders?.forEach(o => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      // Revenue by day (last 7 days)
      const revenueByDay: { date: string; revenue: number }[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRevenue = orders
          ?.filter(o => o.created_at.startsWith(dateStr))
          .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
        
        revenueByDay.push({ date: dateStr, revenue: dayRevenue });
      }

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalCustomers: uniqueCustomers,
        recentOrders: orders?.slice(0, 10) || [],
        ordersByStatus,
        revenueByDay,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }, [isAdmin]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Trigger notification (would integrate with email service)
      await supabase.functions.invoke('send-order-notification', {
        body: { orderId, status },
      });

      fetchStats();
      return { success: true };
    } catch (error) {
      console.error('Error updating order:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [isAdmin, fetchStats]);

  return {
    isAdmin,
    loading,
    stats,
    fetchStats,
    updateOrderStatus,
    refetchAdminStatus: checkAdminStatus,
  };
};
