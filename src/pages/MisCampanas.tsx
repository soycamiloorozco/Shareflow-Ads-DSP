import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Monitor, Users, Eye, Edit, Trash2, Calendar, 
  TrendingUp, CheckCircle, XCircle, LayoutGrid, LayoutList, 
  Clock, DollarSign, AlertCircle, Trophy, Tv, Zap, BarChart3, 
  Layers, Wallet, ArrowRight, Play, Pause, Settings, Filter,
  Target, Star, Heart, Share2, Download, MoreHorizontal,
  Activity, Briefcase, FileText, PieChart, MapPin, ChevronRight,
  Radio, WifiOff, Loader2, TrendingDown, ChevronDown, ArrowUpDown,
  ExternalLink, Copy, RefreshCw, ShoppingCart, Bot, AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCampaigns, Campaign, DraftCampaign } from '../contexts/CampaignContext';

interface SportEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  date: string;
  time: string;
  moments: number;
  price: number;
  status: 'upcoming' | 'live' | 'completed';
}

const mockEvents: SportEvent[] = [
  {
    id: 'event1',
    homeTeam: 'Atlético Nacional',
    awayTeam: 'Independiente Medellín',
    stadium: 'Estadio Atanasio Girardot',
    date: '2024-04-15',
    time: '19:30',
    moments: 2,
    price: 4500000,
    status: 'upcoming'
  }
];

type TabType = 'all' | 'active' | 'paused' | 'completed' | 'drafts';
type SortField = 'name' | 'status' | 'budget' | 'spent' | 'impressions' | 'reach' | 'frequency' | 'date' | 'type';
type SortDirection = 'asc' | 'desc';

// Enhanced campaign data with DOOH-specific metrics
const enhanceDOOHCampaignData = (campaign: Campaign) => {
  const impressions = campaign.impressions || 0;
  
  // DOOH specific metrics
  const reach = Math.floor(impressions * 0.75); // Reach is typically 75% of impressions for DOOH
  const frequency = reach > 0 ? impressions / reach : 0;
  const cpm = campaign.spent > 0 ? (campaign.spent / impressions) * 1000 : 0;
  
  // Calculate screens count based on campaign type
  const screensCount = (campaign.type || 'marketplace') === 'marketplace' 
    ? Math.floor(Math.random() * 5) + 1 // 1-5 screens for marketplace
    : Math.floor(Math.random() * 50) + 10; // 10-60 screens for programmatic

  return {
    ...campaign,
    reach,
    frequency,
    cpm,
    screensCount
  };
};

