import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"
import AnimatedText from "../components/animation-text"
import AnimatedLogo from "../components/animation-logo"

export default function LoginPage() {
  const { loginWithRedirect, user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({ email: "", password: "" })
  const navigate = useNavigate()

  // Function to store data in cookies
  const setCookie = (name, value, days) => {
    if (!value) return // Prevent storing undefined values
    let expires = ""
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = `; expires=${date.toUTCString()}`
    }
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; Secure${expires}`
  }

  // Handle form login submission
  const handleSubmit = async (e) => {
    e.preventDefault() // Ensure form does not refresh the page
    setIsLoading(true)
    setErrors({})

    console.log("Form submitted...") // Debugging line

    // Form validation
    const newErrors = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors)
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      console.log("Sending login request...")

      const response = await axios.post(
        "http://localhost:8123/api/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      )

      const data = response.data
      console.log("Response received:", data)

      // If the response only contains a message, we need to handle it accordingly
      if (data.message === "Login successful") {
        console.log("Login successful, now storing user info")

        // If the user info isn't returned in this response, you can either
        // send a separate request to fetch user data or set cookies after
        // successful login based on provided formData (email).

        // Store user data in cookies
        setCookie("_id", formData._id, 50) // Placeholder for _id
        setCookie("email", formData.email, 7) // Placeholder for email

        console.log("Login successful, navigating to home...")
        navigate("/")
      } else {
        throw new Error("Unexpected server response.")
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message)
      setErrors({ submit: error.response?.data?.message || "Login failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign-In via Auth0
  const handleGoogleSignIn = async () => {
    try {
      await loginWithRedirect({ connection: "google-oauth2" })
    } catch (error) {
      setErrors({ submit: "Google Sign-In failed. Please try again." })
    }
  }

  // Auto-login if authenticated via Auth0
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently()
          const response = await axios.get("http://localhost:8123/api/auth/login", {
            headers: { Authorization: `Bearer ${token}` },
          })

          const userData = response.data
          setCookie("_id", userData._id, 7)
          setCookie("email", userData.email, 7)
          navigate("/")
        } catch (error) {
          console.error("Error fetching user info:", error)
        }
      }
    }

    fetchUserInfo()
  }, [isAuthenticated, user, getAccessTokenSilently, navigate])

  const description = `Welcome to KizaChat.ai, your gateway to intelligent conversations. Our advanced AI-powered platform offers seamless communication, personalized interactions, and cutting-edge language processing.`

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex w-full max-w-6xl mx-auto shadow-2xl overflow-hidden">
        {/* Left side - Image and Description */}
        <div className="hidden lg:block lg:w-1/2 relative bg-blue-600">
          <img
            src="https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="AI Chat Background"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to <AnimatedLogo />
            </h1>
            <AnimatedText text={description} className="text-sm leading-relaxed" />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-6">
              <img
                src="png/white-logo.PNG" // Add your desired image here
                alt="Login Banner"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Google Sign-In Button */}
            <div className="mt-6">
            <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                  Sign up with Google
                </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
