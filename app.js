const e = React.createElement;

function useLog() {
  const [lines, setLines] = React.useState([]);
  const log = React.useCallback((msg) => {
    setLines((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${msg}`]);
  }, []);
  const clear = React.useCallback(() => setLines([]), []);
  return { lines, log, clear };
}

function App() {
  const [crewTemplate, setCrewTemplate] = React.useState(null);
  const [loadingCrew, setLoadingCrew] = React.useState(false);
  const { lines, log, clear } = useLog();

  const fetchCrewTemplate = async () => {
    try {
      setLoadingCrew(true);
      log("Fetching CrewAI template from backend…");
      const res = await fetch("/crew/template");
      const data = await res.json();
      setCrewTemplate(data);
      if (data.installed) {
        log("CrewAI installed — sample crew template loaded.");
      } else {
        log("CrewAI not installed — backend returned stub template.");
      }
    } catch (err) {
      console.error(err);
      log("Error while loading crew template.");
    } finally {
      setLoadingCrew(false);
    }
  };

  const pingHealth = async () => {
    try {
      log("Pinging /health…");
      const res = await fetch("/health");
      const data = await res.json();
      log("Health: " + JSON.stringify(data));
    } catch (err) {
      log("Health check failed.");
    }
  };

  const listAgents = async () => {
    try {
      log("Fetching /agents…");
      const res = await fetch("/agents");
      const data = await res.json();
      log("Agents: " + JSON.stringify(data));
    } catch (err) {
      log("Failed to list agents.");
    }
  };

  return (
    React.createElement("div", { className: "app-shell" },
      React.createElement("header", { className: "app-header" },
        React.createElement("div", null,
          React.createElement("span", { className: "app-title" }, "GodShitEater · AgentHub Pro v3.6"),
          React.createElement("span", { className: "app-badge" }, "Crew + HF + GitHub wired")
        ),
        React.createElement("div", null,
          React.createElement("button", { className: "btn-outline btn", onClick: pingHealth }, "Ping API"),
          React.createElement("button", { className: "btn-outline btn", onClick: listAgents }, "List Agents")
        )
      ),
      React.createElement("main", { className: "app-main" },
        React.createElement("section", { className: "card" },
          React.createElement("h2", null, "Agent Platforms"),
          React.createElement("div", { className: "platform-list" },
            React.createElement("div", { className: "badge-pill" },
              React.createElement("span", null, "🧠"),
              React.createElement("span", null, "OpenManus – code agent")
            ),
            React.createElement("div", { className: "badge-pill" },
              React.createElement("span", null, "🕸"),
              React.createElement("span", null, "AgentLabUI – visual graphs")
            ),
            React.createElement("div", { className: "badge-pill" },
              React.createElement("span", null, "👥"),
              React.createElement("span", null, "CrewAI – multi-agent orchestrator")
            ),
            React.createElement("div", { className: "badge-pill" },
              React.createElement("span", null, "⚙️"),
              React.createElement("span", null, "HTTP / Tools – external APIs")
            ),
          ),
          React.createElement("div", { style: { marginTop: "0.75rem" } },
            React.createElement("button", { className: "btn", onClick: fetchCrewTemplate, disabled: loadingCrew },
              loadingCrew ? "Loading Crew Template…" : "Load Crew Template"
            )
          ),
          crewTemplate && (
            React.createElement("div", { className: "crew-preview" },
              React.createElement("div", null, "CrewAI installed: ", String(!!crewTemplate.installed)),
              React.createElement("pre", null, JSON.stringify(crewTemplate, null, 2))
            )
          )
        ),
        React.createElement("section", { className: "card" },
          React.createElement("h2", null, "Deploy & Logs"),
          React.createElement("p", { style: { fontSize: "0.8rem", opacity: 0.8 } },
            "Use the Termux widgets for: secrets → HF deploy → GitHub push → status. ",
            "This panel just mirrors live backend calls."
          ),
          React.createElement("div", { style: { marginBottom: "0.5rem" } },
            React.createElement("button", { className: "btn-outline btn", onClick: clear }, "Clear log")
          ),
          React.createElement("div", { className: "log-panel" },
            lines.length === 0
              ? "No activity yet. Hit the buttons above to talk to the backend."
              : lines.map((l, i) => React.createElement("div", { key: i }, l))
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
