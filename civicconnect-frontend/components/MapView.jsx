"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useReport } from "../app/context/ReportContext";
import { RotateCw } from "lucide-react";

const SEARCH_RADIUS_KM = 25;

const toRadians = (value) => (value * Math.PI) / 180;

const distanceInKm = (pointA, pointB) => {
  const earthRadius = 6371;
  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLon = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(pointA.latitude)) *
      Math.cos(toRadians(pointB.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getDensityColor = (count) => {
  if (count >= 15) {
    return "#ef4444";
  }

  if (count >= 8) {
    return "#facc15";
  }

  return "#3b82f6";
};

const getPriorityColor = (priority) => {
  if (priority === "High") {
    return "#ef4444";
  }

  if (priority === "Medium") {
    return "#facc15";
  }

  return "#3b82f6";
};

const getDensityLabel = (count) => {
  if (count >= 15) {
    return "High";
  }

  if (count >= 8) {
    return "Medium";
  }

  return "Low";
};

const createPulseIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div class="relative">
        <div class="w-4 h-4 rounded-full" style="background:${color};"></div>
        <div class="absolute inset-0 w-4 h-4 rounded-full animate-ping" style="background:${color}; opacity:0.45;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const createDensityIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="h-5 w-5 rounded-full border border-white/50" style="background:${color};"></div>
        <div class="absolute h-9 w-9 rounded-full animate-ping" style="background:${color}; opacity:0.2;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const groupReportsByArea = (reports) => {
  const grouped = new Map();

  reports.forEach((report) => {
    const latitude = Number(report.coordinates?.latitude);
    const longitude = Number(report.coordinates?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const latBucket = Number(latitude.toFixed(2));
    const lonBucket = Number(longitude.toFixed(2));
    const key = `${latBucket},${lonBucket}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        latitude: latBucket,
        longitude: lonBucket,
        reports: [],
      });
    }

    grouped.get(key).reports.push(report);
  });

  return Array.from(grouped.values());
};

export default function MapView({ reports = [] }) {
  const { refetchReports, reportsLoading } = useReport();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const focusMarkerRef = useRef(null);
  const complaintLayerRef = useRef(null);
  const [city, setCity] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [areaSummary, setAreaSummary] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [searchedArea, setSearchedArea] = useState(null);

  const complaints = useMemo(
    () =>
      reports
        .map((report) => {
          const latitude = Number(report?.coordinates?.latitude ?? report?.latitude ?? report?.lat);
          const longitude = Number(report?.coordinates?.longitude ?? report?.longitude ?? report?.lon ?? report?.lng);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return {
            ...report,
            priority: report?.priority || "Medium",
            coordinates: {
              latitude,
              longitude,
            },
          };
        })
        .filter(Boolean),
    [reports]
  );

  const drawComplaintMarkers = (center = null) => {
    if (!leafletMap.current || !complaintLayerRef.current) {
      return;
    }

    complaintLayerRef.current.clearLayers();

    const filteredByPriority = complaints.filter((report) =>
      selectedPriority === "All" ? true : report.priority === selectedPriority
    );

    const scopedReports = center
      ? filteredByPriority.filter((report) =>
          distanceInKm(
            center,
            {
              latitude: report.coordinates.latitude,
              longitude: report.coordinates.longitude,
            }
          ) <= SEARCH_RADIUS_KM
        )
      : filteredByPriority;

    const markerColorOverride = selectedPriority === "All" ? null : getPriorityColor(selectedPriority);

    if (center) {
      const areaCount = scopedReports.length;
      const areaColor = markerColorOverride || getDensityColor(areaCount);
      const areaDensityLabel = getDensityLabel(areaCount);

      if (focusMarkerRef.current) {
        focusMarkerRef.current.setIcon(createPulseIcon(areaColor));
        focusMarkerRef.current.bindPopup(
          `<div style="min-width:220px; color:#0f172a; font-family:Arial,sans-serif;">
            <strong>${center.label || "Searched area"}</strong><br />
            <span>Complaints in ${SEARCH_RADIUS_KM} km: ${areaCount}</span><br />
            <span>${selectedPriority === "All" ? `Density: ${areaDensityLabel}` : `Priority: ${selectedPriority}`}</span><br />
            <span>Marker color: ${areaColor === "#ef4444" ? "Red" : areaColor === "#facc15" ? "Yellow" : "Blue"}</span>
          </div>`
        );
      } else {
        focusMarkerRef.current = L.marker([center.latitude, center.longitude], {
          icon: createPulseIcon(areaColor),
        })
          .addTo(leafletMap.current)
          .bindPopup(
            `<div style="min-width:220px; color:#0f172a; font-family:Arial,sans-serif;">
              <strong>${center.label || "Searched area"}</strong><br />
              <span>Complaints in ${SEARCH_RADIUS_KM} km: ${areaCount}</span><br />
              <span>${selectedPriority === "All" ? `Density: ${areaDensityLabel}` : `Priority: ${selectedPriority}`}</span>
            </div>`
          );
      }

      setAreaSummary(
        selectedPriority === "All"
          ? `Searched area complaints: ${areaCount} within ${SEARCH_RADIUS_KM} km. Marker density is ${areaDensityLabel.toLowerCase()}.`
          : `Searched area complaints: ${areaCount} within ${SEARCH_RADIUS_KM} km for ${selectedPriority.toLowerCase()} priority.`
      );
    }

    const groupedReports = groupReportsByArea(scopedReports);

    groupedReports.forEach((group) => {
      const count = group.reports.length;
      const color = markerColorOverride || getDensityColor(count);

      L.marker([group.latitude, group.longitude], {
        icon: createDensityIcon(color),
      })
        .addTo(complaintLayerRef.current)
        .bindPopup(
          `<div style="min-width:220px; color:#0f172a; font-family:Arial,sans-serif;">
            <strong>Area complaints: ${count}</strong><br />
            <span>Priority filter: ${selectedPriority}</span><br />
            <span>${selectedPriority === "All" ? "High density: Red, Medium: Yellow, Low (&lt;8): Blue" : "Priority colors: High Red, Medium Yellow, Low Blue"}</span>
          </div>`
        );
    });

    if (!center) {
      setAreaSummary(`Showing ${scopedReports.length} complaints across all mapped areas.`);
    }
  };

  const getLocationDetails = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.hamlet || "Unknown city",
      state: address.state || "Unknown state",
      area:
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.county ||
        "Unknown area",
      displayName: data.display_name || "Live location",
    };
  };

  useEffect(() => {
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.6139, 77.2090], 6);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(leafletMap.current);

    complaintLayerRef.current = L.layerGroup().addTo(leafletMap.current);

    return () => leafletMap.current.remove();
  }, []);

  useEffect(() => {
    drawComplaintMarkers(searchedArea);
  }, [complaints, searchedArea, selectedPriority]);

  const searchCity = async () => {
    if (!city) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
    );
    const data = await response.json();

    if (data.length === 0) {
      alert("City not found");
      return;
    }

    const { lat, lon, display_name } = data[0];
    const latitude = Number(lat);
    const longitude = Number(lon);

    // Smooth fly animation
    leafletMap.current.flyTo([latitude, longitude], 13, {
      duration: 2,
    });

    // Remove old marker
    if (focusMarkerRef.current) {
      leafletMap.current.removeLayer(focusMarkerRef.current);
    }

    focusMarkerRef.current = L.marker([latitude, longitude], { icon: createPulseIcon("#22c55e") })
      .addTo(leafletMap.current)
      .bindPopup(`<b>${display_name}</b>`)
      .openPopup();

    setSearchedArea({ latitude, longitude, label: display_name });
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }

    setLocationStatus("Fetching your live location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationDetails = await getLocationDetails(latitude, longitude);

        leafletMap.current.flyTo([latitude, longitude], 15, {
          duration: 2,
        });

        if (focusMarkerRef.current) {
          leafletMap.current.removeLayer(focusMarkerRef.current);
        }

        focusMarkerRef.current = L.marker([latitude, longitude], { icon: createPulseIcon("#3b82f6") })
          .addTo(leafletMap.current)
          .bindPopup(`
            <div>
              <b>${locationDetails.displayName}</b><br />
              City: ${locationDetails.city}<br />
              State: ${locationDetails.state}<br />
              Area: ${locationDetails.area}<br />
              Latitude: ${latitude.toFixed(5)}<br />
              Longitude: ${longitude.toFixed(5)}
            </div>
          `)
          .openPopup();

        setSearchedArea({ latitude, longitude, label: locationDetails.displayName });

        setLocationStatus(
          `City: ${locationDetails.city} | State: ${locationDetails.state} | Area: ${locationDetails.area} | Latitude: ${latitude.toFixed(5)} | Longitude: ${longitude.toFixed(5)}`
        );
      },
      () => {
        setLocationStatus(
          "Unable to access your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-4">

      {/* Premium Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={searchCity}
          className="rounded-xl bg-linear-to-r from-green-600 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 sm:w-auto"
        >
          Search
        </button>
        <button
          onClick={getLiveLocation}
          className="rounded-xl bg-linear-to-r from-sky-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 sm:w-auto"
        >
          Use Live Location
        </button>
        <select
          value={selectedPriority}
          onChange={(event) => setSelectedPriority(event.target.value)}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none backdrop-blur-md focus:ring-2 focus:ring-yellow-400 sm:w-auto"
        >
          <option value="All" className="text-slate-900">All priorities</option>
          <option value="High" className="text-slate-900">High priority</option>
          <option value="Medium" className="text-slate-900">Medium priority</option>
          <option value="Low" className="text-slate-900">Low priority</option>
        </select>
        <button
          onClick={refetchReports}
          disabled={reportsLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 sm:w-auto"
        >
          <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
          {reportsLoading ? "Reloading..." : "Reload"}
        </button>
      </div>

      {locationStatus && (
        <p className="text-sm text-gray-300">{locationStatus}</p>
      )}
      {areaSummary && (
        <p className="text-sm text-slate-300">{areaSummary}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />High density</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" />Medium density</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Low density (&lt; 8)</span>
      </div>

      {/* Premium Map Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
        <div ref={mapRef} className="w-full" style={{ height: "clamp(20rem, 45vw, 31.25rem)" }}></div>

        {/* Cinematic Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/20 via-transparent to-black/60"></div>
      </div>
    </div>
  );
}