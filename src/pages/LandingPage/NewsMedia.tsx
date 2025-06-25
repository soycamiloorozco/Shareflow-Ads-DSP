import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, ExternalLink, Download, Mail, Phone, Globe,
  FileText, Image, Video, Award, TrendingUp, Users,
  Building, Sparkles, ChevronRight, ArrowLeft, Eye,
  Share2, BookOpen, Newspaper, Camera, Monitor
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: 'company' | 'media' | 'product' | 'partnership';
  type: 'announcement' | 'interview' | 'press-release' | 'award' | 'feature';
  readTime?: string;
  externalLink?: string;
  downloadLink?: string;
}

interface MediaContact {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

interface MediaAsset {
  title: string;
  description: string;
  type: 'images' | 'videos' | 'logos' | 'documents';
  downloadLink: string;
  preview?: string;
}

export function NewsMedia() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'company' | 'media'>('all');

  const companyNews: NewsItem[] = [
    {
      id: '1',
      title: 'Shareflow lanza su plataforma de publicidad programática DOOH',
      excerpt: 'Nueva plataforma revoluciona el acceso a pantallas digitales con IA y reserva instantánea para marcas y creadores en Colombia.',
      date: '2024-01-15',
      category: 'company',
      type: 'announcement',
      readTime: '3 min',
      downloadLink: '/press/shareflow-launch-2024.pdf'
    },
    {
      id: '2',
      title: 'Shareflow cierra ronda de inversión Serie A de $2.5M USD',
      excerpt: 'Fondos se destinarán a expansión regional y desarrollo de tecnología de inteligencia artificial para optimización de campañas.',
      date: '2024-01-10',
      category: 'company',
      type: 'press-release',
      readTime: '4 min',
      downloadLink: '/press/shareflow-series-a.pdf'
    },
    {
      id: '3',
      title: 'Alianza estratégica con Broadsign para integración CMS',
      excerpt: 'Shareflow se convierte en el primer marketplace colombiano en ofrecer integración nativa con la plataforma líder mundial.',
      date: '2024-01-05',
      category: 'partnership',
      type: 'announcement',
      readTime: '2 min'
    },
    {
      id: '4',
      title: 'Shareflow Ads+ alcanza 150+ pantallas activas en Colombia',
      excerpt: 'La plataforma supera las expectativas con más de 1,000 campañas exitosas y 50+ partners de medios registrados.',
      date: '2023-12-28',
      category: 'company',
      type: 'press-release',
      readTime: '3 min'
    }
  ];

  const mediaNews: NewsItem[] = [
    {
      id: '5',
      title: 'Forbes destaca a Shareflow como startup pionera en DOOH',
      excerpt: '"La democratización de la publicidad exterior está cambiando las reglas del juego", destaca la revista en su edición especial de tecnología.',
      date: '2024-01-12',
      category: 'media',
      type: 'feature',
      readTime: '5 min',
      externalLink: 'https://forbes.com/shareflow-dooh-pioneer'
    },
    {
      id: '6',
      title: 'CEO de Shareflow en entrevista con Semana sobre el futuro del DOOH',
      excerpt: 'Discusión sobre cómo la inteligencia artificial transformará la publicidad exterior en América Latina.',
      date: '2024-01-08',
      category: 'media',
      type: 'interview',
      readTime: '8 min',
      externalLink: 'https://semana.com/shareflow-futuro-dooh'
    },
    {
      id: '7',
      title: 'Shareflow gana premio "Mejor Innovación Publicitaria 2023"',
      excerpt: 'Reconocimiento otorgado por la Asociación Colombiana de Publicidad Digital por su contribución al ecosistema DOOH.',
      date: '2023-12-15',
      category: 'media',
      type: 'award',
      readTime: '3 min',
      externalLink: 'https://acpd.co/premios-2023'
    },
    {
      id: '8',
      title: 'TechCrunch: "Shareflow está revolucionando el DOOH en Latam"',
      excerpt: 'Análisis profundo sobre el impacto de la plataforma en el mercado de publicidad exterior de la región.',
      date: '2023-12-10',
      category: 'media',
      type: 'feature',
      readTime: '6 min',
      externalLink: 'https://techcrunch.com/shareflow-latam-dooh'
    }
  ];

  const mediaContacts: MediaContact[] = [
    {
      name: 'María González',
      title: 'Directora de Comunicaciones',
      email: 'maria.gonzalez@shareflow.me',
      phone: '+57 301 234 5678'
    },
    {
      name: 'Carlos Rodríguez',
      title: 'CEO & Co-fundador',
      email: 'carlos.rodriguez@shareflow.me'
    },
    {
      name: 'Ana Martínez',
      title: 'VP Marketing',
      email: 'ana.martinez@shareflow.me'
    }
  ];

