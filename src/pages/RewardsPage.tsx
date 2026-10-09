import { useNavigate } from 'react-router-dom';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import LoyaltyBanner from '@/components/LoyaltyBanner';

const RewardsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader title="Rewards Program" />
      <main className="flex-1 container mx-auto px-4 pt-20">
        <LoyaltyBanner />
      </main>
      <SimpleFooter />
    </div>
  );
};

export default RewardsPage;
