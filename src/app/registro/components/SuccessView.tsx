'use client'

import { useEffect } from 'react'
import { Gift } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

// Animación para el contenedor principal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

// Animación suave de subida
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
}

interface SuccessViewProps {
  prize: {
    id: string
    name: string
    image_url?: string | null
  }
  storeName: string
}

export default function SuccessView({ prize, storeName }: SuccessViewProps) {
  
  // NUEVO: Manejo del botón "Atrás" del celular
  useEffect(() => {
    // Agregamos un estado falso al historial
    window.history.pushState(null, '', window.location.href)
    
    // Si el usuario intenta ir hacia atrás (popstate), recargamos la página limpia
    const handlePopState = () => {
      window.location.reload()
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center w-full max-w-md mx-auto min-h-[70vh]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. Logo Fanta x Xbox */}
      <motion.img 
        variants={itemVariants}
        src="/logofantaxbox.png" 
        alt="Fanta x Xbox Logo" 
        className="w-48 sm:w-56 h-auto object-contain mb-8"
      />

      {/* 2. IMAGEN DEL PREMIO (Gigante) */}
      <motion.div 
        variants={itemVariants}
        // Aumenté el tamaño a w-80 h-80 (320px) para móviles y w-96 (384px) para PC
        className="relative w-80 h-80 sm:w-96 sm:h-96 mb-12 flex items-center justify-center"
      >
        {prize?.image_url ? (
          <img 
            src={prize.image_url} 
            alt={prize.name} 
            className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
          />
        ) : (
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
            <Gift size={100} className="text-white" strokeWidth={1} />
          </div>
        )}
      </motion.div>

      {/* 3. Textos de instrucciones */}
      <motion.div variants={itemVariants} className="space-y-3 w-full px-4">
        <p className="text-white text-base sm:text-lg font-markpro-bold leading-tight">
          Acércate al promotor y <br/> reclama tu premio
        </p>
        
        <p className="text-white/60 text-xs font-markpro mt-2">
          *Imágenes referenciales
        </p>

        {/* Nombre de la tienda como etiqueta discreta */}
        <div className="inline-block bg-black/20 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-4">
          Tienda: {storeName}
        </div>
      </motion.div>

    </motion.div>
  )
}