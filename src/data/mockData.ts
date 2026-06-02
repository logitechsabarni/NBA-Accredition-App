import { Course, ProgramOutcome, SARCriterion, AuditLog, AssessmentMethod } from "../types";

export const NBA_PO_LIST: ProgramOutcome[] = [
  { id: "PO1", shortTitle: "Engineering Knowledge", text: "Apply knowledge of mathematics, science, engineering fundamentals, and engineering specialization to the solution of complex engineering problems." },
  { id: "PO2", shortTitle: "Problem Analysis", text: "Identify, formulate, research literature, and analyze complex engineering problems reaching substantiated conclusions." },
  { id: "PO3", shortTitle: "Design & Development", text: "Design solutions for complex engineering problems and design system components or processes that meet specified needs with appropriate consideration." },
  { id: "PO4", shortTitle: "Investigations", text: "Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of information." },
  { id: "PO5", shortTitle: "Modern Tool Usage", text: "Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling." },
  { id: "PO6", shortTitle: "Engineer and Society", text: "Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal, and cultural issues." },
  { id: "PO7", shortTitle: "Environment & Sustainability", text: "Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate knowledge of sustainable development." },
  { id: "PO8", shortTitle: "Ethics", text: "Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice." },
  { id: "PO9", shortTitle: "Individual & Team Work", text: "Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings." },
  { id: "PO10", shortTitle: "Communication", text: "Communicate effectively on complex engineering activities with the engineering community and with society at large." },
  { id: "PO11", shortTitle: "Project Mgmt & Finance", text: "Demonstrate knowledge and understanding of engineering and management principles and apply these to one's own work." },
  { id: "PO12", shortTitle: "Life-long Learning", text: "Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change." }
];

export const INITIAL_CO_TEMPLATES = [
  { id: "CO1", text: "Demonstrate simple computational complexity analysis and identify sorting algorithm tradeoffs.", bloomsLevel: "Understand (K2)" },
  { id: "CO2", text: "Implement classic linear data structures (stacks, queues, linked lists) for memory-efficient usage.", bloomsLevel: "Apply (K3)" },
  { id: "CO3", text: "Solve routing and connectivity problems using standard non-linear tree and graph traversals.", bloomsLevel: "Apply (K3)" },
  { id: "CO4", text: "Analyze and implement hashing functions and collision resolution strategies.", bloomsLevel: "Analyze (K4)" },
  { id: "CO5", text: "Design and implement custom dynamic memory allocations and heap structures.", bloomsLevel: "Create (K6)" },
  { id: "CO6", text: "Evaluate alternative data storage layouts under specific timing and resource bounds.", bloomsLevel: "Evaluate (K5)" }
];

