'use client'

import React, { useState } from "react"
import dynamic from 'next/dynamic'
import { ChartBarIcon } from '@heroicons/react/24/outline'

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />
})

// Types
interface Node {
  id: number
  name: string
  lat: number
  lng: number
  noiseLevel: string
  noisePeak: number
  noiseTier: number
  location: string
  consecutiveIntervals: number
  timestamp: string
}

// Constants
const NOISE_THRESHOLD = 55

const NOISE_CATEGORIES = [
  {
    label: 'Normal',
    range: '55-70 dB',
    color: '#22C55E', // Green
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    min: 55,
    max: 70,
    intervals: 0
  },
  { 
    label: 'Tier 1',
    range: '71-85 dB (15+ mins)',
    color: '#EAB308', // Yellow
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    min: 71,
    max: 85,
    intervals: 1
  },
  { 
    label: 'Tier 2',
    range: '86-100 dB (15+ mins)',
    color: '#F97316', // Orange
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    min: 86,
    max: 100,
    intervals: 3
  },
  { 
    label: 'Tier 3',
    range: '>101 dB (Spike)',
    color: '#EF4444', // Red
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    min: 101,
    max: Infinity,
    intervals: 1
  }
]

// Node data
const nodes = [
  // Filter Site Nodes
  {
    id: 1,
    name: "Filter Site Node 1",
    lat: 10.303263346925576,
    lng: 123.86329442165102,
    noiseLevel: "Normal",
    noisePeak: 65,
    noiseTier: 0,
    consecutiveIntervals: 1,
    location: "Filter Site",
    timestamp: "2024-02-20 08:30:00"
  },
  {
    id: 2,
    name: "Filter Site Node 2",
    lat: 10.303218626609574,
    lng: 123.86352089049124,
    noiseLevel: "Tier 1",
    noisePeak: 75,
    noiseTier: 2,
    consecutiveIntervals: 3,  // 15 minutes (3 x 5-min intervals)
    location: "Filter Site",
    timestamp: "2024-02-20 08:15:00"
  },
  {
    id: 3,
    name: "Filter Site Node 3",
    lat: 10.303186459360795,
    lng: 123.86374895418248,
    noiseLevel: "Tier 3",
    noisePeak: 120,
    noiseTier: 3,
    consecutiveIntervals: 3,
    location: "Filter Site",
    timestamp: "2024-02-20 08:45:00"
  },

  // Sitio Tahna Nodes
  {
    id: 4,
    name: "Tahna Node 1",
    lat: 10.301850119811743,
    lng: 123.86873049466762,
    noiseLevel: "Tier 2",
    noisePeak: 82,
    noiseTier: 1,
    consecutiveIntervals: 3,
    location: "Sitio Tahna",
    timestamp: "2024-02-20 08:10:00"
  },
  {
    id: 5,
    name: "Tahna Node 2",
    lat: 10.301656155473276,
    lng: 123.86880760817512,
    noiseLevel: "Normal",
    noisePeak: 68,
    noiseTier: 0,
    consecutiveIntervals: 1,
    location: "Sitio Tahna",
    timestamp: "2024-02 -20 08:35:00"
  },
  {
    id: 6,
    name: "Tahna Node 3",
    lat: 10.301447016918546,
    lng: 123.86883375971344,
    noiseLevel: "Tier 1",
    noisePeak: 73,
    noiseTier: 1,
    consecutiveIntervals: 3,
    location: "Sitio Tahna",
    timestamp: "2024-02-20 08:40:00"
  },

  // Sitio San Miguel Nodes
  {
    id: 7,
    name: "San Miguel Node 1",
    lat: 10.298220500473846,
    lng: 123.86910419812594,
    noiseLevel: "Tier 2",
    noisePeak: 95,
    noiseTier: 2,
    consecutiveIntervals: 3,
    location: "Sitio San Miguel",
    timestamp: "2024-02-20 08:25:00"
  },
  {
    id: 8,
    name: "San Miguel Node 2",
    lat: 10.29812542410282,
    lng: 123.86891288419301,
    noiseLevel: "Tier 1",
    noisePeak: 83,
    noiseTier: 1,
    consecutiveIntervals: 3,
    location: "Sitio San Miguel",
    timestamp: "2024-02-20 08:05:00"
  },
  {
    id: 9,
    name: "San Miguel Node 3",
    lat: 10.298087009399318,
    lng: 123.86868740705779,
    noiseLevel: "Normal",
    noisePeak: 60,
    noiseTier: 0,
    consecutiveIntervals: 1,
    location: "Sitio San Miguel",
    timestamp: "2024-02-20 08:20:00"
  },
]

