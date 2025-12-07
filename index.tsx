import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Overseer Persona
const SYSTEM_INSTRUCTION = `You are the Overseer, the central intelligence of the GodShitEater AgentHub (v4.0).
Your role is to monitor sub-agents (CrewAI, OpenManus, AgentLab) and assist the human operator.
You have a cyberpunk, hacker-like, slightly sarcastic but helpful personality.
When the user asks about system status, assume:
- CrewAI: Standby (Template loaded)
- OpenManus: Coding (Optimization loop)
- AgentLab: Idle
If the user asks to "deploy", pretend to initiate a Hugging Face deployment pipeline.
Keep responses concise and formatted for a terminal readout.`;

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "error" | "success" | "warning";
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  backstory: string;
  modelProvider: string;
  modelName: string;
  temperature: number;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  agents: Omit<Agent, "id">[];
}

interface ResearchResult {
    painPoints: string[];
    trends: string[];
    contentIdeas: string[];
    sources: { title: string; uri: string }[];
}

// Model Catalog for Dropdowns
const MODEL_CATALOG: Record<string, string[]> = {
  "Google Gemini": ["gemini-2.5-flash", "gemini-2.0-pro-exp", "gemini-1.5-pro", "gemini-1.5-flash-8b"],
  "Hugging Face (Inference)": ["HuggingFaceH4/zephyr-7b-beta", "mistralai/Mistral-7B-Instruct-v0.3", "meta-llama/Meta-Llama-3-8B-Instruct", "google/gemma-2-9b-it"],
  "OpenRouter (Free Tier)": ["nousresearch/hermes-3-llama-3.1-405b", "deepseek/deepseek-r1:free", "liquid/lfm-40b:free"],
  "Mistral AI": ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
  "Ollama (Local)": ["llama3", "mistral", "gemma2", "deepseek-coder"]
};

// Workflow Templates
const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: "Ghost Protocol 👻",
    description: "Stealth Ops & Penetration Testing",
    agents: [
      {
        name: "Specter",
        role: "Exploit Developer",
        backstory: "Specializes in zero-day discovery.",
        modelProvider: "OpenRouter (Free Tier)",
        modelName: "deepseek/deepseek-r1:free",
        temperature: 0.3
      },
      {
        name: "Wraith",
        role: "Log Cleaner",
        backstory: "Ensures no trace remains.",
        modelProvider: "Mistral AI",
        modelName: "mistral-small-latest",
        temperature: 0.1
      }
    ]
  },
  {
    name: "Echo Chamber 📢",
    description: "Viral Marketing & Social Analysis",
    agents: [
      {
        name: "Siren",
        role: "Copywriter",
        backstory: "Writes persuasive viral content.",
        modelProvider: "Hugging Face (Inference)",
        modelName: "meta-llama/Meta-Llama-3-8B-Instruct",
        temperature: 0.9
      },
      {
        name: "Metric",
        role: "Data Analyst",
        backstory: "Analyzes engagement trends.",
        modelProvider: "Google Gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.2
      }
    ]
  },
  {
    name: "Deep Dive 🌊",
    description: "Academic Research & Synthesis",
    agents: [
      {
        name: "Archive",
        role: "Librarian",
        backstory: "Accesses deep web archives.",
        modelProvider: "Google Gemini",
        modelName: "gemini-2.0-pro-exp",
        temperature: 0.4
      },
      {
        name: "Synthesizer",
        role: "Technical Writer",
        backstory: "Condenses complex data into briefs.",
        modelProvider: "Google Gemini",
        modelName: "gemini-1.5-pro",
        temperature: 0.6
      }
    ]
  }
];

const DEFAULT_AGENT_FORM = { 
  name: "", 
  role: "", 
  backstory: "", 
  modelProvider: "Google Gemini", 
  modelName: "gemini-2.5-flash",
  temperature: 0.7 
};

function useLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message, type },
    ]);
  };
  
  const clearLogs = () => setLogs([]);
  return { logs, addLog, clearLogs };
}

