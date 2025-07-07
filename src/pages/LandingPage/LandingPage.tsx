import React, { useState, useEffect, useRef, Suspense, lazy, memo, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Critical icons only - loaded immediately
import {
  ArrowRight, Monitor, Target, Users, Menu, X, Check,
  Play, TrendingUp, Rocket, Crown, MessageSquare, Search,
  MapPin, Eye, Star, Clock, Heart, ChevronRight, Sparkles,
  Brain, BarChart3, Lightbulb, BookOpen, CheckCircle, Zap
} from 'lucide-react';

import { Button } from '../../components/Button';
import { SmartSearchInput } from '../../components/SmartSearchInput';
import { screens as mockScreens } from '../../data/mockData';
import { Screen } from '../../types';

// BackgroundGradientAnimation Component
const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(30, 64, 175)", // blue-800
  gradientBackgroundEnd = "rgb(79, 70, 229)", // indigo-600
  firstColor = "59, 130, 246", // blue-500
  secondColor = "147, 197, 253", // blue-300
  thirdColor = "6, 182, 212", // cyan-500
  fourthColor = "34, 197, 94", // green-500
  fifthColor = "168, 85, 247", // purple-500
  pointerColor = "99, 102, 241", // indigo-500
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    document.body.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, [gradientBackgroundStart, gradientBackgroundEnd, firstColor, secondColor, thirdColor, fourthColor, fifthColor, pointerColor, size, blendingValue]);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) return;
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    }
    move();
  }, [tgX, tgY, curX, curY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 ${containerClassName || ''}`}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={className}>{children}</div>
      <div
        className={`gradients-container h-full w-full blur-lg ${
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        }`}
      >
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:center_center] animate-first opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-400px)] animate-second opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%+400px)] animate-third opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-200px)] animate-fourth opacity-70" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-800px)_calc(50%+800px)] animate-fifth opacity-100" />
        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70"
          />
        )}
      </div>
    </div>
  );
};

// Modern Navigation Components
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-white/90 hover:text-cyan-300 font-medium transition-colors"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const ModernMenu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-xl flex justify-center space-x-6 px-8 py-4"
    >
      {children}
    </nav>
  );
};

const ProductItem = ({
  title,
  description,
  href,
  icon,
  subtitle,
  onClick,
}: {
  title: string;
  description: string;
  href?: string;
  icon: string;
  subtitle?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h4 className="text-base font-semibold mb-1 text-gray-900">
          {title}
        </h4>
        {subtitle && (
          <p className="text-sm font-medium text-blue-600 mb-1">{subtitle}</p>
        )}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  return href ? (
    <Link to={href}>
      {content}
    </Link>
  ) : (
    content
  );
};

const HoveredLink = ({ children, to, ...rest }: { children: React.ReactNode; to: string }) => {
  return (
    <Link
      to={to}
      {...rest}
      className="text-gray-700 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  );
};

// Optimized lazy loading - removed problematic imports for now
// These can be re-added when the section files are created
const LazyTestimonials = memo(() => {
  const testimonials = [
    {
      company: "Café Luna Azul",
      name: "María Elena Rodríguez",
      role: "Gerente de Marketing",
      review: "Shareflow nos permitió llegar a más clientes durante las horas pico. Nuestras ventas aumentaron un 35% en solo dos meses. La plataforma es muy fácil de usar y el soporte es excelente.",
      rating: 5
    },
    {
      company: "Gimnasio FitZone",
      name: "Carlos Mendoza",
      role: "Propietario",
      review: "Como negocio local, nunca pensé que podríamos acceder a publicidad digital de calidad. Con Shareflow logramos atraer 200 nuevos miembros en 3 meses. La inversión se pagó sola.",
      rating: 5
    },
    {
      company: "Boutique Estilo Único",
      name: "Ana Patricia Vásquez",
      role: "Fundadora",
      review: "La segmentación por ubicación es perfecta para nuestro negocio. Pudimos mostrar nuestras promociones exactamente donde están nuestros clientes potenciales. Resultados increíbles.",
      rating: 5
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
        >
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, index) => (
                <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              "{testimonial.review}"
            </p>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="font-bold text-white text-sm">{testimonial.name}</div>
            <div className="text-gray-400 text-xs">{testimonial.role}</div>
            <div className="text-cyan-300 text-xs font-medium mt-1">{testimonial.company}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

// Thinking posts data - same as in Thinking.tsx
const thinkingPosts = [
  {
    id: 'moment-to-shine-creativity',
    title: 'Es el Momento de Todos de Brillar',
    subtitle: 'Cómo la Creatividad Democratiza el DOOH',
    excerpt: 'Explora cómo Shareflow está transformando el panorama publicitario exterior para que cada marca, sin importar su tamaño, pueda crear experiencias memorables y conectar auténticamente con sus audiencias en pantallas digitales.',
    author: 'María González',
    readTime: '8 min',
    date: '2024-01-18',
    category: 'creativity',
    tags: ['Creatividad', 'Democratización', 'Experiencias'],
    featured: true,
    type: 'research',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop&crop=center'
  },
  {
    id: 'connected-dooh-future',
    title: 'Connected Out-of-Home: El Futuro Ya Llegó',
    subtitle: 'Liderando la Transformación Digital del DOOH',
    excerpt: 'Descubre cómo Shareflow está pionerizando la evolución hacia un ecosistema DOOH verdaderamente conectado, donde pantallas inteligentes, datos en tiempo real y experiencias personalizadas convergen.',
    author: 'Carlos Rodríguez',
    readTime: '12 min',
    date: '2024-01-15',
    category: 'connected-dooh',
    tags: ['Connected DOOH', 'Innovación', 'Futuro'],
    featured: true,
    type: 'whitepaper',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center'
  },
  {
    id: 'content-experiences-that-matter',
    title: 'Contenido que Realmente Importa',
    subtitle: 'Creando Experiencias Auténticas en DOOH',
    excerpt: 'Análisis profundo sobre cómo crear contenido que no solo capture la atención, sino que genere conexiones emocionales genuinas. Desde storytelling visual hasta experiencias interactivas.',
    author: 'Ana Martínez',
    readTime: '10 min',
    date: '2024-01-12',
    category: 'experience',
    tags: ['Contenido', 'Storytelling', 'Conexión'],
    featured: true,
    type: 'research',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop&crop=center'
  }
];

// Interactive Thinking Card Component
const ThinkingCard = memo(({ post, index, navigate }: { post: typeof thinkingPosts[0]; index: number; navigate: (path: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return BarChart3;
      case 'insight': return Lightbulb;
      case 'trend': return TrendingUp;
      case 'case-study': return Target;
      case 'whitepaper': return BookOpen;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'from-blue-500 to-cyan-500';
      case 'insight': return 'from-purple-500 to-pink-500';
      case 'trend': return 'from-green-500 to-emerald-500';
      case 'case-study': return 'from-orange-500 to-red-500';
      case 'whitepaper': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const TypeIcon = getTypeIcon(post.type);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        type: "spring",
        bounce: 0.4
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", bounce: 0.5 }
      }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={() => navigate('/thinking')}
    >
      {/* Dynamic glow effect that follows mouse */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
        }}
      />
      
      {/* Card container with glassmorphism */}
      <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500">
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{
            background: isHovered ? [
              "linear-gradient(0deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
              "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
              "linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
              "linear-gradient(270deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
              "linear-gradient(360deg, transparent, rgba(59, 130, 246, 0.3), transparent)"
            ] : "linear-gradient(0deg, transparent, transparent, transparent)"
          }}
          transition={{
            duration: isHovered ? 2 : 0,
            repeat: isHovered ? Infinity : 0,
            ease: "linear"
          }}
          style={{ padding: '2px' }}
        />

        {/* Image section with advanced hover effects */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? "brightness(1.1) contrast(1.1)" : "brightness(1) contrast(1)"
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Dynamic overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            animate={{
              opacity: isHovered ? 0.8 : 0.4
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Floating particles effect */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    y: '-20px',
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
    </div>
          )}
          
          {/* Type badge with animation */}
          <motion.div
            className="absolute top-4 left-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", bounce: 0.7 }}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(post.type)} rounded-xl flex items-center justify-center shadow-lg`}>
              <TypeIcon className="w-6 h-6 text-white" />
          </div>
          </motion.div>
          
          {/* Reading time with pulse effect */}
          <motion.div
            className="absolute top-4 right-4"
            animate={{
              scale: isHovered ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <div className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
              <Clock className="w-3 h-3 inline mr-1" />
              {post.readTime}
        </div>
          </motion.div>
        </div>

        {/* Content section */}
        <div className="p-6 relative">
          {/* Shimmer effect background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
            animate={{
              translateX: isHovered ? ['100%', '200%'] : '-100%'
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 0.5
            }}
          />
          
          {/* Type label with animation */}
          <motion.div
            className="flex items-center gap-2 mb-3"
            animate={{
              x: isHovered ? [0, 2, 0] : 0
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <span className={`px-3 py-1 bg-gradient-to-r ${getTypeColor(post.type)} text-white text-xs font-bold rounded-full uppercase tracking-wide`}>
              {post.type.replace('-', ' ')}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(post.date).toLocaleDateString('es-CO', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </motion.div>

          {/* Title with typewriter effect on hover */}
          <motion.h3
            className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2"
            animate={{
              color: isHovered ? "#2563eb" : "#111827"
            }}
            transition={{ duration: 0.3 }}
          >
            {post.title}
          </motion.h3>
          
          {/* Subtitle */}
          {post.subtitle && (
            <motion.h4
              className="text-sm font-medium text-blue-600 mb-3 line-clamp-1"
              animate={{
                opacity: isHovered ? 1 : 0.8,
                y: isHovered ? 0 : 2
              }}
              transition={{ duration: 0.3 }}
            >
              {post.subtitle}
            </motion.h4>
          )}
          
          {/* Excerpt with fade animation */}
          <motion.p
            className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
            animate={{
              opacity: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          >
            {post.excerpt}
          </motion.p>
          
          {/* Tags with stagger animation */}
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial="hidden"
            animate={isHovered ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0.6 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {post.tags.slice(0, 2).map((tag, tagIndex) => (
              <motion.span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium"
                variants={{
                  hidden: { scale: 0.8, opacity: 0.6 },
                  visible: { scale: 1, opacity: 1 }
                }}
                whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
          
          {/* Author section with hover animation */}
          <motion.div
            className="flex items-center justify-between"
            animate={{
              y: isHovered ? -2 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", bounce: 0.7 }}
              >
                <span className="text-white text-sm font-bold">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </span>
              </motion.div>
              <div>
                <span className="text-sm font-medium text-gray-900">{post.author}</span>
                <div className="text-xs text-gray-500">{post.readTime} lectura</div>
    </div>
  </div>
            
            {/* Read more button with sophisticated animation */}
            <motion.button
              className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors overflow-hidden relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  x: isHovered ? [0, 4, 0] : 0
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  repeat: isHovered ? Infinity : 0
                }}
              >
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </motion.div>
              
              {/* Ripple effect */}
              {isHovered && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
});

const LazyThinkingSection = memo(() => {
  const navigate = useNavigate();
  
  // Only show if we have posts
  if (!thinkingPosts || thinkingPosts.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full text-sm font-bold text-blue-600 mb-6 border border-blue-200/50">
          <Brain className="w-4 h-4" />
          SHAREFLOW THINKING
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
          Thinking & <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Insights</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Donde la creatividad se encuentra con la innovación. Descubre cómo estamos democratizando el DOOH para que 
          <span className="font-semibold text-blue-600"> es el momento de todos de brillar</span> 🚀
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {thinkingPosts.map((post, index) => (
          <ThinkingCard key={post.id} post={post} index={index} navigate={navigate} />
        ))}
      </div>
      
      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Link to="/thinking">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Explorar Todos los Insights
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </span>
            
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
});

const LazyBlogSection = LazyThinkingSection; // Renaming for backward compatibility

const LazyMarketplacePreview = memo(() => (
  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Marketplace Preview</h3>
        <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm font-bold">
          LIVE
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="w-full h-24 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg mb-3"></div>
            <div className="text-sm font-semibold text-gray-900">Pantalla {i}</div>
            <div className="text-xs text-gray-500">Disponible</div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

// Lazy load non-critical icons
const LazyIcons = {
  Trophy: lazy(() => import('lucide-react').then(module => ({ default: module.Trophy }))),
  Timer: lazy(() => import('lucide-react').then(module => ({ default: module.Timer }))),
  Gauge: lazy(() => import('lucide-react').then(module => ({ default: module.Gauge }))),
  MapPin: lazy(() => import('lucide-react').then(module => ({ default: module.MapPin }))),
  ShoppingCart: lazy(() => import('lucide-react').then(module => ({ default: module.ShoppingCart }))),
  Award: lazy(() => import('lucide-react').then(module => ({ default: module.Award }))),
  Building: lazy(() => import('lucide-react').then(module => ({ default: module.Building }))),
  Heart: lazy(() => import('lucide-react').then(module => ({ default: module.Heart }))),
  Star: lazy(() => import('lucide-react').then(module => ({ default: module.Star }))),
  Share2: lazy(() => import('lucide-react').then(module => ({ default: module.Share2 })))
};

// Memoized skeleton components for better loading experience
const SectionSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
  </div>
));

// Memoized data - prevents recreation on re-renders
const STATIC_DATA = {
  steps: [
    {
      number: "01",
      title: "Elige tu Modelo",
      description: "Momentos deportivos, time-based o campañas programáticas según tus objetivos",
      iconName: "Target",
      color: "#353FEF"
    },
    {
      number: "02", 
      title: "Selecciona Pantallas",
      description: "Navega nuestro marketplace de 150+ pantallas estratégicamente ubicadas",
      iconName: "ShoppingCart",
      color: "#ABFAA9"
    },
    {
      number: "03",
      title: "Lanza y Mide",
      description: "Campañas en vivo con analytics en tiempo real y optimización automática",
      iconName: "Rocket",
      color: "#10B981"
    }
  ],

  features: [
    {
      iconName: "ShoppingCart",
      title: "Marketplace",
      description: "Explora y reserva pantallas digitales en tiempo real. Filtra por ubicación, audiencia y presupuesto para encontrar la pantalla perfecta",
      badge: "Disponible",
      color: "#353FEF"
    },
    {
      iconName: "Trophy",
      title: "Eventos Deportivos", 
      description: "Conecta con audiencias masivas durante partidos de la Liga Colombiana de Fútbol. Pantallas perimetrales en estadios con máximo impacto",
      badge: "Liga Colombiana",
      color: "#ABFAA9"
    },
    {
      iconName: "Gauge",
      title: "Smart Campaigns",
      description: "IA optimiza automáticamente tu inversión para maximizar conversiones. Campañas inteligentes que aprenden y mejoran",
      badge: "Próximamente",
      color: "#10B981"
    }
  ],

  metrics: [
    { value: "150+", label: "Pantallas Activas", description: "En las mejores ubicaciones de Colombia", color: "#353FEF" },
    { value: "2.5M+", label: "Impresiones Mensuales", description: "Alcance masivo garantizado", color: "#ABFAA9" },
    { value: "3.500+", label: "Usuarios Activos", description: "Momentos compartidos diariamente", color: "#10B981" }
  ]
};

// Animated Text Cycle Component
const AnimatedTextCycle = memo(({
  words,
  interval = 5000,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const elements = measureRef.current.children;
      if (elements.length > currentIndex) {
        const newWidth = elements[currentIndex].getBoundingClientRect().width;
        setWidth(`${newWidth}px`);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: { 
      y: -20,
      opacity: 0,
      filter: "blur(8px)"
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      y: 20,
      opacity: 0,
      filter: "blur(8px)",
      transition: { 
        duration: 0.3, 
        ease: "easeIn"
      }
    },
  };

  return (
    <>
      <div 
        ref={measureRef} 
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: "hidden" }}
      >
        {words.map((word, i) => (
          <span key={i} className={`font-bold ${className}`}>
            {word}
          </span>
        ))}
      </div>

      <motion.span 
        className="relative inline-block"
        animate={{ 
          width,
          transition: { 
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 1.2,
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={`inline-block font-bold ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ whiteSpace: "nowrap" }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
});

// Memoized icon component to prevent re-renders
const DynamicIcon = memo(({ iconName, className }: { iconName: string; className: string }) => {
  const IconComponent = LazyIcons[iconName as keyof typeof LazyIcons];
  
  if (!IconComponent) {
    return <div className={`${className} bg-gray-200 rounded animate-pulse`} />;
  }

  return (
    <Suspense fallback={<div className={`${className} bg-gray-200 rounded animate-pulse`} />}>
      <IconComponent className={className} />
    </Suspense>
  );
});

// Compact ScreenCard for search results preview - smaller and faster
const CompactScreenCard = memo(({ screen, index, onSelect }: { 
  screen: Screen; 
  index: number;
  onSelect: (screen: Screen) => void;
}) => {
  const compactData = useMemo(() => ({
    location: screen.location.split(',')[0],
    priceDisplay: `$${(screen.price / 1000).toFixed(1)}M`,
    status: screen.availability ? 'Disponible' : 'Ocupada',
    isPopular: screen.rating > 4.7
  }), [screen]);

  return (
        <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={() => onSelect(screen)}
      className="cursor-pointer group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Compact layout - horizontal */}
      <div className="flex items-center p-3 gap-3">
        {/* Small image */}
        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={screen.image}
            alt={screen.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {compactData.isPopular && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
              {screen.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-gray-600">{screen.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{compactData.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                screen.availability 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {compactData.status}
              </div>
              <div className="text-sm font-bold text-gray-900">
                {compactData.priceDisplay}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized step component
const StepCard = memo(({ step, index, isActive }: { 
  step: typeof STATIC_DATA.steps[0]; 
  index: number; 
  isActive: boolean;
}) => (
        <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2 }}
    className={`relative p-8 rounded-2xl border transition-all duration-300 shadow-xl ${
      isActive 
        ? 'border-white/30 scale-105' 
        : 'border-white/20 hover:border-white/40'
    }`}
          style={{
      background: isActive 
        ? 'rgba(255, 255, 255, 0.4)' 
        : 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}
  >
    <div className="flex items-center gap-4 mb-6">
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{
          background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
        }}
      >
        {step.number}
      </div>
      <div style={{ color: step.color }}>
        {step.iconName === "Target" ? <Target className="w-8 h-8" /> :
         step.iconName === "Rocket" ? <Rocket className="w-8 h-8" /> :
         <DynamicIcon iconName={step.iconName} className="w-8 h-8" />}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-[#1A1A35] mb-3">{step.title}</h3>
    <p className="text-gray-600 leading-relaxed">{step.description}</p>
    
    {isActive && (
        <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#353FEF] to-[#4F46E5] rounded-full flex items-center justify-center shadow-lg"
      >
        <Check className="w-4 h-4 text-white" />
      </motion.div>
    )}
  </motion.div>
));

// Memoized feature component
const FeatureCard = memo(({ feature, index }: { 
  feature: typeof STATIC_DATA.features[0]; 
  index: number;
}) => (
        <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative"
  >
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
          style={{ backgroundColor: feature.color }}
        >
          <DynamicIcon iconName={feature.iconName} className="w-8 h-8" />
      </div>
        <span 
          className="px-3 py-1 text-xs font-semibold rounded-full text-white"
          style={{ backgroundColor: feature.color }}
        >
          {feature.badge}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-[#1A1A35] mb-3">{feature.title}</h3>
      <p className="text-neutral-600 leading-relaxed mb-6">{feature.description}</p>
      
      {/* Feature-specific preview content */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
        {index === 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium">🔍 Buscar pantallas:</div>
            <div className="bg-white rounded p-2 text-xs">
              <div className="font-semibold">150+ pantallas disponibles</div>
              <div className="text-neutral-500">Filtra por ubicación y precio</div>
            </div>
            <div className="flex gap-1">
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Estadios</div>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Centros Comerciales</div>
            </div>
          </div>
        )}
        {index === 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">EN VIVO: Millonarios vs Nacional</span>
            </div>
            <div className="bg-white rounded p-2 text-xs">
              <div className="font-semibold">Pantalla perimetral activa</div>
              <div className="text-neutral-500">Liga Colombiana • El Campín</div>
            </div>
          </div>
        )}
        {index === 2 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium">Próximamente 2025</span>
            </div>
            <div className="bg-white rounded p-2 text-xs">
              <div className="font-semibold">IA optimizando campañas</div>
              <div className="text-neutral-500">Máximo ROI automático</div>
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
));

export function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [currentMetric, setCurrentMetric] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  // Enhanced scroll hooks
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.7]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);
  
  // Section refs for animations
  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const marketplaceRef = useRef(null);
  const metricsRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  // Memoized intersection observers
  const heroInView = useInView(heroRef, { once: true });
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const marketplaceInView = useInView(marketplaceRef, { once: true, amount: 0.3 });
  const metricsInView = useInView(metricsRef, { once: true, amount: 0.5 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });

  // Filter screens for search preview - only 3 best ones
  const featuredScreens = useMemo(() => {
    return mockScreens
      .filter(screen => screen.rating > 4.5 && screen.availability) // Only high-rated available screens
      .slice(0, 3) // Show only 3 cards as preview
      .sort((a, b) => b.rating - a.rating); // Sort by rating
  }, []);

  // Show cards only when there's search activity
  const showSearchResults = searchQuery.length > 0;

  // Memoized event handlers
  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  
  // Handle dropdown item clicks
  const handleDropdownItemClick = useCallback((itemTitle: string) => {
    setActive(null); // Close dropdown
    
    switch (itemTitle) {
      case 'For Media Owners':
        //navigate('/partners-landing');
        break;
      case 'For Brands & Media Agencies':
        //navigate('/marketplace');
        break;
      case 'For Creators':
        //navigate('/marketplace');
        break;
      case 'For AdTech Partners':
        //navigate('/contact');
        break;
      case 'Ads':
        //navigate('/marketplace');
        break;
      case 'Platform':
        //navigate('/partners-landing');
        break;
      default:
        break;
    }
  }, [navigate]);
  
  // Handle search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Navigate to marketplace with search results
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate]);

  // Handle screen selection
  const handleScreenSelect = useCallback((screen: Screen) => {
    setSelectedScreen(screen);
    // Navigate to login page
    navigate('/login');
  }, [navigate]);

  // Auto-cycle effects with cleanup
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STATIC_DATA.steps.length);
    }, 4000);
    
    const metricInterval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % STATIC_DATA.metrics.length);
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(metricInterval);
    };
  }, []);

  // Memoized navigation items with dropdowns
  const navItems = useMemo(() => [
    {
      name: 'Solutions',
      hasDropdown: true,
      items: [
        {
          title: 'For Brands & Media Agencies',
          subtitle: 'Shareflow Ads+',
          description: 'Campañas premium para marcas y agencias de medios',
          icon: '🎯'
        },
        {
          title: 'For Media Owners',
          subtitle: 'CMS, Player & Monetización',
          description: 'Gestiona tu red de pantallas y aumenta ingresos',
          icon: '🖥️'
        },
        {
          title: 'For AdTech Partners',
          subtitle: 'SSP & DSP Integration',
          description: 'Conecta con nuestros socios tecnológicos',
          icon: '🔗'
        },
        {
          title: 'For Creators',
          subtitle: 'Momentos & Time-based',
          description: 'Formato especial para creadores de contenido',
          icon: '✨'
        }
      ]
    },
    {
      name: 'Products',
      hasDropdown: true,
      items: [
        {
          title: 'Ads',
          subtitle: 'Marketplace & Campañas',
          description: 'Marketplace, eventos deportivos y Smart Campaigns',
          icon: '📱'
        },
        {
          title: 'Pixel',
          subtitle: 'Próximamente',
          description: 'Más información disponible pronto',
          icon: '🔍'
        },
        {
          title: 'Platform',
          subtitle: 'For Partners',
          description: 'Plataforma completa para socios de medios',
          icon: '⚡'
        }
      ]
    },
    { name: 'Recursos', hasDropdown: false }
  ], []);

  return (
    <>
      <Helmet>
        <title>Shareflow - Plataforma DOOH Líder | Connected Out-of-Home Colombia</title>
        <meta name="description" content="Shareflow es la plataforma líder de Connected Out-of-Home (DOOH) en Colombia. Democratizamos el acceso a la publicidad digital exterior para creadores, emprendedores y marcas. Es el momento de todos de brillar." />
        <meta name="keywords" content="DOOH, Connected Out-of-Home, publicidad digital exterior, pantallas digitales, marketplace publicitario, campañas DOOH Colombia, Shareflow, momentos deportivos, programática DOOH" />
        <link rel="canonical" href="https://shareflow.com" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Shareflow - Plataforma DOOH Líder en Colombia" />
        <meta property="og:description" content="Democratizamos el acceso a la publicidad Connected Out-of-Home. Es el momento de todos de brillar en más de 150 ubicaciones estratégicas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shareflow.com" />
        <meta property="og:image" content="https://shareflow.com/og-homepage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Shareflow" />
        <meta property="og:locale" content="es_CO" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shareflow - Plataforma DOOH Líder en Colombia" />
        <meta name="twitter:description" content="Democratizamos el acceso a la publicidad Connected Out-of-Home. Es el momento de todos de brillar." />
        <meta name="twitter:image" content="https://shareflow.com/twitter-homepage.png" />
        <meta name="twitter:site" content="@shareflow_co" />
        <meta name="twitter:creator" content="@shareflow_co" />
        
        {/* Enhanced Schema.org structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["Organization", "SoftwareApplication", "WebSite"],
            "name": "Shareflow",
            "alternateName": "Shareflow DOOH Platform",
            "description": "Plataforma líder de Connected Out-of-Home (DOOH) que democratiza el acceso a la publicidad digital exterior en Colombia",
            "url": "https://shareflow.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://shareflow.com/logo.svg",
              "width": 180,
              "height": 60
            },
            "foundingDate": "2024",
            "foundingLocation": {
              "@type": "Place",
              "name": "Bogotá, Colombia"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Calle 72 #10-07, Oficina 801",
              "addressLocality": "Bogotá",
              "addressCountry": "CO"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+57-1-234-5678",
              "contactType": "customer service",
              "email": "support@shareflow.me",
              "availableLanguage": ["Spanish", "English"]
            },
            "sameAs": [
              "https://linkedin.com/company/shareflow",
              "https://twitter.com/shareflow_co",
              "https://instagram.com/shareflow_co"
            ],
            "applicationCategory": "DOOH Platform",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "description": "Servicios de publicidad DOOH y marketplace de pantallas digitales",
              "category": "Digital Out-of-Home Advertising"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://shareflow.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "mainEntity": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Qué es Shareflow DOOH?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Shareflow es la plataforma líder de Connected Out-of-Home (DOOH) en Colombia que democratiza el acceso a la publicidad digital exterior. Conectamos creadores, emprendedores y marcas con más de 150 pantallas estratégicamente ubicadas."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo funciona el marketplace de pantallas?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nuestro marketplace permite buscar, seleccionar y reservar pantallas digitales en tiempo real. Ofrecemos campañas por momentos deportivos, time-based y programáticas con IA que optimiza automáticamente tu inversión."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Quién puede usar Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Shareflow está diseñado para creadores de contenido, emprendedores, marcas, agencias de medios y propietarios de pantallas digitales que buscan maximizar el impacto de sus campañas DOOH."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cuántas pantallas tiene Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Tenemos más de 150 pantallas activas estratégicamente ubicadas en Colombia, generando más de 2.5 millones de impresiones mensuales con 98.6% de uptime garantizado."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué tipos de campañas DOOH ofrece Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ofrecemos tres tipos principales: Momentos Deportivos (durante eventos deportivos clave), Campañas Time-Based (por horas, días o semanas) y Programática en Tiempo Real (optimizada por IA)."
                  }
                }
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Inicio",
                  "item": "https://shareflow.com"
                }
              ]
            }
          })}
        </script>
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="subject" content="DOOH Platform Colombia" />
        <meta name="copyright" content="Shareflow LLC" />
        <meta name="language" content="ES" />
        <meta name="revised" content="2025-01-15" />
        <meta name="abstract" content="Plataforma líder de Connected Out-of-Home que democratiza la publicidad digital exterior" />
        <meta name="topic" content="DOOH, Connected Out-of-Home, Publicidad Digital" />
        <meta name="summary" content="Shareflow democratiza el acceso a la publicidad DOOH en Colombia" />
        <meta name="classification" content="Technology, Advertising Platform" />
        <meta name="author" content="Shareflow Team" />
        <meta name="designer" content="Shareflow LLC" />
        <meta name="reply-to" content="support@shareflow.me" />
        <meta name="owner" content="Shareflow LLC" />
        <meta name="url" content="https://shareflow.com" />
        <meta name="identifier-URL" content="https://shareflow.com" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Technology, DOOH, Advertising" />
        <meta name="coverage" content="Colombia" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="geo.region" content="CO" />
        <meta name="geo.placename" content="Colombia" />
        <meta name="geo.position" content="4.7110;-74.0721" />
        <meta name="ICBM" content="4.7110, -74.0721" />
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="es" href="https://shareflow.com/es" />
        <link rel="alternate" hrefLang="en" href="https://shareflow.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://shareflow.com" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//api.shareflow.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        
        {/* App-specific meta tags */}
        <meta name="application-name" content="Shareflow" />
        <meta name="apple-mobile-web-app-title" content="Shareflow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* Rich snippets for better SERP display */}
        <meta name="news_keywords" content="DOOH, Connected Out-of-Home, publicidad digital, Colombia, Shareflow" />
        <meta name="standout" content="https://shareflow.com" />
      </Helmet>

    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden relative">

      {/* Modern Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 z-10">
              <img 
                src="/logo.svg" 
                alt="Shareflow" 
                className="h-8 w-auto brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            
            {/* Modern Navigation Menu */}
            <div className="hidden md:block">
              <ModernMenu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="Solutions">
                  <div className="flex flex-col space-y-2 text-sm min-w-[320px]">
                    {navItems.find(item => item.name === 'Solutions')?.items?.map((subItem, index) => (
                      <ProductItem
                        key={index}
                        title={subItem.title}
                        subtitle={subItem.subtitle}
                        description={subItem.description}
                        icon={subItem.icon}
                        onClick={() => handleDropdownItemClick(subItem.title)}
                      />
                    ))}
                  </div>
                </MenuItem>
                
                <MenuItem setActive={setActive} active={active} item="Products">
                  <div className="flex flex-col space-y-2 text-sm min-w-[320px]">
                    {navItems.find(item => item.name === 'Products')?.items?.map((subItem, index) => (
                      <ProductItem
                        key={index}
                        title={subItem.title}
                        subtitle={subItem.subtitle}
                        description={subItem.description}
                        icon={subItem.icon}
                        onClick={() => handleDropdownItemClick(subItem.title)}
                      />
                    ))}
                  </div>
                </MenuItem>
                

                <MenuItem setActive={setActive} active={active} item="Recursos">
                  <div className="text-sm min-w-[200px]">
                    <div className="space-y-2">
                      <HoveredLink to="/#">
                        <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">🧠 Thinking</h4>
                          <p className="text-gray-600 text-sm">Investigación e insights DOOH</p>
                        </div>
                      </HoveredLink>
                      <HoveredLink to="/#">
                        <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">📚 Blog</h4>
                          <p className="text-gray-600 text-sm">Artículos y guías sobre DOOH</p>
                        </div>
                      </HoveredLink>
                      <HoveredLink to="/#">
                        <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">❓ Centro de Ayuda</h4>
                          <p className="text-gray-600 text-sm">Soporte y documentación</p>
                        </div>
                      </HoveredLink>
                    </div>
                  </div>
                </MenuItem>
              </ModernMenu>
            </div>
            
            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4 z-10">
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-white/90 hover:text-white font-medium transition-colors"
                >
                  Iniciar sesión
                </motion.div>
              </Link>
              {/* <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Registrarse
                </motion.div>
              </Link> */}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 z-10"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-16 md:hidden"
          >
            <div className="px-4 py-6 space-y-6">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="block text-xl font-semibold text-white hover:text-orange-400 mb-2"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </motion.div>
                  {item.hasDropdown && item.items && (
                    <div className="ml-4 space-y-2">
                      {item.items.map((subItem, subIndex) => (
                        <motion.div
                          key={subIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (subIndex * 0.05) }}
                          className="block text-sm text-gray-300 hover:text-white py-1 cursor-pointer"
                          onClick={() => {
                            handleDropdownItemClick(subItem.title);
                            toggleMenu();
                          }}
                        >
                          {subItem.icon} {subItem.title}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-6 space-y-4">
                <Link to="/login" onClick={toggleMenu}>
                  <button className="w-full px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300">
                    Iniciar sesión
                  </button>
                </Link>
                {/* <Link to="/register" onClick={toggleMenu}>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Registrarse
                  </button>
                </Link> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Interactive Search & Live Marketplace */}
      <section ref={heroRef} className="relative min-h-[80vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden">
        {/* BackgroundGradientAnimation */}
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(30, 64, 175)" // blue-800
          gradientBackgroundEnd="rgb(79, 70, 229)" // indigo-600
          firstColor="59, 130, 246" // blue-500
          secondColor="147, 197, 253" // blue-300
          thirdColor="6, 182, 212" // cyan-500
          fourthColor="37, 99, 235" // blue-600 (era green-500)
          fifthColor="37, 99, 235" // blue-600 (era purple-500)
          pointerColor="99, 102, 241" // indigo-500
          interactive={true}
          blendingValue="hard-light"
          size="90%"
        />
        
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-800/10 to-transparent z-10"></div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        >
          {/* Header Content */}
          <div className="text-center mb-12">
        <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/25 backdrop-blur-md border border-white/40 rounded-full text-sm font-medium shadow-xl">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-bold drop-shadow-lg">🔥 Marketplace Líder en DOOH Colombia</span>
              </div>
              
                          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight max-w-5xl mx-auto">
              <span className="text-white drop-shadow-lg font-bold">¿Dónde quieres</span>
              <br />
              <AnimatedTextCycle 
                words={["Brillar", "Destacar", "Impactar", "Crecer", "Conectar"]}
                interval={3000}
                className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent font-bold"
              />
              <span className="text-white drop-shadow-lg font-bold"> hoy?</span>
            </h1>
              
                          <p className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-md max-w-2xl mx-auto font-light">
              Ahora más que nunca es <span className="font-medium text-cyan-300">tu momento</span> de brillar con tu idea, mensaje, emprendimiento o marca. <span className="font-medium text-cyan-300">Para todos</span>, en más de 150 ubicaciones.
            </p>
            </motion.div>
          </div>

          {/* Smart Search Bar - Real ML-powered component */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative group">
              {/* Main AI glow effect - intelligent color changing */}
              <div className="absolute -inset-1 rounded-2xl blur-sm opacity-75 group-hover:opacity-100">
            <motion.div
                  animate={{
                    background: [
                      "linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899)",
                      "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
                      "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4, #3b82f6)",
                      "linear-gradient(180deg, #ec4899, #06b6d4, #3b82f6, #8b5cf6)",
                      "linear-gradient(225deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899)"
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-2xl"
                />
                    </div>
              
              {/* Rotating border glow - AI intelligence effect */}
              <div className="absolute -inset-0.5 rounded-2xl overflow-hidden">
          <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0%, #06b6d4 20%, transparent 40%, #8b5cf6 60%, transparent 80%, #ec4899 100%)",
                    opacity: 0.6
                  }}
                />
                </div>
              
              {/* AI Intelligence glow - removed dots, added smart glow effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    background: [
                      "conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
                      "conic-gradient(from 120deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
                      "conic-gradient(from 240deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
                      "conic-gradient(from 360deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)"
                    ]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    background: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute -inset-2 opacity-30 blur-md"
                  style={{
                    maskImage: "linear-gradient(white, transparent)"
                  }}
                />
                
                {/* Inner rotating glow */}
          <motion.div 
            animate={{ 
                    rotate: [360, 0],
                    opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
                    rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
                  className="absolute -inset-1 rounded-2xl"
            style={{
                    background: "conic-gradient(from 0deg, transparent 0%, #06b6d4 25%, transparent 50%, #8b5cf6 75%, transparent 100%)",
                    opacity: 0.4,
                    filter: "blur(8px)"
                  }}
                />
              </div>
              

              
              {/* Main search container */}
              <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-transparent to-blue-50/50 pointer-events-none"></div>
                
                <SmartSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="IA te ayuda a encontrar la pantalla perfecta..."
                  className="border-none shadow-none rounded-2xl relative z-10"
                />
                
                {/* Magic sparkle effect when typing */}
                {searchQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute top-1/2 left-4 -translate-y-1/2 z-5"
                  >
          <motion.div 
            animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
            }}
            transition={{ 
                        duration: 2, 
              repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-cyan-500 text-xs"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                )}
        </div>


            </div>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Estadios', 'Centros Comerciales', 'Universidades', 'Aeropuertos'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
          
          {/* Live Marketplace Cards */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6"
          >

            
            {/* Search Results Box - Only appears when searching */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 shadow-2xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Search className="w-4 h-4" />
                        <span>Resultados para "{searchQuery}"</span>
                  </div>
                      <div className="text-xs text-gray-500">
                        {featuredScreens.length} de {mockScreens.length} pantallas
                  </div>
                </div>
                    
                    <div className="space-y-2">
                      {featuredScreens.map((screen, index) => (
                        <CompactScreenCard
                          key={screen.id}
                          screen={screen}
                          index={index}
                          onSelect={handleScreenSelect}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Ver todos los resultados
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  </motion.div>
                )}
            </AnimatePresence>
              
            {/* Call to action - Only show when no search results */}
            {!showSearchResults && (
              <div className="text-center mt-8">
          <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group px-8 py-4 bg-gradient-to-r from-white to-gray-50 text-gray-900 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20 backdrop-blur-sm overflow-hidden"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      
                      <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300">
                        <Search className="w-5 h-5" />
                        Explorar todas las pantallas
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="group-hover:translate-x-1 transition-transform duration-300"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </span>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </motion.button>
                  </Link>
                  

          </motion.div>
                </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works - Rappi Style */}
      <section ref={howItWorksRef} className="py-16 relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50">
        {/* Clean Background - removed dots */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-cyan-50/95" />

              </div>
              
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-sm font-bold text-white mb-6 shadow-xl">
              ⚡ PROCESO SIMPLIFICADO
                    </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
              ¿Cómo <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Funciona?</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              Desde la selección hasta el lanzamiento en menos de 5 minutos ⏱️
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {STATIC_DATA.steps.map((step, index) => (
              <StepCard 
                key={step.number}
                step={step} 
                index={index} 
                isActive={activeStep === index} 
              />
            ))}
                    </div>
              
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link to="/login">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Comenzar Ahora
                    </Button>
                  </Link>
            </motion.div>
        </div>
      </section>

      {/* Features - Rappi Style */}
      <section ref={featuresRef} className="py-32 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
        {/* Clean animated background - removed dots */}
        <div className="absolute inset-0 overflow-hidden">

              </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-sm font-bold text-white mb-6 shadow-xl">
              💡 MODELOS DE COMPRA
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
              Descubre
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Shareflow Ads</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Marketplace, eventos deportivos y Smart Campaigns - todo en una plataforma 🎯
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATIC_DATA.features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section - Lazy loaded */}
      <section ref={marketplaceRef} className="py-32 bg-[#F7F7F7] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={marketplaceInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-block px-4 py-2 bg-[#353FEF]/10 rounded-full text-sm font-medium text-[#353FEF] mb-6">
                MARKETPLACE INTELIGENTE
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#1A1A35]">
                Reserva y Publica
                <span className="block text-[#353FEF]">en Segundos</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Encuentra pantallas disponibles, compara precios en tiempo real, sube tu contenido y activa tu campaña al instante. 
                Sin intermediarios, sin demoras, sin complicaciones.
              </p>
              
              {/* Key Actions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  <span className="text-lg text-neutral-700">
                    <strong>Busca y filtra</strong> por ubicación, precio, audiencia y horarios
                  </span>
                    </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-neutral-700">
                    <strong>Reserva momentos</strong> desde 15 segundos o campañas completas
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-neutral-700">
                    <strong>Aprobación rápida</strong> - activa tu campaña en pocos minutos tras aprobación
                  </span>
                </div>
              </div>

              <Link to="/login">
                <Button variant="primary" size="lg" icon={Target}>
                  Explorar Marketplace
                </Button>
              </Link>
            </motion.div>
            
            {/* Right side - Demo Floating Cards Only */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={marketplaceInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="relative flex justify-center items-center"
            >
              {/* Demo Floating Cards - Performance Optimized */}
              <div 
                className="relative group"
                style={{ 
                  width: '350px', 
                  height: '400px',
                  containIntrinsicSize: '350px 400px',
                  contentVisibility: 'auto'
                }}
              >
                {/* Card 1 - Stadium Screen (Bottom/Back) */}
                <div
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-lg transition-transform duration-200 ease-out w-72 transform rotate-3 absolute top-8 left-0 z-10 will-change-transform hover:shadow-xl hover:scale-[1.02] group-hover:translate-x-1 group-hover:-translate-y-1"
                  style={{ 
                    transform: marketplaceInView ? 'translateY(0px) rotate(3deg)' : 'translateY(20px) rotate(3deg)',
                    opacity: marketplaceInView ? 1 : 0,
                    transition: 'all 0.4s ease-out 0.2s'
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src="/screens_photos/9007-639a2c4721253.jpg"
                      alt="Pantalla LED Estadio Atanasio Girardot"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        🔥 Popular
                      </span>
                      <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        Estadio
                      </span>
                    </div>
                    
                    {/* Favorite button */}
                    <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                    </button>

                    {/* Screen specs */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                          HD
                        </span>
                        <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                          7500 nits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Title and rating */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                          Pantalla LED Perimetral - Estadio Atanasio Girardot
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium">4.9</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-2">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-800 line-clamp-1">
                            Medellín, Colombia
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-gray-900">$800K</span>
                          <span className="text-xs text-gray-600">COP</span>
                        </div>
                        <div className="text-xs text-gray-500">desde / hora</div>
                      </div>
                      
                      <button className="px-3 py-1.5 bg-[#353FEF] text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm">
                        Ver
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Airport Screen (Top/Front) */}
                <div
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xl transition-transform duration-200 ease-out w-72 transform -rotate-2 absolute top-0 right-0 z-20 will-change-transform hover:shadow-2xl hover:scale-[1.02] group-hover:-translate-x-1 group-hover:translate-y-1"
                  style={{ 
                    transform: marketplaceInView ? 'translateY(0px) rotate(-2deg)' : 'translateY(20px) rotate(-2deg)',
                    opacity: marketplaceInView ? 1 : 0,
                    transition: 'all 0.4s ease-out 0.4s'
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src="/screens_photos/24147-6543ae2a3400f.jpg"
                      alt="Pantalla Principal Aeropuerto El Dorado"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        ✈️ Premium
                      </span>
                      <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        Aeropuerto
                      </span>
                    </div>
                    
                    {/* Favorite button */}
                    <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    </button>

                    {/* Screen specs */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                          4K
                        </span>
                        <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                          6000 nits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Title and rating */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                          Pantalla Principal - Aeropuerto El Dorado
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium">4.9</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-2">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-800 line-clamp-1">
                            Bogotá, Colombia
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-gray-900">$1.5M</span>
                          <span className="text-xs text-gray-600">COP</span>
                        </div>
                        <div className="text-xs text-gray-500">desde / hora</div>
                      </div>
                      
                      <button className="px-3 py-1.5 bg-[#353FEF] text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm">
                        Ver
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                    </motion.div>
                </div>
                  </div>
      </section>

      {/* Metrics Section - Complete Redesign */}
      <section ref={metricsRef} className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -120, 0],
              y: [0, 100, 0],
              scale: [1, 0.8, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
          </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
                  initial={{ opacity: 0, y: 30 }}
            animate={metricsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={metricsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-sm font-bold text-white mb-8 shadow-2xl border border-emerald-400/20"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              🚀 IMPULSANDO 3,500+ MARCAS DIARIAMENTE
          </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={metricsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight"
            >
              Números que
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Transforman
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={metricsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              El impacto real de nuestro marketplace en Colombia 🇨🇴
              <br />
              <span className="text-cyan-400">Datos actualizados en tiempo real</span>
            </motion.p>
          </motion.div>

          {/* Metrics Grid - New Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STATIC_DATA.metrics.map((metric, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={metricsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  delay: 0.6 + index * 0.2,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Card Background with Glassmorphism */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-cyan-500/20">
                  
                  {/* Animated Border Gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon/Indicator */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/80 transition-shadow duration-300"></div>
                      <div className="text-xs text-gray-400 font-mono tracking-wider">
                        0{index + 1}
                      </div>
                    </div>
                    
                    {/* Main Number */}
                    <motion.div 
                      className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-400 transition-all duration-500"
                      whileHover={{ scale: 1.1 }}
                >
                  {metric.value}
                    </motion.div>
                    
                    {/* Label */}
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                      {metric.label}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-400 text-sm lg:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {metric.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={metricsInView ? { width: `${75 + index * 8}%` } : { width: 0 }}
                        transition={{ delay: 1 + index * 0.3, duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>
                </div>
                </motion.div>
              ))}
                  </div>


        </div>
      </section>

      {/* Testimonials - Rappi Style */}
      <section ref={testimonialsRef} className="py-32 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-sm font-bold text-white mb-6 shadow-xl">
              💜 AMADO POR 500+ EQUIPOS GLOBALMENTE
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
              Lo que Dicen
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Nuestros Usuarios</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Vea cómo creadores, emprendedores y marcas usan Shareflow para brillar en momentos perfectos ✨
            </p>
                </motion.div>
          
          <Suspense fallback={<SectionSkeleton />}>
            <LazyTestimonials />
          </Suspense>
        </div>
      </section>

      {/* Thinking Preview Section - Lazy loaded */}
      <section className="py-32 bg-white relative">
        <Suspense fallback={<SectionSkeleton />}>
          <LazyThinkingSection />
        </Suspense>
      </section>

      {/* CTA Section - Rappi Style */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">

        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-bold text-white mb-8 shadow-xl">
              ❓ Preguntas Frecuentes
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">
              Todo lo que necesitas saber sobre
              <span className="block text-cyan-300">Shareflow</span>
            </h2>
            <p className="text-xl text-white/95 mb-12 max-w-2xl mx-auto font-medium drop-shadow-md">
              Respuestas a las preguntas más comunes sobre nuestra plataforma de publicidad digital exterior
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {[
              {
                question: "¿Qué es Shareflow y cómo funciona?",
                answer: "Shareflow es una plataforma digital que democratiza el acceso a la publicidad exterior (DOOH - Digital Out-of-Home). Conectamos anunciantes con propietarios de pantallas digitales en ubicaciones estratégicas, permitiendo crear y lanzar campañas publicitarias de forma sencilla y efectiva en el espacio urbano."
              },
              {
                question: "¿Cuánto cuesta crear una campaña publicitaria en Shareflow?",
                answer: "Los precios varían según la ubicación, duración y tipo de pantalla. Ofrecemos opciones desde $50.000 COP para campañas básicas. Puedes ver precios en tiempo real en nuestro marketplace y elegir las ubicaciones que mejor se adapten a tu presupuesto. Sin costos ocultos ni tarifas de configuración."
              },
              {
                question: "¿En qué ciudades está disponible Shareflow?",
                answer: "Actualmente operamos en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga y estamos expandiéndonos constantemente. Contamos con más de 150 pantallas activas en ubicaciones de alto tráfico como centros comerciales, universidades, estaciones de transporte y zonas comerciales."
              },
              {
                question: "¿Qué tipos de contenido puedo publicar en las pantallas?",
                answer: "Aceptamos imágenes estáticas (JPG, PNG) y videos (MP4, MOV) de alta calidad. El contenido debe cumplir con nuestras políticas publicitarias: no contenido ofensivo, no competencia directa con el lugar de exhibición, y debe ser apropiado para audiencias generales. Ofrecemos herramientas de edición integradas para optimizar tu contenido."
              },
              {
                question: "¿Cómo puedo medir el rendimiento de mi campaña?",
                answer: "Proporcionamos métricas detalladas en tiempo real: impresiones estimadas, horarios de mayor audiencia, demografía del lugar, y reportes de reproducción. También incluimos fotos de verificación y análisis de engagement. Todas las métricas están disponibles en tu dashboard personal las 24/7."
              },
              {
                question: "¿Puedo programar cuándo se muestra mi anuncio?",
                answer: "Sí, ofrecemos programación flexible por horas, días de la semana y fechas específicas. Puedes optimizar tu campaña para mostrar anuncios durante las horas pico de tu audiencia objetivo, como horarios de almuerzo, salida de oficinas, o fines de semana según la ubicación."
              },
              {
                question: "¿Cómo me convierto en propietario de pantalla en Shareflow?",
                answer: "Si tienes una pantalla digital en una ubicación comercial de alto tráfico, puedes monetizarla uniéndote como partner. Proporcionamos el software de gestión gratuito, soporte técnico, y compartes los ingresos publicitarios. El proceso de registro es simple y nuestro equipo te acompaña en la configuración."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
              >
                <motion.button
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <h3 className="text-lg font-bold text-white pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Tienes más preguntas?
              </h3>
              <p className="text-gray-300 mb-6">
                Nuestro equipo está listo para ayudarte a crear tu primera campaña exitosa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={MessageSquare}
                    className="text-lg px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white shadow-2xl font-bold transform hover:scale-105 transition-all duration-200"
                  >
                    💬 Hablar con un Experto
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={Rocket}
                    className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
                  >
                    🚀 Explorar Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          {/* Floating gradient orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main footer content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand section - larger */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Shareflow
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    La plataforma líder que democratiza la visibilidad en el espacio urbano.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-medium text-sm">Es el momento de todos de brillar</span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-4">
                  {[
                    { icon: '📱', label: 'Instagram', href: '#' },
                    { icon: '🐦', label: 'Twitter', href: '#' },
                    { icon: '💼', label: 'LinkedIn', href: '#' },
                    { icon: '📺', label: 'YouTube', href: '#' }
                  ].map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-lg hover:bg-white/20 transition-all duration-300 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {social.icon}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

                         {/* Navigation columns */}
             {[
               {
                 title: 'Productos',
                 links: [
                   { name: 'Ads', subtitle: 'Marketplace & Campañas', href: '/marketplace' },
                   { name: 'Pixel', subtitle: 'Próximamente', href: '#' },
                   { name: 'Platform', subtitle: 'For Partners', href: '/partners-landing' }
                 ]
               },
               {
                 title: 'Soluciones',
                 links: [
                   { name: 'Para Marcas & Agencias', subtitle: 'Shareflow Ads+', href: '/marketplace' },
                   { name: 'Para Media Owners', subtitle: 'CMS, Player & Monetización', href: '/partners-landing' },
                   { name: 'Para AdTech Partners', subtitle: 'SSP & DSP Integration', href: '/contact' },
                   { name: 'Para Creadores', subtitle: 'Momentos & Time-based', href: '/marketplace' }
                 ]
               },
               {
                 title: 'Recursos',
                 links: [
                   { name: 'Centro de Ayuda', href: '/help', subtitle: undefined },
                   { name: 'Thinking', href: '/thinking', subtitle: undefined },
                   { name: 'Blog', href: '/blog', subtitle: undefined },
                   { name: 'API Docs', href: '/docs', subtitle: undefined },
                   { name: 'Estado del Sistema', href: '/status', subtitle: undefined }
                 ]
               }
             ].map((column, index) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="space-y-6"
              >
                <h4 className="text-lg font-bold text-white">{column.title}</h4>
                                 <ul className="space-y-3">
                   {column.links.map((link) => (
                     <li key={link.name}>
                       <div className="text-gray-300 cursor-default block">
                         <div className="font-medium">
                           {link.name}
                         </div>
                         {link.subtitle && (
                           <div className="text-xs text-gray-400 mt-0.5">
                             {link.subtitle}
                           </div>
                         )}
                       </div>
                     </li>
                   ))}
                 </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h4 className="text-2xl font-bold text-white mb-3">
                Mantente actualizado
              </h4>
              <p className="text-gray-300 mb-6">
                Recibe las últimas noticias sobre DOOH, nuevas funcionalidades y consejos para maximizar tus campañas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  Suscribirse
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bottom section */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Copyright */}
              <div className="flex items-center gap-4">
                <p className="text-gray-300">
                  © 2025 Shareflow. Todos los derechos reservados.
                </p>
              </div>

              {/* Legal links */}
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { name: 'Privacidad' },
                  { name: 'Términos' },
                  { name: 'Políticas de Publicidad' },
                  { name: 'Cookies' }
                ].map((link, index) => (
                  <span
                    key={link.name}
                    className="text-gray-400 text-sm font-medium cursor-default"
                  >
                    {link.name}
                  </span>
                ))}
              </div>
            </div>
          </div>


        </div>
      </footer>
    </div>
    </>
  );
}