export const INITIAL_CO_DBMS_TEMPLATES = [
  { id: "CO1", text: "Explain traditional file system limitations and illustrate core Relational Model concepts.", bloomsLevel: "Understand (K2)" },
  { id: "CO2", text: "Write standard Relational Algebra expressions and SQL queries for critical enterprise databases.", bloomsLevel: "Apply (K3)" },
  { id: "CO3", text: "Apply 1NF, 2NF, 3NF, and BCNF normalization algorithms to mitigate database anomalies.", bloomsLevel: "Analyze (K4)" },
  { id: "CO4", text: "Describe concurrency schedules, locking theories, and robust ACID transaction profiles.", bloomsLevel: "Understand (K2)" },
  { id: "CO5", text: "Implement custom physical indexing (B+ trees) and evaluate query plan response times.", bloomsLevel: "Create (K6)" },
  { id: "CO6", text: "Evaluate security configurations and integrate database layers with custom full-stack solutions.", bloomsLevel: "Evaluate (K5)" }
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: "cs301",
    code: "CS301",
    name: "Data Structures & Algorithms",
    description: "Fundamental concepts of data structuring, complexity modeling, recursive algorithms, list manipulation, trees, binary heaps, search graphs, and hash indexing.",
    department: "Computer Science",
    semester: "Semester III",
    academicYear: "2025-2026",
    cos: INITIAL_CO_TEMPLATES,
    mappings: [
      { coId: "CO1", poId: "PO1", value: 3, rationale: "Basic computing theory relies heavily on fundamental science." },
      { coId: "CO1", poId: "PO2", value: 2, rationale: "Assessing algorithm tradeoffs requires formulating problem parameters." },
      { coId: "CO2", poId: "PO1", value: 3, rationale: "Memory configurations trace directly to concrete hardware concepts." },
      { coId: "CO2", poId: "PO3", value: 2, rationale: "Designing linear nodes maps to discrete program developments." },
      { coId: "CO3", poId: "PO1", value: 3 },
      { coId: "CO3", poId: "PO3", value: 3 },
      { coId: "CO3", poId: "PO4", value: 2 },
      { coId: "CO4", poId: "PO2", value: 3 },
      { coId: "CO4", poId: "PO5", value: 2, rationale: "Using IDE profilers represents modern tool usage in optimization." },
      { coId: "CO5", poId: "PO3", value: 3 },
      { coId: "CO5", poId: "PO12", value: 2, rationale: "Structuring custom buffers sparks persistent independent learning." },
      { coId: "CO6", poId: "PO2", value: 2 },
      { coId: "CO6", poId: "PO4", value: 3 }
    ]
  },
  {
    id: "cs302",
    code: "CS302",
    name: "Database Management Systems",
    description: "Database models, relational algebra structure, normal forms, transaction schemas, concurrent access safety, physical indexing strategies, and database API integrations.",
    department: "Computer Science",
    semester: "Semester IV",
    academicYear: "2025-2026",
    cos: INITIAL_CO_DBMS_TEMPLATES,
    mappings: [
      { coId: "CO1", poId: "PO1", value: 2 },
      { coId: "CO2", poId: "PO3", value: 3, rationale: "SQL implementation is the prime artifact for data structures." },
      { coId: "CO3", poId: "PO2", value: 3, rationale: "Normalization targets redundancy anomalies through rigorous analysis." },
      { coId: "CO4", poId: "PO1", value: 2 },
      { coId: "CO5", poId: "PO5", value: 3, rationale: "RDBMS indexes represent deep practical software tool setups." },
      { coId: "CO6", poId: "PO11", value: 1, rationale: "Secure DB permissions relate to project compliance metrics." }
    ]
  },
  {
    id: "cs303",
    code: "CS303",
    name: "Computer Networks",
    description: "Architecture of packet-switching systems, ISO-OSI layers, routing protocols (OSPF, BGP), transport safety (TCP flow controls, TCP congestion), and network security layouts.",
    department: "Computer Science",
    semester: "Semester V",
    academicYear: "2025-2026",
    cos: [
      { id: "CO1", text: "Explain physical-link and framing abstractions across networks.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Apply subnet structures to balance address limits.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Implement client-server network socket codes.", bloomsLevel: "Apply (K3)" },
      { id: "CO4", text: "Evaluate packet-routing algorithm performance benchmarks.", bloomsLevel: "Evaluate (K5)" }
    ],
    mappings: [
      { coId: "CO1", poId: "PO1", value: 2 },
      { coId: "CO2", poId: "PO2", value: 3 },
      { coId: "CO3", poId: "PO3", value: 3 },
      { coId: "CO4", poId: "PO4", value: 2 }
    ]
  },
  {
    id: "ec301",
    code: "EC301",
    name: "Digital Signal Processing",
    description: "Discrete-time signals and systems, DFT/FFT structures, implementation of FIR and IIR digital filters, and finite word-length execution limitations.",
    department: "Electronics",
    semester: "Semester V",
    academicYear: "2025-2026",
    cos: [
      { id: "CO1", text: "Describe mathematical models of continuous and discrete-time signals.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Compute Fast Fourier Transforms (FFT) for computationally efficient filtering.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Design finite impulse response (FIR) Filters fitting specific frequency bands.", bloomsLevel: "Create (K6)" },
      { id: "CO4", text: "Analyze quantization noise and error-bound coefficients in digital filter systems.", bloomsLevel: "Analyze (K4)" }
    ],
    mappings: [
      { coId: "CO1", poId: "PO1", value: 3 },
      { coId: "CO2", poId: "PO2", value: 2 },
      { coId: "CO3", poId: "PO3", value: 3 },
      { coId: "CO4", poId: "PO4", value: 2 }
    ]
  },
  {
    id: "ec302",
    code: "EC302",
    name: "Microprocessors & Microcontrollers",
    description: "Hardware microarchitecture of 8086/8051 families, instruction memory maps, assembly language development, and interrupt-driven peripheral interfacing.",
    department: "Electronics",
    semester: "Semester VI",
    academicYear: "2025-2026",
    cos: [
      { id: "CO1", text: "Illustrate microarchitecture components of 16-bit processor buses.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Develop modular assembly programs to perform hardware multiplication.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Design real-time interrupt handlers for ADC converter chips.", bloomsLevel: "Create (K6)" },
      { id: "CO4", text: "Formulate peripheral device communication lines (SPI/I2C controls).", bloomsLevel: "Analyze (K4)" }
    ],
    mappings: [
      { coId: "CO1", poId: "PO1", value: 2 },
      { coId: "CO2", poId: "PO3", value: 2 },
      { coId: "CO3", poId: "PO3", value: 3 },
      { coId: "CO4", poId: "PO5", value: 3 }
    ]
  },
  {
    id: "it301",
    code: "IT301",
    name: "Web Programming & Cloud Technologies",
    description: "Modern JavaScript frameworks, microservice API design, HTTP protocols, virtual container deployment, and serverless computing workflows.",
    department: "Information Tech",
    semester: "Semester V",
    academicYear: "2025-2026",
    cos: [
      { id: "CO1", text: "Explain core virtual system types and scalable cloud paradigms.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Construct reactive multi-view client-side user interfaces.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Build secure RESTful backends integrated with database storage drivers.", bloomsLevel: "Create (K6)" },
      { id: "CO4", text: "Deploy clustered server images with automatic horizontal load balancing.", bloomsLevel: "Apply (K3)" }
    ],
    mappings: [
      { coId: "CO1", poId: "PO1", value: 2 },
      { coId: "CO2", poId: "PO3", value: 3 },
      { coId: "CO3", poId: "PO3", value: 3 },
      { coId: "CO4", poId: "PO5", value: 3 }
    ]
  },
  {
    id: "it302",
    code: "IT302",
    name: "Cryptography & Network Security",
    description: "Classical stream ciphers, public-private key infrastructure (RSA, Elliptic Curves), cryptographic secure hashes, and authentication handshakes.",
    department: "Information Tech",
    semester: "Semester VI",
    academicYear: "2025-2026",
    cos: [
      { id: "CO1", text: "Explain mathematical number theory fundamentals backing modular cryptography.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Implement asymmetric key exchanges safeguarding message channels.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Evaluate cipher security strength against passive eavesdropping.", bloomsLevel: "Evaluate (K5)" },
      { id: "CO4", text: "Incorporate SSL certificate chains into client-server handshakes.", bloomsLevel: "Create (K6)" }
    ],
    mappings: [
      { coId: "CO1", poId: "PO1", value: 3 },
      { coId: "CO2", poId: "PO3", value: 2 },
      { coId: "CO3", poId: "PO2", value: 2 },
      { coId: "CO4", poId: "PO8", value: 2 }
    ]
  }
];