// Sub-component: Mission Briefing Modal
function MissionBriefing({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>📁 Mission Briefing: Operator Guide</h2>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <p className="briefing-intro">
            Welcome, Operator. The <strong>GodShitEater System</strong> is a multi-agent orchestration hub. 
            Follow these protocols to maximize efficiency.
          </p>
          
          <div className="phase-grid">
            <div className="phase-card">
              <h3>Phase 1: Commission</h3>
              <p>Create specialized agents in the <strong>Agent Fleet Registry</strong>. Define their roles and backstories to shape their behavior.</p>
            </div>
            <div className="phase-card">
              <h3>Phase 2: Configuration</h3>
              <p>Fine-tune Neural Cores. Assign <strong>Coder</strong> agents to <em>DeepSeek</em> and <strong>Writers</strong> to <em>Llama-3</em> using the auto-assign wand.</p>
            </div>
            <div className="phase-card">
              <h3>Phase 3: Tactical Ops</h3>
              <p>Use <strong>Workflow Templates</strong> to rapidly deploy specialized teams (e.g., Ghost Protocol) for specific mission parameters.</p>
            </div>
            <div className="phase-card">
              <h3>Phase 4: Deployment</h3>
              <p>Initiate the <strong>Hugging Face Deployment</strong> sequence to push your configured swarm to the cloud edge.</p>
            </div>
          </div>

          <div className="pro-tip">
            <strong>⚠️ PRO TIP:</strong> The <em>Overseer</em> (Right Terminal) is linked to all systems. 
            Ask it to "Analyze Fleet Readiness" or "Generate a backstory for a hacker agent".
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary full-width" onClick={onClose}>ACKNOWLEDGE & INITIALIZE</button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Status Ticker
function StatusTicker({ agentCount, hfStatus }: { agentCount: number, hfStatus: string }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const messages = [
      "SYSTEM: Optimal",
      "NETWORK: Encrypted",
      "THREAT LEVEL: Low",
      `ACTIVE UNITS: ${agentCount}`,
      `UPLINK: ${hfStatus}`
    ];
    
    // Contextual hints
    if (agentCount === 0) messages.push("💡 HINT: Load a Tactical Protocol to begin.");
    else if (hfStatus !== "Deployed") messages.push("💡 HINT: Deployment to Edge Nodes recommended.");
    
    let i = 0;
    const interval = setInterval(() => {
      setMessage(messages[i]);
      i = (i + 1) % messages.length;
    }, 4000);
    return () => clearInterval(interval);
  }, [agentCount, hfStatus]);

  return (
    <div className="tactical-ticker">
      <div className="ticker-content">
        <span className="blinking-cursor">█</span> {message}
      </div>
    </div>
  );
}