  const mediaAssets: MediaAsset[] = [
    {
      title: 'Logos de Shareflow',
      description: 'Logotipos en diferentes formatos y colores para uso editorial',
      type: 'logos',
      downloadLink: '/media/shareflow-logos.zip'
    },
    {
      title: 'Imágenes de la plataforma',
      description: 'Screenshots de alta resolución del dashboard y marketplace',
      type: 'images',
      downloadLink: '/media/platform-screenshots.zip'
    },
    {
      title: 'Fotos del equipo directivo',
      description: 'Fotografías profesionales de los líderes de Shareflow',
      type: 'images',
      downloadLink: '/media/executive-photos.zip'
    },
    {
      title: 'Videos demostrativos',
      description: 'Contenido audiovisual sobre funcionamiento de la plataforma',
      type: 'videos',
      downloadLink: '/media/demo-videos.zip'
    },
    {
      title: 'Kit de prensa completo',
      description: 'Fact sheet, biografías ejecutivas y recursos adicionales',
      type: 'documents',
      downloadLink: '/media/press-kit.zip'
    }
  ];

  const allNews = [...companyNews, ...mediaNews].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredNews = activeCategory === 'all' ? allNews :
    activeCategory === 'company' ? companyNews : mediaNews;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <Link to="/partners-landing" className="text-gray-300 hover:text-white transition-colors">
                Partners
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-2 bg-[#353FEF]/10 rounded-full text-sm font-medium text-[#353FEF] mb-6">
              <Newspaper className="w-4 h-4 inline mr-2" />
              NOTICIAS Y MEDIOS
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              News & Media
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Mantente al día con las últimas noticias de Shareflow, cobertura mediática 
              y recursos para periodistas y creadores de contenido.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
              {[
                { key: 'all', label: 'Todas las noticias', count: allNews.length },
                { key: 'company', label: 'Noticias de Shareflow', count: companyNews.length },
                { key: 'media', label: 'Shareflow en los medios', count: mediaNews.length }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveCategory(filter.key as any)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === filter.key
                      ? 'bg-[#353FEF] text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 text-sm opacity-70">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Últimas Noticias</h2>
            <p className="text-gray-300">Actualizaciones recientes sobre Shareflow y el mercado DOOH</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.slice(0, 6).map((news, index) => (
              <motion.article
                key={news.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[#353FEF] uppercase tracking-wide font-medium">
                    {news.category === 'company' ? 'Shareflow' : 'En los medios'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(news.date)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {news.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {news.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{news.type.replace('-', ' ')}</span>
                    {news.readTime && (
                      <>
                        <span>•</span>
                        <span>{news.readTime}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {news.downloadLink && (
                      <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Download className="w-4 h-4 text-gray-300" />
                      </button>
                    )}
                    {news.externalLink && (
                      <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                        <ExternalLink className="w-4 h-4 text-gray-300" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contacts */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Contactos de medios</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Para consultas de prensa, entrevistas o información adicional, 
              contáctanos directamente con nuestro equipo de comunicaciones.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mediaContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#353FEF] to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{contact.name}</h3>
                <p className="text-[#353FEF] font-medium mb-4">{contact.title}</p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Recursos multimedia</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Descarga logos, imágenes, videos y otros recursos para uso editorial 
              en artículos, presentaciones y contenido sobre Shareflow.
            </p>
            <button className="mt-6 px-6 py-3 bg-[#353FEF] text-white font-semibold rounded-xl hover:bg-[#2929d4] transition-colors inline-flex items-center gap-2">
              <Download className="w-5 h-5" />
              Descargar todo
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaAssets.map((asset, index) => {
              const getAssetIcon = (type: string) => {
                switch (type) {
                  case 'images': return Image;
                  case 'videos': return Video;
                  case 'logos': return Sparkles;
                  case 'documents': return FileText;
                  default: return FileText;
                }
              };
              
              const AssetIcon = getAssetIcon(asset.type);
              
              return (
                <motion.div
                  key={asset.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <AssetIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {asset.title}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">{asset.type}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{asset.description}</p>
                  
                  <button className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Descargar .zip
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#353FEF]/20 to-cyan-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#353FEF]/20 rounded-full text-sm font-medium text-[#353FEF] mb-6">
              <Share2 className="w-4 h-4" />
              COMPARTE NUESTRA HISTORIA
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Quieres cubrir Shareflow?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Estamos disponibles para entrevistas, demostraciones de producto 
              y colaboraciones editoriales sobre el futuro del DOOH.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:prensa@shareflow.me"
                className="px-8 py-4 bg-[#353FEF] text-white font-semibold rounded-xl hover:bg-[#2929d4] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contactar prensa
              </a>
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Ver plataforma
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 