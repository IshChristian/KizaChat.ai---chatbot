"use client"

import { X, Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    features: ["Access to Gemini", "100 messages per day", "Basic support"],
  },
  {
    name: "Pro",
    price: "$19.99",
    features: ["Access to all GPTs", "Unlimited messages", "Priority support", "Advanced features"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Custom GPT integration", "Dedicated account manager", "24/7 premium support", "Custom features"],
  },
]

const PricingModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upgrade Your Plan</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className="border rounded-lg p-6 shadow-sm">
                <h4 className="text-xl font-semibold mb-4">{plan.name}</h4>
                <p className="text-3xl font-bold mb-4">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingModal

