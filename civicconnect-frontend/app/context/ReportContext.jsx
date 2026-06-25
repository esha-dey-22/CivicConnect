"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ReportContext = createContext();
const REPORTS_STORAGE_KEY = "civicconnect_reports";

const REPORT_STATUSES = ["Filed", "Pending", "Under Process", "Resolved"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const CITY_POOLS = [
  { name: "New Delhi", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
];

const STATUS_NORMALIZATION_MAP = {
  filed: "Filed",
  pending: "Pending",
  "under process": "Under Process",
  resolved: "Resolved",
};

const PRIORITY_NORMALIZATION_MAP = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const hashText = (value = "") => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const createCoordinates = (seedText, index) => {
  const seed = hashText(`${seedText}-${index}`);
  const base = CITY_POOLS[seed % CITY_POOLS.length];

  const latitudeOffset = ((seed >> 3) % 1000) / 1000 - 0.5;
  const longitudeOffset = ((seed >> 6) % 1000) / 1000 - 0.5;

  return {
    city: base.name,
    latitude: Number((base.latitude + latitudeOffset * 0.35).toFixed(6)),
    longitude: Number((base.longitude + longitudeOffset * 0.35).toFixed(6)),
  };
};

const normalizeStatus = (status) => {
  if (!status || typeof status !== "string") {
    return REPORT_STATUSES[0];
  }

  const normalized = STATUS_NORMALIZATION_MAP[status.trim().toLowerCase()];
  return normalized || REPORT_STATUSES[0];
};

const normalizePriority = (priority) => {
  if (!priority || typeof priority !== "string") {
    return "Medium";
  }

  const normalized = PRIORITY_NORMALIZATION_MAP[priority.trim().toLowerCase()];
  return normalized || "Medium";
};

const normalizeReport = (report, fallbackIndex = 0) => {
  const complaintId = report?._id || report?.id || `${Date.now()}-${fallbackIndex}`;
  const parsedLatitude = Number(report?.coordinates?.latitude ?? report?.latitude ?? report?.lat);
  const parsedLongitude = Number(report?.coordinates?.longitude ?? report?.longitude ?? report?.lng ?? report?.lon);

  const coordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude) && (parsedLatitude !== 0 || parsedLongitude !== 0)
      ? {
          city: report?.location || "Live location",
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        }
      : null;

  return {
    ...report,
    id: String(complaintId),
    status: normalizeStatus(report?.status),
    priority: normalizePriority(report?.priority),
    location: report?.location || coordinates?.city || "Unknown Location",
    language: report?.language || "en",
    voiceTranscript: report?.voiceTranscript || "",
    coordinates,
    createdAt: report?.createdAt || new Date().toISOString(),
  };
};

const prioritizeReports = (baseReports) => {
  const neighborhoodCategoryCounts = {};
  const totalComplaints = baseReports.length;

  // Dynamic threshold scaling:
  // Base thresholds: Medium = 2, High = 5.
  // Reference database size is 20 complaints. As the database grows beyond 20,
  // we scale the thresholds using a sub-linear square root multiplier to avoid too fast growth.
  const multiplier = totalComplaints > 20 ? Math.sqrt(totalComplaints / 20) : 1;
  const mediumThreshold = Math.max(2, Math.ceil(2 * multiplier));
  const highThreshold = Math.max(5, Math.ceil(5 * multiplier));

  console.log(
    `[Priority Engine] Total complaints: ${totalComplaints}. Dynamic thresholds -> Medium: >=${mediumThreshold}, High: >=${highThreshold}`
  );

  baseReports.forEach((report) => {
    if (report.coordinates) {
      const latBucket = report.coordinates.latitude.toFixed(2);
      const lonBucket = report.coordinates.longitude.toFixed(2);
      const category = (report.category || "General").trim().toLowerCase();
      const key = `${latBucket},${lonBucket}:${category}`;
      neighborhoodCategoryCounts[key] = (neighborhoodCategoryCounts[key] || 0) + 1;
    }
  });

  return baseReports.map((report) => {
    let priority = "Low";
    if (report.coordinates) {
      const latBucket = report.coordinates.latitude.toFixed(2);
      const lonBucket = report.coordinates.longitude.toFixed(2);
      const category = (report.category || "General").trim().toLowerCase();
      const key = `${latBucket},${lonBucket}:${category}`;
      const count = neighborhoodCategoryCounts[key] || 0;

      if (count >= highThreshold) {
        priority = "High";
      } else if (count >= mediumThreshold) {
        priority = "Medium";
      }
    } else {
      priority = "Medium";
    }

    return {
      ...report,
      priority,
    };
  });
};

const readStoredReports = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(REPORTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredReports = (reports) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
};

export const ReportProvider = ({ children }) => {

  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError("");

    try {
      const response = await fetch("/api/issues");
      const rawReports = await response.json();
      const baseReports = rawReports.map((report, index) => normalizeReport(report, index));
      const normalized = prioritizeReports(baseReports);

      setReports(normalized);
    } catch (error) {
      setReportsError(
        error?.message || "Unable to load complaints from backend."
      );
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchNotifications();
  }, [fetchReports, fetchNotifications]);

  const addReport = useCallback(async (report) => {
    try {
      const formData = new FormData();
      formData.append("title", report.title || "");
      formData.append("description", report.description || "");
      formData.append("location", report.location || "");
      formData.append("category", report.category || "");
      formData.append("reporterEmail", report.reporterEmail || "");
      
      const parsedLatitude = Number(report?.coordinates?.latitude ?? report?.latitude);
      const parsedLongitude = Number(report?.coordinates?.longitude ?? report?.longitude);
      if (Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)) {
        formData.append("coordinates", JSON.stringify({ latitude: parsedLatitude, longitude: parsedLongitude }));
      }

      if (report.file) {
        formData.append("image", report.file);
      }

      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      await fetchReports();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || "Complaint submission failed.",
      };
    }
  }, [fetchReports]);

  const updateReportStatus = useCallback(async (id, nextStatus) => {
    if (!REPORT_STATUSES.includes(nextStatus)) {
      return { success: false, error: "Invalid status." };
    }

    try {
      const response = await fetch(`/api/admin/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Server error");
      }

      await fetchReports();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || "Unable to update complaint status.",
      };
    }
  }, [fetchReports]);

  const sendNotification = async (message, recipientEmail = "") => {
    const trimmedMessage = message.trim();
    const normalizedRecipientEmail = recipientEmail.trim().toLowerCase();

    if (!trimmedMessage) {
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmedMessage,
          recipientEmail: normalizedRecipientEmail
        })
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        notifications,
        reportsLoading,
        reportsError,
        addReport,
        updateReportStatus,
        sendNotification,
        refetchReports: fetchReports,
        reportStatuses: REPORT_STATUSES,
        priorityOptions: PRIORITY_OPTIONS,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);