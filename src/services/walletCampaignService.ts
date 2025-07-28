// Servicio para manejar campañas de wallet
export interface WalletCampaign {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  startDate: string;
  endDate: string;
  targetUsers: 'all' | 'new' | 'returning' | 'vip';
  minRecharge: number;
  maxBonus?: number;
  usageLimit?: number;
  usageCount: number;
  termsAndConditions: string;
  createdAt: string;
  createdBy: string;
  icon: string;
}

// Mock data similar al de BonusManagement pero actualizado
const mockWalletCampaigns: WalletCampaign[] = [
  {
    id: 'campaign-relanzamiento-2024',
    name: 'RE LANZAMIENTO',
    description: '¡Volvimos y queremos hacerte brillar más que nunca! Obtén hasta 15% adicional en tus recargas.',
    type: 'percentage',
    value: 15,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
    targetUsers: 'all',
    minRecharge: 100000,
    maxBonus: 500000,
    usageLimit: 1000,
    usageCount: 347,
    termsAndConditions: `**TÉRMINOS Y CONDICIONES - CAMPAÑA RE LANZAMIENTO 2024**

**1. VIGENCIA Y APLICABILIDAD**
• Campaña válida desde el ${new Date().toLocaleDateString('es-CO')} hasta el ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}
• Aplica para todos los usuarios de la plataforma Shareflow Ads
• No acumulable con otras promociones salvo bonificaciones por nivel de usuario

**2. BONIFICACIONES DISPONIBLES**
• **Usuarios Nuevos**: 10% adicional en su primera recarga
• **Usuarios Anteriores**: 15% adicional en todas las recargas
• **Nivel Visionario**: +5% adicional (total 20%)
• **Nivel Maestro Creativo**: +8% adicional (total 23%)
• **Nivel Gran Estratega**: +10% adicional (total 25%)

**3. CONDICIONES DE PARTICIPACIÓN**
• Recarga mínima de $100.000 COP
• Bonificación máxima por transacción: $500.000 COP
• Límite de 1.000 participaciones totales en la campaña
• Un usuario puede participar múltiples veces durante la vigencia

**4. PROCESO DE BONIFICACIÓN**
• El bonus se acredita automáticamente al completar la recarga
• Los créditos bonus aparecen inmediatamente en el wallet
• No aplica para recargas realizadas antes del inicio de la campaña

**5. USO DE LOS CRÉDITOS BONUS**
• Los créditos bonus no tienen fecha de vencimiento
• Pueden usarse en cualquier producto de Shareflow (Ads, Marketplace, Pixel)
• No son transferibles entre cuentas
• No son canjeables por dinero en efectivo

**6. EXCLUSIONES Y LIMITACIONES**
• No aplica para recargas mediante códigos promocionales de terceros
• Shareflow se reserva el derecho de suspender la campaña en cualquier momento
• En caso de uso fraudulento, Shareflow puede revertir las bonificaciones

**7. SOPORTE Y CONSULTAS**
• Para dudas: soporte@shareflow.com
• WhatsApp: +57 300 123 4567
• Chat en vivo disponible 24/7 en la plataforma

**8. ACEPTACIÓN DE TÉRMINOS**
• Al participar en la campaña, el usuario acepta estos términos
• Cualquier disputa se resolverá según la legislación colombiana
• Shareflow se reserva el derecho de modificar estos términos con previo aviso

*¡Aprovecha esta oportunidad única de potenciar tu creatividad con Shareflow!*`,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Marketing Team',
    icon: '🚀'
  },
  {
    id: 'campaign-navidad-2024',
    name: 'NAVIDAD MÁGICA',
    description: 'Ilumina la Navidad con creatividad. Bonus especial del 20% en diciembre.',
    type: 'percentage',
    value: 20,
    status: 'scheduled',
    startDate: '2024-12-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z',
    targetUsers: 'all',
    minRecharge: 200000,
    maxBonus: 1000000,
    usageLimit: 500,
    usageCount: 0,
    termsAndConditions: `**TÉRMINOS Y CONDICIONES - CAMPAÑA NAVIDAD MÁGICA 2024**

**1. VIGENCIA**
• Del 1 al 31 de diciembre de 2024
• Promoción especial de temporada navideña

**2. BONIFICACIONES**
• 20% adicional en todas las recargas
• Recarga mínima: $200.000 COP
• Bonus máximo: $1.000.000 COP por transacción

**3. BENEFICIOS ADICIONALES**
• Acceso prioritario a pantallas premium en fechas navideñas
• Plantillas navideñas gratuitas para campañas
• Soporte especializado durante temporada alta

**4. CONDICIONES ESPECIALES**
• Válido solo durante diciembre 2024
• No acumulable con códigos de descuento externos
• Aplicable a usuarios de todos los niveles`,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Marketing Team',
    icon: '🎄'
  }
];

class WalletCampaignService {
  // Obtener todas las campañas
  getAllCampaigns(): WalletCampaign[] {
    return mockWalletCampaigns;
  }

