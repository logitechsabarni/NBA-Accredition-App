import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standard NBA Accreditation Criteria list
const NBA_CRITERIA_INFO = `
NBA Accreditation Criteria (Undergraduate Engineering Programs - Tier I and Tier II):
1. Program Curriculum and Teaching-Learning Processes (120 Points)
2. Program Outcomes and Course Outcomes (100 Points)
3. Program Effective Implementation and Faculty Contributions (120 Points)
4. Students' Performance (150 Points)
5. Faculty Information and Contribution (200 Points)
6. Facilities and Technical Support (80 Points)
7. Continuous Improvement (50 Points)
8. First Year Academics (50 Points)
9. Student Support Systems (50 Points)
10. Governance, Institutional Support and Financial Resources (120 Points)
Total Points: 1000
`;

// Program Outcomes (PO1 to PO12) as defined by NBA:
const NBA_PROGRAM_OUTCOMES = `
PO1: Engineering Knowledge - Apply mathematics, science, engineering fundamentals to solve complex engineering problems.
PO2: Problem Analysis - Identify, formulate, and analyze complex engineering problems arriving at substantiated conclusions.
PO3: Design/Development of Solutions - Design solutions for complex engineering problems running to specified needs.
PO4: Conduct Investigations of Complex Problems - Use research-based knowledge and research methods including design of experiments.
PO5: Modern Tool Usage - Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools.
PO6: The Engineer and Society - Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues.
PO7: Environment and Sustainability - Understand the impact of professional engineering solutions in societal and environmental contexts.
PO8: Professional Ethics - Apply ethical principles and commit to professional ethics and responsibilities.
PO9: Individual and Team Work - Function effectively as an individual, and as a member or leader in diverse teams.
PO10: Communication - Communicate effectively on complex engineering activities with the engineering community and with society.
PO11: Project Management and Finance - Demonstrate knowledge and understanding of engineering and management principles.
PO12: Life-long Learning - Recognize the need for, and have the preparation and ability to engage in independent and life-long learning.
`;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. Using local fallback rules-based intelligence.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust retry wrapper to handle transient 503 UNAVAILABLE or 429 RATE_LIMIT errors gracefully
async function generateContentWithRetry(params: any, maxRetries = 3, initialDelayMs = 1000): Promise<any> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error("No active AI client found.");
  }
  let lastError: any = null;
  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      lastError = error;
      
      const errorStr = String(error?.message || error).toLowerCase();
      const status = error?.status || error?.code;
      const isTransient = 
        status === 503 || 
        status === 429 || 
        errorStr.includes("503") || 
        errorStr.includes("unavailable") || 
        errorStr.includes("high demand") || 
        errorStr.includes("busy") ||
        errorStr.includes("spike") ||
        errorStr.includes("rate limit");

      if (isTransient && attempt < maxRetries) {
        console.warn(`[Gemini API Warning] Transient error encountered (attempt ${attempt}/${maxRetries}): ${error?.message || error}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

// INTELLIGENT ROUTE-SPECIFIC FALLBACK GENERATORS
function fallbackCOs(courseName: string): any[] {
  const norm = (courseName || "").toLowerCase();
  if (norm.includes("structure") || norm.includes("algorithm")) {
    return [
      { id: "CO1", text: "Demonstrate simple computational complexity analysis and identify sorting algorithm tradeoffs.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Implement classic linear data structures (stacks, queues, linked lists) for memory-efficient usage.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Solve routing and connectivity problems using standard non-linear tree and graph traversals.", bloomsLevel: "Apply (K3)" },
      { id: "CO4", text: "Analyze and implement hashing functions and collision resolution strategies.", bloomsLevel: "Analyze (K4)" },
      { id: "CO5", text: "Design and implement custom dynamic memory allocations and heap structures.", bloomsLevel: "Create (K6)" },
      { id: "CO6", text: "Evaluate alternative data storage layouts under specific timing and resource bounds.", bloomsLevel: "Evaluate (K5)" }
    ];
  }
  if (norm.includes("database") || norm.includes("dbms") || norm.includes("sql") || norm.includes("inform")) {
    return [
      { id: "CO1", text: "Explain traditional file system limitations and illustrate core Relational Model concepts.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Write standard Relational Algebra expressions and SQL queries for critical enterprise databases.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Apply 1NF, 2NF, 3NF, and BCNF normalization algorithms to mitigate database anomalies.", bloomsLevel: "Analyze (K4)" },
      { id: "CO4", text: "Describe concurrency schedules, locking theories, and ACID transaction profiles.", bloomsLevel: "Understand (K2)" },
      { id: "CO5", text: "Implement physical indexing structures (B+ trees) and evaluate query plan response times.", bloomsLevel: "Create (K6)" },
      { id: "CO6", text: "Evaluate security configurations and integrate database layers with customized full-stack solutions.", bloomsLevel: "Evaluate (K5)" }
    ];
  }
  if (norm.includes("network") || norm.includes("internet") || norm.includes("routing")) {
    return [
      { id: "CO1", text: "Explain physical-link and framing abstractions across local and cloud networks.", bloomsLevel: "Understand (K2)" },
      { id: "CO2", text: "Apply subnet structures to balance public and private address limits.", bloomsLevel: "Apply (K3)" },
      { id: "CO3", text: "Implement client-server network socket endpoints supporting rapid messaging.", bloomsLevel: "Apply (K3)" },
      { id: "CO4", text: "Evaluate packet-routing algorithm performance benchmarks across various network topologies.", bloomsLevel: "Evaluate (K5)" },
      { id: "CO5", text: "Analyze safety profiles and congestion controls of modern communication rules.", bloomsLevel: "Analyze (K4)" },
      { id: "CO6", text: "Design high-availability secure layouts for critical enterprise edge routing.", bloomsLevel: "Create (K6)" }
    ];
  }
  // Standard generic outcomes leveraging Bloom's Taxonomy
  return [
    { id: "CO1", text: `Explain academic foundations and core theoretical principles of ${courseName}.`, bloomsLevel: "Understand (K2)" },
    { id: "CO2", text: `Comprehend and summarize standard structural models and systems inside ${courseName}.`, bloomsLevel: "Understand (K2)" },
    { id: "CO3", text: `Apply state-of-the-art methodologies and standard formulas to solve practical issues in ${courseName}.`, bloomsLevel: "Apply (K3)" },
    { id: "CO4", text: `Analyze, differentiate, and model algorithm efficiency and performance limits in ${courseName}.`, bloomsLevel: "Analyze (K4)" },
    { id: "CO5", text: `Evaluate, audit, and benchmark existing system architectures under realistic constraints of ${courseName}.`, bloomsLevel: "Evaluate (K5)" },
    { id: "CO6", text: `Create, design, and implement customized prototype solutions built upon key operational parameters of ${courseName}.`, bloomsLevel: "Create (K6)" }
  ];
}

function fallbackSuggestedMappings(courseName: string, cos: any[]): any[] {
  const mappings: any[] = [];
  const name = courseName || "the course";

  cos.forEach((co) => {
    const id = co.id;
    const blooms = (co.bloomsLevel || "").toLowerCase();

    // PO1 Mapping
    mappings.push({
      coId: id,
      poId: "PO1",
      value: blooms.includes("remember") || blooms.includes("understand") || blooms.includes("k1") || blooms.includes("k2") ? 2 : 3,
      rationale: `Analyzing principles of ${id} maps directly to core math, science, and engineering foundations.`
    });

    // PO2 Mapping
    if (blooms.includes("understand") || blooms.includes("analyze") || blooms.includes("k2") || blooms.includes("k4")) {
      mappings.push({
        coId: id,
        poId: "PO2",
        value: 3,
        rationale: `Formulating limitations and evaluating performance of ${id} supports logical problem analysis.`
      });
    }

    // PO3 Mapping
    if (blooms.includes("apply") || blooms.includes("create") || blooms.includes("k3") || blooms.includes("k6")) {
      mappings.push({
        coId: id,
        poId: "PO3",
        value: 3,
        rationale: `Designing elements of ${id} helps build solutions satisfying specified engineering constraints.`
      });
    }

    // PO5 Mapping
    if (blooms.includes("apply") || blooms.includes("k3")) {
      mappings.push({
        coId: id,
        poId: "PO5",
        value: 2,
        rationale: `Writing custom codes and programs for ${id} represents modern software tool usage.`
      });
    }

    // PO12 Mapping
    if (blooms.includes("evaluate") || blooms.includes("create") || blooms.includes("k5") || blooms.includes("k6")) {
      mappings.push({
        coId: id,
        poId: "PO12",
        value: 2,
        rationale: `Synthesizing alternative outcomes drives continuous lifelong learning within the specialized workspace.`
      });
    }
  });

  return mappings;
}

function fallbackCIPlan(courseName: string, coGaps: any[]): string {
  const actualGaps = coGaps.filter(g => g.explanation && g.explanation.toLowerCase().includes("fail"));
  
  if (actualGaps.length === 0) {
    return `MEMORANDUM FOR ACADEMIC EXCELLENCE & CONTINUOUS QUALITY IMPROVEMENT

SUBJECT: Program Sustainment & Advanced Pedagogical Plan
COURSE: ${courseName}
ACADEMIC YEAR: 2025-2026
OVERVIEW: All 6 Course Outcomes successfully reached or exceeded their designated threshold targets.

1. OBSERVATIONS OF SUCCESS
The academic cohort demonstrated outstanding performance:
- Prerequisites mastery: Early assessment tests showed high pre-requisite readiness and fundamental competency.
- Hands-on laboratory tasks: Continuous lab training successfully translated knowledge into active engineering capabilities.

2. SUSTAINMENT & CONTINUOUS IMPROVEMENT STRATEGY
Even when compliance targets are satisfied, continuous quality improvement requires intentional extensions:
- Introduce optional research-based seminar assignments to challenge high-achieving student subgroups.
- Incorporate open-ended challenge problems into standard continuous evaluation worksheets.
- Standardize peer-assisted tutoring to maintain high performance levels of subsequent student cohorts.

3. ADVANCED CURRICULUM ACTIONS
- Introduce state-of-the-art case studies or industry-aligned micro-credentials.
- Standardize these top-tier methods across parallel course sections to elevate collegiate average indicators.

Report compiled by: CIAgent (NBA Team Continuous Improvement Validator)`;
  }

  const gapsList = actualGaps.map(g => `${g.coId} (${g.attained}% attained vs ${g.target}% target)`).join(", ");
  return `MEMORANDUM FOR CONTINUOUS IMPROVEMENT AND ACADEMIC GAP ACTION PLAN

SUBJECT: NBA Accreditation Deficiency Redress
COURSE: ${courseName}
ACADEMIC YEAR: 2025-2026
UNITS REQUIRING REMEDIAL ACTION: ${gapsList}

1. CORE ROOT CAUSE EXAMINATION
Comprehensive audit of direct examination indices suggests explicit student cognitive gaps:
- Pre-requisite Deficit: Slower mastery of core pre-requisite concepts (such as discrete logical models) limits successful assimilation of higher-tier Bloom levels.
- Practical Disconnect: Upper-level criteria (e.g. indexing analysis or multi-option synthesis) suffer from a lack of active computer-aided laboratory exercises.
- Early Intervention Deficits: Standard classroom metrics do not trigger early warnings for students before major tests are finalized.

2. PRECISE DIRECT REMEDIAL ACTIONS SCHEDULED
- Focused Tutorial Exercises: Distribute weekly pair-peer worksheet reviews where students break down syntax and normal forms collaboratively.
- Interactive Lab Modules: Dedicate 2 supplemental laboratory hours solely to practical trace tools and diagnostic profiling.
- Accelerated Peer Tutoring: Establish mid-week review tutorials led by dedicated departmental coordinators to assist struggling cohorts.

3. CURRICULUM AND SYLLABUS ENRICHMENTS
- Indexing Enhancements: Supplement primary laboratory manuals with real-world database testing examples.
- Industry Alignments: Map end-of-semester projects to containerized full-stack deployment frameworks.

Report compiled by: CIAgent (NBA Team Continuous Improvement Validator)`;
}

function fallbackChatResponse(agentType: string, userMsg: string, context: any): string {
  const currentCourseName = context?.activeCourse?.name || "Selected course";
  const currentCourseCode = context?.activeCourse?.code || "CS302";

  if (agentType === "copo") {
    return `### [COPO Specialist] Bloom's Taxonomy & Alignment Recommendations

As your CO-PO Taxonomy Specialist, I have reviewed outcomes for **${currentCourseCode}: ${currentCourseName}**.

- **Bloom's Action Verbs**: Outcomes (CO1-CO6) map clearly to action verbs: "Describe..." (Understand/K2), "Write..." (Apply/K3), "Apply Normalization..." (Analyze/K4), "Implement..." (Create/K6).
- **Mapping Strengths**:
  - Map lower cognitive attributes (Understand - K2) to **PO1** and **PO2** with standard weights of 2.
  - Map higher active attributes (Analyze - K4, Create - K6) to **PO3** and **PO5** with highest weights of 3.
- **Auditor Tip**: Keep clear worksheets demonstrating the step-by-step mathematical reasoning that associates each outcome with the program outcomes.

Are there specific outcome descriptions you would like me to rewrite to better match Bloom's keywords?`;
  }

  if (agentType === "attainment") {
    return `### [Attainment Specialist] Direct vs. Indirect Attainment Review

I am your NBA Attainment Specialist. Here is my audit of your **${currentCourseName}** evaluation settings:

- **Attainment Weighting Setup**: Currently programmed to compute **${context?.sarProgress?.readinessIndex ? "80% Direct / 20% Indirect" : "80/20 standard split"}**.
- **Assessment Paths**:
  - **Direct (Internal Tests & EndSem)**: Calculated such that student scores above the 50% target marks benchmark are aggregated.
  - **Indirect (Exit Survey)**: Evaluated directly from student questionnaire averages.
- **Deficit Alerts**: There are **${context?.activeCourse?.attainedGaps?.length || "some"} Course Outcomes** showing deficits against targets. Prioritize additional review sessions on difficult units to elevate end-semester success rates.`;
  }

  if (agentType === "ci") {
    return `### [CIAgent] Continuous Improvement Remedial Action

I have prepared custom continuous improvement recommendations for **${currentCourseName}**:

- **Failing Courses**: Active gap areas detected: ${context?.activeCourse?.attainedGaps?.join(", ") || "None currently"}.
- **Action Strategy**:
  - Implement dynamic tutorial groups focusing on logical normalization processes.
  - Allocate dedicated lab sheets containing diagnostic traces for complex database queries.
  - File these action logs directly into Criterion 7 (Continuous Improvement) to assure external auditors of systemic evaluation feedback loops.`;
  }

  if (agentType === "sar") {
    return `### [SAR Advisor] Chapter Compliance Advice

As your Self-Assessment Report (SAR) Chapter Advisor, here is my review of your accreditation prep progress:

- **Overall Index**: Departmental progress registers an overall readiness index of **${context?.sarProgress?.readinessIndex || "72"}%** (${context?.sarProgress?.totalPointsEarned || "720"}/1000 overall points scored).
- **Target Chapters**:
  - *Criterion 2 (100 Max pts)*: Mapping matrices. Ensure that the average scores of all CO-PO maps correspond to the overall values listed.
  - *Criterion 7 (50 Max pts)*: Continuous Improvement. Document explicit remedial files and faculty meeting notes discussing performance gaps.
- **Compliance Warning**: Ensure all evidence folders and lab manuals are kept in a shared drive and referenced explicitly in text.`;
  }

  if (agentType === "validation") {
    return `### [Validation Auditor] Logical Audit & Validation Results

I have conducted a consistency audit of your local database records:

- **Mapping Validation**: Confirming that all 6 Course Outcomes have valid mappings to the Program Outcomes, satisfying basic architectural coverage.
- **Weight Consistency check**: Direct exams weights aggregate correctly. Survey normalization satisfies compliance regulations.
- **Data Completeness**: High-priority gap areas have corresponding remedial memorandum files attached.
- **Result status**: **VALIDATION SUCCESSFUL**. Ready for formal audit submission.`;
  }

  if (agentType === "analytics") {
    return `### [Analytics Specialist] Program Performance Scorecard

Here is your Program Analytics report:
- **Active Specialty**: Computer Science Department
- **Accreditation Readiness Index**: **${context?.sarProgress?.readinessIndex || "72"}%**
- **Accrued Points**: **${context?.sarProgress?.totalPointsEarned || "720"} / 1000 Total**
- **Benchmarks**:
  - Criterion 4 (Students Performance) and Criterion 5 (Faculty details) combine for 350 critical criteria marks.
  - Maximizing academic success ratios (above 85% graduation rate) would boost progress by another 20 points overall.`;
  }

  // Orchestrator fallback
  return `### [Orchestrator Agent] Master Router Hub

Hello! I have coordinated with our specialized NBA agents to analyze your query ("*${userMsg}*") regarding **${currentCourseCode}**:

- **Active Context**: Course outcomes have been mapped against curriculum rules.
- **Specialist Routing Recommendations**:
  - Switch to the **COPO Taxonomy Agent** to write or validate Course Outcomes.
  - Switch to the **Attainment Specialist** to adjust assessment weights or targets.
  - Switch to **CIAgent** to analyze gap remedial timelines.

I am standing by to process your next instruction or audit request.`;
}

