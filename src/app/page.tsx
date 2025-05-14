'use client'

import React, { useState } from "react"
import dynamic from 'next/dynamic'

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
  duration: number
}

// Constants
const NOISE_THRESHOLD = 55

const NOISE_CATEGORIES = [
  { 
    label: 'Tier 1',
    range: '55-70 dB',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    min: 55,
    max: 70,
    duration: 5
  },
  { 
    label: 'Tier 2',
    range: '71-85 dB',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    min: 71,
    max: 85,
    duration: 15
  },
  { 
    label: 'Tier 3',
    range: '>85 dB',
    color: 'bg-red-100',
    textColor: 'text-red-800',
    min: 86,
    max: Infinity,
    duration: 0 // Immediate alert
  }
]

// Node data
const nodes = [
  // Filter Site Nodes
  {
    id: 1,
    name: "Filter Site Node 1",
    lat: 10.303262638205732,
    lng: 123.86339751551996,
    noiseLevel: "Tier 1",
    noisePeak: 65,
    noiseTier: 1,
    duration: 7,
    location: "Filter Site"
  },
  {
    id: 2,
    name: "Filter Site Node 2",
    lat: 10.303294269959379,
    lng: 123.86349798483722,
    noiseLevel: "Tier 2",
    noisePeak: 75,
    noiseTier: 2,
    duration: 25,
    location: "Filter Site"
  },
  {
    id: 3,
    name: "Filter Site Node 3",
    lat: 10.303238914388416,
    lng: 123.8635020036099,
    noiseLevel: "Tier 3",
    noisePeak: 90,
    noiseTier: 3,
    duration: 1,
    location: "Filter Site"
  },

  // Sitio Tahna Nodes
  {
    id: 4,
    name: "Tahna Node 1",
    lat: 10.30213364496884,
    lng: 123.8670353080063,
    noiseLevel: "Tier 2",
    noisePeak: 80,
    noiseTier: 2,
    duration: 22,
    location: "Sitio Tahna"
  },
  {
    id: 5,
    name: "Tahna Node 2",
    lat: 10.30185151851915,
    lng: 123.8670663725013,
    noiseLevel: "Tier 1",
    noisePeak: 68,
    noiseTier: 1,
    duration: 6,
    location: "Sitio Tahna"
  },
  {
    id: 6,
    name: "Tahna Node 3",
    lat: 10.301607008725165,
    lng: 123.86716434513936,
    noiseLevel: "Tier 2",
    noisePeak: 82,
    noiseTier: 2,
    duration: 21,
    location: "Sitio Tahna"
  },

  // Sitio San Miguel Nodes
  {
    id: 7,
    name: "San Miguel Node 1",
    lat: 10.298390010626669,
    lng: 123.86948690029065,
    noiseLevel: "Tier 3",
    noisePeak: 95,
    noiseTier: 3,
    duration: 1,
    location: "Sitio San Miguel"
  },
  {
    id: 8,
    name: "San Miguel Node 2",
    lat: 10.298284211981354,
    lng: 123.86924555306035,
    noiseLevel: "Tier 2",
    noisePeak: 85,
    noiseTier: 2,
    duration: 23,
    location: "Sitio San Miguel"
  },
  {
    id: 9,
    name: "San Miguel Node 3",
    lat: 10.29816665788936,
    lng: 123.86906394524348,
    noiseLevel: "Tier 1",
    noisePeak: 70,
    noiseTier: 1,
    duration: 8,
    location: "Sitio San Miguel"
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
  const getNodeCategory = (noisePeak: number) => {
    return NOISE_CATEGORIES.find(cat => noisePeak >= cat.min && noisePeak <= cat.max)
  }

  const category = getNodeCategory(node.noisePeak)

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
      >
        {/* Node Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{node.name}</h3>
            <p className="text-sm text-gray-500">{node.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${category?.color} ${category?.textColor}`}>
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
            <span className="text-gray-500">Tier</span>
            <span className={`font-medium ${
              node.noiseTier === 3 ? 'text-red-500' :
              node.noiseTier === 2 ? 'text-orange-500' :
              'text-yellow-500'
            }`}>
              Level {node.noiseTier}
            </span>
          </div>
        </div>

        {/* Active Indicator */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full h-12"
          style={{ 
            backgroundColor: node.noisePeak >= 86 ? '#FF0000' : 
                           node.noisePeak >= 71 ? '#FFA500' : 
                           '#FFD700'
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

  // Filter nodes based on noise level and selected location
  const filteredNodes = nodes.filter((node) => {
    const meetsNoiseThreshold = node.noisePeak >= NOISE_THRESHOLD
    const meetsLocationFilter = !selectedLocation || node.location === selectedLocation
    return meetsNoiseThreshold && meetsLocationFilter
  })

  const locations = Array.from(new Set(nodes.map(node => node.location)))

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node)
    setMapCenter([node.lat, node.lng])
    setMapZoom(17)
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
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-2 flex-wrap">
            {NOISE_CATEGORIES.map(category => (
              <NoiseCategory key={category.label} category={category} />
            ))}
          </div>
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-4">
            {filteredNodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onClick={() => handleNodeClick(node)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map 
          nodes={nodes} 
          selectedNode={selectedNode}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
    </div>
  )
} 