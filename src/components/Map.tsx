'use client'

import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ } from 'ol/source'
import { fromLonLat, getPointResolution } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style } from 'ol/style'
import { RenderFunction } from 'ol/style/Style'
import { Coordinate } from 'ol/coordinate'
import 'ol/ol.css'

type BaseNodeType = {
  lat: number
  lng: number
  noisePeak: number
  location: string
  duration?: number
  consecutiveIntervals?: number
}

type DetailedNodeType = BaseNodeType & {
  id: number
  name: string
  noiseLevel: string
  noiseTier: number
}

type GroupedNodeType = BaseNodeType & {
  count: number
}

type NodeType = DetailedNodeType | GroupedNodeType

interface MapProps {
  nodes: Array<DetailedNodeType>
  selectedNode: DetailedNodeType | null
  center: [number, number]
  zoom: number
}

const MapComponent = ({ nodes, selectedNode, center, zoom }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const [hoveredFeature, setHoveredFeature] = useState<Feature<Point> | null>(null)
  const previousSelectedNode = useRef<DetailedNodeType | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null)

  const getNoiseColor = (noisePeak: number, intervals?: number) => {
    // Tier 3 (Alert Strike 3): >85 dB (immediate)
    if (noisePeak > 85) {
      return [239, 68, 68, 0.8] // #EF4444 Red
    }
    // Tier 2 (Alert Strike 2): 71-85 dB for 3 consecutive intervals (15 min)
    if (noisePeak >= 71 && noisePeak <= 85 && intervals && intervals >= 3) {
      return [249, 115, 22, 0.75] // #F97316 Orange
    }
    // Tier 1 (Alert Strike 1): 71-85 dB first interval
    if (noisePeak >= 71 && noisePeak <= 85 && intervals && intervals >= 1) {
      return [234, 179, 8, 0.7] // #EAB308 Yellow
    }
    // Normal (55-70 dB)
    if (noisePeak >= 55 && noisePeak <= 70) {
      return [34, 197, 94, 0.65] // #22C55E Green
    }
    // Below threshold
    return [128, 128, 128, 0.5] // Gray for below threshold
  }

  const groupNodesByLocation = () => {
    const groups: Record<string, GroupedNodeType> = {}
    
    nodes.forEach(node => {
      if (!(node.location in groups)) {
        const locationNodes = nodes.filter(n => n.location === node.location)
        const avgNoisePeak = Math.round(
          locationNodes.reduce((acc, n) => acc + n.noisePeak, 0) / locationNodes.length
        )
        const maxDuration = Math.max(
          ...locationNodes.map(n => n.duration || 0)
        )
        const centerNode = locationNodes[Math.floor(locationNodes.length / 2)]
        
        groups[node.location] = {
          location: node.location,
          lat: centerNode.lat,
          lng: centerNode.lng,
          noisePeak: avgNoisePeak,
          duration: maxDuration,
          count: locationNodes.length
        }
      }
    })
    return Object.values(groups)
  }

  // Calculate accurate 15-meter radius in pixels
  const calculateRadius = (coordinates: number[], resolution: number) => {
    const view = mapInstanceRef.current?.getView()
    if (!view) return 0

    const projection = view.getProjection()
    const metersPerUnit = projection.getMetersPerUnit() || 1
    
    // Convert 15 meters to map units (EPSG:3857 uses meters)
    const radius = 15 / metersPerUnit
    
    // Scale radius based on resolution to maintain constant ground size
    const pointResolution = getPointResolution(
      projection,
      resolution,
      coordinates
    )
    
    return radius / pointResolution
  }

  const createFeatures = (currentZoom: number) => {
    return nodes.map(node => {
      const feature = new Feature<Point>({
        geometry: new Point(fromLonLat([node.lng, node.lat])),
        properties: node
      })

      const color = getNoiseColor(node.noisePeak, node.consecutiveIntervals)
      const isSelected = selectedNode && node.id === selectedNode.id

      const renderFunction: RenderFunction = (coords, state) => {
        if (!coords || !Array.isArray(coords) || coords.length < 2) return

        const ctx = state.context
        const pixelRatio = state.pixelRatio
        const coordinates = coords.map(Number)
        const [x, y] = coordinates

        // Calculate radius in screen pixels with proper scaling
        const baseRadius = calculateRadius(coordinates, state.resolution)
        const screenRadius = baseRadius * pixelRatio

        // Minimal pulsing effect only for selected nodes
        let finalRadius = screenRadius
        if (isSelected) {
          const currentTime = Date.now()
          if (!startTimeRef.current) startTimeRef.current = currentTime
          const elapsed = currentTime - startTimeRef.current
          const pulseScale = 1 + Math.sin(elapsed / 500) * 0.1
          finalRadius *= pulseScale
        }

        // Draw circle with semi-transparent fill
        ctx.beginPath()
        ctx.arc(Number(x), Number(y), finalRadius, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] * 0.6})`
        ctx.fill()

        // Add subtle border
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.stroke()

        // Dynamic text sizing based on zoom level
        const zoomFactor = Math.max(0.5, Math.min(currentZoom / 15, 1.2))
        const fontSize = Math.max(12, Math.min(14 * zoomFactor, 16))
        ctx.font = `600 ${fontSize}px 'Inter', system-ui, -apple-system, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Show noise level
        const text = `${node.noisePeak} dB`

        // Add subtle shadow for depth
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1

        // Simple white outline for contrast
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.strokeText(text, Number(x), Number(y))

        // Text fill with black color
        ctx.fillStyle = '#000000'
        ctx.fillText(text, Number(x), Number(y))

        ctx.restore()

        if (isSelected) {
          animationFrameRef.current = requestAnimationFrame(() => {
            feature.changed()
          })
        }
      }

      feature.setStyle(new Style({ renderer: renderFunction }))
      return feature
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      const vectorSource = new VectorSource()
      vectorSourceRef.current = vectorSource

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      })
      vectorLayerRef.current = vectorLayer

      const googleMapsLayer = new TileLayer({
        source: new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          maxZoom: 19,
          attributions: '© Google Maps'
        })
      })

      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [googleMapsLayer, vectorLayer],
        view: new View({
          center: fromLonLat([center[1], center[0]]),
          zoom: zoom,
          minZoom: 10,
          maxZoom: 19,
          constrainResolution: true
        })
      })

      // Handle zoom changes without recreating features
      mapInstanceRef.current.getView().on('change:resolution', () => {
        if (vectorLayerRef.current) {
          vectorLayerRef.current.changed()
        }
      })

      mapInstanceRef.current.on('click', (event) => {
        const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
          event.pixel,
          feature => feature as Feature<Point>
        )
        if (feature && mapInstanceRef.current) {
          const props = feature.getProperties().properties as DetailedNodeType
          const view = mapInstanceRef.current.getView()
          const coordinates = fromLonLat([props.lng, props.lat])
          
          view.animate({
            center: coordinates,
            duration: 1000
          })
        }
      })
    }

    // Update features when nodes or selection changes
    if (vectorSourceRef.current) {
      const currentZoom = mapInstanceRef.current?.getView().getZoom() || zoom
      vectorSourceRef.current.clear()
      vectorSourceRef.current.addFeatures(createFeatures(currentZoom))
    }

    // Handle smooth transitions when selectedNode changes
    if (selectedNode !== previousSelectedNode.current) {
      const view = mapInstanceRef.current?.getView()
      if (view && selectedNode) {
        view.animate({
          center: fromLonLat([selectedNode.lng, selectedNode.lat]),
          duration: 1000
        })
      }
    }
    
    previousSelectedNode.current = selectedNode

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      startTimeRef.current = 0
    }
  }, [nodes, selectedNode, center, zoom])

  return (
    <div ref={mapRef} className="w-full h-full relative">
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <div className="grid grid-cols-1 gap-1.5 min-w-[140px]">
          <div className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}></div>
            <div className="flex-1">
              <div className="text-xs font-medium">Tier 3</div>
              <div className="text-xs text-gray-500">&gt;85 dB</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.75)' }}></div>
            <div className="flex-1">
              <div className="text-xs font-medium">Tier 2</div>
              <div className="text-xs text-gray-500">71-85 dB (15m+)</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(234, 179, 8, 0.7)' }}></div>
            <div className="flex-1">
              <div className="text-xs font-medium">Tier 1</div>
              <div className="text-xs text-gray-500">71-85 dB (5m)</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.65)' }}></div>
            <div className="flex-1">
              <div className="text-xs font-medium">Normal</div>
              <div className="text-xs text-gray-500">55-70 dB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapComponent 