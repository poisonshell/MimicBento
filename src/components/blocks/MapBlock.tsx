'use client';

import { useEffect, useRef } from 'react';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
  GeocodeResult,
} from '@/types/bento';

// Enhanced Google Maps type definitions
interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
    Marker: new (options: MarkerOptions) => GoogleMarker;
    Circle: new (options: CircleOptions) => GoogleCircle;
    Geocoder: new () => GoogleGeocoder;
    OverlayView: new () => GoogleOverlayView;
    SymbolPath: {
      CIRCLE: number;
    };
  };
}

interface GoogleMap {
  overlays?: GoogleOverlay[];
}

interface GoogleMarker {
  setMap(map: GoogleMap | null): void;
}

interface GoogleCircle {
  setMap(map: GoogleMap | null): void;
}

interface GoogleGeocoder {
  geocode(
    request: { address: string },
    callback: (results: GeocodeResult[] | null, status: string) => void
  ): void;
}

interface GoogleOverlayView {
  getPanes(): {
    overlayLayer: HTMLElement;
  } | null;
  getProjection(): {
    fromLatLngToDivPixel(latLng: LatLng): { x: number; y: number } | null;
  };
  setMap(map: GoogleMap | null): void;
}

interface LatLng {
  lat(): number;
  lng(): number;
}

interface GoogleMapOptions {
  center: LatLng;
  zoom: number;
  styles: MapStyle[];
  disableDefaultUI: boolean;
  gestureHandling: string;
  zoomControl: boolean;
  mapTypeControl: boolean;
  scaleControl: boolean;
  streetViewControl: boolean;
  rotateControl: boolean;
  fullscreenControl: boolean;
  keyboardShortcuts: boolean;
  clickableIcons: boolean;
  scrollwheel: boolean;
  panControl: boolean;
}

interface MarkerOptions {
  position: LatLng;
  map: GoogleMap;
  title: string;
  icon: {
    path: number;
    scale: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWeight: number;
  };
}

interface CircleOptions {
  strokeColor: string;
  strokeOpacity: number;
  fillColor: string;
  fillOpacity: number;
  map: GoogleMap;
  center: LatLng;
  radius: number;
}

interface MapStyle {
  featureType: string;
  elementType: string;
  stylers: Array<{ [key: string]: string | number }>;
}

interface GoogleOverlay {
  setMap(map: GoogleMap | null): void;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

declare global {
  interface Window {
    google: GoogleMapsAPI;
    initMap: () => void;
  }
}

function MapBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);

  // Type-safe content access
  const contentRecord = content as Record<string, unknown>;
  const location =
    typeof contentRecord.location === 'string' ? contentRecord.location : '';
  const address =
    typeof contentRecord.address === 'string' ? contentRecord.address : '';
  const zoom = typeof contentRecord.zoom === 'number' ? contentRecord.zoom : 12;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            initializeMap();
          }
        }, 100);
        return;
      }

      // Load Google Maps script
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        showFallbackMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;
      // Prevent duplicate initialization
      if (mapInstanceRef.current) return;

      // Geocode the location
      const geocoder = new window.google.maps.Geocoder();
      const searchQuery = address || location;

      geocoder.geocode(
        { address: searchQuery },
        async (results: GeocodeResult[] | null, status: string) => {
          if (status === 'OK' && results && results[0] && mapRef.current) {
            const locationResult = results[0].geometry.location;

            // Exact replica of original bento.me map colors
            const mapStyles: MapStyle[] = [
              {
                featureType: 'all',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ visibility: 'on' }],
              },
              // All labels disabled - we use custom overlays instead
              {
                featureType: 'administrative',
                elementType: 'geometry',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f5f1ea' }],
              },
              {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{ color: '#88e577' }],
              },
              {
                featureType: 'landscape.man_made',
                elementType: 'geometry',
                stylers: [{ color: '#e8e8e8' }],
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#f3f5ec' }],
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#88e577' }],
              },
              {
                featureType: 'poi.business',
                elementType: 'geometry',
                stylers: [{ color: '#f3f5ec' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#fefefe' }, { weight: 0.5 }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#fefefe' }, { weight: 0.7 }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{ color: '#fefefe' }, { weight: 0.7 }],
              },
              {
                featureType: 'road.local',
                elementType: 'geometry',
                stylers: [{ color: '#fefefe' }, { weight: 0.3 }],
              },
              {
                featureType: 'transit',
                elementType: 'all',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#86c4f6' }],
              },
              // Hide grid lines and other UI elements
              {
                featureType: 'all',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'administrative.country',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'administrative.province',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'administrative.locality',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'off' }],
              },
            ];

            const mapOptions: GoogleMapOptions = {
              center: locationResult,
              zoom: zoom,
              styles: mapStyles,
              disableDefaultUI: true,
              gestureHandling: 'none',
              zoomControl: false,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              keyboardShortcuts: false,
              clickableIcons: false,
              scrollwheel: false,
              // Removed draggable: false to allow block dragging
              panControl: false,
            };

            const map = new window.google.maps.Map(mapRef.current, mapOptions);
            mapInstanceRef.current = map;

            // Store references to overlays for cleanup
            const overlays: GoogleOverlay[] = [];
            map.overlays = overlays;

            // Hide Google copyright and controls completely + Add marker animation
            setTimeout(() => {
              const mapElement = mapRef.current;
              if (mapElement) {
                // Hide all Google copyright and control elements + Add marker pulse animation
                const style = document.createElement('style');
                style.textContent = `
                  .gm-style-cc { display: none !important; }
                  .gmnoprint { display: none !important; }
                  .gm-style .gm-style-cc { display: none !important; }
                  .gm-style .gmnoprint { display: none !important; }
                  [title="Toggle fullscreen view"] { display: none !important; }
                  [title="Keyboard shortcuts"] { display: none !important; }
                  .gm-bundled-control { display: none !important; }
                  .gm-control-active { display: none !important; }
                  .gm-iv-close { display: none !important; }
                  .gm-iv-fullscreen { display: none !important; }
                  .gm-ui-hover-effect { display: none !important; }
                  a[href*="maps.google.com"] { display: none !important; }
                  a[href*="google.com/maps"] { display: none !important; }
                  [data-value="Keyboard shortcuts"] { display: none !important; }
                  .gmnoprint div { display: none !important; }
                  .gm-style div[title] { pointer-events: none !important; }
                  
                  /* Offset city/state labels to avoid overlap with marker */
                  .gm-style-pbt {
                    transform: translateX(40px) translateY(-10px) !important;
                  }
                  
                  .gm-style div[style*="z-index: 1"] div[style*="color: rgb(139, 139, 139)"] {
                    transform: translateX(40px) translateY(-10px) !important;
                  }
                  
                  /* Alternative approach for label positioning */
                  .gm-style > div > div > div > div[style*="position: absolute"] div[style*="font-size: 11px"] {
                    transform: translateX(35px) translateY(-8px) !important;
                  }
                  
                  .gm-style > div > div > div > div[style*="position: absolute"] div[style*="font-size: 12px"] {
                    transform: translateX(35px) translateY(8px) !important;
                  }
                  
                  @keyframes markerPulse {
                    0% {
                      transform: translate(-50%, -50%) scale(1);
                      opacity: 0.2;
                    }
                    75%, 100% {
                      transform: translate(-50%, -50%) scale(2);
                      opacity: 0;
                    }
                  }
                `;
                document.head.appendChild(style);
              }
            }, 100);

            // Create a static marker without bounce animation
            new window.google.maps.Marker({
              position: locationResult,
              map: map,
              title: location,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#679BFF',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              },
              // Remove bouncing animation for smooth pulsing effect
            });

            // Animate the pulsing effect with smooth CSS animations and move labels
            setTimeout(() => {
              const mapElement = mapRef.current;
              if (mapElement) {
                const pulseStyle = document.createElement('style');
                pulseStyle.textContent = `
                  .gm-style > div > div:nth-child(2) > div:nth-child(3) {
                    animation: smoothPulse 2s ease-in-out infinite !important;
                  }
                  .gm-style > div > div:nth-child(2) > div:nth-child(4) {
                    animation: smoothPulse 2s ease-in-out infinite 0.5s !important;
                  }
                `;
                document.head.appendChild(pulseStyle);

                // Create custom location labels using OverlayView positioned away from marker
                const locationName = results[0].address_components?.find(
                  (component: AddressComponent) =>
                    component.types.includes('locality')
                )?.long_name;

                const stateName = results[0].address_components?.find(
                  (component: AddressComponent) =>
                    component.types.includes('administrative_area_level_1')
                )?.short_name;

                // Custom overlay class for labels with precise offset positioning
                class LabelOverlay extends window.google.maps.OverlayView {
                  private div: HTMLElement | null = null;
                  private position: LatLng;
                  private text: string;
                  private offsetX: number;
                  private offsetY: number;
                  private fontSize: string;

                  constructor(
                    position: LatLng,
                    text: string,
                    offsetX: number,
                    offsetY: number,
                    fontSize: string
                  ) {
                    super();
                    this.position = position;
                    this.text = text;
                    this.offsetX = offsetX;
                    this.offsetY = offsetY;
                    this.fontSize = fontSize;
                  }

                  onAdd() {
                    this.div = document.createElement('div');
                    this.div.style.position = 'absolute';
                    this.div.style.pointerEvents = 'none';
                    this.div.style.fontFamily =
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    this.div.style.fontSize = this.fontSize;
                    this.div.style.color = '#8b8b8b';
                    this.div.style.fontWeight = '400';
                    this.div.style.textShadow =
                      '1px 1px 2px rgba(255,255,255,0.8)';
                    this.div.style.whiteSpace = 'nowrap';
                    this.div.textContent = this.text;

                    const panes = this.getPanes();
                    panes?.overlayLayer.appendChild(this.div);
                  }

                  draw() {
                    if (!this.div) return;

                    const projection = this.getProjection();
                    const point = projection.fromLatLngToDivPixel(
                      this.position
                    );

                    if (point) {
                      this.div.style.left = point.x + this.offsetX + 'px';
                      this.div.style.top = point.y + this.offsetY + 'px';
                    }
                  }

                  onRemove() {
                    if (this.div && this.div.parentNode) {
                      this.div.parentNode.removeChild(this.div);
                      this.div = null;
                    }
                  }
                }

                // Create labels with proper offset positioning (only once)
                if (locationName) {
                  const cityLabel = new LabelOverlay(
                    locationResult,
                    locationName,
                    50,
                    -10,
                    '11px'
                  );
                  cityLabel.setMap(map);
                  overlays.push(cityLabel);
                }

                if (stateName) {
                  const stateLabel = new LabelOverlay(
                    locationResult,
                    stateName,
                    50,
                    5,
                    '12px'
                  );
                  stateLabel.setMap(map);
                  overlays.push(stateLabel);
                }
              }
            }, 200);
          } else {
            // Fallback if geocoding fails
            showFallbackMap();
          }
        }
      );
    };

    const showFallbackMap = () => {
      if (!mapRef.current) return;

      // Show a fallback with nice styling and smaller fonts
      mapRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-700 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-4 left-4 w-16 h-16 bg-white rounded-full"></div>
            <div class="absolute top-8 right-8 w-12 h-12 bg-white/60 rounded-full"></div>
            <div class="absolute bottom-6 left-8 w-20 h-20 bg-white/40 rounded-full"></div>
          </div>
          <div class="relative z-10">
            <div class="mb-2">
              <svg class="w-8 h-8 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-sm mb-1 text-gray-800">${title || location}</h3>
            ${address ? `<p class="text-xs text-gray-600">${address}</p>` : ''}
          </div>
        </div>
      `;
    };

    if (!location) {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-700 relative overflow-hidden">
            <div class="relative z-10">
              <div class="mb-2">
                <svg class="w-8 h-8 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 6 16 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-sm mb-1 text-gray-800">Add a location</h3>
            </div>
          </div>
        `;
      }
      return;
    }

    loadGoogleMaps();

    return () => {
      // Cleanup overlays and map
      if (mapInstanceRef.current && mapInstanceRef.current.overlays) {
        // Remove any existing overlays
        const existingOverlays = mapInstanceRef.current.overlays;
        existingOverlays.forEach((overlay: GoogleOverlay) => {
          if (overlay && typeof overlay.setMap === 'function') {
            overlay.setMap(null);
          }
        });
        mapInstanceRef.current = null;
      }
    };
  }, [location, address, zoom, title]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-sky-100 to-blue-200 rounded-xl">
      {/* Simple loading state without clouds */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-bounce mb-2">
            <svg
              className="w-8 h-8 text-blue-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>

      {/* Map container with hidden Google elements */}
      <div
        ref={mapRef}
        className="w-full h-full pointer-events-none [&_.gm-style-cc]:hidden [&_.gmnoprint]:hidden [&_[title='Toggle fullscreen view']]:hidden [&_[title='Keyboard shortcuts']]:hidden"
      />

      {/* Floating clouds overlay - exact replica of bento.me */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
        {/* Background cloud with blur and low brightness */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cloud.png"
          alt=""
          className="absolute w-[400px] opacity-5 blur-sm brightness-[0.2]"
          style={{
            transform: 'translate(50px, 80px) scale(1) rotate(45deg)',
            left: '0px',
            top: '0px',
          }}
        />

        {/* Main visible cloud - slowly drifting */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cloud.png"
          alt=""
          className="absolute w-[300px] opacity-30"
          style={{
            animation: 'drift 35s ease-in-out infinite',
            left: '0px',
            top: '0px',
          }}
        />

        {/* Secondary cloud - floating gently */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cloud.png"
          alt=""
          className="absolute w-[200px] opacity-25"
          style={{
            animation: 'float 28s ease-in-out infinite',
            animationDelay: '3s',
            left: '0px',
            top: '0px',
          }}
        />

        {/* Small floating cloud - bobbing motion */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cloud.png"
          alt=""
          className="absolute w-[150px] opacity-20"
          style={{
            animation: 'bob 25s ease-in-out infinite',
            animationDelay: '6s',
            left: '0px',
            top: '0px',
          }}
        />

        {/* Flying airplane - circular flight path */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/plane.png"
          alt=""
          className="absolute w-[24px]"
          style={{
            animation: 'fly 25s linear infinite',
            left: '0px',
            top: '0px',
          }}
        />

        {/* Airplane shadow - follows plane */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/planeshadow.png"
          alt=""
          className="absolute w-[24px] opacity-60"
          style={{
            animation: 'flyShadow 25s linear infinite',
            left: '0px',
            top: '0px',
          }}
        />
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'map',
  name: 'Map',
  icon: 'FiMap',
  description: 'Location map with address',
  defaultSize: 'wide',
  supportedSizes: ['medium', 'large', 'wide'],
  category: 'utility',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'New York, NY',
      help: 'City, landmark, or place name',
      validation: {
        max: 100,
        message: 'Location must be 100 characters or less',
      },
    },
    {
      key: 'address',
      label: 'Address (optional)',
      type: 'text',
      placeholder: '123 Main St, New York, NY 10001',
      help: 'Specific address for more precise location',
      validation: {
        max: 200,
        message: 'Address must be 200 characters or less',
      },
    },
    {
      key: 'zoom',
      label: 'Zoom Level',
      type: 'select',
      defaultValue: '12',
      options: [
        { value: '8', label: 'City View (8)' },
        { value: '10', label: 'District View (10)' },
        { value: '12', label: 'Neighborhood View (12)' },
        { value: '14', label: 'Street View (14)' },
        { value: '16', label: 'Block View (16)' },
      ],
      help: 'How close the map should zoom in',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const locationValue =
      typeof data.location === 'string' ? data.location : '';
    if (!locationValue || locationValue.trim().length === 0) {
      return 'Location is required';
    }
    return null;
  },
};

// Default content when creating a new map block
const getDefaultContent = (): Record<string, unknown> => ({
  location: '',
  zoom: 12,
});

// Preview component for the add modal
function MapPreviewComponent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const location = typeof content.location === 'string' ? content.location : '';
  const address = typeof content.address === 'string' ? content.address : '';

  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">🗺️ Map</div>
      <div className="text-gray-500 text-xs">
        {location || 'Location not set'}
        {address && address !== location && <div>{address}</div>}
      </div>
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: MapBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: MapPreviewComponent,
};

// Export the component for backwards compatibility
export default MapBlockComponent;
