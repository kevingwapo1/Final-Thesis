'use client'

import NoisePanel from '@/components/NoisePanel'

// Node data from dashboard
const dashboardData = [
  {
    id: 1,
    name: "Filter Site Node 1",
    noiseLevel: 65,
    noiseTier: 0,
    duration: 5,
    timeTriggered: "08:30 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 2,
    name: "Filter Site Node 2",
    noiseLevel: 75,
    noiseTier: 1,
    duration: 15,
    timeTriggered: "08:15 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 3,
    name: "Filter Site Node 3",
    noiseLevel: 90,
    noiseTier: 2,
    duration: 15,
    timeTriggered: "08:45 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 4,
    name: "Tahna Node 1",
    noiseLevel: 82,
    noiseTier: 1,
    duration: 15,
    timeTriggered: "08:10 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 5,
    name: "Tahna Node 2",
    noiseLevel: 68,
    noiseTier: 0,
    duration: 5,
    timeTriggered: "08:35 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 6,
    name: "Tahna Node 3",
    noiseLevel: 73,
    noiseTier: 1,
    duration: 5,
    timeTriggered: "08:40 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 7,
    name: "San Miguel Node 1",
    noiseLevel: 95,
    noiseTier: 2,
    duration: 15,
    timeTriggered: "08:25 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 8,
    name: "San Miguel Node 2",
    noiseLevel: 83,
    noiseTier: 1,
    duration: 15,
    timeTriggered: "08:05 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  },
  {
    id: 9,
    name: "San Miguel Node 3",
    noiseLevel: 60,
    noiseTier: 0,
    duration: 5,
    timeTriggered: "08:20 AM",
    batteryLevel: 100,
    status: 'active' as const,
    lastSync: '45 mins ago'
  }
]

export default function NodesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NoisePanel nodes={dashboardData} />
      </div>
    </div>
  )
} 