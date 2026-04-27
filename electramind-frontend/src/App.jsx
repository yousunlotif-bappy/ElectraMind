import { useState } from "react";
import {
  Home,
  GitCompare,
  Brain,
  BookOpen,
  Settings,
  BarChart3,
  Bot,
  Users,
  Scale,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./index.css";

const sidebarItems = [
  { icon: Home, label: "Dashboard" },
  { icon: Zap, label: "Simulator" },
  { icon: GitCompare, label: "What If Scenarios" },
  { icon: Scale, label: "Compare Systems" },
  { icon: Bot, label: "AI Tutor" },
  { icon: BookOpen, label: "Learning Mode" },
  { icon: BarChart3, label: "Visualizations" },
  { icon: Settings, label: "Settings" },
];

const chartColors = ["#8b5cf6", "#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#22c55e"];

function App() {
  const [candidateInput, setCandidateInput] = useState("A,B,C,D");
  const [voterInput, setVoterInput] = useState(1000);
  const [votingSystem, setVotingSystem] = useState("fptp");
  const [activeSystemName, setActiveSystemName] = useState("First-Past-The-Post");

  const [voteData, setVoteData] = useState([
    { name: "A", votes: 367, percent: 36.7 },
    { name: "B", votes: 285, percent: 28.5 },
    { name: "C", votes: 201, percent: 20.1 },
    { name: "D", votes: 147, percent: 14.7 },
  ]);

  const [winner, setWinner] = useState("A");
  const [totalVotes, setTotalVotes] = useState(1000);
  const [turnout, setTurnout] = useState(78.4);
  const [explanation, setExplanation] = useState(
    "Candidate A won because they received the highest number of first-choice votes."
  );

  const [comparison, setComparison] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  const lineData = [
    { time: "0%", votes: Math.round(totalVotes * 0.05) },
    { time: "25%", votes: Math.round(totalVotes * 0.3) },
    { time: "50%", votes: Math.round(totalVotes * 0.5) },
    { time: "75%", votes: Math.round(totalVotes * 0.75) },
    { time: "100%", votes: totalVotes },
  ];

  const runSimulation = async () => {
    const candidates = candidateInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (candidates.length < 2) {
      alert("Please enter at least 2 candidates.");
      return;
    }

    if (Number(voterInput) < 10) {
      alert("Please enter at least 10 voters.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates,
          voters: Number(voterInput),
          system: votingSystem,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setVoteData(data.voteData);
      setWinner(data.winner);
      setTotalVotes(data.totalVotes);
      setTurnout(data.turnout);
      setExplanation(data.explanation);
      setActiveSystemName(data.system);
      setComparison(data.comparison);
      setRoundHistory(data.roundHistory || []);
    } catch {
      alert("Backend connection failed. Make sure FastAPI is running.");
    }
  };

  const askAI = async () => {
    if (!question.trim()) {
      alert("Please write a question first.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAiAnswer(data.answer);
    } catch {
      alert("AI Tutor connection failed. Make sure backend /ask route exists.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b18] text-white flex">
      <aside className="w-72 min-h-screen border-r border-white/10 bg-[#0b1020] p-5 hidden lg:block">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Electra<span className="text-purple-400">Mind</span>
          </h1>
          <p className="text-sm text-gray-400">AI-Powered Election Simulator</p>
        </div>

        <nav className="space-y-3">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer ${
                  index === 0
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "hover:bg-white/10 text-gray-300"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-12 rounded-2xl bg-gradient-to-br from-purple-900/60 to-blue-900/40 p-5 border border-white/10">
          <h3 className="font-bold text-purple-200">Simulate. Understand.</h3>
          <h3 className="font-bold text-purple-200">Empower Democracy.</h3>
          <p className="text-sm text-gray-300 mt-3">
            Run elections, compare systems, and explore possibilities.
          </p>

          <button
            onClick={runSimulation}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-semibold"
          >
            Start Simulation →
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Welcome back! 👋</h2>
            <p className="text-gray-400">Let's explore how elections work.</p>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-purple-600 grid place-items-center">
              <Users size={20} />
            </div>
            <div>
              <p className="font-semibold">Explorer</p>
              <p className="text-xs text-gray-400">Curious Mind</p>
            </div>
          </div>
        </header>

        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-purple-400" />
            <h3 className="text-xl font-bold">Custom Simulation</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400">Candidates</label>
              <input
                value={candidateInput}
                onChange={(e) => setCandidateInput(e.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
                placeholder="A,B,C,D"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Number of Voters</label>
              <input
                type="number"
                value={voterInput}
                onChange={(e) => setVoterInput(e.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Voting System</label>
              <select
                value={votingSystem}
                onChange={(e) => setVotingSystem(e.target.value)}
                className="mt-2 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 outline-none"
              >
                <option value="fptp">FPTP</option>
                <option value="ranked">Ranked Choice</option>
                <option value="proportional">Proportional</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={runSimulation}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-semibold"
              >
                Run Simulation
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Simulations Run" value="24" icon="🎮" />
          <StatCard title="Selected System" value={activeSystemName} icon="⚖️" />
          <StatCard title="Total Voters" value={totalVotes.toLocaleString()} icon="👥" />
          <StatCard title="Turnout" value={`${turnout}%`} icon="🧠" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3 card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">Live Simulation</h3>
              <span className="text-sm text-green-400">● {activeSystemName}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="panel">
                <h4 className="font-semibold mb-4">Candidates</h4>

                {voteData.map((item) => (
                  <div key={item.name} className="flex justify-between py-3 text-sm">
                    <span>Candidate {item.name}</span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>

              <div className="panel text-center">
                <div className="text-4xl font-bold mt-8">
                  {totalVotes.toLocaleString()}
                </div>
                <p className="text-gray-400">Votes Counted</p>

                <div className="mt-6 text-purple-300 font-bold">{turnout}%</div>
                <p className="text-sm text-gray-400">Voter Turnout</p>

                <div className="mt-6 text-green-400 font-semibold">
                  Winner: Candidate {winner}
                </div>
              </div>

              <div className="panel">
                <h4 className="font-semibold mb-3">Live Progress</h4>
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={lineData}>
                    <XAxis dataKey="time" stroke="#777" />
                    <YAxis stroke="#777" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke="#a855f7"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <AITutor
            explanation={explanation}
            question={question}
            setQuestion={setQuestion}
            aiAnswer={aiAnswer}
            askAI={askAI}
          />
        </section>

        {roundHistory.length > 0 && (
          <section className="card">
            <div className="flex items-center gap-2 mb-4">
              <GitCompare className="text-purple-400" />
              <h3 className="text-xl font-bold">Ranked Choice Round History</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roundHistory.map((round) => (
                <div key={round.round} className="panel">
                  <h4 className="font-semibold mb-3">Round {round.round}</h4>

                  {Object.entries(round.votes).map(([candidate, votes]) => (
                    <div
                      key={candidate}
                      className="flex justify-between text-sm py-2 border-b border-white/5"
                    >
                      <span>Candidate {candidate}</span>
                      <span>{votes} votes</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Results Overview</h3>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={voteData}
                  dataKey="votes"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                >
                  {voteData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Results by Candidate</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={voteData}>
                <XAxis dataKey="name" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip />
                <Bar dataKey="votes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Turnout Insights</h3>
            <div className="text-5xl font-bold text-purple-300">{turnout}%</div>
            <p className="text-green-400 mt-3 font-semibold">Good Job!</p>
            <p className="text-gray-400 mt-2">
              Higher voter participation leads to stronger democracy.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">What If Scenario</h3>
            <p className="text-gray-400 mb-4">
              Change candidate names, voter count, or voting system above, then run the simulation again.
            </p>
            <button
              onClick={runSimulation}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
            >
              ▶ Run Scenario
            </button>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Compare Voting Systems</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <MiniCard
                title="FPTP"
                winner={
                  comparison?.fptp?.winner
                    ? `Candidate ${comparison.fptp.winner}`
                    : "Run simulation"
                }
                active={votingSystem === "fptp"}
              />

              <MiniCard
                title="Ranked Choice"
                winner={
                  comparison?.ranked?.winner
                    ? `Candidate ${comparison.ranked.winner}`
                    : "Run simulation"
                }
                active={votingSystem === "ranked"}
              />

              <MiniCard
                title="Proportional"
                winner={
                  comparison?.proportional?.winner
                    ? `Top: ${comparison.proportional.winner}`
                    : "Run simulation"
                }
                active={votingSystem === "proportional"}
              />
            </div>

            <p className="text-sm text-gray-400 mt-4">
              This comparison uses the same simulated voter preferences to show how different systems can create different outcomes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function AITutor({ explanation, question, setQuestion, aiAnswer, askAI }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-purple-400" />
        <h3 className="text-xl font-bold">AI Tutor</h3>
      </div>

      <div className="bg-purple-600 p-4 rounded-2xl text-sm mb-4">
        Why did the result happen?
      </div>

      <div className="bg-white/5 p-4 rounded-2xl text-sm text-gray-300">
        <p>{explanation}</p>
      </div>

      {aiAnswer && (
        <div className="mt-4 bg-green-500/10 border border-green-400/30 p-4 rounded-2xl text-sm text-green-100">
          <p>{aiAnswer}</p>
        </div>
      )}

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") askAI();
        }}
        className="mt-5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
        placeholder="Ask about FPTP, ranked, turnout..."
      />

      <button
        onClick={askAI}
        className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-semibold"
      >
        Ask AI Tutor
      </button>
    </div>
  );
}

function MiniCard({ title, winner, active }) {
  return (
    <div
      className={`p-4 rounded-2xl border ${
        active ? "border-green-400 bg-green-500/10" : "border-white/10 bg-white/5"
      }`}
    >
      <h4 className="font-bold">{title}</h4>
      <p className="text-sm text-gray-400 mt-2">Result</p>
      <p className="font-semibold">{winner}</p>
    </div>
  );
}

export default App;

