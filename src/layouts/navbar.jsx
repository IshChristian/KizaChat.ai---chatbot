import { useState } from "react"
import { Settings, Users, Plus } from "lucide-react"
import PricingModal from "../components/pricingplan"
import GptSelectorModal from "../components/gptselector"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isGptSelectorModalOpen, setIsGptSelectorModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white p-4 z-40 ml-16">
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex space-x-4">
          {/* Desktop version */}
          <button
            onClick={() => setIsGptSelectorModalOpen(true)}
            className="hidden sm:flex bg-transparent text-black px-4 py-2 rounded-md border border-black hover:bg-black hover:text-white transition-colors items-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Select GPT
          </button>
          {/* Mobile version */}
          <button
            onClick={() => setIsGptSelectorModalOpen(true)}
            className="sm:hidden bg-transparent text-black p-2 rounded-md border border-black hover:bg-black hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
          {/* New chat button - mobile only */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate("/")
            }}
            className="sm:hidden bg-purple-500 p-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      {/* Modals */}
      {isPricingModalOpen && <PricingModal onClose={() => setIsPricingModalOpen(false)} />}
      {isGptSelectorModalOpen && <GptSelectorModal onClose={() => setIsGptSelectorModalOpen(false)} />}
    </nav>
  )
}

export default Navbar