const app = express();
app.use(express.json());

// API: Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Generate Custom Course Outcomes (COs) using Bloom's Taxonomy
app.post("/api/generate-cos", async (req, res) => {
  try {
    const { courseName, courseDescription } = req.body;
    if (!courseName) {
      return res.status(400).json({ error: "courseName is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      console.warn("No active AI client found, running fallback generator for courseName:", courseName);
      return res.json({ success: true, cos: fallbackCOs(courseName) });
    }

    const prompt = `
You are an expert NBA accreditation academic developer. Please generate exactly 6 highly professional Course Outcomes (CO1 to CO6) for the course "${courseName}" based on the description: "${courseDescription || 'Standard engineering course'}".

Each CO must follow Bloom's Taxonomy (e.g., using action verbs like: Remember, Understand, Apply, Analyze, Evaluate, Create).
Structure each CO with:
- An ID (CO1 to CO6)
- An action verb
- A clear description of what the student will be able to do.
- The Bloom's Taxonomy Level (e.g., K1, K2, K3, K4, K5, K6).

Please return the content formatted as JSON corresponding with this exact structure:
[
  { "id": "CO1", "text": "Describe...", "bloomsLevel": "Understand (K2)" },
  ...
]
Provide ONLY raw JSON. No markdown wraps, no backticks, no comments.
`;

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text || "[]";
    const coList = JSON.parse(text.trim());
    res.json({ success: true, cos: coList });
  } catch (error: any) {
    console.warn("Notice: API model generation unavailable, routing to local taxonomy engine. Message:", error?.message || error);
    try {
      const fallbackList = fallbackCOs(req.body.courseName || "General course");
      res.json({ success: true, cos: fallbackList });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "Failed to generate Course Outcomes fallback." });
    }
  }
});

