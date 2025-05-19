'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { NOISE_CATEGORIES } from '@/constants'

// Node tabs configuration
const nodeTabs = [
  { id: 'all', label: 'All Nodes' },
  { id: '1', label: 'Node 1' },
  { id: '2', label: 'Node 2' },
  { id: '3', label: 'Node 3' },
  { id: '4', label: 'Node 4' },
  { id: '5', label: 'Node 5' },
  { id: '6', label: 'Node 6' },
  { id: '7', label: 'Node 7' },
  { id: '8', label: 'Node 8' },
  { id: '9', label: 'Node 9' },
]

// Sample data structure for a single record
const sampleRecord = {
  coordinates: { lat: 14.6577, lng: 120.9842 },
  noiseDb: 75,
  timeRecorded: "2024-02-20 08:30 AM",
  noiseAlertLevel: "Tier 1",
  alertStreak: 2,
  eventType: "Construction Noise"
}

export default function HistoryPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')

  // Function to determine noise level color coding based on tier system
  const getNoiseLevelStyle = (noiseLevel: string) => {
    switch (noiseLevel) {
      case 'Tier 3':
        return { bg: 'bg-red-100', text: 'text-red-800' }
      case 'Tier 2':
        return { bg: 'bg-orange-100', text: 'text-orange-800' }
      case 'Tier 1':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' }
      default:
        return { bg: 'bg-green-100', text: 'text-green-800' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#103A5E]">Alert History</h2>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Node Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              {nodeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm
                    ${selectedTab === tab.id
                      ? 'border-[#103A5E] text-[#103A5E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Date Filter */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="max-w-xs">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#103A5E]">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Noise (dB)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Time Recorded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Noise Alert Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Alert Streak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Event Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sampleRecord.coordinates.lat}, {sampleRecord.coordinates.lng}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sampleRecord.noiseDb} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sampleRecord.timeRecorded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getNoiseLevelStyle(sampleRecord.noiseAlertLevel).bg
                    } ${getNoiseLevelStyle(sampleRecord.noiseAlertLevel).text}`}>
                      {sampleRecord.noiseAlertLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sampleRecord.alertStreak}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sampleRecord.eventType}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Noise Level Categories */}
          <div className="px-8 py-8 border-t border-gray-100 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-[#103A5E]">Noise Level Reference</h3>
                <p className="mt-1 text-sm text-gray-500">Understanding noise level classifications and their thresholds</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {NOISE_CATEGORIES.map((category, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${category.bgColor}`}
                  >
                    <div className={`text-sm font-medium ${category.textColor}`}>
                      {category.label}
                    </div>
                    <div className={`text-xs ${category.textColor} mt-1`}>
                      {category.range}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 