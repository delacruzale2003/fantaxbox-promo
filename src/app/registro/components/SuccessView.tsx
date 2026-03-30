'use client'

import { Gift, CheckCircle2 } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

// Animación para el contenedor principal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, 
      delayChildren: 0.3  
    }
  }
}

// Animación de burbuja/rebote para cada elemento
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
}

// NUEVO: Definimos la interfaz para decirle a TypeScript qué datos trae "prize"
interface SuccessViewProps {
  prize: {
    id: string
    name: string
    image_url?: string | null
  }
}

export default function SuccessView({ prize }: SuccessViewProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center p-4 max-w-sm mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Contenedor de Mensaje Principal */}
      <motion.div 
        variants={itemVariants}
        className="w-full bg-white/10 backdrop-blur-xl rounded-[3.5rem] p-10 shadow-2xl border border-white/20 mb-8 relative overflow-hidden group flex flex-col items-center"
      >
        
        {/* Título de Felicidades */}
        <h2 className="text-white font-fantapop text-4xl sm:text-5xl uppercase tracking-tighter leading-none mb-6 translate-y-[4px]">
          ¡Felicidades!
        </h2>
        
        {/* IMAGEN DEL PREMIO (O Icono si no hay imagen) */}
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
          className="relative w-40 h-40 mb-6 flex items-center justify-center drop-shadow-[0_15px_25px_rgba(119,22,173,0.6)]"
        >
          {prize?.image_url ? (
            // Si el premio tiene imagen en la BD, la mostramos
            <img 
              src={prize.image_url} 
              alt={prize.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            // Si no tiene imagen, mostramos un regalo morado
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
              <Gift size={64} className="text-[#7716ad]" strokeWidth={1.5} />
            </div>
          )}
        </motion.div>

        {/* Textos descriptivos del premio */}
        <div className="space-y-2 relative z-10 w-full">
          <p className="text-white/90 text-sm sm:text-base font-markpro uppercase tracking-widest font-bold">
            Acabas de ganar:
          </p>
          <div className="bg-white/20 py-3 px-4 rounded-2xl border border-white/30 backdrop-blur-sm">
            <p className="text-white text-xl sm:text-2xl font-fantapop uppercase translate-y-[2px]">
              {prize?.name || 'Un Premio Especial'}
            </p>
          </div>
        </div>

        {/* Pequeño check de confirmación */}
        <div className="flex items-center gap-2 mt-6 text-white/80 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
          <CheckCircle2 size={16} className="text-[#961cd9]" />
          <span className="text-xs font-bold uppercase tracking-wider">Registro guardado</span>
        </div>

        {/* Efecto de luz decorativo */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#7716ad]/30 rounded-full blur-3xl pointer-events-none"></div>
      </motion.div>

      {/* Botón de finalizar */}
      <motion.button 
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.reload()}
        // Aplicamos el color uva y la fuente FantaPop
        className="w-full py-4 bg-white text-[#7716ad] rounded-full font-fantapop text-2xl shadow-[0_10px_30px_rgba(255,255,255,0.3)] uppercase transition-all flex items-center justify-center"
      >
        <span className="inline-block translate-y-[2px] sm:translate-y-[4px]">
          Finalizar
        </span>
      </motion.button>

    </motion.div>
  )
}