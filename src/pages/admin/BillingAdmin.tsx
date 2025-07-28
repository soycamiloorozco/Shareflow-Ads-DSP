import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Download, FileText, DollarSign, Calendar,
  ChevronRight, Plus, ArrowUpRight, Wallet, Receipt, Settings,
  Building, Users, Clock, AlertTriangle, TrendingUp, Filter,
  RefreshCcw, FileSpreadsheet, CheckCircle, XCircle, Eye,
  BarChart3, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RequireAuth } from '../../components/RequireAuth';
import Select from 'react-select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Revenue {
  id: string;
  type: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  amount: number;
  screen: string;
  date: string;
  status: 'pending' | 'paid' | 'processing';
  campaign: string;
}

interface PaymentSchedule {
  id: string;
  amount: number;
  scheduledDate: string;
  status: 'scheduled' | 'processing' | 'paid' | 'failed';
  period: string;
  screens: string[];
}

const mockRevenue: Revenue[] = [
  {
    id: '1',
    type: 'moment',
    amount: 2500000,
    screen: 'Plaza Mayor LED',
    date: '2024-03-15',
    status: 'paid',
    campaign: 'Summer Campaign 2024'
  },
  {
    id: '2',
    type: 'daily',
    amount: 1800000,
    screen: 'Santafé Premium',
    date: '2024-03-14',
    status: 'pending',
    campaign: 'Spring Collection'
  }
];

const mockPaymentSchedule: PaymentSchedule[] = [
  {
    id: '1',
    amount: 4500000,
    scheduledDate: '2024-04-01',
    status: 'scheduled',
    period: 'Marzo 2024',
    screens: ['Plaza Mayor LED', 'Santafé Premium']
  },
  {
    id: '2',
    amount: 3800000,
    scheduledDate: '2024-03-01',
    status: 'paid',
    period: 'Febrero 2024',
    screens: ['Plaza Mayor LED']
  }
];

const revenueByType = [
  { name: 'Momentos', value: 35 },
  { name: 'Por Hora', value: 20 },
  { name: 'Por Día', value: 25 },
  { name: 'Semanal', value: 15 },
  { name: 'Mensual', value: 5 }
];

