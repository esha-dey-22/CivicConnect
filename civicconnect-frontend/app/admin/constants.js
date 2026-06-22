import { LayoutDashboard, FileWarning, Map, BarChart3, Bell, Settings } from "lucide-react";

export const ADMIN_EMAILS = [
  "admin@civicconnect.gov",
  "ops@civicconnect.gov",
  "commissioner@civicconnect.gov",
];

export const ADMIN_MENU = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Complaints", path: "/admin/issues", icon: FileWarning },
  { name: "Map Monitoring", path: "/admin/map", icon: Map },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Notifications", path: "/admin/notifications", icon: Bell },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export const STATUS_FLOW = ["Pending", "Under Process", "Resolved"];