import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Mic2, 
  Play, 
  FileText, 
  Award, 
  ChevronDown, 
  ShieldCheck, 
  ArrowRight,
  MessageCircle,
  X,
  CreditCard,
  Zap,
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  ExternalLink,
  Download,
  Video,
  Smartphone,
  Copy,
  Share2
} from 'lucide-react';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// --- Global Logic ---
const EARLY_BIRD_END = new Date('2026-06-30T23:59:59');
const EARLY_BIRD_PRICE = 7000;
const REGULAR_PRICE = 10000;

function getCurrentPrice() {
  return new Date() < EARLY_BIRD_END ? EARLY_BIRD_PRICE : REGULAR_PRICE;
}

function formatPrice(amount: number) {
  return '₦' + amount.toLocaleString('en-NG');
}

// --- Checkout Modal ---

const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formCompleted, setFormCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIX 1: Add paymentSuccessRef to track payment success across closures
  const paymentSuccessRef = React.useRef(false);

  const effectivePublicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  const [cancelMsg, setCancelMsg] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Fluent Form Completion Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[Modal] Received postMessage:', event.data);
      if (event.data?.type === 'fluentform_submission_success') {
        const { name, email, phone } = event.data.data || {};

        // Skip empty submissions
        if (!email || !email.trim()) {
          console.log('[Modal] Skipping empty submission');
          return;
        }

        console.log('[Modal] Form data captured:', { name, email, phone });
        setFormData({ 
          name: name || '', 
          email: email || '', 
          phone: phone || '' 
        });
        setFormCompleted(true);
        setStep(2);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setFormCompleted(false);
        setError(null);
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen]);

  // Safety net: Clear isLoading if Flutterwave fails to trigger
  useEffect(() => {
    let timeout: any;
    if (isLoading && !paymentSuccessRef.current) {
      timeout = setTimeout(() => {
        setIsLoading(false);
        console.warn('[Checkout] Payment initialization timed out.');
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const price = getCurrentPrice();
  const formatted = formatPrice(price);
  const isEarlyBird = new Date() < EARLY_BIRD_END;

  const flutterwaveConfig = React.useMemo(() => ({
    public_key: effectivePublicKey || '',
    tx_ref: 'TAHCC_FW_' + Date.now(),
    amount: price,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,account,banktransfer',
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: formData.name,
    },
    customizations: {
      title: 'The Teacher & Her Classroom',
      description: `Registration for ${formatted} package`,
      logo: 'https://www.theteacherandherclassroom.ng/wp-content/uploads/2024/01/logo.png',
    },
  }), [price, formData, effectivePublicKey, formatted]);

  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  const handlePaymentStart = () => {
    if (!effectivePublicKey) {
      console.error('Flutterwave Public Key is missing.');
      return setError('Payment system is currently being configured.');
    }

    setIsLoading(true);
    setError(null);
    setCancelMsg(false);
    paymentSuccessRef.current = false;

    handleFlutterwavePayment({
      ...flutterwaveConfig,
      callback: (response: any) => {
        if (
          response.status === 'successful' ||
          response.status === 'success' ||
          response.status === 'completed'
        ) {
          paymentSuccessRef.current = true;
          handlePaymentSuccess(
            String(response.transaction_id || response.tx_ref || response.id),
            'flutterwave'
          );
        } else {
          setIsLoading(false);
          closePaymentModal();
        }
      },
      onClose: () => {
        if (!paymentSuccessRef.current) {
          setIsLoading(false);
          setCancelMsg(true);
          setTimeout(() => setCancelMsg(false), 5000);
        }
      }
    });
  };

  const handlePaymentSuccess = (transaction_id: string, gateway: string) => {
    setIsLoading(true);
    const redirectUrl = `/thankyou.html?ref=${transaction_id}&gateway=${gateway}`;
    window.location.href = redirectUrl;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/95 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-card border border-border-custom w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col lg:grid lg:grid-cols-[380px_1fr]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Order Summary - Side on desktop, Toggle on mobile */}
            <div className="bg-bg-section border-r border-border-custom order-1 lg:order-1 pt-12 lg:pt-0 overflow-y-auto">
              {/* Mobile Toggle Header */}
              <button 
                type="button"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="w-full p-6 flex lg:hidden items-center justify-between border-b border-border-custom bg-bg-section/50"
              >
                <div className="flex items-center gap-2 text-primary-orange font-mono text-[10px] font-bold tracking-widest uppercase">
                  <Zap className="w-3 h-3" /> Order Summary
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-white font-bold">{formatted}</span>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isSummaryExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <div className={`${isSummaryExpanded ? 'block' : 'hidden'} lg:block p-8`}>
                <div className="hidden lg:flex items-center gap-2 text-primary-orange font-mono text-[10px] font-bold tracking-widest uppercase mb-6">
                  <Zap className="w-3 h-3" /> Order Summary
                </div>
                <h3 className="text-xl text-text-white mb-6 font-display">Your Registration</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-white">Conference 2026 Ticket</span>
                    <span className="font-bold text-primary-orange">{formatted}</span>
                  </div>
                  {[
                    "Session Replays",
                    "Participation Certificate",
                    "Resource Materials",
                    "Community Access"
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-[13px] text-text-muted">
                      <span>{item}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Included</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border-custom">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-text-white">Total</span>
                    <span className="text-3xl text-primary-orange font-display">{formatted}</span>
                  </div>
                  <p className="text-[11px] text-text-dim mt-2 text-right">
                    {isEarlyBird ? 'Early bird price.' : 'Standard price'}
                  </p>
                </div>

                <div className="mt-10 space-y-3">
                  <div className="bg-bg-card border border-primary-orange/20 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary-orange shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-text-white uppercase tracking-wider">Secure Payment</div>
                      <div className="text-[10px] text-text-muted">SSL encrypted checkout</div>
                    </div>
                  </div>
                  <div className="bg-bg-card border border-primary-orange/20 rounded-lg p-4 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary-orange shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-text-white uppercase tracking-wider">Safe Checkout</div>
                      <div className="text-[10px] text-text-muted">Powered by Flutterwave</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col h-full overflow-y-auto order-2 lg:order-2">
              {step === 1 ? (
                <div className="flex flex-col h-full bg-bg-card">
                  <div className="p-8 pb-4 border-b border-border-custom">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-orange text-white font-mono text-sm font-bold">1</div>
                      <h2 className="text-2xl text-text-white font-display">Contact Information</h2>
                    </div>
                    <p className="text-sm text-text-muted">Fill the form below to lock in your details. We'll use this to send your tickets.</p>
                  </div>

                  <div className="flex-1 min-h-[500px] relative">
                    <iframe 
                      id="fluentform"
                      src="https://www.theteacherandherclassroom.ng/?ff_landing=3&embedded=1" 
                      className="w-full h-full min-h-[500px] border-none bg-transparent"
                      title="Registration Form"
                      loading="lazy"
                    />
                    {!formCompleted && (
                      <div className="absolute top-4 right-4 animate-pulse">
                        <div className="bg-primary-orange/20 text-primary-orange text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary-orange/30">
                          Waiting for form...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-12">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white"><Check className="w-5 h-5" /></div>
                      <h2 className="text-3xl text-text-white font-display">Review & Pay</h2>
                    </div>
                    <p className="text-sm text-text-muted">Your contact details have been captured. Complete your payment to lock in your spot.</p>
                  </div>

                  <div className="bg-bg-section border border-border-custom rounded-xl p-6 mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-1">Attendee Name</div>
                        <div className="text-text-white font-medium">{formData.name || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-1">Email Address</div>
                        <div className="text-text-white font-medium">{formData.email || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-1">Phone Number</div>
                        <div className="text-text-white font-medium">{formData.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-1">Quantity</div>
                        <div className="text-text-white font-medium">1 Registration</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border-custom flex justify-between items-center text-sm">
                      <button 
                        onClick={() => setStep(1)}
                        className="text-primary-orange hover:underline underline-offset-4 flex items-center gap-1"
                      >
                        ← Back to form
                      </button>
                      <span className="text-text-muted">Secure transaction</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-error/10 border border-error text-error text-xs p-3 rounded-md mb-6">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handlePaymentStart}
                    disabled={isLoading}
                    className="w-full bg-primary-orange text-white font-mono text-sm font-bold tracking-wider uppercase py-4 rounded-md transition-all hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Pay {formatted} with Flutterwave <CreditCard className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className="mt-8 pt-8 border-t border-border-custom">
                    <div className="flex items-center justify-center gap-6 opacity-30">
                      <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6 grayscale" />
                      <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-6 grayscale" />
                      <img src="https://img.icons8.com/color/48/interac.png" alt="Card" className="h-6 grayscale" />
                    </div>
                  </div>

                  {cancelMsg && (
                    <div className="mt-4 text-center text-xs text-primary-orange font-medium animate-pulse">
                      Payment window closed. Your spot is still waiting.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Components ---

const AnnouncementBar = () => {
  const price = getCurrentPrice();
  const formatted = formatPrice(price);
  const isEarlyBird = new Date() < EARLY_BIRD_END;

  return (
    <div className="bg-primary-orange text-white text-center py-2.5 px-5 font-mono text-[13px] font-bold tracking-wider sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
      <Zap className="w-4 h-4 fill-white animate-pulse" />
      <span className="md:hidden">Early Bird ends June 30th</span>
      <span className="hidden md:inline">
        {isEarlyBird ? 'EARLY BIRD ENDS' : 'REGISTRATION OPEN'} <span className="text-bg-dark bg-white/90 px-1.5 py-0.5 rounded-xs mx-1">JUNE 30TH</span> · LOCK IN YOUR SPOT AT <span className="text-bg-dark bg-white/90 px-1.5 py-0.5 rounded-xs mx-1">{formatted}</span> BEFORE PRICE RISES TO ₦10,000
      </span>
      <Zap className="w-4 h-4 fill-white animate-pulse hidden md:block" />
    </div>
  );
};

const Hero = ({ onScrollToPricing }: { onScrollToPricing: () => void }) => {
  const price = getCurrentPrice();
  const formatted = formatPrice(price);
  const videoUrl = "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/215475_tiny.mp4";

  return (
    <section className="relative bg-[#0f0d0b] pt-12 md:pt-16 pb-16 px-5 text-center overflow-hidden min-h-[85vh] flex items-center justify-center">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30 grayscale contrast-125"
          poster="https://picsum.photos/seed/hero-fallback/1920/1080?blur=10"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0d0b]/90 via-[#0f0d0b]/50 to-[#0f0d0b]" />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary-orange/10 border border-primary-orange/30 text-primary-orange font-mono text-[9px] md:text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-full mb-4 md:mb-5 backdrop-blur-md whitespace-nowrap"
        >
          <div className="w-1 h-1 bg-primary-orange rounded-full animate-pulse" />
          Virtual Workshop · August 20–21, 2026
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl text-text-white mb-4 md:mb-5 leading-[1.0] tracking-tight"
        >
          The Classroom Has <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="relative z-10 text-primary-orange">Changed.</span>
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-2 left-0 h-2 md:h-3 bg-primary-orange/20 -z-10"
            />
          </span>
          <br className="hidden md:block" /> Have You?
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xl md:text-2xl text-text-muted max-w-[720px] mx-auto mb-6 md:mb-8 font-normal leading-snug"
        >
          Join Nigeria's most practical teacher conference. 2 days to get the tools you need for the modern classroom.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6 md:mb-10"
        >
          {[
            { icon: Calendar, text: "20th–21st August, 2026" },
            { icon: Clock, text: "9:00 AM Daily" },
            { icon: MapPin, text: "Virtual Event" },
            { icon: Users, text: "3 Expert Speakers" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 font-mono text-xs md:text-sm text-text-muted tracking-wider group">
              <item.icon className="w-4 h-4 text-primary-orange group-hover:scale-110 transition-transform" />
              {item.text}
            </div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative inline-block"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-1 bg-primary-orange/30 blur-xl rounded-full"
          />
          <button 
            onClick={onScrollToPricing}
            className="relative bg-primary-orange text-white font-mono text-sm md:text-base font-bold tracking-wider uppercase px-10 md:px-14 py-5 md:py-6 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-1 shadow-[0_10px_40px_rgba(249,115,22,0.4)] flex items-center gap-3 group"
          >
            JOIN THE 2026 CONFERENCE NOW
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-text-dim font-mono tracking-widest uppercase flex items-center justify-center gap-2"
        >
          <Lock className="w-3 h-3" /> Secure payment via Flutterwave &nbsp;|&nbsp; Price rises to ₦10,000 on July 1st
        </motion.p>
      </div>
    </section>
  );
};

const LeadSection = () => (
  <section className="bg-bg-mid py-20 md:py-28 px-5 border-y border-border-custom relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
    
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-[840px] mx-auto"
    >
      <span className="font-display text-3xl md:text-5xl text-gold tracking-tight mb-8 block leading-none">Dear Teacher,</span>
      <div className="space-y-6 text-base md:text-lg text-[#b8c8df] leading-relaxed font-light">
        <p>You became a teacher because you care about children and their future.</p>
        <p>You show up every day. Sometimes you are not paid enough. Sometimes people do not say thank you. But you still give it your best.</p>
        <p>But lately, something feels <strong className="text-text-white font-semibold">off.</strong></p>
        <p>The students in your class today are not the same as the ones you were trained to teach. They lose focus fast. They are not always interested. They live in a world built on AI, phones, and technology that moves very fast.</p>
        <p>But the tools and teaching methods most Nigerian teachers learned in school? <span className="text-primary-orange font-bold">They have not changed.</span></p>
        <p>No one told you how to handle this. No one gave you new training. No one showed you the way.</p>
        <p>So you try your best. You push through. You cope.</p>
        <p>But in your heart, you keep asking this question:</p>
      </div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-5xl text-text-white tracking-tight leading-tight my-12 p-8 md:p-12 border-l-8 border-primary-orange bg-bg-card/50 backdrop-blur-sm italic relative group"
      >
        <div className="absolute top-4 right-8 text-primary-orange/20 text-8xl font-serif pointer-events-none group-hover:text-primary-orange/30 transition-colors">"</div>
        "Am I really preparing my students for the future or the past?"
      </motion.div>
      
      <div className="space-y-6 text-base md:text-lg text-[#b8c8df] leading-relaxed font-light">
        <p>That feeling is real. And it is <strong className="text-text-white font-semibold">not your fault.</strong></p>
        <p>But here is the truth. The longer you wait, the bigger the gap gets. And your students are the ones who will feel it.</p>
      </div>
    </motion.div>
  </section>
);

const SolutionSection = ({ onScrollToPricing }: { onScrollToPricing: () => void }) => {
  const isEarlyBird = new Date() < EARLY_BIRD_END;

  return (
    <section className="bg-bg-dark py-16 px-5">
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-[780px] mx-auto text-center"
      >
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">The Solution</div>
        <h2 className="text-3xl md:text-5xl text-text-white mb-5">There Is A <span className="text-primary-orange">Better Way.</span></h2>
        <p className="text-base md:text-lg text-[#b8c8df] mb-3.5 max-w-[620px] mx-auto">That is exactly why <strong className="text-text-white">The Teacher And Her Classroom Conference 2026</strong> was created.</p>
        <p className="text-base md:text-lg text-[#b8c8df] mb-7 max-w-[620px] mx-auto">This is not a boring seminar where you sit and listen and forget everything by Monday. This is a live, hands-on, 2-day virtual workshop made just for Nigerian teachers and school leaders who are ready to stop coping and start growing.</p>
        <button 
          onClick={onScrollToPricing}
          className="inline-block bg-primary-orange text-white font-mono text-sm font-bold tracking-wider uppercase px-11 py-4.5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]"
        >
          I'M READY TO TRANSFORM MY CLASSROOM →
        </button>
      </motion.div>
    </section>
  );
};

const IncludedSection = () => (
  <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">What Is Included</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">Everything You Get</h2>
      <p className="text-base md:text-lg text-text-muted max-w-[580px] mb-10">One registration. Two days. Everything you need to change your classroom.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Mic2, title: "2 Days of Live Sessions", desc: "You will learn from 3 real experts in live sessions. No boring slides. No fluff. Just tools you can use right away." },
          { icon: Play, title: "Full Session Replays", desc: "Cannot make it live? No worries. Every session is recorded. You can watch it again and again at your own time." },
          { icon: FileText, title: "Resource Materials", desc: "You will get templates, tools, and resources from all the speakers. Things you can download and use right away." },
          { icon: Award, title: "Participation Certificate", desc: "Every person who joins gets a certificate. You can add it to your portfolio or use it to grow your career." },
          { icon: Users, title: "Exclusive Community Access", desc: "You will join a group of teachers who want to grow. Ask questions, share wins, and keep learning after the conference." },
          { icon: MapPin, title: "Open to All Levels", desc: "Whether you teach primary, secondary, or run a school, this conference was made for you." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border-custom rounded-xl p-8 transition-all hover:border-primary-orange/50 hover:-translate-y-1 relative overflow-hidden group shadow-lg"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <item.icon className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary-orange/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary-orange" />
              </div>
              <h4 className="text-2xl text-text-white mb-3 font-display">{item.title}</h4>
              <p className="text-base text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HostSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Your Host</div>
        <h2 className="text-3xl md:text-5xl text-text-white">Meet The Woman Behind The Conference</h2>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-[680px] mx-auto bg-bg-card border border-border-custom rounded-sm overflow-hidden flex flex-col md:flex-row items-center md:items-stretch"
      >
        <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto p-6 flex items-center justify-center">
          <div className="w-full h-full rounded-lg border-2 border-primary-orange overflow-hidden">
            <img 
              src="https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Mrs.-Stephanie.jpg" 
              alt="Stephanie Joel-Ovo" 
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-7 md:p-8 flex flex-col justify-center">
          <h3 className="font-['Bebas_Neue'] text-[42px] text-text-white leading-none mb-2 tracking-wide">Stephanie Joel-Ovo</h3>
          <div className="font-['Space_Mono'] text-[12px] text-primary-orange uppercase tracking-widest mb-4">
            Host & Founder · Stephanie Global Education
          </div>
          <p className="font-mono text-base md:text-lg text-text-muted leading-relaxed mb-6">
            Stephanie Joel-Ovo is the founder of Stephanie Global Education and the driving force behind The Teacher And Her Classroom Conference. Passionate about transforming education across Nigeria, she has dedicated her work to equipping teachers, empowering school leaders, and ensuring every child has access to quality, future-ready education. This conference is her vision made real.
          </p>
          <div className="inline-block bg-primary-orange/10 border border-primary-orange/30 text-primary-orange font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm self-start">
            POWERED BY STEPHANIE GLOBAL EDUCATION
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const SpeakersSection = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<any>(null);

  const speakers = [
    {
      name: "Fii Stephen",
      title: "AI Consultant & Growth Strategist\nFounder, AI Literacy Academy",
      bio: `Fii Stephen is an AI Consultant, Growth Marketing, and Digital Marketing Professional with over 8 years of experience. He is Generative AI Certified by IBM, AI for Marketing Certified by Davidson College, North Carolina, USA, and one of the Meta Certified Digital Marketing Associates in West Africa. 

Over the past 12 months, Fii has trained over 1,500 people in AI, digital marketing, and personal development. He was awarded the YALI Star of Business as an outstanding participant of the USAID and Mastercard foundation-sponsored Young African Leaders Initiative regional leadership program, in Accra, Ghana.

Fii is the Founder of the AI Literacy Academy and Co-Founder of Claywings Technologies.

He was also recently selected as a research group member at the Centre for AI and Digital Policy, Washington DC, USA.`,
      img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Fii-Stephen-Picture-1.jpeg"
    },
    {
      name: "Similoluwa Adekoye",
      title: "Nigerian Education Advocate\nCertified Chemistry Teacher & Freelance Writer",
      bio: `Similoluwa Adekoye is a Nigerian education advocate, certified Chemistry teacher and expert freelance writer dedicated to transforming educational outcomes across Nigeria. With a B.Sc. Ed. in Chemistry and professional teaching certification (TRCN), she brings both subject expertise and pedagogical insight to her work.

Through her writing and advocacy, Similoluwa addresses curriculum gaps, teacher welfare, and systemic barriers to quality education. She is passionate about equipping teachers with practical tools to succeed in real classrooms and empowering students to thrive. Her work centers on one mission: ensuring every Nigerian child has access to quality education.`,
      img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Similoluwa-Adekoye.jpeg"
    },
    {
      name: "George O. Agbede",
      title: "Online Education Expert\nMicrosoft Certified Educator · Lead Tutor, GLS Academy",
      bio: `George O. Agbede is a seasoned educator, teacher-trainer, and digital learning coach with over 10 years of classroom and virtual teaching experience. As the Lead Tutor at GLS Academy and a Microsoft Certified Educator, he has helped hundreds of students excel in international exams like SAT and UK 11 + while mentoring fellow teachers to transition into online teaching successfully.

He holds multiple certifications including PGCEi, QTS, IGCSE, and TRCN, and is passionate about empowering educators to thrive in 21 st-century classrooms. George is known for his engaging, tech-savvy teaching style and his commitment to building learner-centered environments that foster curiosity, collaboration, and lifelong learning.

Through his work, he equips teachers with the tools and mindset to deliver impactful education beyond borders.`,
      img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/George-Agbede.jpeg"
    }
  ];

  return (
    <section className="bg-bg-dark py-16 px-5">
      <div className="max-w-[1000px] mx-auto">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Your Speakers</div>
        <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">3 Experts. Real Experience. <span className="text-primary-orange">Zero Fluff.</span></h2>
        <p className="text-base md:text-lg text-text-muted max-w-[580px] mb-10">Every speaker is living what they teach. No theory. Just real experience.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {speakers.map((speaker, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-card border border-border-custom rounded-sm overflow-hidden transition-all hover:-translate-y-1 hover:border-border-red group"
            >
              <div className="w-full aspect-[3/4] overflow-hidden relative bg-bg-card2">
                <img 
                  src={speaker.img} 
                  alt={speaker.name} 
                  className="w-full h-full object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-card via-bg-card/40 to-transparent" />
              </div>
              <div className="p-5 pb-6">
                <h3 className="text-[28px] text-text-white mb-1">{speaker.name}</h3>
                <div className="font-mono text-[11px] text-primary-orange tracking-wider uppercase mb-3.5 leading-relaxed whitespace-pre-line">
                  {speaker.title}
                </div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-4">
                  {speaker.bio}
                </p>
                <button 
                  onClick={() => setSelectedSpeaker(speaker)}
                  className="text-primary-orange font-mono text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                >
                  Read Full Bio <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Speaker Modal */}
      <AnimatePresence>
        {selectedSpeaker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpeaker(null)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-bg-card border border-border-custom w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            >
              <button 
                onClick={() => setSelectedSpeaker(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
              >
                <ChevronDown className="w-8 h-8 rotate-90" />
              </button>
              
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                  <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full border-2 border-primary-orange overflow-hidden">
                    <img 
                      src={selectedSpeaker.img} 
                      alt={selectedSpeaker.name} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-4xl text-text-white mb-2 font-display">{selectedSpeaker.name}</h3>
                    <div className="font-mono text-sm text-primary-orange uppercase tracking-widest whitespace-pre-line">
                      {selectedSpeaker.title}
                    </div>
                  </div>
                </div>
                <div className="text-base md:text-lg text-text-muted leading-relaxed whitespace-pre-line font-light">
                  {selectedSpeaker.bio}
                </div>
                <div className="mt-10 pt-8 border-t border-border-custom">
                  <button 
                    onClick={() => setSelectedSpeaker(null)}
                    className="bg-primary-orange text-white font-mono text-sm font-bold tracking-wider uppercase px-8 py-3 rounded-sm hover:bg-primary-dark transition-colors"
                  >
                    Close Bio
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const LearnSection = () => (
  <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">What You Will Learn</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-10">You Will Leave With These Skills:</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-[960px] mx-auto">
        {[
          { num: "01", title: "AI Tools for the Classroom", desc: "Learn how to use AI to plan lessons faster, mark work quicker, and save time. You will not lose your personal touch as a teacher." },
          { num: "02", title: "Modern Classroom Management", desc: "Get simple steps to bring your students back to focus. These are things you can try in your class the very next day." },
          { num: "03", title: "Navigating Nigeria's System", desc: "Learn how to work within the real challenges of teaching in Nigeria and still get great results for your students." },
          { num: "04", title: "Teaching Online for Income", desc: "Find out how to take your teaching skills online, reach more students, and earn money beyond your regular salary." },
          { num: "05", title: "Future-Ready Classroom Tools", desc: "Get the tools and ideas that will make you a teacher your students will never forget." },
          { num: "06", title: "Community and Accountability", desc: "You will not be alone after this. Join other teachers who are growing and who will keep you on track." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 items-start bg-bg-card border border-border-custom rounded-sm p-5 transition-colors hover:border-border-red"
          >
            <div className="font-display text-4xl text-primary-orange opacity-50 leading-none shrink-0 w-9">{item.num}</div>
            <div>
              <h4 className="text-lg text-text-white mb-1.5">{item.title}</h4>
              <p className="text-[13px] text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ComparisonTable = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Free Content vs This Conference</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-10">Why Not Just Watch YouTube?</h2>
      
      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full max-w-[760px] mx-auto border-collapse rounded-sm overflow-hidden min-w-[320px]">
          <thead>
            <tr className="bg-bg-card2">
              <th className="p-2 md:p-4 px-3 md:px-5 text-left font-mono text-[9px] md:text-xs tracking-widest uppercase text-text-muted border-b-2 border-border-custom">Feature</th>
              <th className="p-2 md:p-4 px-3 md:px-5 text-left font-mono text-[9px] md:text-xs tracking-widest uppercase text-text-muted border-b-2 border-border-custom">Free YouTube</th>
              <th className="p-2 md:p-4 px-3 md:px-5 text-left font-mono text-[9px] md:text-xs tracking-widest uppercase text-gold border-b-2 border-border-custom bg-[rgba(240,165,0,0.06)]">✦ Conference</th>
            </tr>
          </thead>
          <tbody className="text-[11px] md:text-sm">
            {[
              ["Tools made for Nigerian teachers", "Too general", "Made for you"],
              ["Ask questions live", "Not possible", "Both days"],
              ["Join a teacher community", "Not included", "Included"],
              ["Get a certificate", "Not included", "Included"],
              ["Watch recordings later", "Not always", "Yours to keep"],
              ["Download tools and resources", "All over the place", "Ready for you"],
              ["3 expert speakers together", "Hours of searching", "2 days"]
            ].map((row, i) => (
              <tr key={i} className={`border-b border-border-custom ${i % 2 === 1 ? 'bg-[rgba(255,255,255,0.018)]' : ''}`}>
                <td className="p-2.5 md:p-3.5 px-3 md:px-5 text-text-white font-semibold leading-tight">{row[0]}</td>
                <td className="p-2.5 md:p-3.5 px-3 md:px-5 text-text-dim leading-tight flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-primary-orange/40 shrink-0" />
                  {row[1]}
                </td>
                <td className="p-2.5 md:p-3.5 px-3 md:px-5 text-gold font-bold bg-[rgba(240,165,0,0.04)] leading-tight">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                    {row[2]}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const PricingSection = ({ onOpenCheckout }: { onOpenCheckout: () => void }) => {
  const price = getCurrentPrice();
  const formatted = formatPrice(price);
  const isEarlyBird = new Date() < EARLY_BIRD_END;

  return (
    <section className="bg-bg-mid py-20 px-5 border-y border-border-custom" id="register">
      <div className="max-w-[1000px] mx-auto text-center">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">How Much Does It Cost</div>
        <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">Get Your Spot Today</h2>
        <p className="text-base text-text-muted max-w-[580px] mx-auto mb-10">The early bird price will not last. Sign up before June ends and save ₦3,000.</p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-[560px] mx-auto bg-bg-card border border-border-red rounded-sm overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.12)]"
        >
          <div className="bg-primary-orange py-4.5 px-7.5 text-center flex items-center justify-center gap-3">
            <Zap className="w-4 h-4 fill-white animate-pulse" />
            <p className="font-mono text-[13px] font-bold tracking-widest uppercase text-[rgba(255,255,255,0.9)]">
              {isEarlyBird ? 'EARLY BIRD · ENDS JUNE 30TH, 2026' : 'REGISTRATION OPEN'}
            </p>
            <Zap className="w-4 h-4 fill-white animate-pulse" />
          </div>
          <div className="p-9 md:p-10 text-left">
            <div className="font-mono text-[15px] text-text-dim line-through mb-1">Regular Price: ₦10,000</div>
            <div className="font-display text-7xl text-gold leading-none mb-1.5">{formatted}</div>
            <div className="font-mono text-[11px] text-text-muted tracking-wider mb-7">
              {isEarlyBird ? 'EARLY BIRD PRICE · SAVES YOU ₦3,000 · ENDS JUNE 30TH' : 'STANDARD REGISTRATION PRICE'}
            </div>
            
            <hr className="border-border-custom mb-6" />
            
            <ul className="space-y-2.5 mb-8">
              {[
                "2-Day Live Virtual Workshop",
                "Full Session Replays",
                "Downloadable Resource Materials",
                "Participation Certificate",
                "Exclusive Community Access"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5 text-[15px] text-[#c8d8ee] border-b border-border-custom last:border-none">
                  <div className="w-5.5 h-5.5 bg-primary-orange rounded-sm flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            {isEarlyBird && (
              <div className="bg-[rgba(200,16,46,0.08)] border border-border-red rounded-sm p-3.5 mb-7 text-center flex flex-col items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary-orange animate-bounce" />
                <p className="font-mono text-xs text-primary-orange tracking-wider leading-relaxed">Price goes up to ₦10,000 on July 1st, 2026.<br/>Sign up in May or June to pay only ₦7,000.</p>
              </div>
            )}
            
            <button 
              onClick={onOpenCheckout}
              className="block w-full bg-primary-orange text-white text-center font-mono text-[15px] font-bold tracking-wider uppercase py-5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]"
            >
              YES, SECURE MY SPOT NOW →
            </button>
            <p className="text-center mt-3.5 text-xs text-text-dim font-mono flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Secure payment via Flutterwave &nbsp;|&nbsp; Conference: Aug 20–21, 2026
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const GuaranteeSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-9">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Our Promise</div>
        <h2 className="text-3xl md:text-5xl text-text-white">We Have Your Back</h2>
      </div>
      <div className="max-w-[640px] mx-auto flex flex-col md:flex-row gap-7 items-center md:items-start bg-bg-card border border-border-custom rounded-sm p-9">
        <div className="w-20 h-20 bg-primary-orange rounded-full flex items-center justify-center text-3xl shrink-0 shadow-[0_0_30px_rgba(249,115,22,0.35)]">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-[28px] text-text-white mb-2.5">Here Is What We Promise You</h3>
          <p className="text-[15px] text-text-muted leading-[1.7]">Show up. Pay attention. Use what you learn. If you do not feel ready and excited to change your classroom after Day 1, reach out to us and we will make it right. We stand behind every session, every speaker, and every resource in this conference.</p>
        </div>
      </div>
    </div>
  </section>
);

const ThankYouPage = ({ reference }: { reference: string }) => {
  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-20 px-5 relative overflow-hidden">
      <div className="noise-overlay" />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-[1100px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="mb-8 inline-flex items-center gap-2 bg-bg-card px-4 py-2 rounded-md border border-border-custom">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Registration Confirmation:</span>
            <span className="font-mono text-sm text-primary-orange font-bold">{reference}</span>
          </div>
          <h1 className="text-4xl md:text-6xl text-text-white mb-4">You Are <span className="text-primary-orange">Confirmed!</span></h1>
          <p className="text-xl text-text-muted max-w-[600px] mx-auto">
            Welcome to the future of education. Your seat is secured for August 20th. 
            Check your email for your official receipt.
          </p>
        </motion.div>

        {/* Welcome Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="max-w-[800px] mx-auto mb-16 relative group"
        >
          <div className="absolute -inset-4 bg-primary-orange/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative aspect-video bg-bg-card border border-primary-orange/20 rounded-2xl overflow-hidden shadow-2xl">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0" 
              title="Welcome Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-bg-dark/20 pointer-events-none" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-bg-card border border-border-custom px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-3 shadow-xl">
            <div className="w-2 h-2 bg-primary-orange rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-text-white uppercase tracking-widest">Watch Welcome Message</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Grid Layout */}
          
          {/* Main Next Step - Large */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-bg-card border border-border-custom rounded-2xl p-8 relative overflow-hidden group shadow-xl"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <Mail className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-orange/20 transition-colors">
                <Mail className="w-6 h-6 text-primary-orange" />
              </div>
              <h3 className="text-2xl text-text-white mb-3">Check Your Inbox</h3>
              <p className="text-text-muted mb-6 max-w-[400px]">
                We've sent a confirmation email with your registration details. 
                If you don't see it, check your spam folder or "Promotions" tab.
              </p>
              <a 
                href="mailto:" 
                className="inline-flex items-center gap-2 text-primary-orange font-mono text-sm font-bold hover:gap-3 transition-all"
              >
                OPEN YOUR EMAIL <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* WhatsApp Group - Square */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden shadow-xl"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <MessageCircle className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-xl text-text-white mb-2">Join the Community</h3>
              <p className="text-text-muted text-sm mb-6">
                Connect with fellow teachers in our exclusive attendee WhatsApp group.
              </p>
            </div>
            <a 
              href="#" 
              className="relative z-10 w-full bg-[#25D366] text-white text-center py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
            >
              JOIN WHATSAPP <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Calendar - Square */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-bg-card border border-border-custom rounded-2xl p-8 group relative overflow-hidden shadow-xl"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <Calendar className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-orange/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary-orange" />
              </div>
              <h3 className="text-xl text-text-white mb-2">Save the Date</h3>
              <p className="text-text-muted text-sm mb-6">
                August 20–21, 2026. 9:00 AM Daily. Don't miss a single session.
              </p>
              <button className="text-primary-orange font-mono text-xs font-bold flex items-center gap-2 hover:underline">
                <Download className="w-4 h-4" /> ADD TO CALENDAR
              </button>
            </div>
          </motion.div>

          {/* Socials - Wide */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 bg-bg-card border border-border-custom rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl group"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <Share2 className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl text-text-white mb-2">Follow the Journey</h3>
              <p className="text-text-muted text-sm">
                Get daily tips and updates on our social media channels.
              </p>
            </div>
            <div className="relative z-10 flex gap-4">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-12 h-12 bg-bg-section border border-border-custom rounded-full flex items-center justify-center text-text-muted hover:text-primary-orange hover:border-primary-orange/50 transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="text-text-dim hover:text-text-white transition-colors font-mono text-xs tracking-widest uppercase"
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Is this for primary or secondary school teachers?", a: "It is for both. This conference is open to teachers and school leaders at all levels. Primary, secondary, and beyond. If you work in education in Nigeria, this is for you." },
    { q: "What if I cannot attend live?", a: "No problem. Every session is recorded. The replays are yours to keep. You can watch at any time that works for you." },
    { q: "What do I need to attend?", a: "Just a phone or laptop and a good internet connection. You do not need any special app or technical skills. We will send you the link before the event starts." },
    { q: "I am not good with technology. Will I be able to follow?", a: "Yes! Everything is explained step by step. We start from the basics. You do not need to know anything about tech before you come." },
    { q: "When will I receive the platform link?", a: "We will send the link to all registered participants before August 20th. You will not miss anything." },
    { q: "Is my payment safe?", a: "Yes. We use Flutterwave to process all payments. It is one of the most trusted payment platforms in Africa. Your money and your details are safe." }
  ];

  return (
    <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
      <div className="max-w-[1000px] mx-auto">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">FAQ</div>
        <h2 className="text-3xl md:text-5xl text-text-white mb-10">Got Questions? We Have Answers.</h2>
        
        <div className="max-w-[720px] mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border-custom">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full bg-none border-none text-left text-text-white font-mono text-base font-bold py-5 pr-11 relative cursor-pointer hover:text-gold transition-colors flex items-center justify-between"
              >
                {faq.q}
                <ChevronDown className={`w-5.5 h-5.5 text-primary-orange transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[15px] text-text-muted leading-[1.7] pb-5">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = ({ onScrollToPricing }: { onScrollToPricing: () => void }) => {
  const price = getCurrentPrice();
  const formatted = formatPrice(price);
  const isEarlyBird = new Date() < EARLY_BIRD_END;

  return (
    <section className="bg-[linear-gradient(160deg,#150f08_0%,#0f0d0b_60%,#1a1208_100%)] py-24 px-5 text-center relative overflow-hidden">
      <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(249,115,22,0.16)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Do Not Wait</div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-white max-w-[800px] mx-auto mb-4">Your Students Need A <span className="text-primary-orange">Future-Ready</span> Teacher.</h2>
        <p className="text-[17px] text-text-muted max-w-[520px] mx-auto mb-9">The price goes up on July 1st. The conference starts on August 20th. Sign up today and take the first step.</p>
        <button 
          onClick={onScrollToPricing}
          className="inline-block bg-primary-orange text-white font-mono text-[15px] font-bold tracking-wider uppercase px-13 py-5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]"
        >
          CLAIM YOUR SEAT TODAY →
        </button>
        <p className="mt-4.5 text-xs text-text-dim font-mono tracking-wider">
          Price rises to ₦10,000 on July 1st &nbsp;·&nbsp; Powered by Stephanie Global Education
        </p>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-bg-card2 border-t border-border-custom py-7 px-5 text-center">
    <p className="font-mono text-[11px] text-text-dim tracking-wider flex flex-wrap items-center justify-center gap-2">
      © 2026 Stephanie Global Education &nbsp;·&nbsp; The Teacher And Her Classroom Conference &nbsp;·&nbsp; 
      <a href="#" className="text-primary-orange hover:underline flex items-center gap-1">
        <MessageCircle className="w-3 h-3" /> WhatsApp Support
      </a>
    </p>
  </footer>
);

export default function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  useEffect(() => {
    const handleSuccess = (e: any) => {
      setSuccessRef(e.detail.reference);
    };
    window.addEventListener('payment-success', handleSuccess);
    return () => window.removeEventListener('payment-success', handleSuccess);
  }, []);

  const scrollToPricing = () => {
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (successRef) {
    window.location.href = `/thankyou.html?ref=${successRef}`;
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="noise-overlay" />
      <AnnouncementBar />
      <main>
        <Hero onScrollToPricing={scrollToPricing} />
        <LeadSection />
        <SolutionSection onScrollToPricing={scrollToPricing} />
        <IncludedSection />
        <HostSection />
        <SpeakersSection />
        <LearnSection />
        <ComparisonTable />
        <PricingSection onOpenCheckout={() => setIsCheckoutOpen(true)} />
        <GuaranteeSection />
        <FAQSection />
        <FinalCTA onScrollToPricing={scrollToPricing} />
      </main>
      <Footer />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}