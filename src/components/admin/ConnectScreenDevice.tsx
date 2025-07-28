import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wifi, CheckCircle, XCircle, Loader2, Download, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';

interface ConnectScreenDeviceProps {
  onConnect: (deviceId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectScreenDevice({ onConnect, isOpen, onClose }: ConnectScreenDeviceProps) {
  const [deviceId, setDeviceId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!deviceId.trim()) return;

    setConnectionStatus('connecting');
    setErrorMessage('');

    // Simulate connection process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      if (deviceId.startsWith('SF-')) {
        setConnectionStatus('connected');
        onConnect(deviceId);
      } else {
        throw new Error('Código de dispositivo inválido');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al conectar el dispositivo');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold">Conectar Shareflow Screen</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Download Instructions */}
              <Card>
                <Card.Body className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Paso 1: Descarga Shareflow Screen</h3>
                      <p className="text-sm text-neutral-600">
                        Descarga e instala la aplicación en tu pantalla
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={Download}
                    onClick={() => window.open('https://shareflow.me/download/screen', '_blank')}
                  >
                    Descargar Shareflow Screen
                  </Button>
                </Card.Body>
              </Card>

              {/* Connection Status */}
              <Card>
                <Card.Body className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Paso 2: Conecta tu pantalla</h3>
                      <p className="text-sm text-neutral-600">
                        Abre Shareflow Screen, espera a que se conecte a internet y escribe el código que aparece en pantalla
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      placeholder="Ej: SF-123456"
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleConnect}
                      disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                    >
                      {connectionStatus === 'connecting' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Conectando...
                        </>
                      ) : connectionStatus === 'connected' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Conectado
                        </>
                      ) : (
                        'Conectar'
                      )}
                    </Button>
                  </div>

                  {/* Status Messages */}
                  {connectionStatus === 'connecting' && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando conexión...</span>
                    </div>
                  )}

                  {connectionStatus === 'connected' && (
                    <div className="flex items-center gap-2 text-success-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>¡Tu pantalla está conectada y recibiendo señal!</span>
                    </div>
                  )}

                  {connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-error-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Connection Status Indicator */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wifi className={`w-5 h-5 ${
                    connectionStatus === 'connected' ? 'text-success-500' : 'text-neutral-300'
                  }`} />
                  <span className="text-sm">Estado de conexión</span>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-sm
                  ${connectionStatus === 'connected'
                    ? 'bg-success-50 text-success-600'
                    : connectionStatus === 'connecting'
                    ? 'bg-primary-50 text-primary'
                    : connectionStatus === 'error'
                    ? 'bg-error-50 text-error-600'
                    : 'bg-neutral-100 text-neutral-600'
                  }
                `}>
                  {connectionStatus === 'connected' ? 'Conectado' :
                   connectionStatus === 'connecting' ? 'Conectando...' :
                   connectionStatus === 'error' ? 'Error' : 'Desconectado'}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClose}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}