import InfoModal from './InfoModal';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShippingModal = ({ isOpen, onClose }: PolicyModalProps) => (
  <InfoModal isOpen={isOpen} onClose={onClose} title="🚚 Shipping & Delivery" size="large">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Delivery Areas</h4>
        <p className="text-card-light-foreground/70">We deliver across Nairobi and all of Kenya.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Timeframes</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li><strong>Nairobi CBD:</strong> 1-2 days</li>
          <li><strong>Nairobi Suburbs:</strong> 2-3 days</li>
          <li><strong>Outside Nairobi:</strong> 3-7 days</li>
          <li><strong>Remote Areas:</strong> 5-10 days</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Fees</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li><strong>FREE</strong> within CBD for orders above KSh 2,000</li>
          <li><strong>Nairobi:</strong> KSh 200-500</li>
          <li><strong>Outside Nairobi:</strong> KSh 500-1,500</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Tracking</h4>
        <p className="text-card-light-foreground/70">Tracking number sent via SMS/email. Call +254 769 353 430 for updates.</p>
      </div>
    </div>
  </InfoModal>
);

export const ReturnsModal = ({ isOpen, onClose }: PolicyModalProps) => (
  <InfoModal isOpen={isOpen} onClose={onClose} title="↩️ Returns & Refunds" size="large">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Eligibility</h4>
        <p className="text-card-light-foreground/70 mb-2">14-day returns for:</p>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li>Unused items in original condition</li>
          <li>Original packaging with tags</li>
          <li>With receipt/order confirmation</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Non-Returnable</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li>Opened electronics</li>
          <li>Personal care items</li>
          <li>Custom products</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Process</h4>
        <p className="text-card-light-foreground/70">Contact +254 769 353 430 → Provide order number → Package securely → Return/pickup</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Refunds</h4>
        <p className="text-card-light-foreground/70">Processed in 5-7 days via M-Pesa or original payment method.</p>
      </div>
    </div>
  </InfoModal>
);

export const TermsModal = ({ isOpen, onClose }: PolicyModalProps) => (
  <InfoModal isOpen={isOpen} onClose={onClose} title="📜 Terms & Conditions" size="large">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">1. Agreement</h4>
        <p className="text-card-light-foreground/70">By using Remmy Home, you agree to these terms.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">2. Products & Pricing</h4>
        <p className="text-card-light-foreground/70">Prices in KSh, subject to availability and change.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">3. Payment</h4>
        <p className="text-card-light-foreground/70">M-Pesa, cards accepted. Payment before dispatch.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">4. Delivery</h4>
        <p className="text-card-light-foreground/70">Times are estimates. Not liable for courier delays.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">5. Warranty</h4>
        <p className="text-card-light-foreground/70">Manufacturer warranties apply where applicable.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-1">6. Law</h4>
        <p className="text-card-light-foreground/70">Governed by Kenyan law.</p>
      </div>
      <p className="text-card-light-foreground/70 pt-2">
        <strong>Contact:</strong> info@remmyhome.co.ke | +254 769 353 430
      </p>
    </div>
  </InfoModal>
);

export const PrivacyModal = ({ isOpen, onClose }: PolicyModalProps) => (
  <InfoModal isOpen={isOpen} onClose={onClose} title="🔒 Privacy Policy" size="large">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Data Collected</h4>
        <p className="text-card-light-foreground/70">Name, email, phone, address, payment info, browsing data.</p>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Usage</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li>Process orders</li>
          <li>Customer support</li>
          <li>Service improvements</li>
          <li>Promotional offers (with consent)</li>
          <li>Fraud prevention</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Protection</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li>Encrypted payments</li>
          <li>Secure storage</li>
          <li>Limited access</li>
          <li>Regular audits</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-card-light-foreground mb-2">Your Rights</h4>
        <ul className="list-disc pl-6 text-card-light-foreground/70 space-y-1">
          <li>Access data</li>
          <li>Request corrections/deletion</li>
          <li>Opt-out marketing</li>
        </ul>
      </div>
      <p className="text-card-light-foreground/70 pt-2">
        <strong>Contact:</strong> info@remmyhome.co.ke<br/>
        Last Updated: January 2026
      </p>
    </div>
  </InfoModal>
);
