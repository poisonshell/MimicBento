'use client';

import { useEffect, useRef } from 'react';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
  GeocodeResult,
} from '@/types/bento';


interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
    Geocoder: new () => GoogleGeocoder;
    OverlayView: new () => GoogleOverlayView;
    LatLng: new (lat: number, lng: number) => LatLng;
    event: {
      trigger: (instance: GoogleMap, eventName: string) => void;
    };
  };
}

interface GoogleMap {
  overlays?: GoogleOverlay[];
  setOptions(options: Partial<GoogleMapOptions>): void;
  addListener(eventName: string, handler: () => void): void;
  getOptions?(): Partial<GoogleMapOptions>;
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
    overlayMouseTarget: HTMLElement;
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
  mapId?: string;
  mapTypeId?: string;
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


function MapBlockComponent({ block, isMobile }: BlockComponentProps) {
  const { content, title } = block;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);


  const contentRecord = content as Record<string, unknown>;
  const location =
    typeof contentRecord.location === 'string' ? contentRecord.location : '';
  const address =
    typeof contentRecord.address === 'string' ? contentRecord.address : '';
  const zoom =
    typeof contentRecord.zoom === 'string'
      ? parseInt(contentRecord.zoom, 10)
      : typeof contentRecord.zoom === 'number'
        ? contentRecord.zoom
        : 12;

