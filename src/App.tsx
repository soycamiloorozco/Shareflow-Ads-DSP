import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { Home } from './pages/Home';
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
import { MyAds } from './pages/MyAds';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { RequirePermission } from './components/RequirePermission';
import { NotAuthorized } from './pages/NotAuthorized';
import { MisCampanas } from './pages/MisCampanas';
import { Biblioteca } from './pages/Biblioteca';
import { SportsEvents } from './pages/SportsEvents';
import { Payments } from './pages/Payments';

export default function App() {
  return (
    <PermissionsProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/sports-events" element={<SportsEvents />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/screen/:id" element={<ScreenDetail />} />
            <Route path="/payments" element={<Payments />} />
            
            {/* Protected Routes */}
            <Route 
              path="/create" 
              element={
                <RequirePermission action="campaigns.create">
                  <CreateCampaign />
                </RequirePermission>
              } 
            />
            <Route 
              path="/event/:id/creative" 
              element={
                <RequirePermission action="campaigns.create">
                  <CreativeUpload />
                </RequirePermission>
              } 
            />
            <Route 
              path="/event/:id/payment" 
              element={
                <RequirePermission action="billing.access">
                  <PaymentDetails />
                </RequirePermission>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/screens" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <ScreensPage />
                </RequirePermission>
              } 
            />
            <Route 
              path="/admin/screens" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <ScreensAdmin />
                </RequirePermission>
              } 
            />
            <Route 
              path="/admin/sports-events" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <SportsEventsAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/inventory" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <InventoryAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/cms" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <CmsAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/billing" 
              element={
                <RequirePermission roles={['super_admin', 'financial_admin']}>
                  <BillingAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/analytics" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin']}>
                  <AnalyticsAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/content-review" 
              element={
                <RequirePermission roles={['super_admin', 'ads_admin', 'content_moderator']}>
                  <ContentReviewAdmin />
                </RequirePermission>
              }
            />
            <Route 
              path="/admin/settings/*" 
              element={
                <RequirePermission roles={['super_admin']}>
                  <SystemSettings />
                </RequirePermission>
              }
            />
            
            {/* User Routes */}
            <Route path="/mis-campanas" element={<MisCampanas />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/profile" element={<div className="p-4">Profile Page</div>} />
            <Route path="/notifications" element={<div className="p-4">Notifications</div>} />
            <Route path="/settings" element={<div className="p-4">Settings</div>} />
            
            {/* Error Routes */}
            <Route path="/not-authorized" element={<NotAuthorized />} />
          </Route>
        </Routes>
        <AIAssistant />
      </Router>
    </PermissionsProvider>
  );
}