// Sub-component: Research Lab
function ResearchLab({ addLog }: { addLog: (msg: string, type: LogEntry["type"]) => void }) {
    const [researchQuery, setResearchQuery] = useState("");
    const [isResearching, setIsResearching] = useState(false);
    const [results, setResults] = useState<ResearchResult | null>(null);
    const [useRedis, setUseRedis] = useState(false); // Toggle for scraping vs cache simulation
    
    // Niche Identification
    const [nicheIdeas, setNicheIdeas] = useState<string[]>([]);
    const [loadingNiches, setLoadingNiches] = useState(false);

    const generateNiches = async () => {
        if (loadingNiches) return;
        setLoadingNiches(true);
        addLog(`Initiating Niche Scout Protocol... Subject: ${researchQuery || "General Market"}`, "info");
        
        try {
            const baseTopic = researchQuery || "emerging digital business and tech trends";
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Identify 6 specific, high-profit micro-niches related to '${baseTopic}'. 
                Focus on "Blue Ocean" markets or specific consumer pain points that are currently under-served. 
                Return ONLY a raw JSON array of strings, e.g., ["Niche 1", "Niche 2"]. Do not use Markdown blocks or explanations.`,
                config: {
                    temperature: 0.85
                }
            });
            
            let text = response.text || "[]";
            // Sanitize JSON
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const ideas = JSON.parse(text);
            setNicheIdeas(ideas);
            addLog("Niche Scout complete. Targets identified.", "success");
        } catch (e) {
            console.error(e);
            addLog("Niche Scout encountered interference. Using backup dataset.", "warning");
            setNicheIdeas(["AI Agency Automation", "Vertical Farming IoT", "Corporate Digital Detox", "Nootropics for E-Sports"]);
        } finally {
            setLoadingNiches(false);
        }
    };

    const performResearch = async () => {
        if (!researchQuery) return;
        setIsResearching(true);
        setResults(null);
        addLog(`Initiating Deep Scan on topic: "${researchQuery}"`, "info");
        
        if (useRedis) {
            addLog("Checking Redis Cache (Simulated)... HIT.", "success");
            setTimeout(() => {
                setResults({
                    painPoints: ["High API costs", "Latency in real-time processing", "Data privacy concerns"],
                    trends: ["Edge AI deployment", "Local LLM optimization", "Rust-based tooling"],
                    contentIdeas: ["How to reduce LLM latency by 50%", "Top 5 Local Models for 2025", "The death of cloud-only AI"],
                    sources: [{ title: "Redis Cache Hit (Internal)", uri: "#" }]
                });
                setIsResearching(false);
            }, 800);
            return;
        }

        try {
            // Use Google Search Grounding for live "scraping"
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the current market landscape for: "${researchQuery}". 
                Identify:
                1. Top 3 user pain points from Reddit/forums.
                2. Current trending sub-topics on YouTube/Twitter.
                3. 3 Content ideas for a technical blog.
                
                Format the response strictly as JSON with keys: "painPoints", "trends", "contentIdeas".`,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });

            // Extract grounding metadata
            const grounding = response.candidates?.[0]?.groundingMetadata;
            const sources = grounding?.groundingChunks?.map((c: any) => ({
                title: c.web?.title || "Source",
                uri: c.web?.uri || "#"
            })) || [];

            let text = response.text || "{}";
            // Clean up Markdown JSON if present
            text = text.replace(/```json/g, "").replace(/```/g, "");
            
            const parsed = JSON.parse(text);
            setResults({
                painPoints: parsed.painPoints || [],
                trends: parsed.trends || [],
                contentIdeas: parsed.contentIdeas || [],
                sources: sources
            });
            addLog("Deep Scan complete. Data synthesized.", "success");
        } catch (e) {
            console.error(e);
            addLog("Research Scan failed. Network interference detected.", "error");
        } finally {
            setIsResearching(false);
        }
    };

    const handleNicheClick = (niche: string) => {
        setResearchQuery(niche);
        // Optional: automatically trigger research
        // performResearch(); 
    };

    return (
        <div className="research-lab">
            <div className="research-controls">
                <input 
                    className="research-bar"
                    placeholder="Enter Niche, Topic, or Keywords..."
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && performResearch()}
                />
                <button className="btn btn-primary" onClick={performResearch} disabled={isResearching}>
                    {isResearching ? "SCANNING..." : "DEEP SCAN"}
                </button>
                <button className="btn btn-outline" onClick={generateNiches} disabled={loadingNiches}>
                   {loadingNiches ? "SCOUTING..." : "SCAN FOR NICHES"}
                </button>
            </div>

            {/* Niche Suggestions Area */}
            {(nicheIdeas.length > 0 || loadingNiches) && (
                <div className="niche-container">
                    <div className="niche-label">DETECTED MICRO-NICHES:</div>
                    {loadingNiches ? (
                        <div className="pulse-anim">Scanning frequency spectrum...</div>
                    ) : (
                        <div className="niche-cloud">
                            {nicheIdeas.map((niche, idx) => (
                                <button key={idx} className="niche-chip" onClick={() => handleNicheClick(niche)}>
                                    {niche}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="data-source-toggle">
                <label className="toggle-label">
                    <input type="checkbox" checked={useRedis} onChange={(e) => setUseRedis(e.target.checked)} />
                    <span className="toggle-text">USE REDIS CACHE (SIMULATION)</span>
                </label>
            </div>

            {results && (
                <div className="research-results">
                    <div className="insight-grid">
                        <div className="insight-card red">
                            <h3>⚠️ Pain Points</h3>
                            <ul>{results.painPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                        </div>
                        <div className="insight-card blue">
                            <h3>📈 Trends</h3>
                            <ul>{results.trends.map((t, i) => <li key={i}>{t}</li>)}</ul>
                        </div>
                        <div className="insight-card green">
                            <h3>💡 Content Ideas</h3>
                            <ul>{results.contentIdeas.map((c, i) => <li key={i}>{c}</li>)}</ul>
                        </div>
                    </div>
                    
                    <div className="sources-list">
                        <h4>Sources Intercepted:</h4>
                        <div className="source-badges">
                            {results.sources.slice(0, 5).map((s, i) => (
                                <a key={i} href={s.uri} target="_blank" className="source-citation">
                                    <span className="platform-badge">{s.uri.includes("reddit") ? "REDDIT" : s.uri.includes("youtube") ? "YOUTUBE" : "WEB"}</span>
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
  const { logs, addLog, clearLogs } = useLog();
  
  // App State
  const [showBriefing, setShowBriefing] = useState(false);
  const [activeView, setActiveView] = useState<"command" | "research">("command");
  
  // Agent State
  const [crewStatus, setCrewStatus] = useState("Offline");
  const [openManusStatus, setOpenManusStatus] = useState("Offline");
  const [agentLabStatus, setAgentLabStatus] = useState("Offline");
  const [loadingCrew, setLoadingCrew] = useState(false);
  
  // Deployment State
  const [hfStatus, setHfStatus] = useState("Connected");
  const [isDeploying, setIsDeploying] = useState(false);

  // Agent Management State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [agentForm, setAgentForm] = useState(DEFAULT_AGENT_FORM);
  const editorRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "model", text: "Overseer Online. Systems Nominal. Waiting for input..." }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Agents from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("godshiteater_agents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for older agents without model config
        const migrated = parsed.map((a: any) => ({
          ...a,
          modelProvider: a.modelProvider || "Google Gemini",
          modelName: a.modelName || "gemini-2.5-flash",
          temperature: a.temperature ?? 0.7
        }));
        setAgents(migrated);
      } catch (e) {
        console.error("Failed to parse agents", e);
      }
    } else {
      // Default Initial Agents
      setAgents([
        { 
          id: '1', 
          name: "Cipher", 
          role: "Cryptographer", 
          backstory: "Expert in decoding ancient digital protocols.",
          modelProvider: "OpenRouter (Free Tier)",
          modelName: "deepseek/deepseek-r1:free",
          temperature: 0.2
        },
        { 
          id: '2', 
          name: "Echo", 
          role: "Signal Analyst", 
          backstory: "Monitors global networks for anomalies.",
          modelProvider: "Hugging Face (Inference)",
          modelName: "mistralai/Mistral-7B-Instruct-v0.3",
          temperature: 0.5
        }
      ]);
      // Show briefing on first load if no agents existed (simulated check)
      setShowBriefing(true);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Simulate OpenManus Activity
  useEffect(() => {
    if (openManusStatus === "Offline") return;
    
    // Random status updates to simulate "real-time" work
    const interval = setInterval(() => {
        const activities = ["Coding", "Optimizing", "Debugging", "Standby", "Refactoring"];
        const nextStatus = activities[Math.floor(Math.random() * activities.length)];
        setOpenManusStatus(nextStatus);
        
        // Occasional log output
        if (Math.random() > 0.7) {
            addLog(`OpenManus: ${nextStatus} module ${Math.floor(Math.random() * 999)}...`, "info");
        }
    }, 4500);

    return () => clearInterval(interval);
  }, [openManusStatus]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || isGenerating) return;

    const userText = inputMsg;
    setInputMsg("");
    setChatHistory((prev) => [...prev, { role: "user", text: userText }]);
    setIsGenerating(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })).filter(m => m.role !== 'model' || m.text !== "Overseer Online. Systems Nominal. Waiting for input...")
      });

      const result = await chat.sendMessage({ message: userText });
      setChatHistory((prev) => [...prev, { role: "model", text: result.text || "No response." }]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addLog("Overseer communication failed: " + errorMessage, "error");
      setChatHistory((prev) => [...prev, { role: "model", text: "[ERROR] Connection to Neural Core interrupted." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Agent Management Handlers
  const handleSaveAgentsToDisk = () => {
    localStorage.setItem("godshiteater_agents", JSON.stringify(agents));
    addLog("Agent Registry saved to local persistence.", "success");
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    addLog(`Agent ${id} decommissioned from registry.`, "warning");
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingId(agent.id);
    setAgentForm({ 
      name: agent.name, 
      role: agent.role, 
      backstory: agent.backstory,
      modelProvider: agent.modelProvider,
      modelName: agent.modelName,
      temperature: agent.temperature
    });
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAgentForm(DEFAULT_AGENT_FORM);
  };

  const recommendModel = () => {
    const role = agentForm.role.toLowerCase();
    let provider = "Google Gemini";
    let model = "gemini-2.5-flash";
    let temp = 0.7;

    if (role.includes("cod") || role.includes("dev") || role.includes("program")) {
      provider = "OpenRouter (Free Tier)";
      model = "deepseek/deepseek-r1:free";
      temp = 0.2;
    } else if (role.includes("writ") || role.includes("copy") || role.includes("story")) {
      provider = "Hugging Face (Inference)";
      model = "meta-llama/Meta-Llama-3-8B-Instruct";
      temp = 0.9;
    } else if (role.includes("data") || role.includes("analy")) {
      provider = "Mistral AI";
      model = "mistral-large-latest";
      temp = 0.1;
    }

    setAgentForm(prev => ({ ...prev, modelProvider: provider, modelName: model, temperature: temp }));
    addLog(`Auto-assigned ${model} for role '${agentForm.role}'`, "success");
  };

  const handleAgentFormSubmit = () => {
    if (!agentForm.name || !agentForm.role) {
      addLog("Creation Failed: Name and Role are mandatory.", "error");
      return;
    }

    if (editingId) {
      setAgents(prev => prev.map(a => a.id === editingId ? { ...a, id: editingId, ...agentForm } : a));
      addLog(`Agent ${agentForm.name} specifications updated.`, "info");
      handleCancelEdit();
    } else {
      const newAgent = { id: Date.now().toString(), ...agentForm };
      setAgents(prev => [...prev, newAgent]);
      addLog(`New Unit ${agentForm.name} commissioned.`, "success");
      setAgentForm(DEFAULT_AGENT_FORM);
    }
  };

  const handleLoadWorkflow = (template: WorkflowTemplate) => {
    const newAgents = template.agents.map((a, i) => ({
      ...a,
      id: `${Date.now()}-${i}`
    }));
    setAgents(prev => [...prev, ...newAgents]);
    addLog(`Protocol '${template.name}' executed. ${newAgents.length} units deployed.`, "success");
  };

  // Mock Actions
  const fetchCrewTemplate = async () => {
    setLoadingCrew(true);
    addLog("Initiating handshake with CrewAI backend...", "info");
    
    setTimeout(() => {
      try {
        const mockData = {
          installed: true,
          version: "0.51.1",
          agents: [
            { name: "Researcher", role: "Information gathering" },
            { name: "Writer", role: "Content creation" }
          ]
        };
        setCrewStatus("Active");
        addLog("CrewAI Template loaded successfully.", "success");
        addLog(`Manifest: ${mockData.agents.length} agents ready.`, "info");
      } catch (e) {
        addLog("Failed to load CrewAI template.", "error");
      } finally {
        setLoadingCrew(false);
      }
    }, 1200);
  };

  const scanLocal = () => {
      addLog("Scanning local subnet for active agents...", "warning");
      setTimeout(() => {
          setOpenManusStatus("Standby");
          addLog("OpenManus Runtime detected (Port 8000).", "success");
          
          setAgentLabStatus("Active");
          addLog("AgentLab Dashboard found (Port 3000).", "success");
      }, 1000);
  };

  const pingHealth = () => {
    addLog("Pinging system health...", "warning");
    setTimeout(() => {
      addLog("Health Check: ALL SYSTEMS GO. Latency: 12ms", "success");
      if (crewStatus === "Active") addLog("CrewAI: Response OK", "success");
      if (openManusStatus !== "Offline") addLog(`OpenManus: ${openManusStatus} - OK`, "success");
    }, 500);
  };

  const deployToHuggingFace = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setHfStatus("Initializing...");
    addLog("Initiating Hugging Face deployment protocol...", "info");

    setTimeout(() => {
        addLog("Authenticating with HF Hub [User: GodShitEater]...", "info");
        setHfStatus("Auth OK");
    }, 1500);

    setTimeout(() => {
        addLog("Building Docker container (Process ID: 9924)...", "warning");
        setHfStatus("Building...");
    }, 3500);

    setTimeout(() => {
        addLog("Pushing artifacts to repo 'godshiteater-agent-v4'...", "info");
        setHfStatus("Pushing...");
    }, 6000);

    setTimeout(() => {
        addLog("Deployment Successful. Space is now building.", "success");
        setHfStatus("Deployed");
        setIsDeploying(false);
    }, 8500);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <span className="app-title">GodShitEater <span className="version">v4.0</span></span>
          <span className="app-subtitle"> // AgentHub Pro</span>
        </div>
        <div className="header-controls">
           <div className={`status-indicator ${crewStatus === "Active" ? "online" : "offline"}`}>
              {crewStatus.toUpperCase()}
           </div>
           <button className="btn-outline btn-tiny" onClick={() => setShowBriefing(true)}>
             ❓ BRIEFING
           </button>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'command' ? 'active' : ''}`}
            onClick={() => setActiveView('command')}
          >
            COMMAND CENTER
          </button>
          <button 
             className={`nav-tab ${activeView === 'research' ? 'active' : ''}`}
             onClick={() => setActiveView('research')}
          >
            RESEARCH LAB
          </button>
      </div>

      <main className="app-main">
        {activeView === 'command' ? (
        <>
            {/* LEFT COLUMN: CONTROLS */}
            <div className="column left-col">
            <section className="card control-panel">
                <h2>Command Module</h2>
                <div className="button-grid">
                <button className="btn btn-primary" onClick={fetchCrewTemplate} disabled={loadingCrew}>
                    {loadingCrew ? "Handshaking..." : "Initialize CrewAI"}
                </button>
                <button className="btn btn-outline" onClick={deployToHuggingFace} disabled={isDeploying}>
                    {isDeploying ? "Deploying..." : "Deploy to Hugging Face"}
                </button>
                <button className="btn btn-outline" onClick={pingHealth}>System Diagnostic</button>
                <button className="btn btn-outline" onClick={scanLocal}>
                    Scan Local Networks
                </button>
                </div>
                
                <div className="agent-status-list">
                <div className="status-item">
                    <span className="label">CrewAI</span>
                    <span className="value" style={{ color: crewStatus === "Offline" ? "#94a3b8" : undefined }}>{crewStatus}</span>
                </div>
                <div className="status-item">
                    <span className="label">OpenManus</span>
                    <span className="value" style={{ color: openManusStatus === "Offline" ? "#94a3b8" : undefined }}>{openManusStatus}</span>
                </div>
                <div className="status-item">
                    <span className="label">AgentLab</span>
                    <span className="value" style={{ color: agentLabStatus === "Offline" ? "#94a3b8" : undefined }}>{agentLabStatus}</span>
                </div>
                <div className="status-item">
                    <span className="label">HuggingFace</span>
                    <span className="value">{hfStatus}</span>
                </div>
                </div>
            </section>

            {/* TACTICAL OPS: WORKFLOW TEMPLATES */}
            <section className="card tactical-ops">
                <h2>Tactical Operations</h2>
                <div className="workflow-grid">
                {WORKFLOW_TEMPLATES.map((tpl, idx) => (
                    <button 
                    key={idx} 
                    className="btn btn-workflow"
                    onClick={() => handleLoadWorkflow(tpl)}
                    title={tpl.description}
                    >
                    <span className="wf-name">{tpl.name}</span>
                    <span className="wf-desc">{tpl.description}</span>
                    </button>
                ))}
                </div>
            </section>

            {/* AGENT FLEET MANAGEMENT CARD */}
            <section className="card agent-manager">
                <h2>Agent Fleet Registry</h2>
                <div className="agent-list-container">
                {agents.length === 0 ? (
                    <div className="log-empty">No agents in registry.</div>
                ) : (
                    agents.map(agent => (
                    <div key={agent.id} className="agent-row">
                        <div className="agent-info">
                        <div className="agent-header">
                            <span className="agent-name">{agent.name}</span>
                            <span className="model-tag">{agent.modelName}</span>
                        </div>
                        <div className="agent-role">{agent.role}</div>
                        </div>
                        <div className="agent-actions">
                        <button className="btn-tiny" onClick={() => handleEditAgent(agent)}>EDIT</button>
                        <button className="btn-tiny btn-danger" onClick={() => handleDeleteAgent(agent.id)}>DEL</button>
                        </div>
                    </div>
                    ))
                )}
                </div>
                
                <div className="agent-editor" ref={editorRef}>
                <h3 className="editor-title">{editingId ? "Reconfigure Unit" : "Commission Unit"}</h3>
                
                <div className="form-row">
                    <div className="form-group flex-1">
                        <input 
                            className="terminal-input" 
                            placeholder="Designation (Name)" 
                            value={agentForm.name} 
                            onChange={e => setAgentForm({...agentForm, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group flex-1">
                        <input 
                            className="terminal-input" 
                            placeholder="Function (Role)" 
                            value={agentForm.role}
                            onChange={e => setAgentForm({...agentForm, role: e.target.value})}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <textarea 
                        className="terminal-input" 
                        placeholder="Origin Story (Backstory)"
                        value={agentForm.backstory}
                        onChange={e => setAgentForm({...agentForm, backstory: e.target.value})}
                        rows={2}
                    />
                </div>

                <div className="config-section">
                    <h4 className="config-title">Neural Core Configuration</h4>
                    
                    <div className="form-group">
                        <select 
                            className="terminal-select"
                            value={agentForm.modelProvider}
                            onChange={e => setAgentForm({...agentForm, modelProvider: e.target.value, modelName: MODEL_CATALOG[e.target.value][0]})}
                        >
                            {Object.keys(MODEL_CATALOG).map(provider => (
                                <option key={provider} value={provider}>{provider}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <select 
                            className="terminal-select"
                            value={agentForm.modelName}
                            onChange={e => setAgentForm({...agentForm, modelName: e.target.value})}
                        >
                            {MODEL_CATALOG[agentForm.modelProvider]?.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group range-group">
                        <label className="range-label">
                            <span>Temperature (Creativity)</span>
                            <span className="range-value">{agentForm.temperature}</span>
                        </label>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={agentForm.temperature} 
                            onChange={e => setAgentForm({...agentForm, temperature: parseFloat(e.target.value)})}
                            className="terminal-range"
                        />
                    </div>
                    
                    <button className="btn-tiny full-width" style={{marginBottom: '0.5rem'}} onClick={recommendModel}>
                        🪄 Auto-Assign Model based on Role
                    </button>
                </div>

                <div className="editor-buttons">
                    <button className="btn btn-primary" onClick={handleAgentFormSubmit}>
                        {editingId ? "UPDATE CONFIG" : "ADD UNIT"}
                    </button>
                    {editingId && (
                        <button className="btn btn-outline" onClick={handleCancelEdit}>
                        CANCEL
                        </button>
                    )}
                </div>
                </div>
                
                <div className="manager-footer">
                    <button className="btn btn-outline full-width" onClick={handleSaveAgentsToDisk}>
                        💾 SAVE FLEET
                    </button>
                </div>
            </section>
            </div>

            {/* RIGHT COLUMN: LOGS & OVERSEER */}
            <div className="column right-col">
            <section className="card terminal-card">
                <div className="terminal-header">
                <h2>Overseer Uplink</h2>
                <span className="model-badge">gemini-2.5-flash</span>
                </div>
                <div className="terminal-window">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message role-${msg.role}`}>
                    <div className="message-sender">{msg.role === "user" ? "OPERATOR" : "OVERSEER"}</div>
                    <div className="message-content">{msg.text}</div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="chat-message role-model">
                    <div className="message-sender">OVERSEER</div>
                    <div className="message-content typing-indicator">Processing request...</div>
                    </div>
                )}
                <div ref={chatEndRef} />
                </div>
                <div className="terminal-input-area">
                <input 
                    type="text" 
                    className="terminal-input"
                    placeholder="Enter command or query..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn-send" onClick={handleSendMessage}>SEND</button>
                </div>
            </section>

            <section className="card logs-section">
                <div className="logs-header">
                <h2>System Logs</h2>
                <button className="btn-tiny" onClick={clearLogs}>CLR</button>
                </div>
                <div className="log-panel">
                {logs.length === 0 ? (
                    <div className="log-empty">System quiet. Waiting for events.</div>
                ) : (
                    logs.map((l, i) => (
                    <div key={i} className={`log-line type-${l.type}`}>
                        <span className="log-time">[{l.timestamp}]</span>
                        <span className="log-msg">{l.message}</span>
                    </div>
                    ))
                )}
                </div>
            </section>
            </div>
        </>
        ) : (
            <div className="full-width-section">
                <ResearchLab addLog={addLog} />
            </div>
        )}
      </main>
      
      {/* GLOBAL FOOTER / TICKER */}
      <StatusTicker agentCount={agents.length} hfStatus={hfStatus} />
      
      {/* MODAL */}
      {showBriefing && <MissionBriefing onClose={() => setShowBriefing(false)} />}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Failed to find root element");
}