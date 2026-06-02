export interface CourseOutcome {
  id: string; // e.g., 'CO1'
  text: string;
  bloomsLevel: string; // e.g., 'Apply (K3)'
}

export interface ProgramOutcome {
  id: string; // PO1 to PO12
  text: string;
  shortTitle: string;
}

export interface COPOMapping {
  coId: string;
  poId: string;
  value: number; // 0, 1, 2, 3
  rationale?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  semester: string;
  academicYear: string;
  cos: CourseOutcome[];
  mappings: COPOMapping[];
}

export interface AssessmentMethod {
  id: string;
  name: string; // e.g., 'Internal Test 1', 'End Sem Exam', 'Course Exit Survey'
  type: "direct" | "indirect";
  weight: number; // percentage (e.g. 20, 60)
  targetPercentage: number; // e.g., 50% marks represents attainment benchmark
  attainmentBenchmarkPercentage: number; // percentage of students who should achieve target (e.g., 60%)
}

export interface ComponentAttainment {
  assessmentId: string;
  coScores: { [coId: string]: number }; // percentage of students scoring above target for each CO
}

export interface SARCriterion {
  id: string; // e.g. "C1", "C2" etc.
  title: string;
  maxPoints: number;
  allottedPoints: number;
  status: "not_started" | "in_progress" | "completed" | "under_review";
  editorContent: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  agentType?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  module: string;
}
