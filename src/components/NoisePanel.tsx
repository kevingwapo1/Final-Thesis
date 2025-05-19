'use client'

import { useRef } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { NOISE_CATEGORIES } from '@/constants'

interface Node {
  id: number
  name: string
  noiseLevel: number
  timeTriggered: string
  duration: number
  batteryLevel: number
  status: 'active' | 'inactive'
  lastSync: string
}

interface NoisePanelProps {
  nodes: Node[]
}

// Function to determine noise level color coding based on tier system
const getNoiseLevelStyle = (noiseLevel: number, duration: number) => {
  const hour = new Date().getHours()
  const isDayTime = hour >= 9 && hour <= 18
  const baseThreshold = isDayTime ? 55 : 45

  if (noiseLevel > 101) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800'
    }
  }
  if (noiseLevel >= 86 && noiseLevel <= 100 && duration >= 15) {
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-800'
    }
  }
  if (noiseLevel >= 71 && noiseLevel <= 85 && duration >= 5) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800'
    }
  }
  if (noiseLevel >= baseThreshold && noiseLevel <= 70) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800'
    }
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  }
}

// Function to get noise tier label
const getNoiseTierLabel = (noiseLevel: number, duration: number) => {
  if (noiseLevel > 101) return 'Tier 3'
  if (noiseLevel >= 86 && noiseLevel <= 100 && duration >= 15) return 'Tier 2'
  if (noiseLevel >= 71 && noiseLevel <= 85 && duration >= 15) return 'Tier 1'
  return 'Normal'
}

export default function NoisePanel({ nodes }: NoisePanelProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  // Export to PDF function
  const exportToPDF = async () => {
    if (!tableRef.current) return;

    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('noise-monitoring-data.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#103A5E]">Sensor Nodes</h2>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div ref={tableRef}>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#103A5E]">
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Node ID</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Name</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Noise Level (dB)</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Time Triggered</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Duration</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Battery Level</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Status</span>
                  </div>
                </th>
                <th scope="col" className="group px-6 py-3 text-left">
                  <div className="flex items-center space-x-3 text-xs font-medium text-white uppercase tracking-wider">
                    <span>Last Gateway Sync</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nodes.map((node) => {
                const noiseStyle = getNoiseLevelStyle(node.noiseLevel, node.duration)
                const noiseTierLabel = getNoiseTierLabel(node.noiseLevel, node.duration)
                return (
                  <tr key={node.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Node {node.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {node.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${noiseStyle.bg} ${noiseStyle.text}`}>
                        {node.noiseLevel > 0 ? `${node.noiseLevel} dB (${noiseTierLabel})` : 'No Data'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {node.timeTriggered || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {node.duration > 0 ? `${node.duration} min` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {node.batteryLevel}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        node.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {node.lastSync || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Noise Level Categories - Elegant Design */}
        <div className="px-8 py-8 border-t border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-[#103A5E]">Noise Level Reference</h3>
              <p className="mt-1 text-sm text-gray-500">Understanding noise level classifications and their thresholds</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {NOISE_CATEGORIES.map((category, index) => (
                <div 
                  key={category.label}
                  className={`
                    relative overflow-hidden rounded-lg bg-white
                    transition-all duration-200 ease-in-out
                    hover:shadow-md
                    ${index === 0 ? 'border-green-200' : 
                      index === 1 ? 'border-yellow-200' :
                      index === 2 ? 'border-orange-200' : 'border-red-200'}
                    border
                  `}
                >
                  <div className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <span className={`
                        w-full py-1 px-3 rounded-full text-xs font-medium mb-3
                        ${category.bgColor} ${category.textColor}
                      `}>
                        {category.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 mb-1">
                        {category.range}
                      </span>
                      <span className="text-xs text-gray-500">
                        {index === 0 && 'Standard acceptable level'}
                        {index === 1 && '15+ minutes exposure'}
                        {index === 2 && '15+ minutes exposure'}
                        {index === 3 && 'Immediate action required'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 