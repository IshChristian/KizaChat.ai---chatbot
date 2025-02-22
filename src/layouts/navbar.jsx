"use client"

import { useState } from "react"
import { Settings, Users, Plus } from "lucide-react"
import PricingModal from "../components/pricingplan"
import GptSelectorModal from "../components/gptselector"
import {useNavigate} from "react-router-dom";

const Navbar = () => {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isGptSelectorModalOpen, setIsGptSelectorModalOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 right-0 left-0 bg-white p-4 z-40 ml-16">
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
          onClick={(e) => {
            e.stopPropagation();
            navigate("/")
          }}
          className="absolute -right-10 bg-blue-500 p-1 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4 text-white" />
        </button>
          <script 
            type='text/javascript' 
            src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'
          />
          <script 
            type='text/javascript' 
            dangerouslySetInnerHTML={{
              __html: "kofiwidget2.init('Buy for me domain', '#0a0c0f', 'F1F81AO5MB');kofiwidget2.draw();"
            }}
          />
        </div>
      </div>
      {isPricingModalOpen && <PricingModal onClose={() => setIsPricingModalOpen(false)} />}
      {isGptSelectorModalOpen && <GptSelectorModal onClose={() => setIsGptSelectorModalOpen(false)} />}
    </nav>
  )
}

export default Navbar