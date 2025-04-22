import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, Trash2, Check, AlertCircle,
  Building, DollarSign, Clock, Shield
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer';
  last4?: string;
  expiry?: string;
  brand?: string;
  bankName?: string;
  accountLast4?: string;
  isDefault: boolean;
}

export function Payments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      last4: '4242',
      expiry: '12/25',
      brand: 'visa',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank_transfer',
      bankName: 'Bancolombia',
      accountLast4: '1234',
      isDefault: false
    }
  ]);

  const [isAddingMethod, setIsAddingMethod] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Métodos de Pago</h1>
            <p className="text-neutral-600">
              Gestiona tus métodos de pago para tus campañas publicitarias
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => setIsAddingMethod(true)}
          >
            Añadir método
          </Button>
        </div>

        <div className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <Card.Body className="divide-y divide-neutral-200">
              {paymentMethods.map((method) => (
                <div key={method.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center">
                        {method.type === 'credit_card' ? (
                          <CreditCard className="w-6 h-6 text-neutral-600" />
                        ) : (
                          <Building className="w-6 h-6 text-neutral-600" />
                        )}
                      </div>
                      <div>
                        {method.type === 'credit_card' ? (
                          <>
                            <p className="font-medium capitalize">
                              {method.brand} ****{method.last4}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Expira {method.expiry}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{method.bankName}</p>
                            <p className="text-sm text-neutral-600">
                              ****{method.accountLast4}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-primary-50 text-primary text-sm rounded-full">
                          Principal
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-error-600 hover:bg-error-50"
                        onClick={() => {
                          // Handle delete
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Security Info */}
          <Card>
            <Card.Body className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-semibold">Pagos Seguros</h2>
              </div>
              <p className="text-neutral-600">
                Todos los pagos son procesados de forma segura a través de nuestro proveedor de pagos.
                Tus datos nunca son almacenados en nuestros servidores.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <Shield className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-medium mb-1">Encriptación SSL</h3>
                  <p className="text-sm text-neutral-600">
                    Todos los datos son encriptados con SSL de 256 bits
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-medium mb-1">Sin cargos ocultos</h3>
                  <p className="text-sm text-neutral-600">
                    Precios transparentes sin costos adicionales
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <Clock className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-medium mb-1">Pagos automáticos</h3>
                  <p className="text-sm text-neutral-600">
                    Gestión automática de pagos recurrentes
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {isAddingMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingMethod(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold">Añadir método de pago</h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nombre en la tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="NOMBRE APELLIDO"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-neutral-600">
                      Guardar como método de pago principal
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAddingMethod(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Check}
                    onClick={() => {
                      // Handle save
                      setIsAddingMethod(false);
                    }}
                  >
                    Guardar método
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