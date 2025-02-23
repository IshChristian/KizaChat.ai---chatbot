import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react" // Import Auth0 hook
import axios from "axios" // Use Axios for HTTP requests
import { Link, useNavigate } from "react-router-dom"
import AnimatedText from "../components/animation-text"
import AnimatedLogo from "../components/animation-logo"
import { GoogleLogin } from '@react-oauth/google'; // Import the GoogleLogin component

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
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0() // Auth0 hooks

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
      const response = await axios.post("https://kizachat-server.onrender.com/api/auth/register", formData) // Adjust the URL to your backend's register endpoint
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
    <div className="flex w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex w-full shadow-2xl overflow-hidden">
        {/* Left side - Image and Description */}
        <div className="hidden lg:block lg:w-1/2 relative bg-blue-600">
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

        {/* Right side - Registration Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Create your account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="password"
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
                  {isLoading ? (
                    <div className="flex items-center">
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

              <div className="mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleResponse}
                  onError={() => console.log("Google login failed")}
                  useOneTap
                  shape="rectangular"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                {errors.submit}
              </div>
            )}

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
