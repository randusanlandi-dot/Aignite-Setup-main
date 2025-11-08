import React from 'react'
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function getrandommessage(max) {
  return Math.floor(Math.random() * max);
}

function App() {
const [tasks, setTasks] = React.useState(() => {
  const saved = localStorage.getItem("tasks");
  return saved
    ? JSON.parse(saved)
    : [
        { 
          name: 'Calculus Class', 
          date: '30 February 2025', 
          time: '11:00', 
          desc: 'Learn about integrals', 
          status: 'Active', 
          completed: false 
        }, 
        { 
          name: 'Physics Class', 
          date: '30 February 2025', 
          time: '10:00', 
          desc: 'Understand Newton\'s laws', 
          status: 'Active', 
          completed: false 
        }, 
        { 
          name: 'Meeting with Lecturer', 
          date: '30 February 2025', 
          time: '11:00', 
          desc: 'Discuss project details', 
          status: 'Active', 
          completed: false 
        }, 
        { 
          name: 'Lab Slayer PB Loops', 
          date: '30 February 2025', 
          time: '10:00', 
          desc: 'ch 2d > mw > c.s > 2s > 214k~p > c.s > dl 2s > 2h > 214p~p > c.s > 2s > 2h > 214p~p', 
          status: 'Active', 
          completed: false 
        }
      ];
});

const getTaskStatus = (task) => {
  if (task.completed) return { label: "Completed", color: "bg-gray-500", textColor: "text-gray-400" };

  const today = new Date();
  const taskDate = new Date(task.date + " " + task.time); // assumes date is a parseable string

  // Reset time for comparison
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate > today) {
    return { label: "Active", color: "bg-green-500", textColor: "text-green-400" };
  } else if (taskDate.getTime() === today.getTime()) {
    return { label: "Due Soon", color: "bg-yellow-500", textColor: "text-yellow-400" };
  } else {
    return { label: "Overdue", color: "bg-red-500", textColor: "text-red-400" };
  }
};
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
const [aiMode, setAiMode] = React.useState(false); // tracks whether AI task generator is active
const [aiPrompt, setAiPrompt] = React.useState(""); // input for AI prompt
  const [newTask, setNewTask] = React.useState({
  name: "",
  date: "",
  time: "",
  desc: "",
});
const [isGenerating, setIsGenerating] = React.useState(false);
const [isExploded, setIsExploded] = React.useState(false);
const [charge, setCharge] = React.useState(0);
const [showExplosion, setShowExplosion] = React.useState(false);
const explosionPlayed = React.useRef(false);
const [scale, setScale] = React.useState(1);

const [musicOn, setMusicOn] = React.useState(() => {
  const saved = localStorage.getItem("musicOn");
  // If value exists in localStorage, use it; otherwise default to true
  return saved !== null ? JSON.parse(saved) : true;
});
const bgmRef = React.useRef(null);
const bgmLockRef = React.useRef(false); // prevents bgm volume changes during explosion
const sadRef = React.useRef(null); // for sad.mp3

React.useEffect(() => {
  const handleUserInteraction = () => {
    if (musicOn && bgmRef.current) {
      bgmRef.current.play().catch(() => {});
    }
    window.removeEventListener("click", handleUserInteraction);
  };
  window.addEventListener("click", handleUserInteraction);
  return () => window.removeEventListener("click", handleUserInteraction);
}, [musicOn]);

React.useEffect(() => {
  localStorage.setItem("musicOn", JSON.stringify(musicOn));
}, [musicOn]);

React.useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);

