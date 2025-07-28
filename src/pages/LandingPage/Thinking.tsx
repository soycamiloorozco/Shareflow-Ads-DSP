import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Brain, TrendingUp, Eye, Filter, Clock,
  Star, ChevronRight, ExternalLink, BookOpen, Lightbulb,
  Target, Zap, Globe, Users, BarChart3, Smartphone,
  Monitor, Cpu, Database, Sparkles, Award, Mail,
  Search, Calendar, Tag, ArrowRight
} from 'lucide-react';

interface ThinkingPost {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  type: 'research' | 'insight' | 'trend' | 'case-study' | 'whitepaper';
  imageUrl?: string;
}

export function Thinking() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Todo', count: 24 },
    { id: 'creativity', label: 'Creatividad & Contenido', count: 8 },
    { id: 'connected-dooh', label: 'Connected DOOH', count: 6 },
    { id: 'experience', label: 'Experiencia del Usuario', count: 5 },
    { id: 'innovation', label: 'Innovación', count: 4 },
    { id: 'insights', label: 'Market Insights', count: 3 },
    { id: 'transformation', label: 'Transformación Digital', count: 2 }
  ];

  const editorsPicks: ThinkingPost[] = [
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
      excerpt: 'Descubre cómo Shareflow está pionerizando la evolución hacia un ecosistema DOOH verdaderamente conectado, donde pantallas inteligentes, datos en tiempo real y experiencias personalizadas convergen para crear el futuro de la publicidad exterior.',
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
      excerpt: 'Análisis profundo sobre cómo crear contenido que no solo capture la atención, sino que genere conexiones emocionales genuinas. Desde storytelling visual hasta experiencias interactivas que hacen que cada momento cuente.',
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

  const allPosts: ThinkingPost[] = [
    ...editorsPicks,
    {
      id: 'democratizing-creativity',
      title: 'Democratizando la Creatividad en DOOH',
      excerpt: 'Cómo las herramientas intuitivas y el acceso simplificado están permitiendo que pequeñas empresas y emprendedores brillen tanto como las grandes marcas en pantallas digitales.',
      author: 'Diego Silva',
      readTime: '6 min',
      date: '2024-01-10',
      category: 'creativity',
      tags: ['Democratización', 'Herramientas', 'Emprendedores'],
      type: 'insight',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'immersive-brand-experiences',
      title: 'Experiencias de Marca Inmersivas',
      subtitle: 'Cuando el Contenido Cobra Vida',
      excerpt: 'Descubre cómo crear experiencias que van más allá de la publicidad tradicional, generando momentos memorables que conectan emocionalmente con las audiencias y construyen lealtad auténtica.',
      author: 'Laura Pérez',
      readTime: '7 min',
      date: '2024-01-08',
      category: 'experience',
      tags: ['Experiencias', 'Conexión Emocional', 'Inmersión'],
      type: 'case-study',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'intelligent-screen-networks',
      title: 'Redes de Pantallas Inteligentes',
      excerpt: 'La evolución hacia pantallas que aprenden, se adaptan y responden al contexto en tiempo real, creando un ecosistema DOOH verdaderamente conectado.',
      author: 'Roberto Kim',
      readTime: '5 min',
      date: '2024-01-05',
      category: 'connected-dooh',
      tags: ['Pantallas Inteligentes', 'Ecosistema', 'Tiempo Real'],
      type: 'insight',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'visual-storytelling-mastery',
      title: 'Maestría en Storytelling Visual',
      subtitle: 'Narrativas que Cautivan en Segundos',
      excerpt: 'Técnicas avanzadas para contar historias poderosas en formato visual, optimizadas para el impacto inmediato y la recordación duradera en entornos DOOH.',
      author: 'Sofia Mendoza',
      readTime: '9 min',
      date: '2024-01-03',
      category: 'creativity',
      tags: ['Storytelling', 'Narrativas', 'Impacto Visual'],
      type: 'whitepaper',
      imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'data-driven-experiences',
      title: 'Experiencias Impulsadas por Datos',
      excerpt: 'Cómo la inteligencia de datos transforma la personalización en DOOH, creando experiencias relevantes que respetan la privacidad y maximizan el engagement.',
      author: 'Miguel Torres',
      readTime: '8 min',
      date: '2023-12-28',
      category: 'innovation',
      tags: ['Datos', 'Personalización', 'Engagement'],
      type: 'research',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'measuring-meaningful-impact',
      title: 'Midiendo el Impacto Significativo',
      subtitle: 'Más Allá de las Impresiones',
      excerpt: 'Nuevas métricas que capturan el verdadero valor de las experiencias DOOH: desde la conexión emocional hasta el impacto en la percepción de marca y comportamiento del consumidor.',
      author: 'Patricia Ruiz',
      readTime: '11 min',
      date: '2023-12-25',
      category: 'insights',
      tags: ['Métricas', 'Impacto', 'Valor Real'],
      type: 'research',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'adaptive-content-systems',
      title: 'Sistemas de Contenido Adaptivo',
      excerpt: 'Tecnologías emergentes que permiten que el contenido se transforme automáticamente según la audiencia, momento y contexto, creando experiencias únicas para cada interacción.',
      author: 'Fernando López',
      readTime: '6 min',
      date: '2023-12-22',
      category: 'innovation',
      tags: ['Contenido Adaptivo', 'Automatización', 'Personalización'],
      type: 'insight',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=300&fit=crop&crop=center'
    },
    {
      id: 'omnichannel-dooh-integration',
      title: 'Integración DOOH Omnicanal',
      subtitle: 'Conectando Todos los Puntos de Contacto',
      excerpt: 'Estrategias para crear experiencias fluidas que conecten perfectamente el mundo físico y digital, donde cada touchpoint refuerza y amplifica el mensaje de marca.',
      author: 'Camila Vargas',
      readTime: '7 min',
      date: '2023-12-20',
      category: 'transformation',
      tags: ['Omnicanal', 'Integración', 'Experiencia Fluida'],
      type: 'case-study',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop&crop=center'
    }
  ];

  const filteredPosts = allPosts.filter(post => {
    const matchesFilter = activeFilter === 'all' || post.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A35] to-[#2A2A5A]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al inicio</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link to="/news-media" className="text-gray-300 hover:text-white transition-colors">
                Noticias
              </Link>
              <Link to="/partners-landing" className="text-gray-300 hover:text-white transition-colors">
                Partners
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-2 bg-[#353FEF]/10 rounded-full text-sm font-medium text-[#353FEF] mb-6">
              <Brain className="w-4 h-4 inline mr-2" />
              SHAREFLOW THINKING
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Thinking
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Donde la creatividad se encuentra con la innovación. Descubre cómo estamos democratizando el DOOH para que 
              <span className="text-cyan-300 font-semibold"> es el momento de todos de brillar</span> y liderando la transformación hacia un 
              <span className="text-cyan-300 font-semibold"> Connected Out-of-Home</span> verdaderamente inteligente.
            </p>
            <div className="text-gray-400 text-sm">
              <span className="capitalize">{today}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos, insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeFilter === category.id
                      ? 'bg-[#353FEF] text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-70">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-[#353FEF] to-cyan-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Editor's Pick</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article */}
              <div className="lg:col-span-2">
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group h-full"
                >
                  {/* Featured Image */}
                  <div className="relative h-48 lg:h-56 overflow-hidden">
                    <img
                      src={editorsPicks[0].imageUrl}
                      alt={editorsPicks[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(editorsPicks[0].type)} rounded-xl flex items-center justify-center shadow-lg`}>
                        {React.createElement(getTypeIcon(editorsPicks[0].type), { className: "w-5 h-5 text-white" })}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {editorsPicks[0].type.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
                      <span>{formatDate(editorsPicks[0].date)}</span>
                      <span>•</span>
                      <span>{editorsPicks[0].readTime}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {editorsPicks[0].title}
                    </h3>
                    {editorsPicks[0].subtitle && (
                      <h4 className="text-lg text-[#353FEF] font-medium mb-4">
                        {editorsPicks[0].subtitle}
                      </h4>
                    )}
                    <p className="text-gray-300 leading-relaxed mb-6 flex-1">
                      {editorsPicks[0].excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {editorsPicks[0].author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-300">Por {editorsPicks[0].author}</span>
                      </div>
                      <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#353FEF] transition-colors group-hover:bg-[#353FEF]">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              </div>

              {/* Side Articles */}
              <div className="space-y-6">
                {editorsPicks.slice(1, 3).map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex gap-4 p-6">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
                        <div className="absolute bottom-1 right-1">
                          <div className={`w-5 h-5 bg-gradient-to-r ${getTypeColor(post.type)} rounded-lg flex items-center justify-center`}>
                            {React.createElement(getTypeIcon(post.type), { className: "w-2.5 h-2.5 text-white" })}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-[#353FEF] uppercase tracking-wide font-medium">
                            {post.type.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                        </div>

                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.subtitle && (
                          <h4 className="text-xs text-[#353FEF] font-medium mb-2 line-clamp-1">
                            {post.subtitle}
                          </h4>
                        )}
                        <p className="text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              <span>{post.author.split(' ')[0]}</span>
                              <span className="mx-1">•</span>
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          <button className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#353FEF] transition-colors">
                            <ChevronRight className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Articles */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              Explora Más ({filteredPosts.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Filter className="w-4 h-4" />
              {activeFilter !== 'all' && (
                <span>Filtrado por: {categories.find(c => c.id === activeFilter)?.label}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(3).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getTypeColor(post.type)} rounded-xl flex items-center justify-center shadow-lg`}>
                      {React.createElement(getTypeIcon(post.type), { className: "w-4 h-4 text-white" })}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {post.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                    <span>{formatDate(post.date)}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <h4 className="text-sm text-[#353FEF] font-medium mb-3 line-clamp-1">
                      {post.subtitle}
                    </h4>
                  )}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{post.author.split(' ')[0]}</span>
                    </div>
                    <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#353FEF] transition-colors group-hover:bg-[#353FEF]">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron artículos</h3>
              <p className="text-gray-400">Intenta con otros términos de búsqueda o filtros.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#353FEF]/20 rounded-full text-sm font-medium text-[#353FEF] mb-6">
              <Sparkles className="w-4 h-4" />
              MANTENTE ACTUALIZADO
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Es tu momento de brillar en el Connected DOOH
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Únete a la revolución creativa. Recibe insights exclusivos sobre cómo destacar en el ecosistema 
              Connected Out-of-Home y estrategias para crear experiencias memorables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent"
              />
              <button className="px-6 py-3 bg-[#353FEF] text-white font-semibold rounded-xl hover:bg-[#2929d4] transition-colors flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Suscribirse
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Puedes cancelar tu suscripción en cualquier momento. Consulta nuestra{' '}
              <Link to="/privacy-policy" className="text-[#353FEF] hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-[#353FEF]/20 to-cyan-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para aplicar estos insights?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Convierte el conocimiento en acción. Explora nuestro marketplace 
              y descubre cómo aplicar estas estrategias en tus campañas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-[#353FEF] text-white font-semibold rounded-xl hover:bg-[#2929d4] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Monitor className="w-5 h-5" />
                Explorar Marketplace
              </Link>
              <Link
                to="/partners-landing"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Únete como Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}