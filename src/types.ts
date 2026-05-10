export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  condition: string;
  status: string;
  risk: 'low' | 'medium' | 'high';
}

export interface AgentTask {
  id: string;
  agent: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  output?: string;
  timestamp: string;
}

export interface WorkflowState {
  patientId: string;
  activeTasks: AgentTask[];
  completedTasks: AgentTask[];
  overallProgress: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  reason: string;
}

export interface ClinicalSummary {
  soap: string;
  discharge: string;
  patientFriendly: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  context: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}
