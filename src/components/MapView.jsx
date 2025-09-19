import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ path = [], current = { lat: 19.076, lng: 72.8777 } }) {
  const center = current || path[0] || { lat: 19.076, lng: 72.8777 };
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <MapContainer center={center} zoom={13} style={{ height: 360, width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        {path.length > 1 && <Polyline positions={path} color="#22d3ee" />}
        <Marker position={center}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            Vehicle
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
