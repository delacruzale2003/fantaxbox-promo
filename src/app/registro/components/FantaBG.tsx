'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Definimos el tipo para nuestras burbujas
interface Bubble {
  id: number
  size: number
  left: string
  duration: number
  delay: number
}

export default function FantaBG() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    // Generamos 25 burbujas con valores aleatorios al montar el componente
    const newBubbles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 20 + 10, // Tamaño entre 10px y 30px
      left: `${Math.random() * 100}%`, // Posición horizontal aleatoria (0% a 100%)
      duration: Math.random() * 5 + 4, // Tardan entre 4 y 9 segundos en subir
      delay: Math.random() * 5, // Empiezan a subir en momentos distintos
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    // fixed inset-0 z-[-1] hace que cubra toda la pantalla y se quede siempre al fondo
    <div className="fixed inset-0 z-[-1] bg-gradient-to-r from-[#f89824] to-[#e53829] overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute bottom-[-50px] bg-white/20 rounded-full" // Blancas con baja opacidad
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
          }}
          animate={{
            y: ['0vh', '-120vh'], // Suben desde abajo de la pantalla hasta arriba
            x: ['0px', '20px', '-20px', '0px'] // Ligero movimiento de zigzag
          }}
          transition={{
            y: {
              duration: bubble.duration,
              repeat: Infinity,
              ease: "linear",
              delay: bubble.delay,
            },
            x: {
              duration: bubble.duration * 0.5, // El zigzag va al doble de velocidad que la subida
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay,
            }
          }}
        />
      ))}
    </div>
  )
}