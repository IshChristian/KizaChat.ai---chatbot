"use client"

export default function InputField({
  label,
  type,
  id,
  name,
  autoComplete,
  required,
  value,
  onChange,
  error,
  disabled,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500" : ""} ${disabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
        disabled={disabled}
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  )
}