  useEffect(() => {
    if (typeof window === 'undefined') return;


    const initTimeout = setTimeout(
      () => {
        loadGoogleMaps();
      },
      isMobile ? 100 : 50
    );


    if (isMobile && mapRef.current && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.target === mapRef.current && mapInstanceRef.current) {

            setTimeout(() => {
              if (window.google && mapInstanceRef.current) {
                window.google.maps.event.trigger(
                  mapInstanceRef.current,
                  'resize'
                );
              }
            }, 100);
          }
        }
      });
      resizeObserverRef.current.observe(mapRef.current);
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }


      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            initializeMap();
          }
        }, 100);
        return;
      }


      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        showFallbackMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {

      if (
        !mapRef.current ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.Geocoder
      ) {

        setTimeout(initializeMap, 100);
        return;
      }


      if (mapInstanceRef.current) return;


      const geocoder = new window.google.maps.Geocoder();
      const searchQuery = address || location;

      geocoder.geocode(
        { address: searchQuery },
        async (results: GeocodeResult[] | null, status: string) => {
          if (status === 'OK' && results && results[0] && mapRef.current) {
            const locationResult = results[0].geometry.location;


            let mapCenter = locationResult;
            if (isMobile && window.google) {


              const lat = locationResult.lat();
              const lng = locationResult.lng();

              mapCenter = new window.google.maps.LatLng(lat, lng - 0.001);
            }
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



            const mapOptions: Omit<GoogleMapOptions, 'mapId'> = {
              center: mapCenter,
              zoom: isMobile ? Math.max(zoom - 1, 8) : zoom,
              styles: mapStyles,
              mapTypeId: 'roadmap',
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
              panControl: false,
            };

            const map = new window.google.maps.Map(mapRef.current, mapOptions);
            mapInstanceRef.current = map;


            const forceStyles = () => {
              map.setOptions({
                styles: mapStyles,
                mapTypeId: 'roadmap',
              });
            };


            forceStyles();
            setTimeout(forceStyles, 100);
            setTimeout(forceStyles, 500);


            map.addListener('idle', forceStyles);


            const overlays: GoogleOverlay[] = [];
            map.overlays = overlays;


            setTimeout(() => {
              const mapElement = mapRef.current;
              if (mapElement) {

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
                  
                  
                  .gm-style-pbt {
                    transform: ${isMobile ? 'translateX(18px) translateY(-8px)' : 'translateX(40px) translateY(-10px)'} !important;
                  }
                  
                  .gm-style div[style*="z-index: 1"] div[style*="color: rgb(139, 139, 139)"] {
                    transform: ${isMobile ? 'translateX(18px) translateY(-8px)' : 'translateX(40px) translateY(-10px)'} !important;
                  }
                  
                  
                  .gm-style > div > div > div > div[style*="position: absolute"] div[style*="font-size: 11px"] {
                    transform: ${isMobile ? 'translateX(15px) translateY(-6px)' : 'translateX(35px) translateY(-8px)'} !important;
                    font-size: ${isMobile ? '10px' : '11px'} !important;
                  }
                  
                  .gm-style > div > div > div > div[style*="position: absolute"] div[style*="font-size: 12px"] {
                    transform: ${isMobile ? 'translateX(15px) translateY(6px)' : 'translateX(35px) translateY(8px)'} !important;
                    font-size: ${isMobile ? '11px' : '12px'} !important;
                  }
                  
                `;
                document.head.appendChild(style);
              }
            }, 100);



            class CustomPinMarker extends window.google.maps.OverlayView {
              private position: LatLng;
              private div: HTMLElement | null = null;

              constructor(position: LatLng) {
                super();
                this.position = position;
              }

              onAdd() {
                this.div = document.createElement('div');
                this.div.className = 'custom-pin-marker';
                this.div.style.position = 'absolute';
                this.div.style.cursor = 'pointer';
                this.div.style.width = '32px';
                this.div.style.height = '32px';
                this.div.style.transform = 'translate(-50%, -50%)';
                this.div.title = location;


                const pin = document.createElement('div');
                pin.className = 'custom-pin';
                pin.style.width = '24px';
                pin.style.height = '24px';
                pin.style.backgroundColor = '#679BFF';
                pin.style.border = '3px solid #ffffff';
                pin.style.borderRadius = '50%';
                pin.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                pin.style.position = 'relative';
                pin.style.left = '4px';
                pin.style.top = '4px';

                this.div.appendChild(pin);

                const panes = this.getPanes();
                panes?.overlayMouseTarget.appendChild(this.div);
              }

              draw() {
                if (!this.div) return;

                const projection = this.getProjection();
                const point = projection.fromLatLngToDivPixel(this.position);

                if (point) {
                  this.div.style.left = point.x + 'px';
                  this.div.style.top = point.y + 'px';
                }
              }

              onRemove() {
                if (this.div && this.div.parentNode) {
                  this.div.parentNode.removeChild(this.div);
                  this.div = null;
                }
              }
            }


            const customMarker = new CustomPinMarker(locationResult);
            customMarker.setMap(map);
            overlays.push(customMarker);


            setTimeout(() => {
              const mapElement = mapRef.current;
              if (mapElement) {
                const pulseStyle = document.createElement('style');
                pulseStyle.textContent = `
                  
                  .custom-pin {
                    animation: smoothPulse 2s ease-in-out infinite !important;
                  }
                  
                  
                  @keyframes smoothPulse {
                    0%, 100% {
                      transform: scale(1);
                      opacity: 0.9;
                    }
                    50% {
                      transform: scale(1.1);
                      opacity: 1;
                    }
                  }
                `;
                document.head.appendChild(pulseStyle);


                const locationName = results[0].address_components?.find(
                  (component: AddressComponent) =>
                    component.types.includes('locality')
                )?.long_name;

                const stateName = results[0].address_components?.find(
                  (component: AddressComponent) =>
                    component.types.includes('administrative_area_level_1')
                )?.short_name;


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


                if (locationName) {

                  const xOffset = isMobile ? 15 : 50;
                  const yOffset = isMobile ? -8 : -10;

                  const cityLabel = new LabelOverlay(
                    locationResult,
                    locationName,
                    xOffset,
                    yOffset,
                    '10px'
                  );
                  cityLabel.setMap(map);
                  overlays.push(cityLabel);
                }

                if (stateName) {

                  const xOffset = isMobile ? 15 : 50;
                  const yOffset = isMobile ? 8 : 5;

                  const stateLabel = new LabelOverlay(
                    locationResult,
                    stateName,
                    xOffset,
                    yOffset,
                    '11px'
                  );
                  stateLabel.setMap(map);
                  overlays.push(stateLabel);
                }
              }
            }, 200);
          } else {

            showFallbackMap();
          }
        }
      );
    };

    const showFallbackMap = () => {
      if (!mapRef.current) return;


      const fallbackContainer = document.createElement('div');
      fallbackContainer.className =
        'flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-700 relative overflow-hidden';


      const backgroundDiv = document.createElement('div');
      backgroundDiv.className = 'absolute inset-0 opacity-10';

      const circle1 = document.createElement('div');
      circle1.className =
        'absolute top-4 left-4 w-16 h-16 bg-white rounded-full';

      const circle2 = document.createElement('div');
      circle2.className =
        'absolute top-8 right-8 w-12 h-12 bg-white/60 rounded-full';

      const circle3 = document.createElement('div');
      circle3.className =
        'absolute bottom-6 left-8 w-20 h-20 bg-white/40 rounded-full';

      backgroundDiv.appendChild(circle1);
      backgroundDiv.appendChild(circle2);
      backgroundDiv.appendChild(circle3);


      const contentDiv = document.createElement('div');
      contentDiv.className = 'relative z-10';


      const iconDiv = document.createElement('div');
      iconDiv.className = 'mb-2';


      const svgIcon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      svgIcon.setAttribute('class', 'w-8 h-8 text-blue-500 mx-auto');
      svgIcon.setAttribute('fill', 'none');
      svgIcon.setAttribute('stroke', 'currentColor');
      svgIcon.setAttribute('viewBox', '0 0 24 24');

      const path1 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path1.setAttribute('stroke-linecap', 'round');
      path1.setAttribute('stroke-linejoin', 'round');
      path1.setAttribute('stroke-width', '2');
      path1.setAttribute(
        'd',
        'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
      );

      const path2 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path2.setAttribute('stroke-linecap', 'round');
      path2.setAttribute('stroke-linejoin', 'round');
      path2.setAttribute('stroke-width', '2');
      path2.setAttribute('d', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z');

      svgIcon.appendChild(path1);
      svgIcon.appendChild(path2);
      iconDiv.appendChild(svgIcon);


      const titleElement = document.createElement('h3');
      titleElement.className = 'font-semibold text-sm mb-1 text-gray-800';
      titleElement.textContent = String(title || location);


      const addressElement = document.createElement('p');
      if (address) {
        addressElement.className = 'text-xs text-gray-600';
        addressElement.textContent = String(address);
      }


      contentDiv.appendChild(iconDiv);
      contentDiv.appendChild(titleElement);
      if (address) {
        contentDiv.appendChild(addressElement);
      }

      fallbackContainer.appendChild(backgroundDiv);
      fallbackContainer.appendChild(contentDiv);


      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(fallbackContainer);
    };

    if (!location) {
      if (mapRef.current) {

        const emptyStateContainer = document.createElement('div');
        emptyStateContainer.className =
          'flex flex-col items-center justify-center h-full text-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-700 relative overflow-hidden';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'relative z-10';


        const iconDiv = document.createElement('div');
        iconDiv.className = 'mb-2';


        const svgIcon = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );
        svgIcon.setAttribute('class', 'w-8 h-8 text-blue-500 mx-auto');
        svgIcon.setAttribute('fill', 'none');
        svgIcon.setAttribute('stroke', 'currentColor');
        svgIcon.setAttribute('viewBox', '0 0 24 24');

        const path1 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path1.setAttribute('stroke-linecap', 'round');
        path1.setAttribute('stroke-linejoin', 'round');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute(
          'd',
          'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
        );

        const path2 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path2.setAttribute('stroke-linecap', 'round');
        path2.setAttribute('stroke-linejoin', 'round');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('d', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z');

        svgIcon.appendChild(path1);
        svgIcon.appendChild(path2);
        iconDiv.appendChild(svgIcon);


        const titleElement = document.createElement('h3');
        titleElement.className = 'font-semibold text-sm mb-1 text-gray-800';
        titleElement.textContent = 'Add a location';


        contentDiv.appendChild(iconDiv);
        contentDiv.appendChild(titleElement);
        emptyStateContainer.appendChild(contentDiv);


        mapRef.current.innerHTML = '';
        mapRef.current.appendChild(emptyStateContainer);
      }
      return;
    }

    loadGoogleMaps();

    return () => {

      clearTimeout(initTimeout);


      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }


      if (mapInstanceRef.current && mapInstanceRef.current.overlays) {

        const existingOverlays = mapInstanceRef.current.overlays;
        existingOverlays.forEach((overlay: GoogleOverlay) => {
          if (overlay && typeof overlay.setMap === 'function') {
            overlay.setMap(null);
          }
        });
        mapInstanceRef.current = null;
      }
    };
  }, [location, address, zoom, title, isMobile]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-sky-100 to-blue-200 rounded-xl">
      { }
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

      { }
      <div
        ref={mapRef}
        className="w-full h-full pointer-events-none [&_.gm-style-cc]:hidden [&_.gmnoprint]:hidden [&_[title='Toggle fullscreen view']]:hidden [&_[title='Keyboard shortcuts']]:hidden"
      />

      { }
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
        { }
        { }
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

        { }
        { }
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

        { }
        { }
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

        { }
        { }
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

        { }
        { }
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

        { }
        { }
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


const getDefaultContent = (): Record<string, unknown> => ({
  location: '',
  zoom: '12',
});


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

export const blockModule: BlockModule = {
  config,
  Component: MapBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: MapPreviewComponent,
};

export default MapBlockComponent;
