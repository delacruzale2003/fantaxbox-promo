'use client'

import { motion } from 'framer-motion'

interface ModalLegalProps {
  onAccept: () => void
}

export default function ModalLegal({ onAccept }: ModalLegalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Fondo oscuro detrás del modal para que resalte la caja */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Caja del Modal (Efecto Cristal / Glassmorphism) */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        // bg-white/10 y backdrop-blur-md hacen que sea transparente pero legible
        className="relative w-full max-w-sm sm:max-w-md  backdrop-blur-md  border-3 border-white p-3 sm:p-5 rounded-[2rem] shadow-xl flex flex-col items-center"
      >
       
        
        {/* Usamos font-markpro para que sea muy fácil de leer */}
        <div className="text-white/90 font-markpro text-xs sm:text-sm leading-relaxed mb-6 py-4 text-left h-48 sm:h-auto overflow-y-auto">
          <p className="mb-3">
            Promoción valida a nivel nacional a través del CANAL MODERNO, del 01 de Abril al 30 de Abril del 2026 y/o hasta agotar stock.
          
            Mecánica: Participan personas naturales mayores de 18 años, con residencia legal y domicilio en el territorio nacional del Perú. Por la compra de s./15.00 soles en gaseosas Fanta en CANAL MODERNO, podrás participar de la PROMO FANTA GAMING ingresando al QR ubicado en tienda y subiendo una foto de tu boucher de compra podrás ganar diversos premios al instante.
          </p>
          
          <p>Encuentra nuestros de activación , juega y reclama tu premio a nuestros activadores de tiendas .

</p>
<p>Organiza AC CORPORATIVO. (antes Corporación Lindley S.A) Av. Javier Prado Este 6210, piso 10 La Molina. </p>
        </div>

        {/* Botón de Continuar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAccept}
          className="w-full py-2 bg-[#2c4896] text-white rounded-full font-fantapop text-2xl shadow-[0_5px_15px_rgba(119,22,173,0.5)] uppercase transition-all"
        >
          <span className="inline-block translate-y-[2px] sm:translate-y-[1px]">
            Continuar
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}