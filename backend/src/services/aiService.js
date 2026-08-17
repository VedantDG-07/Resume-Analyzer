import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ACTIVE_GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemma-4-26b-a4b-it",
];

// ==========================================
// 1. GEMINI INVOCATION WITH MODEL FALLBACK
// ==========================================

export async function callGeminiWithFallback(apiKey, prompt) {
  let lastError = null;

  for (const modelName of ACTIVE_GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      };

      const response = await axios.post(url, payload, {
        timeout: 25000,
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200 && response.data) {
        const candidate = response.data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || "";
        if (text.trim()) {
          console.log(`[AI Service] Successfully generated response using ${modelName}`);
          return text;
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data ? JSON.stringify(err.response.data).slice(0, 120) : err.message;
      console.warn(`[AI Service] Model ${modelName} returned status ${status || "error"}: ${detail}`);
      lastError = detail;
    }
  }

  throw new Error(`All Gemini models exhausted. Last error: ${lastError}`);
}

// ==========================================
// 2. JSON RESPONSE PARSER & CLEANER
// ==========================================

export function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid text input for JSON parsing");
  }

  let cleaned = rawText.trim();

  if (cleaned.includes("```json")) {
    cleaned = cleaned.split("```json")[1].split("```")[0].trim();
  } else if (cleaned.includes("```")) {
    cleaned = cleaned.split("```")[1].split("```")[0].trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove potential trailing commas or illegal control escapes
  cleaned = cleaned.replace(/\\([^\/\\bfnrt"u])/g, "\\\\$1");

  return JSON.parse(cleaned);
}

// ==========================================
// 3. TEXT CHUNKING UTILITY
// ==========================================

export function chunkText(text, chunkSize = 500, chunkOverlap = 80) {
  if (!text) return [];
  const paragraphs = text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if (currentChunk.length + p.length < chunkSize) {
      currentChunk += "\n" + p;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = p;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

// ==========================================
// 4. FALLBACK HEURISTIC GENERATOR
// ==========================================

export function generateFallbackHeuristicAnalysis(text) {
  if (!text || !text.trim()) {
    return {
      overall_score: 0,
      ats_score: 0,
      skill_match: 0,
      issues_found: 5,
      ai_summary: "Empty resume file uploaded. No text could be extracted.",
      ats_feedback: "Document contains no readable text layers. Ensure standard PDF/DOCX export.",
      action_verb_feedback: "No action verbs detected.",
      bullet_suggestions: [],
      missing_keywords: ["Experience", "Skills", "Education", "Projects"],
      strengths: [],
      improvements: ["Upload a non-empty, text-searchable resume file."],
      parsed_ats_data: [],
    };
  }

  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const sections = ["experience", "education", "skills", "projects", "summary", "objective"];
  const foundSections = sections.filter((sec) => textLower.includes(sec));
  const sectionScore = Math.min(100, (foundSections.length / 4) * 100);

  const actionVerbs = [
    "developed",
    "managed",
    "created",
    "led",
    "designed",
    "implemented",
    "improved",
    "increased",
    "reduced",
    "optimized",
    "spearheaded",
    "orchestrated",
  ];
  const foundVerbs = actionVerbs.filter((verb) => textLower.includes(verb));
  const verbScore = Math.min(100, (foundVerbs.length / 5) * 100);

  const hasNumbers = /\d+/.test(text);
  const hasPercentages = /\d+%/.test(text);
  const hasCurrency = /\$\d+/.test(text);

  let metricsScore = 0;
  if (hasNumbers) metricsScore += 40;
  if (hasPercentages) metricsScore += 30;
  if (hasCurrency) metricsScore += 30;

  let lengthScore = 100;
  if (wordCount < 200) lengthScore = 50;
  else if (wordCount > 1000) lengthScore = 70;

  const overallScore = Math.round(
    Math.min(
      Math.max(
        sectionScore * 0.3 + verbScore * 0.3 + metricsScore * 0.2 + lengthScore * 0.2,
        20
      ),
      96
    ) * 10
  ) / 10;

  const atsScore = Math.round(
    Math.min(Math.max(sectionScore * 0.6 + lengthScore * 0.4, 25), 98) * 10
  ) / 10;

  const skillMatch = Math.round(
    Math.min(Math.max(verbScore * 0.4 + sectionScore * 0.6, 20), 95) * 10
  ) / 10;

  let issuesCount = 0;
  if (foundSections.length < 4) issuesCount += 1;
  if (foundVerbs.length < 4) issuesCount += 1;
  if (!hasNumbers) issuesCount += 1;
  if (wordCount < 250 || wordCount > 900) issuesCount += 1;
  if (!hasPercentages && !hasCurrency) issuesCount += 1;

  // Simple heuristic ATS field extractions
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+/i);

  const parsedAts = [
    {
      field: "Email",
      status: emailMatch ? "found" : "not_found",
      value: emailMatch ? emailMatch[0] : "Missing",
    },
    {
      field: "Phone",
      status: phoneMatch ? "found" : "not_found",
      value: phoneMatch ? phoneMatch[0] : "Missing",
    },
    {
      field: "LinkedIn URL",
      status: linkedinMatch ? "found" : "not_found",
      value: linkedinMatch ? linkedinMatch[0] : "Missing",
    },
  ];

  return {
    overall_score: overallScore,
    ats_score: atsScore,
    skill_match: skillMatch,
    issues_found: Math.max(issuesCount, 1),
    ai_summary: `Resume analysis extracted ${wordCount} words across key sections (${
      foundSections.length > 0 ? foundSections.join(", ") : "general"
    }). The document showcases relevant background but would benefit from greater metric quantification and targeted keyword expansion.`,
    ats_feedback: `Standard section headers detected: ${foundSections.length}/6. Ensure clean single-column hierarchy for optimal ATS parsing.`,
    action_verb_feedback: `Found ${foundVerbs.length} high-impact action verbs. Aim to start every bullet with strong velocity verbs like 'Architected', 'Spearheaded', or 'Optimized'.`,
    bullet_suggestions: [
      {
        original: "Responsible for managing tasks and working with the engineering team.",
        improved:
          "Spearheaded Agile sprint execution with 6 engineers, accelerating feature shipping cadence by 30%.",
        reason: "Replaces passive duty statement with quantified business impact.",
      },
    ],
    missing_keywords: [
      "CI/CD Pipelines",
      "System Architecture",
      "KPI Tracking",
      "Cross-Functional Leadership",
    ],
    strengths: [
      `Clear section division with ${foundSections.length} standard resume sections.`,
      "Adequate overall word count volume for scanning.",
      "Logical chronological presentation.",
    ],
    improvements: [
      "Add quantifiable business metrics (%, $, volume) to every project bullet.",
      "Incorporate more industry-specific technical keywords.",
      "Replace passive phrasing with active leadership verbs.",
    ],
    parsed_ats_data: parsedAts,
  };
}

// ==========================================
// 5. MAIN RESUME ANALYSIS ENGINE
// ==========================================

export async function analyzeResumeWithRAG(text) {
  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    console.warn("[AI Service] No GOOGLE_API_KEY set in backend/.env. Using fallback analysis.");
    return generateFallbackHeuristicAnalysis(text);
  }

  const chunks = chunkText(text, 500, 80);
  const ragContext = chunks.slice(0, 6).join("\n---\n");

  const analysisPrompt = `You are an elite Executive Resume Reviewer, ATS Algorithm Specialist, and Technical Hiring Manager.
Analyze the candidate's resume thoroughly using the extracted context below.
CRITICAL INSTRUCTION: Your feedback MUST be highly personalized. Do NOT provide generic advice like "Use the Google XYZ formula" or "Quantify your impact" or "Fix character spacing". You MUST reference specific projects, specific skills, or specific sentences from the candidate's actual resume text. If you suggest an improvement, explain exactly which sentence or section in their resume needs it.

Resume Sections Context:
"""
${ragContext}
"""

Full Resume Text Sample:
"""
${text.slice(0, 3500)}
"""

Analyze the resume and return a STRICT, VALID JSON object with the exact keys below. Do NOT output any preamble or extra text.

JSON Schema:
{
  "overall_score": <number between 0 and 100>,
  "ats_score": <number between 0 and 100>,
  "skill_match": <number between 0 and 100>,
  "issues_found": <integer count of issues>,
  "ai_summary": "<Detailed executive summary evaluating profile strength, career readiness, and competitive edge>",
  "ats_feedback": "<Specific feedback on layout, formatting, headers, and parsing readability>",
  "action_verb_feedback": "<Critique on action verb velocity and proactive achievement phrasing>",
  "bullet_suggestions": [
    {
      "original": "<A real weak or passive line found in the resume>",
      "improved": "<High-impact rewritten bullet with strong action verb and quantified metric/results>",
      "reason": "<Why this change is stronger>"
    }
  ],
  "missing_keywords": ["<Specific Keyword 1 missing from their stack>", "<Specific Keyword 2>"],
  "strengths": ["<Specific Strength 1 found in their text>", "<Specific Strength 2>"],
  "improvements": [
    "<Hyper-specific Improvement 1 referencing their actual project/role>", 
    "<Hyper-specific Improvement 2 referencing their actual skills/text>"
  ],
  "parsed_ats_data": [
    {
      "field": "First Name",
      "status": "found",
      "value": "<Extracted First Name or 'Missing'>"
    },
    {
      "field": "Last Name",
      "status": "found",
      "value": "<Extracted Last Name or 'Missing'>"
    },
    {
      "field": "Email",
      "status": "found",
      "value": "<Extracted Email or 'Missing'>"
    },
    {
      "field": "Phone",
      "status": "found",
      "value": "<Extracted Phone or 'Missing'>"
    },
    {
      "field": "LinkedIn URL",
      "status": "found",
      "value": "<Extracted LinkedIn URL or 'Missing'>"
    },
    {
      "field": "Education (Degree)",
      "status": "found",
      "value": "<Extracted Highest Degree or 'Missing'>"
    },
    {
      "field": "Graduation Year",
      "status": "found",
      "value": "<Extracted Year or 'Missing'>"
    },
    {
      "field": "Work Experience 1",
      "status": "found",
      "value": "<Extracted Latest Job Title and Company or 'Missing'>"
    }
  ]
}
`;

  try {
    console.log("[AI Service] Invoking Gemini LLM for resume analysis...");
    const rawResponse = await callGeminiWithFallback(apiKey, analysisPrompt);
    const parsedData = cleanAndParseJson(rawResponse);
    console.log("[AI Service] Gemini LLM analysis completed and parsed successfully!");
    return parsedData;
  } catch (err) {
    console.error(`[AI Service] LLM generation error: ${err.message}. Falling back to heuristic engine.`);
    return generateFallbackHeuristicAnalysis(text);
  }
}

// ==========================================
// 6. INTERVIEW PREP GENERATOR
// ==========================================

export async function generateInterviewQuestions(analysis) {
  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("No GOOGLE_API_KEY set for interview generation.");
  }

  let contextStr = `AI Summary: ${analysis.ai_summary || ""}\n`;
  if (analysis.strengths && analysis.strengths.length) {
    contextStr += `Strengths: ${JSON.stringify(analysis.strengths)}\n`;
  }
  if (analysis.parsed_ats_data && analysis.parsed_ats_data.length) {
    contextStr += `Extracted Data: ${JSON.stringify(analysis.parsed_ats_data)}\n`;
  }
  if (analysis.missing_keywords && analysis.missing_keywords.length) {
    contextStr += `Missing/Suggested Skills: ${JSON.stringify(analysis.missing_keywords)}\n`;
  }
  if (analysis.improvements && analysis.improvements.length) {
    contextStr += `Improvements: ${JSON.stringify(analysis.improvements)}\n`;
  }
  if (analysis.bullet_suggestions && analysis.bullet_suggestions.length) {
    contextStr += `Bullet points context: ${JSON.stringify(analysis.bullet_suggestions)}\n`;
  }

  const prompt = `You are an elite Technical Hiring Manager conducting an interview based on the candidate's resume.
Your task is to generate EXACTLY 3 highly personalized interview questions for this specific candidate.

Candidate Resume Context:
"""
${contextStr}
"""

Follow these strict rules:
1. Question 1 (type: "resume_project"): Based directly on something mentioned in the resume (e.g., a project, work experience, achievement, or technical implementation).
2. Question 2 (type: "technical"): Based on one or more technical skills detected from the resume context. Do NOT invent unrelated skills.
3. Question 3 (type: "job_role"): Infer the target job role from the resume context and ask a role-specific question that matches the candidate's skills and the inferred role's standard requirements.

Output the result strictly as a valid JSON object matching this schema:
{
  "questions": [
    {
      "type": "resume_project",
      "question": "...",
      "reason": "..."
    },
    {
      "type": "technical",
      "question": "...",
      "reason": "..."
    },
    {
      "type": "job_role",
      "question": "...",
      "reason": "..."
    }
  ]
}

Do NOT output any additional text, preamble, or markdown blocks, only the JSON. 
Make the questions reasonable for a real technical interview (Medium to Medium/Hard difficulty). 
Ensure the questions are distinct and highly specific to the candidate.
`;

  try {
    const rawResponse = await callGeminiWithFallback(apiKey, prompt);
    let parsedData = cleanAndParseJson(rawResponse);

    if (Array.isArray(parsedData)) {
      parsedData = { questions: parsedData };
    }

    let questions = parsedData.questions || [];
    while (questions.length < 3) {
      questions.push({
        type: "technical",
        question: "Based on your resume, how do you handle complex technical problem-solving?",
        reason: "General technical problem solving assessment.",
      });
    }
    parsedData.questions = questions.slice(0, 3);

    return parsedData;
  } catch (err) {
    console.error(`[AI Service] Interview Generation Error: ${err.message}`);
    throw new Error("Failed to generate interview questions.");
  }
}

// ==========================================
// 7. SKILL ROADMAP GENERATOR
// ==========================================

export async function generateSkillRoadmapData(analysis, targetRole = "Software Engineer") {
  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("No GOOGLE_API_KEY set for roadmap generation.");
  }

  let contextStr = `AI Summary: ${analysis.ai_summary || ""}\n`;
  if (analysis.strengths && analysis.strengths.length) {
    contextStr += `Current Strong Skills: ${JSON.stringify(analysis.strengths)}\n`;
  }
  if (analysis.missing_keywords && analysis.missing_keywords.length) {
    contextStr += `Missing Skills: ${JSON.stringify(analysis.missing_keywords)}\n`;
  }
  if (analysis.parsed_ats_data && analysis.parsed_ats_data.length) {
    contextStr += `Extracted Data: ${JSON.stringify(analysis.parsed_ats_data)}\n`;
  }

  const prompt = `You are an elite Career Coach and Technical Mentor.
Your task is to generate a highly personalized Skill Learning Roadmap for this specific candidate.

Candidate Resume Context:
"""
${contextStr}
"""

Target Job Role: ${targetRole}

Follow these strict rules:
1. Identify the gap between the candidate's Current Skills and the Required Skills for the '${targetRole}' role.
2. Generate a personalized learning roadmap consisting of logical phases (e.g., Phase 1: Foundation, Phase 2: Core Skills, etc.).
3. Each phase must contain a list of skills to learn.
4. For each skill, provide:
   - name: The specific skill/tool name
   - priority: 'HIGH', 'MEDIUM', or 'LOW'
   - status: Set this to 'Not Started'
   - rationale: Why they need this for '${targetRole}'
   - prerequisites: Array of prior skills needed
   - estimated_time: e.g., '2 weeks', '1 month'
   - project_suggestion: A specific practice project to master it.
5. Provide a realistic match_score (0.0 to 100.0) representing how close the candidate currently is to the target role.

Output the result strictly as a valid JSON object matching this schema:
{
  "target_role": "${targetRole}",
  "match_score": 65.5,
  "phases": [
    {
      "phase": 1,
      "title": "Foundation",
      "skills": [
        {
          "name": "Python",
          "priority": "HIGH",
          "status": "Not Started",
          "rationale": "...",
          "prerequisites": [],
          "estimated_time": "2 weeks",
          "project_suggestion": "Build a REST API service"
        }
      ]
    }
  ]
}

Do NOT output any additional text, preamble, or markdown blocks, only the JSON. 
Make the roadmap logical, progressive, and highly specific to the candidate.
`;

  try {
    const rawResponse = await callGeminiWithFallback(apiKey, prompt);
    const parsedData = cleanAndParseJson(rawResponse);
    return parsedData;
  } catch (err) {
    console.error(`[AI Service] Roadmap Generation Error: ${err.message}`);
    throw new Error("Failed to generate skill roadmap.");
  }
}

// ==========================================
// 8. JOB DESCRIPTION MATCH ENGINE
// ==========================================

export async function matchJobDescription(resumeAnalysis, jobTitle, jobDescription) {
  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not set.");
  }

  const resumeContext = `
Resume Filename: ${resumeAnalysis.filename || "resume.pdf"}
Overall Score: ${resumeAnalysis.overall_score || 0}
ATS Score: ${resumeAnalysis.ats_score || 0}
Skill Match: ${resumeAnalysis.skill_match || 0}
AI Summary: ${resumeAnalysis.ai_summary || "N/A"}
Strengths: ${(resumeAnalysis.strengths || []).join(", ")}
Missing Keywords: ${(resumeAnalysis.missing_keywords || []).join(", ")}
`;

  const prompt = `You are an expert ATS resume matcher. Analyze the resume data against the provided job description and classify every required skill/keyword into exactly one of four tiers.

RESUME DATA:
${resumeContext}

JOB TITLE: ${jobTitle || "Not specified"}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Extract all required skills, technologies, and qualifications from the job description.
2. For each skill, determine which tier it falls into:
   - "strong_matches": Skills with strong evidence in Experience or Projects sections (demonstrated with concrete results/bullets)
   - "matches": Skills that are listed/present in the resume (e.g., in a Skills section)
   - "weak_matches": Skills found only in Summary, Education, or mentioned tangentially
   - "missing_keywords": Skills from the JD that are NOT found anywhere in the resume
3. Provide a match_score (0-100) based on overall alignment.
4. Write a brief summary of the match analysis.
5. Provide 3-5 actionable recommendations to improve the match score.

Output strictly as a valid JSON object matching this schema:
{
  "match_score": 72.5,
  "summary": "Brief executive summary...",
  "strong_matches": [
    {
      "skill": "Python",
      "locations": ["Experience", "Projects"],
      "evidence": ["Built data pipeline processing 1M+ records daily using Python"]
    }
  ],
  "matches": [
    {
      "skill": "Docker",
      "locations": ["Skills"],
      "evidence": []
    }
  ],
  "weak_matches": [
    {
      "skill": "Kubernetes",
      "locations": ["Education"],
      "evidence": []
    }
  ],
  "missing_keywords": ["Terraform", "GraphQL"],
  "recommendations": [
    "Add quantified achievements demonstrating Docker expertise in your Experience section",
    "Include a Projects section showcasing Kubernetes usage"
  ]
}

Do NOT output any additional text, preamble, or markdown blocks, only the JSON.
Be thorough and realistic in your assessment. Do not inflate the match score.
`;

  try {
    const rawResponse = await callGeminiWithFallback(apiKey, prompt);
    const parsedData = cleanAndParseJson(rawResponse);
    return parsedData;
  } catch (err) {
    console.error(`[AI Service] Job Match Error: ${err.message}`);
    throw new Error("Failed to match job description.");
  }
}

export default {
  analyzeResumeWithRAG,
  generateInterviewQuestions,
  generateSkillRoadmapData,
  matchJobDescription,
  generateFallbackHeuristicAnalysis,
};