  // Obtener campaña activa actual
  getActiveCampaign(): WalletCampaign | null {
    const now = new Date();
    const activeCampaigns = mockWalletCampaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      return (
        campaign.status === 'active' &&
        now >= startDate &&
        now <= endDate &&
        (!campaign.usageLimit || campaign.usageCount < campaign.usageLimit)
      );
    });

    // Retornar la primera campaña activa (o la más reciente)
    return activeCampaigns.length > 0 ? activeCampaigns[0] : null;
  }

  // Obtener campaña por ID
  getCampaignById(id: string): WalletCampaign | null {
    return mockWalletCampaigns.find(campaign => campaign.id === id) || null;
  }

  // Validar si el usuario califica para la campaña
  validateUserForCampaign(
    campaign: WalletCampaign, 
    userType: 'new' | 'returning',
    userLevel: string = 'Creador'
  ): boolean {
    // Validar tipo de usuario
    if (campaign.targetUsers !== 'all') {
      if (campaign.targetUsers === 'new' && userType !== 'new') return false;
      if (campaign.targetUsers === 'returning' && userType !== 'returning') return false;
      if (campaign.targetUsers === 'vip' && !['Maestro Creativo', 'Gran Estratega'].includes(userLevel)) return false;
    }

    // Validar vigencia
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now < startDate || now > endDate) return false;

    // Validar límite de uso
    if (campaign.usageLimit && campaign.usageCount >= campaign.usageLimit) return false;

    return true;
  }

  // Calcular bonus para un monto específico
  calculateBonus(
    campaign: WalletCampaign, 
    amount: number, 
    userType: 'new' | 'returning' = 'returning'
  ): number {
    if (amount < campaign.minRecharge) return 0;

    let bonus = 0;
    
    if (campaign.type === 'percentage') {
      // Aplicar diferentes porcentajes según tipo de usuario
      let percentage = campaign.value;
      
      // Ajustar porcentaje según tipo de usuario para la campaña específica
      if (campaign.id === 'campaign-relanzamiento-2024') {
        percentage = userType === 'new' ? 10 : 15;
      }
      
      bonus = Math.floor((amount * percentage) / 100);
    } else {
      bonus = campaign.value;
    }

    // Aplicar límite máximo si existe
    if (campaign.maxBonus) {
      bonus = Math.min(bonus, campaign.maxBonus);
    }

    return bonus;
  }

  // Obtener días restantes de la campaña
  getDaysRemaining(campaign: WalletCampaign): number {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Obtener progreso de la campaña (porcentaje de uso)
  getCampaignProgress(campaign: WalletCampaign): number {
    if (!campaign.usageLimit) return 0;
    return Math.min((campaign.usageCount / campaign.usageLimit) * 100, 100);
  }

  // Simular incremento de uso de campaña (en producción sería una llamada a API)
  async incrementCampaignUsage(campaignId: string): Promise<void> {
    const campaign = mockWalletCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.usageCount += 1;
    }
  }

  // Formatear términos y condiciones para mostrar
  formatTermsAndConditions(campaign: WalletCampaign): string {
    return campaign.termsAndConditions;
  }

  // Obtener texto del bonus personalizado según la campaña
  getBonusDisplayText(campaign: WalletCampaign, userType: 'new' | 'returning' = 'returning'): string {
    if (campaign.id === 'campaign-relanzamiento-2024') {
      const percentage = userType === 'new' ? 10 : 15;
      return `Hasta +${percentage}% bonus`;
    }
    
    if (campaign.type === 'percentage') {
      return `+${campaign.value}% bonus`;
    } else {
      return `+${new Intl.NumberFormat('es-CO').format(campaign.value)} créditos`;
    }
  }
}

// Instancia singleton del servicio
export const walletCampaignService = new WalletCampaignService();

// Hook personalizado para usar en componentes React
export function useWalletCampaigns() {
  const getAllCampaigns = () => walletCampaignService.getAllCampaigns();
  const getActiveCampaign = () => walletCampaignService.getActiveCampaign();
  const getCampaignById = (id: string) => walletCampaignService.getCampaignById(id);
  
  return {
    getAllCampaigns,
    getActiveCampaign,
    getCampaignById,
    validateUserForCampaign: walletCampaignService.validateUserForCampaign.bind(walletCampaignService),
    calculateBonus: walletCampaignService.calculateBonus.bind(walletCampaignService),
    getDaysRemaining: walletCampaignService.getDaysRemaining.bind(walletCampaignService),
    getCampaignProgress: walletCampaignService.getCampaignProgress.bind(walletCampaignService),
    incrementCampaignUsage: walletCampaignService.incrementCampaignUsage.bind(walletCampaignService),
    formatTermsAndConditions: walletCampaignService.formatTermsAndConditions.bind(walletCampaignService),
    getBonusDisplayText: walletCampaignService.getBonusDisplayText.bind(walletCampaignService)
  };
} 