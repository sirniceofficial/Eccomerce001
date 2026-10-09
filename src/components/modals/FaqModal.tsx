import InfoModal from './InfoModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "What is your return policy?",
    answer: "14-day returns if unused and in original packaging."
  },
  {
    question: "What payment methods do you accept?",
    answer: "M-Pesa, Visa/MasterCard, and Stripe are accepted."
  },
  {
    question: "How long does shipping take?",
    answer: "2–7 business days nationwide."
  },
  {
    question: "How can I contact support?",
    answer: "Call +254 769 353 430 or WhatsApp 24/7!"
  }
];

const FaqModal = ({ isOpen, onClose }: FaqModalProps) => {
  return (
    <InfoModal isOpen={isOpen} onClose={onClose} title="Frequently Asked Questions">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-card-light-foreground/10">
            <AccordionTrigger className="text-card-light-foreground hover:text-card-light-foreground/80 text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-card-light-foreground/70">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </InfoModal>
  );
};

export default FaqModal;