export const INITIAL_ASSESSMENT_METHODS: AssessmentMethod[] = [
  { id: "test1", name: "Internal Test I (Direct)", type: "direct", weight: 20, targetPercentage: 50, attainmentBenchmarkPercentage: 60 },
  { id: "test2", name: "Internal Test II (Direct)", type: "direct", weight: 20, targetPercentage: 50, attainmentBenchmarkPercentage: 60 },
  { id: "endsem", name: "End Semester Exam (Direct)", type: "direct", weight: 50, targetPercentage: 50, attainmentBenchmarkPercentage: 65 },
  { id: "assignments", name: "Assignments & Quiz (Direct)", type: "direct", weight: 10, targetPercentage: 60, attainmentBenchmarkPercentage: 70 },
  { id: "exitsurvey", name: "Course Exit Survey (Indirect)", type: "indirect", weight: 100, targetPercentage: 70, attainmentBenchmarkPercentage: 80 }
];

export const INITIAL_CRITERIA_LIST: SARCriterion[] = [
  {
    id: "C1",
    title: "Program Curriculum & Teaching-Learning Processes",
    maxPoints: 120,
    allottedPoints: 95,
    status: "completed",
    editorContent: `<h3>1.1. State the Vision and Mission of the Department</h3><p>The vision and mission are fully aligned with the central institute goals. Interactive discussions are held annually.</p><h3>1.2. Program Curriculum Structure</h3><p>Includes a list of Core Course modules, elective groupings, and continuous lab tutorials. Minimum core percentage complies with AICTE regulations.</p>`
  },
  {
    id: "C2",
    title: "Program Outcomes & Course Outcomes (CO-PO Mapping)",
    maxPoints: 100,
    allottedPoints: 72,
    status: "in_progress",
    editorContent: `<h3>2.1. Define Course Outcomes (COs)</h3><p>Each course outlines 4-6 COs incorporating Bloom's Taxonomy keywords.</p><h3>2.2. CO-PO Attainment Calculation Rules</h3><p>Direct exams hold 80% weight, surveys hold 20% weight. Currently configuring real-time analysis modules.</p>`
  },
  {
    id: "C3",
    title: "Effective Implementation & Faculty Contributions",
    maxPoints: 120,
    allottedPoints: 85,
    status: "in_progress",
    editorContent: `<h3>3.1. Pedagogical Initiatives</h3><p>Flipped classrooms, group project templates, and GitHub uploads represent modern pedagogical enhancements.</p>`
  },
  {
    id: "C4",
    title: "Students' Performance",
    maxPoints: 150,
    allottedPoints: 104,
    status: "under_review",
    editorContent: `<h3>4.1. Average Graduation Rate</h3><p>Steady graduation levels of 88% over the past three cycles.</p><h3>4.2. Academic Success Ratios</h3><p>Tracked per semester using automated grading trackers.</p>`
  },
  {
    id: "C5",
    title: "Faculty Information and Contribution",
    maxPoints: 200,
    allottedPoints: 148,
    status: "completed",
    editorContent: `<h3>5.1. Student-Faculty Ratio (SFR)</h3><p>Current SFR is maintained at 1:15, meeting tier-1 requirements perfectly.</p>`
  },
  {
    id: "C6",
    title: "Facilities and Technical Support",
    maxPoints: 80,
    allottedPoints: 62,
    status: "completed",
    editorContent: `<h3>6.1. Technical Laboratories</h3><p>All laboratories are equipped with latest digital servers and dual-boot terminals.</p>`
  },
  {
    id: "C7",
    title: "Continuous Improvement",
    maxPoints: 50,
    allottedPoints: 34,
    status: "in_progress",
    editorContent: `<h3>7.1. Program Indirect Outcomes Improvement</h3><p>Action plans are implemented for courses demonstrating high attainment gaps.</p><h3>7.2. Gap Analysis and Academic Mitigation Plans</h3><p>[AI Suggestions to be inserted here]</p>`
  },
  {
    id: "C8",
    title: "First Year Academics",
    maxPoints: 50,
    allottedPoints: 39,
    status: "completed",
    editorContent: `<h3>8.1. First year student success program</h3><p>Specialized bridge courses in Mathematics and Coding are conducted.</p>`
  },
  {
    id: "C9",
    title: "Student Support Systems",
    maxPoints: 50,
    allottedPoints: 41,
    status: "completed",
    editorContent: `<h3>9.1. Mentoring Programs</h3><p>Every student is assigned an academic advisor meeting twice a segment.</p>`
  },
  {
    id: "C10",
    title: "Governance, Institutional Support & Finance",
    maxPoints: 120,
    allottedPoints: 92,
    status: "under_review",
    editorContent: `<h3>10.1. Decentralization</h3><p>The department enjoys custom budget flexibility to purchase computing clusters.</p>`
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "L1", user: "HOD CSE", role: "Admin", action: "Approved CO-PO Mappings for Database Systems", timestamp: "2026-06-02T04:10:00Z", module: "CO-PO Matrix" },
  { id: "L2", user: "Dr. Rachel Green", role: "Faculty", action: "Submitted Final Student Assessment Marks for DS", timestamp: "2026-06-02T03:45:00Z", module: "Calculator" },
  { id: "L3", user: "Assoc. Prof. Smith", role: "Accreditation Coordinator", action: "Updated draft content for Criteria 7 (Continuous Improvement)", timestamp: "2026-06-02T02:15:00Z", module: "SAR Report" },
  { id: "L4", user: "External Auditor", role: "Auditor", action: "Reviewed mapping consistencies", timestamp: "2026-06-01T15:30:00Z", module: "Validation" }
];
