'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'bot';
  time: string;
}

const RESPONSES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenas', 'hey', 'hi', 'saludos', 'ola'],
    answer: 'Hola, bienvenido a Mi Boleta. Puedo ayudarte con informacion sobre loterías colombianas, precios, dias de sorteo y todo lo relacionado con la app. ¿En que te puedo ayudar?',
  },
  {
    keywords: ['medellin', 'medellín', 'loteria medellin', 'lotería medellín'],
    answer: 'Lotería de Medellin\nSorteo: todos los viernes\nPrecio por fraccion: desde $5.000 COP\nPremio mayor: aproximadamente $3.500 millones COP\nManeja serie de 4 fracciones. Puedes registrar tu numero en Mi Boleta con estado Pendiente y actualizarlo cuando salga el resultado.',
  },
  {
    keywords: ['bogota', 'bogotá', 'loteria bogota', 'lotería bogotá'],
    answer: 'Lotería de Bogota\nSorteo: todos los jueves\nPrecio por fraccion: desde $5.000 COP\nPremio mayor: aproximadamente $3.500 millones COP\nNumeros de 4 cifras con serie. Registrala en Mi Boleta para no olvidar el numero.',
  },
  {
    keywords: ['tolima', 'loteria tolima', 'lotería tolima'],
    answer: 'Lotería del Tolima\nSorteo: todos los lunes\nPrecio por fraccion: desde $5.000 COP\nPremio mayor: aproximadamente $2.500 millones COP\nPuedes guardarla en Mi Boleta y actualizarla el lunes con el resultado.',
  },
  {
    keywords: ['cauca', 'loteria cauca', 'lotería cauca'],
    answer: 'Lotería del Cauca\nSorteo: todos los sabados\nPrecio por fraccion: desde $4.000 COP\nPremio mayor: aproximadamente $2.000 millones COP',
  },
  {
    keywords: ['cundinamarca', 'loteria cundinamarca'],
    answer: 'Lotería de Cundinamarca\nSorteo: todos los lunes\nPrecio por fraccion: desde $5.000 COP\nSortea el mismo dia que la del Tolima. Puedes registrar ambas en Mi Boleta.',
  },
  {
    keywords: ['baloto', 'rebaloto'],
    answer: 'Baloto\nSorteos: miercoles y sabados\nPrecio por apuesta: $3.500 COP\nPremio mayor: acumulado, puede superar los $20.000 millones\nSe escogen 5 numeros del 1 al 43 mas 1 baloto del 1 al 16\nRegistra tu combinacion en Mi Boleta como Juego ocasional para no perderla.',
  },
  {
    keywords: ['chance', 'chances'],
    answer: 'Chance\nSorteos: cada dia en tres jornadas (manana, tarde y noche)\nPrecio minimo: $200 COP por combinacion\nModalidades: 3 cifras, 4 cifras, combinado y parlay\nPremio: hasta 4.500 veces lo apostado en 4 cifras\nEs el juego de mayor frecuencia en Colombia. Guarda tus apuestas en Mi Boleta bajo Juego ocasional.',
  },
  {
    keywords: ['superastro', 'super astro', 'astro'],
    answer: 'SuperAstro\nSorteos: 5 veces al dia\nPrecio: desde $1.000 COP\nSe elige un numero del 00 al 99 mas un signo del zodiaco\nPremio: hasta $40.000.000 COP\nRegistralo en Mi Boleta como Sorteo para llevar el control.',
  },
  {
    keywords: ['cruz roja', 'huila', 'risaralda', 'manizales', 'caldas', 'quindio', 'quindío', 'boyaca', 'boyacá', 'santander', 'meta', 'narino', 'nariño'],
    answer: 'Loterias departamentales\nColombia tiene loterias en casi todos sus departamentos. El precio de cada fraccion varia entre $4.000 y $6.000 COP y los sorteos son semanales, de lunes a sabado segun el departamento.\nPuedes registrar cualquiera en Mi Boleta eligiendo Loteria como tipo de juego.',
  },
  {
    keywords: ['precio', 'precios', 'cuanto cuesta', 'cuánto cuesta', 'costo', 'valor', 'cuanto vale', 'cuánto vale', 'cuanto es', 'cuánto es'],
    answer: 'Precios aproximados de juegos en Colombia:\n\nChance (3 cifras): desde $200 COP\nBaloto: $3.500 COP por apuesta\nSuperAstro: desde $1.000 COP\nLoterias departamentales (fraccion): entre $4.000 y $6.000 COP\nRifas empresariales: varia entre $5.000 y $50.000\n\nRegistra el valor exacto de cada boleta en Mi Boleta para llevar control de tu inversion.',
  },
  {
    keywords: ['cuando es', 'cuándo es', 'que dia', 'qué día', 'dia de sorteo', 'dia sorteo', 'fecha sorteo', 'cuando sortea', 'cuándo sortea'],
    answer: 'Dias de sorteo en Colombia:\n\nLunes: Tolima, Cundinamarca\nMartes: Boyaca\nMiercoles: Baloto, Cruz Roja\nJueves: Bogota, Huila\nViernes: Medellin, Meta\nSabado: Cauca, Baloto, Risaralda\nTodos los dias: Chance y SuperAstro\n\n¿Quieres informacion de una loteria en particular?',
  },
  {
    keywords: ['premio', 'premios', 'cuanto gano', 'cuánto gano', 'cuanto paga', 'cuánto paga', 'pago', 'paga'],
    answer: 'Premios aproximados:\n\nLoterias departamentales: entre $2.500 y $4.000 millones COP al mayor\nBaloto: acumulado, puede superar $30.000 millones\nChance 4 cifras: hasta 4.500 veces lo apostado\nSuperAstro: hasta $40.000.000 COP\nRifas: depende del organizador\n\nTen en cuenta que los premios de loteria tienen retencion en la fuente del 20% aproximadamente.',
  },
  {
    keywords: ['crear', 'nueva boleta', 'agregar', 'registrar', 'añadir', 'guardar boleta', 'como agrego', 'como registro'],
    answer: 'Para registrar una boleta:\n1. Haz clic en el boton Nueva boleta (parte superior derecha)\n2. Completa el titulo, tipo de juego, numero, fecha del sorteo y valor apostado\n3. Selecciona el estado Pendiente\n4. Guarda el formulario\n\nDespues del sorteo puedes editarla y cambiar el estado a Ganado o Perdido.',
  },
  {
    keywords: ['editar', 'modificar', 'actualizar', 'cambiar estado', 'cambiar boleta'],
    answer: 'Para editar una boleta:\nPasa el cursor sobre la tarjeta y haz clic en el icono del lapiz que aparece.\nSe abre el formulario donde puedes cambiar cualquier campo, incluido el estado segun el resultado del sorteo.\nGuarda los cambios cuando termines.',
  },
  {
    keywords: ['eliminar', 'borrar', 'delete', 'quitar', 'remover'],
    answer: 'Para eliminar una boleta:\nPasa el cursor sobre la tarjeta y haz clic en el icono de papelera.\nConfirma la accion en el cuadro de dialogo.\nTen en cuenta que esta accion no se puede deshacer.',
  },
  {
    keywords: ['filtro', 'filtros', 'buscar', 'busqueda', 'búsqueda', 'busco', 'encontrar'],
    answer: 'Para filtrar tus boletas:\nUsa la barra de busqueda para encontrar por titulo o numero de boleta.\nPuedes filtrar por tipo de juego: Loteria, Rifa, Sorteo, Boleta o Juego ocasional.\nTambien puedes filtrar por estado: Pendiente, Ganado o Perdido.\nLos filtros se pueden combinar entre si.',
  },
  {
    keywords: ['estado', 'estados', 'pendiente', 'ganado', 'perdido'],
    answer: 'Estados disponibles para una boleta:\n\nPendiente: el sorteo aun no ha ocurrido o no conoces el resultado todavia.\nGanado: obtuviste el premio. Puedes anotar el monto en las notas de la boleta.\nPerdido: el sorteo ya paso y no fue ganador.\n\nPuedes cambiar el estado en cualquier momento editando la boleta.',
  },
  {
    keywords: ['admin', 'administrador', 'panel admin', 'vista admin', 'todos los tickets'],
    answer: 'Panel de administracion:\nDisponible unicamente para usuarios con rol de administrador.\nMuestra todos los tickets registrados en el sistema, de todos los usuarios.\nIncluye estadisticas globales: total de boletas, ganadas, pendientes y perdidas.\nPermite filtrar por tipo, estado y buscar por nombre de usuario o correo.\nSe accede desde el menu Admin en la barra superior.',
  },
  {
    keywords: ['cerrar sesion', 'cerrar sesión', 'salir', 'logout', 'desconectar'],
    answer: 'Para cerrar sesion:\nHaz clic en tu nombre o inicial en la esquina superior derecha.\nEn el menu desplegable selecciona Cerrar sesion.\nSeras redirigido a la pantalla de inicio de sesion.',
  },
  {
    keywords: ['registrar cuenta', 'crear cuenta', 'nueva cuenta', 'registrarme', 'como me registro', 'signup', 'register'],
    answer: 'Para crear una cuenta:\nEntra a la pantalla de inicio de sesion y haz clic en Registrate.\nCompleta tu nombre, correo electronico y contraseña.\nUna vez registrado puedes iniciar sesion de inmediato.',
  },
  {
    keywords: ['contrasena', 'contraseña', 'password', 'clave', 'olvide', 'olvidé'],
    answer: 'Sobre la contraseña:\nDebe tener minimo 6 caracteres.\nSi la olvidaste, contacta al administrador del sistema para restablecerla.\nNo compartas tus credenciales con otras personas.',
  },
  {
    keywords: ['que es', 'qué es', 'para que sirve', 'para qué sirve', 'sobre la app', 'informacion de la app'],
    answer: 'Mi Boleta es una plataforma para registrar y gestionar tus participaciones en juegos de azar.\n\nTe permite:\nRegistrar loterías, rifas, chances y sorteos en un solo lugar.\nLlevar el control de cuanto has invertido.\nActualizar el resultado de cada boleta cuando sale el sorteo.\nBuscar y filtrar entre todas tus participaciones.\nConsultar tu historial completo.',
  },
  {
    keywords: ['tipos de juego', 'tipo juego', 'loteria', 'lotería', 'rifa', 'sorteo', 'juego ocasional', 'tipo de boleta'],
    answer: 'Tipos de juego disponibles en Mi Boleta:\n\nLotería: loterías departamentales como Medellin, Bogota, Tolima, etc.\nRifa: rifas empresariales o beneficas con boleta numerada.\nSorteo: sorteos puntuales con premio definido.\nBoleta: registro generico de participacion.\nJuego ocasional: Baloto, Chance, SuperAstro y similares.\n\nElige el tipo que mas se ajuste al juego que quieres registrar.',
  },
  {
    keywords: ['gane', 'gané', 'gano', 'gano algo', 'creo que gane', 'me gané'],
    answer: 'Si ganaste, edita la boleta y cambia el estado a Ganado.\nPuedes escribir el monto del premio en el campo de notas.\nRecuerda reclamar el premio dentro del plazo legal, que para loterias es generalmente de un año.\nLos premios de loteria tienen retencion en la fuente de aproximadamente el 20%.',
  },
  {
    keywords: ['perdi', 'perdí', 'no gane', 'no gané', 'no salio', 'no me gane'],
    answer: 'Edita la boleta y cambia el estado a Perdido para mantener tu historial organizado.\nEn Mi Boleta puedes revisar cuanto llevas invertido y cuantas veces has participado en cada tipo de juego.',
  },
  {
    keywords: ['pagina', 'página', 'paginacion', 'paginación', 'mas boletas', 'ver mas'],
    answer: 'Las boletas se muestran de 20 en 20 por pagina.\nUsa los botones Anterior y Siguiente al final de la lista para navegar.\nEn el panel de administracion puedes cambiar la cantidad por pagina entre 20, 50 o 100.',
  },
  {
    keywords: ['ayuda', 'help', 'soporte', 'error', 'problema', 'no funciona', 'falla'],
    answer: 'Si tienes un problema con la app:\nVerifica que tu conexion a internet este funcionando.\nIntenta cerrar sesion y volver a ingresar.\nRecarga la pagina si algo no carga correctamente.\nSi el error persiste, contacta al administrador del sistema con una descripcion de lo que esta ocurriendo.',
  },
  {
    keywords: ['gracias', 'thanks', 'perfecto', 'listo', 'ok gracias', 'muchas gracias', 'muy bien', 'genial', 'excelente', 'chevere'],
    answer: 'Con gusto. Si tienes otra pregunta sobre la app o sobre algun juego, aqui estoy.',
  },
];

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function getResponse(text: string): string {
  const lower = normalize(text);
  let best: { score: number; answer: string } = { score: 0, answer: '' };
  for (const r of RESPONSES) {
    const score = r.keywords.filter((kw) => lower.includes(normalize(kw))).length;
    if (score > best.score) best = { score, answer: r.answer };
  }
  if (best.score > 0) return best.answer;
  return 'No tengo informacion exacta sobre eso. Puedo ayudarte con:\n\nLoterias colombianas: Medellin, Bogota, Tolima, Baloto, Chance...\nPrecios y dias de sorteo de cada juego\nComo registrar, editar o eliminar boletas en la app\nEstados de boletas y panel de administracion\n\n¿Sobre que quieres saber?';
}

function now() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

const INITIAL: Message[] = [
  { id: 1, from: 'bot', text: 'Hola, soy el asistente de Mi Boleta.', time: now() },
  { id: 2, from: 'bot', text: 'Puedo ayudarte con informacion sobre loterias colombianas, precios, dias de sorteo y como usar la aplicacion. ¿En que te puedo ayudar?', time: now() },
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text, time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, from: 'bot', text: getResponse(text), time: now() };
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-[340px] sm:w-[375px] bg-white rounded-2xl shadow-2xl border border-slate-200/70 overflow-hidden flex flex-col"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">Mi Boleta</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <p className="text-[11px] text-indigo-100">En línea ahora</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2.5 bg-slate-50/60">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex flex-col gap-0.5 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-md shadow-sm'
                  }`}>
                    {msg.text.split('\n').map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start"
                  >
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-slate-300 block"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-300 mt-1.5">Mi Boleta · Soporte</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center transition-colors relative"
        style={{ width: 52, height: 52 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={21} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {!open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
          />
        )}
      </motion.button>
    </div>
  );
}
