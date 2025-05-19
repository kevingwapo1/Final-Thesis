export const NOISE_CATEGORIES = [
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
    range: '71-85 dB (15+ mins)',
    color: '#EAB308',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    min: 71,
    max: 85,
    intervals: 1
  },
  { 
    label: 'Tier 2',
    range: '86-100 dB (15+ mins)',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    min: 86,
    max: 100,
    intervals: 3
  },
  { 
    label: 'Tier 3',
    range: '>101 dB (Spike)',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    min: 101,
    max: Infinity,
    intervals: 1
  }
]

export const NOISE_THRESHOLD = 55 