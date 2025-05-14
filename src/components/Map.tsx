'use client'

import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer } from 'ol/layer'
import { OSM } from 'ol/source'
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

  const getNoiseColor = (noisePeak: number, duration?: number) => {
    // Tier 3 (Red): >85 dB
    if (noisePeak > 85) {
      return [255, 0, 0, 0.8] // Red
    }
    // Tier 2 (Orange): 71-85 dB for 15+ minutes
    if (noisePeak >= 71 && noisePeak <= 85 && duration && duration >= 15) {
      return [255, 140, 0, 0.75] // Orange
    }
    // Tier 1 (Yellow): 55-70 dB for 5+ minutes
    if (noisePeak >= 55 && noisePeak <= 70 && duration && duration >= 5) {
      return [255, 255, 0, 0.7] // Yellow
    }
    // Default state
    return [50, 205, 50, 0.65] // Light green
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

  // Calculate fixed 15-meter radius in pixels
  const calculateRadius = (coordinates: number[], resolution: number) => {
    const view = mapInstanceRef.current?.getView()
    if (!view) return 0

    const projection = view.getProjection()
    const metersPerUnit = projection.getMetersPerUnit() || 1
    const pointResolution = getPointResolution(projection, resolution, coordinates)
    
    // Convert 15 meters to map units and maintain constant size
    return (15 / metersPerUnit) / pointResolution
  }

  useEffect(() => {
    if (!mapRef.current) return

    const createFeatures = (currentZoom: number) => {
      // Show grouped averages when zoomed out (zoom < 16)
      const displayNodes = currentZoom < 16 ? groupNodesByLocation() : nodes
      
      const features = displayNodes
        .filter((node): node is NodeType => 
          typeof node === 'object' && 
          node !== null && 
          'noisePeak' in node && 
          typeof node.noisePeak === 'number' && 
          'location' in node &&
          typeof node.location === 'string' &&
          'lat' in node &&
          typeof node.lat === 'number' &&
          'lng' in node &&
          typeof node.lng === 'number'
        )
        .map(node => {
          const feature = new Feature<Point>({
            geometry: new Point(fromLonLat([node.lng, node.lat])),
            properties: node
          })

          const color = getNoiseColor(node.noisePeak, node.duration)
          const isSelected = selectedNode && 'id' in node && selectedNode.id === node.id
          const isHovered = hoveredFeature === feature

          const renderFunction: RenderFunction = (coords, state) => {
            if (!coords || !Array.isArray(coords) || coords.length < 2) return

            const ctx = state.context
            const pixelRatio = state.pixelRatio
            const coordinates = coords.map(Number)
            const [x, y] = coordinates

            // Calculate radius in screen pixels
            const baseRadius = calculateRadius(coordinates, state.resolution)
            const screenRadius = baseRadius * pixelRatio

            // Add pulsing effect for selected or hovered nodes
            let finalRadius = screenRadius
            if (isSelected || isHovered) {
              const currentTime = Date.now()
              if (!startTimeRef.current) startTimeRef.current = currentTime
              const elapsed = currentTime - startTimeRef.current
              const pulseScale = 1 + Math.sin(elapsed / 500) * 0.2
              finalRadius *= pulseScale
            }

            // Enhanced glow effect
            const numLayers = isSelected || isHovered ? 12 : 8
            for (let i = numLayers; i >= 0; i--) {
              const layerRadius = finalRadius * (1 + i * 0.15)
              const alpha = color[3] * (1 - (i / numLayers) * 0.8)

              ctx.beginPath()
              ctx.arc(Number(x), Number(y), layerRadius, 0, 2 * Math.PI)
              ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
              ctx.fill()
            }

            // Draw main circle with stronger opacity
            ctx.beginPath()
            ctx.arc(Number(x), Number(y), finalRadius, 0, 2 * Math.PI)
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] * 1.2})`
            ctx.fill()

            // Enhanced stroke
            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`
            ctx.lineWidth = isSelected || isHovered ? 3 : 2
            ctx.stroke()

            // Improved text rendering
            const fontSize = Math.max(12, Math.min(finalRadius / 3, 16))
            ctx.font = `bold ${fontSize}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const nodeCount = 'count' in node ? ` (${node.count})` : ''
            const text = currentZoom < 16 
              ? `${node.location}\n${node.noisePeak} dB${nodeCount}`
              : `${node.noisePeak} dB`

            // Enhanced text visibility with white outline
            const lines = text.split('\n')
            const lineHeight = fontSize * 1.2

            lines.forEach((line, i) => {
              const yOffset = (i - (lines.length - 1) / 2) * lineHeight
              const yPos = Number(y) + yOffset
              
              // Draw outline
              ctx.strokeStyle = 'white'
              ctx.lineWidth = 4
              ctx.strokeText(line, Number(x), yPos)
              
              // Draw text
              ctx.fillStyle = 'black'
              ctx.fillText(line, Number(x), yPos)
            })

            if (isSelected || isHovered) {
              animationFrameRef.current = requestAnimationFrame(() => {
                feature.changed()
              })
            }
          }

          feature.setStyle(new Style({ renderer: renderFunction }))
          return feature
        })

      return features
    }

    if (!mapInstanceRef.current) {
      const vectorSource = new VectorSource({
        features: createFeatures(zoom)
      })

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      })

      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat([center[1], center[0]]),
          zoom: zoom,
          minZoom: 10,
          maxZoom: 19,
          constrainResolution: true
        })
      })

      // Handle zoom changes
      mapInstanceRef.current.getView().on('change:resolution', () => {
        const currentZoom = mapInstanceRef.current?.getView().getZoom() || zoom
        vectorSource.clear()
        vectorSource.addFeatures(createFeatures(currentZoom))
      })

      // Handle pointer interactions
      mapInstanceRef.current.on('pointermove', (event) => {
        const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
          event.pixel,
          feature => feature as Feature<Point>
        )
        setHoveredFeature(feature || null)
      })

      // Handle click events - only for hover effect, no zooming
      mapInstanceRef.current.on('click', (event) => {
        const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
          event.pixel,
          feature => feature as Feature<Point>
        )
        setHoveredFeature(feature || null)
      })
    } else {
      // Update features without changing view
      const vectorLayer = mapInstanceRef.current.getLayers().getArray()[1] as VectorLayer<VectorSource>
      const source = vectorLayer.getSource()
      if (source) {
        source.clear()
        source.addFeatures(createFeatures(zoom))
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      startTimeRef.current = 0
      setHoveredFeature(null)
    }
  }, [nodes, selectedNode, center, zoom, hoveredFeature])

  return (
    <div ref={mapRef} className="w-full h-full relative">
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <h3 className="font-semibold mb-2">Noise Tiers</h3>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 0, 0, 0.8)' }}></div>
              <span className="text-sm">Tier 3 (&gt;85 dB)</span>
            </div>
            <div className="ml-6 text-xs text-gray-600">
              Immediate Alert
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 140, 0, 0.75)' }}></div>
              <span className="text-sm">Tier 2 (71-85 dB)</span>
            </div>
            <div className="ml-6 text-xs text-gray-600">
              Continuous for 15+ minutes
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 0, 0.7)' }}></div>
              <span className="text-sm">Tier 1 (55-70 dB)</span>
            </div>
            <div className="ml-6 text-xs text-gray-600">
              Continuous for 5+ minutes
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(50, 205, 50, 0.65)' }}></div>
              <span className="text-sm">Normal</span>
            </div>
            <div className="ml-6 text-xs text-gray-600">
              Below threshold or duration
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapComponent 