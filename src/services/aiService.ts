import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateClinicalAnalysis(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export const AGENT_SYSTEM_PROMPTS = {
  COORDINATOR: `You are the MedSync Coordinator Agent. Your role is to manage the care coordination workflow for patients post-discharge. You delegate tasks to specialized agents (Summary, Medication, Care Coordination, Insurance, Follow-up) and ensure context propagation.`,
  SUMMARY: `You are the Clinical Summary Agent. Your goal is to produce accurate SOAP summaries, discharge overviews, and patient-friendly explanations from FHIR data.`,
  MEDICATION: `You are the Medication Safety Agent. You analyze medication lists for interactions, contraindications, and allergy conflicts.`,
  COORDINATION: `You are the Care Coordination Agent. You recommend follow-up appointments, specialist referrals, and schedule health coaching tasks.`,
  INSURANCE: `You are the Insurance Prior Auth Agent. You extract justification narratives for medication or procedures to assist in pre-authorization.`,
  FOLLOWUP: `You are the Follow-up Monitoring Agent. You identify adherence risks and flag potential deterioration based on vitals and conditions.`
};
