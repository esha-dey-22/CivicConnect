"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [22.9734, 78.6569];
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

const groupReportsByArea = (reports) => {
  const grouped = new Map();

  reports.forEach((report) => {
    const latitude = Number(report.latitude);
    const longitude = Number(report.longitude);

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

export default function AdminMapView({ reports = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const focusMarkerRef = useRef(null);
  const [city, setCity] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [searchedArea, setSearchedArea] = useState(null);
  const [areaSummary, setAreaSummary] = useState("");

  const markers = useMemo(
    () =>
      reports
        .filter((report) => report.coordinates?.latitude && report.coordinates?.longitude)
        .map((report) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          location: report.location,
          status: report.status,
          priority: report.priority || "Medium",
          category: report.category,
          latitude: report.coordinates.latitude,
          longitude: report.coordinates.longitude,
        })),
    [reports]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return undefined;
    }

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(DEFAULT_CENTER, 5);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerRef.current) {
      return;
    }

    markerLayerRef.current.clearLayers();

    const priorityFiltered = markers.filter((marker) =>
      selectedPriority === "All" ? true : marker.priority === selectedPriority
    );

    const scopedMarkers = searchedArea
      ? priorityFiltered.filter((marker) =>
          distanceInKm(
            searchedArea,
            {
              latitude: marker.latitude,
              longitude: marker.longitude,
            }
          ) <= SEARCH_RADIUS_KM
        )
      : priorityFiltered;

    const markerColorOverride = selectedPriority === "All" ? null : getPriorityColor(selectedPriority);

    if (searchedArea) {
      const areaCount = scopedMarkers.length;
      const areaColor = markerColorOverride || getDensityColor(areaCount);
      const areaDensityLabel = getDensityLabel(areaCount);

      if (focusMarkerRef.current) {
        focusMarkerRef.current.setIcon(createFocusIcon(areaColor));
        focusMarkerRef.current.bindPopup(
          `<div style="min-width: 220px; color: #0f172a; font-family: Arial, sans-serif;">
            <strong>Searched area complaints: ${areaCount}</strong><br />
            <span>Radius: ${SEARCH_RADIUS_KM} km</span><br />
            <span>${selectedPriority === "All" ? `Density: ${areaDensityLabel}` : `Priority: ${selectedPriority}`}</span><br />
            <span>Marker color: ${areaColor === "#ef4444" ? "Red" : areaColor === "#facc15" ? "Yellow" : "Blue"}</span>
          </div>`
        );
      }

      setAreaSummary(
        selectedPriority === "All"
          ? `Searched area complaints: ${areaCount} within ${SEARCH_RADIUS_KM} km. Marker density is ${areaDensityLabel.toLowerCase()}.`
          : `Searched area complaints: ${areaCount} within ${SEARCH_RADIUS_KM} km for ${selectedPriority.toLowerCase()} priority.`
      );

      if (areaCount === 0) {
        markerLayerRef.current.clearLayers();
      }

      return;
    }

    const groupedMarkers = groupReportsByArea(scopedMarkers);

    setAreaSummary(`Showing ${scopedMarkers.length} complaints across all mapped areas.`);

    if (groupedMarkers.length === 0) {
      mapInstanceRef.current.setView(DEFAULT_CENTER, 5);
      return;
    }

    const bounds = [];

    groupedMarkers.forEach((group, index) => {
      const count = group.reports.length;
      const markerColor = markerColorOverride || getDensityColor(count);
      const priorityMix = [...new Set(group.reports.map((item) => item.priority))].join(", ");

      const leafletMarker = L.marker([group.latitude, group.longitude], {
        icon: createMarkerIcon(markerColor),
      })
        .bindPopup(
          `<div style="min-width: 200px; color: #0f172a; font-family: Arial, sans-serif;">
            <strong>${index + 1}. Area complaints: ${count}</strong><br />
            <span>${selectedPriority === "All" ? "Density scale: Red high, Yellow medium, Blue low (&lt;8)" : "Priority colors: High Red, Medium Yellow, Low Blue"}</span><br />
            <span>Priority mix: ${priorityMix || "Medium"}</span>
          </div>`
        )
        .addTo(markerLayerRef.current);

      bounds.push([group.latitude, group.longitude]);
      return leafletMarker;
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, searchedArea, selectedPriority]);

  const searchArea = async () => {
    if (!city || !mapInstanceRef.current) {
      return;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    ).catch(() => null);

    if (!response?.ok) {
      return;
    }

    const payload = await response.json().catch(() => []);

    if (!Array.isArray(payload) || payload.length === 0) {
      return;
    }

    const result = payload[0];
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.8 });

    if (focusMarkerRef.current) {
      mapInstanceRef.current.removeLayer(focusMarkerRef.current);
    }

    focusMarkerRef.current = L.marker([latitude, longitude], {
      icon: createFocusIcon("#22c55e"),
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<b>${result.display_name}</b>`)
      .openPopup();

    setSearchedArea({ latitude, longitude });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Search city or area..."
          className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition focus:border-sky-400/50"
        />
        <select
          value={selectedPriority}
          onChange={(event) => setSelectedPriority(event.target.value)}
          className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition focus:border-sky-400/50"
        >
          <option value="All">All priorities</option>
          <option value="High">High priority</option>
          <option value="Medium">Medium priority</option>
          <option value="Low">Low priority</option>
        </select>
        <button
          type="button"
          onClick={searchArea}
          className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Search
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Active markers", value: markers.length },
          { label: "Map coverage", value: reports.length ? "Live" : "Empty" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--admin-muted)]">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">{item.value}</p>
          </div>
        ))}
      </div>

      {areaSummary ? <p className="text-sm text-[var(--admin-muted)]">{areaSummary}</p> : null}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--admin-muted)]">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />High density</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" />Medium density</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Low density (&lt; 8)</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] shadow-2xl shadow-black/10">
        <div ref={mapRef} className="h-[560px] w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {markers.slice(0, 6).map((marker) => (
          <div key={marker.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--admin-text)]">{marker.title}</p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">{marker.location}</p>
            <p className="mt-2 text-xs text-[var(--admin-muted)]">{marker.status} · {marker.category || "General"} · {marker.priority}</p>
          </div>
        ))}
      </div>
    </div>
  );
}