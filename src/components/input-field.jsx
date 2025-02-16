export default function InputField({ label, type = "text", id, error, ...props }) {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type={type}
          id={id}
          {...props}
          className={`appearance-none relative block w-full px-3 py-2 border ${
            error ? "border-red-300" : "border-gray-300"
          } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm`}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    )
  }
  
  