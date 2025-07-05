import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './pages/chat-interface';
import Messages from './pages/messages';
import Login from './pages/login';
import Lg from './pages/legal&policy';
import Tc from './pages/terms&conditional';
import Forgot from './pages/forgotpassword';
import Register from './pages/register';
import Dashboard from './layouts/dashboard';
import VoiceAgent from './pages/voice_agent';

function WithDashboard(Component) {
  return (
    <Dashboard>
      <Component />
    </Dashboard>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="1059787373534-utfjan3lm1npq3ifvkum3chjlpnvenr6.apps.googleusercontent.com">
      <Router>
        <Routes>
          {/* Routes inside Dashboard */}
          <Route path="/" element={WithDashboard(ChatInterface)} />
          <Route path="/chat/:id" element={WithDashboard(Messages)} />
          <Route path="/chat/kiza-agent" element={WithDashboard(VoiceAgent)} />


          {/* Public Routes (No Dashboard Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal" element={<Lg />} />
          <Route path="/policy" element={<Tc />} />
          <Route path="/reset-password" element={<Forgot />} />

          {/* Google Login Route */}
          <Route
            path="/google-login"
            element={
              <div className="flex justify-center items-center min-h-screen">
                <GoogleLogin
                  onSuccess={(response) => {
                    console.log('Login Success:', response);
                    // Here, you can send the Google token to your backend for authentication
                  }}
                  onError={(error) => {
                    console.log('Login Failed:', error);
                  }}
                  useOneTap // Optional: Use the One Tap login experience
                />
              </div>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
