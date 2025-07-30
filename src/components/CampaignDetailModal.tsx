import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Info, Users, Calendar, Target, Gift, 
  Shield, Clock, DollarSign, TrendingUp, 
  CheckCircle, AlertTriangle, Percent, 
  Award, Heart, Sparkles
} from 'lucide-react';
import type { WalletCampaign } from '../services/walletCampaignService';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: WalletCampaign | null;
  userType: 'new' | 'returning';
  userLevel: string;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = memo(({
  isOpen,
  onClose,
  campaign,
  userType,
  userLevel
}) => {
  if (!isOpen || !campaign) return null;

  // Calcular información específica de la campaña
  const now = new Date();
  const endDate = new Date(campaign.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const progress = campaign.usageLimit ? (campaign.usageCount / campaign.usageLimit) * 100 : 0;

  // Formatear términos y condiciones para display
  const formatTermsAndConditions = (terms: string) => {
    return terms.split('\n').map((line, index) => {
      // Headers con **
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-sm">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }
      
      // Items con •
      if (line.startsWith('• ')) {
        return (
          <li key={index} className="text-gray-700 text-sm mb-1 ml-4">
            {line.substring(2)}
          </li>
        );
      }
      
      // Items con **texto**:
      if (line.includes('**') && line.includes(':')) {
        const parts = line.split('**');
        return (
          <p key={index} className="text-gray-700 text-sm mb-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      
      // Texto en cursiva
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return (
          <p key={index} className="text-blue-600 text-sm italic text-center mt-4 font-medium">
            {line.replace(/\*/g, '')}
          </p>
        );
      }
      
      // Líneas vacías o texto normal
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      return (
        <p key={index} className="text-gray-700 text-sm mb-2">
          {line}
        </p>
      );
    });
  };

  // Determinar bonificación específica para el usuario
  const getUserSpecificBonus = () => {
    if (campaign.id === 'campaign-relanzamiento-2024') {
      const baseBonus = userType === 'new' ? 10 : 15;
      let levelBonus = 0;
      
      switch (userLevel) {
        case 'Visionario':
          levelBonus = 5;
          break;
        case 'Maestro Creativo':
          levelBonus = 8;
          break;
        case 'Gran Estratega':
          levelBonus = 10;
          break;
      }
      
      return {
        baseBonus,
        levelBonus,
        totalBonus: baseBonus + levelBonus
      };
    }
    
    return {
      baseBonus: campaign.value,
      levelBonus: 0,
      totalBonus: campaign.value
    };
  };

  const bonusInfo = getUserSpecificBonus();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = () => {
    if (daysRemaining <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (daysRemaining <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: '100%', scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: '100%', scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white w-full sm:max-w-2xl sm:w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-start gap-4">
              <div className="text-4xl">{campaign.icon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{campaign.name}</h2>
                <p className="text-blue-100 text-sm mb-4">{campaign.description}</p>
                
                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Último día'}
                  </div>
                  <div className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-medium">
                    <Users className="w-3 h-3 inline mr-1" />
                    {campaign.usageCount}/{campaign.usageLimit || '∞'} usos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tu Beneficio Personalizado */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Tu Beneficio Personalizado</h3>
                  <p className="text-green-700 text-sm">Como usuario {userType === 'new' ? 'nuevo' : 'anterior'} - Nivel {userLevel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Bonus base</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">+{bonusInfo.baseBonus}%</div>
                </div>

                {bonusInfo.levelBonus > 0 && (
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Bonus nivel</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">+{bonusInfo.levelBonus}%</div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-center">
                <div className="text-lg font-bold">Bonus Total: +{bonusInfo.totalBonus}%</div>
                <div className="text-green-100 text-sm">
                  En una recarga de {formatCurrency(500000)} obtienes +{formatCurrency(500000 * bonusInfo.totalBonus / 100)} extra
                </div>
              </div>
            </div>

            {/* Información General */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Recarga mínima</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(campaign.minRecharge)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Bonus máximo</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {campaign.maxBonus ? formatCurrency(campaign.maxBonus) : 'Sin límite'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Vigencia</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Hasta {endDate.toLocaleDateString('es-CO', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {Math.round(progress)}% completado
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Términos y Condiciones</h3>
              </div>

              <div className="prose prose-sm max-w-none">
                {formatTermsAndConditions(campaign.termsAndConditions)}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Información importante</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Los bonus se acreditan automáticamente al completar la recarga</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Tus créditos bonus nunca expiran</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Puedes participar múltiples veces durante la vigencia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Shareflow se reserva el derecho de modificar estos términos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer con información del creador */}
            <div className="text-center text-gray-500 text-xs border-t border-gray-200 pt-4">
              <p>
                Campaña creada por {campaign.createdBy} • 
                {new Date(campaign.createdAt).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  // Aquí se puede agregar lógica para ir directamente a recargar
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                ¡Aprovechar Oferta!
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}); 