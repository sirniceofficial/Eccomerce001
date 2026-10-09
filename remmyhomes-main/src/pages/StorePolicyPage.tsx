import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Truck, RotateCcw, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StorePolicyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'shipping';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary py-6">
        <div className="container">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Store Policies</h1>
              <p className="text-primary-foreground/80 text-sm">Important information for our customers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="shipping" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Shipping</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Returns</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 bg-card rounded-xl p-6 border border-border">
            <TabsContent value="shipping" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Shipping & Delivery</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">📍 Delivery Areas</h3>
                    <p className="text-muted-foreground">We deliver across Nairobi and all of Kenya through trusted courier partners.</p>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">⏱️ Delivery Timeframes</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex justify-between"><span>Nairobi CBD:</span><span className="text-primary font-medium">1-2 days</span></li>
                      <li className="flex justify-between"><span>Nairobi Suburbs:</span><span className="text-primary font-medium">2-3 days</span></li>
                      <li className="flex justify-between"><span>Outside Nairobi:</span><span className="text-primary font-medium">3-7 days</span></li>
                      <li className="flex justify-between"><span>Remote Areas:</span><span className="text-primary font-medium">5-10 days</span></li>
                    </ul>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">💰 Delivery Fees</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex justify-between"><span>CBD (orders above KSh 2,000):</span><span className="text-green-500 font-medium">FREE</span></li>
                      <li className="flex justify-between"><span>Nairobi:</span><span className="text-primary font-medium">KSh 200-500</span></li>
                      <li className="flex justify-between"><span>Outside Nairobi:</span><span className="text-primary font-medium">KSh 500-1,500</span></li>
                    </ul>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">📦 Order Tracking</h3>
                    <p className="text-muted-foreground text-sm">Tracking number sent via SMS/email after dispatch. Call +254 769 353 430 for updates.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="returns" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Returns & Refunds</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <h3 className="font-bold text-foreground mb-3">✅ Eligible for Return</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• 14-day return window from delivery</li>
                      <li>• Unused items in original condition</li>
                      <li>• Original packaging with tags attached</li>
                      <li>• Valid receipt or order confirmation</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                    <h3 className="font-bold text-foreground mb-3">❌ Non-Returnable Items</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Opened/used electronics</li>
                      <li>• Personal care items</li>
                      <li>• Custom/personalized products</li>
                      <li>• Sale items (final sale)</li>
                    </ul>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4 md:col-span-2">
                    <h3 className="font-bold text-foreground mb-3">📋 Return Process</h3>
                    <div className="grid sm:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                        <p className="text-muted-foreground">Contact us at +254 769 353 430</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                        <p className="text-muted-foreground">Provide order number</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                        <p className="text-muted-foreground">Package securely</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                        <p className="text-muted-foreground">Return or pickup arranged</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 md:col-span-2">
                    <h3 className="font-bold text-foreground mb-2">💳 Refund Timeline</h3>
                    <p className="text-muted-foreground text-sm">Refunds processed within 5-7 business days via M-Pesa or original payment method after item inspection.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terms" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Terms & Conditions</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { title: '1. Agreement', content: 'By accessing and using Remmy Home website and services, you agree to be bound by these Terms & Conditions.' },
                    { title: '2. Products & Pricing', content: 'All prices are in Kenyan Shillings (KSh). Prices and availability are subject to change without notice.' },
                    { title: '3. Payment', content: 'We accept M-Pesa, credit/debit cards, and bank transfers. Full payment is required before order dispatch.' },
                    { title: '4. Delivery', content: 'Delivery times are estimates only. We are not liable for delays caused by courier services or circumstances beyond our control.' },
                    { title: '5. Warranty', content: 'Products come with manufacturer warranties where applicable. Warranty claims should be directed to the manufacturer.' },
                    { title: '6. Governing Law', content: 'These terms are governed by the laws of Kenya. Any disputes will be resolved in Kenyan courts.' },
                  ].map((term, index) => (
                    <div key={index} className="bg-accent/30 rounded-lg p-4">
                      <h3 className="font-bold text-foreground mb-2">{term.title}</h3>
                      <p className="text-muted-foreground text-sm">{term.content}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    <strong>Questions?</strong> Contact us at info@remmyhome.co.ke or +254 769 353 430
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">📊 Data We Collect</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Name and contact information</li>
                      <li>• Delivery address</li>
                      <li>• Payment information</li>
                      <li>• Browsing and purchase history</li>
                    </ul>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-3">🎯 How We Use It</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Process and fulfill orders</li>
                      <li>• Provide customer support</li>
                      <li>• Improve our services</li>
                      <li>• Send promotional offers (with consent)</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <h3 className="font-bold text-foreground mb-3">🔐 Data Protection</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• SSL encrypted transactions</li>
                      <li>• Secure data storage</li>
                      <li>• Limited employee access</li>
                      <li>• Regular security audits</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h3 className="font-bold text-foreground mb-3">👤 Your Rights</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Access your personal data</li>
                      <li>• Request data correction</li>
                      <li>• Request data deletion</li>
                      <li>• Opt-out of marketing</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    <strong>Privacy Concerns?</strong> Contact info@remmyhome.co.ke<br/>
                    <span className="text-xs">Last Updated: January 2026</span>
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default StorePolicyPage;
