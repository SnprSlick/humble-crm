import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

import MainDashboard from './pages/MainDashboard';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ToDoPage from './pages/ToDoPage';
import CalendarPage from './pages/CalendarPage';
import ServicePage from './pages/ServicePage';
import DropShipDashboard from './pages/DropShipDashboard';
import PortalApp from './pages/PortalApp';

export default function App() {
  return (
    <Router>
      {/* Top border bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-black to-accent z-50 shadow-md" />

      <Routes>
        {/* CRM layout */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/todo" element={<ToDoPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/drop-ship" element={<DropShipDashboard />} />
        </Route>

        {/* Customer portal layout */}
        <Route path="/portal" element={<CustomerLayout />}>
          <Route index element={<PortalApp />} />
        </Route>
      </Routes>
    </Router>
  );
}