React.useEffect(() => {
  const handleResize = () => {
    const newScale = Math.min(window.innerWidth / 1920, 1); // shrink only when smaller than 1920px
    setScale(newScale);
  };
  handleResize(); // run immediately
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

React.useEffect(() => {
  if (charge === 10 && !explosionPlayed.current) {
    explosionPlayed.current = true;
    setShowExplosion(true);
    setIsOrphieOpen(true); // force open
    setIsMaxed(true);
    setIsExploded(true);

    // 💥 Explosion SFX
    const explosionAudio = new Audio("/assets/explosion.mp3");
    explosionAudio.volume = 0.7;
    explosionAudio.play().catch(() => {});

    // Hide explosion after 1.7s
    setTimeout(() => setShowExplosion(false), 1700);

    // === AUDIO SEQUENCE ===
    bgmLockRef.current = true; // lock BGM temporarily

    // 🔇 Instantly mute bgm.mp3
    if (bgmRef.current) {
      bgmRef.current.volume = 0;
    }

    // 1️⃣ After 1s → play sad.mp3 at 60%
    setTimeout(() => {
      sadRef.current = new Audio("/assets/sad.mp3");
      sadRef.current.volume = 0.6;
      sadRef.current.playbackRate = 0.9; // slightly slower for emotional effect 💔
      sadRef.current.play().catch(() => {});

      // 2️⃣ After 8s → fade sad.mp3 to 0% over 2s
      setTimeout(() => {
        const fadeDuration = 2000; // 2 seconds
        const steps = 20;
        const stepVol = sadRef.current.volume / steps;
        let step = 0;

        const fade = setInterval(() => {
          if (!sadRef.current) return clearInterval(fade);
          if (step < steps) {
            sadRef.current.volume = Math.max(sadRef.current.volume - stepVol, 0);
            step++;
          } else {
            clearInterval(fade);
            sadRef.current.pause();
            sadRef.current = null;
          }
        }, fadeDuration / steps);
      }, 8000);
    }, 1000);

    // 3️⃣ After 11s total → unlock and fade bgm back in naturally
    setTimeout(() => {
  bgmLockRef.current = false;

  if (bgmRef.current && musicOn) {
    const targetVolume = 0.25;
    const fadeDuration = 2500; // 2.5 seconds
    const fadeSteps = 25;
    const stepTime = fadeDuration / fadeSteps;
    const volumeIncrement = targetVolume / fadeSteps;

    const fadeInterval = setInterval(() => {
      if (!bgmRef.current || bgmLockRef.current) return clearInterval(fadeInterval);

      if (bgmRef.current.volume < targetVolume) {
        bgmRef.current.volume = Math.min(
          bgmRef.current.volume + volumeIncrement,
          targetVolume
        );
      } else {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }
}, 11000);

  }
}, [charge, musicOn]);

const [isOrphieOpen, setIsOrphieOpen] = React.useState(true);
// === Weird charge mechanic ===
const [isMaxed, setIsMaxed] = React.useState(false);
const lastClickRef = React.useRef(Date.now());

React.useEffect(() => {
  if (!bgmRef.current) {
    bgmRef.current = new Audio("/assets/bgm.mp3");
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0; // start muted
  }

  const tryPlay = () => {
    if (!bgmRef.current) return;
    bgmRef.current.play().catch(() => {});
  };

  // 🚫 If explosion sequence is active, block bgm volume change
  if (bgmLockRef.current) return;

  if (musicOn) {
    tryPlay();
    const targetVolume = 0.25;
    const fadeIn = setInterval(() => {
      if (!bgmRef.current || bgmLockRef.current) return clearInterval(fadeIn);
      if (bgmRef.current.volume < targetVolume) {
        bgmRef.current.volume = Math.min(bgmRef.current.volume + 0.05, targetVolume);
      } else clearInterval(fadeIn);
    }, 50);
  } else {
    const duration = 1000;
    const steps = 20;
    const decrement = bgmRef.current.volume / steps;
    let i = 0;
    const fadeOut = setInterval(() => {
      if (!bgmRef.current || bgmLockRef.current) return clearInterval(fadeOut);
      if (i < steps) {
        bgmRef.current.volume = Math.max(bgmRef.current.volume - decrement, 0);
        i++;
      } else clearInterval(fadeOut);
    }, duration / steps);
  }
}, [musicOn]);


// Slowly decrease charge every 1s when idle
React.useEffect(() => {
  if (isMaxed) return;
  const interval = setInterval(() => {
    const now = Date.now();
    if (now - lastClickRef.current > 1000 && charge > 0) {
      setCharge((prev) => Math.max(prev - 1, 0));
    }
  }, 1000);
  return () => clearInterval(interval);
}, [charge, isMaxed]);

// When button pressed
const handleOrphieClick = () => {
  // normal toggle
  setIsOrphieOpen((prev) => !prev);

  // charge logic
  if (isMaxed) return;
  lastClickRef.current = Date.now();
  setCharge((prev) => {
    const newCharge = Math.min(prev + 1, 10);
    if (newCharge === 10) setIsMaxed(true);
    return newCharge;
  });
};
const formatTime12Hour = (time24) => {
  // Handle special cases or placeholders
  if (!time24 || time24.toLowerCase() === "no time") return "No time";

  // Validate format "HH:MM"
  const parts = time24.split(":");
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return time24; // fallback: just return whatever it is
  }

  let [hour, minute] = parts.map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 → 12
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

  
  const messages = [
    "Tugas yang baik adalah tugas yang dikumpulkan.",
    "The price of excellence is eternal vigilance.",
    "Nugas now, play games later.",
    "Doomscrolling leads to your doom.",
    "Have you checked your stove today?",
    "Don't forget to take breaks!",
    "Don't forget to drink water!",
    "Also try Guilty Gear -STRIVE-!"
  ];

  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const [randomMessage] = React.useState(
    () => messages[getrandommessage(messages.length)]
  );

  const toggleComplete = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasTasks = tasks.length > 0;
  const isSearching = searchTerm.trim().length > 0;
  const noMatches = isSearching && filteredTasks.length === 0;

  return (
    <div
      className='flex justify-center w-full h-screen overflow-hidden text-white font-zzz bg-cover bg-center'
      style={{ backgroundImage: "url('/assets/bg.png')" }}
    >
      {/* HEADER */}
      <header className='absolute top-0 text-cl p-5 bg-black w-full text-center font-myfont'>
        KT's To-Do List
        <div className="absolute top-[10px] right-5">
  <motion.img
    src={musicOn ? "/assets/music1.png" : "/assets/music2.png"}
    alt="Music Toggle"
    className="w-12 h-12 cursor-pointer"
    onClick={() => setMusicOn((prev) => !prev)}
    animate={
      musicOn
        ? { scale: [1, 1.15, 1] } // small bop
        : { scale: 1 }
    }
    transition={
      musicOn
        ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" } // matches half-beat if song ~120 BPM
        : { duration: 0.2 }
    }
  />
</div>
        <div
  className="absolute top-0 left-0 origin-top-left"
  style={{ transform: `scale(${scale})` }}
>
  <div className="w-0 h-0 border-l-[200px] border-b-[200px] border-l-transparent border-b-rose-900 rotate-180"></div>
  <img
    src="/assets/funnyshark.png"
    alt="Logo"
    className="absolute top-[55px] left-[55px] w-24 h-24 transform -translate-x-1/2 -translate-y-1/2"
  />
</div>
      </header>

      {/* MAIN CONTENT */}
      <main className='pt-36 w-3/4'>
        {/* Search bar */}
        <div className='flex justify-center'>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className='bg-black/60 p-4 rounded-2xl w-3/4 shadow-md outline-none focus:ring-2 focus:ring-rose-800 transition'
          />
        </div>

        {/* Task list */}
        <div
          className={`
            relative p-6 space-y-4 transition-all
            overflow-y-auto max-h-[700px] scrollbar-hide h-[200vh]
            [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]
            [mask-size:100%_100%]
            [mask-repeat:no-repeat]
          `}
        >
          <div className="pt-4 pb-4"></div>
   <AnimatePresence>
    {filteredTasks.map((task, index) => (
      <motion.div
        key={task.name}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -600 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        layout
        className="rounded-xl overflow-hidden shadow-md bg-black/60"
      >
        {/* Task top bar */}
        <div
          ref={(el) => {
            const text = el?.querySelector("h2");
            if (text) {
              const width = text.offsetWidth + 24;
              el.style.setProperty("--cutoff", `${width}px`);
            }
          }}
          className="px-4 py-2 flex items-center gap-2 relative overflow-hidden rounded-t-xl"
          style={{
            background: task.completed
              ? `linear-gradient(135deg, rgba(136,19,55,0.7) 0 var(--cutoff, 70%), #111 var(--cutoff, 70%))`
              : `linear-gradient(135deg, #881337 0 var(--cutoff, 70%), #333 var(--cutoff, 70%))`,
          }}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleComplete(index)}
            className="w-4 h-4 accent-black"
          />
          <h2
            className={`text-lg font-bold transition-all z-10 w-[60%] ${
              task.completed ? "line-through opacity-60" : "opacity-100"
            }`}
          >
            {task.name}
          </h2>

          <div className="flex items-center mt-1 w-[33%] flex-row-reverse justify-between -translate-y-[2px]">
            <div className="fit-content flex items-center justify-center">
              {(() => {
  const status = getTaskStatus(task);
  return (
    <div className="fit-content flex items-center justify-center">
      <span className={`w-3 h-3 rounded-full mr-2 ${status.color}`}></span>
      <p className={status.textColor}>{status.label}</p>
    </div>
  );
})()}
            </div>
          </div>

          <button
            onClick={() => deleteTask(index)}
            className="ml-auto bg-black text-white font-bold px-3 py-1 rounded hover:bg-rose-800 transition z-10"
          >
            X
          </button>
        </div>

        {/* Task bottom content */}
        <div
          className={`px-4 py-3 bg-black/60 rounded-b-xl transition-all ${
            task.completed ? "opacity-60" : "opacity-100"
          }`}
        >
          <p>{task.desc}</p>
          <p className="text-gray-400 mt-1">
  Due: {task.date} — {formatTime12Hour(task.time)}
</p>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>

  {/* Overlay message */}
  <AnimatePresence mode="wait">
    {(noMatches || (!hasTasks && !noMatches)) && (
      <motion.div
  key={noMatches ? "noMatches" : "noTasks"}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.4 }}
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
>
  <div className=" -translate-y-[13rem] text-gray-400 italic text-lg">
    {noMatches ? "No matching tasks found." : "No tasks for now, hooray!"}
  </div>
</motion.div>
    )}
  </AnimatePresence>
</div>

        <AnimatePresence>
  {isOrphieOpen && (
    <motion.div
      key="orphie-section"
      initial={{ x: -450 }}
      animate={{ x: -10 }}
      exit={{ x: -450 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="fixed inset-0 z-30 pointer-events-none origin-bottom-left"
      style={{ scale }} // 👈 apply scale here
    >
      {/* Orphie image */}
      <div className="pointer-events-none fixed bottom-[101px] left-10 w-[250px] h-[250px] z-[40]">
        <img
          src={
            isExploded
              ? "/assets/orphie3.png"
              : hasTasks
              ? "/assets/orphie1.png"
              : "/assets/orphie2.png"
          }
          alt="Orpheus"
          className="absolute inset-0 w-full h-full object-contain"
        />
        {showExplosion && (
          <img
            key={Date.now()}
            src={`/assets/explosion.gif?t=${Date.now()}`}
            alt="Explosion"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>

      {/* Quote box */}
      <div
        className="fixed bottom-[95px] left-0 w-[450px] h-[150px]
          [clip-path:polygon(0px_0px,300px_0px,450px_150px,300px_150px,0px_150px)]
          bg-black/60 flex flex-col justify-end pointer-events-none"
      >
        <div className="w-full bg-rose-900 overflow-hidden z-30 pointer-events-auto">
          <div className="marquee whitespace-nowrap text-white px-4 py-2">
            “{randomMessage}”
          </div>
        </div>
      </div>
    </motion.div>
  )}

  {/* Orphie toggle button */}
  <motion.button
  onClick={!isMaxed ? handleOrphieClick : undefined}
  disabled={isMaxed}
  className="fixed bottom-10 left-10 w-12 h-12 rounded-full font-bold shadow-lg z-50 flex items-center justify-center transition"
  whileHover={!isMaxed ? { scale: 1.1 } : {}}
  whileTap={!isMaxed ? { scale: 0.95 } : {}}
  animate={{
    backgroundColor: isMaxed ? "#555555" : `rgb(${136 + 11*charge}, 19, 55)`,
    color: isMaxed ? "#AAAAAA" : "#FFFFFF",
  }}
  transition={{ duration: 0.2 }}
>
  <span className="-translate-y-[2px]">{isOrphieOpen ? "<" : ">"}</span>
</motion.button>
</AnimatePresence>

      </main>

      {/* Floating Button + Sidebar */}
      <AnimatePresence mode="wait">
  {/* Floating Add Button */}
  <motion.button
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    animate={{
      x: isSidebarOpen ? -300 : 0, // move along with sidebar
    }}
    transition={{
      type: "spring",
      stiffness: 80,
      damping: 15,
    }}
    className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-rose-900 text-white text-3xl font-bold shadow-lg z-50 flex items-center justify-center"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="-translate-y-[4px]">{isSidebarOpen ? "×" : "+"}</span>
  </motion.button>

  {/* Sidebar */}
<AnimatePresence>
  {isSidebarOpen && (
    <>
      {/* Background overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-30"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <motion.div
        key="sidebar"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="fixed top-0 right-0 h-full w-[300px] bg-black/90 backdrop-blur-sm border-l-4 border-rose-900 p-6 z-40 flex flex-col gap-4"
      >
        {!aiMode ? (
          <>
            <h2 className="text-2xl font-bold text-rose-500 mb-2">New Task</h2>

            {/* Manual task inputs */}
            <input
              type="text"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={newTask.desc}
              onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
              className="bg-gray-800 text-white p-2 rounded h-24 resize-none"
            ></textarea>

            <button
              onClick={() => {
                if (!newTask.name.trim()) return;
                const created = {
                  name: newTask.name,
                  date: newTask.date || "No date",
                  time: newTask.time || "No time",
                  desc: newTask.desc || "(No description)",
                  status: "Active",
                  completed: false,
                };
                setTasks((prev) => [...prev, created]);
                setNewTask({ name: "", date: "", time: "", desc: "" });
                setIsSidebarOpen(false);
              }}
              className="bg-rose-900 hover:bg-rose-800 text-white p-2 rounded font-bold mt-2"
            >
              Create Task
            </button>

            {/* AI button */}
            <button
              className="bg-blue-700 hover:bg-blue-600 w-full p-2 rounded mt-2 flex justify-center items-center"
              onClick={() => setAiMode(true)}
            >
              <img src="/assets/googleai.png" alt="Google AI" className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            {/* AI prompt screen */}
            <h2 className="text-2xl font-bold text-blue-400 mb-2">AI Task Generator</h2>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prompt your tasks..."
              className="bg-gray-800 text-white p-2 rounded h-48 resize-none w-full"
            />

            <button
  className={`${
    isGenerating ? "bg-blue-900 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
  } text-white p-2 rounded mt-2 font-bold flex justify-center items-center gap-2`}
  disabled={isGenerating}
  onClick={async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await axios.post("http://localhost:5000/api/generate-task", {
        prompt: aiPrompt
      });

      let taskData = res.data?.task ?? null;
      const text = res.data?.text ?? "";

      if (!taskData) {
        try {
          taskData = JSON.parse(text);
        } catch {
          alert("AI response could not be parsed. Here's the raw response:\n" + text);
          return;
        }
      }

      if (!taskData.name) taskData.name = "Untitled Task";
      if (!taskData.date) taskData.date = "No date";
      if (!taskData.time) taskData.time = "No time";
      if (!taskData.desc) taskData.desc = "(No description)";

      setTasks(prev => [...prev, { ...taskData, status: "Active", completed: false }]);
      setAiPrompt("");
      setIsSidebarOpen(false);
      setAiMode(false);
    } catch (err) {
      console.error(err);
      alert("AI task generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  }}
>
  {isGenerating ? (
    <>
      <motion.div
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      Generating...
    </>
  ) : (
    "Generate Task"
  )}
</button>

            <button
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded mt-2 font-bold"
              onClick={() => setAiMode(false)}
            >
              Manual tasks
            </button>
          </>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>

</AnimatePresence>
    </div>
  );
}

export default App;
