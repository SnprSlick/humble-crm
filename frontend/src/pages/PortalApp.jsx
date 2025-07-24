import { useState } from "react";
import LoginPage from "./portal/LoginPage";
import CustomerDashboard from "./portal/CustomerDashboard";

export default function PortalApp() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("portalToken");
    const customerId = localStorage.getItem("portalCustomerId");
    return token && customerId ? { token, customerId } : null;
  });

  const handleLogin = ({ token, customer_id }) => {
    localStorage.setItem("portalToken", token);
    localStorage.setItem("portalCustomerId", customer_id);
    setAuth({ token, customerId: customer_id });
  };

  return auth ? (
    <CustomerDashboard auth={auth} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