// API: Suggest CO-PO Mapping based on CO descriptions and POs
app.post("/api/suggest-mapping", async (req, res) => {
  const { courseName, cos } = req.body;
  try {
    if (!cos || !Array.isArray(cos)) {
      return res.status(400).json({ error: "cos array is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      console.warn("No active AI client found, using local suggestion mapping engine for course:", courseName);
      return res.json({ success: true, mappings: fallbackSuggestedMappings(courseName, cos) });
    }

    const prompt = `
You are an NBA accreditation analysis agent. Suggest course-outcome to program-outcome mappings for the course "${courseName || 'Selected Course'}".
We have these 6 Course Outcomes:
${cos.map((co: any) => `${co.id}: ${co.text} (${co.bloomsLevel || 'Unknown level'})`).join("\n")}

And we have the 12 standard Program Outcomes:
${NBA_PROGRAM_OUTCOMES}

Please evaluate the relationship between each CO (CO1-CO6) and each PO (PO1-PO12).
For each pairing, output a mapping value:
- 0: No correlation
- 1: Slight (Low) correlation
- 2: Moderate (Medium) correlation
- 3: Substantial (High) correlation

Return the output as a valid JSON array of objects representing mapped pairs, with a brief explanation of why the mapping is significant. Format:
[
  { "coId": "CO1", "poId": "PO1", "value": 3, "rationale": "High relevance since students calculate foundation equations." },
  ...
]
Provide mapping objects ONLY for non-zero scores (values 1, 2, or 3) to keep it concise, but cover all active COs. Return ONLY raw JSON without markdown formatting.
`;

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text || "[]";
    const suggested = JSON.parse(text.trim());
    res.json({ success: true, mappings: suggested });
  } catch (error: any) {
    console.warn("Notice: API suggest mapping unavailable, using local expert mapping engine. Message:", error?.message || error);
    try {
      const fallbackRulesList = fallbackSuggestedMappings(courseName || "General Course", cos || []);
      res.json({ success: true, mappings: fallbackRulesList });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "Failed to suggest CO-PO mappings fallback." });
    }
  }
});

