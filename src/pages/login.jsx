import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import AnimatedText from "../components/animation-text";
import AnimatedLogo from "../components/animation-logo";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin component

const CLIENT_ID = '1059787373534-utfjan3lm1npq3ifvkum3chjlpnvenr6.apps.googleusercontent.com'; // Replace with your Google Client ID

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // Function to store data in cookies
  const setCookie = (name, value, days) => {
    if (!value) return; // Prevent storing undefined values
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; Secure${expires}`;
  };

  // Handle form login submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ensure form does not refresh the page
    setIsLoading(true);
    setErrors({});

    // Form validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://kizachat-server.onrender.com/api/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (data.message === "Login successful") {
        setCookie("_id", formData._id, 50); // Placeholder for _id
        setCookie("email", formData.email, 7); // Placeholder for email
        navigate("/");
      } else {
        throw new Error("Unexpected server response.");
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      const { tokenId } = response;
      
      // Send the token to your server for validation
      const res = await axios.post(
        "https://kizachat-server.onrender.com/api/auth/google-login",
        { token: tokenId }
      );
      
      const data = res.data;
      
      if (data.message === "Google Login successful") {
        setCookie("_id", data._id, 50); // Store user info in cookies
        setCookie("email", data.email, 7);
        navigate("/");
      } else {
        setErrors({ submit: "Google Sign-In failed. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "Google Sign-In failed. Please try again." });
    }
  };

  const description = `Welcome to KizaChat.ai, your gateway to intelligent conversations. Our advanced AI-powered platform offers seamless communication, personalized interactions, and cutting-edge language processing.`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
      <div className="flex w-full shadow-2xl overflow-hidden">
        {/* Left side - Image and Description */}
        <div className="hidden lg:flex w-1/2 relative bg-blue-600">
          <img
            src="https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="AI Chat Background"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to <AnimatedLogo /></h1>
            <AnimatedText text={description} className="text-sm leading-relaxed" />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-6">
              <img
                src="png/white-logo.png"
                alt="Login Banner"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <GoogleLogin
                clientId={CLIENT_ID}
                buttonText="Sign up with Google"
                onSuccess={handleGoogleResponse}
                onFailure={handleGoogleResponse}
                cookiePolicy="single_host_origin"
              />
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
