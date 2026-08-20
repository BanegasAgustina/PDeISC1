import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Botón global que aparece después de desplazarse y devuelve suavemente al inicio.
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Evita mostrar el control cuando la persona todavía está en la cabecera.
    const handleScroll = () => setVisible(window.scrollY > 280)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null
  return <button className="scroll-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Volver arriba"><ArrowUp size={19}/></button>
}
