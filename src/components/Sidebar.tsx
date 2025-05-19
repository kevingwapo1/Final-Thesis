'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Squares2X2Icon as DashboardIcon,
  ChartBarIcon as NodesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', icon: DashboardIcon, path: '/' },
  { name: 'Nodes', icon: NodesIcon, path: '/nodes' },
  { name: 'History', icon: ClockIcon, path: '/history' },
]

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="w-24 bg-[#103A5E] min-h-screen text-white flex flex-col items-center py-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`
              w-full flex flex-col items-center justify-center py-4
              ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
              transition-all duration-200
            `}
          >
            <div className="flex flex-col items-center">
              <item.icon className="w-7 h-7 mb-2" />
              <span className="text-xs font-medium">{item.name}</span>
            </div>

          </Link>
        )
      })}
    </div>
  )
}

export default Sidebar