'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, PackageX } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
// NUEVO: Importamos useParams para atrapar el ID de la URL limpia
import { useParams } from 'next/navigation' 
import FondoUva from '../components/FondoUva'
import ModalLegal from '../components/ModalLegal'
import StoreHeader from '../components/StoreHeader'
import RegisterForm from '../components/RegisterForm'
import SuccessView from '../components/SuccessView'


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
  
  // NUEVO: Extraemos el storeId directamente desde la estructura de carpetas de Next.js
  const params = useParams()
  // Asignamos el valor. params.storeId coincide exactamente con el nombre de tu carpeta [storeId]
  const currentStoreId = params.storeId as string

  const [campaignId, setCampaignId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [storeName, setStoreName] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [hasPrizes, setHasPrizes] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState('')
  const [showLegal, setShowLegal] = useState(true)

  useEffect(() => {
    const initCampaignAndStore = async () => {
      // 1. Validar que la URL tenga un ID
      if (!currentStoreId) {
        setIsValid(false)
        return
      }

      setStoreId(currentStoreId)

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

      // 3. Validar que la tienda exista y esté activa usando el ID de la URL
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, is_active, name')
        .eq('id', currentStoreId)
        .single()

      if (storeError || !store || !store.is_active) {
        setIsValid(false)
        return
      }

      setStoreName(store.name || '')

      // 4. VERIFICAR STOCK DE PREMIOS EN ESTA TIENDA
      const { data: prizes } = await supabase
        .from('prizes')
        .select('id, stock')
        .eq('store_id', currentStoreId)
        .eq('is_active', true)
        .gt('stock', 0)

      if (!prizes || prizes.length === 0) {
        setHasPrizes(false)
        setIsValid(true)
      } else {
        setHasPrizes(true)
        setIsValid(true)
      }
    }

    initCampaignAndStore()
  }, [CAMPAIGN_NAME, currentStoreId]) // Agregamos currentStoreId a las dependencias

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

  // ERROR 2: TIENDA SIN PREMIOS
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
                    <h2 className="text-white font-fantapop text-3xl sm:text-3xl uppercase translate-y-[2px] sm:translate-y-[4px]">
                      Registro
                    </h2>
                  </motion.div>

                  <RegisterForm 
                    campaignId={campaignId}
                    storeId={storeId} 
                    setLoading={setLoading}
                    loading={loading}
                    setSuccess={setSuccess} 
                    setError={setError}
                    error={error}
                  />

                  {/* Nombre de la tienda ajustado al contenido */}
                  {storeName && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="mt-6 sm:mt-8 text-center"
                    >
                      <p className="text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 mt-4">
                        Tienda
                      </p>
                      {/* Aquí cambiamos max-w-3xs por w-fit / inline-block y ajustamos el padding horizontal (px-6) */}
                      <p className="text-white font-fantapop text-lg sm:text-xl tracking-wider uppercase bg-[#550a7f] rounded-full py-1.5 sm:py-2 px-6 inline-block">
                        {storeName}
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <SuccessView prize={success} storeName={storeName} /> 
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}