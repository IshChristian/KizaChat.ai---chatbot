import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from "jwt-decode";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [googleUser, setGoogleUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
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

  // Handle manual form submission
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
      
      // Store user details in cookies
      setCookie("email", formData.email, 7);
      setCookie("name", formData.name, 7);
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to register. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      const { credential } = response;
      const decodedToken = jwt_decode(credential);
      
      // Extract user information from decoded token
      const { email, name, picture } = decodedToken;
  
      const googleData = {
        email,
        name,
        password: "", // Backend should handle social login
        googleSignup: true
      };
  
      const registerResponse = await axios.post(
        "https://kizachat-server.onrender.com/api/auth/register", 
        googleData
      );
  
      // Store user details in cookies
      setCookie("_id", registerResponse.data._id, 50);
      setCookie("email", email, 7);
      setCookie("name", name, 7);
      setCookie("picture", picture, 7);

      // Set Google user state
      setGoogleUser({ email, name, picture });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Google registration failed", error);
      setErrors({ submit: error.response?.data?.message || "Google registration failed. Please try again." });
    }
  }

  // Check for existing registered user on component mount
  useEffect(() => {
    const storedEmail = getCookie("email");
    const storedName = getCookie("name");
    const storedPicture = getCookie("picture");

    if (storedEmail && storedName) {
      setGoogleUser({ email: storedEmail, name: storedName, picture: storedPicture });
    }
  }, []);

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
          
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {googleUser ? `Welcome, ${googleUser.name}` : "Create your account"}
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
                Registered with {googleUser.email}
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
                      onError={() => console.log("Google registration failed")}
                      useOneTap
                      shape="rectangular"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {!googleUser && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}