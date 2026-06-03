import React from "react";
import { RefreshCw, User, HelpCircle, Bell } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  currentUserEmail: string;
  setCurrentUserEmail: (email: string) => void;
  onRefresh: () => void;
  forceStandby: boolean;
  setForceStandby: (val: boolean) => void;
}

export default function Navbar({
  currentTab,
  selectedDept,
  setSelectedDept,
  userRole,
  setUserRole,
  currentUserEmail,
  setCurrentUserEmail,
  onRefresh,
  forceStandby,
  setForceStandby
}: NavbarProps) {
  const getTabTitle = () => {
    switch (currentTab) {
      case "dashboard":
        return "Accreditation Dashboard & Readiness Hub";
      case "copo":
        return "Course Outcomes to Program Outcomes Matrix (CO-PO)";
      case "attainment":
        return "Direct & Indirect Attainment Assessment Calculator";
      case "sar":
        return "NBA Self-Assessment Report (SAR) compiler";
      case "chat":
        return "NBA Specialization AI Agents Workspace";
      case "settings":
        return "Platform Configurations & Scoring Parameters";
      default:
        return "NBA Enterprise Platform";
    }
  };

  const roles = [
    { value: "SaaS Administrator", label: "Admin" },
    { value: "Accreditation Coordinator", label: "Coordinator" },
    { value: "Senior Head of Department", label: "HOD" },
    { value: "Course Instructor (Faculty)", label: "Faculty" }
  ];

  return (
    <header id="header-navbar" className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Title block */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold font-sans text-gray-900 tracking-tight">
          {getTabTitle()}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span>Active Session:</span>
          <span className="text-emerald-600 font-mono">2025-26</span>
          <span className="text-gray-300">•</span>
          <span>Scope:</span>
          <span className="text-slate-700 font-mono">Tier-1 Undergraduate</span>
        </div>
      </div>

      {/* Control Actions & User Roles Profile */}
      <div className="flex items-center gap-4">
        {/* Department select */}
        <div id="dept-filter" className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Dept:</span>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 outline-none rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <option value="Computer Science">Computer Science & Eng</option>
            <option value="Electronics">Electronics & Comm</option>
            <option value="Information Tech">Information Technology</option>
          </select>
        </div>

        {/* Role toggle for testing RBAC */}
        <div id="role-selector" className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
          <span className="text-xs text-gray-500 font-medium">Role:</span>
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 outline-none rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
            ))}
          </select>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
          <button 
            onClick={onRefresh}
            title="Refresh Accreditation Rules metrics"
            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          
          <button 
            title="System alerts"
            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-colors relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-[3px] right-[3px] w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* API Engine Selector */}
        <div id="api-engine-selector" className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
          <button
            onClick={() => setForceStandby(!forceStandby)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              forceStandby 
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80"
            }`}
            title={forceStandby ? "Click to connect Live Gemini API" : "Click to use Offline Stand-by Simulator"}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${forceStandby ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`}></span>
            {forceStandby ? "Standby Mock" : "Live Gemini AI"}
          </button>
        </div>

        {/* Active Profile ID */}
        <div className="flex items-center gap-2.5 border-l border-gray-200 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider">TESTER PROFILE</span>
            <select
              value={currentUserEmail}
              onChange={(e) => {
                setCurrentUserEmail(e.target.value);
                // Sync user role based on email selection for a flawless simulation
                if (e.target.value === "sabarni.guha15@gmail.com") {
                  setUserRole("Accreditation Coordinator");
                } else if (e.target.value === "guest.reviewer@nba-india.org") {
                  setUserRole("SaaS Administrator");
                } else {
                  setUserRole("Course Instructor (Faculty)");
                }
              }}
              className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 outline-none cursor-pointer"
            >
              <option value="sabarni.guha15@gmail.com">sabarni.guha15@gmail.com [LIVE API]</option>
              <option value="guest.reviewer@nba-india.org">guest.reviewer@nba-india.org [MOCK ENGINE]</option>
              <option value="faculty.member@university.edu">faculty.member@university.edu [MOCK ENGINE]</option>
            </select>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {currentUserEmail === "sabarni.guha15@gmail.com" ? "SG" : currentUserEmail.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
