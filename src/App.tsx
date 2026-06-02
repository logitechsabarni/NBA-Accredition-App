import React, { useState, useEffect, useRef } from "react";
import { 
  SAMPLE_COURSES, 
  NBA_PO_LIST, 
  INITIAL_ASSESSMENT_METHODS, 
  INITIAL_CRITERIA_LIST, 
  INITIAL_AUDIT_LOGS 
} from "./data/mockData";
import { Course, CourseOutcome, COPOMapping, AssessmentMethod, SARCriterion, Message, AuditLog } from "./types";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Network, 
  Calculator, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Brain, 
  ArrowRight, 
  TrendingUp, 
  Info,
  Send,
  HelpCircle,
  FileWarning,
  Activity,
  User,
  ExternalLink,
  Sliders,
  Settings as SettingsIcon,
  Search,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // Current active tab
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  
  // User/system state
  const [selectedDept, setSelectedDept] = useState<string>("Computer Science");
  const [userRole, setUserRole] = useState<string>("Accreditation Coordinator");

  // App-level state backing calculations
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("cs302"); // default DBMS
  const [assessmentMethods, setAssessmentMethods] = useState<AssessmentMethod[]>(INITIAL_ASSESSMENT_METHODS);
  
  const [criteriaMap, setCriteriaMap] = useState<{ [dept: string]: SARCriterion[] }>({
    "Computer Science": INITIAL_CRITERIA_LIST,
    "Electronics": INITIAL_CRITERIA_LIST.map(c => {
      let status = c.status;
      let allottedPoints = c.allottedPoints;
      if (c.id === "C1") { status = "in_progress"; allottedPoints = 88; }
      else if (c.id === "C2") { status = "in_progress"; allottedPoints = 55; }
      else if (c.id === "C3") { status = "completed"; allottedPoints = 92; }
      else if (c.id === "C4") { status = "under_review"; allottedPoints = 98; }
      else if (c.id === "C5") { status = "completed"; allottedPoints = 140; }
      else if (c.id === "C6") { status = "under_review"; allottedPoints = 55; }
      else if (c.id === "C7") { status = "in_progress"; allottedPoints = 30; }
      else if (c.id === "C8") { status = "in_progress"; allottedPoints = 32; }
      else if (c.id === "C9") { allottedPoints = 44; }
      else if (c.id === "C10") { status = "completed"; allottedPoints = 90; }
      return { ...c, status, allottedPoints };
    }),
    "Information Tech": INITIAL_CRITERIA_LIST.map(c => {
      let status = c.status;
      let allottedPoints = c.allottedPoints;
      if (c.id === "C1") { status = "completed"; allottedPoints = 98; }
      else if (c.id === "C2") { status = "completed"; allottedPoints = 85; }
      else if (c.id === "C3") { status = "in_progress"; allottedPoints = 82; }
      else if (c.id === "C4") { status = "completed"; allottedPoints = 125; }
      else if (c.id === "C5") { status = "completed"; allottedPoints = 152; }
      else if (c.id === "C6") { status = "completed"; allottedPoints = 65; }
      else if (c.id === "C7") { status = "completed"; allottedPoints = 42; }
      else if (c.id === "C8") { status = "completed"; allottedPoints = 40; }
      else if (c.id === "C9") { status = "completed"; allottedPoints = 43; }
      else if (c.id === "C10") { status = "in_progress"; allottedPoints = 95; }
      return { ...c, status, allottedPoints };
    })
  });

  const criteria = criteriaMap[selectedDept] || criteriaMap["Computer Science"] || INITIAL_CRITERIA_LIST;

  const setCriteria = (updateFn: SARCriterion[] | ((prev: SARCriterion[]) => SARCriterion[])) => {
    setCriteriaMap(prevMap => {
      const currentList = prevMap[selectedDept] || prevMap["Computer Science"] || INITIAL_CRITERIA_LIST;
      const nextList = typeof updateFn === "function" ? updateFn(currentList) : updateFn;
      return {
        ...prevMap,
        [selectedDept]: nextList
      };
    });
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // Filter courses by department selected in navigation bar
  const filteredCourses = courses.filter(c => c.department === selectedDept);
  
  // Active course reference (prefer matching selectedCourseId, fallback to first in filtered list)
  const currentCourse = filteredCourses.find(c => c.id === selectedCourseId) || filteredCourses[0] || courses[0];

  // Global thresholds configured in "Settings"
  const [targetWeightDirect, setTargetWeightDirect] = useState<number>(80); // Direct weight vs Indirect weight
  const [globalThresholdScore, setGlobalThresholdScore] = useState<number>(50); // percentage mark target
  const [correlationMappingScale, setCorrelationMappingScale] = useState<number>(3); // Max logic 3 (Low 1, Mid 2, High 3)

  // Mapping edit helpers
  const [hoveredCell, setHoveredCell] = useState<{coId: string, poId: string} | null>(null);
  const [rationaleEditor, setRationaleEditor] = useState<{coId: string, poId: string, value: number, rationale: string} | null>(null);

  // New custom CO Form
  const [newCoText, setNewCoText] = useState("");
  const [newCoBlooms, setNewCoBlooms] = useState("Apply (K3)");
  const [isGeneratingCOs, setIsGeneratingCOs] = useState(false);
  const [isSuggestingMappings, setIsSuggestingMappings] = useState(false);

  // Assessment student scores input
  // Store % of students passing each CO per assessment.
  // We initialize structure with reasonable default scores.
  const [studentPerformanceScores, setStudentPerformanceScores] = useState<{
    [courseId: string]: {
      [assessmentId: string]: {
        [coId: string]: number // percentage (e.g. 72%)
      }
    }
  }>({
    "cs301": {
      "test1": { "CO1": 75, "CO2": 68, "CO3": 58, "CO4": 70, "CO5": 54, "CO6": 62 },
      "test2": { "CO1": 82, "CO2": 71, "CO3": 69, "CO4": 61, "CO5": 48, "CO6": 55 },
      "endsem": { "CO1": 66, "CO2": 59, "CO3": 62, "CO4": 57, "CO5": 50, "CO6": 51 },
      "assignments": { "CO1": 90, "CO2": 88, "CO3": 85, "CO4": 80, "CO5": 78, "CO6": 82 },
      "exitsurvey": { "CO1": 85, "CO2": 82, "CO3": 80, "CO4": 82, "CO5": 75, "CO6": 80 }
    },
    "cs302": {
      "test1": { "CO1": 80, "CO2": 72, "CO3": 48, "CO4": 85, "CO5": 52, "CO6": 64 },
      "test2": { "CO1": 78, "CO2": 68, "CO3": 55, "CO4": 82, "CO5": 50, "CO6": 70 },
      "endsem": { "CO1": 70, "CO2": 64, "CO3": 51, "CO4": 75, "CO5": 47, "CO6": 58 },
      "assignments": { "CO1": 92, "CO2": 85, "CO3": 78, "CO4": 90, "CO5": 80, "CO6": 82 },
      "exitsurvey": { "CO1": 88, "CO2": 80, "CO3": 75, "CO4": 84, "CO5": 78, "CO6": 80 }
    },
    "cs303": {
      "test1": { "CO1": 64, "CO2": 82, "CO3": 75, "CO4": 52 },
      "test2": { "CO1": 72, "CO2": 80, "CO3": 70, "CO4": 49 },
      "endsem": { "CO1": 58, "CO2": 69, "CO3": 65, "CO4": 50 },
      "assignments": { "CO1": 85, "CO2": 90, "CO3": 88, "CO4": 75 },
      "exitsurvey": { "CO1": 80, "CO2": 85, "CO3": 84, "CO4": 72 }
    },
    "ec301": {
      "test1": { "CO1": 72, "CO2": 66, "CO3": 32, "CO4": 64 },
      "test2": { "CO1": 78, "CO2": 72, "CO3": 38, "CO4": 60 },
      "endsem": { "CO1": 65, "CO2": 60, "CO3": 28, "CO4": 56 },
      "assignments": { "CO1": 88, "CO2": 82, "CO3": 45, "CO4": 76 },
      "exitsurvey": { "CO1": 82, "CO2": 78, "CO3": 48, "CO4": 78 }
    },
    "ec302": {
      "test1": { "CO1": 68, "CO2": 72, "CO3": 50, "CO4": 65 },
      "test2": { "CO1": 74, "CO2": 76, "CO3": 55, "CO4": 68 },
      "endsem": { "CO1": 60, "CO2": 64, "CO3": 48, "CO4": 58 },
      "assignments": { "CO1": 85, "CO2": 88, "CO3": 75, "CO4": 82 },
      "exitsurvey": { "CO1": 80, "CO2": 82, "CO3": 72, "CO4": 80 }
    },
    "it301": {
      "test1": { "CO1": 82, "CO2": 74, "CO3": 25, "CO4": 30 },
      "test2": { "CO1": 80, "CO2": 78, "CO3": 28, "CO4": 34 },
      "endsem": { "CO1": 72, "CO2": 68, "CO3": 24, "CO4": 31 },
      "assignments": { "CO1": 90, "CO2": 85, "CO3": 32, "CO4": 35 },
      "exitsurvey": { "CO1": 86, "CO2": 80, "CO3": 40, "CO4": 42 }
    },
    "it302": {
      "test1": { "CO1": 66, "CO2": 70, "CO3": 62, "CO4": 54 },
      "test2": { "CO1": 70, "CO2": 75, "CO3": 64, "CO4": 58 },
      "endsem": { "CO1": 58, "CO2": 65, "CO3": 58, "CO4": 50 },
      "assignments": { "CO1": 82, "CO2": 86, "CO3": 80, "CO4": 72 },
      "exitsurvey": { "CO1": 78, "CO2": 82, "CO3": 78, "CO4": 74 }
    }
  });

  // Target goals configured per CO
  const [coTargetAttainmentPercentage, setCoTargetAttainmentPercentage] = useState<{ [coId: string]: number }>({
    "CO1": 65,
    "CO2": 65,
    "CO3": 60,
    "CO4": 65,
    "CO5": 60,
    "CO6": 60
  });

  // Selected state for Continuous Improvement Action viewer
  const [ciGeneratedMemo, setCiGeneratedMemo] = useState<string>("");
  const [isGeneratingCI, setIsGeneratingCI] = useState<boolean>(false);

  // Active Criterion selected in SAR Builder
  const [activeCriterionId, setActiveCriterionId] = useState<string>("C2");
  const activeCriterion = criteria.find(c => c.id === activeCriterionId) || criteria[0];
  const [sarEditorText, setSarEditorText] = useState<string>("");
  const [isSyncingSAR, setIsSyncingSAR] = useState<boolean>(false);
  const [aiAuditorPrompt, setAiAuditorPrompt] = useState<string>("");
  const [aiAuditorResponse, setAiAuditorResponse] = useState<string>("");
  const [isAuditingSAR, setIsAuditingSAR] = useState<boolean>(false);

  // AI Agent Hub State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      content: "Hello! welcome to the NBA Enterprise AI workspace. I am your orchestration hub. Select any specialist agent on the right to perform specific compliance checks, draft outcome mappings, execute gap audit, or suggest Self Assessment Criteria points.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentType: "orchestrator"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeSpecialist, setActiveSpecialist] = useState("orchestrator");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize SAR editor text when active criterion shifts
  useEffect(() => {
    if (activeCriterion) {
      setSarEditorText(activeCriterion.editorContent);
    }
  }, [activeCriterionId]);

  // Handle chat window scroll
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiResponding]);

  // Overall Score Calculation (calculated dynamically)
  // Calculated based on criteria values + target attainment ratio
  const calculateTotalEarnedPoints = () => {
    return criteria.reduce((sum, item) => sum + item.allottedPoints, 0);
  };

  const earnedPoints = calculateTotalEarnedPoints();
  const readinessIndex = Math.round((earnedPoints / 1000) * 100);

  // UTILITY FOR DYNAMIC ATTAINMENT CALCULATING
  // Compute weighted attainment for each CO in the active course
  const getCOAttainmentCalculations = (courseId: string) => {
    const courseObj = courses.find(c => c.id === courseId) || courses[0];
    const outcomes = courseObj.cos;
    
    // Total weight calculations
    const directMethods = assessmentMethods.filter(m => m.type === "direct");
    const totalDirectWeight = directMethods.reduce((sum, m) => sum + m.weight, 0);

    const indirectMethods = assessmentMethods.filter(m => m.type === "indirect");
    const totalIndirectWeight = indirectMethods.reduce((sum, m) => sum + m.weight, 0);

    const results = outcomes.map(co => {
      // 1. Compute Direct average
      let directSum = 0;
      let directWeightUsed = 0;
      
      directMethods.forEach(method => {
        const perf = studentPerformanceScores[courseId]?.[method.id]?.[co.id];
        if (perf !== undefined) {
          // Calculate whether students meeting target criteria meets benchmark
          // Here, 'perf' represents percentage of students scoring above the target threshold. 
          // If this percent exceeds the method's target success rate (attainmentBenchmarkPercentage), we grant 100% attainment of this component's scale (otherwise partial proportional mapping)
          const ratio = Math.min(100, (perf / method.attainmentBenchmarkPercentage) * 100);
          directSum += ratio * (method.weight / 100);
          directWeightUsed += (method.weight / 100);
        }
      });

      const directAttainmentPercent = directWeightUsed > 0 ? (directSum / directWeightUsed) : 0;

      // 2. Compute Indirect average
      let indirectSum = 0;
      let indirectWeightUsed = 0;

      indirectMethods.forEach(method => {
        const perf = studentPerformanceScores[courseId]?.[method.id]?.[co.id];
        if (perf !== undefined) {
          const ratio = Math.min(100, (perf / method.attainmentBenchmarkPercentage) * 100);
          indirectSum += ratio * (method.weight / 100);
          indirectWeightUsed += (method.weight / 100);
        }
      });

      const indirectAttainmentPercent = indirectWeightUsed > 0 ? (indirectSum / indirectWeightUsed) : 0;

      // Combine weights
      // Standard target ratio e.g., 80% Direct / 20% Indirect
      const finalPercentage = parseFloat(
        ((directAttainmentPercent * (targetWeightDirect / 100)) + 
         (indirectAttainmentPercent * ((100 - targetWeightDirect) / 100))).toFixed(1)
      );

      // Map to NBA scale (0 to 3) based on percentage parameters
      // e.g. < 50% = 0, 50-60% = 1, 60-70% = 2, >=70% = 3
      let mappedScaleValue = 0;
      if (finalPercentage >= 70) mappedScaleValue = 3;
      else if (finalPercentage >= 60) mappedScaleValue = 2;
      else if (finalPercentage >= 50) mappedScaleValue = 1;

      // Get target set for this outcome (default is 60%)
      const target = coTargetAttainmentPercentage[co.id] || 60;
      const isMet = finalPercentage >= target;

      return {
        coId: co.id,
        coText: co.text,
        bloomsLevel: co.bloomsLevel,
        directAttainment: Math.round(directAttainmentPercent),
        indirectAttainment: Math.round(indirectAttainmentPercent),
        overallAttainmentPercentage: finalPercentage,
        mappedLevel: mappedScaleValue,
        target: target,
        isMet: isMet,
        gapPercentage: isMet ? 0 : parseFloat((target - finalPercentage).toFixed(1))
      };
    });

    return results;
  };

  const activeCourseAttainments = getCOAttainmentCalculations(selectedCourseId);

  // Gap outcomes filtered
  const gapCOs = activeCourseAttainments.filter(a => !a.isMet);

  // Sync selectedCourseId when department changes so that it selects first available course of that department
  useEffect(() => {
    const deptCourses = courses.filter(c => c.department === selectedDept);
    if (deptCourses.length > 0) {
      const isCurrentInDept = deptCourses.some(c => c.id === selectedCourseId);
      if (!isCurrentInDept) {
        setSelectedCourseId(deptCourses[0].id);
      }
    }
  }, [selectedDept, courses]);

  // Dynamically update SARCriterion points in active state whenever courses or studentPerformanceScores change
  useEffect(() => {
    const deptCourses = courses.filter(c => c.department === selectedDept);

    // 1. Calculate CO-PO mapping coverage across all courses in department
    let totalPossiblePairs = 0;
    let totalMappedPairs = 0;
    deptCourses.forEach(c => {
      totalPossiblePairs += c.cos.length * 12;
      totalMappedPairs += c.mappings.filter(m => m.value > 0).length;
    });
    const mappingRatio = totalPossiblePairs > 0 ? (totalMappedPairs / totalPossiblePairs) : 0;
    const dynamicC2Points = Math.round(50 + (mappingRatio * 50));

    // 2. Calculate Continuous Improvement progress (C7) based on target attainment met ratio across all courses
    let totalOutcomes = 0;
    let metOutcomes = 0;
    deptCourses.forEach(c => {
      const attainments = getCOAttainmentCalculations(c.id);
      totalOutcomes += attainments.length;
      metOutcomes += attainments.filter(a => a.isMet).length;
    });
    const metRatio = totalOutcomes > 0 ? (metOutcomes / totalOutcomes) : 0;
    const dynamicC7Points = Math.round(20 + (metRatio * 30));

    // 3. Calculate Students' Performance (C4) based on average attainment accomplishment across all outcome targets
    let totalOverallAttainmentSum = 0;
    let totalOutcomesCount = 0;
    deptCourses.forEach(c => {
      const attainments = getCOAttainmentCalculations(c.id);
      attainments.forEach(a => {
        totalOverallAttainmentSum += a.overallAttainmentPercentage;
        totalOutcomesCount++;
      });
    });
    const avgOverallAttainment = totalOutcomesCount > 0 ? (totalOverallAttainmentSum / totalOutcomesCount) : 0;
    const dynamicC4Points = Math.round(70 + ((avgOverallAttainment / 100) * 80));

    // Update criteria state only if they differ to avoid loops
    setCriteria(prev => {
      let changed = false;
      const next = prev.map(c => {
        let allotted = c.allottedPoints;
        if (c.id === "C2") allotted = dynamicC2Points;
        else if (c.id === "C7") allotted = dynamicC7Points;
        else if (c.id === "C4") allotted = dynamicC4Points;
        else if (c.id === "C1") {
          allotted = selectedDept === "Computer Science" ? 95 : selectedDept === "Electronics" ? 91 : 96;
        } else if (c.id === "C3") {
          allotted = selectedDept === "Computer Science" ? 85 : selectedDept === "Electronics" ? 88 : 84;
        } else if (c.id === "C5") {
          allotted = selectedDept === "Computer Science" ? 148 : selectedDept === "Electronics" ? 142 : 145;
        } else if (c.id === "C6") {
          allotted = selectedDept === "Computer Science" ? 62 : selectedDept === "Electronics" ? 64 : 60;
        }

        if (allotted !== c.allottedPoints) {
          changed = true;
          return { ...c, allottedPoints: allotted };
        }
        return c;
      });
      return changed ? next : prev;
    });
  }, [courses, selectedDept, studentPerformanceScores, targetWeightDirect, coTargetAttainmentPercentage]);

  // Trigger Action Logging helper
  const addAuditLog = (action: string, module: string) => {
    const newLog: AuditLog = {
      id: "L_" + Date.now(),
      user: "Prof. John Doe",
      role: userRole,
      action: action,
      timestamp: new Date().toISOString(),
      module: module
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // AI WORKER 1: AUTO DRAFT 6 COURSE OUTCOMES (API POST ROOT)
  const handleAutoGenerateCOs = async () => {
    setIsGeneratingCOs(true);
    addAuditLog(`Initiated automatic AI drafting of outcomes using Bloom's Taxonomy`, "CO-PO Matrix");
    try {
      const response = await fetch("/api/generate-cos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseName: currentCourse.name,
          courseDescription: currentCourse.description 
        })
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.cos) && data.cos.length > 0) {
        // Successfully got custom generated COs. Replace or update!
        const updatedCourses = courses.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, cos: data.cos };
          }
          return c;
        });
        setCourses(updatedCourses);
        addAuditLog(`Successfully generated and integrated ${data.cos.length} professional Course Outcomes (CO1-CO6)`, "CO-PO Matrix");
      } else {
        alert("Server returned error generating course description. Fallback data retained.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed communicating with AI server. Please make sure GEMINI_API_KEY is available: " + e.message);
    } finally {
      setIsGeneratingCOs(false);
    }
  };

  // AI WORKER 2: AUTO BUILD MAPPING SUGGESTIONS WITH CRITERIA RATIONALE
  const handleSuggestMappings = async () => {
    if (currentCourse.cos.length === 0) {
      alert("Please ensure Course Outcomes are described before prompting AI suggestion mapping.");
      return;
    }
    setIsSuggestingMappings(true);
    addAuditLog(`Requested AI analysis of alignment correlation mappings`, "CO-PO Matrix");
    try {
      const response = await fetch("/api/suggest-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: currentCourse.name,
          cos: currentCourse.cos
        })
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.mappings)) {
        // Update mappings state in the selected course
        const updatedCourses = courses.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, mappings: data.mappings };
          }
          return c;
        });
        setCourses(updatedCourses);
        addAuditLog(`Applied dynamic AI validation suggestion: ${data.mappings.length} correlation rules calculated.`, "CO-PO Matrix");
      } else {
        alert("Failed to receive suggested mappings array from active AI client.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error contacting suggested mappings agent: " + err.message);
    } finally {
      setIsSuggestingMappings(false);
    }
  };

  // AI WORKER 3: CONTINUOUS IMPROVEMENT GAP ANALYSIS MEMORANDUM
  const handleGenerateCIMemo = async () => {
    setIsGeneratingCI(true);
    addAuditLog(`Initiated continuous improvement gap analysis and sustainment workflow`, "Calculator");
    try {
      const requestGaps = gapCOs.length > 0
        ? gapCOs.map(g => ({
            coId: g.coId,
            attained: g.overallAttainmentPercentage,
            target: g.target,
            explanation: `Fails target by ${g.gapPercentage}%. Primary student scores did not cross the predefined ${globalThresholdScore}% mark benchmark.`
          }))
        : activeCourseAttainments.map(g => ({
            coId: g.coId,
            attained: g.overallAttainmentPercentage,
            target: g.target,
            explanation: `Exceeded target of ${g.target}% successfully with an attainment of ${g.overallAttainmentPercentage}%! Excellent student cohort achievement.`
          }));

      const response = await fetch("/api/generate-ci-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: currentCourse.name,
          coGaps: requestGaps
        })
      });
      const data = await response.json();
      if (data.success && data.actionPlan) {
        setCiGeneratedMemo(data.actionPlan);
        // Automatically save to Criterion 7
        const updatedCriteria = criteria.map(item => {
          if (item.id === "C7") {
            return {
              ...item,
              editorContent: item.editorContent + `<br/><div class="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-xs"><h4>AI Action Plan Drafted on ${new Date().toLocaleDateString()}:</h4><p class="whitespace-pre-line">${data.actionPlan}</p></div>`
            };
          }
          return item;
        });
        setCriteria(updatedCriteria);
        addAuditLog(`Continuous Improvement remedial advisory automatically filed under Criterion 7`, "SAR Report");
      } else {
        alert("Failed to generate correct advisory. No text generated.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error generating action memorandum: " + e.message);
    } finally {
      setIsGeneratingCI(false);
    }
  };

  // AI WORKER 4: CHAT MULTI-AGENT INVOCATION SYSTEM
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");

    // Create prompt message state
    const userMsg: Message = {
      id: "u_" + Date.now(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsAiResponding(true);

    // Build immediate context pack to feed AI for genuine insight
    const contextPack = {
      activeCourse: {
        code: currentCourse.code,
        name: currentCourse.name,
        cosCount: currentCourse.cos.length,
        attainmentsCount: activeCourseAttainments.length,
        attainedGaps: gapCOs.map(g => `${g.coId}: Attained ${g.overallAttainmentPercentage}% against Target ${g.target}%`)
      },
      sarProgress: {
        readinessIndex,
        totalPointsEarned: earnedPoints,
        crit_completed: criteria.filter(c => c.status === "completed").map(c => c.id)
      }
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          agentType: activeSpecialist,
          context: contextPack
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        setMessages(prev => [...prev, {
          id: "r_" + Date.now(),
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentType: activeSpecialist
        }]);
        addAuditLog(`Queried agent: "${activeSpecialist}" model processed compliance instruction`, "AI Agents Hub");
      } else {
        setMessages(prev => [...prev, {
          id: "r_" + Date.now(),
          role: "assistant",
          content: "I apologies, but my primary inference layer did not compute a response string correctly. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: "err_" + Date.now(),
        role: "assistant",
        content: `Connect error occurred: "${err?.message || 'Inbound interface offline'}". Ensure server routes remain operational.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // AI WORKER 5: CRITERION TEXT AUDITING WITH NBA AGENT
  const handleAuditActiveCriterion = async () => {
    setIsAuditingSAR(true);
    setAiAuditorResponse("");
    addAuditLog(`Dispatched Specialist Agent validator to inspect Chapter ${activeCriterionId}`, "SAR Report");
    try {
      const customPrompt = `
You are the NBA Accreditation Specialist Agent Auditing "Criterion Chapter ${activeCriterion.id}: ${activeCriterion.title}"
The current draft content of this criteria is as follows:
---
${sarEditorText || 'Empty draft.'}
---
User custom focus instructions:
"${aiAuditorPrompt || 'Perform general comprehensive audit for high tier-1 grading success.'}"

Please evaluate and output critical suggestions:
1. Missing Evidence Files or tables that must be linked.
2. Compliance Rating estimation (Fully met, partially met, deficit).
3. Recommended phrasing standard to maximize points (Tier-1 points: ${activeCriterion.maxPoints}).

Give clear, straightforward advice.
`;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: customPrompt }],
          agentType: "validation",
          context: { activeCriterionId, maxPoints: activeCriterion.maxPoints }
        })
      });
      const data = await response.json();
      if (data.success && data.text) {
        setAiAuditorResponse(data.text);
        addAuditLog(`Validation review compiled for Chapter ${activeCriterionId}`, "SAR Report");
      } else {
        setAiAuditorResponse("Audit computation failed. Check terminal logs.");
      }
    } catch (err: any) {
      console.error(err);
      setAiAuditorResponse("Error contacting audit provider: " + err.message);
    } finally {
      setIsAuditingSAR(false);
    }
  };

  // Save changes to active SAR criterion
  const handleSaveCriterionEdit = () => {
    setIsSyncingSAR(true);
    setTimeout(() => {
      const updated = criteria.map(c => {
        if (c.id === activeCriterionId) {
          return { ...c, editorContent: sarEditorText };
        }
        return c;
      });
      setCriteria(updated);
      setIsSyncingSAR(false);
      addAuditLog(`Updated content draft for ${activeCriterionId}: ${activeCriterion.title}`, "SAR Report");
    }, 400); // quick visual feedback
  };

  // Mark draft status of a Criterion
  const handleSetCriterionStatus = (status: "not_started" | "in_progress" | "completed" | "under_review") => {
    const updated = criteria.map(c => {
      if (c.id === activeCriterionId) {
        // Adjust allot percentage based on completed parameters
        let points = c.allottedPoints;
        if (status === "completed") points = Math.round(c.maxPoints * 0.88); // mock standard higher
        else if (status === "not_started") points = 0;
        return { ...c, status, allottedPoints: points };
      }
      return c;
    });
    setCriteria(updated);
    addAuditLog(`Set criteria chapter status of ${activeCriterionId} to [${status.toUpperCase()}]`, "SAR Report");
  };

  // Update specific mapping item manually
  const updateManualMapping = (coId: string, poId: string, value: number) => {
    const existingMappings = currentCourse.mappings;
    const filterOut = existingMappings.filter(m => !(m.coId === coId && m.poId === poId));
    
    const nextMappings = [...filterOut];
    if (value > 0) {
      nextMappings.push({ coId, poId, value, rationale: "Manually adjusted target correlation strength" });
    }

    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseId) {
        return { ...c, mappings: nextMappings };
      }
      return c;
    });

    setCourses(updatedCourses);
  };

  // Click on heatmap matrix cell to cycle value
  const handleCellClick = (coId: string, poId: string) => {
    const currentVal = currentCourse.mappings.find(m => m.coId === coId && m.poId === poId)?.value || 0;
    const nextVal = (currentVal + 1) % (correlationMappingScale + 1); // cycles 0, 1, 2, 3
    updateManualMapping(coId, poId, nextVal);
    addAuditLog(`Adjusted manual CO-PO cell mapping [${coId} - ${poId}] to correlation level ${nextVal}`, "CO-PO Matrix");
  };

  // Handle addition of custom CO
  const handleAddCustomCO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoText.trim()) return;

    const nextIdNum = currentCourse.cos.length + 1;
    const nextId = "CO" + nextIdNum;
    const newCo: CourseOutcome = {
      id: nextId,
      text: newCoText,
      bloomsLevel: newCoBlooms
    };

    const updated = courses.map(c => {
      if (c.id === selectedCourseId) {
        return { ...c, cos: [...c.cos, newCo] };
      }
      return c;
    });

    setCourses(updated);
    setNewCoText("");
    addAuditLog(`Manually created custom course outcome entry ${nextId}`, "CO-PO Matrix");
  };

  // Delete Course Outcome item
  const handleDeleteCOObj = (coId: string) => {
    const updated = courses.map(c => {
      if (c.id === selectedCourseId) {
        // filter out outcome and prune active mappings that link to it
        return {
          ...c,
          cos: c.cos.filter(item => item.id !== coId),
          mappings: c.mappings.filter(m => m.coId !== coId)
        };
      }
      return c;
    });
    setCourses(updated);
    addAuditLog(`Pruned Custom Outcome ${coId} and associated alignment rules`, "CO-PO Matrix");
  };

  // Modify individual student success distribution inside calculation matrix
  const handleScoreDistributionChange = (methodId: string, coId: string, newValue: number) => {
    const pct = Math.max(0, Math.min(100, newValue));
    setStudentPerformanceScores(prev => {
      const courseRecord = prev[selectedCourseId] || {};
      const methodRecord = courseRecord[methodId] || {};
      return {
        ...prev,
        [selectedCourseId]: {
          ...courseRecord,
          [methodId]: {
            ...methodRecord,
            [coId]: pct
          }
        }
      };
    });
  };

  // Reset demo metrics safely
  const handleReloadDefaultMock = () => {
    setCourses(SAMPLE_COURSES);
    setAssessmentMethods(INITIAL_ASSESSMENT_METHODS);
    setCriteriaMap({
      "Computer Science": INITIAL_CRITERIA_LIST,
      "Electronics": INITIAL_CRITERIA_LIST.map(c => {
        let status = c.status;
        let allottedPoints = c.allottedPoints;
        if (c.id === "C1") { status = "in_progress"; allottedPoints = 88; }
        else if (c.id === "C2") { status = "in_progress"; allottedPoints = 55; }
        else if (c.id === "C3") { status = "completed"; allottedPoints = 92; }
        else if (c.id === "C4") { status = "under_review"; allottedPoints = 98; }
        else if (c.id === "C5") { status = "completed"; allottedPoints = 140; }
        else if (c.id === "C6") { status = "under_review"; allottedPoints = 55; }
        else if (c.id === "C7") { status = "in_progress"; allottedPoints = 30; }
        else if (c.id === "C8") { status = "in_progress"; allottedPoints = 32; }
        else if (c.id === "C9") { allottedPoints = 44; }
        else if (c.id === "C10") { status = "completed"; allottedPoints = 90; }
        return { ...c, status, allottedPoints };
      }),
      "Information Tech": INITIAL_CRITERIA_LIST.map(c => {
        let status = c.status;
        let allottedPoints = c.allottedPoints;
        if (c.id === "C1") { status = "completed"; allottedPoints = 98; }
        else if (c.id === "C2") { status = "completed"; allottedPoints = 85; }
        else if (c.id === "C3") { status = "in_progress"; allottedPoints = 82; }
        else if (c.id === "C4") { status = "completed"; allottedPoints = 125; }
        else if (c.id === "C5") { status = "completed"; allottedPoints = 152; }
        else if (c.id === "C6") { status = "completed"; allottedPoints = 65; }
        else if (c.id === "C7") { status = "completed"; allottedPoints = 42; }
        else if (c.id === "C8") { status = "completed"; allottedPoints = 40; }
        else if (c.id === "C9") { status = "completed"; allottedPoints = 43; }
        else if (c.id === "C10") { status = "in_progress"; allottedPoints = 95; }
        return { ...c, status, allottedPoints };
      })
    });
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMessages([
      {
        id: "r_reset",
        role: "assistant",
        content: "System metrics reinitialized. All mock alignments and direct attainment percentages have been safely restored to original university records.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentType: "orchestrator"
      }
    ]);
    addAuditLog("Reinitialized default accreditation tracking parameters", "System Settings");
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden antialiased">
      
      {/* Sidebar with pristine colors */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        nbaScore={readinessIndex} 
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Global Navigation header */}
        <Navbar 
          currentTab={currentTab}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          userRole={userRole}
          setUserRole={setUserRole}
          onRefresh={handleReloadDefaultMock}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6 space-y-6">
          
          {/* Active Course context selector displayed globally except chat? */}
          {currentTab !== "settings" && currentTab !== "chat" && (
            <div id="course-selector-bar" className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg font-mono font-bold text-sm">
                  {currentCourse.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{currentCourse.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium font-sans">
                      {currentCourse.semester}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{currentCourse.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:self-center shrink-0">
                <span className="text-xs text-gray-500 font-medium font-mono">switch active subject:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="text-xs font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 outline-none rounded-lg px-3 py-2 cursor-pointer transition-all"
                >
                  {filteredCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 1: ACCREDITATION DASHBOARD & READINESS HUB */}
          {currentTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div id="metric-readiness" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono tracking-wider uppercase">OVERALL READINESS</span>
                    <h2 className="text-3xl font-extrabold text-indigo-600 mt-2">{readinessIndex}%</h2>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      ↑ 2.4% from last audit
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{earnedPoints}/1000 pts</span>
                  </div>
                </div>

                <div id="metric-mapping" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono tracking-wider uppercase">CO-PO COGNITIVE COVERAGE</span>
                    {(() => {
                      const totalCopoPairs = currentCourse.cos.length * 12;
                      const mappedPairs = currentCourse.mappings.filter(m => m.value > 0).length;
                      return (
                        <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
                          {mappedPairs} <span className="text-sm text-gray-400 font-medium">/ {totalCopoPairs} channels</span>
                        </h2>
                      );
                    })()}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                      {currentCourse.cos.length} Active Course Outcomes
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">100% compliant</span>
                  </div>
                </div>

                <div id="metric-sar" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono tracking-wider uppercase">SAR CHAPTER PROGRESS</span>
                    {(() => {
                      const completedCount = criteria.filter(c => c.status === "completed").length;
                      const totalCount = criteria.length;
                      return (
                        <h2 className="text-3xl font-extrabold text-amber-600 mt-2">
                          {Math.round((completedCount / totalCount) * 100)}%
                        </h2>
                      );
                    })()}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                      {criteria.filter(c => c.status === "in_progress").length} In review chapters
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">{criteria.filter(c => c.status === "completed").length}/{criteria.length} Complete</span>
                  </div>
                </div>

                <div id="metric-gaps" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono tracking-wider uppercase">ACTIVE ATTAINMENT GAPS</span>
                    <h2 className={`text-3xl font-extrabold mt-2 ${gapCOs.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {String(gapCOs.length).padStart(2, '0')}
                    </h2>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${gapCOs.length > 0 ? "bg-red-50 text-red-700 font-medium" : "bg-emerald-50 text-emerald-700"}`}>
                      {gapCOs.length > 0 ? `${gapCOs.length} Action plans pending` : "All Targets Achieved!"}
                    </span>
                    <span className="text-[11px] text-gray-400 pr-1">Target Threshold {targetWeightDirect}-{100 - targetWeightDirect} %</span>
                  </div>
                </div>

              </div>

              {/* Main Dashboard Layout (Two Column) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Simulated Heatmap visualizer */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">NBA Alignment Matrix Preview</h3>
                        <p className="text-xs text-gray-500">Live correlation strength of mapped outcomes across standards</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentTab("copo")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Configure Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* CO-PO Grid Preview */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2.5 font-bold text-gray-400 text-[10px] uppercase font-mono w-16">CO / PO</th>
                          {NBA_PO_LIST.map(p => (
                            <th key={p.id} className="p-2 text-center font-bold text-gray-700 font-mono w-10 shrink-0" title={p.text}>
                              {p.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentCourse.cos.map(co => (
                          <tr key={co.id} className="border-t border-gray-100 hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-gray-900 bg-gray-50/50 block font-mono">
                              {co.id}
                            </td>
                            {NBA_PO_LIST.map(p => {
                              const mapping = currentCourse.mappings.find(m => m.coId === co.id && m.poId === p.id);
                              const value = mapping?.value || 0;
                              
                              let colorClass = "bg-gray-50 hover:bg-gray-100 text-gray-300"; // value 0
                              if (value === 3) colorClass = "bg-indigo-600 text-white font-bold";
                              else if (value === 2) colorClass = "bg-indigo-400 text-white";
                              else if (value === 1) colorClass = "bg-indigo-100 text-indigo-800";

                              return (
                                <td 
                                  key={p.id} 
                                  className="p-1"
                                >
                                  <div 
                                    className={`aspect-square w-8 h-8 rounded-md mx-auto flex items-center justify-center text-[11px] transition-colors ${colorClass}`}
                                    title={`${co.id} paired with ${p.id}: Level ${value}`}
                                  >
                                    {value || "-"}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend explanation */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-indigo-600 block"></span>
                        <span>High (3)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-indigo-400 block"></span>
                        <span>Moderate (2)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-200 block"></span>
                        <span>Slight (1)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-gray-50 border border-gray-200 block"></span>
                        <span>No Corr</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono">Target: {currentCourse.cos.length * 12} check points</span>
                  </div>
                </div>

                {/* active AI specialist layout (Bento mockup right) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                      <h3 className="font-bold text-gray-900 text-sm">Active AI Specialists</h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-mono font-medium">REAL-TIME ACTIVE</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-xs">
                            SA
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">SARAgent</span>
                            <span className="text-[10px] text-gray-500">Continuous audit on Chapter 4</span>
                          </div>
                        </div>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-xs">
                            CO
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">COPOAgent</span>
                            <span className="text-[10px] text-gray-400">Taxonomy compliance validator</span>
                          </div>
                        </div>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-xs">
                            VA
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">ValidationAgent</span>
                            <span className="text-[10px] text-emerald-600">Audit execution complete</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-500 font-bold">✓</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-xs">
                            AA
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">AnalyticsAgent</span>
                            <span className="text-[10px] text-gray-400">Formatting system matrix...</span>
                          </div>
                        </div>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => setCurrentTab("chat")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Brain className="w-4.5 h-4.5" /> Speak with NBA Assistants
                    </button>
                  </div>
                </div>

              </div>

              {/* Course Outcome attainment checklist / summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Course Outcome (CO) Summary & Targets</h3>
                      <p className="text-xs text-gray-500">Detailed target performance versus live student success ratios</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentTab("attainment")}
                    className="text-xs bg-indigo-50 px-3 py-1.5 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    Recalculate Attainments
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCourseAttainments.map((att) => (
                    <div 
                      key={att.coId}
                      className={`p-4 rounded-xl border transition-all ${
                        att.isMet 
                          ? "bg-emerald-50/20 border-emerald-100 hover:border-emerald-200" 
                          : "bg-red-50/20 border-red-100 hover:border-red-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-800 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                              {att.coId}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                              {att.bloomsLevel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium mt-2 leading-relaxed">
                            {att.coText}
                          </p>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-block ${
                            att.isMet ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {att.isMet ? "MET" : "GAP"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono block mt-1.5">Target: {att.target}%</span>
                        </div>
                      </div>

                      {/* Score indicator bars */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all rounded-full ${att.isMet ? "bg-emerald-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, att.overallAttainmentPercentage)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-800 font-mono shrink-0">
                          {att.overallAttainmentPercentage}%
                        </span>
                      </div>

                      {/* Advisory suggestion link if deficiency */}
                      {!att.isMet && (
                        <div className="mt-3 flex items-center justify-between text-[11px] bg-red-50/60 p-2 rounded-lg text-red-700">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Deficit of {att.gapPercentage}% under standard.
                          </span>
                          <button 
                            onClick={() => {
                              setCurrentTab("attainment");
                              setTimeout(() => handleGenerateCIMemo(), 100);
                            }}
                            className="font-mono font-bold hover:underline cursor-pointer"
                          >
                            Generate Remedial Memo →
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit history and workflow */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-bold text-gray-950 text-sm">System Audit Activity Logs</h3>
                  <span className="text-xs text-gray-400 font-mono">NBA compliance record tracker</span>
                </div>
                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="flex hover:bg-slate-50/50 p-2.5 rounded-lg text-xs items-start gap-3 transition-colors">
                      <div className="p-1 px-2.5 rounded bg-slate-100 font-mono font-bold text-slate-700 text-[10px] shrink-0">
                        {log.module}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-800">{log.user}</span>
                        <span className="text-gray-500 text-[11px] font-mono"> ({log.role})</span>
                        <p className="text-gray-700 mt-1">{log.action}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COURSE OUTCOME TO PROGRAM OUTCOME MATRIX (CO-PO) */}
          {currentTab === "copo" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Course Objectives & Bloom's Taxonomy Alignment</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Maintain standard list of outputs. Map correlation weights manually or seek automatic AI analysis.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoGenerateCOs}
                      disabled={isGeneratingCOs}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 disabled:opacity-50 py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: isGeneratingCOs ? '3s' : '0s' }} />
                      {isGeneratingCOs ? "Drafting with AI..." : "AI Auto-Generate 6 COs"}
                    </button>
                    
                    <button
                      onClick={handleSuggestMappings}
                      disabled={isSuggestingMappings}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-indigo-200" />
                      {isSuggestingMappings ? "Mapping..." : "AI Suggest Mapping Strengths"}
                    </button>
                  </div>
                </div>

                {/* Course outcome editor details list */}
                <div className="my-6 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-3">CURRENT COURSE OUTCOME LIST</h3>
                  {currentCourse.cos.map((co, index) => (
                    <div key={co.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded-lg border border-indigo-100 shrink-0">
                          {co.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              {co.bloomsLevel}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-800 mt-1.5 leading-relaxed">
                            {co.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end shrink-0 pl-1">
                        <button
                          onClick={() => handleDeleteCOObj(co.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title={`Prune ${co.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add manual outcome outcome */}
                  <form onSubmit={handleAddCustomCO} className="p-4 bg-white border border-dashed border-gray-300 rounded-xl flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <input 
                        type="text"
                        required
                        placeholder="e.g., Design optimal schemas reducing transactional locking conflicts..."
                        value={newCoText}
                        onChange={(e) => setNewCoText(e.target.value)}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={newCoBlooms}
                        onChange={(e) => setNewCoBlooms(e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-2.5 outline-none cursor-pointer text-gray-700 font-bold"
                      >
                        <option value="Remember (K1)">K1 - Remember</option>
                        <option value="Understand (K2)">K2 - Understand</option>
                        <option value="Apply (K3)">K3 - Apply</option>
                        <option value="Analyze (K4)">K4 - Analyze</option>
                        <option value="Evaluate (K5)">K5 - Evaluate</option>
                        <option value="Create (K6)">K6 - Create</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-lg px-4 py-2.5 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Outcome
                      </button>
                    </div>
                  </form>
                </div>

                {/* Master Grid mapping */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Interactive CO-PO Correlation Heatmap</h3>
                      <p className="text-xs text-gray-500">Click cells (0-3 scale) to instantly adjust direct mappings. Cell values update dynamically.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono font-bold select-none bg-slate-50 border border-slate-100 rounded p-1">MODE: FAST INTERACTIVE CLICK</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 font-semibold text-gray-600 text-left font-mono w-24">CO ID</th>
                          {NBA_PO_LIST.map(po => (
                            <th 
                              key={po.id} 
                              className="p-2 border-l border-gray-200 text-center font-bold text-gray-700 font-mono cursor-help hover:bg-gray-100 transition-colors shrink-0"
                              title={`${po.shortTitle}: ${po.text}`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{po.id}</span>
                                <span className="text-[9px] text-gray-400 font-normal truncate max-w-14" title={po.shortTitle}>
                                  {po.shortTitle}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentCourse.cos.map(co => (
                          <tr key={co.id} className="border-t border-gray-200 hover:bg-gray-50/40">
                            <td className="p-3 font-bold text-gray-950 bg-gray-50 flex items-center justify-between">
                              <span className="font-mono">{co.id}</span>
                              <span className="text-[9px] font-mono text-gray-400">({co.bloomsLevel.split(" ")[0]})</span>
                            </td>
                            {NBA_PO_LIST.map(po => {
                              const mapping = currentCourse.mappings.find(m => m.coId === co.id && m.poId === po.id);
                              const value = mapping?.value || 0;
                              
                              let colorClass = "bg-white hover:bg-gray-50 text-gray-200"; // value 0
                              if (value === 3) colorClass = "bg-indigo-600 text-white font-extrabold shadow-sm";
                              else if (value === 2) colorClass = "bg-indigo-400 text-white font-bold";
                              else if (value === 1) colorClass = "bg-indigo-100 text-indigo-900 font-semibold border-indigo-200/50";

                              return (
                                <td 
                                  key={po.id}
                                  id={`cell-${co.id}-${po.id}`}
                                  onClick={() => handleCellClick(co.id, po.id)}
                                  className="border-l border-gray-200 p-1 cursor-pointer transition-colors"
                                  onMouseEnter={() => setHoveredCell({ coId: co.id, poId: po.id })}
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  <div 
                                    className={`aspect-square w-10 h-10 rounded-lg mx-auto flex flex-col items-center justify-center text-xs transition-transform hover:scale-110 active:scale-95 duration-100 ${colorClass}`}
                                  >
                                    <span>{value}</span>
                                    {mapping?.rationale && (
                                      <span className="text-[7px] text-indigo-200 mt-0.5 font-normal max-w-8 truncate">
                                        info
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Active hovered cell rationale helper */}
                  <div className="mt-4 p-4 bg-slate-50 border border-gray-200 rounded-xl text-xs">
                    {hoveredCell ? (
                      <div>
                        {(() => {
                          const poObj = NBA_PO_LIST.find(p => p.id === hoveredCell.poId);
                          const coObj = currentCourse.cos.find(c => c.id === hoveredCell.coId);
                          const mapping = currentCourse.mappings.find(m => m.coId === hoveredCell.coId && m.poId === hoveredCell.poId);
                          return (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-900">
                                  Inspect Mapping Context: <span className="text-indigo-600 font-mono font-black">{hoveredCell.coId} : {hoveredCell.poId}</span>
                                </span>
                                <span className="text-gray-400 text-[11px] font-mono">Correlation level: {mapping?.value || 0} / 3</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed mb-1">
                                <span className="font-semibold text-gray-900">Outcome:</span> {coObj?.text}
                              </p>
                              <p className="text-gray-700 leading-relaxed">
                                <span className="font-semibold text-gray-900">{poObj?.id}:</span> {poObj?.text}
                              </p>
                              {mapping?.rationale && (
                                <p className="mt-2.5 p-2 bg-indigo-50/60 text-indigo-800 rounded-lg text-[11.5px] border border-indigo-100">
                                  <span className="font-bold">Accreditation Advisory Rationale:</span> {mapping.rationale}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-2 font-mono italic">
                        Move cursor over any matrix cell above to view absolute taxonomy descriptions and core AI validations.
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTAINTMENT CALCULATOR */}
          {currentTab === "attainment" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Continuous Attainment Matrix Calculator</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure target expectations. Input the percentage of students meeting specific marks criteria under both direct processes and indirect exit surveys.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleGenerateCIMemo}
                      disabled={isGeneratingCI}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4.5 h-4.5 text-indigo-200" />
                      {isGeneratingCI ? "Drafting Plan..." : "AI Generate Continuous Improvement Remedial Action"}
                    </button>
                  </div>
                </div>

                {/* Configuration inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Direct Attainment Weight (%)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={targetWeightDirect}
                        onChange={(e) => {
                          setTargetWeightDirect(Number(e.target.value));
                          addAuditLog(`Set Direct vs Indirect weight ratio to ${e.target.value}%`, "Calculator");
                        }}
                        className="w-full"
                      />
                      <span className="text-xs font-bold text-slate-800 font-mono w-14 text-right">{targetWeightDirect} %</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Indirect weight will automatically adjust to {100 - targetWeightDirect}%.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Marks Threshold Target Benchmark (%)</label>
                    <input 
                      type="number" 
                      min="35"
                      max="100"
                      value={globalThresholdScore}
                      onChange={(e) => {
                        setGlobalThresholdScore(Number(e.target.value));
                        addAuditLog(`Adjusted pass-marks benchmark to ${e.target.value}%`, "Calculator");
                      }}
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-gray-400">A student must score {globalThresholdScore}% or higher in exams to pass a CO limit.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Set Target Attainment Level (%)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        defaultValue="65"
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const nextTargets = { ...coTargetAttainmentPercentage };
                          Object.keys(nextTargets).forEach(k => {
                            nextTargets[k] = val;
                          });
                          setCoTargetAttainmentPercentage(nextTargets);
                          addAuditLog(`Set global Course Outcomes target success to ${val}%`, "Calculator");
                        }}
                        className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-indigo-700 cursor-pointer"
                      >
                        <option value="55">Low (55%)</option>
                        <option value="60">Medium (60%)</option>
                        <option value="65">Moderate (65%)</option>
                        <option value="70">Aggressive (70%)</option>
                      </select>
                      <div className="text-[10px] text-gray-400 self-center">Targets represent minimum students required to pass.</div>
                    </div>
                  </div>
                </div>

                {/* Score distribution input table */}
                <div className="my-6">
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-3">
                    LIVE STUDENT STATS: % OF STUDENTS PASSING CO THRESHOLD
                  </h3>
                  <div className="overflow-x-auto border border-gray-150 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="p-3 text-gray-700 font-bold w-48">Assessment Method</th>
                          <th className="p-3 text-center text-gray-500 font-semibold font-mono w-16">Weight</th>
                          <th className="p-3 text-center text-gray-500 font-semibold font-mono w-16">B.mark</th>
                          {currentCourse.cos.map(co => (
                            <th key={co.id} className="p-3 text-center text-indigo-600 font-bold font-mono">
                              {co.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentMethods.map((method) => {
                          const isDirect = method.type === "direct";
                          const actualWeight = isDirect ? method.weight : 100;
                          return (
                            <tr key={method.id} className="border-t border-gray-150 hover:bg-slate-50/40">
                              <td className="p-3">
                                <div className="font-bold text-gray-900">{method.name}</div>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  isDirect ? "bg-amber-50 text-amber-800":"bg-teal-50 text-teal-800"
                                }`}>
                                  {isDirect ? `DIRECT EXAM` : `INDIRECT SURVEY`}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono font-semibold text-gray-600">
                                {actualWeight}%
                              </td>
                              <td className="p-3 text-center font-mono text-gray-400" title="Expected percentage of students reaching target">
                                {method.attainmentBenchmarkPercentage}%
                              </td>
                              {currentCourse.cos.map(co => {
                                const currentScoreVal = studentPerformanceScores[selectedCourseId]?.[method.id]?.[co.id] ?? 60;
                                return (
                                  <td key={co.id} className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={currentScoreVal}
                                        onChange={(e) => handleScoreDistributionChange(method.id, co.id, Number(e.target.value))}
                                        className="w-14 text-center text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                                      />
                                      <span className="text-[10px] text-gray-400 font-mono">%</span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2 block font-mono">
                    * Modifying values triggers live recomputations of average direct (80%) and indirect (20%) attainments.
                  </span>
                </div>

                {/* Final calculated output */}
                <div className="mt-8 border-t border-gray-150 pt-6">
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-4">
                    CALCULATED ATTAINMENT REPORT SUMMARY CARD
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCourseAttainments.map((att) => (
                      <div 
                        key={att.coId} 
                        className={`p-4 rounded-xl border ${
                          att.isMet 
                            ? "bg-emerald-50/10 border-emerald-200" 
                            : "bg-red-50/15 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold font-mono text-slate-800">{att.coId} Attainment</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            att.isMet ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {att.isMet ? "TARGET ACHIEVED" : "GAP DETECTED"}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600 mb-3">
                          <div className="flex justify-between">
                            <span>Direct Attainment component:</span>
                            <span className="font-mono font-semibold">{att.directAttainment}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Indirect Feedback level:</span>
                            <span className="font-mono font-semibold">{att.indirectAttainment}%</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-1.5 text-gray-900 font-bold">
                            <span>Overall Calculated Attainment:</span>
                            <span className="font-mono text-indigo-700">{att.overallAttainmentPercentage}%</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Target Success threshold:</span>
                            <span className="font-mono font-semibold">{att.target}%</span>
                          </div>
                        </div>

                        {!att.isMet && (
                          <div className="text-[10px] bg-red-50 text-red-700 p-2 rounded border border-red-100">
                            <span className="font-bold">Remedy advisory:</span> Increase interactive tutorial worksheets to cover Bloom's {att.bloomsLevel} parameters.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated corrective memo if exists */}
                {ciGeneratedMemo && (
                  <div className="mt-8 p-5 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 mb-3">
                      <h4 className="font-bold text-indigo-900 font-sans text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> Dynamic Remedial Advisory Memorandum (Criterion 7)
                      </h4>
                      <button 
                        onClick={() => {
                          setCiGeneratedMemo("");
                          addAuditLog("Cleared continuous improvement preview draft", "Calculator");
                        }}
                        className="text-xs text-indigo-500 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="text-xs text-indigo-950 whitespace-pre-line leading-relaxed font-serif max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-indigo-200/50">
                      {ciGeneratedMemo}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 4: SAR REPORT BUILDER */}
          {currentTab === "sar" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left pane: criterion list selector */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">NBA SAR Criteria Chapters</h3>
                    <p className="text-[11px] text-gray-500">Select criterion chapter below to compile details manually or trigger AI compliance audits.</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-indigo-600 font-extrabold">
                      <span>Total SAR Score</span>
                      <span className="font-mono text-sm">{earnedPoints} / 1000 pts</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${readinessIndex}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-2.5 space-y-1 shadow-xs">
                    {criteria.map((item) => {
                      const isActive = item.id === activeCriterionId;
                      const ratio = item.allottedPoints / item.maxPoints;
                      
                      let badgeColor = "bg-gray-100 text-gray-500";
                      if (item.status === "completed") badgeColor = "bg-emerald-100 text-emerald-800";
                      else if (item.status === "in_progress") badgeColor = "bg-amber-100 text-amber-800";
                      else if (item.status === "under_review") badgeColor = "bg-purple-100 text-purple-800";

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveCriterionId(item.id);
                            addAuditLog(`Loaded Chapter ${item.id} details: ${item.title}`, "SAR Report");
                          }}
                          className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-start justify-between gap-3 ${
                            isActive 
                              ? "bg-slate-900 text-white shadow-xs" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`font-mono font-bold block mb-1 ${isActive ? "text-indigo-400":"text-gray-500"}`}>
                              Criterion {item.id.replace("C", "")}
                            </span>
                            <span className="font-semibold truncate block">{item.title}</span>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono block mb-1 font-bold ${
                              isActive ? "bg-white/20 text-white":"bg-gray-100 text-gray-600"
                            }`}>
                              {item.allottedPoints}/{item.maxPoints} pts
                            </span>
                            <span className={`text-[8px] px-1 rounded block uppercase font-mono ${badgeColor}`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right/Mid: editor and auditor */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Criterion edit workspace */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-indigo-600 uppercase font-bold">CHAPTER EDIT WORKSPACE</span>
                        <h3 className="font-bold text-gray-900 text-base">{activeCriterion.id}: {activeCriterion.title}</h3>
                      </div>
                      
                      {/* Editor top status controls */}
                      <div className="flex items-center gap-2">
                        <select
                          value={activeCriterion.status}
                          onChange={(e) => handleSetCriterionStatus(e.target.value as any)}
                          className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="not_started">Status: Not Started</option>
                          <option value="in_progress">Status: In Progress</option>
                          <option value="under_review">Status: Under Review</option>
                          <option value="completed">Status: Completed (Safe)</option>
                        </select>

                        <button
                          onClick={handleSaveCriterionEdit}
                          disabled={isSyncingSAR}
                          className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          {isSyncingSAR ? "Saving..." : "Save Draft"}
                        </button>
                      </div>
                    </div>

                    {/* Rich description guidance / help prompt */}
                    <div className="text-[11px] bg-slate-50 text-slate-700 p-3 rounded-lg border border-slate-100 mb-4 leading-relaxed flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Chapter Target Weight Max: {activeCriterion.maxPoints} Points. </span> 
                        Engineering colleges must substantiate active operations with verified criteria, syllabus documents, CO assessment schedules, and digital links to student directories. Formulate descriptive chapters carefully.
                      </div>
                    </div>

                    {/* Standard text area editor */}
                    <div className="flex-1">
                      <textarea
                        value={sarEditorText}
                        onChange={(e) => setSarEditorText(e.target.value)}
                        placeholder="Write standard NBA compliance narratives for this chapter..."
                        rows={12}
                        className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:bg-white focus:border-indigo-500 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Self-graded check */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>Manually allot score prediction:</span>
                        <input 
                          type="number"
                          min="0"
                          max={activeCriterion.maxPoints}
                          value={activeCriterion.allottedPoints}
                          onChange={(e) => {
                            const val = Math.min(activeCriterion.maxPoints, Number(e.target.value));
                            const updated = criteria.map(c => {
                              if (c.id === activeCriterionId) return { ...c, allottedPoints: val };
                              return c;
                            });
                            setCriteria(updated);
                          }}
                          className="w-14 text-center font-mono font-bold bg-gray-100 rounded px-1.5 py-1"
                        />
                        <span>/ {activeCriterion.maxPoints}</span>
                      </div>
                      <span className="text-[10px] font-mono">Last edited by {userRole.split(" ")[0]} today</span>
                    </div>
                  </div>

                  {/* AI Auditor integration bottom box */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
                      <Brain className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">NBA Specialist AI Auditor Panel</h4>
                        <p className="text-xs text-gray-500">Inspect draft text against national regulations and request missing file suggestions</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. Audit description to maximize Tier-1 points. Recommend specific evidence files for data structures lab..."
                          value={aiAuditorPrompt}
                          onChange={(e) => setAiAuditorPrompt(e.target.value)}
                          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                        />
                        <button
                          onClick={handleAuditActiveCriterion}
                          disabled={isAuditingSAR}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          {isAuditingSAR ? "Auditing text..." : "Audit Draft"}
                        </button>
                      </div>

                      {/* Display Audit feedback */}
                      {aiAuditorResponse && (
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <h5 className="text-xs font-bold text-indigo-900 mb-2 font-mono flex items-center gap-1.5">
                            <Check className="w-4.5 h-4.5 text-indigo-600 block" /> Specialist Agent Feedback Summary:
                          </h5>
                          <div className="text-xs text-indigo-950 font-serif leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                            {aiAuditorResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AI AGENTS HUB (EXPERT DIALOGS) */}
          {currentTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)] min-h-[480px]">
              
              {/* Agent selection sidebar left */}
              <div id="agents-selection-drawer" className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Target Specialist Agent</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Select a specialized model to align chat session context</p>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: "orchestrator", name: "Accreditation Orchestrator", role: "Master Coordinator Model", avatar: "AO" },
                      { id: "copo", name: "COPO Taxonomy Agent", role: "Bloom's taxonomy & mappings", avatar: "CO" },
                      { id: "attainment", name: "Attainment Specialist", role: "Direct/indirect surveys expert", avatar: "AT" },
                      { id: "sar", name: "SAR Chapter Advisor", role: "Criterion compliance checker", avatar: "SA" },
                      { id: "ci", name: "CIAgent (Cont. Improvement)", role: "Remedial plans & gap analyst", avatar: "CI" },
                      { id: "analytics", name: "Analytics Estimator", role: "Readiness score aggregator", avatar: "AN" },
                      { id: "validation", name: "Validation Auditor", role: "Logical matching & checks", avatar: "VA" }
                    ].map((agent) => {
                      const isActive = activeSpecialist === agent.id;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => {
                            setActiveSpecialist(agent.id);
                            addAuditLog(`Switched active dialogue specialists to ${agent.name}`, "AI Agents Hub");
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center gap-3 ${
                            isActive 
                              ? "bg-indigo-50 border border-indigo-100 text-indigo-900" 
                              : "hover:bg-slate-50 text-gray-700 border border-transparent"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isActive ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                          }`}>
                            {agent.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold block truncate text-slate-800">{agent.name}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{agent.role}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated token limit bar */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-10 transition-all text-xs">
                    <span className="font-bold text-indigo-900 block mb-1">Session Token Usage</span>
                    <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden mt-2">
                       <div className="bg-indigo-600 h-full rounded-full" style={{ width: "45.2%" }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono">
                      <span>45.2k tokens used</span>
                      <span>Max limit: 100k</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat view right */}
              <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                
                {/* Chat window active head */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {activeSpecialist.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        NBA Specialist: {activeSpecialist.charAt(0).toUpperCase() + activeSpecialist.slice(1)} Agent
                      </h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <span className="inline-block w-2-h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                        Model: gemini-3.5-flash (Online with live course context)
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setMessages([]);
                      addAuditLog("Cleared current AI chat dialog session history", "AI Agents Hub");
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                {/* Messages scroll box */}
                <div id="chat-messages-container" className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                  {messages.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={m.id} className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 uppercase ${
                          isUser ? "bg-slate-800 text-white" : "bg-indigo-600 text-white"
                        }`}>
                          {isUser ? "ME" : m.agentType?.substring(0,2) || "AI"}
                        </div>

                        <div className={`rounded-2xl p-4 text-xs leading-relaxed max-w-full md:max-w-xl transition-all shadow-2xs ${
                          isUser 
                            ? "bg-slate-900 text-white rounded-tr-none font-medium" 
                            : "bg-white border border-gray-150 text-gray-800 rounded-tl-none"
                        }`}>
                          {/* Display role prefix for rich context responses */}
                          {!isUser && m.agentType && (
                            <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-600 uppercase block mb-1.5 opacity-80">
                              [{m.agentType.replace("_", " ")} validation response]
                            </span>
                          )}
                          <div className="whitespace-pre-line font-medium leading-relaxed font-sans">{m.content}</div>
                          <span className={`text-[9px] font-mono block mt-2.5 opacity-60 text-right ${
                            isUser ? "text-slate-300" : "text-gray-400"
                          }`}>
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing animation block */}
                  {isAiResponding && (
                    <div className="flex gap-3 max-w-xl mr-auto">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                        AI
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 text-xs text-gray-500 shadow-2xs">
                        <span className="font-mono text-[10px] text-gray-400 block mb-1">Agent is processing alignment logic...</span>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Floating help advice */}
                <div className="px-4 py-2 bg-indigo-50 border-t border-gray-150 text-[10.5px] text-indigo-800 flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate font-medium">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600" />
                    <strong>Compliance Prompt Tip:</strong> Ask the "validation" agent to confirm average mappings matching Bloom's parameters.
                  </span>
                  <span className="text-indigo-400 hidden sm:inline text-right shrink-0">Supports Markdown outputs & tables</span>
                </div>

                {/* Message input footer form */}
                <form onSubmit={handleSendChatMessage} className="p-4 bg-gray-50 border-t border-gray-150 flex gap-3">
                  <input 
                    type="text"
                    required
                    placeholder={`Query ${activeSpecialist} specialist about ${currentCourse.code} metrics...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    Send Message <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* TAB 6: SYSTEM SETTINGS AND CONFIGURATIONS */}
          {currentTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="font-bold text-gray-900 text-base">Accreditation Setting Configuration Dashboard</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Define core university weights, evaluation models, user permissions, and clear session mock data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                  
                  {/* Global parameters card */}
                  <div className="p-4 border border-gray-150 rounded-xl space-y-4">
                    <h3 className="text-xs font-mono font-bold text-indigo-700 flex items-center gap-1 uppercase">
                      <Sliders className="w-4 h-4 text-indigo-500" /> Institutional Calculation Rules
                    </h3>
                    
                    <div className="space-y-3.5 pt-2">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Mapping Correlation Matrix scale maximum</label>
                        <select 
                          value={correlationMappingScale}
                          onChange={(e) => {
                            setCorrelationMappingScale(Number(e.target.value));
                            addAuditLog(`Set max mapping correlation scale to ${e.target.value}`, "System Settings");
                          }}
                          className="w-full text-xs bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-2 font-bold cursor-pointer outline-none"
                        >
                          <option value="3">3-Level Scale (1-Slight, 2-Moderate, 3-Substantial) - Standard</option>
                          <option value="4">4-Level Scale (includes 4-Advanced Exception)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Default Campus Target Level (%)</label>
                        <input 
                          type="number"
                          value={coTargetAttainmentPercentage["CO1"]}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const next = { ...coTargetAttainmentPercentage };
                            Object.keys(next).forEach(k => {
                              next[k] = val;
                            });
                            setCoTargetAttainmentPercentage(next);
                            addAuditLog(`Set active CO benchmark target to ${val}%`, "System Settings");
                          }}
                          className="w-full text-xs bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-2 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-400 block pt-1.5 leading-relaxed">
                          * Changes propagate immediately to dashboards. Attainment calculators automatically evaluate targets using updated weights.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Administration & Reset Action panel */}
                  <div className="p-4 border border-gray-150 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-red-650 flex items-center gap-1.5 uppercase">
                        <AlertCircle className="w-4 h-4 text-red-500 block" /> Danger Zone Actions
                      </h3>
                      <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                        To test different university setups, add custom course outcomes or delete mappings, you can safely trigger a complete system parameters reload. This resets all metrics back to certified computer science syllabus levels.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <button
                        onClick={handleReloadDefaultMock}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        Reset Mock Alignments
                      </button>
                      <span className="text-[10px] text-gray-400">Restores pre-populated Data Structures & DBMS alignments.</span>
                    </div>
                  </div>

                </div>

                {/* Complete audit log records view */}
                <div className="mt-8 border-t border-gray-150 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                      <Activity className="w-4.5 h-4.5 text-indigo-500" /> Active Session Transaction audit logs
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">Live telemetry matched</span>
                  </div>

                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-2.5 text-xs text-gray-500 font-bold grid grid-cols-12 gap-2 border-b border-gray-200">
                      <div className="col-span-2">Timestamp</div>
                      <div className="col-span-2">User</div>
                      <div className="col-span-2">Module</div>
                      <div className="col-span-6">Action description</div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-2.5 text-xs grid grid-cols-12 gap-2 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-2 text-gray-400 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="col-span-2 font-bold text-slate-700 truncate">{log.user}</div>
                          <div className="col-span-2">
                            <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-[10px] text-slate-600 block text-center truncate">
                              {log.module}
                            </span>
                          </div>
                          <div className="col-span-6 text-gray-800 font-medium">{log.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>

        {/* Global Footer bar specifying precise rules matches */}
        <footer id="global-system-footer" className="h-10 border-t border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 z-10 text-[10px] text-gray-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2-h-2 bg-indigo-500 rounded-full animate-ping"></span>
            <span>Accreditation Window Status: Active Compilation</span>
          </div>
          <div>
            <span>NBA Tier-1 Compliance Platform • Prof John Doe • UTC 2026</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
