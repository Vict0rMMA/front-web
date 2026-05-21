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
    answer: 'Hola, ¿en que te puedo ayudar? Puedo contarte sobre loterías colombianas, precios, dias de sorteo o como usar la app.',
  },
  {
    keywords: ['medellin', 'medellín', 'loteria medellin', 'lotería medellín'],
    answer: 'La Lotería de Medellin sortea todos los viernes. Cada fraccion cuesta desde $5.000 COP y el premio mayor ronda los $3.500 millones. Puedes guardar tu numero aqui en Mi Boleta con estado Pendiente y actualizarlo cuando salga el resultado.',
  },
  {
    keywords: ['bogota', 'bogotá', 'loteria bogota', 'lotería bogotá'],
    answer: 'La Lotería de Bogota sortea los jueves. El precio por fraccion es desde $5.000 COP y el premio mayor es de aproximadamente $3.500 millones. Son numeros de 4 cifras con serie.',
  },
  {
    keywords: ['tolima', 'loteria tolima', 'lotería tolima'],
    answer: 'La Lotería del Tolima sortea los lunes desde $5.000 COP por fraccion. El premio mayor es de alrededor de $2.500 millones. Coincide el mismo dia con la de Cundinamarca.',
  },
  {
    keywords: ['cauca', 'loteria cauca', 'lotería cauca'],
    answer: 'La Lotería del Cauca sortea los sabados. Cada fraccion cuesta desde $4.000 COP y el premio mayor es de aproximadamente $2.000 millones.',
  },
  {
    keywords: ['cundinamarca', 'loteria cundinamarca'],
    answer: 'La Lotería de Cundinamarca sortea los lunes, el mismo dia que la del Tolima. El precio por fraccion es desde $5.000 COP.',
  },
  {
    keywords: ['baloto', 'rebaloto'],
    answer: 'El Baloto sortea los miercoles y sabados. Cada apuesta vale $3.500 COP y se escogen 5 numeros del 1 al 43 mas un baloto del 1 al 16. El premio acumula y puede superar los $20.000 millones.',
  },
  {
    keywords: ['chance', 'chances'],
    answer: 'El Chance sortea tres veces al dia, todos los dias. Puedes apostar desde $200 COP y hay modalidades de 3 cifras, 4 cifras, combinado y parlay. En 4 cifras el premio puede ser hasta 4.500 veces lo apostado.',
  },
  {
    keywords: ['superastro', 'super astro', 'astro'],
    answer: 'El SuperAstro sortea 5 veces al dia. Se elige un numero del 00 al 99 mas un signo del zodiaco y el precio empieza desde $1.000 COP. El premio puede llegar hasta $40.000.000.',
  },
  {
    keywords: ['cruz roja', 'huila', 'risaralda', 'manizales', 'caldas', 'quindio', 'quindío', 'boyaca', 'boyacá', 'santander', 'meta', 'narino', 'nariño'],
    answer: 'Esa es una loteria departamental. En Colombia casi todos los departamentos tienen su loteria con sorteo semanal. El precio de fraccion generalmente esta entre $4.000 y $6.000 COP. Puedes registrarla en Mi Boleta seleccionando Loteria como tipo de juego.',
  },
  {
    keywords: ['precio', 'precios', 'cuanto cuesta', 'cuánto cuesta', 'costo', 'valor', 'cuanto vale', 'cuánto vale', 'cuanto es', 'cuánto es'],
    answer: 'Los precios aproximados son: Chance desde $200, Baloto $3.500 por apuesta, SuperAstro desde $1.000, loterias departamentales entre $4.000 y $6.000 por fraccion, y rifas depende del organizador. Cuando registres una boleta en la app puedes anotar el valor exacto que pagaste.',
  },
  {
    keywords: ['cuando es', 'cuándo es', 'que dia', 'qué día', 'dia de sorteo', 'dia sorteo', 'fecha sorteo', 'cuando sortea', 'cuándo sortea'],
    answer: 'Los dias de sorteo son: lunes Tolima y Cundinamarca, martes Boyaca, miercoles Baloto y Cruz Roja, jueves Bogota y Huila, viernes Medellin y Meta, sabado Cauca y Risaralda. El Chance y el SuperAstro sortean todos los dias. ¿Te interesa alguna en particular?',
  },
  {
    keywords: ['premio', 'premios', 'cuanto gano', 'cuánto gano', 'cuanto paga', 'cuánto paga', 'pago', 'paga'],
    answer: 'Los premios mayores de loterias departamentales estan entre $2.500 y $4.000 millones. El Baloto acumula y puede superar $30.000 millones. El Chance en 4 cifras paga hasta 4.500 veces lo apostado y el SuperAstro hasta $40.000.000. Ten en cuenta que los premios de loteria tienen retencion en la fuente del 20%.',
  },
  {
    keywords: ['crear', 'nueva boleta', 'agregar', 'registrar', 'añadir', 'guardar boleta', 'como agrego', 'como registro'],
    answer: 'Haz clic en el boton "Nueva boleta" arriba a la derecha, completa los datos del juego y guarda con estado Pendiente. Cuando salga el resultado lo editas y cambias el estado a Ganado o Perdido.',
  },
  {
    keywords: ['editar', 'modificar', 'actualizar', 'cambiar estado', 'cambiar boleta'],
    answer: 'Pasa el cursor sobre la tarjeta de la boleta y aparece el icono del lapiz. Al hacer clic se abre el formulario donde puedes cambiar cualquier campo, incluido el estado.',
  },
  {
    keywords: ['eliminar', 'borrar', 'delete', 'quitar', 'remover'],
    answer: 'Pasa el cursor sobre la tarjeta y haz clic en el icono de papelera. Te pide confirmacion antes de borrar. Una vez eliminada no se puede recuperar.',
  },
  {
    keywords: ['filtro', 'filtros', 'buscar', 'busqueda', 'búsqueda', 'busco', 'encontrar'],
    answer: 'Arriba de la lista tienes una barra de busqueda para encontrar por titulo o numero, y dos selectores para filtrar por tipo de juego y por estado. Puedes combinarlos como quieras.',
  },
  {
    keywords: ['estado', 'estados', 'pendiente', 'ganado', 'perdido'],
    answer: 'Cada boleta tiene tres estados posibles: Pendiente cuando aun no sabes el resultado, Ganado si obtuviste el premio, y Perdido si no salio. Puedes cambiarlo en cualquier momento editando la boleta.',
  },
  {
    keywords: ['admin', 'administrador', 'panel admin', 'vista admin', 'todos los tickets'],
    answer: 'El panel de administracion es exclusivo para el usuario admin. Desde ahi se pueden ver todas las boletas de todos los usuarios con estadisticas globales, y se puede filtrar o buscar por cualquier campo incluyendo el nombre o correo del dueno.',
  },
  {
    keywords: ['cerrar sesion', 'cerrar sesión', 'salir', 'logout', 'desconectar'],
    answer: 'Haz clic en tu nombre o inicial en la esquina superior derecha y selecciona Cerrar sesion en el menu que aparece.',
  },
  {
    keywords: ['registrar cuenta', 'crear cuenta', 'nueva cuenta', 'registrarme', 'como me registro', 'signup', 'register'],
    answer: 'En la pantalla de inicio de sesion hay un enlace que dice Registrate al final del formulario. Solo necesitas nombre, correo y contraseña.',
  },
  {
    keywords: ['contrasena', 'contraseña', 'password', 'clave', 'olvide', 'olvidé'],
    answer: 'La contraseña debe tener minimo 8 caracteres. Si la olvidaste necesitas contactar al administrador del sistema para que te la restablezca.',
  },
  {
    keywords: ['que es', 'qué es', 'para que sirve', 'para qué sirve', 'sobre la app', 'informacion de la app'],
    answer: 'Mi Boleta es una app para registrar todas tus participaciones en sorteos, loterias y rifas en un solo lugar. Puedes llevar el control de cuanto has apostado, en que fechas y si ganaste o no, sin tener que recordar cada detalle.',
  },
  {
    keywords: ['tipos de juego', 'tipo juego', 'loteria', 'lotería', 'rifa', 'sorteo', 'juego ocasional', 'tipo de boleta'],
    answer: 'La app maneja cinco tipos: Lotería para loterías departamentales, Rifa para rifas con boleta numerada, Sorteo para sorteos con premio fijo, Boleta para casos generales, y Juego ocasional para Baloto, Chance o SuperAstro. Elige el que mejor describa lo que compraste.',
  },
  {
    keywords: ['gane', 'gané', 'gano', 'gano algo', 'creo que gane', 'me gané'],
    answer: 'Edita la boleta y cambia el estado a Ganado. Puedes anotar el monto del premio en el campo de notas. Recuerda que tienes hasta un año para reclamar el premio en loterias y que aplica retencion en la fuente del 20%.',
  },
  {
    keywords: ['perdi', 'perdí', 'no gane', 'no gané', 'no salio', 'no me gane'],
    answer: 'Edita la boleta y marcala como Perdida para mantener el historial al dia. Desde la app puedes ver cuanto llevas invertido en total por tipo de juego.',
  },
  {
    keywords: ['pagina', 'página', 'paginacion', 'paginación', 'mas boletas', 'ver mas'],
    answer: 'Las boletas se cargan de 20 en 20. Usa los botones de navegacion al final de la lista para moverte entre paginas.',
  },
  {
    keywords: ['ayuda', 'help', 'soporte', 'error', 'problema', 'no funciona', 'falla'],
    answer: 'Si algo no funciona bien, intenta recargar la pagina o cerrar sesion y volver a entrar. Si el problema continua, describeme que esta pasando e intento orientarte.',
  },
  {
    keywords: ['gracias', 'thanks', 'perfecto', 'listo', 'ok gracias', 'muchas gracias', 'muy bien', 'genial', 'excelente', 'chevere'],
    answer: 'Con gusto. Cualquier otra duda me dices.',
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
  return 'No tengo informacion sobre eso. Puedes preguntarme por loterias colombianas como Medellin, Bogota o Baloto, por los precios y dias de sorteo, o sobre como usar la app.';
}

function now() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

const INITIAL: Message[] = [
  { id: 1, from: 'bot', text: 'Hola, ¿en que te puedo ayudar?', time: now() },
  { id: 2, from: 'bot', text: 'Puedo contarte sobre loterias colombianas, precios, dias de sorteo o como usar la app.', time: now() },
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
