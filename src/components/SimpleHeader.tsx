import { useNavigate } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SimpleHeaderProps {
  title?: string;
}

const SimpleHeader = ({ title }: SimpleHeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-extrabold text-sm shadow-gold cursor-pointer"
            onClick={() => navigate('/')}
          >
            RE
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-lg font-bold text-foreground">{title || 'Remmy HomesHub'}</h1>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          {user && (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SimpleHeader;
