'use client'

import { BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const Header = () => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="text-xl font-semibold text-gray-800">
        Noise Monitoring
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <BellIcon className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            17
          </span>
        </div>
        <div className="relative">
          <EnvelopeIcon className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            4
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            P
          </div>
          <span className="text-gray-700">John Doe</span>
        </div>
      </div>
    </header>
  )
}

export default Header 