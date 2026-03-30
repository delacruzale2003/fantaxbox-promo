'use client'
import { motion, Variants } from 'framer-motion'

// 1. AQUÍ ESTÁ LA SOLUCIÓN: Le decimos a TypeScript que este componente acepta la propiedad storeId
interface StoreHeaderProps {
  storeId?: string 
}

// 2. Recibimos la propiedad en el componente
export default function StoreHeader({ storeId }: StoreHeaderProps) {
  
  const headerVariant: Variants = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  }

  return (
    <motion.header 
      className="text-center mb-8"
      variants={headerVariant}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-[2rem] flex items-center justify-center mx-auto mb-1 overflow-hidden p-5">
        <motion.img 
          src="/logofantaxbox.png" 
          alt="Fanta x Xbox Logo" 
          className="w-85 h-full object-contain"
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </div>
    </motion.header>
  )
}