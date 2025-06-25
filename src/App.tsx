import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Layout } from './components/Layout';
// import { AIAssistant } from './components/AIAssistant';
import { Toaster } from 'react-hot-toast';
import { EventDetail } from './pages/EventDetail';
import { CreativeUpload } from './pages/CreativeUpload';
import { PaymentDetails } from './pages/PaymentDetails';
import { CreateCampaign } from './pages/CreateCampaign';
import { Marketplace } from './pages/Marketplace';
import { ScreenDetail } from './pages/ScreenDetail';
import { ScreensPage } from './pages/screens/ScreensPage';
import { ScreensAdmin } from './pages/admin/ScreensAdmin';
import { InventoryAdmin } from './pages/admin/InventoryAdmin';
import { CmsAdmin } from './pages/admin/CmsAdmin';
import { BillingAdmin } from './pages/admin/BillingAdmin';
import { AnalyticsAdmin } from './pages/admin/AnalyticsAdmin';
import { SystemSettings } from './pages/admin/SystemSettings';
import { ContentReviewAdmin } from './pages/admin/ContentReviewAdmin';
import { SportsEventsAdmin } from './pages/admin/SportsEventsAdmin';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { RequirePermission } from './components/RequirePermission';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './components/AuthProvider';
import { NotAuthorized } from './pages/NotAuthorized';
import { MisCampanas } from './pages/MisCampanas';
import { Biblioteca } from './pages/Biblioteca';
import { SportsEvents } from './pages/SportsEvents';
import { Payments } from './pages/Payments';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { RegisterPage } from './pages/auth/RegisterPage';
import { WalletPage } from './pages/WalletPage';
import { PartnerScreens } from './pages/partner/PartnerScreens';
import { WalletCampaignManagement } from './pages/admin/BonusManagement';

export default function App() {
  return (
    <Provider store={store}>
       <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <PermissionsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route element={<Layout />}>
                  {/* Public Routes */}
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      {/* <Home /> */}
                      <SportsEvents />
                    </RequireAuth>
                  } />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/sports-events" element={<SportsEvents />} />
                  <Route path="/event/:id" element={<EventDetail />} />
                  <Route path="/screen/:id" element={<ScreenDetail />} />
                  <Route path="/payments" element={<Payments />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/create" 
                    element={
                      <RequireAuth>
                        <RequirePermission action="campaigns.create">
                          <CreateCampaign />
                        </RequirePermission>
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/event/:id/creative" 
                    element={
                      <RequireAuth>
                        <RequirePermission action="campaigns.create">
                          <CreativeUpload />
                        </RequirePermission>
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/event/:id/payment" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                          <PaymentDetails />
                      </RequireAuth>
                    } 
                  />
                  
                   <Route path="/wallet" element={<WalletPage />} />
                  {/* Admin Routes */}
                  <Route 
                    path="/partner/screens" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <RequirePermission roles={['Admin', 'ads_admin']}>
                          <PartnerScreens />
                        </RequirePermission>
                      </RequireAuth>
                    } 
                  />

                  <Route 
                    path="/admin/discounts" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <RequirePermission roles={['Admin', 'ads_admin']}>
                          <WalletCampaignManagement />
                        </RequirePermission>
                      </RequireAuth>
                    } 
                  />

                  <Route 
                    path="/admin/screens" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <ScreensAdmin />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/admin/sports-events" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <SportsEventsAdmin />
                      </RequireAuth>
                    }
                  />
                  <Route 
                    path="/admin/inventory" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                         <RequirePermission roles={['Admin', 'ads_admin']}>
                          <InventoryAdmin />
                          </RequirePermission>
                      </RequireAuth>
                    }
                  />
                  <Route 
                    path="/admin/cms" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <CmsAdmin />
                      </RequireAuth>
                    }
                  />
                  <Route 
                    path="/admin/billing" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'financial_admin']}>
                         <RequirePermission roles={['Admin', 'ads_admin']}>
                        <BillingAdmin />
                        </RequirePermission>
                      </RequireAuth>
                      
                    }
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin']}>
                        <AnalyticsAdmin />
                      </RequireAuth>
                    }
                  />
                  <Route 
                    path="/admin/content-review" 
                    element={
                      <RequireAuth allowedRoles={['Admin', 'ads_admin', 'content_moderator']}>
                        <ContentReviewAdmin />
                      </RequireAuth>
                    }
                  />
                  <Route 
                    path="/admin/settings/*" 
                    element={
                      <RequireAuth allowedRoles={['Admin']}>
                        <SystemSettings />
                      </RequireAuth>
                    }
                  />
                  
                  {/* User Routes */}
                  <Route 
                    path="/mis-campanas" 
                    element={
                      <RequireAuth>
                        <MisCampanas />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/biblioteca" 
                    element={
                      <RequireAuth>
                        <Biblioteca />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <RequireAuth>
                        <div className="p-4">Profile Page</div>
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <RequireAuth>
                        <div className="p-4">Notifications</div>
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <RequireAuth>
                        <div className="p-4">Settings</div>
                      </RequireAuth>
                    } 
                  />
                  
                  {/* Landing Pages */}
                  <Route path="/thinking" element={
                    <div className="p-4">
                      <h1 className="text-2xl font-bold mb-4">Shareflow Thinking</h1>
                      <p>Esta página estará disponible pronto con nuestros últimos insights sobre DOOH.</p>
                    </div>
                  } />
                  <Route path="/blog" element={
                    <div className="p-4">
                      <h1 className="text-2xl font-bold mb-4">Blog Shareflow</h1>
                      <p>Nuestro blog con artículos y guías sobre publicidad digital.</p>
                    </div>
                  } />
                  <Route path="/help" element={
                    <div className="p-4">
                      <h1 className="text-2xl font-bold mb-4">Centro de Ayuda</h1>
                      <p>Soporte y documentación para usuarios de Shareflow.</p>
                    </div>
                  } />
                  <Route path="/contact" element={
                    <div className="p-4">
                      <h1 className="text-2xl font-bold mb-4">Contacto</h1>
                      <p>Ponte en contacto con nuestro equipo.</p>
                    </div>
                  } />
                  <Route path="/partners-landing" element={
                    <div className="p-4">
                      <h1 className="text-2xl font-bold mb-4">Partners</h1>
                      <p>Información para propietarios de pantallas digitales.</p>
                    </div>
                  } />
                  
                  {/* Error Routes */}
                  <Route path="/not-authorized" element={<NotAuthorized />} />
                </Route>
              </Routes>
              {/* <AIAssistant /> */}
              <Toaster position="top-right" />
            </Router>
          </PermissionsProvider>
        </AuthProvider>
       </PersistGate>
    </Provider>
  );
}