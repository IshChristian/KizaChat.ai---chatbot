import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatInterface from "./pages/chat-interface";
import Messages from "./pages/messages";
import Login from "./pages/login";
import Lg from "./pages/legal&policy";
import Tc from "./pages/terms&conditional";
import Register from "./pages/register";
import Dashboard from "./layouts/dashboard";

function WithDashboard(Component) {
  return (
    <Dashboard>
      <Component />
    </Dashboard>
  );
}
export default function App() {
  return (
    <Auth0Provider
      domain={"dev-x5v0hazy1nsv3bln.us.auth0.com"}
      clientId={"cEqSkqgLkeCrL9nIqRYkd6XtMY2LxpaJ"}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
    <Router>
      <Routes>
        {/* Routes inside Dashboard */}
        <Route path="/" element={WithDashboard(ChatInterface)} />
        <Route path="/chat/:id" element={WithDashboard(Messages)} />

        {/* Public Routes (No Dashboard Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/legal" element={<Lg />} />
        <Route path="/policy" element={<Tc />} />
      </Routes>
    </Router>
    </Auth0Provider >
  );
}
