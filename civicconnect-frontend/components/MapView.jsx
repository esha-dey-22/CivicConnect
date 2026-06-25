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

const createMarkerIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="h-4 w-4 rounded-full" style="background:${color};"></div>
        <div class="absolute h-8 w-8 rounded-full animate-ping" style="background:${color}; opacity:0.2;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createFocusIcon = (color = "#22c55e") =>
  L.divIcon({
    className: "",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="h-4 w-4 rounded-full" style="background:${color};"></div>
        <div class="absolute h-8 w-8 rounded-full animate-ping" style="background:${color}; opacity:0.25;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

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
        focusMarkerRef.current.setIcon(createFocusIcon(areaColor));
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
          icon: createFocusIcon(areaColor),
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

    const bounds = [];

    scopedReports.forEach((report) => {
      const color = getPriorityColor(report.priority);

      L.marker([report.coordinates.latitude, report.coordinates.longitude], {
        icon: createMarkerIcon(color),
      })
        .addTo(complaintLayerRef.current)
        .bindPopup(
          `<div style="min-width:200px; color:#0f172a; font-family:Arial,sans-serif;">
            <strong style="font-size: 14px;">${report.title || "Complaint"}</strong><br />
            <span style="font-size: 12px; font-weight: bold; color: ${color};">Priority: ${report.priority || "Medium"}</span><br />
            <span style="font-size: 12px; font-weight: 500;">Status: ${report.status || "Filed"}</span><br />
            <span style="font-size: 12px;">Category: ${report.category || "General"}</span><br />
            <span style="font-size: 12px;">Location: ${report.location || "Unknown"}</span><br />
            <span style="font-size: 11px; color:#64748b;">${report.createdAt ? new Date(report.createdAt).toLocaleString() : ""}</span>
          </div>`
        );

      bounds.push([report.coordinates.latitude, report.coordinates.longitude]);
    });

    if (bounds.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [40, 40] });
    }

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

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
      complaintLayerRef.current = null;
    };
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

    focusMarkerRef.current = L.marker([latitude, longitude], { icon: createFocusIcon("#22c55e") })
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

        focusMarkerRef.current = L.marker([latitude, longitude], { icon: createFocusIcon("#3b82f6") })
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
    <div className="space-y-6">

      {/* Premium Search Bar */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <select
          value={selectedPriority}
          onChange={(event) => setSelectedPriority(event.target.value)}
          className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none backdrop-blur-md focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="All" className="text-slate-900">All priorities</option>
          <option value="High" className="text-slate-900">High priority</option>
          <option value="Medium" className="text-slate-900">Medium priority</option>
          <option value="Low" className="text-slate-900">Low priority</option>
        </select>
        <button
          onClick={searchCity}
          className="rounded-2xl bg-linear-to-r from-cyan-600 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-105"
        >
          Search
        </button>
        <button
          onClick={getLiveLocation}
          className="rounded-2xl bg-linear-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-105"
        >
          Use Live Location
        </button>
        <button
          onClick={refetchReports}
          disabled={reportsLoading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
          {reportsLoading ? "Reloading..." : "Reload"}
        </button>
      </div>

      {locationStatus && (
        <p className="text-sm text-cyan-300/80 bg-cyan-950/20 border border-cyan-500/10 px-4 py-2.5 rounded-xl">{locationStatus}</p>
      )}
      {areaSummary && (
        <p className="text-sm text-slate-300 bg-slate-900/40 border border-white/5 px-4 py-2.5 rounded-xl">{areaSummary}</p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-white/2 border border-white/5 px-4 py-3 rounded-2xl">
        <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px] mr-2">Legend:</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />High priority</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" />Medium priority</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Low priority</span>
      </div>

      {/* Premium Map Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
        <div ref={mapRef} className="w-full" style={{ height: "500px" }}></div>

        {/* Cinematic Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/20 via-transparent to-black/60"></div>
      </div>

      {/* Mapped Complaints Info Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Recently Mapped Complaints</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {complaints.slice(0, 6).map((report) => (
            <div key={report.id} className="rounded-2xl border border-white/10 bg-white/2 p-4 transition duration-300 hover:border-cyan-500/30 hover:bg-white/5">
              <p className="text-sm font-semibold text-white truncate">{report.title}</p>
              <p className="mt-1 text-xs text-slate-400 truncate">{report.location}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">{report.category || "General"}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 ${
                  report.priority === "High" ? "text-red-400" : report.priority === "Medium" ? "text-yellow-400" : "text-blue-400"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    report.priority === "High" ? "bg-red-500" : report.priority === "Medium" ? "bg-yellow-400" : "bg-blue-500"
                  }`} />
                  {report.priority}
                </span>
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-slate-500">
              No active complaints to show on the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}