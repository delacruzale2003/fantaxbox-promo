import Image from 'next/image'

export default function FondoUva() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#2e0b54]">
      {/* Contenedor de la imagen */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/fondomorado.png"
          alt="Fondo Uva"
          fill // Hace que la imagen ocupe todo el contenedor sin romper el layout
          priority // ¡Crucial para móviles! Le dice a Next.js que cargue esto primero (LCP)
          quality={75} // Optimiza el peso de la imagen
          className="object-cover object-center" 
          // object-cover centra y recorta los lados del 16:9, dejando tu centro perfecto
        />
      </div>

      {/* Capa oscura (Overlay): oscurece un 20% la imagen para que la UI de tu app se lea mejor */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  )
}