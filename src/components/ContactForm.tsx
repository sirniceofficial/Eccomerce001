import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
  };
  return <section className="mt-8 my-[30px] opacity-90">
      <h3 className="font-display text-foreground text-lg md:text-xl mb-4">Get in Touch</h3>
      <form onSubmit={handleSubmit} className="bg-accent/30 p-5 rounded-lg max-w-xl space-y-4">
        <div>
          <label className="text-muted-foreground text-sm block mb-1">Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} required className="bg-accent/50 border-accent text-foreground" />
        </div>
        <div>
          <label className="text-muted-foreground text-sm block mb-1">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-accent/50 border-accent text-foreground" />
        </div>
        <div>
          <label className="text-muted-foreground text-sm block mb-1">Message</label>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="bg-accent/50 border-accent text-foreground" />
        </div>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-secondary">
          Send Message
        </Button>
      </form>
    </section>;
};
export default ContactForm;