const COLORS = ['#2F80ED', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export function BillingAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  const totalRevenue = mockRevenue.reduce((sum, rev) => sum + rev.amount, 0);
  const pendingRevenue = mockRevenue
    .filter(rev => rev.status === 'pending')
    .reduce((sum, rev) => sum + rev.amount, 0);

  const nextPayment = mockPaymentSchedule.find(p => p.status === 'scheduled');

  return (
    <RequireAuth allowedRoles={['super_admin', 'financial_admin']}>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Facturación</h1>
              <p className="text-neutral-600">
                Gestiona tus ingresos y programación de pagos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                icon={RefreshCcw}
                onClick={() => {/* Handle sync */}}
              >
                Sincronizar
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={FileSpreadsheet}
                onClick={() => {/* Handle export */}}
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Ingresos Totales</p>
                  <p className="text-2xl font-semibold">
                    ${(totalRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Pendiente de Pago</p>
                  <p className="text-2xl font-semibold">
                    ${(pendingRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-success-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Próximo Pago</p>
                  <p className="text-2xl font-semibold">
                    ${nextPayment ? (nextPayment.amount / 1000000).toFixed(1) + 'M' : '0'}
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Crecimiento</p>
                  <p className="text-2xl font-semibold">+24.3%</p>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revenue Chart */}
              <Card>
                <Card.Body>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Ingresos por Pantalla</h2>
                    <div className="flex items-center gap-2">
                      <Select
                        placeholder="Periodo"
                        options={[
                          { value: '7d', label: 'Últimos 7 días' },
                          { value: '30d', label: 'Últimos 30 días' },
                          { value: '90d', label: 'Últimos 90 días' }
                        ]}
                        onChange={(option) => setSelectedPeriod(option?.value || null)}
                        className="w-[150px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Filter}
                      >
                        Filtros
                      </Button>
                    </div>
                  </div>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis 
                          tickFormatter={(value) => 
                            `$${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#2F80ED"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>

              {/* Revenue Distribution */}
              <Card>
                <Card.Body>
                  <h2 className="text-xl font-semibold mb-6">
                    Distribución de Ingresos
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {revenueByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {revenueByType.map((type, index) => (
                        <div key={type.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index] }}
                            />
                            <span>{type.name}</span>
                          </div>
                          <span className="font-medium">{type.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Payment Schedule */}
              <Card>
                <Card.Body>
                  <h2 className="text-xl font-semibold mb-6">
                    Programación de Pagos
                  </h2>
                  <div className="space-y-4">
                    {mockPaymentSchedule.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 bg-white rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-neutral-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{payment.period}</h3>
                              <p className="text-sm text-neutral-600">
                                {new Date(payment.scheduledDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`
                            px-3 py-1 rounded-full text-sm flex items-center gap-2
                            ${payment.status === 'paid'
                              ? 'bg-success-50 text-success-600'
                              : payment.status === 'scheduled'
                              ? 'bg-primary-50 text-primary'
                              : payment.status === 'processing'
                              ? 'bg-warning-50 text-warning-600'
                              : 'bg-error-50 text-error-600'
                            }
                          `}>
                            {payment.status === 'paid' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : payment.status === 'scheduled' ? (
                              <Clock className="w-4 h-4" />
                            ) : payment.status === 'processing' ? (
                              <RefreshCcw className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="capitalize">{payment.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Monto</p>
                            <p className="font-medium">
                              ${payment.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Pantallas</p>
                            <p className="font-medium">
                              {payment.screens.length} pantallas
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {payment.screens.map((screen) => (
                            <span
                              key={screen}
                              className="px-2 py-1 bg-neutral-100 rounded text-sm"
                            >
                              {screen}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Revenue Details */}
              <Card>
                <Card.Body>
                  <h2 className="text-lg font-semibold mb-4">
                    Detalles de Ingresos
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        Ingresos por Momentos
                      </p>
                      <p className="text-2xl font-semibold">$12.5M</p>
                      <div className="flex items-center gap-2 text-success-600">
                        <ArrowUpCircle className="w-4 h-4" />
                        <span className="text-sm">+15.4% vs. mes anterior</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        Ingresos por Tiempo
                      </p>
                      <p className="text-2xl font-semibold">$8.3M</p>
                      <div className="flex items-center gap-2 text-success-600">
                        <ArrowUpCircle className="w-4 h-4" />
                        <span className="text-sm">+8.2% vs. mes anterior</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        Ingresos por Circuitos
                      </p>
                      <p className="text-2xl font-semibold">$5.2M</p>
                      <div className="flex items-center gap-2 text-error-600">
                        <ArrowDownCircle className="w-4 h-4" />
                        <span className="text-sm">-2.1% vs. mes anterior</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Payment Info */}
              <Card>
                <Card.Body className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Información de Pago</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Settings}
                      onClick={() => {/* Handle settings */}}
                    />
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h3 className="font-medium mb-2">Próximo Pago</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Fecha</span>
                        <span className="font-medium">1 de Abril, 2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Monto</span>
                        <span className="font-medium">$4.5M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Pantallas</span>
                        <span className="font-medium">3 pantallas</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Método de Pago</h3>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="font-medium">Bancolombia</p>
                        <p className="text-sm text-neutral-600">****1234</p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Quick Actions */}
              <Card>
                <Card.Body>
                  <h2 className="text-lg font-semibold mb-4">
                    Acciones Rápidas
                  </h2>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-neutral-600" />
                        <span>Generar factura</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-neutral-600" />
                        <span>Descargar reportes</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-neutral-600" />
                        <span>Configurar pagos</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}