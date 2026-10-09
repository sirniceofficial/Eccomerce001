import { useOrderNotifications } from '@/hooks/useOrderNotifications';

export const OrderNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  useOrderNotifications();
  return <>{children}</>;
};
