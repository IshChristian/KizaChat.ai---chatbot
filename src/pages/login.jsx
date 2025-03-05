import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedText from "../components/animation-text";
import AnimatedLogo from "../components/animation-logo";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"


const CLIENT_ID = '1059787373534-utfjan3lm1npq3ifvkum3chjlpnvenr6.apps.googleusercontent.com';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [googleUser, setGoogleUser] = useState(null);
  const navigate = useNavigate();

  // Function to store data in cookies
  const setCookie = (name, value, days) => {
    if (!value) return;
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; Secure${expires}`;
  };

  // Function to get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Handle form login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setCookie("_id", data._id, 50);
        setCookie("email", formData.email, 7);
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
      const { credential } = response;
      const decodedToken = jwtDecode(credential);
      // const decodedToken = jwt_decode(credential);
      
      // Extract user information from decoded token
      const { email, name, picture } = decodedToken;
  
      // const res = await axios.post(
      //   "https://kizachat-server.onrender.com/api/auth/google-login",
      //   { token: credential }
      // );
  
      // const data = res.data;
      
      // Store user details in cookies
      // setCookie("_id", data._id, 50);
      setCookie("email", email, 7);
      setCookie("name", name, 7);
      setCookie("picture", picture, 7);

      // Set Google user state
      setGoogleUser({ email, name, picture });
      
      navigate("/");
    } catch (error) {
      setErrors({ submit: "Google Sign-In failed. Please try again." });
    }
  };

  // Check for existing Google user on component mount
  useEffect(() => {
    const storedEmail = getCookie("email");
    const storedName = getCookie("name");
    const storedPicture = getCookie("picture");

    if (storedEmail && storedName) {
      setGoogleUser({ email: storedEmail, name: storedName, picture: storedPicture });
    }
  }, []);

  const description = `Welcome to KizaChat.ai, your gateway to intelligent conversations. Our advanced AI-powered platform offers seamless communication, personalized interactions, and cutting-edge language processing.`;

  return (
    <div className="flex min-h-screen w-full">
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

      {/* Right side - Login Form with Card Design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 flex justify-center">
            <img
              src="png/white-logo.png"
              alt="KizaChat Logo"
              className="h-12"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {googleUser ? `Welcome, ${googleUser.name}` : "Sign in to your account"}
          </h2>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
              {errors.submit}
            </div>
          )}
          
          {googleUser ? (
            <div className="text-center">
              {googleUser.picture && (
                <img 
                  src={googleUser.picture} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto mb-4" 
                />
              )}
              <p className="text-gray-700 mb-4">
                Signed in with {googleUser.email}
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    placeholder="name@company.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <GoogleLogin
                      clientId={CLIENT_ID}
                      buttonText="Sign in with Google"
                      onSuccess={handleGoogleResponse}
                      onFailure={handleGoogleResponse}
                      cookiePolicy="single_host_origin"
                      scope="openid profile email"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {!googleUser && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}