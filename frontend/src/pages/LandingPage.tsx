import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Brain, MessageCircle, BarChart3, Music, BookOpen, Mic, ArrowRight, Star, Zap, Heart, Shield, Lock, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'AI Mood Chat',
    desc: 'Real-time conversations with empathetic AI. Share how you feel, get thoughtful responses.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: BarChart3,
    title: 'Mood Analytics',
    desc: 'Track emotional patterns with beautiful weekly trend charts and deep insights.',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Music,
    title: 'Mood Music',
    desc: 'Spotify playlists curated to match and elevate your current emotional state.',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: BookOpen,
    title: 'Smart Journal',
    desc: 'AI-powered journaling with instant mood analysis and personalised insights.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Mic,
    title: 'Voice Interaction',
    desc: 'Speak your thoughts. EchoMind listens, understands, and responds with voice.',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: Zap,
    title: 'Weekly AI Summary',
    desc: 'Personalised wellness summaries powered by Gemini, delivered every week.',
    gradient: 'from-brand-500 to-violet-500',
    bg: 'bg-brand-50 dark:bg-brand-900/20',
  },
]

const STEPS = [
  { num: '01', title: 'Tell us how you feel', desc: 'Type or speak — EchoMind detects your mood instantly.' },
  { num: '02', title: 'Get personalised support', desc: 'Receive AI insights, quotes, and music tailored to your state.' },
  { num: '03', title: 'Track your journey', desc: 'Watch your emotional patterns evolve with beautiful analytics.' },
]

const TESTIMONIALS = [
  { name: 'Aarav S.', text: 'EchoMind actually listens. The mood music feature is unreal.', mood: '😊' },
  { name: 'Priya K.', text: 'My mental health has improved so much since I started journaling here.', mood: '😌' },
  { name: 'Rohan M.', text: "The voice feature is so calming. I use it every morning.", mood: '🧘' },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* ── Animated background ── */}
      <div className="mesh-bg" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow-brand">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">EchoMind</span>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              Go to App <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="btn-ghost text-sm hidden sm:flex">Sign in</Link>
              <Link to="/sign-up" className="btn-primary text-sm">
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 text-xs font-medium"
          >
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            Powered by secure AI
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            A safe space for
            <br />
            <span className="gradient-text">your mind.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Navigate your feelings without judgment. Talk freely, track insights, and find your center with AI that actually listens.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/sign-up" className="btn-primary px-8 py-3.5 text-base rounded-2xl">
                Start feeling better today <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/sign-in" className="btn-outline px-8 py-3.5 text-base rounded-2xl">
                Log in
              </Link>
            </motion.div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="flex">
              {['🧑', '👩', '🧑‍💻', '👨', '👩‍🎓'].map((e, i) => (
                <span key={i} className="w-8 h-8 -ml-2 first:ml-0 rounded-full border-2 border-white dark:border-gray-950 bg-gradient-to-br from-brand-200 to-violet-200 flex items-center justify-center text-sm">
                  {e}
                </span>
              ))}
            </div>
            <span><strong className="text-gray-700 dark:text-gray-300">2,400+</strong> people improving their mental wellness</span>
          </div>
        </motion.div>

        {/* Hero floating chatbot preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ 
            opacity: { delay: 0.4, duration: 0.8 },
            y: { delay: 0.4, duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="glass-card p-6 text-left shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-xl shadow-glow-brand">🧠</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">EchoMind</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="ml-auto"
              >
                <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white/40 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700 backdrop-blur-md">
                  🫂 Overwhelmed detected
                </span>
              </motion.div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-end"
              >
                <div className="bg-brand-500 text-white text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-sm shadow-md">
                  I just feel so overwhelmed with everything today.
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-2 items-end"
              >
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md text-gray-800 dark:text-gray-200 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-sm shadow-sm border border-white/20 dark:border-white/5">
                  I hear you. It’s completely okay to feel that way right now. Let's take a deep breath together. What's the heaviest thing on your mind?
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Trust Banner ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-8 border-y border-gray-200/50 dark:border-white/10 opacity-70">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Lock className="w-4 h-4 text-gray-400" /> End-to-end Secure
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <EyeOff className="w-4 h-4 text-gray-400" /> 100% Private
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Shield className="w-4 h-4 text-gray-400" /> No Judgement
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Three steps to better mental wellness
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-glow-brand">
                {s.num}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Everything you need to thrive
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, gradient, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2, delay: 0 } }}
              className="glass-card p-6 group cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <div className={`w-5 h-5 bg-gradient-to-br ${gradient} [mask-image:url()] text-transparent`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-br ${gradient} text-transparent`} style={{ fill: 'url(#grad)' }} />
                </div>
                <Icon className={`w-5 h-5 bg-gradient-to-br ${gradient}`} style={{ color: 'var(--tw-gradient-from)' }} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loved by wellness-focused people</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2, delay: 0 } }}
              className="glass-card p-6 group cursor-default"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{t.mood}</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <Heart className="w-10 h-10 mx-auto mb-5 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to feel better?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands building healthier emotional habits with AI-powered guidance.
          </p>
          <Link to="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-2xl hover:bg-brand-50 transition-colors shadow-lg text-base">
            Get started for free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-300">EchoMind</span>
        </div>
        <p>EchoMind is an AI wellness companion, not a substitute for professional mental healthcare.</p>
        <p className="mt-1">© {new Date().getFullYear()} EchoMind. Built with ❤️</p>
      </footer>
    </div>
  )
}
