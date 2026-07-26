import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleSignIn } from "../components/GoogleSignIn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Flame, Trophy, BarChart3, ArrowRight, Quote, ChevronDown, Dumbbell, HeartPulse, Sparkles, Users, ShieldCheck, Star } from "lucide-react";

const features = [
  { icon: Target, title: "Metas Diarias", desc: "Establece objetivos personalizados y mantén tu racha activa día tras día." },
  { icon: Flame, title: "Rachas", desc: "Entrena de lunes a sábado para mantener y aumentar tu racha. Los domingos son de descanso." },
  { icon: Trophy, title: "Recompensas", desc: "Canjea tus puntos por premios visuales y físicos. Desbloquea logros al alcanzar metas." },
  { icon: BarChart3, title: "Estadísticas", desc: "Monitorea tu progreso con gráficos musculares y estadísticas detalladas." },
];

const testimonials = [
  { name: "Carlos M.", role: "Corredor Amateur", quote: "Fit Plus ULTRA transformó mi manera de entrenar. Las rachas me mantienen motivado todos los días.", color: "from-primary/20 to-secondary/10" },
  { name: "Laura G.", role: "Profesional Ocupada", quote: "Nunca había sido tan constante. El sistema de puntos y recompensas me enganchó desde el primer día.", color: "from-secondary/20 to-accent/10" },
  { name: "Miguel R.", role: "Entrenador Personal", quote: "Como entrenador, la doble verificación de rutinas me da control total sobre el progreso de mis clientes.", color: "from-primary/15 to-accent/15" },
];

const helpItems = [
  {
    icon: "📋",
    title: "Organizar tu rutina",
    content: (
      <div className="space-y-2">
        <p>1. Ve a <strong>Ejercicios</strong> y selecciona hasta 7 ejercicios haciendo clic en las tarjetas. Puedes filtrar por grupo muscular y nivel.</p>
        <p>2. Ve a <strong>Rutina</strong> para configurar las series y repeticiones de cada ejercicio.</p>
        <p>3. Envía la rutina a tu entrenador para su revisión.</p>
        <p>4. Una vez aprobada, inicia el cronómetro y completa cada ejercicio.</p>
        <p>5. Al terminar, envía la rutina para verificación final del entrenador y recibe tus puntos.</p>
      </div>
    ),
  },
  {
    icon: "⭐",
    title: "Sistema de puntos",
    content: (
      <div className="space-y-2">
        <p>Cada ejercicio tiene un valor en puntos según su nivel: <strong>Nivel 1 = 1 pt</strong>, <strong>Nivel 2 = 5 pts</strong>, <strong>Nivel 3 = 10 pts</strong>.</p>
        <p>Al completar todos los ejercicios, recibes un <strong>bono extra</strong> calculado como: (promedio de puntos × número de ejercicios) × 5.</p>
        <p>El entrenador verifica la ejecución antes de otorgar los puntos.</p>
      </div>
    ),
  },
  {
    icon: "🔥",
    title: "Racha diaria",
    content: (
      <div className="space-y-2">
        <p>Tu racha aumenta cada vez que completas una rutina de <strong>lunes a sábado</strong>. Los domingos son de descanso y no afectan tu racha.</p>
        <p>Si pierdes la racha por faltar un día entre semana, puedes comprar un <strong>recuperador de racha</strong> en la tienda por 200 puntos.</p>
      </div>
    ),
  },
  {
    icon: "🏪",
    title: "Tienda de recompensas",
    content: (
      <div className="space-y-2">
        <p>Canjea tus puntos en la <strong>Tienda</strong> por:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li><strong>Recompensas visuales</strong>: marco dorado, frases motivadoras, avatar exclusivo.</li>
          <li><strong>Recompensas físicas</strong>: descuento en membresía, bebida hidratante, proteína, pase de invitado.</li>
          <li><strong>Recuperador de racha</strong>: 200 pts.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: "👤",
    title: "Personalizar tu perfil",
    content: (
      <div className="space-y-2">
        <p>En tu <strong>Perfil</strong> puedes editar tu nombre, ver estadísticas (racha, puntos, logros), activar recompensas visuales y consultar el gráfico de grupos musculares entrenados.</p>
      </div>
    ),
  },
  {
    icon: "📊",
    title: "Historial de rutinas",
    content: "La sección <strong>Historial</strong> muestra todas tus rutinas completadas agrupadas por mes. Puedes expandir cada entrada para ver ejercicios, series, repeticiones, tiempo y puntos obtenidos.",
  },
];

const guestFaqItems = [
  {
    icon: "📋",
    title: "¿Cómo funciona Fit Plus Ultra?",
    content: "Regístrate con Google o correo. La dirección del gimnasio te asignará un entrenador. Luego podrás armar tu rutina con hasta 7 ejercicios, enviarla a revisión y comenzar a entrenar.",
  },
  {
    icon: "⭐",
    title: "¿Cómo gano puntos?",
    content: "Cada ejercicio tiene un valor (1, 5 o 10 pts según nivel). Al completar la rutina recibes un bono extra. Tu entrenador verifica la ejecución antes de otorgar los puntos.",
  },
  {
    icon: "🔥",
    title: "¿Cómo funciona la racha?",
    content: "Entrena de lunes a sábado para mantener tu racha. Los domingos no afectan. Si pierdes la racha, puedes comprar un recuperador en la tienda por 200 puntos.",
  },
  {
    icon: "🏪",
    title: "¿Qué puedo canjear en la tienda?",
    content: "Recompensas visuales (marcos, avatares), físicas (descuentos, bebidas) y el recuperador de racha. Canjea con los puntos que ganes entrenando.",
  },
];

function HelpSection({ items, defaultOpen = false }) {
  return (
    <div className="w-full space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          open={defaultOpen && i === 0}
          className="bg-card rounded-xl border shadow-sm overflow-hidden group"
        >
          <summary className="px-6 py-4.5 cursor-pointer font-semibold text-foreground text-lg hover:bg-muted/30 transition-colors list-none flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1">{item.title}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
          </summary>
          <div className="px-6 pb-5 text-base text-muted-foreground leading-relaxed border-t pt-3">
            {typeof item.content === "string" ? <p>{item.content}</p> : item.content}
          </div>
        </details>
      ))}
    </div>
  );
}