export function MisCampanas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { campaigns = [], drafts = [] } = useCampaigns();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [campaignType, setCampaignType] = useState('all');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionCampaign, setSelectedRejectionCampaign] = useState<any>(null);

  // Enhanced campaign data with DOOH metrics
  const enhancedCampaigns = campaigns.map(enhanceDOOHCampaignData);

  // Filter campaigns based on active tab
  const getFilteredCampaigns = () => {
    let filtered = enhancedCampaigns;

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(c => c.status === 'active');
        break;
      case 'paused':
        filtered = filtered.filter(c => c.status === 'paused');
        break;
      case 'completed':
        filtered = filtered.filter(c => c.status === 'completed');
        break;
      case 'drafts':
        return drafts;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(campaign => 
        campaign.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by campaign type
    if (campaignType !== 'all') {
      filtered = filtered.filter(campaign => (campaign.type || 'marketplace') === campaignType);
    }

    return filtered;
  };

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    const filtered = getFilteredCampaigns();
    
    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'type':
          aValue = a.type || 'marketplace';
          bValue = b.type || 'marketplace';
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'spent':
          aValue = a.spent || 0;
          bValue = b.spent || 0;
          break;
        case 'impressions':
          aValue = a.impressions || 0;
          bValue = b.impressions || 0;
          break;
        case 'reach':
          aValue = (a as any).reach || 0;
          bValue = (b as any).reach || 0;
          break;
        case 'frequency':
          aValue = (a as any).frequency || 0;
          bValue = (b as any).frequency || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [getFilteredCampaigns(), sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === sortedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(sortedCampaigns.map(c => c.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'En vivo';
      case 'paused': return 'Pausada';
      case 'completed': return 'Completada';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getPurchaseTypeConfig = (type: string) => {
    switch (type) {
      case 'programmatic':
    return {
          label: 'Programático',
          icon: <Bot className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          canPause: true,
          description: ''
        };
      case 'marketplace':
        return {
          label: 'Marketplace',
          icon: <ShoppingCart className="w-4 h-4 text-blue-600" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          canPause: false,
          description: ''
        };
      case 'events':
        return {
          label: 'Eventos Deportivos',
          icon: <Trophy className="w-4 h-4 text-orange-600" />,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          canPause: false,
          description: ''
        };
      default:
        return {
          label: 'Otro',
          icon: <Briefcase className="w-4 h-4 text-gray-600" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          canPause: false,
          description: ''
        };
    }
   };

  // Calculate summary stats for DOOH
  const summaryStats = useMemo(() => {
    const activeCampaigns = enhancedCampaigns.filter(c => c.status === 'active');
    const totalSpent = enhancedCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalImpressions = enhancedCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalReach = enhancedCampaigns.reduce((sum, c) => sum + ((c as any).reach || 0), 0);
    const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;
    const totalScreens = enhancedCampaigns.reduce((sum, c) => sum + ((c as any).screensCount || 0), 0);

    return {
      total: enhancedCampaigns.length,
      active: activeCampaigns.length,
      totalSpent,
      totalImpressions,
      totalReach,
      avgFrequency,
      totalScreens
    };
  }, [enhancedCampaigns]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Filter selected campaigns that can be paused (only programmatic)
  const selectedPausableCampaigns = selectedCampaigns.filter(id => {
    const campaign = sortedCampaigns.find(c => c.id === id);
    return campaign && getPurchaseTypeConfig(campaign.type || 'marketplace').canPause;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campañas DOOH</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona tus campañas de publicidad exterior digital
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              <button
                  onClick={() => navigate('/marketplace')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                  <Plus className="w-4 h-4" />
                Nueva campaña
              </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total campañas</p>
                    <p className="text-lg font-semibold text-gray-900">{summaryStats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">En vivo</p>
                    <p className="text-lg font-semibold text-gray-900">{summaryStats.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Inversión total</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCompactNumber(summaryStats.totalSpent)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Impresiones</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCompactNumber(summaryStats.totalImpressions)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Alcance total</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCompactNumber(summaryStats.totalReach)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pantallas activas</p>
                    <p className="text-lg font-semibold text-gray-900">{summaryStats.totalScreens}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar campañas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tab Filters */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'active', label: 'En vivo' },
                { key: 'paused', label: 'Pausadas' },
                { key: 'completed', label: 'Completadas' },
                { key: 'drafts', label: 'Borradores' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
          </div>

            {/* Type Filter */}
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="programmatic">Smart Campaigns</option>
              <option value="marketplace">Marketplace</option>
              <option value="events">Eventos</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Período</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="last_7_days">Últimos 7 días</option>
                    <option value="last_30_days">Últimos 30 días</option>
                    <option value="last_90_days">Últimos 90 días</option>
                    <option value="this_year">Este año</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
                <label className="flex items-center">
              <input
                    type="checkbox"
                    checked={selectedCampaigns.length === sortedCampaigns.length && sortedCampaigns.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <span className="text-sm text-gray-700">
                  {selectedCampaigns.length > 0 
                    ? `${selectedCampaigns.length} seleccionadas`
                    : `${sortedCampaigns.length} campañas`
                  }
                </span>
              </div>
              {selectedPausableCampaigns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Play className="w-3 h-3" />
                    Activar ({selectedPausableCampaigns.length})
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Pause className="w-3 h-3" />
                    Pausar ({selectedPausableCampaigns.length})
                  </button>
                </div>
              )}
            </div>
            </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-4 px-6 py-4"></th>
                  <th className="text-left px-6 py-4">
              <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Campaña
                      <ArrowUpDown className="w-3 h-3" />
              </button>
                  </th>
                  <th className="text-left px-6 py-4">
              <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Tipo de Compra
                      <ArrowUpDown className="w-3 h-3" />
              </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Estado
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('budget')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Presupuesto
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('spent')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Gastado
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('impressions')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Impresiones
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('reach')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Alcance
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('frequency')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-gray-900"
                    >
                      Frecuencia
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <span className="text-xs font-medium text-gray-700 uppercase">Pantallas</span>
                  </th>
                  <th className="text-center px-6 py-4">
                    <span className="text-xs font-medium text-gray-700 uppercase">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedCampaigns.map((campaign: any) => {
                  const purchaseTypeConfig = getPurchaseTypeConfig(campaign.type || 'marketplace');
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={() => handleSelectCampaign(campaign.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-gray-600" />
            </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-gray-900 leading-tight">{campaign.name}</div>
                              {campaign.creativeRejections?.hasRejections && (
                                <button
                                  onClick={() => {
                                    setSelectedRejectionCampaign(campaign);
                                    setShowRejectionModal(true);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-xs font-medium transition-colors"
                                  title="Rechazos de creativos requieren atención"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{campaign.creativeRejections.rejectedScreens} rechazadas</span>
                                </button>
                              )}
          </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {campaign.creativeRejections?.hasRejections ? (
                                <span>
                                  {campaign.creativeRejections.approvedScreens} de {campaign.creativeRejections.totalScreens} pantallas activas
                                </span>
                              ) : (
                                'Campaña DOOH'
                              )}
        </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${purchaseTypeConfig.bgColor} ${purchaseTypeConfig.textColor} ${purchaseTypeConfig.borderColor}`}>
                          {purchaseTypeConfig.icon}
                          <span>{purchaseTypeConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(campaign.budget || 0)}</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(campaign.spent || 0)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {campaign.budget ? `${Math.round(((campaign.spent || 0) / campaign.budget) * 100)}%` : '0%'}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCompactNumber(campaign.impressions || 0)}</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCompactNumber(campaign.reach || 0)}</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{campaign.frequency?.toFixed(1)}x</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">{campaign.screensCount || 0}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Ver detalles"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Only show pause/play for campaigns that can be paused */}
                          {purchaseTypeConfig.canPause && (
                            <button 
                              className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                              title={campaign.status === 'active' ? 'Pausar' : 'Activar'}
                            >
                              {campaign.status === 'active' ? 
                                <Pause className="w-4 h-4" /> : 
                                <Play className="w-4 h-4" />
                              }
                            </button>
                          )}
                          {!purchaseTypeConfig.canPause && (
                            <span 
                              className="p-1.5 text-gray-300 rounded-lg cursor-not-allowed"
                              title="No se puede pausar - Compra por reserva"
                            >
                              <Pause className="w-4 h-4" />
                            </span>
                          )}
                          <button 
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedCampaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
            </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron campañas</h3>
            <p className="text-gray-500 mb-6">
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera campaña DOOH'}
            </p>
              {!searchQuery && (
            <button
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
                  Nueva campaña
            </button>
              )}
            </div>
          )}
        </div>

        {/* Table Footer */}
        {sortedCampaigns.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Mostrando {sortedCampaigns.length} de {summaryStats.total} campañas
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <span className="px-3 py-1.5">1</span>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Creative Rejection Details Modal */}
        {showRejectionModal && selectedRejectionCampaign?.creativeRejections && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Estado de Campaña</h2>
                    <p className="text-sm text-gray-600">"{selectedRejectionCampaign.name}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Status Summary */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        APROBADO ({selectedRejectionCampaign.creativeRejections.approvedScreens} de {selectedRejectionCampaign.creativeRejections.totalScreens} pantallas)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="text-lg font-semibold text-orange-600">
                        REQUIERE ATENCIÓN ({selectedRejectionCampaign.creativeRejections.rejectedScreens} pantallas)
                      </span>
                    </div>
                  </div>
                  
                  {/* Performance Impact */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Tu campaña está funcionando al {Math.round((selectedRejectionCampaign.creativeRejections.approvedScreens / selectedRejectionCampaign.creativeRejections.totalScreens) * 100)}% de capacidad</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Presupuesto redistribuido automáticamente en pantallas activas. 
                      {formatCompactNumber(selectedRejectionCampaign.impressions || 0)} impresiones entregadas hasta ahora.
                    </p>
                  </div>
                </div>

                {/* Approved Owners */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Pantallas Aprobadas y Transmitiendo</h3>
                  <div className="space-y-3">
                    {selectedRejectionCampaign.creativeRejections.approvedOwners.map((owner: any, index: number) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-900">{owner.mediaOwner}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              via {owner.ssp}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {owner.screenCount} pantallas
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-green-700">
                          <strong>Ubicaciones:</strong> {owner.locations.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejected Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Pantallas Rechazadas</h3>
                  <div className="space-y-4">
                    {selectedRejectionCampaign.creativeRejections.rejectionDetails.map((rejection: any, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-red-900">{rejection.mediaOwner}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              via {rejection.ssp}
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                              {rejection.screenCount} pantallas
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-red-700 mb-1">
                            <strong>Ubicaciones:</strong> {rejection.locations.join(', ')}
                          </div>
                          <div className="text-sm text-red-700 mb-2">
                            <strong>Rechazado el:</strong> {new Date(rejection.rejectionDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="bg-red-100 rounded-lg p-3 mb-3">
                          <div className="text-sm font-medium text-red-900 mb-1">Razón del rechazo:</div>
                          <div className="text-sm text-red-800">"{rejection.rejectionReason}"</div>
                        </div>

                        {rejection.alternativeContent && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-yellow-900 mb-1">Sugerencia:</div>
                            <div className="text-sm text-yellow-800">{rejection.alternativeContent}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Options */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Opciones Disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-4 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Edit className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-900">Modificar Creative</div>
                        <div className="text-sm text-blue-700">Crear versión alternativa para pantallas rechazadas</div>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-red-900">Remover Pantallas</div>
                        <div className="text-sm text-red-700">Excluir permanentemente las pantallas rechazadas</div>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-900">Continuar Solo con Aprobadas</div>
                        <div className="text-sm text-green-700">Mantener campaña activa en pantallas aprobadas</div>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-purple-900">Contactar Soporte</div>
                        <div className="text-sm text-purple-700">Negociar con media owner para aprobación</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  ⚡ Tu campaña continúa funcionando mientras decides qué hacer
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    Resolver Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}