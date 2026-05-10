import React from 'react';
import { LayoutDashboard, Users, Activity, ShieldCheck, Settings, FileText, Pill, Bell, Menu, X, ArrowRight, BrainCircuit, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Patient, AgentTask, AuditLog } from './types';
import { AgentOrchestrator } from './services/agentOrchestrator';
import { MCP_TOOLS, invokeMCPTool } from './services/mcpTools';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

// --- UI Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-white")} />
    <span>{label}</span>
  </button>
);

const GlassCard = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
  <div className={cn("bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-bottom border-slate-800 bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'info' }: { children: React.ReactNode, variant?: 'info' | 'success' | 'warning' | 'danger' }) => {
  const variants = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", variants[variant])}>
      {children}
    </span>
  );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [tasks, setTasks] = React.useState<AgentTask[]>([]);
  const [logs, setLogs] = React.useState<AuditLog[]>([
    { id: '1', timestamp: new Date().toISOString(), actor: 'System', action: 'Platform Boot', context: 'Version 1.0.4', status: 'SUCCESS' }
  ]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [invokingTool, setInvokingTool] = React.useState<string | null>(null);

  const addLog = (actor: string, action: string, context: string, status: AuditLog['status'] = 'SUCCESS') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      actor, action, context, status
    }, ...prev]);
  };

  React.useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);

  const handleStartWorkflow = async (patient: Patient) => {
    setSelectedPatient(patient);
    setTasks([]);
    setIsProcessing(true);
    
    addLog('Coordinator', 'Workflow Started', `Patient: ${patient.name}`);
    const orchestrator = new AgentOrchestrator(patient.id);
    await orchestrator.runWorkflow((task) => {
      if (task.status === 'active') {
        addLog(task.agent, 'Task Initialized', `Patient ID: ${patient.id}`);
      } else if (task.status === 'completed') {
        addLog(task.agent, 'Task Completed', 'Analysis generated via Gemini');
      }
      
      setTasks(prev => {
        const index = prev.findIndex(t => t.agent === task.agent);
        if (index > -1) {
          const newTasks = [...prev];
          newTasks[index] = task;
          return newTasks;
        }
        return [...prev, task];
      });
    });
    setIsProcessing(false);
    addLog('Coordinator', 'Workflow Integrated', `Patient: ${patient.name} care plan finalized.`);
  };

  const handleInvokeTool = async (toolName: string) => {
    setInvokingTool(toolName);
    addLog('User', 'MCP Tool Invoked', toolName);
    try {
      await invokeMCPTool(toolName, { demo: true });
      addLog(toolName, 'Execution Success', 'Tool returned valid payload');
    } catch (e) {
      addLog(toolName, 'Execution Failed', 'Network or payload error', 'ERROR');
    } finally {
      setInvokingTool(null);
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'active') return 'info';
    if (status === 'error') return 'danger';
    return 'warning';
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 z-50",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <h1 className="font-bold text-lg tracking-tight">MedSync <span className="text-blue-500">Nexus</span></h1>}
        </div>

        <nav className="px-4 mt-6 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Users} label="Patients" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          <SidebarItem icon={Activity} label="Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
          <SidebarItem icon={BrainCircuit} label="Agent Console" active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')} />
          <SidebarItem icon={Database} label="MCP Registry" active={activeTab === 'mcp'} onClick={() => setActiveTab('mcp')} />
          <SidebarItem icon={ShieldCheck} label="Audit Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen pb-12",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-medium text-slate-400">Care Coordination Console</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              FHIR Connected: HAPI R4
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" />
            </button>
            <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs border border-blue-500/20">
              ZN
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Active Workflows", value: isProcessing ? "1" : "0", icon: Activity, color: "text-blue-500" },
                  { label: "Patients Monitored", value: patients.length.toString(), icon: Users, color: "text-emerald-500" },
                  { label: "MCP Tools Ready", value: "3", icon: Database, color: "text-purple-500" },
                  { label: "Avg Risk Score", value: "6.2", icon: ShieldCheck, color: "text-amber-500" }
                ].map((stat, i) => (
                  <GlassCard key={i} className="relative group hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-extrabold text-white">{stat.value}</h4>
                      </div>
                      <div className={cn("p-2 rounded-lg bg-slate-800 group-hover:scale-110 transition-transform", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient List */}
                <GlassCard title="Patient Queue" className="lg:col-span-1">
                  <div className="space-y-4">
                    {patients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleStartWorkflow(p)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all duration-200 group",
                          selectedPatient?.id === p.id 
                            ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5" 
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-slate-200 group-hover:text-white">{p.name}</h5>
                          <Badge variant={p.risk === 'high' ? 'danger' : p.risk === 'medium' ? 'warning' : 'success'}>
                            {p.risk} Risk
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                          <span>{p.condition}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full" />
                          <span>{p.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Workflow Monitor */}
                <GlassCard title="Agent Workflow Monitor" className="lg:col-span-2">
                  {!selectedPatient ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-600 space-y-4">
                      <BrainCircuit className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Select a patient to begin automated care coordination</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600/20 rounded flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Selected Patient</p>
                            <p className="font-bold text-white leading-tight">{selectedPatient.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Workflow Progress</p>
                          <div className="flex items-center gap-3">
                             <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(tasks.filter(t => t.status === 'completed').length / 6) * 100}%` }}
                                 className="h-full bg-blue-500"
                               />
                             </div>
                             <span className="text-xs font-bold text-white">
                               {Math.round((tasks.filter(t => t.status === 'completed').length / 6) * 100)}%
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                          {['Summary Agent', 'Medication Agent', 'Care Coordination Agent', 'Insurance Agent', 'Follow-up Agent'].map((agentName, idx) => {
                            const task = tasks.find(t => t.agent === agentName);
                            return (
                              <motion.div
                                key={agentName}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                  "p-4 rounded-lg border transition-all",
                                  task?.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/20" : 
                                  task?.status === 'active' ? "bg-blue-500/5 border-blue-500/30 animate-pulse" :
                                  "bg-slate-950 border-slate-800 opacity-60"
                                )}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase">{agentName}</span>
                                  <Badge variant={getStatusVariant(task?.status || 'pending')}>{task?.status || 'pending'}</Badge>
                                </div>
                                {task?.status === 'completed' && (
                                  <div className="mt-2 text-[11px] text-emerald-400/80 line-clamp-1 italic">
                                    Process completed successfully.
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Task Details / Insights Output */}
              {tasks.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {tasks.filter(t => t.status === 'completed').map((task, i) => (
                    <GlassCard key={i} title={task.agent} className="h-fit">
                      <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-400 prose-headings:text-slate-200">
                        <ReactMarkdown>{task.output || ""}</ReactMarkdown>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-extrabold text-white">Patient Clinical Timeline</h3>
              {!selectedPatient ? (
                <GlassCard className="text-center py-20 text-slate-500">
                  Select a patient to view their clinical journey and AI insights.
                </GlassCard>
              ) : (
                <div className="relative pl-8 border-l border-slate-800 space-y-12">
                  <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  
                  {/* Static Event */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0 text-[10px] font-bold text-slate-600 uppercase tracking-tighter w-8 text-right">May 09</div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-blue-400 text-sm">Initial Hospital Admission</h4>
                      <p className="text-xs text-slate-500 mt-1">Diagnosis: Acute decompensated heart failure. Admitted from ER.</p>
                    </div>
                  </div>

                  {/* AI Generated Events */}
                  {tasks.filter(t => t.status === 'completed').map((task, idx) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <div className="absolute -left-12 top-0 text-[10px] font-bold text-slate-600 uppercase tracking-tighter w-8 text-right">
                        {format(new Date(task.timestamp), 'HH:mm')}
                      </div>
                      <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-slate-950 border-2 border-slate-700 rounded-full" />
                      
                      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                          <BrainCircuit className="w-4 h-4 text-purple-400" />
                          <h4 className="font-bold text-slate-200 text-sm">{task.agent} Insight</h4>
                          <span className="ml-auto text-[10px] text-slate-600 font-mono">SHARP-TX: {task.id}</span>
                        </div>
                        <div className="prose prose-invert prose-xs line-clamp-3">
                          <ReactMarkdown>{task.output || ""}</ReactMarkdown>
                        </div>
                        <button 
                          onClick={() => { setActiveTab('dashboard'); setSelectedPatient(selectedPatient); }}
                          className="mt-4 text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                        >
                          View Full Analysis <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mcp' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">MCP Tool Registry</h3>
                  <p className="text-slate-500">Reusable Model Context Protocol tools for healthcare interoperability.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  Register New Tool
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MCP_TOOLS.map((tool, i) => (
                  <GlassCard key={i} className="group hover:border-blue-500/30 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                        <Database className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <button 
                        onClick={() => handleInvokeTool(tool.name)}
                        disabled={!!invokingTool}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all",
                          invokingTool === tool.name 
                            ? "bg-amber-500/20 text-amber-500 border-amber-500/30 animate-pulse"
                            : "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white"
                        )}
                      >
                        {invokingTool === tool.name ? "Invoking..." : "Invoke Tool"}
                      </button>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{tool.name}</h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">{tool.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Inputs</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.inputs.map(input => <span key={input} className="px-2 py-1 bg-slate-950 rounded text-[10px] text-slate-400 border border-slate-800">{input}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Outputs</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.outputs.map(output => <span key={output} className="px-2 py-1 bg-blue-500/5 rounded text-[10px] text-blue-400 border border-blue-500/20">{output}</span>)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <GlassCard title="Security & Compliance Audit Logs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                                <th className="pb-4 px-4">Timestamp</th>
                                <th className="pb-4 px-4">Agent/User</th>
                                <th className="pb-4 px-4">Action</th>
                                <th className="pb-4 px-4">Context</th>
                                <th className="pb-4 px-4">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-slate-300">{log.actor}</td>
                                    <td className="py-4 px-4 font-medium text-blue-400">{log.action}</td>
                                    <td className="py-4 px-4 text-slate-500 max-w-xs truncate">{log.context}</td>
                                    <td className="py-4 px-4"><Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'}>{log.status}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-2xl">
               <GlassCard title="Platform Settings">
                 <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">FHIR Endpoint Configuration</label>
                     <input 
                       disabled
                       type="text" 
                       value="https://hapi.fhir.org/baseR4" 
                       className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-blue-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Gemini Intelligence Model</label>
                     <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                           <BrainCircuit className="w-6 h-6 text-white" />
                         </div>
                         <div>
                            <p className="font-bold text-white">Gemini 3 Flash</p>
                            <p className="text-xs text-slate-500 underline">Switch to Gemini 3.1 Pro</p>
                         </div>
                       </div>
                       <Badge variant="success">Active</Badge>
                     </div>
                   </div>
                   <div className="pt-6 border-t border-slate-800">
                     <p className="text-[10px] text-slate-600 uppercase tracking-tighter leading-relaxed">
                       Warning: MedSync Nexus is an AI-powered care coordination platform. All generated recommendations and insights must be validated by a licensed physician or clinical professional before implementation.
                     </p>
                   </div>
                 </div>
               </GlassCard>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