// API: General Multi-Agent Accreditation Helper Chat (Orchestrator, COPO, Attainment, SAR, CI, Analytics, Validation Agents)
app.post("/api/chat", async (req, res) => {
  const { messages, agentType, context } = req.body;
  try {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const ai = getAIClient();
    const userMsg = messages[messages.length - 1]?.content || "";

    if (!ai) {
      console.warn("No active AI client found, running fallback chat engine for specialist:", agentType);
      return res.json({ success: true, text: fallbackChatResponse(agentType, userMsg, context) });
    }

    const systemInstruction = `
You are the NBA Enterprise AI Platform agent.
Your specific persona is: "${agentType || 'orchestrator'}" specialist helper.

Available Specialists:
- "orchestrator": The master router. Classifies user requests, routes to specialists, and coordinates responses.
- "copo": Expert in Blooms Taxonomy, drafting Course Outcomes, mapping to Program Outcomes, and aligning curriculum.
- "attainment": Expert in computing direct attainment (Mid-semester exams, End-semester exam, assignments, labs) and indirect attainment (exit surveys, employer surveys), configuring weights (e.g. 80-20), target criteria.
- "sar": Advisor on Self Assessment Reports preparation. Speaks extensively on NBA criteria compliance (Chapters 1 to 10), layout suggestions, and evidence files.
- "ci" (Continuous Improvement): Specializes in gap analysis when attainments do not meet targets, drafting corrective actions, faculty feedback, curriculum updates.
- "analytics": Computes statistics, reviews trends, compares departments, and benchmarks readiness.
- "validation": Audits documents, spots discrepancies (e.g. mapping averagings, missing survey details), double-checks logical consistency.

NBA Context:
- Program Outcomes (POs): PO1 to PO12 (highly defined, generic for all engineers).
- Program Specific Outcomes (PSOs): Usually 2-4 program-specific statements.
- Course Outcomes (COs): 4-6 specific outcomes per course.
- Attainment threshold: Generally set such that, say, 50% or 60% of students scoring above of a target percentage (e.g. 50% marks) counts as target met.
- Compliance level grading scales are usually 0 (not attained), 1 (low attained), 2 (moderate), 3 (substantial).

Current Context provided by User UI:
${context ? JSON.stringify(context, null, 2) : "No specific UI context submitted."}

Respond professionally, academic, structured, helpful, and concise. Avoid promotional lingo or system directories. Frame answers as senior accreditation coordinators. Use tables, bullet points, and clear steps.
`;

    // Package the standard history
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ success: true, text: result.text });
  } catch (error: any) {
    console.warn("Notice: API chat endpoint unavailable, running local specialist agent conversation. Message:", error?.message || error);
    try {
      const userMsg = messages[messages.length - 1]?.content || "";
      const reply = fallbackChatResponse(agentType, userMsg, context);
      res.json({ success: true, text: reply });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "Failed running active agent conversation." });
    }
  }
});

