"use client";

import { useState, useEffect } from "react";
import {
  format,
  subDays,
  addMinutes,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { NOISE_CATEGORIES } from "@/constants";

// Node tabs configuration
const nodeTabs = [
  { id: "1", label: "Filter Site 1" },
  { id: "2", label: "Filter Site 2" },
  { id: "3", label: "Filter Site 3" },
  { id: "4", label: "Tahna 1" },
  { id: "5", label: "Tahna 2" },
  { id: "6", label: "Tahna 3" },
  { id: "7", label: "San Miguel 1" },
  { id: "8", label: "San Miguel 2" },
  { id: "9", label: "San Miguel 3" },
  { id: "all", label: "All Nodes" },
];

// Add type definitions
interface NoiseRecord {
  name: string;
  coordinates: { lat: number; lng: number };
  noiseDb: number;
  timeRecorded: string;
  noiseAlertLevel: string;
  noiseCategory: string;
  duration: string;
  location: string;
}

interface NodeLocation {
  [key: number]: string;
}

// Add sorting type
type SortField = "timeRecorded" | "noiseAlertLevel";
type SortOrder = "asc" | "desc";

// Add date button type
interface DateButton {
  label: string;
  value: Date;
}

// Add NodeInfo interface
interface NodeInfo {
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface NodeMapping {
  [key: string]: NodeInfo;
}

// Node mapping
const nodeMapping: NodeMapping = {
  "1": {
    name: "Filter Site Node 1",
    location: "Filter Site",
    coordinates: { lat: 10.303263, lng: 123.863294 },
  },
  "2": {
    name: "Filter Site Node 2",
    location: "Filter Site",
    coordinates: { lat: 10.303219, lng: 123.863521 },
  },
  "3": {
    name: "Filter Site Node 3",
    location: "Filter Site",
    coordinates: { lat: 10.303186, lng: 123.863749 },
  },
  "4": {
    name: "Tahna Node 1",
    location: "Sitio Tahna",
    coordinates: { lat: 10.30185, lng: 123.86873 },
  },
  "5": {
    name: "Tahna Node 2",
    location: "Sitio Tahna",
    coordinates: { lat: 10.301656, lng: 123.868808 },
  },
  "6": {
    name: "Tahna Node 3",
    location: "Sitio Tahna",
    coordinates: { lat: 10.301447, lng: 123.868834 },
  },
  "7": {
    name: "San Miguel Node 1",
    location: "San Miguel",
    coordinates: { lat: 10.298221, lng: 123.869104 },
  },
  "8": {
    name: "San Miguel Node 2",
    location: "San Miguel",
    coordinates: { lat: 10.298125, lng: 123.868913 },
  },
  "9": {
    name: "San Miguel Node 3",
    location: "San Miguel",
    coordinates: { lat: 10.298087, lng: 123.868687 },
  },
};

// Function to determine noise level color coding based on tier system
const getNoiseLevelStyle = (noiseLevel: string) => {
  switch (noiseLevel) {
    case "Tier 3":
      return { bg: "bg-red-100 border border-red-800", text: "text-red-800" };
    case "Tier 2":
      return {
        bg: "bg-orange-100 border border-orange-800",
        text: "text-orange-800",
      };
    case "Tier 1":
      return {
        bg: "bg-yellow-100 border border-yellow-800",
        text: "text-yellow-800",
      };
    default:
      return {
        bg: "bg-green-100 border border-green-800",
        text: "text-green-800",
      };
  }
};

// Helper function to determine noise tier based on dB level and duration
const getNoiseTier = (noiseDb: number, durationMinutes: number): string => {
  const hour = new Date().getHours();
  const isDayTime = hour >= 9 && hour <= 18;
  const baseThreshold = isDayTime ? 55 : 45;

  if (noiseDb > 101) return "Tier 3";
  if (noiseDb >= 86 && noiseDb <= 100 && durationMinutes >= 15) return "Tier 2";
  if (noiseDb >= 71 && noiseDb <= 85 && durationMinutes >= 15) return "Tier 1";
  if (noiseDb >= baseThreshold && noiseDb <= 70) return "Normal";
  return "Normal";
};

// Helper function to generate duration based on tier
const generateDuration = (
  tier: number
): { minutes: number; display: string } => {
  switch (tier) {
    case 1: // Tier 1 (15+ minutes)
      const tier1Minutes = Math.floor(Math.random() * 46) + 15; // 15-60 minutes
      return { minutes: tier1Minutes, display: `${tier1Minutes} minutes` };
    case 2: // Tier 2 (15+ minutes)
      const tier2Minutes = Math.floor(Math.random() * 46) + 15; // 15-60 minutes
      return { minutes: tier2Minutes, display: `${tier2Minutes} minutes` };
    case 3: // Tier 3 (immediate)
      return { minutes: 1, display: "1 minute" };
    default: // Normal (5+ minutes)
      const normalMinutes = Math.floor(Math.random() * 56) + 5; // 5-60 minutes
      return { minutes: normalMinutes, display: `${normalMinutes} minutes` };
  }
};

// Generate mock data for a week
const generateMockData = (): NoiseRecord[] => {
  const mockData: NoiseRecord[] = [];

  // Helper function to determine noise category based on noise level
  const getNoiseCategory = (noiseDb: number): string => {
    if (noiseDb > 101) return "Painful Noise";
    if (noiseDb >= 86) return "Extremely Loud";
    if (noiseDb >= 71) return "Very Loud";
    return "Normal";
  };

  // Generate data for the past 7 days
  for (let day = 0; day < 7; day++) {
    const baseDate = subDays(new Date(), day);

    // Generate data for each node
    Object.entries(nodeMapping).forEach(([nodeId, nodeInfo]) => {
      // Generate 3-5 records per node per day
      const recordsPerNode = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < recordsPerNode; i++) {
        let noiseDb: number;
        let duration: { minutes: number; display: string };

        // Determine tier and noise level with adjusted probabilities
        const rand = Math.random();
        if (rand < 0.55) {
          // 55% chance for normal
          noiseDb = Math.floor(Math.random() * 16) + 55; // 55-70 dB
          duration = generateDuration(0);
        } else if (rand < 0.8) {
          // 25% chance for Tier 1
          noiseDb = Math.floor(Math.random() * 15) + 71; // 71-85 dB - Very Loud
          duration = generateDuration(1);
        } else if (rand < 0.95) {
          // 15% chance for Tier 2
          noiseDb = Math.floor(Math.random() * 15) + 86; // 86-100 dB - Extremely Loud
          duration = generateDuration(2);
        } else {
          // 5% chance for Tier 3
          noiseDb = Math.floor(Math.random() * 10) + 102; // 102-111 dB - Painful Noise
          duration = generateDuration(3);
        }

        // Generate random time between 6 AM and 10 PM
        const hour = Math.floor(Math.random() * 17) + 6; // 6-22
        const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        const timeRecorded = addMinutes(baseDate, hour * 60 + minute);

        const noiseAlertLevel = getNoiseTier(noiseDb, duration.minutes);
        const noiseCategory = getNoiseCategory(noiseDb);

        mockData.push({
          name: nodeInfo.name,
          coordinates: nodeInfo.coordinates,
          noiseDb,
          timeRecorded: format(timeRecorded, "yyyy-MM-dd hh:mm a"),
          noiseAlertLevel,
          noiseCategory,
          duration: duration.display,
          location: nodeInfo.location,
        });
      }
    });
  }

  return mockData.sort(
    (a, b) =>
      new Date(b.timeRecorded).getTime() - new Date(a.timeRecorded).getTime()
  );
};

const mockData: NoiseRecord[] = generateMockData();

export default function HistoryPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredData, setFilteredData] = useState<NoiseRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("timeRecorded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const itemsPerPage = 10;

  // Generate date buttons for quick selection
  const dateButtons: DateButton[] = [
    { label: "Today", value: new Date() },
    { label: "Yesterday", value: subDays(new Date(), 1) },
  ];

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Sort data
  const sortData = (data: NoiseRecord[]) => {
    return [...data].sort((a, b) => {
      if (sortField === "timeRecorded") {
        const dateA = new Date(a.timeRecorded).getTime();
        const dateB = new Date(b.timeRecorded).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        // Sort by tier level (Normal < Tier 1 < Tier 2 < Tier 3)
        const tierOrder = { Normal: 0, "Tier 1": 1, "Tier 2": 2, "Tier 3": 3 };
        const tierA = tierOrder[a.noiseAlertLevel as keyof typeof tierOrder];
        const tierB = tierOrder[b.noiseAlertLevel as keyof typeof tierOrder];
        return sortOrder === "asc" ? tierA - tierB : tierB - tierA;
      }
    });
  };

  // Filter and sort data
  useEffect(() => {
    let filtered = mockData;

    // Filter by node if not 'all'
    if (selectedTab !== "all") {
      const nodeId = selectedTab;
      filtered = filtered.filter(
        (record) => record.name === nodeMapping[nodeId].name
      );
    }

    // Filter by selected date
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);
    filtered = filtered.filter((record) => {
      const recordDate = parseISO(record.timeRecorded.split(" ")[0]);
      return isWithinInterval(recordDate, {
        start: startOfSelectedDay,
        end: endOfSelectedDay,
      });
    });

    // Sort the filtered data
    filtered = sortData(filtered);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedTab, selectedDate, sortField, sortOrder]);

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#103A5E]">
                Alert History
              </h2>
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
                    whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg
                    ${
                      selectedTab === tab.id
                        ? "border-[#103A5E] text-[#103A5E] bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Date Selection and Sorting */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Date Selection */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                    format(selectedDate, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                      ? "bg-[#103A5E] text-white border-[#103A5E]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Custom Date
                </button>
                {showDatePicker && (
                  <div className="absolute mt-12 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <input
                      type="date"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      min={format(subDays(new Date(), 6), "yyyy-MM-dd")}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => {
                        setSelectedDate(new Date(e.target.value));
                        setShowDatePicker(false);
                      }}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Sorting Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("timeRecorded")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${
                    sortField === "timeRecorded"
                      ? "bg-[#103A5E] text-white border-[#103A5E]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <ClockIcon className="h-5 w-5" />
                  Time{" "}
                  {sortField === "timeRecorded" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("noiseAlertLevel")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${
                    sortField === "noiseAlertLevel"
                      ? "bg-[#103A5E] text-white border-[#103A5E]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Tier Level{" "}
                  {sortField === "noiseAlertLevel" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#103A5E]">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Node Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Coordinates
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Average Noise (dB)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Time Recorded
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Noise Alert Level
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Noise Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((record: NoiseRecord, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.coordinates.lat.toFixed(6)},{" "}
                      {record.coordinates.lng.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.noiseDb} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.timeRecorded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getNoiseLevelStyle(record.noiseAlertLevel).bg
                        } ${getNoiseLevelStyle(record.noiseAlertLevel).text}`}
                      >
                        {record.noiseAlertLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.noiseCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredData.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-[#103A5E] border-[#103A5E] text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Noise Level Categories */}
          <div className="px-8 py-8 border-t border-gray-100 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-[#103A5E]">
                  Noise Level Reference
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Understanding noise level classifications and their thresholds
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {NOISE_CATEGORIES.map((category, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${category.bgColor}`}
                  >
                    <div
                      className={`text-sm font-medium ${category.textColor}`}
                    >
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
  );
}
