import { AGENT_SYSTEM_PROMPTS, generateClinicalAnalysis } from "./aiService";
import { fetchFHIRPatientData, parseFHIRBundle } from "./fhirService";
import { AgentTask } from "../types";
import sharpContext from "../../fhir-context.json";

export class AgentOrchestrator {
  private patientId: string;
  private context: any = {};
  private results: Record<string, string> = {};

  constructor(patientId: string) {
    this.patientId = patientId;
  }

  async runWorkflow(onTaskComplete: (task: AgentTask) => void) {
    // 1. Fetch FHIR Data
    const bundle = await fetchFHIRPatientData(this.patientId);
    this.context = parseFHIRBundle(bundle);

    // 2. Summary Agent
    await this.executeTask("Summary Agent", AGENT_SYSTEM_PROMPTS.SUMMARY, "Summarize patient records into SOAP format and patient-friendly language. Focus on post-discharge needs.", onTaskComplete);

    // 3. Medication Agent
    await this.executeTask("Medication Agent", AGENT_SYSTEM_PROMPTS.MEDICATION, "Check current medications for interactions and risks. Cite any contraindications clearly.", onTaskComplete);

    // 4. Care Coordination Agent
    await this.executeTask("Care Coordination Agent", AGENT_SYSTEM_PROMPTS.COORDINATION, "Suggest follow-up care and specialist needs. Include a week-by-week plan.", onTaskComplete);

    // 5. Insurance Agent
    await this.executeTask("Insurance Agent", AGENT_SYSTEM_PROMPTS.INSURANCE, "Draft prior authorization narratives for the recommended care plan.", onTaskComplete);

    // 6. Follow-up Agent
    await this.executeTask("Follow-up Agent", AGENT_SYSTEM_PROMPTS.FOLLOWUP, "Assess readmission risk and adherence signals. Provide a numeric confidence level for the risk.", onTaskComplete);
  }

  private async executeTask(agentName: string, systemPrompt: string, instruction: string, onComplete: (task: AgentTask) => void) {
    const task: AgentTask = {
      id: Math.random().toString(36).substr(2, 9),
      agent: agentName,
      status: 'active',
      timestamp: new Date().toISOString()
    };
    onComplete(task);

    // Context Propagation including SHARP metadata and cumulative results
    const fullPrompt = `
SYSTEM ROLE: ${systemPrompt}
SHARP SECURITY CONTEXT: ${JSON.stringify(sharpContext)}

PATIENT DATA (FHIR):
${JSON.stringify(this.context)}

PREVIOUS AGENT INPUTS:
${JSON.stringify(this.results)}

INSTRUCTION: ${instruction}

RESPONSE REQUIREMENTS:
- Use professional healthcare terminology.
- Be concise.
- Include structured sections using Markdown.
- If medical risks are found, highlight them clearly.
- Include a confidence level (0-100%).
- Ensure clinical rationale is provided.
`;

    const output = await generateClinicalAnalysis(fullPrompt);

    this.results[agentName] = output || "";
    task.status = 'completed';
    task.output = output || "No output generated.";
    onComplete(task);
  }
}