// Components
const NoiseCategory = ({ category }: { category: typeof NOISE_CATEGORIES[0] }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${category.color} ${category.textColor}`}>
    {category.label} ({category.range})
  </span>
)

const NodeCard = ({ 
  node, 
  isSelected, 
  onClick 
}: { 
  node: Node
  isSelected: boolean
  onClick: () => void 
}) => {
  const getNodeCategory = (noisePeak: number, intervals: number) => {
    if (noisePeak > 101) {
      return {
        ...NOISE_CATEGORIES[3],
        shadowColor: 'rgba(239, 68, 68, 0.35)' // Red shadow
      }
    }
    if (noisePeak >= 86 && noisePeak <= 100 && intervals >= 3) {
      return {
        ...NOISE_CATEGORIES[2],
        shadowColor: 'rgba(249, 115, 22, 0.35)' // Orange shadow
      }
    }
    if (noisePeak >= 71 && noisePeak <= 85 && intervals >= 3) {
      return {
        ...NOISE_CATEGORIES[1],
        shadowColor: 'rgba(234, 179, 8, 0.35)' // Yellow shadow
      }
    }
    if (noisePeak >= 55 && noisePeak <= 70) {
      return {
        ...NOISE_CATEGORIES[0],
        shadowColor: 'rgba(34, 197, 94, 0.35)' // Green shadow
      }
    }
    return null
  }

  const category = getNodeCategory(node.noisePeak, node.consecutiveIntervals)
  const timestamp = new Date(node.timestamp)
  const timeString = timestamp.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      <div
        className={`relative p-5 rounded-xl transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white hover:bg-gray-50'
        } border shadow-sm hover:shadow-md`}
        style={{
          boxShadow: `0 4px 20px ${category?.shadowColor || 'rgba(0, 0, 0, 0.1)'}`
        }}
      >
        {/* Node Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{node.name}</h3>
            <p className="text-sm text-gray-500">{node.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${category?.bgColor} ${category?.textColor}`}>
            {node.noisePeak} dB
          </span>
        </div>

        {/* Node Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Noise Level</span>
            <span className="font-medium">{node.noiseLevel}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium">{node.consecutiveIntervals * 5} minutes</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Triggered At</span>
            <span className="font-medium">{timeString}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Tier</span>
            <span className={`font-medium ${category?.textColor}`}>
              {node.noiseTier === 0 ? 'Normal' : `Level ${node.noiseTier}`}
            </span>
          </div>
        </div>

        {/* Active Indicator */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full h-12"
          style={{ 
            backgroundColor: node.noisePeak > 101 ? '#EF4444' : 
                           node.noisePeak >= 86 && node.consecutiveIntervals >= 3 ? '#F97316' :
                           node.noisePeak >= 71 && node.consecutiveIntervals >= 3 ? '#EAB308' :
                           '#22C55E'
          }}
        />
      </div>
    </button>
  )
}

export default function Dashboard() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.301, 123.867])
  const [mapZoom, setMapZoom] = useState(15)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [showAverages, setShowAverages] = useState(false)

  // Calculate averages per location
  const locationAverages = nodes.reduce((acc, node) => {
    if (!acc[node.location]) {
      const locationNodes = nodes.filter(n => n.location === node.location)
      const avgNoisePeak = Math.round(
        locationNodes.reduce((sum, n) => sum + n.noisePeak, 0) / locationNodes.length
      )
      const maxDuration = Math.max(...locationNodes.map(n => n.consecutiveIntervals))
      const centerNode = locationNodes[Math.floor(locationNodes.length / 2)]
      
      acc[node.location] = {
        id: parseInt(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
        name: `${node.location} Average`,
        lat: centerNode.lat,
        lng: centerNode.lng,
        noiseLevel: avgNoisePeak > 101 ? "Tier 3" :
                   avgNoisePeak >= 86 && maxDuration >= 3 ? "Tier 2" :
                   avgNoisePeak >= 86 ? "Tier 1" : "Normal",
        noisePeak: avgNoisePeak,
        noiseTier: avgNoisePeak > 101 ? 2 :
                   avgNoisePeak >= 86 && maxDuration >= 3 ? 2 :
                   avgNoisePeak >= 86 ? 1 : 0,
        consecutiveIntervals: maxDuration,
        location: node.location,
        timestamp: locationNodes[0].timestamp
      }
    }
    return acc
  }, {} as Record<string, Node>)

  // Filter nodes based on noise level and selected location
  const filteredNodes = nodes.filter((node) => {
    const meetsNoiseThreshold = node.noisePeak >= NOISE_THRESHOLD
    const meetsLocationFilter = !selectedLocation || node.location === selectedLocation
    return meetsNoiseThreshold && meetsLocationFilter
  })

  const locations = Array.from(new Set(nodes.map(node => node.location)))

  const handleNodeClick = (node: Node) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null)
    } else {
      setSelectedNode(node)
      setMapCenter([node.lat, node.lng])
    }
  }

  return (
    <div className="flex h-full">
      {/* Side Panel */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#103A5E]">Active Nodes</h2>
          <p className="text-gray-500 text-sm mt-1">
            Showing nodes with noise levels ≥{NOISE_THRESHOLD} dB
          </p>
        </div>

        {/* Location Filter */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <select
            value={selectedLocation || ''}
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            className="w-full p-2 rounded-md border border-gray-200 text-sm"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Noise Level Legend */}
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            {NOISE_CATEGORIES.map((category, index) => (
              <div key={index} className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-gray-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <div className="flex-1">
                  <div className="text-xs font-medium">{category.label}</div>
                  <div className="text-xs text-gray-500">{category.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-4">
            {showAverages ? 
              Object.values(locationAverages)
                .filter(node => !selectedLocation || node.location === selectedLocation)
                .map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => handleNodeClick(node)}
                  />
                ))
              :
              filteredNodes.map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onClick={() => handleNodeClick(node)}
                />
              ))
            }
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {/* Toggle Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              setShowAverages(!showAverages)
              setSelectedNode(null) // Clear selection when toggling
            }}
            className={`
              flex items-center space-x-2 px-4 py-2.5 
              ${showAverages 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              } 
              rounded-lg shadow-lg hover:shadow-xl 
              transition-all duration-200 
              text-sm font-semibold
              border border-transparent
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            {showAverages ? (
              <>
                <ChartBarIcon className="w-5 h-5" />
                <span>Show Individual Nodes</span>
              </>
            ) : (
              <>
                <ChartBarIcon className="w-5 h-5" />
                <span>Show dB Average per Sitio</span>
              </>
            )}
          </button>
        </div>

        <Map
          nodes={showAverages ? Object.values(locationAverages) : nodes}
          selectedNode={selectedNode}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
    </div>
  )
} 