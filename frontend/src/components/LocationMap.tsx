"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapProps {
    center: { lat: number, lng: number };
    onMarkerDrag?: (lat: number, lng: number) => void;
}

// Marker Icon Fix (Default icons break in Next.js)
const createIcon = () => {
    return L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        shadowUrl: undefined,
        shadowSize: undefined,
        shadowAnchor: undefined
    });
};

function MapEventHandler({ onMarkerDrag }: { onMarkerDrag?: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        click(e) {
            onMarkerDrag?.(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
}

function PanToCenter({ center }: { center: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([center.lat, center.lng], 15);
    }, [center.lat, center.lng, map]);
    return null;
}

export default function LocationMap({ center, onMarkerDrag }: MapProps) {
    const markerRef = useRef<any>(null);
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onMarkerDrag?.(lat, lng);
                }
            },
        }),
        [onMarkerDrag]
    );

    const [icon, setIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        // Only run on client
        setIcon(createIcon());
    }, []);

    if (!icon) return null;

    return (
        <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={15} 
            scrollWheelZoom={true} 
            className="h-full w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={[center.lat, center.lng]}
                ref={markerRef}
                icon={icon}
            >
                <Popup minWidth={90}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#333333]">Update Location</span>
                </Popup>
            </Marker>
            <PanToCenter center={center} />
            <MapEventHandler onMarkerDrag={onMarkerDrag} />
        </MapContainer>
    );
}
