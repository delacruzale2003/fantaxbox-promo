import { redirect } from 'next/navigation'

export default function HomePage() {
  /**
   * Redirección inmediata.
   * Usamos 'general' como el ID de tienda por defecto para 
   * ingresos directos a la web principal.
   */
  redirect('/registro/')

  // Este retorno nunca se renderizará, pero se deja por estructura de Next.js
  return null
}