function SectionHeading({ children, centered = false }) {
  return (
    <h2 className={`text-4xl md:text-5xl font-bold tracking-tight text-foreground ${centered ? "text-center" : ""}`}>
      {children}
    </h2>
  );
}

function SectionSubheading({ children }) {
  return <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">{children}</p>;
}

function HeroShape() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute -top-40 -right-40 w-[600px] h-[600px] md:w-[800px] md:h-[800px] text-primary/5"
        viewBox="0 0 761 648"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M760.498 648L424.498 0H0V648H760.498Z" />
      </svg>
      <svg
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] text-secondary/5 rotate-180"
        viewBox="0 0 761 648"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M760.498 648L424.498 0H0V648H760.498Z" />
      </svg>
    </div>
  );
}

export default function Home() {
  const { user, userData, role } = useAuth();
  const hasTrainer = !!userData?.trainerId;

  return (
    <div className="min-h-screen bg-background">
      {/* ───────────────────────────────────────────── */}
      {/* GUEST — Full Landing Page                     */}
      {/* ───────────────────────────────────────────── */}
      {!user && (
        <>
          {/* ═══ HERO ═══ */}
          <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 px-6">
            <HeroShape />
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                    Gamificación · Rachas · Logros
                  </div>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
                    Fit Plus{" "}
                    <span className="text-primary">ULTRA</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mt-5 max-w-xl leading-relaxed">
                    Convierte tu entrenamiento en una experiencia divertida y motivadora.
                    Gana puntos, desbloquea recompensas y mantén tu racha activa.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                    <GoogleSignIn />
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/auth">Iniciar sesión</Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground/60 mt-4">Sin compromiso. Comienza hoy gratis.</p>
                </div>

                {/* Phone mockup */}
                <div className="flex-1 flex justify-center lg:justify-end">
                  <div className="relative w-[280px] sm:w-[320px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-[3rem] blur-xl" />
                    <div className="relative bg-card border-2 border-border rounded-[3rem] p-4 shadow-2xl">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-muted-foreground/30 rounded-full" />
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 px-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">F</div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">¡Bienvenido!</p>
                            <p className="text-[10px] text-muted-foreground">Tu racha: 0 días</p>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Progreso semanal</p>
                          <div className="flex gap-1 mt-2">
                            {["L", "M", "M", "J", "V", "S"].map((d, i) => (
                              <div key={i} className={`flex-1 h-8 rounded-md ${i < 3 ? "bg-primary/60" : i === 3 ? "bg-primary/30" : "bg-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Puntos</p>
                            <p className="text-sm font-bold text-primary">0</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Logros</p>
                            <p className="text-sm font-bold text-primary">0</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ FEATURES ═══ */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-primary)/5,transparent_60%)]" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <p className="text-primary font-semibold text-sm uppercase tracking-wider">Características</p>
                <SectionHeading centered>Todo lo que necesitas para entrenar</SectionHeading>
                <SectionSubheading>Una plataforma completa con gamificación, seguimiento y recompensas.</SectionSubheading>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f) => (
                  <Card key={f.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <f.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1.5">{f.title}</h3>
                      <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ RESULTS ═══ */}
          <section className="py-24 px-6 bg-muted/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,var(--color-secondary)/5,transparent_60%)]" />
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1">
                <div className="relative w-full max-w-md mx-auto aspect-square">
                  <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
                  <div className="relative grid grid-cols-2 gap-3 h-full p-4">
                    <div className="bg-card rounded-2xl p-4 shadow-sm border flex flex-col items-center justify-center text-center">
                      <Dumbbell className="w-7 h-7 text-primary mb-2" />
                      <p className="text-3xl font-bold text-foreground">200+</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Ejercicios</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 shadow-sm border flex flex-col items-center justify-center text-center">
                      <HeartPulse className="w-7 h-7 text-secondary mb-2" />
                      <p className="text-3xl font-bold text-foreground">5</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Grupos Musculares</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 shadow-sm border flex flex-col items-center justify-center text-center">
                      <Flame className="w-7 h-7 text-primary mb-2" />
                      <p className="text-3xl font-bold text-foreground">∞</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Racha</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 shadow-sm border flex flex-col items-center justify-center text-center">
                      <Trophy className="w-7 h-7 text-secondary mb-2" />
                      <p className="text-3xl font-bold text-foreground">+10</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Recompensas</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <p className="text-primary font-semibold text-sm uppercase tracking-wider">Resultados</p>
                <SectionHeading>Entrena más inteligente, no más duro</SectionHeading>
                <SectionSubheading>
                  Accede a un catálogo de ejercicios clasificados por grupo muscular y nivel de dificultad.
                  Cada rutina pasa por doble verificación con tu entrenador para asegurar la mejor técnica.
                </SectionSubheading>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                  <Button asChild size="lg">
                    <Link to="/auth">Comenzar ahora <ArrowRight className="w-4 h-4 ml-2 inline-block align-middle" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ TESTIMONIALS ═══ */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,var(--color-primary)/4,transparent_60%)]" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <p className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonios</p>
                <SectionHeading centered>Lo que dicen nuestros usuarios</SectionHeading>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <Card key={t.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-primary/30 mb-3" />
                      <p className="text-muted-foreground text-base leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-primary font-bold text-sm`}>
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-base">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/10 shadow-xl">
                <CardContent className="p-10 md:p-14">
                  <SectionHeading centered>Comienza tu transformación</SectionHeading>
                  <SectionSubheading>
                    Únete a Fit Plus ULTRA y descubre una nueva forma de entrenar.
                  </SectionSubheading>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    <GoogleSignIn />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ═══ FAQ ═══ */}
          <section className="pb-24 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</p>
                <SectionHeading centered>Preguntas frecuentes</SectionHeading>
              </div>
              <HelpSection items={guestFaqItems} />
            </div>
          </section>
        </>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* CLIENT — Dashboard                            */}
      {/* ───────────────────────────────────────────── */}
      {user && role === "cliente" && userData && (
        <section className="pt-12 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  👋 Bienvenido, {userData.displayName || "Usuario"}
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">Sigue entrenando para alcanzar tus metas</p>
              </div>
              {hasTrainer ? (
                <Button asChild size="lg" className="whitespace-nowrap">
                  <Link to="/routine">Ir a mi rutina <ArrowRight className="w-4 h-4 ml-1.5 inline-block align-middle" /></Link>
                </Button>
              ) : (
                <Card className="border-yellow-200 bg-yellow-50 shadow-none">
                  <CardContent className="p-3 text-center text-sm text-yellow-800">
                    🔒 Sin entrenador asignado — comunícate con la dirección del gimnasio
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { label: "Rutinas completadas", value: userData.completedRoutines || 0, icon: Dumbbell, color: "text-blue-600" },
                { label: "Puntos totales", value: userData.totalPoints || 0, icon: Star, color: "text-yellow-500" },
                { label: "Racha actual", value: `${userData.streak || 0} 🔥`, icon: Flame, color: "text-red-500" },
                { label: "Días registrado", value: (() => { const raw = userData.createdAt; const date = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : null; return date ? Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)) : 0; })(), icon: HeartPulse, color: "text-green-600" },
              ].map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasTrainer && (
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground text-lg mb-2">📋 Tu próxima rutina</h3>
                    <p className="text-muted-foreground text-base mb-4">
                      {userData.currentRoutine?.length > 0
                        ? `Tienes ${userData.currentRoutine.length} ejercicio(s) seleccionados.`
                        : "Aún no has seleccionado ejercicios. Ve al catálogo y arma tu rutina."}
                    </p>
                    <Button asChild variant={userData.currentRoutine?.length > 0 ? "default" : "outline"} size="sm">
                      <Link to="/exercises">
                        {userData.currentRoutine?.length > 0 ? "Ver ejercicios" : "Ir al catálogo"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/10">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground text-lg mb-2">📊 Progreso</h3>
                    <p className="text-muted-foreground text-base mb-4">
                      Revisa tu historial de rutinas, estadísticas por grupo muscular y más en tu perfil.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/profile">Ir a mi perfil</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ FAQ — Guía de la app (mismo estilo que landing) ═══ */}
            <div className="border-t pt-16">
              <div className="text-center mb-10">
                <p className="text-primary font-semibold text-sm uppercase tracking-wider">Guía</p>
                <SectionHeading centered>¿Cómo usar Fit Plus ULTRA?</SectionHeading>
                <SectionSubheading>Todo lo que necesitas saber para aprovechar la app al máximo.</SectionSubheading>
              </div>
              <HelpSection items={helpItems} />
            </div>
          </div>
        </section>
      )}

      {user && role === "cliente" && !userData && (
        <div className="pt-24 text-center">
          <p className="text-muted-foreground animate-pulse font-medium">Cargando tu información...</p>
        </div>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* TRAINER                                       */}
      {/* ───────────────────────────────────────────── */}
      {user && role === "entrenador" && (
        <section className="pt-12 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">👋 Panel de Entrenador</h1>
              <p className="text-muted-foreground mt-1 text-lg">Gestiona a tus clientes y monitorea su progreso.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-xl font-bold mb-2">📋 Mis Clientes</h3>
                  <p className="text-muted-foreground text-base mb-4">
                    Visualiza y administra la cartera de clientes asignados. Revisa rutinas, rachas y progreso.
                  </p>
                  <Button asChild>
                    <Link to="/clients">Ir a Mis Alumnos</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <ShieldCheck className="w-8 h-8 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">✅ Verificaciones</h3>
                  <p className="text-muted-foreground text-base mb-4">
                    Revisa y aprueba las rutinas de tus clientes. Doble verificación de consistencia y ejecución.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/clients">Ir a revisiones</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* ADMIN                                         */}
      {/* ───────────────────────────────────────────── */}
      {user && role === "administrador" && (
        <section className="pt-12 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">👋 Panel de Administración</h1>
              <p className="text-muted-foreground mt-1 text-lg">Administra usuarios, asigna entrenadores y supervisa la plataforma.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-xl font-bold mb-2">👥 Usuarios</h3>
                  <p className="text-muted-foreground text-base mb-4">
                    Gestiona todos los usuarios: crea, edita, elimina cuentas y asigna roles.
                  </p>
                  <Button asChild>
                    <Link to="/admin/usuarios">Ir a Usuarios</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <ShieldCheck className="w-8 h-8 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">🔗 Asignaciones</h3>
                  <p className="text-muted-foreground text-base mb-4">
                    Vincula clientes a entrenadores y supervisa las carteras de cada uno.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/admin/usuarios">Gestionar asignaciones</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {user && !role && (
        <div className="pt-24 text-center">
          <p className="text-muted-foreground animate-pulse font-medium">Cargando tu perfil...</p>
        </div>
      )}
    </div>
  );
}
