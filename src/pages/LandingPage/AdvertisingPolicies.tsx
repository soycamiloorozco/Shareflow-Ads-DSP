import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronRight, ArrowUp, Shield, Users, FileText, AlertTriangle, CheckCircle, 
  Globe, Megaphone, Calendar, Clock, Eye, Target, BookOpen, MapPin, 
  Building, Zap, XCircle, Mail, Monitor, Video, Image, Volume2, 
  Wifi, Camera, Lock, UserCheck, Star, Flag, AlertCircle as AlertCircleIcon, Info, Sparkles, ChevronDown
} from 'lucide-react';

export function AdvertisingPolicies() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

  // Track scroll position for sticky navigation and active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const htmlElement = section as HTMLElement;
        const sectionTop = htmlElement.offsetTop;
        const sectionHeight = htmlElement.offsetHeight;
        if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
          currentSection = section.id;
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index: number) => {
    const newOpenFaqs = new Set(openFaqs);
    if (newOpenFaqs.has(index)) {
      newOpenFaqs.delete(index);
    } else {
      newOpenFaqs.add(index);
    }
    setOpenFaqs(newOpenFaqs);
  };

  const sections = [
    {
      id: 'introduccion',
      title: 'Introducción a Políticas COOH',
      icon: BookOpen,
      description: 'Estándares para publicidad conectada'
    },
    {
      id: 'tipos-ubicaciones',
      title: 'Tipos de Ubicaciones',
      icon: MapPin,
      description: 'Espacios públicos, privados, arquitectónicos y mixtos'
    },
    {
      id: 'contenido-permitido',
      title: 'Contenido Permitido',
      icon: CheckCircle,
      description: 'Estándares generales de aceptación'
    },
    {
      id: 'contenido-prohibido',
      title: 'Contenido Prohibido',
      icon: XCircle,
      description: 'Restricciones universales'
    },
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      icon: Info,
      description: 'Respuestas a consultas comunes sobre políticas'
    },
    {
      id: 'contacto-soporte',
      title: 'Contacto y Soporte',
      icon: Mail,
      description: 'Canales de comunicación'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Políticas de Publicidad | Shareflow COOH - Estándares Connected Out-of-Home</title>
        <meta name="description" content="Políticas de publicidad de Shareflow para plataformas COOH. Estándares de contenido adaptados a espacios públicos, privados y conectados." />
        <meta name="keywords" content="políticas publicidad, COOH, DOOH, espacios públicos, contenido digital, pantallas conectadas, estándares publicitarios" />
        <link rel="canonical" href="https://shareflow.com/advertising-policies" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Políticas de Publicidad | Shareflow COOH" />
        <meta property="og:description" content="Estándares de contenido publicitario para plataformas Connected Out-of-Home" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shareflow.com/advertising-policies" />
        
        {/* Enhanced Schema.org structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "LegalDocument", "Policy"],
            "name": "Políticas de Publicidad - Shareflow DOOH Platform",
            "headline": "Estándares de Publicidad para Connected Out-of-Home",
            "description": "Políticas de publicidad completas de Shareflow LLC para plataformas DOOH. Estándares de contenido adaptados a espacios públicos, privados y conectados.",
            "url": "https://shareflow.com/advertising-policies",
            "inLanguage": ["es-ES", "en-US"],
            "isPartOf": {
              "@type": "WebSite",
              "name": "Shareflow - Connected Out-of-Home Platform",
              "url": "https://shareflow.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shareflow.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            "datePublished": "2024-01-01",
            "dateModified": "2025-01-15",
            "author": {
              "@type": "Organization",
              "name": "Shareflow Legal Team",
              "url": "https://shareflow.com/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Shareflow LLC",
              "url": "https://shareflow.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://shareflow.com/logo.svg",
                "width": 180,
                "height": 60
              },
              "sameAs": [
                "https://linkedin.com/company/shareflow",
                "https://twitter.com/shareflow_co"
              ]
            },
            "mainEntity": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Qué contenido está permitido en las pantallas DOOH de Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Permitimos contenido comercial legal, promociones de productos y servicios legítimos, contenido educativo e informativo, entretenimiento familiar, anuncios de servicios públicos y contenido cultural que respete las normas comunitarias."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué contenido está prohibido en DOOH?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Prohibimos contenido ilegal, violento, discriminatorio, sexualmente explícito, relacionado con drogas ilegales, que promueva actividades peligrosas, que viole derechos de autor o que sea engañoso o fraudulento."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo se adaptan las políticas según la ubicación?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nuestras políticas se adaptan según el contexto: espacios públicos tienen restricciones más estrictas, espacios privados permiten mayor flexibilidad, y consideramos la audiencia específica de cada ubicación."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo reporto contenido inapropiado?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Puede reportar contenido inapropiado contactándonos en support@shareflow.me o a través de nuestro sistema de reporte en la plataforma. Revisamos todos los reportes dentro de 24 horas."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué pasa si mi anuncio es rechazado?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Si su anuncio es rechazado, recibirá una explicación detallada de los motivos y sugerencias para modificarlo. Puede apelar la decisión o enviar una versión revisada que cumpla con nuestras políticas."
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
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Legal",
                  "item": "https://shareflow.com/legal"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Políticas de Publicidad",
                  "item": "https://shareflow.com/advertising-policies"
                }
              ]
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": [".hero-content", ".main-sections"]
            }
          })}
        </script>
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="subject" content="Políticas de Publicidad DOOH" />
        <meta name="copyright" content="Shareflow LLC" />
        <meta name="language" content="ES" />
        <meta name="revised" content="2025-01-15" />
        <meta name="abstract" content="Políticas de publicidad completas para la plataforma DOOH líder en Colombia" />
        <meta name="topic" content="Políticas de Publicidad, DOOH, Estándares de Contenido" />
        <meta name="summary" content="Estándares de publicidad de Shareflow para Connected Out-of-Home" />
        <meta name="classification" content="Legal Document" />
        <meta name="author" content="Shareflow Legal Team" />
        <meta name="designer" content="Shareflow LLC" />
        <meta name="reply-to" content="support@shareflow.me" />
        <meta name="owner" content="Shareflow LLC" />
        <meta name="url" content="https://shareflow.com/advertising-policies" />
        <meta name="identifier-URL" content="https://shareflow.com/advertising-policies" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Legal, Advertising, DOOH" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="es" href="https://shareflow.com/es/advertising-policies" />
        <link rel="alternate" hrefLang="en" href="https://shareflow.com/en/advertising-policies" />
        <link rel="alternate" hrefLang="x-default" href="https://shareflow.com/advertising-policies" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="max-w-7xl mx-auto px-4 py-20 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Políticas de Publicidad</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Estándares de
                <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent"> Publicidad COOH</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Políticas integrales para contenido publicitario en espacios Connected Out-of-Home. 
                Estándares adaptativos que consideran contexto, audiencia y ubicación para crear conexiones auténticas, 
                generar impacto positivo y elevar la experiencia de cada audiencia.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Pantallas Conectadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Contexto Adaptativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Audiencias Protegidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Cumplimiento Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sticky Navigation Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className={`lg:sticky lg:top-8 transition-all duration-300 ${isScrolled ? 'lg:top-24' : ''}`}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Políticas de Contenido</h2>
                    <p className="text-sm text-gray-600">Estándares para publicidad COOH</p>
                  </div>
                  
                  <nav className="p-2 max-h-96 lg:max-h-[500px] overflow-y-auto">
                    {sections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                            activeSection === section.id
                              ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500 shadow-sm'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            activeSection === section.id
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{section.title}</p>
                            <p className="text-xs text-gray-500 truncate">{section.description}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            activeSection === section.id ? 'rotate-90' : ''
                          }`} />
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-12">
              {/* Introduction */}
              <section id="introduccion" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Introducción a Políticas COOH</h2>
                        <p className="text-gray-600">Estándares para publicidad conectada</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Las políticas de publicidad de Shareflow están diseñadas específicamente para el ecosistema <strong>Connected Out-of-Home (COOH)</strong>, 
                        reconociendo que este es el momento para que cada persona, creador, emprendedor, pequeña empresa y organización pueda brillar a través de conexiones genuinas. 
                        Creemos que brillar significa conectar auténticamente, impactar de manera positiva y elevar la consciencia colectiva, 
                        democratizando el acceso a espacios publicitarios que antes estaban reservados solo para grandes corporaciones.
                      </p>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-4">
                        <div className="flex items-start gap-3">
                          <Monitor className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-base font-semibold text-purple-900 mb-2">Enfoque Contextual</h3>
                            <p className="text-purple-800 text-sm">
                              A diferencia de la publicidad digital tradicional, COOH opera en espacios físicos compartidos donde 
                              cada persona, artista, emprendedor o organización tiene la oportunidad de brillar creando momentos significativos. 
                              El contexto, la audiencia y la ubicación determinan cómo cada mensaje puede conectar genuinamente e impactar positivamente en la experiencia colectiva.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {[
                          {
                            icon: MapPin,
                            title: "Sensibilidad Locacional",
                            description: "Políticas adaptadas según el tipo de espacio y audiencia esperada"
                          },
                          {
                            icon: Wifi,
                            title: "Capacidades Conectadas", 
                            description: "Aprovechamiento responsable de datos en tiempo real y interactividad"
                          },
                          {
                            icon: Shield,
                            title: "Protección de Audiencias",
                            description: "Consideraciones especiales para menores y grupos vulnerables"
                          },
                          {
                            icon: Globe,
                            title: "Cumplimiento Global",
                            description: "Adherencia a regulaciones locales e internacionales"
                          }
                        ].map((principle, index) => {
                          const IconComponent = principle.icon;
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">{principle.title}</h3>
                              </div>
                              <p className="text-gray-700 text-xs">{principle.description}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-purple-900 mb-2">Expresión Creativa y Espiritualidad</h3>
                            <p className="text-purple-800 text-sm mb-2">
                              Shareflow se ha creado como una plataforma de expresión creativa que evoca el potencial espiritual creador de cada persona, 
                              sin ninguna afiliación religiosa específica.
                            </p>
                            <ul className="text-purple-800 text-sm space-y-1">
                              <li>• <strong>Contenido espiritual permitido:</strong> Desarrollo personal, mindfulness, filosofía de vida, inspiración</li>
                              <li>• <strong>Propaganda religiosa:</strong> No disponible en todas las ubicaciones, requiere aprobación contextual</li>
                              <li>• <strong>Política neutral:</strong> Shareflow no promueve ninguna religión específica</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Building className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-indigo-900 mb-2">Elementos Arquitectónicos Digitales</h3>
                            <p className="text-indigo-800 text-sm mb-2">
                              Las pantallas digitales en elementos arquitectónicos (vallas, cubiertas, terrazas, fachadas) 
                              tienen mayor flexibilidad de contenido debido a su naturaleza y audiencias masivas.
                            </p>
                            <ul className="text-indigo-800 text-sm space-y-1">
                              <li>• <strong>Vallas digitales:</strong> Mayor libertad creativa para contenido publicitario</li>
                              <li>• <strong>Elementos arquitectónicos:</strong> Cubiertas, terrazas, fachadas, medianeras, azoteas</li>
                              <li>• <strong>Cumplimiento urbanístico:</strong> Respeto por regulaciones municipales</li>
                              <li>• <strong>Impacto visual:</strong> Consideración del entorno arquitectónico</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="text-base font-semibold text-amber-900 mb-2">Responsabilidad Compartida para Brillar Juntos</h3>
                              <p className="text-amber-800 text-sm">
                                Todos los usuarios (desde creadores individuales hasta grandes empresas), propietarios de pantallas y Shareflow 
                                compartimos la responsabilidad de crear experiencias que conecten auténticamente, eleven la consciencia 
                                y generen un impacto positivo en cada espacio y audiencia.
                              </p>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Location Types */}
              <section id="tipos-ubicaciones" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tipos de Ubicaciones</h2>
                        <p className="text-gray-600">Espacios públicos, privados, arquitectónicos y mixtos</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Las políticas de contenido varían según el tipo de ubicación, considerando factores como accesibilidad pública, 
                        demografía de audiencia y contexto del espacio.
                      </p>
                      
                      <div className="grid gap-4 mb-6">
                        {[
                          {
                            type: "Espacios Públicos",
                            color: "blue",
                            icon: Building,
                            examples: ["Estaciones de metro y tren", "Transporte público urbano", "Plazas y parques públicos", "Calles peatonales", "Aeropuertos públicos", "Edificios gubernamentales", "Bibliotecas públicas", "Universidades públicas"],
                            restrictions: ["Contenido familiar obligatorio", "Sin material controvertido", "Volumen limitado", "Cumplimiento estricto", "Regulaciones gubernamentales"],
                            description: "Propiedad del estado y acceso público ciudadano irrestricto con audiencias diversas"
                          },
                          {
                            type: "Espacios Privados",
                            color: "green", 
                            icon: Lock,
                            examples: ["Centros comerciales", "Restaurantes", "Oficinas corporativas", "Hoteles"],
                            restrictions: ["Políticas del propietario", "Audiencia específica", "Horarios definidos", "Control de acceso"],
                            description: "Espacios con control de acceso y audiencias más definidas"
                          },
                          {
                            type: "Elementos Arquitectónicos",
                            color: "indigo",
                            icon: Building,
                            examples: ["Vallas digitales", "Cubiertas de edificios", "Terrazas comerciales", "Fachadas digitales", "Medianeras", "Azoteas", "Muros perimetrales", "Pantallas de gran formato"],
                            restrictions: ["Mayor libertad creativa", "Cumplimiento urbanístico", "Regulaciones municipales", "Impacto visual controlado"],
                            description: "Estructuras arquitectónicas con flexibilidad de contenido y audiencias masivas"
                          },
                          {
                            type: "Espacios Mixtos",
                            color: "purple",
                            icon: Users,
                            examples: ["Universidades", "Hospitales", "Estadios", "Centros de convenciones"],
                            restrictions: ["Políticas híbridas", "Contexto sensible", "Audiencias variables", "Horarios específicos"],
                            description: "Combinación de acceso público y privado con contextos especializados"
                          }
                        ].map((location, index) => (
                          <div key={index} className={`bg-${location.color}-50 border border-${location.color}-200 rounded-lg p-4`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 bg-${location.color}-100 rounded-lg flex items-center justify-center`}>
                                <location.icon className={`w-4 h-4 text-${location.color}-600`} />
                              </div>
                              <div>
                                <h3 className={`text-base font-bold text-${location.color}-900`}>{location.type}</h3>
                                <p className={`text-${location.color}-700 text-xs`}>{location.description}</p>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <h4 className={`text-sm font-semibold text-${location.color}-900 mb-2`}>Ejemplos</h4>
                                <ul className="space-y-1">
                                  {location.examples.map((example, idx) => (
                                    <li key={idx} className={`text-${location.color}-800 text-xs flex items-center gap-2`}>
                                      <span className={`w-1 h-1 bg-${location.color}-600 rounded-full`}></span>
                                      {example}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className={`text-sm font-semibold text-${location.color}-900 mb-2`}>Consideraciones</h4>
                                <ul className="space-y-1">
                                  {location.restrictions.map((restriction, idx) => (
                                    <li key={idx} className={`text-${location.color}-800 text-xs flex items-center gap-2`}>
                                      <span className={`w-1 h-1 bg-${location.color}-600 rounded-full`}></span>
                                      {restriction}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Permitted Content */}
              <section id="contenido-permitido" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contenido Permitido</h2>
                        <p className="text-gray-600">Estándares generales de aceptación</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        El contenido publicitario debe cumplir con estándares de calidad, precisión y adecuación para audiencias en espacios compartidos.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            category: "Productos y Servicios",
                            items: ["Productos de consumo legales", "Servicios profesionales", "Entretenimiento familiar", "Educación y cultura", "Tecnología e innovación"]
                          },
                          {
                            category: "Contenido Informativo",
                            items: ["Noticias verificadas", "Información pública", "Campañas de concientización", "Eventos comunitarios", "Servicios gubernamentales"]
                          },
                          {
                            category: "Promociones Comerciales",
                            items: ["Ofertas transparentes", "Promociones con términos claros", "Eventos y experiencias", "Lanzamientos de productos", "Servicios locales"]
                          },
                          {
                            category: "Contenido Creativo y Espiritual",
                            items: ["Arte y diseño", "Música e entretenimiento", "Deportes y fitness", "Desarrollo personal", "Mindfulness e inspiración"]
                          },
                          {
                            category: "Creadores de Contenido",
                            items: ["Promoción de perfiles sociales", "Videos musicales", "Lanzamientos de productos digitales", "Contenido educativo digital", "Streaming y podcasts"]
                          },
                          {
                            category: "Marketing Digital",
                            items: ["Campañas de influencers", "Promoción de canales digitales", "Lanzamientos de apps", "Plataformas de contenido", "Servicios creativos digitales"]
                          }
                        ].map((category, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-base font-semibold text-green-900 mb-3">{category.category}</h3>
                            <ul className="space-y-2">
                              {category.items.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className="text-green-800 text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                        <h3 className="text-base font-semibold text-blue-900 mb-2">Criterios de Calidad</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            "Información veraz y verificable",
                            "Diseño profesional y atractivo", 
                            "Mensaje claro y comprensible",
                            "Respeto por la diversidad",
                            "Cumplimiento de regulaciones",
                            "Adecuación al contexto"
                          ].map((criteria, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="text-blue-800 text-sm">{criteria}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-amber-900 mb-2">Contenido con Restricciones Contextuales</h3>
                            <p className="text-amber-800 text-sm mb-2">
                              Algunos tipos de contenido requieren aprobación especial y no están disponibles en todas las ubicaciones:
                            </p>
                            <ul className="text-amber-800 text-sm space-y-1">
                              <li>• <strong>Propaganda política:</strong> No disponible en todas las ubicaciones, requiere aprobación contextual</li>
                              <li>• <strong>Contenido religioso:</strong> Sujeto a consideraciones de ubicación y audiencia</li>
                              <li>• <strong>Productos regulados:</strong> Alcohol y tabaco con restricciones específicas</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prohibited Content */}
              <section id="contenido-prohibido" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contenido Prohibido</h2>
                        <p className="text-gray-600">Restricciones universales</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Cierto contenido está universalmente prohibido en todas las ubicaciones COOH para proteger audiencias 
                        y mantener estándares apropiados para espacios públicos y compartidos.
                      </p>
                      
                      <div className="grid gap-4 mb-6">
                        {[
                          {
                            category: "Contenido Dañino",
                            color: "red",
                            items: [
                              "Violencia explícita o perturbadora",
                              "Contenido que promueva autolesión",
                              "Discriminación o incitación al odio",
                              "Acoso o intimidación",
                              "Contenido que glorifique actividades peligrosas"
                            ]
                          },
                          {
                            category: "Contenido Sexual",
                            color: "pink",
                            items: [
                              "Desnudez o contenido sexualmente explícito",
                              "Insinuaciones sexuales inapropiadas",
                              "Servicios de entretenimiento adulto",
                              "Productos de naturaleza sexual",
                              "Contenido sugestivo dirigido a menores"
                            ]
                          },
                          {
                            category: "Sustancias y Productos Regulados",
                            color: "orange",
                            items: [
                              "Drogas ilegales o sustancias controladas",
                              "Tabaco y productos relacionados*",
                              "Alcohol en contextos inapropiados*",
                              "Medicamentos sin prescripción",
                              "Suplementos no regulados"
                            ]
                          },
                          {
                            category: "Contenido Fraudulento",
                            color: "yellow",
                            items: [
                              "Información médica no verificada",
                              "Esquemas de inversión fraudulentos",
                              "Productos milagro sin evidencia",
                              "Estafas o engaños",
                              "Información deliberadamente falsa"
                            ]
                          }
                        ].map((category, index) => (
                          <div key={index} className={`bg-${category.color}-50 border border-${category.color}-200 rounded-lg p-4`}>
                            <div className="flex items-center gap-3 mb-3">
                              <XCircle className={`w-5 h-5 text-${category.color}-600`} />
                              <h3 className={`text-base font-semibold text-${category.color}-900`}>{category.category}</h3>
                            </div>
                            <ul className="space-y-2">
                              {category.items.map((item, idx) => (
                                <li key={idx} className={`text-${category.color}-800 text-sm flex items-start gap-2`}>
                                  <span className={`w-1 h-1 bg-${category.color}-600 rounded-full mt-2 flex-shrink-0`}></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-amber-900 mb-2">Restricciones Contextuales</h3>
                            <p className="text-amber-800 text-sm">
                              * Algunos productos como alcohol y tabaco pueden estar permitidos en ubicaciones específicas 
                              con restricciones de horario y audiencia. Las regulaciones locales siempre tienen precedencia.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section - Enhanced for SEO */}
              <section id="faq" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Info className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes sobre Políticas de Publicidad</h2>
                        <p className="text-gray-600">Respuestas a consultas comunes sobre estándares DOOH</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="space-y-4">
                        {[
                          {
                            question: "¿Qué contenido está permitido en las pantallas DOOH de Shareflow?",
                            answer: "Permitimos contenido comercial legal, promociones de productos y servicios legítimos, contenido educativo e informativo, entretenimiento familiar apropiado, anuncios de servicios públicos y contenido cultural que respete las normas comunitarias y sea adecuado para espacios públicos.",
                            category: "Contenido Permitido"
                          },
                          {
                            question: "¿Qué contenido está prohibido en DOOH?",
                            answer: "Prohibimos contenido ilegal, violento o perturbador, discriminatorio, sexualmente explícito, relacionado con drogas ilegales, que promueva actividades peligrosas, que viole derechos de autor, que sea engañoso o fraudulento, o que contenga información médica no verificada.",
                            category: "Contenido Prohibido"
                          },
                          {
                            question: "¿Cómo se adaptan las políticas según la ubicación de la pantalla?",
                            answer: "Nuestras políticas se adaptan según el contexto: espacios públicos tienen restricciones más estrictas para proteger audiencias diversas, espacios privados permiten mayor flexibilidad, y consideramos factores como proximidad a escuelas, centros religiosos y la demografía específica de cada ubicación.",
                            category: "Adaptación Contextual"
                          },
                          {
                            question: "¿Puedo anunciar productos de alcohol y tabaco?",
                            answer: "Los productos de alcohol y tabaco están sujetos a restricciones especiales. Solo se permiten en ubicaciones específicas, con horarios restringidos, cumpliendo regulaciones locales y con advertencias apropiadas. No se permiten cerca de escuelas o en espacios familiares.",
                            category: "Productos Regulados"
                          },
                          {
                            question: "¿Cómo reporto contenido inapropiado en una pantalla?",
                            answer: "Puede reportar contenido inapropiado contactándonos en support@shareflow.me, a través del botón de reporte en nuestra app, o llamando a nuestro número de soporte. Incluya la ubicación específica, hora y descripción del contenido. Revisamos todos los reportes dentro de 24 horas.",
                            category: "Reportes"
                          },
                          {
                            question: "¿Qué pasa si mi anuncio es rechazado por violar las políticas?",
                            answer: "Si su anuncio es rechazado, recibirá una explicación detallada de los motivos específicos y sugerencias para modificarlo. Puede apelar la decisión proporcionando contexto adicional o enviar una versión revisada que cumpla con nuestras políticas. El proceso de apelación toma 48-72 horas.",
                            category: "Proceso de Apelación"
                          },
                          {
                            question: "¿Hay diferencias en las políticas entre espacios públicos y privados?",
                            answer: "Sí, los espacios públicos tienen estándares más estrictos debido a audiencias diversas e involuntarias. Los espacios privados (centros comerciales, oficinas) permiten mayor flexibilidad, pero aún deben cumplir estándares básicos de decencia y legalidad.",
                            category: "Espacios y Contexto"
                          },
                          {
                            question: "¿Cómo maneja Shareflow el contenido político?",
                            answer: "El contenido político requiere aprobación especial y no está disponible en todas las ubicaciones. Debe cumplir regulaciones electorales locales, incluir disclaimers apropiados, y no puede aparecer en espacios gubernamentales o educativos. Se aplican restricciones de horario durante períodos electorales.",
                            category: "Contenido Político"
                          },
                          {
                            question: "¿Qué requisitos técnicos debe cumplir mi contenido?",
                            answer: "El contenido debe tener resolución mínima de 1920x1080, formato MP4 o imagen PNG/JPG, duración máxima de 15 segundos para video, texto legible a distancia, contraste adecuado, y cumplir estándares de accesibilidad. Proporcionamos plantillas y guías de diseño.",
                            category: "Requisitos Técnicos"
                          },
                          {
                            question: "¿Shareflow revisa todo el contenido antes de publicarlo?",
                            answer: "Sí, todo el contenido pasa por un proceso de revisión multicapa que incluye verificación automatizada de contenido inapropiado, revisión humana especializada por nuestro equipo de moderación, y validación final antes de ser aprobado para transmisión en nuestras pantallas.",
                            category: "Proceso de Moderación"
                          },
                          {
                            question: "¿Cómo se actualizan las políticas de publicidad?",
                            answer: "Las políticas se revisan trimestralmente y se actualizan según cambios en regulaciones locales, feedback de la comunidad, y evolución de estándares industriales. Los cambios significativos se comunican con 30 días de anticipación a todos los usuarios activos.",
                            category: "Actualizaciones"
                          },
                          {
                            question: "¿Qué sucede con contenido que cumple políticas pero genera quejas?",
                            answer: "Evaluamos cada queja individualmente considerando el contexto, la ubicación, y el impacto en la comunidad. Podemos ajustar horarios de transmisión, reubicar el contenido, o requerir modificaciones. Mantenemos un balance entre libertad de expresión comercial y sensibilidad comunitaria.",
                            category: "Gestión de Quejas"
                          }
                        ].map((faq, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleFaq(index)}
                              className="w-full p-4 text-left hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-indigo-600 font-bold text-xs">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full whitespace-nowrap">
                                        {faq.category}
                                      </span>
                                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                        openFaqs.has(index) ? 'rotate-180' : ''
                                      }`} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                            {openFaqs.has(index) && (
                              <div className="px-4 pb-4">
                                <div className="pl-9">
                                  <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-base font-semibold text-indigo-900">¿Necesita aclaración sobre nuestras políticas?</h4>
                        </div>
                        <p className="text-indigo-800 text-sm mb-4">
                          Si tiene preguntas adicionales sobre nuestras políticas de publicidad o necesita orientación específica para su contenido, 
                          nuestro equipo de políticas está disponible para ayudarle.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a 
                            href="mailto:support@shareflow.me" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            Contactar Equipo de Políticas
                          </a>
                          <a 
                            href="/terms-of-service" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Ver Términos de Servicio
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contacto-soporte" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contacto y Soporte</h2>
                        <p className="text-gray-600">Canales de comunicación para políticas</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Consultas sobre Políticas</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">support@shareflow.me</p>
                                <p className="text-xs text-gray-500">Consultas sobre contenido, políticas y apelaciones</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Última Actualización</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-700 mb-2">
                              Estas políticas fueron actualizadas el 22 de junio de 2025.
                            </p>
                            <p className="text-xs text-gray-600">
                              Las políticas se revisan regularmente para adaptarse a nuevas regulaciones y contextos.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </>
  );
} 