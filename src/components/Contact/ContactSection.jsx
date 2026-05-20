import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import { useStoreSettings } from '../../context/SettingsContext';

const Instagram = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const ContactCard = ({ icon: Icon, title, value, link, delay }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(124,58,237,0.25)',
        transition: 'border 0.5s ease, box-shadow 0.5s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1px solid rgba(168,85,247,0.5)';
        e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8), 0 0 50px rgba(124,58,237,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid rgba(124,58,237,0.25)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Violet glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      {/* Violet top gloss */}
      <div className="absolute inset-x-0 top-0 h-1/3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to bottom, rgba(168,85,247,0.08) 0%, transparent 100%)', borderRadius: 'inherit' }} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
          style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.35)',
            boxShadow: '0 0 30px rgba(124,58,237,0.15)',
          }}
        >
          <Icon size={28} style={{ color: 'rgba(168,85,247,0.8)', transition: 'color 0.4s ease' }} className="group-hover:!text-[#C084FC]" />
        </div>

        <h3 className="font-semibold uppercase mb-3" style={{ fontSize: '11px', letterSpacing: '0.24em', color: 'rgba(192,132,252,0.6)' }}>
          {title}
        </h3>
        <p className="text-base sm:text-lg font-medium leading-relaxed group-hover:text-white transition-colors whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {value || 'Not configured'}
        </p>
      </div>
    </motion.div>
  );

  if (link && value) return <a href={link} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  return content;
};

export default function ContactSection({ hookRef }) {
  const { settings, isLoading } = useStoreSettings();

  if (isLoading) return null;

  const cleanNumber = (num) => num?.replace(/[^0-9]/g, '') || '';

  return (
    <section id="contact-section" ref={hookRef} className="py-24 sm:py-32 relative text-white" style={{ background: '#050505' }}>
      
      {/* Background Cinematic Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl font-serif text-white mb-6">
            Get in <span className="italic font-light" style={{ color: '#A855F7', textShadow: '0 0 30px rgba(168,85,247,0.40)' }}>Touch</span>
          </motion.h2>

          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
            className="mx-auto mb-6 h-px w-24"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.60), rgba(168,85,247,0.80), rgba(124,58,237,0.60), transparent)' }}
          />

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            We're here to help you elevate your everyday carry. Reach out to us through any of the channels below.
          </motion.p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-16">
          <ContactCard icon={MapPin}        title="Visit Us"   value={settings?.address}  delay={0.1} />
          <ContactCard icon={Phone}         title="Call Us"    value={settings?.phone}    link={settings?.phone ? `tel:${cleanNumber(settings.phone)}` : null} delay={0.2} />
          <ContactCard icon={MessageCircle} title="WhatsApp"   value={settings?.whatsapp} link={settings?.whatsapp ? `https://wa.me/${cleanNumber(settings.whatsapp)}` : null} delay={0.3} />
          <ContactCard icon={Instagram}     title="Instagram"  value={settings?.instagram ? '@casefactory' : null} link={settings?.instagram} delay={0.4} />
          <ContactCard icon={Facebook}      title="Facebook"   value={settings?.facebook ? 'Case Factory' : null}  link={settings?.facebook}  delay={0.5} />
          <ContactCard icon={Mail}          title="Email"      value={settings?.email}    link={settings?.email ? `mailto:${settings.email}` : null} delay={0.6} />
        </div>

        {/* Map */}
        {settings?.google_maps_embed && (
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center w-full"
              style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 grayscale contrast-125 opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }} />
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
