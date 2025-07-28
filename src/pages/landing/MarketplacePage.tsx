import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ArrowRight, Filter, Eye } from 'lucide-react';

export function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Shareflow" 
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="px-4 py-2 text-white/90 hover:text-white font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link 
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Empezar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium text-white mb-8 shadow-xl">
              <Search className="w-4 h-4 text-pink-300" />
              <span>Marketplace Digital</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Encuentra la Pantalla
              <span className="block bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
                Perfecta
              </span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8">
              Explora más de 150 pantallas digitales estratégicamente ubicadas. 
              Filtra por ubicación, audiencia, precio y disponibilidad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <Search className="w-5 h-5" />
                    Explorar Pantallas
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Ubicaciones Estratégicas",
                description: "Pantallas en centros comerciales, universidades, estadios y zonas de alto tráfico"
              },
              {
                icon: Filter,
                title: "Filtros Inteligentes",
                description: "Encuentra exactamente lo que buscas con filtros por precio, audiencia y ubicación"
              },
              {
                icon: Star,
                title: "Calidad Garantizada",
                description: "Todas nuestras pantallas están verificadas y mantienen altos estándares de calidad"
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Comienza a explorar ahora
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Accede a nuestro marketplace completo y encuentra la pantalla perfecta para tu mensaje
            </p>
            <Link to="/marketplace">
              <button className="px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                Ver Todas las Pantallas
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 