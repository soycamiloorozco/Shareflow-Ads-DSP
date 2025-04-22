import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';

export function NotAuthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-error-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
          Acceso No Autorizado
        </h1>
        
        <p className="text-neutral-600 mb-6">
          No tienes los permisos necesarios para acceder a esta página.
          Si crees que esto es un error, contacta al administrador.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:underline gap-2"
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}