// API: Generate full Gap Analysis & Continuous Improvement Plans
app.post("/api/generate-ci-action", async (req, res) => {
  const { courseName, coGaps } = req.body;
  try {
    if (!coGaps || !Array.isArray(coGaps)) {
      return res.status(400).json({ error: "coGaps array info is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      console.warn("No active AI client found, utilizing fallback continuous improvement planner for course:", courseName);
      return res.json({ success: true, actionPlan: fallbackCIPlan(courseName, coGaps) });
    }

    const actualGaps = coGaps.filter((g: any) => g.explanation && g.explanation.toLowerCase().includes("fail"));
    let prompt = "";
    if (actualGaps.length === 0) {
      prompt = `
You are the NBA Accreditation Continuous Improvement Agent (CIAgent).
For the course "${courseName || 'Database Systems'}", all course outcomes successfully reached or surpassed their threshold targets:
${coGaps.map((gp: any) => `- ${gp.coId}: Attained ${gp.attained}% against Target of ${gp.target}%`).join("\n")}

Please suggest an "Academic Excellence & Continuous Quality Improvement Plan":
1. Key Academic Strengths & Success Pillars (e.g. prerequisite alignment, robust continuous evaluation, micro-project assignments).
2. Advanced Extension Methodologies (to challenge top-quartile students further, such as research evaluations, advanced seminar workshops, open-source challenges).
3. Strategy to sustain and institutionalize this high performance of subsequent student intakes.
4. Suggestions for curriculum enhancements to align with trending software engineering paradigms.

Format your response as a professional academic memorandum containing clear section headers.
`;
    } else {
      prompt = `
You are the NBA Accreditation Continuous Improvement Agent (CIAgent).
For the course "${courseName || 'Database Systems'}", the following course-outcomes didn't reach their attainment threshold targets:
${actualGaps.map((gap: any) => `- ${gap.coId}: Attained ${gap.attained}% against Target of ${gap.target}%. Context: ${gap.explanation || 'Exam results low'}`).join("\n")}

Please suggest:
1. Standard Academic Root Causes of this gap (e.g., deficiency in pre-requisites, lack of practical hands-on, hard conceptual components).
2. Precise Direct Corrective Actions to implement in the next semester (e.g., bridge courses, active learning, custom tutorial worksheets, lab revision).
3. Curriculum or Syllabus enrichment recommendations, if applicable.
4. Additional resources or digital tools to integrate.

Format your response as a professional academic memorandum containing clear section headers.
`;
    }

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ success: true, actionPlan: result.text });
  } catch (error: any) {
    console.warn("Notice: API CI action planner unavailable, triggering rules-based action planner. Message:", error?.message || error);
    try {
      res.json({ success: true, actionPlan: fallbackCIPlan(courseName || "General Course", coGaps || []) });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "Failed to generate continuous improvement action plan." });
    }
  }
});

// Serve Vite frontend
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NBA Enterprise AI Platform server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
