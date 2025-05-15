'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Types
interface SensorNode {
  id: number
  name: string
  location: string
  noise: number
  duration: number // Duration in minutes
}

const sensorNodes: SensorNode[] = [
  { id: 1, name: 'Sitio Tahna Node 1', location: 'Sitio Tahna', noise: 75, duration: 10 },
  { id: 2, name: 'Sitio Tahna Node 2', location: 'Sitio Tahna', noise: 65, duration: 3 },
  { id: 3, name: 'Sitio Tahna Node 3', location: 'Sitio Tahna', noise: 82, duration: 20 },
  { id: 4, name: 'San Miguel Node 1', location: 'San Miguel', noise: 73, duration: 7 },
  { id: 5, name: 'San Miguel Node 2', location: 'San Miguel', noise: 68, duration: 2 },
  { id: 6, name: 'San Miguel Node 3', location: 'San Miguel', noise: 79, duration: 18 },
  { id: 7, name: 'Filter Site Node 1', location: 'Filter Site', noise: 72, duration: 6 },
  { id: 8, name: 'Filter Site Node 2', location: 'Filter Site', noise: 77, duration: 16 },
  { id: 9, name: 'Filter Site Node 3', location: 'Filter Site', noise: 91, duration: 8 },
]

const NoisePanel = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredNodes = sensorNodes
    .filter(node => 
      node.noise >= 55 && 
      (searchTerm === '' || 
       node.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.noise - a.noise)

  const getNoiseClass = (noise: number, duration: number) => {
    // Tier 3 (Alert Strike 3): >85 dB for 15+ minutes
    if (noise > 85 && duration >= 15) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-700',
        indicator: 'rgba(255, 0, 0, 0.8)'
      }
    }
    // Tier 2 (Alert Strike 2): 71-85 dB for 15+ minutes
    if (noise >= 71 && noise <= 85 && duration >= 15) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-700',
        indicator: 'rgba(255, 140, 0, 0.75)'
      }
    }
    // Tier 1 (Alert Strike 1): 71-85 dB for 5+ minutes
    if (noise >= 71 && noise <= 85 && duration >= 5) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        indicator: 'rgba(255, 255, 0, 0.7)'
      }
    }
    // Default state
    return {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      indicator: 'rgba(50, 205, 50, 0.65)'
    }
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 p-4 overflow-auto">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by location..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Tier Level Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Noise Tiers</h3>
        <div className="space-y-2 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Tier 3: &gt;85 dB (15+ min)</span>
            </div>
            <div className="ml-5 text-gray-500 text-xs">Alert Strike 3</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Tier 2: 71-85 dB (15+ min)</span>
            </div>
            <div className="ml-5 text-gray-500 text-xs">Alert Strike 2</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Tier 1: 71-85 dB (5+ min)</span>
            </div>
            <div className="ml-5 text-gray-500 text-xs">Alert Strike 1</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNodes.map(node => {
          const colorClass = getNoiseClass(node.noise, node.duration)
          return (
            <div
              key={node.id}
              className={`p-4 rounded-lg border relative ${colorClass.bg} ${colorClass.border}`}
            >
              <div className={`font-semibold ${colorClass.text}`}>{node.name}</div>
              <div className="text-sm text-gray-600">{node.location}</div>
              <div className="mt-2">
                <span className={`font-bold ${colorClass.text}`}>{node.noise} dB</span>
                <span className="text-sm text-gray-500 ml-2">for {node.duration} min</span>
              </div>
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: colorClass.indicator }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NoisePanel 