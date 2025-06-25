import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ArrowUp, Shield, Users, FileText, AlertTriangle, CheckCircle, Globe, Lock, Calendar, Clock, Eye, ChevronDown, Scale, Heart, Building, Zap, Target, BookOpen, UserCheck, CreditCard, Database, HelpCircle, BarChart, XCircle, Mail, Phone, Bot, MapPin, Info } from 'lucide-react';

export function PrivacyPolicy() {
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
      id: 'information-collection',
      title: 'Información que Recopilamos',
      icon: Database,
      description: 'Tipos de datos personales y de uso'
    },
    {
      id: 'information-use',
      title: 'Cómo Utilizamos su Información',
      icon: Target,
      description: 'Propósitos y bases legales del procesamiento'
    },
    {
      id: 'information-sharing',
      title: 'Compartir Información',
      icon: Users,
      description: 'Terceros y transferencias de datos'
    },
    {
      id: 'data-security',
      title: 'Seguridad de Datos',
      icon: Shield,
      description: 'Medidas de protección y encriptación'
    },
    {
      id: 'user-rights',
      title: 'Sus Derechos',
      icon: Scale,
      description: 'Acceso, corrección y eliminación'
    },
    {
      id: 'international-transfers',
      title: 'Transferencias Internacionales',
      icon: Globe,
      description: 'Salvaguardias y adecuación'
    },
    {
      id: 'retention',
      title: 'Retención de Datos',
      icon: Clock,
      description: 'Períodos y criterios de retención'
    },
    {
      id: 'children',
      title: 'Información de Menores',
      icon: Heart,
      description: 'Protección de usuarios menores de edad'
    },
    {
      id: 'changes',
      title: 'Cambios a esta Política',
      icon: FileText,
      description: 'Actualizaciones y notificaciones'
    },
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      icon: HelpCircle,
      description: 'Respuestas a consultas comunes sobre privacidad'
    },
    {
      id: 'contact',
      title: 'Contacto y DPO',
      icon: Building,
      description: 'Información legal y oficial de privacidad'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Política de Privacidad | Shareflow - Protección de Datos COOH</title>
        <meta name="description" content="Política de privacidad de Shareflow LLC. Protección robusta de datos personales en nuestra plataforma COOH (Connected Out-of-Home) democratizada." />
        <meta name="keywords" content="política de privacidad, Shareflow LLC, GDPR, CCPA, protección de datos, privacidad COOH, datos personales" />
        <link rel="canonical" href="https://shareflow.com/privacy-policy" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Política de Privacidad | Shareflow" />
        <meta property="og:description" content="Política de privacidad de Shareflow LLC. Protección robusta de datos en plataforma COOH democratizada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shareflow.com/privacy-policy" />
        <meta property="og:image" content="https://shareflow.com/og-privacy.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Política de Privacidad | Shareflow" />
        <meta name="twitter:description" content="Política de privacidad de Shareflow LLC. Protección de datos COOH." />
        
        {/* Enhanced Schema.org structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "LegalDocument"],
            "name": "Política de Privacidad - Shareflow DOOH",
            "headline": "Política de Privacidad Completa para Plataforma DOOH",
            "description": "Política de privacidad completa de Shareflow LLC, plataforma líder de Connected Out-of-Home (DOOH) en Colombia. Protección de datos GDPR y CCPA compliant.",
            "url": "https://shareflow.com/privacy-policy",
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
                  "name": "¿Qué información personal recopila Shareflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Recopilamos información personal que nos proporciona directamente como nombre, email, teléfono, información de facturación, datos de empresa, información de uso de la plataforma, datos de campañas publicitarias y cookies para mejorar nuestros servicios DOOH."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo protege Shareflow mis datos personales?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Implementamos medidas de seguridad técnicas, administrativas y físicas incluyendo encriptación SSL/TLS, servidores seguros, acceso restringido y cumplimiento con estándares GDPR y CCPA para proteger su información personal."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Puedo solicitar la eliminación de mis datos?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, tiene derecho a solicitar la eliminación de su información personal. Puede hacerlo contactando a nuestro DPO en dpo@shareflow.me o a través de la configuración de su cuenta."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Shareflow transfiere datos internacionalmente?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, podemos transferir datos a países con decisiones de adecuación de la UE o utilizando salvaguardias apropiadas como cláusulas contractuales estándar para proteger su información."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo contacto al Oficial de Protección de Datos?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Puede contactar a nuestro DPO en dpo@shareflow.me para consultas específicas sobre protección de datos, ejercicio de derechos GDPR y solicitudes de eliminación de datos."
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
                  "name": "Política de Privacidad",
                  "item": "https://shareflow.com/privacy-policy"
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
        <meta name="subject" content="Política de Privacidad DOOH" />
        <meta name="copyright" content="Shareflow LLC" />
        <meta name="language" content="ES" />
        <meta name="revised" content="2025-01-15" />
        <meta name="abstract" content="Política de privacidad completa para la plataforma DOOH líder en Colombia" />
        <meta name="topic" content="Privacidad, GDPR, Protección de Datos, DOOH" />
        <meta name="summary" content="Política de privacidad de Shareflow, plataforma Connected Out-of-Home" />
        <meta name="classification" content="Legal Document" />
        <meta name="author" content="Shareflow Legal Team" />
        <meta name="designer" content="Shareflow LLC" />
        <meta name="reply-to" content="privacy@shareflow.me" />
        <meta name="owner" content="Shareflow LLC" />
        <meta name="url" content="https://shareflow.com/privacy-policy" />
        <meta name="identifier-URL" content="https://shareflow.com/privacy-policy" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Legal, Privacy, DOOH" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="es" href="https://shareflow.com/es/privacy-policy" />
        <link rel="alternate" hrefLang="en" href="https://shareflow.com/en/privacy-policy" />
        <link rel="alternate" hrefLang="x-default" href="https://shareflow.com/privacy-policy" />
        
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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZwcZ29lIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="max-w-7xl mx-auto px-4 py-20 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Política de Privacidad</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Política de Privacidad
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent"> Shareflow</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                En Shareflow, respetamos su privacidad y nos comprometemos a proteger su información personal. 
                Esta política explica cómo recopilamos, utilizamos y protegemos sus datos en nuestra plataforma COOH 
                democratizada, donde cada persona puede brillar mientras mantenemos la máxima seguridad de sus datos.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Última actualización: 15 de enero de 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>GDPR y CCPA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Transparencia total</span>
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
                    <p className="text-sm text-gray-600">Navega rápidamente por nuestra política</p>
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
              {/* Information Collection */}
              <section id="information-collection" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Información que Recopilamos</h2>
                        <p className="text-gray-600">Tipos de datos personales y de uso</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid gap-4 mb-6">
                        {[
                          {
                            title: 'Información Personal',
                            content: 'Recopilamos información personal que nos proporciona directamente, como nombre, dirección de email, número de teléfono, información de facturación y datos de la empresa cuando se registra para usar nuestros servicios.',
                            color: 'green'
                          },
                          {
                            title: 'Información de Uso',
                            content: 'Recopilamos automáticamente información sobre cómo utiliza nuestra plataforma, incluyendo direcciones IP, tipo de navegador, páginas visitadas, tiempo de permanencia y patrones de navegación.',
                            color: 'blue'
                          },
                          {
                            title: 'Datos de Campañas',
                            content: 'Almacenamos información sobre sus campañas publicitarias, creatividades, configuraciones de audiencia, presupuestos y métricas de rendimiento para proporcionarle nuestros servicios.',
                            color: 'purple'
                          },
                          {
                            title: 'Cookies y Tecnologías Similares',
                            content: 'Utilizamos cookies, web beacons y tecnologías similares para mejorar la funcionalidad de nuestro sitio web, personalizar su experiencia y analizar el uso de nuestros servicios.',
                            color: 'amber'
                          }
                        ].map((item, index) => (
                          <div key={index} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-4`}>
                            <div className="flex items-center gap-3 mb-3">
                              <CheckCircle className={`w-5 h-5 text-${item.color}-600`} />
                              <h3 className={`text-base font-semibold text-${item.color}-900`}>{item.title}</h3>
                            </div>
                            <p className={`text-${item.color}-800 text-sm`}>{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Use */}
              <section id="information-use" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Cómo Utilizamos su Información</h2>
                        <p className="text-gray-600">Propósitos y bases legales del procesamiento</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            title: 'Prestación de Servicios',
                            content: 'Utilizamos su información para proporcionar, mantener y mejorar nuestros servicios de marketplace de pantallas digitales, procesar transacciones y brindar soporte al cliente.'
                          },
                          {
                            title: 'Comunicaciones',
                            content: 'Podemos enviarle emails relacionados con el servicio, actualizaciones de productos, newsletters y comunicaciones promocionales. Puede optar por no recibir comunicaciones promocionales en cualquier momento.'
                          },
                          {
                            title: 'Análisis y Mejoras',
                            content: 'Analizamos cómo se utilizan nuestros servicios para identificar tendencias, mejorar la funcionalidad y desarrollar nuevas características para nuestra plataforma.'
                          },
                          {
                            title: 'Cumplimiento Legal',
                            content: 'Podemos utilizar su información para cumplir con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.'
                          }
                        ].map((item, index) => (
                          <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="text-base font-semibold text-purple-900 mb-2">{item.title}</h3>
                            <p className="text-purple-800 text-sm">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Compartir Información</h2>
                        <p className="text-gray-600">Terceros y transferencias de datos</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid gap-3 mb-6">
                        {[
                          'Partners de Medios: Compartimos información necesaria con nuestros partners propietarios de pantallas para facilitar la ejecución de campañas publicitarias y proporcionar reportes de rendimiento.',
                          'Proveedores de Servicios: Trabajamos con terceros que nos ayudan a operar nuestro negocio, como proveedores de hosting, procesadores de pagos y servicios de análisis. Estos terceros están obligados a proteger su información.',
                          'Cumplimiento Legal: Podemos divulgar su información si es requerido por ley, orden judicial, o para proteger nuestros derechos, propiedad o seguridad, o la de nuestros usuarios.',
                          'Transacciones Comerciales: En caso de fusión, adquisición o venta de activos, su información personal puede ser transferida como parte de esa transacción.'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <p className="text-indigo-800 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Seguridad de Datos</h2>
                        <p className="text-gray-600">Medidas de protección y encriptación</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        {[
                          {
                            icon: Lock,
                            title: 'Medidas de Protección',
                            content: 'Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.'
                          },
                          {
                            icon: Database,
                            title: 'Encriptación',
                            content: 'Utilizamos encriptación SSL/TLS para proteger la transmisión de datos sensibles y almacenamos información confidencial en servidores seguros con acceso restringido.'
                          },
                          {
                            icon: UserCheck,
                            title: 'Acceso Limitado',
                            content: 'El acceso a su información personal está limitado a empleados, contratistas y agentes que necesitan esa información para realizar sus funciones y están sujetos a estrictas obligaciones de confidencialidad.'
                          }
                        ].map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-green-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-green-900">{item.title}</h3>
                              </div>
                              <p className="text-green-800 text-xs">{item.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Rights */}
              <section id="user-rights" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Scale className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sus Derechos</h2>
                        <p className="text-gray-600">Acceso, corrección y eliminación</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid gap-3 mb-6">
                        {[
                          'Acceso y Corrección: Tiene derecho a acceder, actualizar y corregir su información personal. Puede hacerlo a través de la configuración de su cuenta o contactándonos directamente.',
                          'Eliminación: Puede solicitar la eliminación de su información personal, sujeto a ciertas excepciones legales y operativas. Procesaremos estas solicitudes de manera oportuna.',
                          'Portabilidad: Tiene derecho a recibir una copia de su información personal en un formato estructurado y legible por máquina, y a transmitir esos datos a otro controlador.',
                          'Objeción y Restricción: Puede objetar ciertos procesamientos de su información personal y solicitar que restrinjamos el procesamiento en determinadas circunstancias.'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <p className="text-orange-800 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* International Transfers */}
              <section id="international-transfers" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Transferencias Internacionales</h2>
                        <p className="text-gray-600">Salvaguardias y adecuación</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            title: 'Transferencias de Datos',
                            content: 'Su información puede ser transferida y procesada en países distintos al suyo. Implementamos salvaguardias apropiadas para proteger su información en tales transferencias.'
                          },
                          {
                            title: 'Adequacy Decisions',
                            content: 'Cuando transferimos datos a países que no tienen una decisión de adecuación de la UE, utilizamos mecanismos de transferencia apropiados como cláusulas contractuales estándar.'
                          }
                        ].map((item, index) => (
                          <div key={index} className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                            <h3 className="text-base font-semibold text-cyan-900 mb-2">{item.title}</h3>
                            <p className="text-cyan-800 text-sm">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section id="retention" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Retención de Datos</h2>
                        <p className="text-gray-600">Períodos y criterios de retención</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            title: 'Período de Retención',
                            content: 'Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.'
                          },
                          {
                            title: 'Criterios de Retención',
                            content: 'Los criterios utilizados para determinar los períodos de retención incluyen la naturaleza de los datos, los propósitos del procesamiento, y los requisitos legales y reglamentarios aplicables.'
                          }
                        ].map((item, index) => (
                          <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h3 className="text-base font-semibold text-amber-900 mb-2">{item.title}</h3>
                            <p className="text-amber-800 text-sm">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Children's Information */}
              <section id="children" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Información de Menores</h2>
                        <p className="text-gray-600">Protección de usuarios menores de edad</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <h3 className="text-base font-semibold text-pink-900 mb-2">Restricción de Edad</h3>
                        <p className="text-pink-800 text-sm">
                          Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos conscientemente información personal 
                          de menores de 16 años. Si nos enteramos de que hemos recopilado tal información, la eliminaremos prontamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Changes to Policy */}
              <section id="changes" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Cambios a esta Política</h2>
                        <p className="text-gray-600">Actualizaciones y notificaciones</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-blue-900 mb-2">Actualizaciones</h3>
                          <p className="text-blue-800 text-sm">
                            Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios materiales 
                            publicando la nueva política en nuestro sitio web y actualizando la fecha de "Última actualización".
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="text-base font-semibold text-green-900 mb-2">Revisión Regular</h3>
                          <p className="text-green-800 text-sm">
                            Le recomendamos que revise esta política periódicamente para mantenerse informado sobre cómo 
                            protegemos su información.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contacto y DPO</h2>
                        <p className="text-gray-600">Información legal y oficial de privacidad</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Información General</h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Shareflow LLC</p>
                                <p className="text-sm text-gray-600">Calle 72 #10-07, Oficina 801, Bogotá, Colombia</p>
                                <p className="text-xs text-gray-500">Delaware, Estados Unidos</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">privacy@shareflow.me</p>
                                <p className="text-xs text-gray-500">Consultas generales de privacidad</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">+57 1 234 5678</p>
                                <p className="text-xs text-gray-500">Soporte telefónico</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3">Oficial de Protección de Datos</h3>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-3 mb-3">
                              <Shield className="w-5 h-5 text-blue-600" />
                              <h4 className="text-sm font-semibold text-blue-900">DPO</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <p className="text-sm text-blue-800">dpo@shareflow.me</p>
                              </div>
                              <p className="text-xs text-blue-700">
                                Para consultas específicas sobre protección de datos, ejercicio de derechos GDPR, 
                                y solicitudes de eliminación de datos.
                              </p>
                            </div>
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
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes sobre Privacidad</h2>
                        <p className="text-gray-600">Respuestas a las consultas más comunes sobre protección de datos</p>
                      </div>
                    </div>
                    
                    <div className="max-w-none text-sm leading-relaxed">
                      <div className="space-y-4">
                        {[
                          {
                            question: "¿Qué información personal recopila Shareflow?",
                            answer: "Recopilamos información personal que nos proporciona directamente como nombre, email, teléfono, información de facturación, datos de empresa, información de uso de la plataforma, datos de campañas publicitarias y cookies para mejorar nuestros servicios DOOH.",
                            category: "Recopilación de Datos"
                          },
                          {
                            question: "¿Cómo utiliza Shareflow mi información personal?",
                            answer: "Utilizamos su información para proporcionar servicios de marketplace DOOH, procesar transacciones, enviar comunicaciones relacionadas con el servicio, mejorar nuestros productos, cumplir obligaciones legales y personalizar su experiencia en nuestra plataforma Connected Out-of-Home.",
                            category: "Uso de Datos"
                          },
                          {
                            question: "¿Shareflow comparte mi información con terceros?",
                            answer: "Compartimos información únicamente con partners de medios necesarios para ejecutar campañas, proveedores de servicios que nos ayudan a operar el negocio, cuando es requerido por ley, o en transacciones comerciales. Todos están obligados a proteger su información.",
                            category: "Compartir Datos"
                          },
                          {
                            question: "¿Cómo protege Shareflow mis datos personales?",
                            answer: "Implementamos medidas de seguridad técnicas, administrativas y físicas incluyendo encriptación SSL/TLS, servidores seguros con acceso restringido, y cumplimiento con estándares GDPR y CCPA para proteger su información personal.",
                            category: "Seguridad"
                          },
                          {
                            question: "¿Cuáles son mis derechos sobre mis datos personales?",
                            answer: "Tiene derecho a acceder, actualizar, corregir, eliminar, portar y objetar el procesamiento de su información personal. También puede restringir ciertos procesamientos y retirar el consentimiento en cualquier momento.",
                            category: "Derechos del Usuario"
                          },
                          {
                            question: "¿Puedo solicitar la eliminación de mis datos?",
                            answer: "Sí, puede solicitar la eliminación de su información personal contactando a nuestro DPO en dpo@shareflow.me o a través de la configuración de su cuenta. Procesaremos estas solicitudes de manera oportuna, sujeto a excepciones legales.",
                            category: "Eliminación de Datos"
                          },
                          {
                            question: "¿Shareflow transfiere datos internacionalmente?",
                            answer: "Sí, podemos transferir datos a países con decisiones de adecuación de la UE o utilizando salvaguardias apropiadas como cláusulas contractuales estándar para proteger su información durante las transferencias internacionales.",
                            category: "Transferencias Internacionales"
                          },
                          {
                            question: "¿Por cuánto tiempo conserva Shareflow mis datos?",
                            answer: "Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo. Los criterios incluyen la naturaleza de los datos y requisitos legales.",
                            category: "Retención de Datos"
                          },
                          {
                            question: "¿Shareflow recopila información de menores de edad?",
                            answer: "Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos conscientemente información personal de menores de 16 años. Si nos enteramos de que hemos recopilado tal información, la eliminaremos prontamente.",
                            category: "Menores de Edad"
                          },
                          {
                            question: "¿Cómo contacto al Oficial de Protección de Datos?",
                            answer: "Puede contactar a nuestro DPO en dpo@shareflow.me para consultas específicas sobre protección de datos, ejercicio de derechos GDPR y solicitudes de eliminación de datos. También puede contactarnos en privacy@shareflow.me para consultas generales.",
                            category: "Contacto DPO"
                          },
                          {
                            question: "¿Qué cookies utiliza Shareflow?",
                            answer: "Utilizamos cookies esenciales para el funcionamiento del sitio, cookies de rendimiento para analizar el uso, cookies funcionales para recordar preferencias y cookies de marketing para personalizar anuncios. Puede gestionar sus preferencias de cookies en cualquier momento.",
                            category: "Cookies"
                          },
                          {
                            question: "¿Cómo me notifico de cambios en la política de privacidad?",
                            answer: "Le notificaremos sobre cambios materiales publicando la nueva política en nuestro sitio web, actualizando la fecha de 'Última actualización' y enviando notificaciones por email para cambios significativos que afecten sus derechos.",
                            category: "Actualizaciones"
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
                          <Info className="w-5 h-5 text-purple-600" />
                          <h4 className="text-base font-semibold text-purple-900">¿No encuentra su respuesta?</h4>
                        </div>
                        <p className="text-purple-800 text-sm mb-4">
                          Si tiene preguntas adicionales sobre nuestra política de privacidad o el manejo de sus datos personales, 
                          nuestro equipo legal está disponible para ayudarle.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a 
                            href="mailto:privacy@shareflow.me" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            Contactar Equipo Legal
                          </a>
                          <a 
                            href="mailto:dpo@shareflow.me" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors text-sm"
                          >
                            <Shield className="w-4 h-4" />
                            Contactar DPO
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notice */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">Aviso Importante</h3>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      Esta Política de Privacidad puede actualizarse ocasionalmente para reflejar cambios en nuestras 
                      prácticas o por razones operativas, legales o reglamentarias. Le notificaremos sobre cambios 
                      materiales y le recomendamos revisar esta página regularmente.
                    </p>
                  </div>
                </div>
              </div>
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