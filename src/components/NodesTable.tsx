'use client'

import { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Node {
  id: number
  lat: number
  lng: number
  noiseLevel: string
  noisePeak: number
  noiseTier: number
  location: string
  consecutiveIntervals: number
  timestamp: string
  battery: number
  loraConnection: 'active' | 'inactive'
  lastSync: string
  startTime?: string  // When the current noise event started
}

interface NodesTableProps {
  nodes: Node[]
  onLocationSelect: (location: string | null) => void
  selectedLocation: string | null
  selectedDate: string
  onDateSelect: (date: string) => void
}

const NOISE_CATEGORIES = [
  {
    label: 'Normal',
    range: '55-70 dB',
    color: '#22C55E',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    min: 55,
    max: 70,
    intervals: 0
  },
  { 
    label: 'Tier 1',
    range: '71-85 dB (5 mins)',
    color: '#EAB308',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    min: 71,
    max: 85,
    intervals: 1
  },
  { 
    label: 'Tier 2',
    range: '71-85 dB (15+ min)',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    min: 71,
    max: 85,
    intervals: 3
  },
  { 
    label: 'Tier 3',
    range: '>85 dB',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    min: 86,
    max: Infinity,
    intervals: 1
  }
]

const getNodeCategory = (noisePeak: number, intervals: number) => {
  if (noisePeak > 85) {
    return NOISE_CATEGORIES[3]
  }
  if (noisePeak >= 71 && noisePeak <= 85 && (intervals * 5) >= 15) {
    return NOISE_CATEGORIES[2]
  }
  if (noisePeak >= 71 && noisePeak <= 85 && (intervals * 5) >= 5) {
    return NOISE_CATEGORIES[1]
  }
  if (noisePeak >= 55 && noisePeak <= 70) {
    return NOISE_CATEGORIES[0]
  }
  return null
}

const NodesTable = ({ nodes, onLocationSelect, selectedLocation, selectedDate, onDateSelect }: NodesTableProps) => {
  const locations = Array.from(new Set(nodes.map(node => node.location))).sort()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 1 // One timestamp per page

  // Group nodes by timestamp first
  const nodesByTimestamp = nodes.reduce((acc, node) => {
    const timestamp = node.timestamp
    if (!acc[timestamp]) {
      acc[timestamp] = {}
    }
    acc[timestamp][node.id] = node
    return acc
  }, {} as Record<string, Record<number, Node>>)

  // Sort timestamps in descending order
  const sortedTimestamps = Object.keys(nodesByTimestamp)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Get unique timestamps for pagination
  const uniqueTimestamps = Array.from(new Set(sortedTimestamps))
  const totalPages = uniqueTimestamps.length

  // Get timestamp for current page
  const startIndex = (currentPage - 1)
  const currentTimestamp = uniqueTimestamps[startIndex]

  // Get nodes for current timestamp and ensure all 9 nodes are present
  const currentNodes = Array.from({ length: 9 }, (_, index) => {
    const nodeId = index + 1
    return nodesByTimestamp[currentTimestamp]?.[nodeId] || {
      id: nodeId,
      location: nodes.find(n => n.id === nodeId)?.location || '',
      noiseLevel: 'No Data',
      noisePeak: 0,
      noiseTier: -1,
      consecutiveIntervals: 0,
      timestamp: currentTimestamp,
      battery: 0,
      loraConnection: 'inactive' as const,
      lastSync: currentTimestamp
    }
  }).sort((a, b) => a.id - b.id)

  // Format duration string with hours
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'No Data'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // Get color coding for noise level based on tiers and time of day
  const getNoiseColor = (node: Node) => {
    if (node.noiseTier === -1) {
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
    }

    const hour = new Date(node.timestamp).getHours()
    const isDayTime = hour >= 9 && hour <= 18
    const baseThreshold = isDayTime ? 55 : 45
    const duration = node.consecutiveIntervals * 5

    if (node.noisePeak > 85) {
      return { bgColor: 'bg-red-100', textColor: 'text-red-800' }
    }
    if (node.noisePeak >= 71 && node.noisePeak <= 85 && duration >= 15) {
      return { bgColor: 'bg-orange-100', textColor: 'text-orange-800' }
    }
    if (node.noisePeak >= 71 && node.noisePeak <= 85 && duration >= 5) {
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
    }
    if (node.noisePeak >= baseThreshold && node.noisePeak <= 70) {
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' }
    }
    return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
  }

  // Get unique dates from the data and format them for display
  const dates = Array.from(new Set(nodes.map(node => node.timestamp.split(' ')[0])))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => {
      const d = new Date(date)
      return {
        value: date,
        label: format(d, 'MMMM d, yyyy (EEEE)') // e.g., "February 20, 2024 (Tuesday)"
      }
    })

  const downloadCSV = () => {
    // Only export the columns that are visible in the table
    const headers = ['Time', 'Node ID', 'Location', 'Noise Level', 'Duration', 'Battery', 'Status', 'Last Sync']
    const rows = currentNodes.map(node => [
      node.timestamp.split(' ').slice(1).join(' '), // Time with AM/PM
      node.id,
      node.location,
      `${node.noisePeak} dB (${node.noiseLevel})`,
      `${node.consecutiveIntervals * 5} minutes`,
      `${node.battery}%`,
      node.loraConnection,
      node.lastSync.split(' ').slice(1).join(' ') // Time with AM/PM
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noise-monitoring-data-${selectedDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#103A5E]">Sensor Nodes</h2>
          <div className="flex space-x-4">
            <button
              onClick={downloadCSV}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-4">
          <select
            value={selectedLocation || ''}
            onChange={(e) => onLocationSelect(e.target.value || null)}
            className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select
            value={selectedDate}
            onChange={(e) => onDateSelect(e.target.value)}
            className="block w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {dates.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Node ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Noise Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Battery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentNodes.map((node) => {
              const colors = getNoiseColor(node)
              const time = node.timestamp.split(' ').slice(1).join(' ') // Get time with AM/PM
              const duration = node.consecutiveIntervals * 5
              
              return (
                <tr key={`${node.id}-${node.timestamp}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Node {node.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{node.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bgColor} ${colors.textColor}`}>
                      {node.noiseTier === -1 ? 'No Data' : `${node.noisePeak} dB (${node.noiseLevel})`}
                    </span>
                    {node.noiseTier !== -1 && node.consecutiveIntervals > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        for {formatDuration(node.consecutiveIntervals * 5)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {node.noiseTier === -1 ? 'No Data' : `${node.battery}%`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      node.loraConnection === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {node.loraConnection}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Showing data for {format(new Date(currentTimestamp), 'hh:mm:ss a')}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md border disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodesTable 