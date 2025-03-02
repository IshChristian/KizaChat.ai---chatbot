import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import AnimatedText from "../components/animation-text"
import AnimatedLogo from "../components/animation-logo"
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate form
    const newErrors = {}
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Make the API call to store the user data
    try {
      const response = await axios.post("https://kizachat-server.onrender.com/api/auth/register", formData)
      if (response.status === 200) {
        // Store email in a cookie (expires in 7 days)
        document.cookie = `email=${formData.email}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
  
        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      setErrors({ submit: "Failed to register. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleResponse = async (response) => {
    const { credential } = response;

    // Send the Google credential token to your backend for user registration
    try {
      const googleData = {
        email: response.profileObj.email,
        name: response.profileObj.name,
        password: "", // Handle this as needed for social login
      };
      const registerResponse = await axios.post("https://kizachat-server.onrender.com/api/auth/register", googleData);
      
      if (registerResponse.status === 200) {
        // Store email in a cookie (expires in 7 days)
        document.cookie = `email=${googleData.email}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;

        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Google login failed", error);
      setErrors({ submit: "Google login failed. Please try again." });
    }
  }

  const description = `Join KizaChat.ai and experience the future of intelligent conversations. Our platform offers advanced AI-powered communication, personalized interactions, and cutting-edge language processing. Start your journey with us today and transform the way you connect and communicate.`

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image and Description */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90fHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="AI Chat Background"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">
            Join <AnimatedLogo />
          </h1>
          <AnimatedText text={description} className="text-sm leading-relaxed" />
        </div>
      </div>

      {/* Right side - Registration Form with Card Design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 flex justify-center">
            <img
              src="png/white-logo.png"
              alt="KizaChat Logo"
              className="h-12"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Create your account</h2>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
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
                  onSuccess={handleGoogleResponse}
                  onError={() => console.log("Google login failed")}
                  useOneTap
                  shape="rectangular"
                />
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}