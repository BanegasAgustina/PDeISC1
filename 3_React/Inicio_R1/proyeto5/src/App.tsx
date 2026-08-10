import { FormEvent, useState } from 'react'
import './App.css'

function App() {
  // nombre es el estado del input controlado: su valor depende de React.
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [temaOscuro, setTemaOscuro] = useState(false)

  // Acepta letras Unicode (también á, ñ, etc.) y un solo espacio entre palabras.
  const formatoNombre = /^[\p{L}]+(?: [\p{L}]+)*$/u

  function cambiarNombre(valor: string) {
    // Quitamos números y símbolos al escribir o pegar, para que no queden en el input.
    const soloLetrasYEspacios = valor.replace(/[^\p{L} ]/gu, '')
    setNombre(soloLetrasYEspacios)
    setError('')
  }

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    // preventDefault evita el comportamiento habitual de recargar la página.
    event.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) { setError('Por favor, escribí tu nombre.'); setMensaje(''); return }
    if (!formatoNombre.test(nombreLimpio)) {
      setError('El nombre solo puede tener letras y espacios entre nombre y apellido.')
      setMensaje('')
      return
    }
    setError('')
    setMensaje(`¡Bienvenido, ${nombreLimpio}!`)
  }

  function limpiarFormulario() { setNombre(''); setMensaje(''); setError('') }

  return <main className="pagina" data-theme={temaOscuro ? 'dark' : 'light'}>
    <button
      className="tema"
      onClick={() => setTemaOscuro(!temaOscuro)}
      aria-label={temaOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {temaOscuro ? '☀️' : '🌙'}
    </button>
    <section className="panel"><p className="eyebrow">Formulario controlado</p><h1>¡Hola!</h1><p>Contanos cómo te llamás.</p>
      <form onSubmit={enviarFormulario}><label htmlFor="nombre">Nombre y apellido</label><input id="nombre" value={nombre} onChange={(event) => cambiarNombre(event.target.value)} placeholder="Ej.: Ana Pérez" maxLength={50} inputMode="text" autoComplete="name" />{/* onChange limpia símbolos y actualiza el estado por cada tecla. */}<small>Solo letras y espacios. Máximo 50 caracteres.</small><button>Enviar</button></form>
      <button className="limpiar" onClick={limpiarFormulario}>Limpiar formulario</button>
      {/* El renderizado condicional muestra mensajes solo cuando existen. */}
      {error && <p className="error" role="alert">{error}</p>}{mensaje && <p className="bienvenida">{mensaje}</p>}
    </section>
  </main>
}
export default App
