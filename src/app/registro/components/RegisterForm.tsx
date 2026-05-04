'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle, Check, Camera, Image as ImageIcon } from 'lucide-react'
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
  
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  const [file, setFile] = useState<File | null>(null)

  // --- NUEVO: FUNCIÓN PARA DETECTAR EL SISTEMA OPERATIVO INVISIBLEMENTE ---
  const getMobileOperatingSystem = () => {
    if (typeof window === 'undefined') return "Desconocido";
    
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/windows phone/i.test(userAgent)) return "Windows Phone";
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return "iOS";
    if (/Macintosh/i.test(userAgent)) return "Mac";
    if (/Windows/i.test(userAgent)) return "Windows PC";
    
    return "Desconocido";
  }

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

    try {
      // 1. BUSCAR PREMIOS: Solo los que tengan stock en esta tienda
      const { data: rawPrizes, error: fetchError } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true)
        .eq('store_id', storeId)
        .gt('stock', 0)

      if (fetchError || !rawPrizes || rawPrizes.length === 0) {
        setError('¡Oh no! Los últimos premios acaban de ser entregados mientras llenabas tus datos.')
        setLoading(false)
        return
      }

      // 2. LÓGICA DE CAJAS BLINDADA (Agrupación Estricta)
      const batches: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [] };
      
      // Metemos cada premio en su caja correspondiente
      rawPrizes.forEach(p => {
        let b = Number(p.batch_number);
        if (isNaN(b) || b < 1) b = 1; // Si no tiene lote, a la fuerza va al 1
        if (b > 4) b = 4;             // Límite máximo 4
        batches[b].push(p);
      });

      let activePrizesToRoll: any[] = [];
      let selectedBatch = 0;

      // Iteramos en orden (1, 2, 3, 4). AL PRIMERO que tenga algo, NOS DETENEMOS.
      for (let i = 1; i <= 4; i++) {
        if (batches[i].length > 0) {
          activePrizesToRoll = batches[i];
          selectedBatch = i;
          break; // ESTO ES CLAVE: Detiene la búsqueda. Jamás verá la caja 2 si la 1 tiene algo.
        }
      }

      console.log(`✅ Lote Ganador Seleccionado: ${selectedBatch}`);
      console.table(activePrizesToRoll.map(p => ({ Premio: p.name, Stock: p.stock })));

      // 3. ELEGIR PREMIO AL AZAR (SOLO DE ESA CAJA)
      const randomPrize = activePrizesToRoll[Math.floor(Math.random() * activePrizesToRoll.length)]

      // 4. SUBIDA DE IMAGEN
      const optimized = await compressImage(file)
      const path = `${campaignId}/registros_generales/${Date.now()}.webp`
      
      const { error: uploadError } = await supabase.storage
        .from('vouchers')
        .upload(path, optimized)

      if (uploadError) throw new Error('upload_failed')
      const { data: urlData } = supabase.storage.from('vouchers').getPublicUrl(path)

      // --- NUEVO: CAPTURAMOS EL OS ANTES DE INSERTAR ---
      const detectedOS = getMobileOperatingSystem();

      // 5. REGISTRO EN BASE DE DATOS
      const { error: insertError } = await supabase.from('registrations').insert({
        full_name: formData.fullName, 
        email: null,
        phone: formData.phone,
        dni: 'N/A', 
        voucher_url: urlData.publicUrl, 
        campaign_id: campaignId,
        store_id: storeId, 
        prize_id: randomPrize.id,
        device_os: detectedOS // --- NUEVO: GUARDAMOS EL OS ---
      })

      if (insertError) throw new Error('insert_failed')
      
      // 6. DESCONTAR STOCK
      await supabase
        .from('prizes')
        .update({ stock: randomPrize.stock - 1 })
        .eq('id', randomPrize.id)

      setSuccess(randomPrize)

    } catch (err: any) { 
      console.error(err)
      setError('¡Ups! Tuvimos un inconveniente con el sistema. Intenta de nuevo.') 
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
            initial="hidden" animate="visible" exit="exit"
            className="flex items-center gap-3 p-3 px-5 bg-white text-black text-[11px] sm:text-sm font-bold rounded-full shadow-xl w-fit mx-auto border border-zinc-200"
          >
            <AlertTriangle className="text-[#f89824] shrink-0" size={18} />
            <span className="leading-tight">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop  text-white ml-3 uppercase  ">Nombres y Apellidos :</label>
        <input type="text" required maxLength={50} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo letras"
          className="w-full px-6 py-2 rounded-full bg-white border-none outline-none text-black font-bold shadow-xl focus:ring-4 focus:ring-[#2c4896]/30 transition-all"
          onChange={e => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')})}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop  text-white ml-3 uppercase  ">Teléfono :</label>
        <input type="tel" required maxLength={9} minLength={9} inputMode="numeric" pattern="[0-9]{9}"
          className="w-full px-6 py-2 rounded-full bg-white border-none outline-none text-black font-bold shadow-xl focus:ring-4 focus:ring-[#2c4896]/30 transition-all"
          onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-[19px] sm:text-[20px] font-fantapop text-white ml-3 uppercase">
          {file ? 'Voucher cargado :' : 'Subir foto de voucher :'}
        </label>
        {file ? (
          <div className="flex items-center justify-between w-full px-6 py-2 sm:py-2.5 rounded-full bg-white shadow-xl text-[#961cd9] transition-all">
            <span className="text-md sm:text-lg font-fantapop truncate max-w-[180px]">VOUCHER CARGADO</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFile(null)} className="text-[11px] sm:text-xs font-bold text-gray-400 underline hover:text-gray-600 uppercase">Cambiar</button>
              <div className="p-1.5 rounded-full bg-[#961cd9] text-white"><Check size={16} strokeWidth={3} /></div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:py-2.5 rounded-full cursor-pointer bg-white shadow-xl hover:bg-gray-50 text-[#961cd9]">
              <Camera size={18} strokeWidth={2.5} /> <span className="text-sm font-fantapop translate-y-[2px]">CÁMARA</span>
              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:py-2.5 rounded-full cursor-pointer bg-white shadow-xl hover:bg-gray-50 text-[#961cd9]">
              <ImageIcon size={18} strokeWidth={2.5} /> <span className="text-sm font-fantapop translate-y-[2px]">GALERÍA</span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4 sm:pt-6 justify-center flex">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading || !file}
          className="w-full sm:w-auto px-12 sm:px-24 py-1.5 sm:py-2 bg-[#7716ad] text-white rounded-full font-fantapop text-xl sm:text-4xl shadow-[0_10px_30px_rgba(119,22,173,0.4)] disabled:opacity-60 disabled:cursor-not-allowed uppercase"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : <span className="inline-block translate-y-[2px]">JUGAR</span>}
        </motion.button>
      </motion.div>
    </motion.form>
  )
}