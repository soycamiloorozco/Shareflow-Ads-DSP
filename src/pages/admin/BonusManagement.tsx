/**
 * BonusManagement.tsx
 * 
 * This component manages wallet campaigns and promotional bonus codes that directly impact
 * user wallet balance by adding bonus funds rather than reducing prices.
 * 
 * WALLET CAMPAIGNS:
 * - Automatic bonus campaigns that trigger based on user recharge amounts
 * - Percentage or fixed amount bonuses added to wallet balance
 * - User segmentation (new, returning, VIP users)
 * - Scheduled campaigns with start/end dates
 * 
 * BONUS CODES:
 * - Manual promotional codes that users can enter during recharge
 * - Custom codes with specific bonus amounts or percentages
 * - Usage limits and expiration dates
 * - Analytics tracking for performance measurement
 * 
 * Both systems add bonus funds to user wallets, increasing their available balance
 * for advertising purchases rather than providing price discounts.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Plus, Search, Filter, MoreHorizontal, 
  Edit, Trash2, Copy, Eye, BarChart3, Users, DollarSign, 
  TrendingUp, Calendar, Clock, Check, Pause, X, Gift, 
  Crown, Zap, Target, 
  
  Rocket, 
  Shuffle,
  TrendingDown, AlertTriangle, Tag, Code, Play, Info, Shield} from 'lucide-react';
import { Button } from '../../components/Button';
import Select from 'react-select';
import { Bonus, useBonus } from '../../hooks/useBonus';

interface UserLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  minSpent: number;
  maxSpent?: number;
  benefits: string[];
  requirements: string[];
  description: string;
}

interface WalletCampaign {
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

interface BonusCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
  targetUsers: 'all' | 'new' | 'returning' | 'vip';
  minRecharge: number;
  maxBonus?: number;
  usageLimit?: number;
  usageCount: number;
  maxUsesPerUser: number;
  termsAndConditions: string;
  createdAt: string;
  createdBy: string;
  icon: string;
  isCustomCode: boolean;
  // Influencer commission configuration
  influencerCommissionType?: 'percentage' | 'fixed' | 'none';
  influencerCommissionValue?: number;
  influencerCommissionNotes?: string;
}

interface CampaignAnalytics {
  id: string;
  totalRecharges: number;
  totalRechargeAmount: number;
  totalBonusGiven: number;
  totalInfluencerCommissions: number;
  uniqueUsers: number;
  averageRechargeAmount: number;
  conversionRate: number;
  costPerAcquisition: number; // CAC real incluyendo bonus y comisiones
  realCAC: number;
  roi: number;
  revenueGenerated: number;
  totalCosts: number; // Bonus + comisiones
  netRevenue: number; // Ingresos - costos
  marginImpact: number; // Impacto en el margen
  topUserSegments: Array<{
    segment: string;
    users: number;
    totalSpent: number;
    bonusGiven: number;
  }>;
}

interface CodeAnalytics {
  id: string;
  totalUses: number;
  totalRechargeAmount: number;
  totalBonusGiven: number;
  totalInfluencerCommissions: number;
  uniqueUsers: number;
  averageRechargeAmount: number;
  influencerCommission?: number;
  costPerUser: number;
  realCostPerUser: number; // Costo real incluyendo bonus y comisiones
  roi: number;
  revenueGenerated: number;
  totalCosts: number; // Bonus + comisiones
  netRevenue: number; // Ingresos - costos
  marginImpact: number; // Impacto en el margen
  usageByDate: Array<{
    date: string;
    uses: number;
    amount: number;
    bonus: number;
    commission: number;
  }>;
}

interface ConsolidatedAnalytics {
  totalCampaigns: number;
  totalCodes: number;
  totalRecharges: number;
  totalRechargeAmount: number;
  totalBonusGiven: number;
  totalInfluencerCommissions: number;
  uniqueUsers: number;
  averageRechargeAmount: number;
  generalCAC: number;
  generalROI: number;
  totalRevenue: number;
  totalCosts: number;
  conversionRate: number;
  topPerformingCampaigns: Array<{
    id: string;
    name: string;
    type: 'campaign' | 'code';
    roi: number;
    revenue: number;
    users: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    costs: number;
    roi: number;
    users: number;
  }>;
}

// User levels data
const userLevels: UserLevel[] = [
  {
    id: 1,
    name: 'Novato',
    icon: '🌱',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    minSpent: 0,
    maxSpent: 500000,
    benefits: [
      'Acceso básico a la plataforma',
      'Soporte por chat',
      'Bonus de bienvenida del 10%'
    ],
    requirements: [
      'Completar registro',
      'Verificar email'
    ],
    description: 'Nivel inicial para nuevos usuarios. Perfecto para comenzar tu experiencia en Shareflow.'
  },
  {
    id: 2,
    name: 'Explorador',
    icon: '🔍',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    minSpent: 500000,
    maxSpent: 2000000,
    benefits: [
      'Bonus de recarga del 15%',
      'Acceso a eventos especiales',
      'Soporte prioritario',
      'Descuentos en comisiones'
    ],
    requirements: [
      'Gastar mínimo $500,000 COP',
      'Completar perfil al 100%',
      'Realizar al menos 5 transacciones'
    ],
    description: 'Para usuarios que están explorando activamente la plataforma y sus beneficios.'
  },
  {
    id: 3,
    name: 'Aventurero',
    icon: '⚡',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    minSpent: 2000000,
    maxSpent: 5000000,
    benefits: [
      'Bonus de recarga del 20%',
      'Acceso VIP a eventos',
      'Cashback del 2%',
      'Límites de transacción aumentados',
      'Asesor personal'
    ],
    requirements: [
      'Gastar mínimo $2,000,000 COP',
      'Mantener actividad mensual',
      'Referir al menos 3 amigos'
    ],
    description: 'Nivel intermedio con beneficios mejorados para usuarios comprometidos.'
  },
  {
    id: 4,
    name: 'Maestro',
    icon: '🎯',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    minSpent: 5000000,
    maxSpent: 10000000,
    benefits: [
      'Bonus de recarga del 25%',
      'Acceso exclusivo a beta features',
      'Cashback del 3%',
      'Comisiones reducidas al 50%',
      'Invitaciones a eventos exclusivos',
      'Soporte 24/7'
    ],
    requirements: [
      'Gastar mínimo $5,000,000 COP',
      'Mantener nivel por 3 meses consecutivos',
      'Participar en la comunidad'
    ],
    description: 'Nivel avanzado con beneficios premium y acceso exclusivo.'
  },
  {
    id: 5,
    name: 'Leyenda',
    icon: '👑',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    minSpent: 10000000,
    benefits: [
      'Bonus de recarga del 30%',
      'Acceso completo a todas las funciones',
      'Cashback del 5%',
      'Sin comisiones',
      'Concierge personal',
      'Eventos exclusivos VIP',
      'Programa de recompensas personalizado'
    ],
    requirements: [
      'Gastar mínimo $10,000,000 COP',
      'Ser embajador de la marca',
      'Mantener excelente reputación'
    ],
    description: 'El nivel más alto reservado para nuestros usuarios más valiosos y leales.'
  }
];

// Mock data for wallet campaigns
const mockCampaigns: WalletCampaign[] = [
  {
    id: '1',
    name: 'RE LANZAMIENTO',
    description: '¡Volvimos y queremos hacerte brillar más que nunca!',
    type: 'percentage',
    value: 25,
    status: 'active',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    targetUsers: 'returning',
    minRecharge: 100000,
    maxBonus: 2000000,
    usageLimit: 1000,
    usageCount: 245,
    termsAndConditions: `TÉRMINOS Y CONDICIONES - CAMPAÑA RE LANZAMIENTO

• Esta campaña es válida únicamente para usuarios que ya tenían cuenta en Shareflow antes del 1 de diciembre de 2024.
• El bonus del 25% se aplicará automáticamente al momento de realizar la primera recarga durante el período de la campaña.
• Recarga mínima requerida: $100,000 COP.
• Bonus máximo por usuario: $2,000,000 COP.
• Válido únicamente del 1 al 31 de diciembre de 2024.
• Limitado a una (1) recarga por usuario durante toda la campaña.
• El bonus se acreditará inmediatamente después de confirmar el pago.
• Esta promoción no es acumulable con otros códigos promocionales.
• Shareflow se reserva el derecho de modificar o cancelar esta campaña en cualquier momento sin previo aviso.
• En caso de disputas, la decisión de Shareflow será final.
• Aplican términos y condiciones generales de uso de la plataforma.`,
    createdAt: '2024-11-15',
    createdBy: 'admin@shareflow.me',
    icon: '🚀'
  },
  {
    id: '2',
    name: 'BIENVENIDA NUEVOS',
    description: 'Bonus especial para nuevos usuarios',
    type: 'percentage',
    value: 15,
    status: 'inactive',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    targetUsers: 'new',
    minRecharge: 100000,
    maxBonus: 1000000,
    usageCount: 89,
    termsAndConditions: `TÉRMINOS Y CONDICIONES - BIENVENIDA NUEVOS USUARIOS

• Esta campaña es exclusiva para usuarios que se registren en Shareflow a partir del 1 de diciembre de 2024.
• El bonus del 15% se aplicará automáticamente en la primera recarga del usuario.
• Recarga mínima requerida: $100,000 COP.
• Bonus máximo por usuario: $1,000,000 COP.
• Válido únicamente del 1 al 31 de diciembre de 2024.
• Limitado a una (1) recarga por usuario nuevo.
• El usuario debe completar el proceso de verificación de cuenta antes de aplicar el bonus.
• El bonus se acreditará inmediatamente después de confirmar el pago.
• Esta promoción no es acumulable con códigos promocionales.
• Shareflow se reserva el derecho de verificar la elegibilidad del usuario.
• En caso de cuentas duplicadas o fraudulentas, se anulará el bonus.
• Aplican términos y condiciones generales de uso de la plataforma.`,
    createdAt: '2024-11-15',
    createdBy: 'admin@shareflow.me',
    icon: '🎉'
  },
  {
    id: '3',
    name: 'BLACK FRIDAY',
    description: 'Mega bonus por tiempo limitado',
    type: 'percentage',
    value: 50,
    status: 'expired',
    startDate: '2024-11-24',
    endDate: '2024-11-26',
    targetUsers: 'all',
    minRecharge: 500000,
    maxBonus: 5000000,
    usageLimit: 500,
    usageCount: 487,
    termsAndConditions: 'Válido solo durante el Black Friday. Máximo un uso por usuario.',
    createdAt: '2024-11-20',
    createdBy: 'admin@shareflow.me',
    icon: '🔥'
  }
];

// Mock data for discount codes
const mockDiscountCodes: BonusCode[] = [
  {
    id: '1',
    code: 'SHAREFLOW20',
    name: 'Bonus Shareflow 20%',
    description: 'Código promocional con 20% de bonus en recargas',
    type: 'percentage',
    value: 20,
    status: 'active',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    targetUsers: 'all',
    minRecharge: 50000,
    maxBonus: 500000,
    usageLimit: 1000,
    usageCount: 156,
    maxUsesPerUser: 1,
    termsAndConditions: `TÉRMINOS Y CONDICIONES - CÓDIGO SHAREFLOW20

• Código promocional válido únicamente del 1 al 31 de diciembre de 2024.
• Otorga un bonus del 20% sobre el monto de recarga.
• Recarga mínima requerida: $100,000 COP.
• Bonus máximo por uso: $1,500,000 COP.
• Limitado a un (1) uso por usuario durante toda la vigencia del código.
• El código debe ingresarse exactamente como aparece: SHAREFLOW20
• No es transferible, canjeable por dinero ni combinable con otras promociones.
• El bonus se acreditará inmediatamente después de confirmar el pago.
• Shareflow se reserva el derecho de invalidar el código en caso de uso fraudulento.
• El código puede ser desactivado o modificado sin previo aviso.
• En caso de disputas, la decisión de Shareflow será final.
• Aplican términos y condiciones generales de uso de la plataforma.
• Este código fue creado en colaboración con influencers de la plataforma.`,
    createdAt: '2024-11-20',
    createdBy: 'admin@shareflow.me',
    icon: '🎯',
    isCustomCode: true,
    influencerCommissionType: 'percentage',
    influencerCommissionValue: 5,
    influencerCommissionNotes: '5% commission to influencers'
  },
  {
    id: '2',
    code: 'NAVIDAD25',
    name: 'Especial Navidad',
    description: 'Promoción navideña con 25% extra',
    type: 'percentage',
    value: 25,
    status: 'active',
    startDate: '2024-12-15',
    endDate: '2024-12-25',
    targetUsers: 'all',
    minRecharge: 100000,
    maxBonus: 1000000,
    usageLimit: 500,
    usageCount: 89,
    maxUsesPerUser: 1,
    termsAndConditions: `TÉRMINOS Y CONDICIONES - CÓDIGO NAVIDAD25

• Código promocional especial de temporada navideña.
• Válido únicamente del 15 de diciembre de 2024 al 6 de enero de 2025.
• Otorga un bonus del 25% sobre el monto de recarga.
• Recarga mínima requerida: $200,000 COP.
• Bonus máximo por uso: $2,000,000 COP.
• Limitado a un (1) uso por usuario durante toda la vigencia del código.
• El código debe ingresarse exactamente como aparece: NAVIDAD25
• Promoción especial no acumulable con otras ofertas o códigos.
• El bonus se acreditará inmediatamente después de confirmar el pago.
• Válido únicamente para usuarios con cuenta verificada.
• Shareflow se reserva el derecho de invalidar el código en caso de uso indebido.
• En caso de problemas técnicos, contactar soporte dentro de 48 horas.
• Aplican términos y condiciones generales de uso de la plataforma.
• ¡Felices fiestas de parte del equipo Shareflow!`,
    createdAt: '2024-11-25',
    createdBy: 'admin@shareflow.me',
    icon: '🎄',
    isCustomCode: true,
    influencerCommissionType: 'percentage',
    influencerCommissionValue: 5,
    influencerCommissionNotes: '5% commission to influencers'
  },
  {
    id: '3',
    code: 'AMIGO15',
    name: 'Referido Amigo',
    description: 'Bonus por referir amigos',
    type: 'percentage',
    value: 15,
    status: 'active',
    startDate: '2024-11-01',
    endDate: '2025-01-31',
    targetUsers: 'all',
    minRecharge: 75000,
    maxBonus: 300000,
    usageCount: 234,
    maxUsesPerUser: 3,
    termsAndConditions: `TÉRMINOS Y CONDICIONES - CÓDIGO AMIGO15

• Código promocional para programa de referidos y amigos.
• Válido únicamente del 1 de diciembre de 2024 al 28 de febrero de 2025.
• Otorga un bonus del 15% sobre el monto de recarga.
• Recarga mínima requerida: $50,000 COP.
• Bonus máximo por uso: $500,000 COP.
• Limitado a tres (3) usos por usuario durante toda la vigencia del código.
• El código debe ingresarse exactamente como aparece: AMIGO15
• Diseñado para compartir entre amigos y nuevos usuarios.
• El bonus se acreditará inmediatamente después de confirmar el pago.
• Puede combinarse con bonos de nivel de usuario, pero no con otros códigos.
• Shareflow se reserva el derecho de monitorear el uso para prevenir abuso.
• En caso de uso fraudulento o cuentas múltiples, se anulará el bonus.
• Ideal para introducir amigos a la plataforma Shareflow.
• Aplican términos y condiciones generales de uso de la plataforma.`,
    createdAt: '2024-11-18',
    createdBy: 'admin@shareflow.me',
    icon: '👥',
    isCustomCode: true,
    influencerCommissionType: 'percentage',
    influencerCommissionValue: 5,
    influencerCommissionNotes: '5% commission to influencers'
  }
];

const userTypeOptions = [
  { value: 'All', label: 'Todos los usuarios', description: 'Aplica para cualquier usuario' },
  { value: 'New', label: 'Usuarios nuevos', description: 'Solo usuarios que se registren durante la campaña' },
  { value: 'Returning', label: 'Usuarios anteriores', description: 'Solo usuarios que ya tenían cuenta' },
  { value: 'VIP', label: 'Usuarios VIP', description: 'Solo usuarios con nivel 5 o superior' }
];

// Mock analytics data for campaigns
const mockCampaignAnalytics: CampaignAnalytics[] = [
  {
    id: '1', // RE LANZAMIENTO
    totalRecharges: 245,
    totalRechargeAmount: 89750000,
    totalBonusGiven: 22437500,
    totalInfluencerCommissions: 0,
    uniqueUsers: 245,
    averageRechargeAmount: 366326,
    conversionRate: 24.5,
    costPerAcquisition: 91582,
    realCAC: 91582,
    roi: 300,
    revenueGenerated: 67312500,
    totalCosts: 22437500,
    netRevenue: 44875000,
    marginImpact: 25.0,
    topUserSegments: [
      { segment: 'Aventurero', users: 98, totalSpent: 35900000, bonusGiven: 8975000 },
      { segment: 'Explorador', users: 89, totalSpent: 32600000, bonusGiven: 8150000 },
      { segment: 'Maestro', users: 58, totalSpent: 21250000, bonusGiven: 5312500 }
    ]
  },
  {
    id: '2', // BIENVENIDA NUEVOS
    totalRecharges: 89,
    totalRechargeAmount: 23450000,
    totalBonusGiven: 3517500,
    totalInfluencerCommissions: 0,
    uniqueUsers: 89,
    averageRechargeAmount: 263483,
    conversionRate: 8.9,
    costPerAcquisition: 39522,
    realCAC: 39522,
    roi: 567,
    revenueGenerated: 17587500,
    totalCosts: 3517500,
    netRevenue: 14070000,
    marginImpact: 15.0,
    topUserSegments: [
      { segment: 'Novato', users: 89, totalSpent: 23450000, bonusGiven: 3517500 }
    ]
  },
  {
    id: '3', // BLACK FRIDAY
    totalRecharges: 487,
    totalRechargeAmount: 243500000,
    totalBonusGiven: 121750000,
    totalInfluencerCommissions: 0,
    uniqueUsers: 487,
    averageRechargeAmount: 500000,
    conversionRate: 97.4,
    costPerAcquisition: 250000,
    realCAC: 250000,
    roi: 100,
    revenueGenerated: 182625000,
    totalCosts: 121750000,
    netRevenue: 60875000,
    marginImpact: 50.0,
    topUserSegments: [
      { segment: 'Maestro', users: 195, totalSpent: 97500000, bonusGiven: 48750000 },
      { segment: 'Aventurero', users: 146, totalSpent: 73000000, bonusGiven: 36500000 },
      { segment: 'Leyenda', users: 97, totalSpent: 48500000, bonusGiven: 24250000 },
      { segment: 'Explorador', users: 49, totalSpent: 24500000, bonusGiven: 12250000 }
    ]
  }
];

// Mock analytics data for codes
const mockCodeAnalytics: CodeAnalytics[] = [
  {
    id: '1', // SHAREFLOW20
    totalUses: 156,
    totalRechargeAmount: 46800000,
    totalBonusGiven: 9360000,
    totalInfluencerCommissions: 0,
    uniqueUsers: 156,
    averageRechargeAmount: 300000,
    costPerUser: 60000,
    realCostPerUser: 60000,
    roi: 400,
    revenueGenerated: 35100000,
    totalCosts: 9360000,
    netRevenue: 25740000,
    marginImpact: 20.0,
    usageByDate: [
      { date: '2024-12-01', uses: 12, amount: 3600000, bonus: 720000, commission: 0 },
      { date: '2024-12-02', uses: 18, amount: 5400000, bonus: 1080000, commission: 0 },
      { date: '2024-12-03', uses: 15, amount: 4500000, bonus: 900000, commission: 0 },
      { date: '2024-12-04', uses: 22, amount: 6600000, bonus: 1320000, commission: 0 },
      { date: '2024-12-05', uses: 19, amount: 5700000, bonus: 1140000, commission: 0 },
      { date: '2024-12-06', uses: 25, amount: 7500000, bonus: 1500000, commission: 0 },
      { date: '2024-12-07', uses: 21, amount: 6300000, bonus: 1260000, commission: 0 },
      { date: '2024-12-08', uses: 24, amount: 7200000, bonus: 1440000, commission: 0 }
    ]
  },
  {
    id: '2', // INFLUENCER10
    totalUses: 78,
    totalRechargeAmount: 15600000,
    totalBonusGiven: 1560000,
    totalInfluencerCommissions: 780000,
    uniqueUsers: 78,
    averageRechargeAmount: 200000,
    costPerUser: 30000,
    realCostPerUser: 30000,
    roi: 567,
    revenueGenerated: 11700000,
    totalCosts: 2340000,
    netRevenue: 9360000,
    marginImpact: 15.0,
    usageByDate: [
      { date: '2024-12-01', uses: 8, amount: 1600000, bonus: 160000, commission: 80000 },
      { date: '2024-12-02', uses: 12, amount: 2400000, bonus: 240000, commission: 120000 },
      { date: '2024-12-03', uses: 10, amount: 2000000, bonus: 200000, commission: 100000 },
      { date: '2024-12-04', uses: 15, amount: 3000000, bonus: 300000, commission: 150000 },
      { date: '2024-12-05', uses: 11, amount: 2200000, bonus: 220000, commission: 110000 },
      { date: '2024-12-06', uses: 9, amount: 1800000, bonus: 180000, commission: 90000 },
      { date: '2024-12-07', uses: 13, amount: 2600000, bonus: 260000, commission: 130000 }
    ]
  },
  {
    id: '3', // NAVIDAD30
    totalUses: 234,
    totalRechargeAmount: 70200000,
    totalBonusGiven: 21060000,
    totalInfluencerCommissions: 0,
    uniqueUsers: 234,
    averageRechargeAmount: 300000,
    costPerUser: 90000,
    realCostPerUser: 90000,
    roi: 233,
    revenueGenerated: 52650000,
    totalCosts: 21060000,
    netRevenue: 31590000,
    marginImpact: 30.0,
    usageByDate: [
      { date: '2024-12-15', uses: 45, amount: 13500000, bonus: 4050000, commission: 0 },
      { date: '2024-12-16', uses: 38, amount: 11400000, bonus: 3420000, commission: 0 },
      { date: '2024-12-17', uses: 42, amount: 12600000, bonus: 3780000, commission: 0 },
      { date: '2024-12-18', uses: 35, amount: 10500000, bonus: 3150000, commission: 0 },
      { date: '2024-12-19', uses: 39, amount: 11700000, bonus: 3510000, commission: 0 },
      { date: '2024-12-20', uses: 35, amount: 10500000, bonus: 3150000, commission: 0 }
    ]
  }
];

// Consolidated analytics
const mockConsolidatedAnalytics: ConsolidatedAnalytics = {
  totalCampaigns: 3,
  totalCodes: 3,
  totalRecharges: 1289,
  totalRechargeAmount: 485300000,
  totalBonusGiven: 179685000,
  totalInfluencerCommissions: 780000,
  uniqueUsers: 1289,
  averageRechargeAmount: 376500,
  generalCAC: 139500,
  generalROI: 170,
  totalRevenue: 363975000,
  totalCosts: 180465000,
  conversionRate: 64.5,
  topPerformingCampaigns: [
    { id: '2', name: 'BIENVENIDA NUEVOS', type: 'campaign', roi: 567, revenue: 17587500, users: 89 },
    { id: '1', name: 'SHAREFLOW20', type: 'code', roi: 400, revenue: 35100000, users: 156 },
    { id: '1', name: 'RE LANZAMIENTO', type: 'campaign', roi: 300, revenue: 67312500, users: 245 },
    { id: '3', name: 'NAVIDAD30', type: 'code', roi: 233, revenue: 52650000, users: 234 },
    { id: '3', name: 'BLACK FRIDAY', type: 'campaign', roi: 100, revenue: 182625000, users: 487 }
  ],
  monthlyTrend: [
    { month: 'Nov 2024', revenue: 182625000, costs: 121750000, roi: 100, users: 487 },
    { month: 'Dic 2024', revenue: 181350000, costs: 58715000, roi: 209, users: 802 }
  ]
};

export function WalletCampaignManagement() {
  const { createBonus, getBonus, updateBonus, bonus, deleteBonus, deactivateBonus, activateBonus } = useBonus();
  // Estados principales
  const [activeTab, setActiveTab] = useState<'campaigns' | 'codes' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<Bonus[]>([]);
  const [discountCodes, setDiscountCodes] = useState<BonusCode[]>(mockDiscountCodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateCodeModalOpen, setIsCreateCodeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCodeModalOpen, setIsEditCodeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewCodeModalOpen, setIsViewCodeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCodeModalOpen, setIsDeleteCodeModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Bonus | null>(null);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<BonusCode | null>(null);

  // Estados para formularios
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    icon: '🎉',
    description: '',
    type: 'percentage' as 'Percentage' | 'Fixed',
    value: 0,
    minRecharge: 100000,
    targetUsers: 'All' as 'All' | 'New' | 'Returning' | 'VIP',
    startDate: '',
    endDate: '',
    termsAndConditions: ''
  });
  const [codeFormData, setCodeFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    maxUsesPerUser: 1,
    startDate: '',
    endDate: '',
    termsAndConditions: '',
    influencerCommissionType: 'percentage' as 'percentage' | 'fixed' | 'none',
    influencerCommissionValue: 5,
    influencerCommissionNotes: ''
  });
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalytics | CodeAnalytics | null>(null);
  const [analyticsType, setAnalyticsType] = useState<'campaign' | 'code'>('campaign');

  // Estados para confirmaciones de creación
  const [isCreateCampaignConfirmOpen, setIsCreateCampaignConfirmOpen] = useState(false);
  const [isCreateCodeConfirmOpen, setIsCreateCodeConfirmOpen] = useState(false);

  // Estados para confirmaciones de activación de campaña
  const [isActivateCampaignConfirmOpen, setIsActivateCampaignConfirmOpen] = useState(false);
  const [campaignToActivate, setCampaignToActivate] = useState<Bonus | null>(null);
  const [activeCampaignWarningOpen, setActiveCampaignWarningOpen] = useState(false);

  // Función para obtener la campaña activa actual
  const getActiveCampaign = () => {
    return campaigns.find(campaign => campaign.status === 'Active') || null;
  };



  useEffect(() => {
    getBonus();
  }, []);

  useEffect(() => {
    setCampaigns(bonus);
  }, [bonus]);

  // Funciones de guardado
  const handleSaveCampaign = () => {
    const newCampaign: Bonus = {
      name: campaignFormData.name,
      description: campaignFormData.description,
      type: campaignFormData.type,
      value: campaignFormData.value,
      status: 'Inactive', // Siempre crear como inactiva
      startDate: campaignFormData.startDate,
      endDate: campaignFormData.endDate,
      targetUsers: campaignFormData.targetUsers,
      minRecharge: campaignFormData.minRecharge,
      // /maxBonus: campaignFormData.type === 'Percentage' ? undefined : campaignFormData.value,
      //usageLimit: undefined,
      usageCount: 0,
      termsAndConditions: campaignFormData.termsAndConditions,
      createdAt: new Date().toISOString().split('T')[0],
      icon: campaignFormData.icon,
      id: 0,
      updatedAt: ''
    };
    
    createBonus(newCampaign).then(() => {
      setIsCreateModalOpen(false);
      resetCampaignForm();
      getBonus();
    })
   
  };

  const handleSaveCode = () => {
    const newCode: BonusCode = {
      id: Date.now().toString(),
      code: codeFormData.code || generateRandomCode(),
      name: codeFormData.name,
      description: codeFormData.description,
      type: codeFormData.type,
      value: codeFormData.value,
      status: 'inactive',
      startDate: codeFormData.startDate,
      endDate: codeFormData.endDate,
      targetUsers: 'all',
      minRecharge: 100000,
      maxBonus: codeFormData.type === 'percentage' ? undefined : codeFormData.value,
      usageLimit: undefined,
      usageCount: 0,
      maxUsesPerUser: codeFormData.maxUsesPerUser,
      termsAndConditions: codeFormData.termsAndConditions,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
      icon: '🎫',
      isCustomCode: !!codeFormData.code,
      influencerCommissionType: codeFormData.influencerCommissionType,
      influencerCommissionValue: codeFormData.influencerCommissionValue,
      influencerCommissionNotes: codeFormData.influencerCommissionNotes || ''
    };
    
    setDiscountCodes([newCode, ...discountCodes]);
    setIsCreateCodeModalOpen(false);
    resetCodeForm();
  };

  const handleUpdateCampaign = async () => {
    if (selectedCampaign) {
      const updatedCampaign: Bonus = {
        ...selectedCampaign,
        name: campaignFormData.name,
        description: campaignFormData.description,
        type: campaignFormData.type,
        value: campaignFormData.value,
        startDate: campaignFormData.startDate,
        endDate: campaignFormData.endDate,
        targetUsers: campaignFormData.targetUsers,
        minRecharge: campaignFormData.minRecharge,
        termsAndConditions: campaignFormData.termsAndConditions,
        icon: campaignFormData.icon
      };
      
      await updateBonus(updatedCampaign.id, updatedCampaign)
       getBonus();
      setIsEditModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleUpdateCode = () => {
    if (selectedDiscountCode) {
      const updatedCode: BonusCode = {
        ...selectedDiscountCode,
        code: codeFormData.code,
        name: codeFormData.name,
        description: codeFormData.description,
        type: codeFormData.type,
        value: codeFormData.value,
        maxUsesPerUser: codeFormData.maxUsesPerUser,
        startDate: codeFormData.startDate,
        endDate: codeFormData.endDate,
        termsAndConditions: codeFormData.termsAndConditions,
        influencerCommissionType: codeFormData.influencerCommissionType,
        influencerCommissionValue: codeFormData.influencerCommissionValue,
        influencerCommissionNotes: codeFormData.influencerCommissionNotes || ''
      };
      
      setDiscountCodes(discountCodes.map(c => c.id === selectedDiscountCode.id ? updatedCode : c));
      setIsEditCodeModalOpen(false);
      setSelectedDiscountCode(null);
    }
  };

  // Helper functions for level calculations
  const getCurrentLevel = (spent: number): UserLevel => {
    return userLevels.find(level => 
      spent >= level.minSpent && (!level.maxSpent || spent < level.maxSpent)
    ) || userLevels[0];
  };

  const getNextLevel = (currentLevel: UserLevel): UserLevel | null => {
    const currentIndex = userLevels.findIndex(level => level.id === currentLevel.id);
    return currentIndex < userLevels.length - 1 ? userLevels[currentIndex + 1] : null;
  };

  const getLevelProgress = (spent: number, currentLevel: UserLevel, nextLevel: UserLevel | null): number => {
    if (!nextLevel) return 100;
    const progress = ((spent - currentLevel.minSpent) / (nextLevel.minSpent - currentLevel.minSpent)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const currentLevel = getCurrentLevel(3500000);
  const nextLevel = getNextLevel(currentLevel);
  const levelProgress = getLevelProgress(3500000, currentLevel, nextLevel);

  // Filter campaigns based on search and status
  const filteredCampaigns = bonus.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter discount codes based on search and status
  const filteredDiscountCodes = discountCodes.filter(code => {
    const matchesSearch = code.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         code.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || code.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Campaign handlers
  const handleEditCampaign = (campaign: Bonus) => {
    setSelectedCampaign(campaign);
    setCampaignFormData({
      name: campaign.name,
      icon: campaign.icon,
      description: campaign.description,
      type: campaign.type,
      value: campaign.value,
      minRecharge: campaign.minRecharge,
      targetUsers: campaign.targetUsers,
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      termsAndConditions: campaign.termsAndConditions
    });
    setIsEditModalOpen(true);
  };

  const handleViewCampaign = (campaign: Bonus) => {
    setSelectedCampaign(campaign);
    setIsViewModalOpen(true);
  };

  const handleDeleteCampaign = (campaign: Bonus) => {
    setSelectedCampaign(campaign);
    setIsDeleteModalOpen(true);
    deleteBonus(campaign.id);
  };

  const handleDuplicateCampaign = async (campaign: Bonus) => {
    const newCampaign = {
      ...campaign,
      name: `${campaign.name} (Copia)`,
      status: 'Inactive' as const,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await createBonus(newCampaign);
    getBonus();
  };

  const toggleCampaignStatus = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Si se está intentando activar una campaña
    if (campaign.status !== 'Active') {
      const activeCampaign = getActiveCampaign();
      
      // Si ya hay una campaña activa, mostrar advertencia
      if (activeCampaign) {
        setCampaignToActivate(campaign);
        setActiveCampaignWarningOpen(true);
        return;
      }
      
      activateBonus(campaignId)
    } else {
      // Si se está desactivando, hacerlo directamente
      deactivateBonus(campaignId);
    
    }
  };

  // Discount code handlers
  const handleEditDiscountCode = (code: BonusCode) => {
    setSelectedDiscountCode(code);
    setCodeFormData({
      code: code.code,
      name: code.name,
      description: code.description,
      type: code.type,
      value: code.value,
      maxUsesPerUser: code.maxUsesPerUser,
      startDate: code.startDate,
      endDate: code.endDate,
      termsAndConditions: code.termsAndConditions,
      influencerCommissionType: code.influencerCommissionType || 'none',
      influencerCommissionValue: code.influencerCommissionValue || 0,
      influencerCommissionNotes: code.influencerCommissionNotes || ''
    });
    setIsEditCodeModalOpen(true);
  };

  const handleViewDiscountCode = (code: BonusCode) => {
    setSelectedDiscountCode(code);
    setIsViewCodeModalOpen(true);
  };

  const handleDeleteDiscountCode = (code: BonusCode) => {
    setSelectedDiscountCode(code);
    setIsDeleteCodeModalOpen(true);
  };

  const handleDuplicateDiscountCode = (code: BonusCode) => {
    const newCode = {
      ...code,
      id: Date.now().toString(),
      code: `${code.code}_COPY`,
      name: `${code.name} (Copia)`,
      status: 'inactive' as const,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDiscountCodes([newCode, ...discountCodes]);
  };

  const toggleDiscountCodeStatus = (codeId: string) => {
    setDiscountCodes(discountCodes.map(code => 
      code.id === codeId 
        ? { ...code, status: code.status === 'active' ? 'inactive' : 'active' }
        : code
    ));
  };

  const confirmDeleteCode = () => {
    if (selectedDiscountCode) {
      setDiscountCodes(discountCodes.filter(c => c.id !== selectedDiscountCode.id));
      setIsDeleteCodeModalOpen(false);
      setSelectedDiscountCode(null);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const resetCampaignForm = () => {
    setCampaignFormData({
      name: '',
      icon: '🎉',
      description: '',
      type: 'Percentage',
      value: 20,
      minRecharge: 100000,
      targetUsers: 'All',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      termsAndConditions: ''
    });
  };

  const resetCodeForm = () => {
    setCodeFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 20,
      maxUsesPerUser: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      termsAndConditions: '',
      influencerCommissionType: 'none',
      influencerCommissionValue: 0,
      influencerCommissionNotes: ''
    });
  };

  const handleCreateCampaign = () => {
    setIsCreateCampaignConfirmOpen(true);
  };

  const handleCreateCode = () => {
    setIsCreateCodeConfirmOpen(true);
  };

  const confirmCreateCampaign = () => {
    setIsCreateCampaignConfirmOpen(false);
    resetCampaignForm();
    setIsCreateModalOpen(true);
  };

  const confirmCreateCode = () => {
    setIsCreateCodeConfirmOpen(false);
    resetCodeForm();
    setIsCreateCodeModalOpen(true);
  };

  const handleViewCampaignAnalytics = (campaign: Bonus) => {
    // const analytics = mockCampaignAnalytics.find(a => a.id === campaign.id);
    // if (analytics) {
    //   setSelectedAnalytics(analytics);
    //   setAnalyticsType('campaign');
    //   setSelectedCampaign(campaign);
    //   setIsAnalyticsModalOpen(true);
    // }
  };

  const handleViewCodeAnalytics = (code: BonusCode) => {
    const analytics = mockCodeAnalytics.find(a => a.id === code.id);
    if (analytics) {
      setSelectedAnalytics(analytics);
      setAnalyticsType('code');
      setSelectedDiscountCode(code);
      setIsAnalyticsModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-600 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'scheduled': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'expired': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Check className="w-4 h-4" />;
      case 'inactive': return <Pause className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  const getUserTypeLabel = (type: string) => {
    const option = userTypeOptions.find(opt => opt.value === type);
    return option?.label || type;
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownOpen && e.target instanceof Element && !e.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [dropdownOpen]);

  // Función para confirmar activación de campaña (desactivando la actual)
  const confirmActivateCampaign = () => {
    if (!campaignToActivate) return;
    
    activateBonus(campaignToActivate.id);
    
    setActiveCampaignWarningOpen(false);
    setCampaignToActivate(null);
  };

  // Función para cancelar activación de campaña
  const cancelActivateCampaign = () => {
    setActiveCampaignWarningOpen(false);
    setCampaignToActivate(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 md:pb-0">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="relative px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6">
          {/* Title Section */}
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2 bg-neutral-900 rounded-xl flex-shrink-0">
                  <Wallet className="w-6 h-6 text-white" />
              </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
                    Bonos y Promociones
                  </h1>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Gestiona campañas de bonos automáticas y códigos promocionales
                </p>
        </div>
            </div>
            
          {/* Navigation and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Tab Navigation */}
              <div className="bg-white border border-neutral-200/60 rounded-2xl p-1 inline-flex">
                <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'campaigns'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Campañas
              </button>
              <button
                onClick={() => setActiveTab('codes')}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'codes'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Códigos
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Analytics
                </button>
              </div>
              
            {/* Action Buttons - Blue Design System */}
            {activeTab !== 'analytics' && (
              <div className="flex gap-3">
                {activeTab === 'campaigns' && (
                <button
                  onClick={handleCreateCampaign}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Campaña
                </button>
                )}
              
                {activeTab === 'codes' && (
                <button
                  onClick={handleCreateCode}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors duration-200"
                >
                  <Tag className="w-4 h-4" />
                  Crear Código
                </button>
                )}
              </div>
            )}
            </div>
                  </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Campañas Activas', 
              value: bonus.filter(c => c.status === 'Active').length.toString(), 
              icon: Zap, 
              trend: '+2 esta semana',
              color: 'text-emerald-600'
            },
            { 
              label: 'Códigos Creados', 
              value: '48', 
              icon: Code, 
              trend: '+8 este mes',
              color: 'text-blue-600'
            },
            { 
              label: 'Bonus Otorgado', 
              value: '$24.5K', 
              icon: Gift, 
              trend: '+15% vs mes anterior',
              color: 'text-purple-600'
            },
            { 
              label: 'Usuarios Beneficiados', 
              value: '1,247', 
              icon: Users, 
              trend: '+23% crecimiento',
              color: 'text-orange-600'
            }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white border border-neutral-200/60 rounded-xl p-4 lg:p-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 lg:space-y-2 min-w-0 flex-1">
                  <p className="text-neutral-600 text-sm font-medium truncate">{stat.label}</p>
                  <p className="text-lg lg:text-2xl font-semibold text-neutral-900">{stat.value}</p>
                  <p className={`text-xs ${stat.color} font-medium hidden sm:block`}>{stat.trend}</p>
                    </div>
                <div className="p-2 bg-neutral-50 rounded-xl flex-shrink-0">
                  <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-neutral-600" />
                    </div>
                  </div>
            </div>
          ))}
          </div>

        {/* Search and Filters */}
        {activeTab !== 'analytics' && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'campaigns' ? "Buscar campañas..." : "Buscar códigos..."}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200/60 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
            </div>
          </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Status Select */}
              <div className="min-w-[180px]">
          <Select
            placeholder="Estado"
            value={selectedStatus ? { value: selectedStatus, label: selectedStatus } : null}
            onChange={(option) => setSelectedStatus(option?.value || '')}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
              { value: 'scheduled', label: 'Programado' },
              { value: 'expired', label: 'Expirado' }
            ]}
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid rgb(229 229 229 / 0.6)',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '14px',
                boxShadow: 'none',
                      minHeight: '48px',
                '&:hover': {
                  borderColor: 'rgb(212 212 212)'
                }
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? 'rgb(23 23 23)' : state.isFocused ? 'rgb(245 245 245)' : 'white',
                color: state.isSelected ? 'white' : 'rgb(23 23 23)',
                fontSize: '14px'
              })
            }}
          />
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200/60 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
          </div>
        )}

        {/* Content Display */}
        <div>
          {activeTab === 'campaigns' ? (
            <>
              {/* Alerta informativa sobre restricción de campaña única */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 mb-1">
                        Restricción de Campaña Única
                      </h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Solo puede haber <strong>una campaña activa</strong> al tiempo, ya que esta aparece en la wallet y afecta las recargas. 
                        Los códigos promocionales sí pueden estar activos simultáneamente.
                      </p>
                      {getActiveCampaign() ? (
                        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-blue-900">Campaña Activa Actual:</span>
                          </div>
                          <p className="text-sm text-blue-800 font-medium">{getActiveCampaign()?.name}</p>
                          <p className="text-xs text-blue-700 mt-1">
                            {getActiveCampaign()?.type === 'Percentage' ? `${getActiveCampaign()?.value}% de bonus` : `$${getActiveCampaign()?.value} de bonus`}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">No hay campañas activas - Puedes activar una nueva</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaigns Grid */}
              <div className="space-y-4">
                {filteredCampaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className="bg-white border border-neutral-200/60 rounded-2xl p-4 sm:p-6"
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-4">
                      {/* Header Row */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-neutral-50 rounded-xl flex-shrink-0">
                            <span className="text-xl">{campaign.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-neutral-900 truncate">{campaign.name}</h3>
                            <p className="text-neutral-600 text-sm line-clamp-2 mt-1">{campaign.description}</p>
                          </div>
                        </div>
                        <div className="relative dropdown-container flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={MoreHorizontal}
                            onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                            title="Más opciones"
                          >
                            {""}
                          </Button>
                          
                          {dropdownOpen === campaign.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleViewCampaign(campaign);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver detalles
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditCampaign(campaign);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    handleViewCampaignAnalytics(campaign);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  Ver Analytics
                                </button>
                                <button
                                  onClick={() => {
                                    toggleCampaignStatus(campaign.id);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  {campaign.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  {campaign.status === 'Active' ? 'Pausar' : 'Activar'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDuplicateCampaign(campaign);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicar
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCampaign(campaign);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : campaign.status === 'Expired'
                              ? 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                              : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                          }`}>
                            {campaign.status === 'Active' ? 'Activo' :
                             campaign.status === 'Expired' ? 'Expirado' : 'Inactivo'}
                          </span>
                          {campaign.status === 'Active' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-bold">LIVE</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Bonus</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {campaign.type === 'Percentage' ? `${campaign.value}%` : `$${campaign.value}`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Usuarios</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {getUserTypeLabel(campaign.targetUsers)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Usos</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            0
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Vigencia</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-neutral-50 rounded-xl">
                          <span className="text-2xl">{campaign.icon}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-neutral-900">{campaign.name}</h3>
                              <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                campaign.status === 'Active' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : campaign.status === 'Expired'
                                  ? 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                              }`}>
                                {campaign.status === 'Active' ? 'Activo' :
                                 campaign.status === 'Expired' ? 'Expirado' : 'Inactivo'}
                              </span>
                                {campaign.status === 'Active' && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-xs font-bold">LIVE</span>
                                  </div>
                                )}
                              </div>
                        </div>
                            <p className="text-neutral-600 text-sm">{campaign.description}</p>
                      </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Bonus</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {campaign.type === 'Percentage' ? `${campaign.value}%` : `$${campaign.value}`}
                              </p>
                      </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Usuarios</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {getUserTypeLabel(campaign.targetUsers)}
                              </p>
                      </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Usos</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                0
                              </p>
                      </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Vigencia</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {new Date(campaign.endDate).toLocaleDateString()}
                              </p>
                            </div>
                      </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleViewCampaign(campaign)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Ver detalles"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditCampaign(campaign)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Editar"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={BarChart3}
                          onClick={() => handleViewCampaignAnalytics(campaign)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Ver Analytics"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={campaign.status === 'Active' ? Pause : Play}
                          onClick={() => toggleCampaignStatus(campaign.id)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title={campaign.status === 'Active' ? 'Pausar' : 'Activar'}
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Copy}
                          onClick={() => handleDuplicateCampaign(campaign)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Duplicar"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteCampaign(campaign)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          {""}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === 'codes' ? (
            <>
              {/* Bonus Codes Grid */}
              <div className="space-y-4">
                {filteredDiscountCodes.map((code, index) => (
                  <div
                    key={code.id}
                    className="bg-white border border-neutral-200/60 rounded-2xl p-4 sm:p-6"
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-neutral-50 rounded-xl flex-shrink-0">
                            <span className="text-xl">{code.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-neutral-900 truncate">{code.name}</h3>
                            <p className="text-neutral-600 text-sm line-clamp-2 mt-1">{code.description}</p>
                          </div>
                        </div>
                        <div className="relative dropdown-container flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={MoreHorizontal}
                            onClick={() => setDropdownOpen(dropdownOpen === code.id ? null : code.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                            title="Más opciones"
                          >
                            {""}
                          </Button>
                          
                          {dropdownOpen === code.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleViewDiscountCode(code);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver detalles
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditDiscountCode(code);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    handleViewCodeAnalytics(code);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  Ver Analytics
                                </button>
                                <button
                                  onClick={() => {
                                    toggleDiscountCodeStatus(code.id);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  {code.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  {code.status === 'active' ? 'Pausar' : 'Activar'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDuplicateDiscountCode(code);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicar
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteDiscountCode(code);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Code Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-mono font-medium border border-purple-200/60">
                            {code.code}
                    </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            code.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : code.status === 'expired'
                              ? 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                              : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                          }`}>
                            {code.status === 'active' ? 'Activo' :
                             code.status === 'expired' ? 'Expirado' : 'Inactivo'}
                          </span>
            </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Bonus</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Usuarios</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {getUserTypeLabel(code.targetUsers)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Usos</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {code.usageCount}{code.usageLimit ? `/${code.usageLimit}` : ''}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">Vigencia</p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {new Date(code.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-neutral-50 rounded-xl">
                          <span className="text-2xl">{code.icon}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-neutral-900">{code.name}</h3>
                              <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-mono font-medium border border-purple-200/60">
                                  {code.code}
                              </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  code.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : code.status === 'expired'
                                    ? 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                                    : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                                }`}>
                                  {code.status === 'active' ? 'Activo' :
                                   code.status === 'expired' ? 'Expirado' : 'Inactivo'}
                                </span>
                            </div>
                            <p className="text-neutral-600 text-sm">{code.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Bonus</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Usuarios</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {getUserTypeLabel(code.targetUsers)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Usos</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {code.usageCount}{code.usageLimit ? `/${code.usageLimit}` : ''}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-medium">Vigencia</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {new Date(code.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleViewDiscountCode(code)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Ver detalles"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditDiscountCode(code)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Editar"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={BarChart3}
                          onClick={() => handleViewCodeAnalytics(code)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Ver Analytics"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={code.status === 'active' ? Pause : Play}
                          onClick={() => toggleDiscountCodeStatus(code.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          title={code.status === 'active' ? 'Pausar' : 'Activar'}
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Copy}
                          onClick={() => handleDuplicateDiscountCode(code)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Duplicar"
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteDiscountCode(code)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          {""}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Analytics Dashboard */}
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
                      <p className="text-neutral-600">Desempeño consolidado de campañas y códigos promocionales</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-emerald-500 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full">
                        +{formatPercentage(mockConsolidatedAnalytics.generalROI)}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-1">
                      {formatCurrency(mockConsolidatedAnalytics.totalRevenue)}
                    </h3>
                    <p className="text-sm text-emerald-700">Ingresos Totales</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-500 rounded-xl">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                        {formatPercentage(mockConsolidatedAnalytics.conversionRate)}%
                      </span>
                            </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-1">
                      {mockConsolidatedAnalytics.uniqueUsers.toLocaleString()}
                    </h3>
                    <p className="text-sm text-blue-700">Usuarios Únicos</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-500 rounded-xl">
                        <Gift className="w-5 h-5 text-white" />
                        </div>
                      <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                        {((mockConsolidatedAnalytics.totalBonusGiven / mockConsolidatedAnalytics.totalRechargeAmount) * 100).toFixed(1)}%
                      </span>
                      </div>
                    <h3 className="text-2xl font-bold text-purple-900 mb-1">
                      {formatCurrency(mockConsolidatedAnalytics.totalBonusGiven)}
                    </h3>
                    <p className="text-sm text-purple-700">Bonus Otorgados</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-orange-500 rounded-xl">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                      <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
                        ROI {formatPercentage(mockConsolidatedAnalytics.generalROI)}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-orange-900 mb-1">
                      {formatCurrency(mockConsolidatedAnalytics.generalCAC)}
                    </h3>
                    <p className="text-sm text-orange-700">CAC Promedio</p>
                  </motion.div>
                </div>

                {/* Top Performing Campaigns */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Top Performing</h3>
                      <p className="text-sm text-neutral-600">Mejores campañas y códigos por ROI</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockConsolidatedAnalytics.topPerformingCampaigns.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-neutral-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900">{item.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === 'campaign' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.type === 'campaign' ? 'Campaña' : 'Código'}
                              </span>
                              <span>•</span>
                              <span>{item.users} usuarios</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-neutral-900">
                            ROI {formatPercentage(item.roi)}%
                          </div>
                          <div className="text-sm text-neutral-600">
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Campaign Performance Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Campaigns Analytics */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white border border-neutral-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Campañas de Wallet</h3>
                        <p className="text-sm text-neutral-600">Desempeño detallado por campaña</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {mockCampaignAnalytics.map((campaign) => {
                        const campaignData = campaigns.find(c => c.id === campaign.id);
                        return (
                          <div key={campaign.id} className="border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{campaignData?.icon}</span>
                                <div>
                                  <h4 className="font-medium text-neutral-900">{campaignData?.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaignData?.status || 'inactive')}`}>
                                    {campaignData?.status === 'Active' ? 'Activa' : 
                                     campaignData?.status === 'Inactive' ? 'Inactiva' : 
                                     campaignData?.status === 'Expired' ? 'Expirada' : 'Programada'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                  ROI {formatPercentage(campaign.roi)}%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-neutral-600">Usuarios:</span>
                                <span className="font-medium text-neutral-900 ml-2">{campaign.uniqueUsers}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Recargas:</span>
                                <span className="font-medium text-neutral-900 ml-2">{campaign.totalRecharges}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Ingresos:</span>
                                <span className="font-medium text-neutral-900 ml-2">{formatCurrency(campaign.revenueGenerated)}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Bonus:</span>
                                <span className="font-medium text-neutral-900 ml-2">{formatCurrency(campaign.totalBonusGiven)}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-neutral-100">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600">Conversión:</span>
                                <span className="font-medium text-blue-600">{formatPercentage(campaign.conversionRate)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Codes Analytics */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white border border-neutral-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Códigos Promocionales</h3>
                        <p className="text-sm text-neutral-600">Desempeño detallado por código</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {mockCodeAnalytics.map((code) => {
                        const codeData = discountCodes.find(c => c.id === code.id);
                        return (
                          <div key={code.id} className="border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{codeData?.icon}</span>
                                <div>
                                  <h4 className="font-medium text-neutral-900">{codeData?.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <code className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono">
                                      {codeData?.code}
                                    </code>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(codeData?.status || 'inactive')}`}>
                                      {codeData?.status === 'active' ? 'Activo' : 
                                       codeData?.status === 'inactive' ? 'Inactivo' : 'Expirado'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                  ROI {formatPercentage(code.roi)}%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-neutral-600">Usuarios:</span>
                                <span className="font-medium text-neutral-900 ml-2">{code.uniqueUsers}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Usos:</span>
                                <span className="font-medium text-neutral-900 ml-2">{code.totalUses}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Ingresos:</span>
                                <span className="font-medium text-neutral-900 ml-2">{formatCurrency(code.revenueGenerated)}</span>
                              </div>
                              <div>
                                <span className="text-neutral-600">Bonus:</span>
                                <span className="font-medium text-neutral-900 ml-2">{formatCurrency(code.totalBonusGiven)}</span>
                              </div>
                            </div>

                            {code.totalInfluencerCommissions > 0 && (
                              <div className="mt-3 pt-3 border-t border-neutral-100">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-neutral-600">Comisiones:</span>
                                  <span className="font-medium text-purple-600">{formatCurrency(code.totalInfluencerCommissions)}</span>
                                </div>
          </div>
          )}
                          </div>
                        );
                      })}
                    </div>
        </motion.div>
                </div>

                {/* Monthly Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Tendencia Mensual</h3>
                      <p className="text-sm text-neutral-600">Evolución de ingresos y ROI</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockConsolidatedAnalytics.monthlyTrend.map((month, index) => (
                      <div key={month.month} className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-neutral-900">{month.month}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            month.roi > 200 ? 'bg-green-100 text-green-700' : 
                            month.roi > 100 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            ROI {formatPercentage(month.roi)}%
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Ingresos:</span>
                            <span className="font-medium text-neutral-900">{formatCurrency(month.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Costos:</span>
                            <span className="font-medium text-neutral-900">{formatCurrency(month.costs)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Usuarios:</span>
                            <span className="font-medium text-neutral-900">{month.users}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Campaign Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedCampaign(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 bg-neutral-50">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-neutral-900" />
                  {isCreateModalOpen ? 'Crear Nueva Campaña' : 'Editar Campaña'}
                </h2>
                <p className="text-neutral-600 mt-1">
                  Configura los parámetros de bonificación para recargas de wallet
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-neutral-600" />
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Nombre de la Campaña
                        </label>
                        <input
                          type="text"
                          value={campaignFormData.name}
                          onChange={(e) => setCampaignFormData({...campaignFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                          placeholder="Ej: RE LANZAMIENTO"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Icono de la Campaña
                        </label>
                        <input
                          type="text"
                          value={campaignFormData.icon}
                          onChange={(e) => setCampaignFormData({...campaignFormData, icon: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                          placeholder="🚀"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={campaignFormData.description}
                          onChange={(e) => setCampaignFormData({...campaignFormData, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                          placeholder="Describe el propósito y beneficios de la campaña"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bonus Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-emerald-600" />
                      Configuración del Bonus
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Tipo de Bonus
                        </label>
                        <Select
                          value={{ 
                            value: campaignFormData.type, 
                            label: campaignFormData.type === 'Percentage' ? 'Porcentaje' : 'Monto Fijo' 
                          }}
                          onChange={(option) => setCampaignFormData({
                            ...campaignFormData, 
                            type: option?.value as 'Percentage' | 'Fixed',
                            value: option?.value === 'Percentage' ? 25 : 50000 // Reset value based on type
                          })}
                          options={[
                            { value: 'Percentage', label: 'Porcentaje' },
                            { value: 'Fixed', label: 'Monto Fijo' }
                          ]}
                          placeholder="Seleccionar tipo"
                          className="text-sm"
                          styles={{
                            control: (base) => ({
                              ...base,
                              border: '1px solid rgb(212 212 212)',
                              borderRadius: '8px',
                              '&:hover': { borderColor: 'rgb(163 163 163)' }
                            })
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Valor del Bonus {campaignFormData.type === 'Percentage' ? '(%)' : '(COP)'}
                        </label>
                        <div className="relative">
                          {campaignFormData.type === 'Fixed' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                          )}
                          <input
                            type="number"
                            value={campaignFormData.value}
                            onChange={(e) => setCampaignFormData({...campaignFormData, value: Number(e.target.value)})}
                            className={`w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 ${
                              campaignFormData.type === 'Fixed' ? 'pl-8' : ''
                            }`}
                            placeholder={campaignFormData.type === 'Percentage' ? '25' : '50000'}
                            min={campaignFormData.type === 'Percentage' ? 1 : 1000}
                            max={campaignFormData.type === 'Percentage' ? 100 : 10000000}
                          />
                          {campaignFormData.type === 'Percentage' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">%</span>
                          )}
                          </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {campaignFormData.type === 'Percentage' 
                            ? 'Porcentaje de bonus sobre el monto recargado (1-100%)'
                            : 'Monto fijo en pesos colombianos ($1,000 - $10,000,000)'
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Recarga Mínima (COP)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                        <input
                          type="number"
                            value={campaignFormData.minRecharge}
                            onChange={(e) => setCampaignFormData({...campaignFormData, minRecharge: Number(e.target.value)})}
                            className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                          placeholder="100000"
                            min="10000"
                        />
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* User Targeting */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Segmentación de Usuarios
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        ¿A qué usuarios aplica esta campaña?
                      </label>
                      <Select
                        value={userTypeOptions.find(opt => opt.value === campaignFormData.targetUsers)}
                        onChange={(option) => setCampaignFormData({
                          ...campaignFormData, 
                          targetUsers: option?.value as 'All' | 'New' | 'Returning' | 'VIP'
                        })}
                        options={userTypeOptions}
                        placeholder="Seleccionar tipo de usuarios"
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: '1px solid rgb(212 212 212)',
                            borderRadius: '8px',
                            '&:hover': { borderColor: 'rgb(163 163 163)' }
                          })
                        }}
                      />
                    </div>
                  </div>

                  {/* Campaign Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      Programación de Campaña
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={campaignFormData.startDate}
                          onChange={(e) => setCampaignFormData({...campaignFormData, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Fecha de Fin
                        </label>
                        <input
                          type="date"
                          value={campaignFormData.endDate}
                          onChange={(e) => setCampaignFormData({...campaignFormData, endDate: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Términos y Condiciones
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Términos y Condiciones de la Campaña
                      </label>
                      <textarea
                        value={campaignFormData.termsAndConditions}
                        onChange={(e) => setCampaignFormData({...campaignFormData, termsAndConditions: e.target.value})}
                        rows={6}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 text-sm"
                        placeholder="Ingresa los términos y condiciones legales de la campaña. Ejemplo:&#10;&#10;• Esta campaña es válida únicamente para usuarios que cumplan con los criterios especificados.&#10;• El bonus se aplicará automáticamente al momento de la recarga.&#10;• Shareflow se reserva el derecho de modificar o cancelar esta campaña en cualquier momento.&#10;• Los términos están sujetos a las condiciones generales de uso de la plataforma."
                      />
                      <p className="text-xs text-neutral-500 mt-2">
                        Estos términos se mostrarán a los usuarios en el detalle de la campaña durante el proceso de recarga.
                          </p>
                        </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsAnalyticsModalOpen(false);
                      if (analyticsType === 'campaign' && selectedCampaign) {
                        handleUpdateCampaign();
                      } else if (analyticsType === 'code' && selectedDiscountCode) {
                        handleEditDiscountCode(selectedDiscountCode);
                      } else {
                         handleSaveCampaign();
                      }
                    }}
                  >
                    Optimizar {analyticsType === 'campaign' ? 'Campaña' : 'Código'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Modal para Crear Código Promocional */}
      <AnimatePresence>
        {isCreateCodeModalOpen && (
                      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateCodeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Tag className="w-6 h-6 text-purple-600" />
                                </div>
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">Crear Código Promocional</h2>
                      <p className="text-sm text-neutral-600">Configura un nuevo código promocional para bonos</p>
                                </div>
                                </div>
                  <button
                    onClick={() => setIsCreateCodeModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                  </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Código Promocional
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={codeFormData.code}
                          onChange={(e) => setCodeFormData({...codeFormData, code: e.target.value.toUpperCase()})}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="CODIGO2024"
                        />
                        <button
                          onClick={generateRandomCode}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                          title="Generar código aleatorio"
                        >
                          <Shuffle className="w-4 h-4 text-neutral-600" />
                        </button>
                </div>
              </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre del Código
                      </label>
                      <input
                        type="text"
                        value={codeFormData.name}
                        onChange={(e) => setCodeFormData({...codeFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Código de Bienvenida"
                      />
                            </div>
                  </div>

                            <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={codeFormData.description}
                      onChange={(e) => setCodeFormData({...codeFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe el propósito de este código promocional..."
                    />
                              </div>
                            </div>

                {/* Configuración del Bonus */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Configuración del Bonus</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Bonus
                      </label>
                      <select
                        value={codeFormData.type}
                        onChange={(e) => setCodeFormData({...codeFormData, type: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="percentage">Porcentaje</option>
                        <option value="fixed">Monto Fijo</option>
                      </select>
                          </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Valor del Bonus
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={codeFormData.value}
                          onChange={(e) => setCodeFormData({...codeFormData, value: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={codeFormData.type === 'percentage' ? '10' : '50000'}
                        />
                        <div className="absolute right-3 top-2 text-neutral-500">
                          {codeFormData.type === 'percentage' ? '%' : 'COP'}
                        </div>
                      </div>
                    </div>
                        </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Máximo de usos por usuario
                    </label>
                    <input
                      type="number"
                      value={codeFormData.maxUsesPerUser}
                      onChange={(e) => setCodeFormData({...codeFormData, maxUsesPerUser: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="1"
                      min="1"
                    />
                      </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Términos y Condiciones</h3>
                  
                          <div>
                    <textarea
                      value={codeFormData.termsAndConditions}
                      onChange={(e) => setCodeFormData({...codeFormData, termsAndConditions: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Especifica los términos y condiciones para el uso de este código..."
                    />
                        </div>
                      </div>
                    </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateCodeModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleSaveCode();
                    setIsCreateCodeModalOpen(false);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Crear Código
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Editar Código Promocional */}
      <AnimatePresence>
        {isEditCodeModalOpen && selectedDiscountCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditCodeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Edit className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">Editar Código Promocional</h2>
                      <p className="text-sm text-neutral-600">Modifica la configuración del código {selectedDiscountCode.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditCodeModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                    </div>
                          </div>

              <div className="p-6 space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Código Promocional
                      </label>
                      <input
                        type="text"
                        value={codeFormData.code}
                        onChange={(e) => setCodeFormData({...codeFormData, code: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CODIGO2024"
                      />
                      </div>

                          <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre del Código
                      </label>
                      <input
                        type="text"
                        value={codeFormData.name}
                        onChange={(e) => setCodeFormData({...codeFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Código de Bienvenida"
                      />
                        </div>
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={codeFormData.description}
                      onChange={(e) => setCodeFormData({...codeFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe el propósito de este código promocional..."
                    />
                    </div>
                          </div>

                {/* Configuración del Bonus */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Configuración del Bonus</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Bonus
                      </label>
                      <select
                        value={codeFormData.type}
                        onChange={(e) => setCodeFormData({...codeFormData, type: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percentage">Porcentaje</option>
                        <option value="fixed">Monto Fijo</option>
                      </select>
                        </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Valor del Bonus
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={codeFormData.value}
                          onChange={(e) => setCodeFormData({...codeFormData, value: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={codeFormData.type === 'percentage' ? '10' : '50000'}
                        />
                        <div className="absolute right-3 top-2 text-neutral-500">
                          {codeFormData.type === 'percentage' ? '%' : 'COP'}
                      </div>
                      </div>
                    </div>
                  </div>

                      <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Máximo de usos por usuario
                    </label>
                    <input
                      type="number"
                      value={codeFormData.maxUsesPerUser}
                      onChange={(e) => setCodeFormData({...codeFormData, maxUsesPerUser: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                      min="1"
                    />
                        </div>
                      </div>

                {/* Términos y Condiciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Términos y Condiciones</h3>
                  
                  <div>
                    <textarea
                      value={codeFormData.termsAndConditions}
                      onChange={(e) => setCodeFormData({...codeFormData, termsAndConditions: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Especifica los términos y condiciones para el uso de este código..."
                    />
                    </div>
                    </div>
                  </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditCodeModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Aquí iría la lógica para actualizar el código
                    handleUpdateCode();
                    setIsEditCodeModalOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Cambios
                </Button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Analytics Individual */}
      <AnimatePresence>
        {isAnalyticsModalOpen && selectedAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAnalyticsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                        Analytics de {analyticsType === 'campaign' ? 'Campaña' : 'Código'}
                      </h2>
                      <p className="text-sm text-neutral-600">
                        {analyticsType === 'campaign' 
                          ? selectedCampaign?.name 
                          : selectedDiscountCode?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAnalyticsModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Métricas Principales */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-medium text-neutral-600">
                          {analyticsType === 'campaign' ? 'Recargas' : 'Usos'}
                        </span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-neutral-900">
                        {analyticsType === 'campaign' 
                          ? (selectedAnalytics as CampaignAnalytics).totalRecharges?.toLocaleString()
                          : (selectedAnalytics as CodeAnalytics).totalUses?.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-neutral-600">Ingresos</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-neutral-900">
                        {formatCurrency(selectedAnalytics.totalRechargeAmount)}
                      </p>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-red-600" />
                        <span className="text-xs sm:text-sm font-medium text-neutral-600">Costos Totales</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-red-600">
                        {formatCurrency(selectedAnalytics.totalCosts)}
                      </p>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-xs sm:text-sm font-medium text-neutral-600">ROI</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {selectedAnalytics.roi.toFixed(1)}x
                      </p>
                    </div>
                  </div>

                  {/* Métricas de Costos Reales */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-red-100">
                    <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Análisis de Costos Reales
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-neutral-600">Bonus Otorgado</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(selectedAnalytics.totalBonusGiven)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Impacto directo en margen
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-neutral-600">Comisiones Influencer</span>
                        </div>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(selectedAnalytics.totalInfluencerCommissions)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Costo de adquisición
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-neutral-600">
                            {analyticsType === 'campaign' ? 'CAC Real' : 'Costo Real/Usuario'}
                              </span>
                      </div>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(
                            analyticsType === 'campaign' 
                              ? (selectedAnalytics as CampaignAnalytics).realCAC
                              : (selectedAnalytics as CodeAnalytics).realCostPerUser
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Incluye bonus + comisiones
                        </p>
                      </div>
                    </div>

                    {/* Impacto en Margen */}
                    <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-red-900">Impacto en Margen Real</h4>
                          <p className="text-xs text-red-600 mt-1">
                            El bonus reduce directamente el margen de cada recarga
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-red-600">
                            -{selectedAnalytics.marginImpact.toFixed(1)}%
                          </p>
                          <p className="text-xs text-red-500">del margen</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Métricas Adicionales */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-neutral-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
                        Información Detallada
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Usuarios únicos</span>
                          <span className="text-sm font-semibold text-neutral-900">
                            {selectedAnalytics.uniqueUsers.toLocaleString()}
                              </span>
                            </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Promedio por recarga</span>
                          <span className="text-sm font-semibold text-neutral-900">
                            {formatCurrency(selectedAnalytics.averageRechargeAmount)}
                        </span>
                            </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Bonus total otorgado</span>
                          <span className="text-sm font-semibold text-purple-600">
                            {formatCurrency(selectedAnalytics.totalBonusGiven)}
                        </span>
                          </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Comisiones influencer</span>
                          <span className="text-sm font-semibold text-orange-600">
                            {formatCurrency(selectedAnalytics.totalInfluencerCommissions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="text-sm font-medium text-neutral-700">Costos totales</span>
                          <span className="text-sm font-bold text-red-600">
                            {formatCurrency(selectedAnalytics.totalCosts)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">
                            {analyticsType === 'campaign' ? 'CAC Real' : 'Costo real por usuario'}
                          </span>
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(
                              analyticsType === 'campaign' 
                                ? (selectedAnalytics as CampaignAnalytics).realCAC
                                : (selectedAnalytics as CodeAnalytics).realCostPerUser
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Ingresos netos</span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(selectedAnalytics.netRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">ROI</span>
                          <span className="text-sm font-semibold text-green-600">
                            {selectedAnalytics.roi.toFixed(1)}x
                          </span>
                        </div>
                    </div>
                </div>

                    {/* Gráfico de uso por fecha (solo para códigos) */}
                    {analyticsType === 'code' && (selectedAnalytics as CodeAnalytics).usageByDate && (
                      <div className="bg-neutral-50 rounded-xl p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
                          Uso por Fecha
                    </h3>
                        <div className="space-y-3">
                          {(selectedAnalytics as CodeAnalytics).usageByDate.map((usage, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-neutral-600">
                                {new Date(usage.date).toLocaleDateString('es-ES')}
                        </span>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-neutral-900">
                                  {usage.uses} usos
                      </div>
                                <div className="text-xs text-neutral-500">
                                  {formatCurrency(usage.amount)}
                      </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Segmentos de usuarios (solo para campañas) */}
                    {analyticsType === 'campaign' && (selectedAnalytics as CampaignAnalytics).topUserSegments && (
                      <div className="bg-neutral-50 rounded-xl p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
                          Segmentos de Usuarios
                        </h3>
                        <div className="space-y-3">
                          {(selectedAnalytics as CampaignAnalytics).topUserSegments.map((segment, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-neutral-700">
                                  {segment.segment}
                                </span>
                                <span className="text-sm font-semibold text-neutral-900">
                                  {segment.users} usuarios
                        </span>
                      </div>
                              <div className="flex justify-between items-center text-xs text-neutral-500">
                                <span>Total gastado: {formatCurrency(segment.totalSpent)}</span>
                                <span>Bonus: {formatCurrency(segment.bonusGiven)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-between items-center">
                  <div className="text-xs sm:text-sm text-neutral-500">
                    Datos actualizados en tiempo real • Última actualización: {new Date().toLocaleString('es-ES')}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAnalyticsModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ver Detalle de Campaña */}
      <AnimatePresence>
        {isViewModalOpen && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 rounded-xl">
                      <span className="text-lg">{selectedCampaign.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">
                        {selectedCampaign.name}
                      </h2>
                      <p className="text-sm text-neutral-600">
                        Detalle de Campaña
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Descripción</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedCampaign.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Estado</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(selectedCampaign.status)}`}>
                            {getStatusIcon(selectedCampaign.status)}
                            {selectedCampaign.status === 'Active' ? 'Activa' : 
                             selectedCampaign.status === 'Inactive' ? 'Inactiva' : 
                             selectedCampaign.status === 'scheduled' ? 'Programada' : 'Expirada'}
                        </span>
                      </div>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Tipo de Bonus</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedCampaign.type === 'Percentage' ? `${selectedCampaign.value}%` : formatCurrency(selectedCampaign.value)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Recarga Mínima</label>
                        <p className="text-sm text-neutral-900 mt-1">{formatCurrency(selectedCampaign.minRecharge)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Usuarios Objetivo</label>
                        <p className="text-sm text-neutral-900 mt-1">{getUserTypeLabel(selectedCampaign.targetUsers)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Usos</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedCampaign.usageCount.toLocaleString()} 
                          {selectedCampaign.usageLimit && ` / ${selectedCampaign.usageLimit.toLocaleString()}`}
                        </p>
                      </div>
                  </div>
                </div>

                  {/* Fechas */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Vigencia
                  </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Inicio</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {new Date(selectedCampaign.startDate).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Fin</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString('es-ES') : 'Sin fecha límite'}
                        </p>
                          </div>
                        </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Términos y Condiciones
                    </h3>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {selectedCampaign.termsAndConditions}
                    </p>
                  </div>

                  {/* Información de Creación */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Información de Creación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="text-sm font-medium text-neutral-600">Creado por</label>
                        <p className="text-sm text-neutral-900 mt-1">Admin</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Creación</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {new Date(selectedCampaign.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ver Detalle de Código */}
      <AnimatePresence>
        {isViewCodeModalOpen && selectedDiscountCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsViewCodeModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 rounded-xl">
                      <span className="text-lg">{selectedDiscountCode.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">
                        {selectedDiscountCode.name}
                      </h2>
                      <p className="text-sm text-neutral-600">
                        Código: {selectedDiscountCode.code}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsViewCodeModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Descripción</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedDiscountCode.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Estado</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(selectedDiscountCode.status)}`}>
                            {getStatusIcon(selectedDiscountCode.status)}
                            {selectedDiscountCode.status === 'active' ? 'Activo' : 
                             selectedDiscountCode.status === 'inactive' ? 'Inactivo' : 'Expirado'}
                          </span>
                        </div>
                        </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Tipo de Bonus</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedDiscountCode.type === 'percentage' ? `${selectedDiscountCode.value}%` : formatCurrency(selectedDiscountCode.value)}
                        </p>
                        </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Recarga Mínima</label>
                        <p className="text-sm text-neutral-900 mt-1">{formatCurrency(selectedDiscountCode.minRecharge)}</p>
                        </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Usuarios Objetivo</label>
                        <p className="text-sm text-neutral-900 mt-1">{getUserTypeLabel(selectedDiscountCode.targetUsers)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Límite por Usuario</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedDiscountCode.maxUsesPerUser}</p>
                      </div>
                  </div>
                </div>

                  {/* Uso y Límites */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Uso y Límites
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="text-sm font-medium text-neutral-600">Usos Actuales</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedDiscountCode.usageCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Límite Total</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedDiscountCode.usageLimit ? selectedDiscountCode.usageLimit.toLocaleString() : 'Sin límite'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Bonus Máximo</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedDiscountCode.maxBonus ? formatCurrency(selectedDiscountCode.maxBonus) : 'Sin límite'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Tipo de Código</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedDiscountCode.isCustomCode ? 'Personalizado' : 'Generado automáticamente'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Vigencia
                  </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Inicio</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {new Date(selectedDiscountCode.startDate).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Fin</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedDiscountCode.endDate ? new Date(selectedDiscountCode.endDate).toLocaleDateString('es-ES') : 'Sin fecha límite'}
                        </p>
                        </div>
                        </div>
                        </div>

                  {/* Términos y Condiciones */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Términos y Condiciones
                    </h3>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {selectedDiscountCode.termsAndConditions}
                    </p>
                        </div>

                  {/* Información de Creación */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Información de Creación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Creado por</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedDiscountCode.createdBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Fecha de Creación</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {new Date(selectedDiscountCode.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewCodeModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Crear Campaña */}
      <AnimatePresence>
        {isCreateCampaignConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateCampaignConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Plus className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Crear Nueva Campaña
                    </h2>
                    <p className="text-sm text-neutral-600">
                      ¿Estás seguro de que deseas crear una nueva campaña de bonos?
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">
                        Importante
                      </h3>
                      <p className="text-sm text-amber-800">
                        Las campañas de bonos afectan directamente los márgenes de ganancia. 
                        Asegúrate de revisar cuidadosamente la configuración antes de activarla.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Configurar tipo y valor del bono</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Definir usuarios objetivo y límites</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Establecer fechas de vigencia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Revisar términos y condiciones</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateCampaignConfirmOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmCreateCampaign}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Crear Código */}
      <AnimatePresence>
        {isCreateCodeConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateCodeConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Crear Código Promocional
                    </h2>
                    <p className="text-sm text-neutral-600">
                      ¿Estás seguro de que deseas crear un nuevo código promocional?
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">
                        Código Promocional
                      </h3>
                      <p className="text-sm text-blue-800">
                        Los códigos promocionales pueden incluir comisiones para influencers. 
                        Esto afectará el CAC real y los márgenes de ganancia.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Generar o personalizar código</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Configurar valor del bono</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Definir comisión de influencer (opcional)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Establecer límites de uso</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateCodeConfirmOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmCreateCode}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Advertencia - Campaña Activa */}
      <AnimatePresence>
        {activeCampaignWarningOpen && campaignToActivate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelActivateCampaign}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Campaña Activa Detectada
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Solo puede haber una campaña activa al tiempo
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">
                        Restricción del Sistema
                      </h3>
                      <p className="text-sm text-amber-800">
                        Ya tienes una campaña activa. Para activar "{campaignToActivate.name}", 
                        la campaña actual será desactivada automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Pause className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-900">Se desactivará:</span>
                    </div>
                    <p className="text-sm text-red-800">
                      {getActiveCampaign()?.name || 'Campaña actual'}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Se activará:</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {campaignToActivate.name}
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">
                        ¿Por qué esta restricción?
                      </h3>
                      <p className="text-sm text-blue-800">
                        Las campañas aparecen en la wallet de los usuarios y afectan las recargas. 
                        Múltiples campañas activas causarían conflictos en el sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={cancelActivateCampaign}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmActivateCampaign}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Cambiar Campaña
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}