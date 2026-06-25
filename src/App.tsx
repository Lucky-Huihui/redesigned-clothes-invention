import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '@/store';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Items from '@/pages/Items';
import CategoryManage from '@/pages/CategoryManage';
import CategoryDetail from '@/pages/CategoryDetail';
import OutfitSelect from '@/pages/OutfitSelect';
import OutfitResult from '@/pages/OutfitResult';
import Profile from '@/pages/Profile';
import Reactions from '@/pages/Reactions';
import EditProfile from '@/pages/EditProfile';

function RequireAuth() {
  const userId = useAppSelector((s) => s.auth.currentUserId);
  return userId ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const userId = useAppSelector((s) => s.auth.currentUserId);
  return !userId ? <Outlet /> : <Navigate to="/items" replace />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/items" element={<Items />} />
          <Route path="/categories/manage" element={<CategoryManage />} />
          <Route path="/categories/:categoryId" element={<CategoryDetail />} />
          <Route path="/outfits" element={<OutfitSelect />} />
          <Route path="/outfits/result" element={<OutfitResult />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/reactions/:type" element={<Reactions />} />
          <Route path="/profile/edit" element={<EditProfile />} />
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
