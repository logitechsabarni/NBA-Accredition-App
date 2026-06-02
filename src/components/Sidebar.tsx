import React from "react";
import { 
  LayoutDashboard, 
  Network, 
  Calculator, 
  FileText, 
  MessageSquare, 
  Settings as SettingsIcon,
  Sparkles,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  nbaScore: number;
}

export default function Sidebar({ currentTab, setCurrentTab, nbaScore }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "Live" },
    { id: "copo", label: "CO-PO Mapping", icon: Network, badge: null },
    { id: "attainment", label: "Attainment", icon: Calculator, badge: null },
    { id: "sar", label: "SAR Report Builder", icon: FileText, badge: "772/1000" },
    { id: "chat", label: "AI Agents Hub", icon: MessageSquare, badge: "AI Assistant", highlight: true },
    { id: "settings", label: "System Settings", icon: SettingsIcon, badge: null }
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-white border-r border-gray-250 text-gray-800 flex flex-col h-screen select-none shrink-0 transition-all duration-300">
      {/* Platform Branding */}
      <div className="p-5 border-b border-gray-200 flex flex-col gap-1 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            N
          </div>
          <span className="font-sans font-bold tracking-tight text-gray-900 text-base">NBA Enterprise</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-450 font-mono pl-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
          <span>TIER-1 AUDIT MODE</span>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group duration-150 relative ${
                isActive
                  ? "bg-gray-150/60 text-indigo-600 border-r-3 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-transform duration-150 ${
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                }`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  item.highlight
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* College Info Card */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50 m-3 rounded-xl border border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-xs font-black text-indigo-700 font-mono shadow-3xs">
            C-1
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-900 truncate">VRS Eng College</h4>
            <span className="text-[10px] text-gray-400 font-mono">NBA ACCESS LEVEL</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <span>Overall Readiness</span>
          <span className="font-mono font-bold text-gray-900">{nbaScore}%</span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${nbaScore}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
}
