import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ArrowUp, Shield, Users, FileText, AlertTriangle, CheckCircle, Globe, Megaphone, Calendar, Clock, Eye, ChevronDown, Scale, Heart, Building, Zap, Target, BookOpen, Lock, UserCheck, CreditCard, Database, HelpCircle, BarChart, XCircle, Mail, Phone, Bot } from 'lucide-react';

export function TermsOfService() {
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
      id: 'bienvenido',
      title: 'Bienvenido a Shareflow',
      icon: BookOpen,
      description: 'Acuerdo vinculante y misión democratizadora'
    },
    {
      id: 'plataforma-servicios',
      title: 'Plataforma y Servicios COOH',
      icon: Megaphone,
      description: 'Evolución hacia Connected Out-of-Home'
    },
    {
      id: 'elegibilidad-cuentas',
      title: 'Elegibilidad y Creación de Cuentas',
      icon: UserCheck,
      description: 'Requisitos y proceso de registro'
    },
    {
      id: 'estructura-usuarios',
      title: 'Estructura de Usuarios',
      icon: Users,
      description: 'Niveles: Exploradores, Visionarios, Maestros'
    },
    {
      id: 'sistema-financiero',
      title: 'Sistema Financiero',
      icon: CreditCard,
      description: 'Créditos prepagados y procesamiento'
    },
    {
      id: 'contenido-politicas',
      title: 'Estándares de Contenido',
      icon: Target,
      description: 'Políticas editoriales y calidad'
    },
    {
      id: 'moderacion',
      title: 'Moderación y Aprobación',
      icon: CheckCircle,
      description: 'Proceso multicapa de revisión'
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad Intelectual',
      icon: Shield,
      description: 'Derechos, licencias y entrenamiento IA'
    },
    {
      id: 'privacidad',
      title: 'Privacidad y Protección de Datos',
      icon: Database,
      description: 'GDPR, CCPA y seguridad robusta'
    },
    {
      id: 'limitaciones',
      title: 'Limitaciones de Responsabilidad',
      icon: AlertTriangle,
      description: 'Exoneraciones y límites de responsabilidad'
    },
    {
      id: 'terminacion',
      title: 'Terminación y Efectos',
      icon: Clock,
      description: 'Causas y procedimientos de terminación'
    },
    {
      id: 'resolucion-disputas',
      title: 'Resolución de Disputas',
      icon: Scale,
      description: 'Arbitraje vinculante y ley de Delaware'
    },
    {
      id: 'disposiciones-generales',
      title: 'Disposiciones Generales',
      icon: FileText,
      description: 'Modificaciones y acuerdo completo'
    },
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      icon: HelpCircle,
      description: 'Respuestas a consultas comunes sobre términos'
    },
    {
      id: 'contacto',
      title: 'Contacto e Información Legal',
      icon: Building,
      description: 'Shareflow LLC - Delaware'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Términos de Uso | Shareflow - Plataforma COOH Connected Out-of-Home</title>
        <meta name="description" content="Términos de uso de Shareflow LLC. Plataforma innovadora COOH que democratiza el acceso a la publicidad digital exterior conectada para todos los usuarios." />
        <meta name="keywords" content="términos de uso, Shareflow LLC, COOH, Connected Out-of-Home, DOOH, publicidad digital, pantallas conectadas, democratización publicitaria" />
        <link rel="canonical" href="https://shareflow.com/terms-of-service" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Términos de Uso | Shareflow" />
        <meta property="og:description" content="Términos de uso de Shareflow LLC. Plataforma COOH que democratiza el acceso a la publicidad digital exterior conectada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shareflow.com/terms-of-service" />
        <meta property="og:image" content="https://shareflow.com/og-terms.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Términos de Uso | Shareflow" />
        <meta name="twitter:description" content="Términos de uso de Shareflow LLC. Democratizando el acceso a la publicidad COOH." />
        
        {/* Enhanced Schema.org structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "LegalDocument", "TermsOfService"],
            "name": "Términos de Servicio - Shareflow DOOH Platform",
            "headline": "Términos y Condiciones Completos para Plataforma DOOH",
            "description": "Términos de servicio completos de Shareflow LLC, plataforma líder de Connected Out-of-Home (DOOH) en Colombia. Condiciones de uso, derechos y obligaciones para usuarios.",
            "url": "https://shareflow.com/terms-of-service",
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
                  "name": "¿Quién puede usar los servicios de Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nuestros servicios están disponibles para personas mayores de 18 años, empresas, agencias de medios, propietarios de pantallas digitales y creadores de contenido que deseen utilizar nuestra plataforma DOOH para campañas publicitarias."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cuáles son las responsabilidades del usuario?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Los usuarios deben proporcionar información precisa, cumplir con nuestras políticas de contenido, respetar los derechos de propiedad intelectual, usar los servicios de manera legal y ética, y mantener la seguridad de su cuenta."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo funciona la facturación en Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ofrecemos varios modelos de pago incluyendo prepago, facturación mensual y campañas por evento. Los pagos se procesan de forma segura y las tarifas se basan en ubicación, duración y tipo de campaña DOOH."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué pasa si cancelo mi cuenta?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Puede cancelar su cuenta en cualquier momento. Las campañas activas continuarán hasta su finalización programada. Los datos se conservarán según nuestra política de retención y se eliminarán cuando sea legalmente permisible."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo resuelvo disputas con Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Primero intente resolver disputas contactando nuestro soporte. Si no se resuelve, seguimos un proceso de mediación y arbitraje bajo las leyes de Delaware, Estados Unidos, donde está constituida nuestra empresa."
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
                  "name": "Términos de Servicio",
                  "item": "https://shareflow.com/terms-of-service"
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
        <meta name="subject" content="Términos de Servicio DOOH" />
        <meta name="copyright" content="Shareflow LLC" />
        <meta name="language" content="ES" />
        <meta name="revised" content="2025-01-15" />
        <meta name="abstract" content="Términos y condiciones completos para la plataforma DOOH líder en Colombia" />
        <meta name="topic" content="Términos de Servicio, DOOH, Condiciones de Uso" />
        <meta name="summary" content="Términos de servicio de Shareflow, plataforma Connected Out-of-Home" />
        <meta name="classification" content="Legal Document" />
        <meta name="author" content="Shareflow Legal Team" />
        <meta name="designer" content="Shareflow LLC" />
        <meta name="reply-to" content="legal@shareflow.me" />
        <meta name="owner" content="Shareflow LLC" />
        <meta name="url" content="https://shareflow.com/terms-of-service" />
        <meta name="identifier-URL" content="https://shareflow.com/terms-of-service" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Legal, Terms, DOOH" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="es" href="https://shareflow.com/es/terms-of-service" />
        <link rel="alternate" hrefLang="en" href="https://shareflow.com/en/terms-of-service" />
        <link rel="alternate" hrefLang="x-default" href="https://shareflow.com/terms-of-service" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="max-w-7xl mx-auto px-4 py-20 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">Términos de Uso</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Términos de Uso
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent"> Shareflow</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Democratizando el acceso a la publicidad COOH (Connected Out-of-Home). 
                Marco legal transparente para nuestra plataforma innovadora donde cada persona, creador y organización puede brillar: conectando auténticamente con audiencias, generando impacto positivo en comunidades, y elevando la experiencia creativa de comunicación visual.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha de vigencia: 22 de junio de 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Jurisdicción: Delaware, Estados Unidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Plataforma COOH líder mundial</span>
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
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Índice de Contenidos</h2>
                    <p className="text-sm text-gray-600">Navega rápidamente por nuestros términos</p>
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
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            activeSection === section.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
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
              {/* Welcome to Shareflow */}
              <section id="bienvenido" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Bienvenido a Shareflow</h2>
                        <p className="text-gray-600">Acuerdo vinculante y misión democratizadora</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Estos Términos de Uso constituyen un acuerdo legalmente vinculante entre usted y <strong>Shareflow LLC</strong>, una sociedad de responsabilidad limitada organizada bajo las leyes del Estado de Delaware, Estados Unidos. Shareflow opera una plataforma innovadora de publicidad digital que conecta anunciantes con propietarios de pantallas digitales en todo el mundo.
                      </p>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                        <div className="flex items-start gap-3">
                          <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-base font-semibold text-blue-900 mb-2">Es el Momento de Todos de Brillar</h3>
                            <p className="text-blue-800 text-sm">
                              Shareflow revoluciona fundamentalmente quién puede acceder a la publicidad exterior digital (DOOH), porque creemos que este es el momento para que cada persona, creador, emprendedor, pequeña empresa y organización pueda brillar a través de conexiones genuinas con audiencias reales, generando impacto positivo en sus comunidades y elevando la experiencia creativa para maximizar su potencial comunicativo.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-amber-900 mb-2">Ecosistema Inclusivo para Brillar</h3>
                            <p className="text-amber-800 text-sm">
                              Facilitamos un ecosistema inclusivo donde la autenticidad del mensaje y la capacidad de conectar importan más que el tamaño del presupuesto. Desde un artista local compartiendo su visión creativa hasta una multinacional promoviendo valores positivos, todos tienen la oportunidad de brillar: estableciendo conexiones significativas, generando impacto transformador, y elevando la experiencia visual para desbloquear su máximo potencial creativo en espacios físicos estratégicos.
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700">
                        Cuando utiliza nuestros servicios, acepta estos términos en su totalidad. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder ni utilizar la plataforma Shareflow.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Platform and COOH Services */}
              <section id="plataforma-servicios" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Nuestra Plataforma y Servicios COOH</h2>
                        <p className="text-gray-600">Evolución hacia Connected Out-of-Home</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-6">
                        <h3 className="text-base font-semibold text-purple-900 mb-2">Misión Transformadora: De DOOH a COOH</h3>
                        <p className="text-purple-800 text-sm">
                          <strong>Shareflow nace con el objetivo específico de transformar el DOOH (Digital Out-of-Home) en COOH (Connected Out-of-Home)</strong>. Mientras que DOOH se limita a pantallas digitales básicas, COOH representa pantallas inteligentemente conectadas que responden dinámicamente a datos en tiempo real, audiencias contextuales, y momentos estratégicos. Esta transformación democratiza el acceso y eleva la experiencia publicitaria exterior a un nuevo paradigma de conexión auténtica.
                        </p>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        <strong>Shareflow</strong> representa la evolución natural de la publicidad exterior digital (DOOH) hacia el futuro de la comunicación visual: <strong>COOH (Connected Out of Home)</strong>. Estamos transformando fundamentalmente el ecosistema publicitario exterior mediante la integración de tecnologías avanzadas que convierten pantallas estáticas en nodos inteligentes de comunicación.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            icon: Zap,
                            title: "Programática Publicitaria",
                            description: "Sistemas avanzados de licitación en tiempo real y optimización automática de campañas"
                          },
                          {
                            icon: Eye,
                            title: "Análisis de Audiencia",
                            description: "Análisis de audiencia en tiempo real y contexto ambiental inteligente"
                          },
                          {
                            icon: Globe,
                            title: "Conectividad Inteligente",
                            description: "Cada pantalla es un nodo inteligente capaz de responder dinámicamente a datos en tiempo real"
                          },
                          {
                            icon: CreditCard,
                            title: "Sistemas de Pago Seguros",
                            description: "Procesamiento seguro y fragmentación de compras por tiempo específico o momentos estratégicos"
                          }
                        ].map((service, index) => {
                          const IconComponent = service.icon;
                          return (
                            <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">{service.title}</h3>
                              </div>
                              <p className="text-gray-700 text-xs">{service.description}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Diferencia Fundamental: DOOH vs COOH</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-red-900 mb-2">DOOH Tradicional</h4>
                            <ul className="text-xs text-red-800 space-y-1">
                              <li>• Pantallas digitales básicas</li>
                              <li>• Contenido estático programado</li>
                              <li>• Sin conexión a datos en tiempo real</li>
                              <li>• Acceso limitado a grandes corporaciones</li>
                              <li>• Medición básica de audiencias</li>
                            </ul>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-green-900 mb-2">COOH de Shareflow</h4>
                            <ul className="text-xs text-green-800 space-y-1">
                              <li>• Pantallas inteligentemente conectadas</li>
                              <li>• Contenido dinámico y contextual</li>
                              <li>• Integración con datos en tiempo real</li>
                              <li>• Acceso democratizado para todos</li>
                              <li>• Análisis avanzado de audiencias</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                        <h3 className="text-base font-semibold text-blue-900 mb-2">Momentos Perfectos para Brillar</h3>
                                                  <p className="text-blue-800 text-sm">
                            Nuestro sistema revoluciona el acceso mediante la compra fragmentada de espacios publicitarios: compra basada en tiempo específico (time-based), programática en tiempo real, o por momentos estratégicos. Esta fragmentación permite que cualquier usuario encuentre exactamente el momento perfecto para brillar, conectando con la audiencia correcta en el contexto ideal, desde segundos específicos de alto impacto hasta campañas extensas que eleven la experiencia creativa y maximicen el potencial comunicativo de manera sostenida.
                          </p>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <h3 className="text-base font-semibold text-green-900 mb-2">Para Propietarios de Pantallas</h3>
                        <p className="text-green-800 text-sm">
                          Ofrecemos una plataforma que maximiza el valor del inventario digital mediante algoritmos inteligentes de precio dinámico, herramientas avanzadas de gestión de contenido conectado, y sistemas de pago automatizados que garantizan ingresos constantes y predecibles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Eligibility and Account Creation */}
              <section id="elegibilidad-cuentas" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Elegibilidad y Creación de Cuentas</h2>
                        <p className="text-gray-600">Requisitos y proceso de registro</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Para utilizar Shareflow, debe ser una persona física de al menos 18 años de edad o una entidad legal con capacidad plena para celebrar contratos vinculantes en su jurisdicción. Reconocemos que nuestros usuarios incluyen desde creadores individuales y emprendedores hasta pequeñas empresas, organizaciones sin fines de lucro, y grandes corporaciones.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-blue-900 mb-2">Para Personas Individuales</h3>
                          <p className="text-blue-800 text-sm">
                            El proceso de registro es simple y directo: solo necesita proporcionar información básica de contacto y verificar su identidad mediante métodos estándar. Creemos que brillar en pantallas digitales debe ser tan fácil como crear una cuenta en cualquier red social, porque este es el momento para que cada persona pueda conectar con audiencias reales y generar el impacto positivo que desea en el mundo.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-green-900 mb-2">Para Empresas y Organizaciones</h3>
                          <p className="text-green-800 text-sm">
                            Requerimos información adicional sobre la estructura corporativa y beneficiarios finales para cumplir con nuestras obligaciones regulatorias y mantener la integridad de nuestra plataforma. Esto incluye verificación de documentos oficiales y validación de información bancaria.
                          </p>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-red-900 mb-2">Responsabilidad de la Cuenta</h3>
                            <p className="text-red-800 text-sm">
                              Su cuenta es personal e intransferible. Es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Debe notificarnos inmediatamente si sospecha cualquier uso no autorizado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Structure and Benefits */}
              <section id="estructura-usuarios" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-blue-200">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Estructura de Usuarios y Beneficios</h2>
                        <p className="text-gray-600">Niveles escalables que crecen con usted</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-6">
                        Nuestra plataforma reconoce que diferentes usuarios tienen diferentes necesidades, presupuestos y volúmenes de actividad. Hemos desarrollado un sistema de niveles que democratiza el acceso a beneficios escalables, permitiendo que tanto un emprendedor individual como una gran corporación encuentren valor apropiado.
                      </p>
                      
                      <div className="grid gap-4 mb-6">
                        {[
                          {
                            level: "Exploradores",
                            color: "green",
                            description: "El corazón de nuestra misión democratizadora, diseñado para personas, creadores, emprendedores y pequeñas empresas que están comenzando su jornada para brillar: conectando auténticamente, generando impacto positivo y elevando su creatividad a través de la comunicación visual digital.",
                            benefits: ["Acceso completo a funcionalidades esenciales", "Creación de campañas intuitiva", "Acceso a inventario estándar", "Reportes claros de rendimiento"]
                          },
                          {
                            level: "Visionarios",
                            color: "blue",
                            description: "Para usuarios que han demostrado un compromiso continuo con brillar de manera auténtica, estableciendo conexiones significativas y generando impacto positivo constante a través de volúmenes moderados de campañas publicitarias.",
                            benefits: ["Descuentos en tarifas de transacción", "Acceso prioritario a inventario premium", "Herramientas avanzadas de análisis", "Soporte técnico especializado"]
                          },
                          {
                            level: "Maestro Creativo",
                            color: "purple",
                            description: "Reservado para usuarios que han demostrado maestría en brillar consistentemente, conectando profundamente con audiencias, generando impacto transformador y elevando la experiencia visual a través de alto volumen de actividad y mensajes poderosos que maximizan su potencial creativo.",
                            benefits: ["Tarifas más competitivas", "Acceso exclusivo a inventario premium", "Herramientas de análisis predictivo", "Gestor de cuenta dedicado"]
                          },
                          {
                            level: "Empresa",
                            color: "amber",
                            description: "Servicios completamente personalizados para organizaciones comprometidas con brillar a escala masiva, conectando con comunidades globales, generando impacto social positivo y elevando la experiencia creativa colectiva a través de volúmenes significativos que maximizan el potencial comunicativo y la responsabilidad corporativa.",
                            benefits: ["Integración API personalizada", "Reportes ejecutivos especializados", "Soporte 24/7", "Términos comerciales negociados"]
                          }
                        ].map((tier, index) => (
                          <div key={index} className={`bg-${tier.color}-50 border border-${tier.color}-200 rounded-lg p-4`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-6 h-6 bg-${tier.color}-100 rounded-lg flex items-center justify-center`}>
                                <span className={`text-sm font-bold text-${tier.color}-600`}>{index + 1}</span>
                              </div>
                              <h3 className={`text-lg font-bold text-${tier.color}-900`}>{tier.level}</h3>
                            </div>
                            <p className={`text-${tier.color}-800 text-sm mb-3`}>{tier.description}</p>
                            <div className="grid md:grid-cols-2 gap-2">
                              {tier.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircle className={`w-3 h-3 text-${tier.color}-600 flex-shrink-0`} />
                                  <span className={`text-xs text-${tier.color}-800`}>{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Financial System */}
              <section id="sistema-financiero" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sistema Financiero</h2>
                        <p className="text-gray-600">Créditos prepagados y procesamiento</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Nuestro sistema financiero está diseñado para proporcionar transparencia, seguridad y accesibilidad a usuarios de todos los niveles:
                      </p>
                      
                      <div className="grid gap-3 mb-6">
                        {[
                          "Wallet virtual personal donde se almacenan sus créditos prepagados de forma segura",
                          "Sistema de créditos prepagados que garantiza control total del presupuesto",
                          "Procesamiento seguro de pagos con múltiples métodos aceptados",
                          "Transparencia total en tarifas sin costos ocultos",
                          "Facturación automática y reportes detallados de gastos",
                          "Opciones de recarga flexibles adaptadas a diferentes necesidades"
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-green-800 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-base font-semibold text-blue-900 mb-2">Ecosistema de Créditos Shareflow</h3>
                        <p className="text-blue-800 text-sm mb-2">
                          Los créditos adquiridos se depositan en su wallet virtual y no son reembolsables, pero mantienen su valor completo y pueden utilizarse no solo para servicios publicitarios, sino también en todos los productos y servicios del ecosistema Shareflow, tanto actuales como futuros que desarrollemos. Su wallet virtual es compatible con todo el ecosistema, garantizando que su inversión siempre tenga valor dentro de nuestra plataforma en expansión.
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-base font-semibold text-amber-900 mb-2">Gestión de Créditos en Wallet Virtual</h3>
                            <p className="text-amber-800 text-sm">
                              Los créditos no utilizados permanecen seguros en su wallet virtual hasta ser consumidos. 
                              No hay fecha de vencimiento para los créditos prepagados almacenados en su wallet, garantizando que su inversión esté siempre disponible para cualquier servicio actual o futuro de la plataforma.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Content Standards */}
              <section id="contenido-politicas" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Estándares de Contenido</h2>
                        <p className="text-gray-600">Políticas editoriales y calidad</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <p className="text-gray-700 mb-4">
                        Mantenemos estándares editoriales rigurosos para garantizar contenido de calidad que respete a todas las audiencias. 
                        Para información detallada sobre nuestras políticas de contenido publicitario, consulte nuestras <a href="/advertising-policies" className="text-purple-600 hover:text-purple-800 underline font-medium">Políticas de Publicidad</a> completas.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            icon: CheckCircle,
                            title: "Contenido Permitido",
                            items: ["Promociones comerciales legales", "Contenido educativo", "Eventos deportivos y culturales", "Servicios profesionales"]
                          },
                          {
                            icon: XCircle,
                            title: "Contenido Prohibido",
                            items: ["Material discriminatorio", "Contenido sexualmente explícito", "Productos ilegales", "Información médica no verificada"]
                          }
                        ].map((category, index) => {
                          const IconComponent = category.icon;
                          const colorClass = index === 0 ? 'green' : 'red';
                          return (
                            <div key={index} className={`bg-${colorClass}-50 rounded-lg p-4 border border-${colorClass}-200`}>
                              <div className="flex items-center gap-3 mb-3">
                                <IconComponent className={`w-5 h-5 text-${colorClass}-600`} />
                                <h3 className={`text-base font-semibold text-${colorClass}-900`}>{category.title}</h3>
                              </div>
                              <ul className="space-y-1">
                                {category.items.map((item, idx) => (
                                  <li key={idx} className={`text-${colorClass}-800 text-sm flex items-center gap-2`}>
                                    <span className={`w-1 h-1 bg-${colorClass}-600 rounded-full`}></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h3 className="text-base font-semibold text-blue-900 mb-2">Proceso de Revisión</h3>
                        <p className="text-blue-800 text-sm">
                          Todo contenido pasa por revisión automatizada y humana antes de su publicación. 
                          El proceso toma hasta 24 horas hábiles para garantizar cumplimiento de estándares. 
                          Consulte nuestras <a href="/advertising-policies" className="text-blue-700 hover:text-blue-900 underline font-medium">Políticas de Publicidad</a> para conocer los criterios específicos de evaluación.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Moderation */}
              <section id="moderacion" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Moderación y Aprobación</h2>
                        <p className="text-gray-600">Proceso multicapa de revisión</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Sistema de Revisión Multicapa</h3>
                        <p className="text-gray-700 mb-3">
                          Implementamos un sistema de moderación avanzado que combina inteligencia artificial y revisión humana 
                          para garantizar la calidad y adecuación de todo el contenido.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Proceso de Aprobación</h3>
                        <div className="grid gap-2">
                          {[
                            "Análisis automatizado de contenido y cumplimiento de políticas",
                            "Verificación de derechos de autor y propiedad intelectual",
                            "Revisión humana especializada para contenido sensible",
                            "Validación de información y claims publicitarios",
                            "Aprobación final y programación de publicación"
                          ].map((step, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-indigo-800 text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="text-base font-semibold text-amber-900 mb-2">Tiempos de Revisión</h3>
                              <p className="text-amber-800 text-sm">
                                El proceso de revisión toma generalmente entre 2-24 horas. Contenido complejo o que requiere 
                                verificación adicional puede tomar más tiempo. Te notificaremos sobre el estado de tu contenido. 
                                Revise nuestras <a href="/advertising-policies" className="text-amber-700 hover:text-amber-900 underline font-medium">Políticas de Publicidad</a> para entender los criterios de evaluación específicos.
                              </p>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="propiedad-intelectual" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Propiedad Intelectual</h2>
                        <p className="text-gray-600">Derechos, licencias y entrenamiento IA</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Derechos de Contenido y Licencias</h3>
                        <p className="text-gray-700 mb-4">
                          <strong>Cuando carga contenido a nuestra plataforma, usted retiene todos los derechos de propiedad sobre ese contenido.</strong> 
                          Sin embargo, nos otorga una licencia limitada, no exclusiva, mundial, libre de regalías para usar, reproducir, modificar, adaptar, publicar, traducir, distribuir, y mostrar su contenido únicamente con el propósito de prestar nuestros servicios.
                        </p>
                        
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Alcance de la Licencia</h4>
                        <p className="text-gray-700 mb-4">
                          Esta licencia incluye el derecho de mostrar su contenido en las pantallas de nuestros partners de red, crear versiones optimizadas para diferentes formatos de pantalla, y utilizar su contenido para entrenar y mejorar nuestros modelos de inteligencia artificial, aprendizaje automático (ML), modelos de lenguaje (LLM), y otros sistemas algorítmicos que mejoran la experiencia de la plataforma, optimizan la segmentación de audiencias, y perfeccionan nuestros servicios COOH.
                        </p>

                        <h4 className="text-base font-semibold text-gray-900 mb-2">Consentimiento para Desarrollo de IA</h4>
                        <p className="text-gray-700 mb-4">
                          Al aceptar estos términos, usted específicamente consiente que su contenido puede ser utilizado de manera agregada y anonimizada para el desarrollo y entrenamiento de tecnologías de IA que benefician a toda la comunidad de usuarios de Shareflow, incluyendo pero no limitándose a mejoras en reconocimiento de contenido, optimización automática de campañas, y análisis predictivo de audiencias.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-base font-semibold text-amber-900 mb-2">Responsabilidad de Derechos</h4>
                              <p className="text-amber-800 text-sm">
                                <strong>Es fundamentalmente importante que solo cargue contenido para el cual tiene todos los derechos necesarios.</strong> 
                                Esto significa que debe ser el propietario original del contenido o tener licencias válidas y verificables para usar cualquier elemento de terceros incluido en su material publicitario. Nos reservamos el derecho de solicitar evidencia de tales derechos cuando lo consideremos necesario.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>• Usted mantiene la propiedad completa de su contenido</p>
                          <p>• Licencia limitada a Shareflow para operaciones de plataforma</p>
                          <p>• Derecho a revocar el contenido en cualquier momento</p>
                          <p>• Protección contra uso no autorizado por terceros</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Protección de Datos en IA</h3>
                        <p className="text-gray-700 mb-3">
                          Como se detalla en la sección anterior, el uso de contenido para entrenamiento de IA se realiza de manera agregada y anonimizada, 
                          protegiendo siempre la privacidad y los derechos de nuestros usuarios.
                        </p>
                        
                        <p className="text-gray-700 text-sm">
                          <strong>Garantías de Privacidad:</strong> Los datos utilizados para entrenamiento son completamente anonimizados y agregados. 
                          Nunca se incluye información personal identificable ni se crean copias exactas de contenido específico. 
                          Todos los procesos de IA cumplen con las más altas normas de privacidad y seguridad.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Infracción de Derechos</h3>
                        <p className="text-gray-700 text-sm">
                          Si cree que su contenido ha sido utilizado sin autorización, contáctenos inmediatamente. 
                          Implementamos un proceso rápido para investigar y resolver disputas de propiedad intelectual.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy */}
              <section id="privacidad" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Privacidad y Protección de Datos</h2>
                        <p className="text-gray-600">GDPR, CCPA y seguridad robusta</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Cumplimiento Regulatorio</h3>
                        <p className="text-gray-700 mb-3">
                          Cumplimos con las principales regulaciones de privacidad globales incluyendo GDPR (Europa), 
                          CCPA (California), y otros marcos regulatorios aplicables según su ubicación.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            { name: "GDPR", desc: "Reglamento General de Protección de Datos (Europa)" },
                            { name: "CCPA", desc: "Ley de Privacidad del Consumidor de California" },
                            { name: "SOC 2", desc: "Controles de seguridad y disponibilidad" },
                            { name: "ISO 27001", desc: "Gestión de seguridad de la información" }
                          ].map((compliance, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">{compliance.name}</h4>
                              <p className="text-xs text-gray-600">{compliance.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Sus Derechos de Privacidad</h3>
                        <div className="grid gap-2">
                          {[
                            "Acceso a sus datos personales almacenados",
                            "Rectificación de información inexacta",
                            "Eliminación de datos (derecho al olvido)",
                            "Portabilidad de datos en formato estructurado",
                            "Oposición al procesamiento para fines específicos"
                          ].map((right, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-blue-800 text-sm">{right}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <h3 className="text-base font-semibold text-green-900 mb-2">Seguridad de Datos</h3>
                        <p className="text-green-800 text-sm">
                          Implementamos medidas de seguridad técnicas y organizacionales robustas incluyendo cifrado 
                          de extremo a extremo, autenticación multifactor, y auditorías de seguridad regulares. 
                          Para ejercer sus derechos de privacidad, contáctenos a support@shareflow.me
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Liability Limitations */}
              <section id="limitaciones" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Limitaciones de Responsabilidad</h2>
                        <p className="text-gray-600">Exoneraciones y límites de responsabilidad</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <p className="text-gray-700">
                        En la máxima medida permitida por la ley aplicable, Shareflow LLC no será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos.
                      </p>
                      
                      <div className="grid gap-3">
                        {[
                          "Pérdida de ganancias o ingresos esperados",
                          "Daños a la reputación comercial o personal", 
                          "Pérdida de datos o información confidencial",
                          "Interrupciones del servicio por causas externas",
                          "Decisiones tomadas basadas en datos de la plataforma"
                        ].map((limitation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-red-800 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                        <h3 className="text-base font-semibold text-amber-900 mb-2">Límite de Responsabilidad</h3>
                        <p className="text-amber-800 text-sm">
                          Nuestra responsabilidad total hacia usted por cualquier reclamo no excederá el monto pagado por usted a Shareflow en los 12 meses anteriores al evento que originó el reclamo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Termination */}
              <section id="terminacion" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Terminación y Efectos</h2>
                        <p className="text-gray-600">Causas y procedimientos de terminación</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Terminación por el Usuario</h3>
                        <p className="text-gray-700 mb-3">
                          Puede terminar su cuenta en cualquier momento contactándonos. Procesaremos su solicitud dentro de 48 horas hábiles.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Terminación por Shareflow</h3>
                        <p className="text-gray-700 mb-3">
                          Podemos suspender o terminar su acceso por violación de términos, actividad fraudulenta, o incumplimiento de obligaciones de pago.
                        </p>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h3 className="text-base font-semibold text-blue-900 mb-2">Efectos de la Terminación</h3>
                        <p className="text-blue-800 text-sm">
                          Al terminar la cuenta: (1) Se suspenderán todas las campañas activas, (2) Se proporcionará acceso temporal para descargar datos, (3) Los créditos no utilizados podrán ser reembolsados según nuestras políticas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dispute Resolution */}
              <section id="resolucion-disputas" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Scale className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Resolución de Disputas</h2>
                        <p className="text-gray-600">Arbitraje vinculante y ley de Delaware</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <p className="text-gray-700">
                        Las disputas se resolverán mediante arbitraje vinculante en Delaware, Estados Unidos, conforme a las reglas de la American Arbitration Association.
                      </p>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Ley Aplicable</h3>
                        <p className="text-gray-700 text-sm">
                          Estos términos se rigen por las leyes del Estado de Delaware, Estados Unidos, sin aplicación de principios de conflicto de leyes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* General Provisions */}
              <section id="disposiciones-generales" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Disposiciones Generales</h2>
                        <p className="text-gray-600">Modificaciones y acuerdo completo</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-blue-900 mb-2">Modificaciones</h3>
                          <p className="text-blue-800 text-sm">
                            Nos reservamos el derecho de modificar estos términos. Los cambios significativos se notificarán con 30 días de anticipación.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-green-900 mb-2">Acuerdo Completo</h3>
                          <p className="text-green-800 text-sm">
                            Estos términos constituyen el acuerdo completo entre las partes y reemplazan todos los acuerdos anteriores.
                          </p>
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
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes sobre Términos de Servicio</h2>
                        <p className="text-gray-600">Respuestas a las consultas más comunes sobre nuestros términos</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="space-y-4">
                        {[
                          {
                            question: "¿Quién puede usar los servicios de Shareflow?",
                            answer: "Nuestros servicios están disponibles para personas mayores de 18 años, empresas, agencias de medios, propietarios de pantallas digitales y creadores de contenido que deseen utilizar nuestra plataforma DOOH para campañas publicitarias.",
                            category: "Elegibilidad"
                          },
                          {
                            question: "¿Cuáles son las responsabilidades del usuario?",
                            answer: "Los usuarios deben proporcionar información precisa, cumplir con nuestras políticas de contenido, respetar los derechos de propiedad intelectual, usar los servicios de manera legal y ética, y mantener la seguridad de su cuenta.",
                            category: "Responsabilidades"
                          },
                          {
                            question: "¿Cómo funciona la facturación en Shareflow?",
                            answer: "Ofrecemos varios modelos de pago incluyendo prepago, facturación mensual y campañas por evento. Los pagos se procesan de forma segura y las tarifas se basan en ubicación, duración y tipo de campaña DOOH.",
                            category: "Facturación"
                          },
                          {
                            question: "¿Qué tipos de contenido están prohibidos?",
                            answer: "Prohibimos contenido que sea ilegal, ofensivo, discriminatorio, que infrinja derechos de autor, que sea engañoso o fraudulento, o que viole nuestras políticas de publicidad DOOH.",
                            category: "Contenido"
                          },
                          {
                            question: "¿Cómo funciona el proceso de moderación?",
                            answer: "Todo el contenido pasa por un proceso multicapa de revisión que incluye verificación automatizada, revisión humana especializada y validación final antes de ser aprobado para transmisión en pantallas DOOH.",
                            category: "Moderación"
                          },
                          {
                            question: "¿Qué derechos tengo sobre mi contenido?",
                            answer: "Usted mantiene todos los derechos de propiedad intelectual sobre su contenido. Nos otorga una licencia limitada para mostrar su contenido en nuestra plataforma DOOH según los términos acordados.",
                            category: "Propiedad Intelectual"
                          },
                          {
                            question: "¿Qué pasa si cancelo mi cuenta?",
                            answer: "Puede cancelar su cuenta en cualquier momento. Las campañas activas continuarán hasta su finalización programada. Los datos se conservarán según nuestra política de retención y se eliminarán cuando sea legalmente permisible.",
                            category: "Cancelación"
                          },
                          {
                            question: "¿Cómo resuelvo disputas con Shareflow?",
                            answer: "Primero intente resolver disputas contactando nuestro soporte. Si no se resuelve, seguimos un proceso de mediación y arbitraje bajo las leyes de Delaware, Estados Unidos, donde está constituida nuestra empresa.",
                            category: "Disputas"
                          },
                          {
                            question: "¿Shareflow puede cambiar estos términos?",
                            answer: "Sí, nos reservamos el derecho de modificar estos términos. Los cambios significativos se notificarán con 30 días de anticipación y el uso continuado constituye aceptación de los nuevos términos.",
                            category: "Modificaciones"
                          },
                          {
                            question: "¿Cuál es la responsabilidad de Shareflow por daños?",
                            answer: "Nuestra responsabilidad total hacia usted por cualquier reclamo no excederá el monto pagado por usted a Shareflow en los 12 meses anteriores al evento que originó el reclamo, según las limitaciones descritas en nuestros términos.",
                            category: "Responsabilidad"
                          },
                          {
                            question: "¿Qué niveles de usuario existen en Shareflow?",
                            answer: "Tenemos tres niveles: Exploradores (usuarios nuevos), Visionarios (usuarios intermedios con más funcionalidades) y Maestros (usuarios avanzados con acceso completo a herramientas profesionales DOOH).",
                            category: "Niveles de Usuario"
                          },
                          {
                            question: "¿Cómo contacto el soporte legal de Shareflow?",
                            answer: "Para asuntos legales, términos de servicio o disputas, puede contactarnos en support@shareflow.me. Nuestro equipo legal responderá dentro de 48 horas hábiles.",
                            category: "Contacto Legal"
                          }
                        ].map((faq, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleFaq(index)}
                              className="w-full p-4 text-left hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-purple-600 font-bold text-xs">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full whitespace-nowrap">
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
                      
                      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Scale className="w-5 h-5 text-purple-600" />
                          <h4 className="text-base font-semibold text-purple-900">¿Necesita asistencia legal?</h4>
                        </div>
                        <p className="text-purple-800 text-sm mb-4">
                          Si tiene preguntas adicionales sobre nuestros términos de servicio o necesita clarificación sobre aspectos legales específicos, 
                          nuestro equipo legal está disponible para ayudarle.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a 
                            href="mailto:support@shareflow.me" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            Contactar Soporte Legal
                          </a>
                          <a 
                            href="/advertising-policies" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Ver Políticas de Publicidad
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contacto" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contacto e Información Legal</h2>
                        <p className="text-gray-600">Shareflow LLC - Delaware</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Información Corporativa</h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Shareflow LLC</p>
                                <p className="text-sm text-gray-600">Delaware, Estados Unidos</p>
                                <p className="text-xs text-gray-500">Sociedad de responsabilidad limitada</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">support@shareflow.me</p>
                                <p className="text-xs text-gray-500">Soporte general, asuntos legales y asistencia técnica</p>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Recursos Adicionales</h4>
                              <p className="text-xs text-blue-800">
                                • <a href="/advertising-policies" className="text-blue-700 hover:text-blue-900 underline font-medium">Políticas de Publicidad</a> - Estándares detallados de contenido COOH<br/>
                                • <a href="/terms-of-service" className="text-blue-700 hover:text-blue-900 underline font-medium">Términos de Uso</a> - Marco legal completo de la plataforma
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Actualizaciones</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Última Actualización</h4>
                            <p className="text-xs text-gray-700 mb-3">
                              Estos términos fueron actualizados por última vez el 22 de junio de 2025. 
                              Las modificaciones entran en vigencia inmediatamente tras su publicación.
                            </p>
                            <p className="text-xs text-gray-600">
                              El uso continuado de nuestros servicios constituye aceptación de los términos actualizados.
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
          className={`fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </>
  );
} 