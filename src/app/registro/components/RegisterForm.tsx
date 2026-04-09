'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle, ArrowUp, Check, Camera, Image as ImageIcon } from 'lucide-react'
import { motion, Variants, AnimatePresence } from 'framer-motion'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

const errorVariants: Variants = {
  hidden: { opacity: 0, height: 0, scale: 0.8, marginBottom: 0 },
  visible: { 
    opacity: 1, height: "auto", scale: 1, marginBottom: 16, 
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, height: 0, scale: 0.8, marginBottom: 0, transition: { duration: 0.2 } }
}

interface RegisterFormProps {
  campaignId: string
  storeId: string
  loading: boolean
  setLoading: (loading: boolean) => void
  setSuccess: (prize: any) => void
  error: string
  setError: (error: string) => void
}

export default function RegisterForm({ 
  campaignId, 
  storeId, 
  loading, 
  setLoading, 
  setSuccess, 
  error, 
  setError 
}: RegisterFormProps) {
  
  // ELIMINADO EL CAMPO 'email' DEL ESTADO
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  const [file, setFile] = useState<File | null>(null)

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image(); img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 800; let w = img.width, h = img.height
        if (w > h && w > MAX) { h *= MAX / w; w = MAX } else if (h > MAX) { w *= MAX / h; h = MAX }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        canvas.toBlob(b => resolve(new File([b!], 'v.webp', { type: 'image/webp' })), 'image/webp', 0.6)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!file) {
      setError('Parece que olvidaste subir la foto de tu voucher.')
      setLoading(false)
      return
    }

    if (formData.phone.length < 9) {
      setError('El número de teléfono debe tener 9 dígitos.')
      setLoading(false)
      return
    }

    // SE ELIMINÓ LA VALIDACIÓN DEL EMAIL (emailRegex)

    try {
      const { data: availablePrizes, error: fetchError } = await supabase
        .from('prizes')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .gt('stock', 0)

      if (fetchError || !availablePrizes || availablePrizes.length === 0) {
        setError('¡Oh no! Los últimos premios acaban de ser entregados mientras llenabas tus datos.')
        setLoading(false)
        return
      }

      const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)]

      const optimized = await compressImage(file)
      const path = `${campaignId}/registros_generales/${Date.now()}.webp`
      
      const { error: uploadError } = await supabase.storage
        .from('vouchers')
        .upload(path, optimized)

      if (uploadError) throw new Error('upload_failed')
      
      const { data: urlData } = supabase.storage.from('vouchers').getPublicUrl(path)

      const { error: insertError } = await supabase.from('registrations').insert({
        full_name: formData.fullName, 
        email: null, // Pasamos null o 'N/A' ya que el campo ya no se usa
        phone: formData.phone,
        dni: 'N/A', 
        voucher_url: urlData.publicUrl, 
        campaign_id: campaignId,
        store_id: storeId, 
        prize_id: randomPrize.id 
      })

      if (insertError) throw new Error('insert_failed')
      
      const { error: updateError } = await supabase
        .from('prizes')
        .update({ stock: randomPrize.stock - 1 })
        .eq('id', randomPrize.id)

      if (updateError) console.error("Error actualizando stock:", updateError)

      setSuccess(randomPrize)

    } catch (err: any) { 
      console.error("Detalle técnico del error:", err)
      
      const errorMessage = err?.message || ''
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Sin conexión. Revisa tu internet e inténtalo de nuevo.')
      } else if (errorMessage.includes('upload_failed')) {
        setError('No pudimos procesar la imagen. Intenta con otra foto.')
      } else {
        setError('¡Ups! Tuvimos un inconveniente. Por favor, intenta de nuevo.') 
      }
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4 sm:space-y-5 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-left mb-2 sm:mb-4">
        <p className="text-white font-fantapop text-2xl sm:text-2xl leading-tight uppercase">
          Llena con tus datos y participa <br /> por fabulosos premios
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center gap-3 p-3 px-5 bg-white text-black text-[11px] sm:text-sm font-bold rounded-full shadow-xl w-fit mx-auto border border-zinc-200"
          >
            <AlertTriangle className="text-[#f89824] shrink-0" size={18} />
            <span className="leading-tight">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* NOMBRES */}
      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop  text-white ml-3 uppercase  ">Nombres y Apellidos :</label>
        <input 
          type="text" 
          required
          maxLength={50}
          pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
          title="Solo se permiten letras y espacios."
          className="w-full px-6 py-2 rounded-full bg-white border-none outline-none text-black font-bold shadow-xl focus:ring-4 focus:ring-[#2c4896]/30 transition-all text-sm sm:text-base"
          onChange={e => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')})}
        />
      </motion.div>

      {/* SE ELIMINÓ EL INPUT DE CORREO DE AQUÍ */}

      {/* TELÉFONO */}
      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop  text-white ml-3 uppercase  ">Teléfono :</label>
        <input 
          type="tel" 
          required
          maxLength={9} 
          minLength={9}
          inputMode="numeric"
          pattern="[0-9]{9}"
          className="w-full px-6 py-2 rounded-full bg-white border-none outline-none text-black font-bold shadow-xl focus:ring-4 focus:ring-[#2c4896]/30 transition-all text-sm sm:text-base"
          onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})}
        />
      </motion.div>

      {/* SUBIR FOTO PILL STYLE */}
      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop text-white ml-3 uppercase">
          {file ? 'Voucher cargado :' : 'Subir foto de voucher :'}
        </label>
        
        {file ? (
          /* ESTADO: ARCHIVO CARGADO */
          <div className="flex items-center justify-between w-full px-6 py-2 sm:py-2.5 rounded-full bg-white shadow-xl text-[#961cd9] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-md sm:text-lg font-fantapop truncate max-w-[180px] sm:max-w-[200px] translate-y-[2px] sm:translate-y-[3px]">
                VOUCHER CARGADO
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botón para deshacer y elegir otra foto */}
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="text-[11px] sm:text-xs font-bold text-gray-400 underline hover:text-gray-600 uppercase"
              >
                Cambiar
              </button>
              <div className="p-1.5 sm:p-1 rounded-full bg-[#961cd9] text-white opacity-100 transition-opacity duration-500 ease-in-out">
                <Check size={16} strokeWidth={3} className="sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        ) : (
          /* ESTADO: SIN ARCHIVO (MOSTRAR 2 OPCIONES) */
          <div className="flex gap-2 sm:gap-3">
            {/* OPCIÓN 1: FORZAR CÁMARA */}
            <label className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:py-2.5 rounded-full cursor-pointer transition-all bg-white shadow-xl hover:bg-gray-50 text-[#961cd9] focus-within:ring-4 focus-within:ring-[#961cd9]/30">
              <Camera size={18} strokeWidth={2.5} className="shrink-0" />
              <span className="text-sm sm:text-base font-fantapop translate-y-[2px] sm:translate-y-[3px]">
                CÁMARA
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                capture="environment" // <-- Esto fuerza la cámara
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
            </label>

            {/* OPCIÓN 2: ABRIR GALERÍA */}
            <label className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:py-2.5 rounded-full cursor-pointer transition-all bg-white shadow-xl hover:bg-gray-50 text-[#961cd9] focus-within:ring-4 focus-within:ring-[#961cd9]/30">
              <ImageIcon size={18} strokeWidth={2.5} className="shrink-0" />
              <span className="text-sm sm:text-base font-fantapop translate-y-[2px] sm:translate-y-[3px]">
                GALERÍA
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                // <-- Al no tener 'capture', los teléfonos abrirán la galería/archivos
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
            </label>
          </div>
        )}
      </motion.div>

      {/* BOTÓN ENVIAR */}
      <motion.div variants={itemVariants} className="pt-4 sm:pt-6 justify-center flex">
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}   
          type="submit" 
          disabled={loading || !file}
          className="w-full sm:w-auto px-12 sm:px-24 py-1.5 sm:py-2 bg-[#7716ad] text-white rounded-full font-fantapop text-xl sm:text-4xl shadow-[0_10px_30px_rgba(119,22,173,0.4)] disabled:opacity-60 disabled:cursor-not-allowed uppercase transition-all flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <span className="inline-block translate-y-[2px] sm:translate-y-[4px]">
              JUGAR
            </span>
          )}
        </motion.button>
      </motion.div>

    </motion.form>
  )
}