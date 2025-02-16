"use client"

import { useState } from "react"
import { Settings, Users } from "lucide-react"
import PricingModal from "../components/pricingplan"
import GptSelectorModal from "../components/gptselector"

const Navbar = () => {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isGptSelectorModalOpen, setIsGptSelectorModalOpen] = useState(false)

  return (
    <nav className="bg-white p-4">
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setIsGptSelectorModalOpen(true)}
            className="bg-transparent text-black px-4 py-2 rounded-md border border-black hover:bg-black hover:text-white transition-colors flex items-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Select GPT
          </button>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="bg-transparent text-black px-4 py-2 rounded-md border border-black hover:bg-black hover:text-white transition-colors flex items-center"
          >
            <Settings className="w-5 h-5 mr-2" />
            Upgrade Plan
          </button>
        </div>
      </div>
      {isPricingModalOpen && <PricingModal onClose={() => setIsPricingModalOpen(false)} />}
      {isGptSelectorModalOpen && <GptSelectorModal onClose={() => setIsGptSelectorModalOpen(false)} />}
    </nav>
  )
}

export default Navbar

