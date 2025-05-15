'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeModernIcon, 
  CpuChipIcon,
  ClockIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', icon: HomeModernIcon, path: '/' },
  { name: 'Nodes', icon: CpuChipIcon, path: '/nodes' },
  { name: 'History', icon: ClockIcon, path: '/history' },
]

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Check on initial load

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-[#1a3c61] min-h-screen text-white transition-all duration-300 ease-in-out relative shadow-lg z-10`}
    >
      {/* Logo Section */}
      <div className={`flex items-center ${isExpanded ? 'justify-start px-6' : 'justify-center'} h-20 border-b border-[#2a4c71]`}>
        <SpeakerWaveIcon className="w-8 h-8 text-blue-400" />
        {isExpanded && (
          <span className="ml-3 font-bold text-lg whitespace-nowrap">
            Noise Monitor
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-24 bg-[#1a3c61] rounded-full p-2 text-white hover:bg-[#2a4c71] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="w-5 h-5" />
        ) : (
          <ChevronRightIcon className="w-5 h-5" />
        )}
      </button>
      
      {/* Navigation Menu */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center ${
                  isExpanded ? 'px-4' : 'justify-center px-2'
                } py-3 rounded-lg transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'hover:bg-[#2a4c71]'
                }`}
              >
                <item.icon className={`w-6 h-6 transition-transform duration-200 ${
                  !isExpanded && 'group-hover:scale-110'
                }`} />
                {isExpanded && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 bg-gray-900 text-white px-3 py-2 rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg whitespace-nowrap">
                    {item.name}
                  </div>
                )}
                {isActive && isExpanded && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar 