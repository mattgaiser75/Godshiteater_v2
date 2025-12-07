from __future__ import annotations

from typing import Any, Dict

try:
    from crewai import Agent, Task, Crew
except ImportError:  # crewai is optional
    Agent = Task = Crew = None  # type: ignore


def build_sample_crew() -> Dict[str, Any]:
    """Return a simple crew definition or a stub if crewai is missing."""
    if Crew is None:
        return {
            "installed": False,
            "message": "crewai not installed. Add `crewai` to backend/requirements.txt and rebuild.",
        }

    researcher = Agent(
        role="Topic Researcher",
        goal="Find 3 fresh AI + automation ideas from the web",
        backstory="You live on the bleeding edge of AI tools and indie hacking.",
    )

    planner = Agent(
        role="Launch Planner",
        goal="Turn raw ideas into a concrete mini-launch plan",
        backstory="You think in lean experiments and fast validation.",
    )

    t1 = Task(
        description="Collect 3 promising AI automation product ideas with 2–3 bullet notes each.",
        expected_output="JSON with keys: ideas: [ {title, notes[]} ]",
        agent=researcher,
    )

    t2 = Task(
        description="Take the ideas and propose a step-by-step 3‑day launch plan for the best one.",
        expected_output="Markdown launch plan with bullets and simple timeline.",
        agent=planner,
    )

    crew = Crew(
        agents=[researcher, planner],
        tasks=[t1, t2],
        process="sequential",
    )

    return {
        "installed": True,
        "agents": [a.role for a in crew.agents],
        "tasks": [t.description for t in crew.tasks],
    }
