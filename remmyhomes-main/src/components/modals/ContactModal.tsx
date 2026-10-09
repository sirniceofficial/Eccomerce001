import { useState } from 'react';
import InfoModal from './InfoModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <InfoModal isOpen={isOpen} onClose={onClose} title="Contact Us">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        <Textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-secondary">
          Send
        </Button>
      </form>
    </InfoModal>
  );
};

export default ContactModal;
