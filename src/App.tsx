import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '@/store';
import { getToken } from '@/api/client';
import { usePWAInstall, InstallBanner } from '@/components/PWAInstall';
import { useState } from 'react';
import Login from '@/pages/Login';
import Items from '@/pages/Items';
import CategoryDetail from '@/pages/CategoryDetail';
import CategoryManage from '@/pages/CategoryManage';
import OutfitSelect from '@/pages/OutfitSelect';
import OutfitResult from '@/pages/OutfitResult';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import Reactions from '@/pages/Reactions';
import NewItem from '@/pages/NewItem';
import ItemDetail from '@/pages/ItemDetail';

function RequireAuth() {
  const user = useAppSelector((s) => s.auth.user);
  const token = getToken();
  if (!user && !token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestOnly() {
  const user = useAppSelector((s) => s.auth.user);
  const token = getToken();
  if (user || token) return <Navigate to="/items" replace />;
  return <Outlet />;
}

function PWAWrapper() {
  const { canInstall, installed, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const showBanner = canInstall && !installed && !dismissed;

  return (
    <>
      <div style={{ paddingTop: showBanner ? '60px' : 0, transition: 'padding-top 0.3s' }}>
        <Outlet />
      </div>
      <InstallBanner
        canInstall={canInstall && !dismissed}
        onInstall={install}
        onDismiss={() => setDismissed(true)}
      />
    </>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<PWAWrapper />}>
            <Route path="/items" element={<Items />} />
            <Route path="/categories/manage" element={<CategoryManage />} />
            <Route path="/categories/:categoryId" element={<CategoryDetail />} />
            <Route path="/items/new/:categoryId" element={<NewItem />} />
            <Route path="/items/:itemId" element={<ItemDetail />} />
            <Route path="/outfits" element={<OutfitSelect />} />
            <Route path="/outfits/result" element={<OutfitResult />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/reactions/:type" element={<Reactions />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
