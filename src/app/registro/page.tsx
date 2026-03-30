'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, PackageX } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

import StoreHeader from './components/StoreHeader'
import RegisterForm from './components/RegisterForm'
import SuccessView from './components/SuccessView'
import FondoUva from './components/FondoUva'
import ModalLegal from './components/ModalLegal'

const carouselVariant: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 }, 
  visible: { 
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
  exit: { 
    opacity: 0, x: -100, scale: 0.95, 
    transition: { duration: 0.3, ease: "easeInOut" } 
  }
}

export default function RegisterPage() {
  const CAMPAIGN_NAME = process.env.NEXT_PUBLIC_CAMPAIGN || 'x'

  const [campaignId, setCampaignId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [hasPrizes, setHasPrizes] = useState<boolean | null>(null) // NUEVO: Control de stock
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null) // NUEVO: Guardará el premio ganado
  const [error, setError] = useState('')
  const [showLegal, setShowLegal] = useState(true)

  useEffect(() => {
    const initCampaignAndStore = async () => {
      // 1. Obtener el ID de la tienda desde la URL (?store=uuid-de-la-tienda)
      const urlParams = new URLSearchParams(window.location.search)
      const urlStoreId = urlParams.get('store')

      if (!urlStoreId) {
        setIsValid(false)
        return
      }

      setStoreId(urlStoreId)

      // 2. Validar la Campaña
      const { data: campaign, error: campError } = await supabase
        .from('campaigns')
        .select('id, is_active')
        .eq('name', CAMPAIGN_NAME)
        .single()

      if (campError || !campaign || !campaign.is_active) {
        setIsValid(false)
        return
      }
      setCampaignId(campaign.id)

      // 3. Validar que la tienda exista y esté activa
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, is_active')
        .eq('id', urlStoreId)
        .single()

      if (storeError || !store || !store.is_active) {
        setIsValid(false)
        return
      }

      // 4. VERIFICAR STOCK DE PREMIOS EN ESTA TIENDA
      const { data: prizes } = await supabase
        .from('prizes')
        .select('id, stock')
        .eq('store_id', urlStoreId)
        .eq('is_active', true)
        .gt('stock', 0) // Solo trae los que tengan stock mayor a 0

      if (!prizes || prizes.length === 0) {
        setHasPrizes(false) // No hay stock
        setIsValid(true) // La campaña es válida, pero no hay premios
      } else {
        setHasPrizes(true) // ¡Hay premios!
        setIsValid(true)
      }
    }

    initCampaignAndStore()
  }, [CAMPAIGN_NAME])

  // PANTALLA DE CARGA
  if (isValid === null || hasPrizes === null) return (
    <>
      <FondoUva />
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <Loader2 className="text-white/50" size={50} />
        </motion.div>
      </div>
    </>
  )
  
  // ERROR 1: CAMPAÑA O TIENDA NO VÁLIDA
  if (isValid === false) return (
    <>
      <FondoUva />
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white text-center relative z-10">
        <AlertCircle size={64} className="mb-4 opacity-50" />
        <h1 className="text-2xl font-black uppercase tracking-tighter">Acceso no válido</h1>
        <p className="opacity-80">El código QR es incorrecto o la campaña ha finalizado.</p>
      </div>
    </>
  )

  // ERROR 2: TIENDA SIN PREMIOS (NUEVO)
  if (hasPrizes === false) return (
    <>
      <FondoUva />
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white text-center relative z-10">
        <PackageX size={64} className="mb-4 text-[#f89824]" />
        <h1 className="text-3xl font-fantapop uppercase mb-2">¡Premios Agotados!</h1>
        <p className="opacity-90 max-w-sm">
          Lo sentimos, todos los premios asignados a esta tienda ya han sido entregados. ¡Sigue participando en otros locales autorizados!
        </p>
      </div>
    </>
  )

  return (
    <>
      <FondoUva />
      <AnimatePresence>
        {showLegal && <ModalLegal onAccept={() => setShowLegal(false)} />}
      </AnimatePresence>

      <main className="min-h-screen relative z-10 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-white/30 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showLegal && (
            <motion.div 
              key={success ? "success" : "form"}
              variants={carouselVariant}
              initial="hidden" animate="visible" exit="exit"
              className="w-full max-w-md bg-transparent rounded-[3rem] p-3 sm:p-10 flex flex-col"
            >
              {!success ? (
                <>
                  <StoreHeader storeId={storeId} />
                  
                  <motion.div
                    initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}    
                    transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.2 }}
                    className="bg-[#2c4896] w-fit py-2 sm:py-2 pr-8 sm:pr-10 rounded-r-full shadow-[5px_5px_15px_rgba(0,0,0,0.3)] mt-0 mb-4 sm:mt-0 sm:mb-6 relative z-20 -ml-8 sm:-ml-20 pl-10 sm:pl-16"
                  >
                    <h2 className="text-white font-fantapop text-xl sm:text-4xl uppercase translate-y-[2px] sm:translate-y-[4px]">
                      Registro
                    </h2>
                  </motion.div>

                  <RegisterForm 
                    campaignId={campaignId}
                    storeId={storeId} // Pasamos la tienda al form
                    setLoading={setLoading}
                    loading={loading}
                    setSuccess={setSuccess} // Ahora guardará el objeto del premio
                    setError={setError}
                    error={error}
                  />
                </>
              ) : (
                <SuccessView prize={success} /> // Le pasamos el premio ganado
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}