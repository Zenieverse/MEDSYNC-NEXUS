# MedSync Nexus
## Composable Healthcare Intelligence Powered by Interoperable Agents

https://ais-pre-btrm7bi753fbem2daoyn2b-393352619239.asia-southeast1.run.app

MedSync Nexus is a production-grade AI care coordination platform designed for the **“Agents Assemble: The Healthcare AI Endgame Challenge”**. It demonstrates a vision of the healthcare future where specialized AI agents collaborate across clinical and operational boundaries using interoperable standards like FHIR and the Model Context Protocol (MCP).

---

### 🚀 Key Features

- **Multi-Agent Orchestration**: Powered by a custom agentic workflow that manages the lifecycle of post-discharge care.
- **FHIR R4 Interoperability**: Native support for HL7 FHIR resources including Patient, Condition, MedicationRequest, and Observation.
- **MCP Tool Registry**: A library of reusable "healthcare superpowers" that agents can invoke for specialized reasoning (e.g., Medication Safety, Risk Prediction).
- **SHARP Context Propagation**: Demonstrates secure propagation of patient context across a decentralized agent network.
- **Enterprise Dashboard**: A high-fidelity, real-time monitoring interface for care coordinators.

---

### 🏛 Architecture Overview

#### 1. Agent Network (A2A)
The system uses a **Coordinator Agent** that orchestrates a team of specialized sub-agents:
- **Clinical Summary Agent**: Distills complex charts into SOAP notes.
- **Medication Safety Agent**: Identifies interactions and contraindications.
- **Care Coordination Agent**: Formulates follow-up care plans.
- **Insurance Prior Auth Agent**: Automates narrative generation for auth requests.
- **Follow-up Monitoring Agent**: Flags adherence risks and patient deterioration.

#### 2. MCP Tools
The platform exposes several **Model Context Protocol** compatible tools:
- `MedicationSafetyMCP`: Deep analysis of drug-drug and drug-allergy interactions.
- `ClinicalSummaryMCP`: High-precision clinical summarization components.
- `ReadmissionRiskMCP`: Quantitative risk scoring for predictive care.

#### 3. Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS, Motion/React, Lucide-React.
- **Backend**: Node.js Express (Serving as both API and Vite proxy).
- **AI**: Gemini 3 Flash (Google AI Studio) for advanced medical reasoning.
- **Interoperability**: FHIR R4 standard.

---

### 🛠 Setup & Development

#### Prerequisites
- Node.js 20+
- Google Gemini API Key

#### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API Key in `.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

### 🏥 Demo Walkthrough

1. **Select a Patient**: Choose from the "Patient Queue" on the left dashboard.
2. **Launch Workflow**: Clicking a patient triggers the `AgentOrchestrator`.
3. **Monitor Agents**: Watch the real-time status indicators as agents move through the workflow phases.
4. **Review Insights**: Expand the generated AI insights cards to see detailed SOAP summaries, medication risks, and care plans.
5. **Inspect MCP Tools**: Visit the "MCP Registry" tab to see the available reusable tools.
6. **Audit Trail**: Check the "Audit Logs" for a compliance-ready history of agent actions.

---

### 🛡 Compliance & Safety

> **Disclaimer**: MedSync Nexus is a demonstration platform. All AI-generated clinical insights are intended to support, not replace, clinical judgment. This system is designed with HIPAA-compliant architectural principles (Audit logs, SHARP context, physician check-points).

---

### 🗺 Future Roadmap
- [ ] Direct integration with Epic/Cerner App Orchard.
- [ ] Real-time WebSocket updates for collaborative multi-user care teams.
- [ ] Enhanced Voice-interfaced Agent for bedside integration.
- [ ] LLM-judge verification layer for clinical accuracy validation.

**Built with ❤️ for Prompt Opinion Agents Assemble.**
