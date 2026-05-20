import React from 'react';
import { motion } from 'framer-motion';
import { useStoreSettings } from '../context/SettingsContext';

// Simple SVG icon since lucide-react might not have a dedicated WhatsApp brand icon
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.031 2C6.506 2 2.016 6.49 2.016 12.016c0 1.764.464 3.486 1.345 5.006L2 22l5.127-1.344c1.472.822 3.144 1.256 4.869 1.256v-.001h.001C17.525 21.91 22.016 17.421 22.016 11.9c0-2.678-1.042-5.195-2.936-7.091C17.186 2.915 14.671 2 12.031 2zm0 18.257c-1.488 0-2.946-.4-4.225-1.157l-.303-.18-3.136.822.836-3.058-.197-.314c-.832-1.32-1.272-2.846-1.272-4.407C3.734 7.408 7.408 3.734 11.956 3.734c2.203 0 4.275.859 5.834 2.418a8.212 8.212 0 012.41 5.833c-.001 4.547-3.675 8.221-8.169 8.221v.051zm4.48-6.121c-.245-.123-1.455-.718-1.68-.801-.225-.082-.389-.123-.553.123-.164.246-.634.801-.777.965-.143.164-.287.185-.533.062-.245-.123-1.039-.383-1.98-1.222-.732-.653-1.227-1.46-1.371-1.706-.143-.246-.015-.379.108-.501.111-.11.245-.287.368-.43.123-.143.164-.246.246-.409.082-.164.041-.308-.02-.431-.062-.123-.553-1.335-.758-1.826-.2-.482-.403-.416-.553-.424-.143-.008-.307-.008-.471-.008a.91.91 0 00-.655.308c-.225.246-.86 .841-.86 2.051 0 1.21.88 2.38 1.003 2.544.123.164 1.735 2.65 4.202 3.716.587.253 1.045.404 1.404.517.589.186 1.125.16 1.546.097.472-.072 1.455-.595 1.66-1.169.205-.574.205-1.066.143-1.169-.062-.103-.225-.164-.471-.287z"/>
  </svg>
);

export default function FloatingWhatsApp() {
  const { settings, isLoading } = useStoreSettings();

  if (isLoading || !settings?.whatsapp) return null;

  // Clean the number for URL
  const cleanNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanNumber}`;

  return (
    <motion.a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 left-6 z-[80] group flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-2xl">
        <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-75" style={{ animationDuration: '2s' }} />
        <WhatsAppIcon size={28} className="text-white relative z-10 drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
      </div>
    </motion.a>
  );
}
