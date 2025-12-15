import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, ChevronRight, Youtube, Info, Filter, RefreshCw, Unlock, 
  Timer, Play, Pause, RotateCcw, X, Edit3, Check, ArrowUp, ArrowDown, 
  ArrowRight, Settings, Download, Upload, Link as LinkIcon, Unlink, 
  Plus, User, Smartphone, Menu, Trash2, Save, CheckCircle2, Trophy,
  BookOpen, Calendar, Activity, BarChart3, ArrowRightCircle
} from 'lucide-react';

// --- CONFIGURACIÓN & DATOS ---

const CATEGORIES = [
  "Horizontal Push", "Incline Push", "Vertical Push", 
  "Vertical Pull", "Horizontal Pull", 
  "Side Delts", "Rear Delts", 
  "Triceps", "Biceps", 
  "Quads", "Hamstrings", "Glutes", "Calves", "Abs"
];

const DEFAULT_STRUCTURE = {
  1: ["Horizontal Push", "Vertical Pull", "Quads", "Hamstrings", "Side Delts"],
  2: ["Vertical Push", "Horizontal Pull", "Glutes", "Triceps", "Biceps"],
  3: ["Incline Push", "Vertical Pull", "Quads", "Hamstrings", "Calves"],
  4: ["Horizontal Push", "Horizontal Pull", "Side Delts", "Triceps", "Biceps"]
};

// Series iniciales recomendadas (MEV)
const INITIAL_SETS_CONFIG = {
    "Quads": 3, "Chest": 3, "Horizontal Push": 2, "Incline Push": 2, "Vertical Push": 2,
    "Vertical Pull": 2, "Horizontal Pull": 2, "Hamstrings": 2, "Glutes": 2,
    "Side Delts": 3, "Rear Delts": 3, "Biceps": 3, "Triceps": 3, "Calves": 3, "Abs": 3
};

const DEFAULT_SUPERSETS_MESO3 = {
    1: [2, 4], 2: [2, 4], 3: [2, 4], 4: [2, 4]
};

const EXERCISE_DB_DEFAULT = [
  { category: "Vertical Pull", name: "Assisted Overhand Pullup", url: "https://youtu.be/ghHW6sETs-I" },
  { category: "Vertical Pull", name: "Wide Grip Pullup", url: "https://youtu.be/HOWPPDueZY8" },
  { category: "Vertical Pull", name: "Normal Grip Pulldown", url: "https://youtu.be/gQ179IUjMsQ" },
  { category: "Vertical Pull", name: "Underhand Pulldown", url: "https://youtu.be/bxfHw1LvH24" },
  { category: "Vertical Pull", name: "Neutral Grip Pulldown", url: "https://youtu.be/234234" },
  { category: "Vertical Pull", name: "Parallel Pulldown", url: "https://youtu.be/uMjeHo2_EwM" },
  { category: "Horizontal Pull", name: "Barbell Bent Over Row", url: "https://youtu.be/6FwqjrQ" },
  { category: "Horizontal Pull", name: "Seated Cable Row", url: "https://youtu.be/GZbfZ033fYD" },
  { category: "Horizontal Pull", name: "Chest Supported Row", url: "https://youtu.be/HkQqZ" },
  { category: "Horizontal Pull", name: "Single Arm Dumbbell Row", url: "https://youtu.be/pYcpY20QaE8" },
  { category: "Horizontal Pull", name: "T-Bar Row", url: "" },
  { category: "Horizontal Push", name: "Flat Barbell Bench Press", url: "https://youtu.be/rT7DgCr-3pg" },
  { category: "Horizontal Push", name: "Flat Dumbbell Press", url: "https://youtu.be/VmB1G1K7v94" },
  { category: "Horizontal Push", name: "Pushups", url: "https://youtu.be/IODxDxX7oi4" },
  { category: "Horizontal Push", name: "Machine Chest Press", url: "" },
  { category: "Horizontal Push", name: "Cable Fly", url: "" },
  { category: "Incline Push", name: "Incline Dumbbell Press", url: "https://youtu.be/8iPEnn-ltC8" },
  { category: "Incline Push", name: "Incline Machine Press", url: "https://youtu.be/2yj3j" },
  { category: "Vertical Push", name: "Seated Dumbbell Overhead Press", url: "https://youtu.be/qEwKCR5JCog" },
  { category: "Vertical Push", name: "Military Press", url: "https://youtu.be/MP123" },
  { category: "Vertical Push", name: "Machine Shoulder Press", url: "https://youtu.be/Wp4Bl" },
  { category: "Side Delts", name: "Dumbbell Side Lateral Raise", url: "https://youtu.be/3VcKaXpzqRo" },
  { category: "Side Delts", name: "Cable Lateral Raise", url: "https://youtu.be/POGzSm" },
  { category: "Rear Delts", name: "Bent Over Reverse Fly", url: "" },
  { category: "Rear Delts", name: "Facepulls", url: "" },
  { category: "Quads", name: "High Bar Squat", url: "https://youtu.be/UltWZh" },
  { category: "Quads", name: "Leg Press", url: "https://youtu.be/IZxyCv" },
  { category: "Quads", name: "Hack Squat", url: "https://youtu.be/0c2fSp" },
  { category: "Quads", name: "Leg Extension", url: "https://youtu.be/YyvSfVjQeL0" },
  { category: "Hamstrings", name: "Lying Leg Curl", url: "https://youtu.be/1Tq3QdYUuHs" },
  { category: "Hamstrings", name: "Seated Leg Curl", url: "https://youtu.be/F488k67btNo" },
  { category: "Hamstrings", name: "Stiff Legged Deadlift", url: "https://youtu.be/CN_7cz3P-1U" },
  { category: "Glutes", name: "Barbell Hip Thrust", url: "https://youtu.be/LM8XH" },
  { category: "Glutes", name: "Glute Bridge", url: "https://youtu.be/8" },
  { category: "Glutes", name: "Walking Lunge", url: "https://youtu.be/L8" },
  { category: "Triceps", name: "EZ Bar Overhead Tricep Extension", url: "https://youtu.be/U3SkMY6jw5M" },
  { category: "Triceps", name: "Cable Tricep Pushdown", url: "https://youtu.be/2-LAM98" },
  { category: "Triceps", name: "Skullcrushers", url: "https://youtu.be/d_KZxkH_Z2g" },
  { category: "Biceps", name: "Barbell Curl", url: "https://youtu.be/kwG2ipFRgfo" },
  { category: "Biceps", name: "Dumbbell Curl", url: "https://youtu.be/sAq_ocpRh_I" },
  { category: "Biceps", name: "Hammer Curl", url: "https://youtu.be/zC3nLlEvin4" },
  { category: "Calves", name: "Standing Calf Raise", url: "https://youtu.be/-M4-G8p8fmc" },
  { category: "Calves", name: "Seated Calf Raise", url: "https://youtu.be/JbyjNymZOt0" }
];

const MESOCYCLES = [
  { id: 'meso1', name: 'Meso 1: Base', weeks: 5, deloadWeek: 5, desc: "Fundamentos y Sobrecarga" },
  { id: 'meso2', name: 'Meso 2: Hipertrofia', weeks: 5, deloadWeek: 5, desc: "Volumen y Variedad" },
  { id: 'meso3', name: 'Meso 3: Metabolito', weeks: 4, deloadWeek: 4, desc: "Pump, Superseries y Estrés" },
  { id: 'meso4', name: 'Meso 4: Resensibilización', weeks: 3, deloadWeek: 3, desc: "Bajo Volumen, Alta Intensidad" },
];

const RATING_GUIDE = [
  { val: 2, label: "2 - Nada adolorido", color: "bg-blue-100 text-blue-800", desc: "Aumentar volumen agresivamente" },
  { val: 1, label: "1 - Buen pump, sin dolor", color: "bg-green-100 text-green-800", desc: "Aumentar volumen moderadamente" },
  { val: 0, label: "0 - Recuperación justa", color: "bg-yellow-100 text-yellow-800", desc: "Mantener volumen (Sweet Spot)" },
  { val: -1, label: "-1 - Todavía adolorido", color: "bg-orange-100 text-orange-800", desc: "No aumentar" },
  { val: -2, label: "-2 - Rendimiento bajó", color: "bg-red-100 text-red-800", desc: "Reducir volumen (Deload)" }
];

const getTargetRIR = (week, isDeload) => {
    if (isDeload) return { text: "3-4 (Descarga)", color: "text-green-400" };
    if (week === 1) return { text: "3 RIR", color: "text-blue-300" };
    if (week === 2) return { text: "2 RIR", color: "text-yellow-300" };
    if (week === 3) return { text: "1 RIR", color: "text-orange-300" };
    return { text: "0 RIR (Fallo)", color: "text-red-400" };
};

const STORAGE_KEY = 'rp_hypertrophy_data_v3';

const getStoredData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        const oldData = localStorage.getItem('rp_hypertrophy_data_v2');
        if (oldData) return JSON.parse(oldData);
    }
    return data ? JSON.parse(data) : { plans: {}, logs: {}, settings: {} };
};

const saveData = (newData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

// --- COMPONENTES UI ---

const Card = ({ children, className = '', noBottomRadius = false, noTopRadius = false }) => (
  <div className={`bg-slate-800 border border-slate-700 p-4 shadow-xl 
    ${noBottomRadius ? 'rounded-t-xl border-b-0' : ''} 
    ${noTopRadius ? 'rounded-b-xl border-t-0 mt-0 pt-6' : ''} 
    ${!noBottomRadius && !noTopRadius ? 'rounded-xl' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// --- REST TIMER ---
const RestTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => { setSeconds(s => s + 1); }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setSeconds(0); };
    const formatTime = (sec) => {
        const mins = Math.floor(sec / 60);
        const s = sec % 60;
        return `${mins}:${s < 10 ? '0' : ''}${s}`;
    };
    const getTimerColor = () => {
        if (seconds < 60) return "text-white";
        if (seconds < 120) return "text-blue-400";
        if (seconds < 180) return "text-green-400";
        return "text-red-400";
    };

    if (isMinimized) {
        return (
            <button onClick={() => setIsMinimized(false)} className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all border border-slate-600 ${isActive ? 'bg-blue-900/80 animate-pulse border-blue-500' : 'bg-slate-800'}`}>
                <Timer size={20} className="text-white"/>
                {isActive && <span className="font-mono font-bold text-white">{formatTime(seconds)}</span>}
            </button>
        );
    }
    return (
        <div className="fixed bottom-24 right-4 z-40 bg-slate-900 border border-slate-600 p-4 rounded-2xl shadow-2xl w-52">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Descanso</span>
                <button onClick={() => setIsMinimized(true)}><X size={16} className="text-slate-400"/></button>
            </div>
            <div className={`text-5xl font-mono font-black text-center py-2 tracking-tighter ${getTimerColor()}`}>{formatTime(seconds)}</div>
            <div className="flex justify-center gap-4 mt-2">
                <button onClick={resetTimer} className="p-3 bg-slate-800 rounded-full text-slate-300 hover:bg-slate-700 transition-colors"><RotateCcw size={18} /></button>
                <button onClick={toggleTimer} className={`p-3 rounded-full text-white shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-amber-600' : 'bg-blue-600'}`}>
                    {isActive ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor" className="ml-1"/>}
                </button>
            </div>
        </div>
    );
};

// --- SETTINGS MODAL ---
const SettingsModal = ({ isOpen, onClose, fullData, onImport }) => {
    const fileInputRef = useRef(null);
    const [status, setStatus] = useState('');
    if (!isOpen) return null;

    const handleExport = () => {
        try {
            const exportData = { ...fullData, exportedAt: new Date().toISOString(), version: "portable_v3" };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `rp_backup_v3.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setStatus('¡Exportación completada!');
        } catch (error) { console.error(error); setStatus('Error al exportar.'); }
    };

    const handleImport = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                onImport(data);
                setStatus('¡Importación exitosa!');
                setTimeout(onClose, 1500);
            } catch (error) { console.error(error); setStatus('Error: Archivo inválido.'); }
        }; reader.readAsText(file);
    };
    
    const handleReset = () => {
        if(confirm("¿Estás seguro? Esto borrará todos tus datos.")){
             localStorage.removeItem(STORAGE_KEY);
             window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X/></button>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-blue-500"/> Configuración</h2>
                <div className="space-y-3">
                    <button onClick={handleExport} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 p-4 rounded-xl flex items-center gap-4 transition-all group">
                        <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 group-hover:text-blue-300"><Download size={24}/></div>
                        <div><div className="font-bold text-white text-left">Exportar Datos</div><div className="text-xs text-slate-400">Descarga tu backup JSON</div></div>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 p-4 rounded-xl flex items-center gap-4 transition-all group">
                        <div className="bg-green-900/30 p-2 rounded-lg text-green-400 group-hover:text-green-300"><Upload size={24}/></div>
                        <div><div className="font-bold text-white text-left">Importar Datos</div><div className="text-xs text-slate-400">Restaura desde archivo</div></div>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/>
                    <button onClick={handleReset} className="w-full bg-red-900/10 hover:bg-red-900/30 border border-red-900/30 p-4 rounded-xl flex items-center gap-4 transition-all group mt-4">
                        <div className="bg-red-900/30 p-2 rounded-lg text-red-400 group-hover:text-red-300"><Trash2 size={24}/></div>
                        <div><div className="font-bold text-red-400 text-left">Borrar Todo</div><div className="text-xs text-red-400/70">Reset de fábrica</div></div>
                    </button>
                </div>
                {status && <div className="mt-4 text-center text-sm font-bold text-blue-400 animate-pulse">{status}</div>}
            </div>
        </div>
    );
};

// --- CREAR EJERCICIO MODAL ---
const CreateExerciseModal = ({ isOpen, onClose, onCreate, category }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X/></button>
                <h2 className="text-lg font-bold mb-1 text-white">Nuevo Ejercicio</h2>
                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">{category}</p>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del ejercicio..." className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none mb-4" autoFocus />
                <button disabled={!name.trim()} onClick={() => { onCreate(name, category); setName(''); onClose(); }} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors">Guardar Ejercicio</button>
            </div>
        </div>
    );
};

// --- PANTALLA INICIAL (HOME) ---
const HomeView = ({ lastMeso, lastWeek, lastDay, onStart }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center max-w-md mx-auto">
            <div className="mb-8 text-center">
                <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-500">
                    <Dumbbell size={40} className="text-blue-400" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter mb-2">RP HYPERTROPHY</h1>
                <p className="text-slate-400 text-sm">Tu sistema de entrenamiento científico.</p>
            </div>

            {/* BOTÓN CONTINUAR (SI EXISTE HISTORIAL) */}
            <button 
                onClick={() => onStart(lastMeso, lastWeek, lastDay)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-xl shadow-blue-900/30 hover:scale-[1.02] transition-transform mb-8 text-left relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 bg-white/10 p-2 rounded-bl-2xl">
                    <ArrowRightCircle size={24} className="text-white/80" />
                </div>
                <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Continuar Entrenamiento</div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                    {MESOCYCLES.find(m => m.id === lastMeso)?.name.split(':')[0] || 'Meso 1'} 
                    <span className="text-lg opacity-80 font-normal">/ Sem {lastWeek}</span>
                </div>
                <div className="text-sm text-blue-100 mt-2 flex items-center gap-1">
                    <Calendar size={14} /> Día {lastDay}
                </div>
            </button>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Seleccionar Fase</h3>
                {MESOCYCLES.map(m => (
                    <button 
                        key={m.id}
                        onClick={() => onStart(m.id, 1, 1)}
                        className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors group"
                    >
                        <div className="text-left">
                            <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{m.name}</div>
                            <div className="text-xs text-slate-500">{m.desc}</div>
                        </div>
                        <ChevronRight size={20} className="text-slate-600 group-hover:text-white" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- APP PRINCIPAL ---

export default function RPApp() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // 'home' | 'app'
  const [showSettings, setShowSettings] = useState(false);
  
  const [activeMeso, setActiveMeso] = useState('meso1');
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  
  // Data State
  const [fullData, setFullData] = useState({ plans: {}, logs: {}, settings: {} });
  const [planData, setPlanData] = useState({});
  const [logData, setLogData] = useState({});
  const [userStructure, setUserStructure] = useState({}); 
  const [userSupersets, setUserSupersets] = useState({});
  const [customExercises, setCustomExercises] = useState([]);

  useEffect(() => {
      const data = getStoredData();
      setFullData(data);
      setPlanData(data.plans || {});
      setLogData(data.logs || {});
      setUserStructure(data.settings?.structure || {});
      setUserSupersets(data.settings?.supersets || {});
      setCustomExercises(data.settings?.exercises || []);
      
      // Load last state if exists
      if(data.settings?.lastState) {
          setActiveMeso(data.settings.lastState.meso || 'meso1');
          setActiveWeek(data.settings.lastState.week || 1);
          setActiveDay(data.settings.lastState.day || 1);
      }
      
      setLoading(false);
  }, []);

  const updateStorage = (newData) => {
      setFullData(newData);
      saveData(newData);
  };

  const handleStartApp = (meso, week, day) => {
      setActiveMeso(meso);
      setActiveWeek(week);
      setActiveDay(day);
      setView('app');
  };

  const saveCurrentState = (meso, week, day) => {
      const newSettings = { 
          ...fullData.settings, 
          lastState: { meso, week, day } 
      };
      updateStorage({ ...fullData, settings: newSettings });
  };

  const handleImportData = (importedData) => {
      updateStorage(importedData);
      setPlanData(importedData.plans || {});
      setLogData(importedData.logs || {});
      setUserStructure(importedData.settings?.structure || {});
      setUserSupersets(importedData.settings?.supersets || {});
      setCustomExercises(importedData.settings?.exercises || []);
  };

  // --- CONFETI SIMPLE ---
  const triggerConfetti = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 100; i++) {
        const conf = document.createElement('div');
        Object.assign(conf.style, {
            position: 'fixed', top: '50%', left: '50%', width: '8px', height: '8px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: '50%', zIndex: '9999', pointerEvents: 'none'
        });
        document.body.appendChild(conf);
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        conf.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity * 100}px, ${Math.sin(angle) * velocity * 100}px) scale(0)`, opacity: 0 }
        ], { duration: 1000 + Math.random() * 1000 }).onfinish = () => conf.remove();
    }
  };

  const handleExerciseSelect = (day, slotIndex, exercise) => {
    const docId = `${activeMeso}_day_${day}`;
    const currentDayPlan = planData[docId] || { exercises: {} };
    const newPlans = { ...planData, [docId]: { exercises: { ...currentDayPlan.exercises, [slotIndex]: exercise } } };
    setPlanData(newPlans);
    updateStorage({ ...fullData, plans: newPlans });
  };

  const handleLogUpdate = (exerciseName, field, value) => {
    const logId = `${activeMeso}_w${activeWeek}_d${activeDay}`;
    const currentLog = logData[logId] || { exercises: {} };
    const currentEx = currentLog.exercises?.[exerciseName] || { series: [], rating: 0 };
    let updatedEx = { ...currentEx };
    if (field === 'series') { updatedEx.series = value; } else { updatedEx[field] = value; }
    const newLogs = { ...logData, [logId]: { exercises: { ...currentLog.exercises, [exerciseName]: updatedEx } } };
    setLogData(newLogs);
    updateStorage({ ...fullData, logs: newLogs });
  };

  const handleSlotCategoryChange = (day, slotIndex, newCategory) => {
      const currentDayStructure = userStructure[day] || DEFAULT_STRUCTURE[day];
      const updatedDayStructure = [...currentDayStructure];
      updatedDayStructure[slotIndex-1] = newCategory; 
      const newSettings = { ...fullData.settings, structure: { ...userStructure, [day]: updatedDayStructure } };
      setUserStructure(newSettings.structure);
      updateStorage({ ...fullData, settings: newSettings });
  };

  const handleSupersetToggle = (day, slotIndex) => {
      const supersetId = `${activeMeso}_day_${day}`;
      let currentDaySupersets = userSupersets[supersetId];
      if (!currentDaySupersets && activeMeso === 'meso3') { currentDaySupersets = DEFAULT_SUPERSETS_MESO3[day] || []; } else { currentDaySupersets = currentDaySupersets || []; }
      let updatedSupersets;
      if (currentDaySupersets.includes(slotIndex)) { updatedSupersets = currentDaySupersets.filter(idx => idx !== slotIndex); } else { updatedSupersets = [...currentDaySupersets, slotIndex]; }
      const newSettings = { ...fullData.settings, supersets: { ...userSupersets, [supersetId]: updatedSupersets } };
      setUserSupersets(newSettings.supersets);
      updateStorage({ ...fullData, settings: newSettings });
  };

  const handleCreateExercise = (name, category) => {
      const newExercise = { name, category, url: '', isCustom: true };
      const updatedList = [...customExercises, newExercise];
      const newSettings = { ...fullData.settings, exercises: updatedList };
      setCustomExercises(updatedList);
      updateStorage({ ...fullData, settings: newSettings });
  };

  const currentMesoConfig = MESOCYCLES.find(m => m.id === activeMeso);
  const isDeload = activeWeek === currentMesoConfig?.deloadWeek;
  const targetRIR = getTargetRIR(activeWeek, isDeload);
  const dailyCategories = userStructure[activeDay] || DEFAULT_STRUCTURE[activeDay] || [];
  const supersetId = `${activeMeso}_day_${activeDay}`;
  let activeSupersets = userSupersets[supersetId];
  if (!activeSupersets && activeMeso === 'meso3') { activeSupersets = DEFAULT_SUPERSETS_MESO3[activeDay] || []; }
  activeSupersets = activeSupersets || [];
  const mergedExerciseDB = useMemo(() => [...EXERCISE_DB_DEFAULT, ...customExercises], [customExercises]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-blue-400 font-mono animate-pulse">CARGANDO...</div>;

  // --- VISTA: HOME ---
  if (view === 'home') {
      return (
          <HomeView 
            lastMeso={activeMeso} 
            lastWeek={activeWeek} 
            lastDay={activeDay} 
            onStart={handleStartApp} 
          />
      );
  }

  // --- VISTA: APP ENTRENAMIENTO ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-40 selection:bg-blue-500 selection:text-white">
      
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-20 shadow-2xl">
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 hover:text-white">
                <ChevronRight className="rotate-180" size={20}/> <span className="text-xs font-bold uppercase tracking-widest">Inicio</span>
            </button>
            <div className="flex items-center gap-2">
                <span className="text-xl font-black italic tracking-tighter text-blue-500">RP</span>
                {isDeload && <span className="text-[10px] bg-green-500 text-black font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">DELOAD</span>}
                <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <Menu size={20}/>
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2">
            <select 
                value={activeMeso} 
                onChange={(e) => { 
                    setActiveMeso(e.target.value); 
                    setActiveWeek(1); 
                    saveCurrentState(e.target.value, 1, activeDay);
                }} 
                className="bg-slate-800 text-sm py-2 px-3 rounded-lg border border-slate-700 text-slate-200 outline-none focus:border-blue-500 transition-colors"
            >
              {MESOCYCLES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select 
                value={activeWeek} 
                onChange={(e) => {
                    const w = Number(e.target.value);
                    setActiveWeek(w);
                    saveCurrentState(activeMeso, w, activeDay);
                }} 
                className={`text-sm py-2 px-1 rounded-lg border outline-none font-bold text-center ${isDeload ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-slate-800 border-slate-700'}`}
            >
              {Array.from({length: currentMesoConfig.weeks}).map((_, i) => <option key={i+1} value={i+1}>Sem {i+1}</option>)}
            </select>
            <select 
                value={activeDay} 
                onChange={(e) => {
                    const d = Number(e.target.value);
                    setActiveDay(d);
                    saveCurrentState(activeMeso, activeWeek, d);
                }} 
                className="bg-slate-800 text-sm py-2 px-1 rounded-lg border border-slate-700 text-center outline-none focus:border-blue-500"
            >
              {[1,2,3,4].map(d => <option key={d} value={d}>Día {d}</option>)}
            </select>
          </div>
          
          <div className="flex justify-between items-center bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intensidad</span>
             <span className={`text-xs font-black tracking-wide ${targetRIR.color}`}>{targetRIR.text}</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-0">
        
        {dailyCategories.map((category, index) => {
            const slotIndex = index + 1;
            const isLinkedToPrev = activeSupersets.includes(slotIndex);
            const isLinkedToNext = activeSupersets.includes(slotIndex + 1);

            return (
                <div key={`${activeDay}-${index}`}>
                    {index > 0 && (
                        <div className="flex justify-center -my-3 z-10 relative h-6">
                            <button 
                                onClick={() => handleSupersetToggle(activeDay, slotIndex)}
                                className={`rounded-full p-1.5 transition-all shadow-lg border-2 ${isLinkedToPrev ? 'bg-purple-600 text-white border-purple-400 hover:bg-red-500 hover:border-red-400' : 'bg-slate-800 text-slate-600 border-slate-700 hover:text-purple-400 hover:border-purple-500'}`}
                            >
                                {isLinkedToPrev ? <Unlink size={12} /> : <LinkIcon size={12} />}
                            </button>
                        </div>
                    )}

                    <ExerciseRow 
                        key={`${activeMeso}_w${activeWeek}_d${activeDay}_s${slotIndex}`} // KEY CRUCIAL PARA FORZAR RENDER AL CAMBIAR SEMANA
                        slot={slotIndex}
                        categoryRequirement={category}
                        day={activeDay}
                        meso={activeMeso}
                        week={activeWeek}
                        planData={planData}
                        logData={logData}
                        exerciseDB={mergedExerciseDB}
                        onSelectExercise={handleExerciseSelect}
                        onLogUpdate={handleLogUpdate}
                        onCategoryChange={handleSlotCategoryChange}
                        onCreateExercise={handleCreateExercise}
                        isDeload={isDeload}
                        noTopRadius={isLinkedToPrev}
                        noBottomRadius={isLinkedToNext}
                        isSupersetPart={isLinkedToPrev || isLinkedToNext}
                    />
                </div>
            );
        })}

        <button onClick={() => handleSlotCategoryChange(activeDay, dailyCategories.length + 1, "Abs")} className="w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 font-bold text-sm hover:border-slate-600 hover:text-slate-400 transition-colors mt-6 mb-8">
            + AÑADIR SLOT DE EJERCICIO
        </button>

        <div className="pb-12">
            <button 
                onClick={() => { triggerConfetti(); alert("¡Entrenamiento Guardado! 💪"); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
                <Trophy size={24} className="text-yellow-400" />
                TERMINAR ENTRENAMIENTO
            </button>
        </div>

      </main>

      <RestTimer />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} fullData={fullData} onImport={handleImportData}/>

      <details className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 z-50 group shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <summary className="list-none flex justify-between items-center px-6 py-4 cursor-pointer text-slate-300 font-semibold hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2 text-sm"><Info size={16} className="text-blue-500"/> Guía de Calificación RP</span>
          <ChevronRight className="rotate-270 group-open:rotate-90 transition-transform text-slate-500" size={16}/>
        </summary>
        <div className="p-4 bg-slate-950 space-y-2 pb-8 max-h-[60vh] overflow-y-auto border-t border-slate-800">
           {RATING_GUIDE.map(r => (
             <div key={r.val} className={`p-3 rounded-lg text-sm flex flex-col border border-transparent ${r.color}`}>
               <div className="flex justify-between items-center font-bold">
                  <span>{r.label}</span>
                  <span className="text-[10px] opacity-70 border border-current px-1.5 py-0.5 rounded bg-black/10">RATING {r.val}</span>
               </div>
               <span className="opacity-90 mt-1 text-xs leading-relaxed">{r.desc}</span>
             </div>
           ))}
        </div>
      </details>
    </div>
  );
}

// --- ROW COMPONENT (SERIES) ---
function ExerciseRow({ 
    slot, categoryRequirement, day, meso, week, 
    planData, logData, exerciseDB,
    onSelectExercise, onLogUpdate, onCategoryChange, onCreateExercise,
    isDeload, noTopRadius, noBottomRadius, isSupersetPart 
}) {
  const [showAll, setShowAll] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const planId = `${meso}_day_${day}`;
  const exercise = planData[planId]?.exercises?.[slot];
  
  const logId = `${meso}_w${week}_d${day}`;
  const currentData = logData[logId]?.exercises?.[exercise?.name] || {};
  const currentRating = currentData.rating !== undefined ? currentData.rating : 99; 
  
  // LOGIC CORREGIDA: Si no hay datos (semana nueva), inicializamos series vacías (pero con la cantidad correcta)
  const defaultSetCount = INITIAL_SETS_CONFIG[categoryRequirement] || 2;
  // IMPORTANTE: Si currentData.series no existe, creamos nuevas vacías. Esto soluciona el bug de "se mantiene igual".
  const initialSets = currentData.series || Array(defaultSetCount).fill({ weight: '', reps: '', done: false });
  
  const [localSeries, setLocalSeries] = useState(initialSets);

  // Efecto crítico: Cuando cambiamos de semana (cambia logId), actualizamos el estado local
  useEffect(() => {
      if (currentData.series) {
          // Si ya guardamos algo esta semana, lo cargamos
          setLocalSeries(currentData.series);
      } else {
          // Si es una semana nueva y virgen, reseteamos a blanco
          setLocalSeries(Array(defaultSetCount).fill({ weight: '', reps: '', done: false }));
      }
  }, [logId, exercise?.name]); // Depender de logId asegura que al cambiar semana se ejecute

  const updateSet = (index, field, value) => {
      const newSeries = [...localSeries];
      newSeries[index] = { ...newSeries[index], [field]: value };
      setLocalSeries(newSeries);
      onLogUpdate(exercise?.name, 'series', newSeries);
  };

  const addSet = () => {
      const lastSet = localSeries[localSeries.length - 1] || { weight: '', reps: '' };
      const newSeries = [...localSeries, { weight: lastSet.weight, reps: lastSet.reps, done: false }];
      setLocalSeries(newSeries);
      onLogUpdate(exercise?.name, 'series', newSeries);
  };

  const removeSet = () => {
      if (localSeries.length <= 1) return;
      const newSeries = localSeries.slice(0, -1);
      setLocalSeries(newSeries);
      onLogUpdate(exercise?.name, 'series', newSeries);
  };

  const prevLog = logData[`${meso}_w${week - 1}_d${day}`]?.exercises?.[exercise?.name];

  const suggestion = useMemo(() => {
    if (week === 1) return "Busca tu 10RM sólido";
    if (!prevLog) return "N/A";
    if (isDeload) return "50% Carga / 50% Sets";
    const lastRating = prevLog.rating;
    if (lastRating === 1) return `+2.5kg O +1 Rep`;
    if (lastRating === 2) return `+5kg O +2 Reps`;
    if (lastRating === 0) return `Mismo peso y reps`;
    if (lastRating === -1) return `Mismo peso, menos reps?`;
    if (lastRating === -2) return `Baja peso (-10%)`;
    return `Mejora la semana anterior`;
  }, [week, prevLog, isDeload]);

  const filteredExercises = useMemo(() => {
    if (showAll) return exerciseDB;
    return exerciseDB.filter(ex => ex.category === categoryRequirement);
  }, [categoryRequirement, showAll, exerciseDB]);

  const getCategoryIcon = (cat) => {
      if (cat.includes("Push") || cat.includes("Triceps") || cat.includes("Quads")) return <ArrowUp size={12} className="text-orange-400"/>;
      if (cat.includes("Pull") || cat.includes("Biceps") || cat.includes("Hamstrings")) return <ArrowDown size={12} className="text-blue-400"/>;
      return <ArrowRight size={12} className="text-slate-400"/>;
  };

  const CategoryHeader = () => (
      <div className="flex items-center gap-2 mb-2">
          {isEditingCategory ? (
              <div className="flex items-center gap-1 flex-1 animate-in fade-in slide-in-from-left-2">
                  <select className="bg-slate-900 text-xs text-white p-1 rounded border border-blue-500 outline-none flex-1" value={categoryRequirement} onChange={(e) => { onCategoryChange(day, slot, e.target.value); setIsEditingCategory(false); }} autoFocus>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => setIsEditingCategory(false)} className="text-slate-400 hover:text-white"><X size={14}/></button>
              </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingCategory(true)}>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                    {getCategoryIcon(categoryRequirement)}
                    {categoryRequirement}
                </div>
                {(week === 1 || !exercise) && <Edit3 size={10} className="text-slate-600 group-hover:text-blue-400 transition-colors"/>}
            </div>
          )}
          {isDeload && <span className="text-[10px] text-green-400 font-bold bg-green-900/20 px-1 rounded">DELOAD</span>}
      </div>
  );

  const cardBorderClass = isSupersetPart ? 'border-purple-500/30' : isDeload ? 'border-green-800 bg-green-900/5' : 'hover:border-slate-600';
  const cardBgClass = isSupersetPart ? 'bg-slate-800/80' : 'bg-slate-800';

  if (!exercise) {
    return (
      <Card className={`border-l-2 border-l-blue-500 relative overflow-hidden group hover:border-l-blue-400 transition-colors mb-4 ${cardBorderClass} ${cardBgClass}`} noBottomRadius={noBottomRadius} noTopRadius={noTopRadius}>
         {isSupersetPart && ( <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-purple-900/20 text-purple-400 [writing-mode:vertical-rl] text-[9px] font-black tracking-widest py-4 px-0.5 rounded-l border-l border-purple-500/30 opacity-50">SUPERSET</div> )}
         <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-4xl text-slate-500 select-none pointer-events-none">{slot}</div>
         <CategoryHeader />
         <div className="mb-3"><h3 className="text-lg font-bold text-white">Elegir Ejercicio</h3></div>
         <div className="space-y-3">
           <select className="w-full bg-slate-900 p-3 rounded-lg text-white border border-slate-700 focus:border-blue-500 outline-none appearance-none transition-colors cursor-pointer" onChange={(e) => { if (e.target.value) { const exObj = exerciseDB.find(ex => ex.name === e.target.value); onSelectExercise(day, slot, exObj); }}}>
             <option value="">-- Seleccionar {categoryRequirement} --</option>
             {filteredExercises.map(ex => <option key={ex.name} value={ex.name}>{ex.isCustom ? '👤 ' : ''}{ex.name}</option>)}
           </select>
           <div className="flex gap-2">
               <button onClick={() => setShowCreateModal(true)} className="flex-1 bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900 hover:border-green-700 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all">
                    <Plus size={14}/> Crear Nuevo
               </button>
               <button onClick={() => setShowAll(!showAll)} className="flex-1 text-xs flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors justify-center py-2">
                    {showAll ? <Filter size={12}/> : <Unlock size={12}/>} {showAll ? "Recomendados" : "Ver Todos"}
               </button>
           </div>
         </div>
         <CreateExerciseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={onCreateExercise} category={categoryRequirement}/>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 mb-4 ${cardBorderClass} ${cardBgClass}`} noBottomRadius={noBottomRadius} noTopRadius={noTopRadius}>
      {isSupersetPart && ( <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-purple-900/20 text-purple-400 [writing-mode:vertical-rl] text-[9px] font-black tracking-widest py-6 px-0.5 rounded-l border-l border-purple-500/30 opacity-70">SUPERSET</div> )}
      <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
        <div><CategoryHeader /><h3 className="font-bold text-lg text-white leading-tight pr-8 flex items-center gap-2">{exercise.isCustom && <User size={14} className="text-green-500"/>}{exercise.name}</h3></div>
        <div className="flex gap-1">
            {exercise.url && <a href={exercise.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Youtube size={18} /></a>}
            <button onClick={() => { if(confirm('¿Cambiar ejercicio? Se reiniciará el progreso de este slot.')) onSelectExercise(day, slot, null); }} className="p-2 text-slate-500 hover:text-white transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>
      {week > 1 && !isDeload && (
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent border-l-2 border-blue-500 rounded-r-lg p-2 mb-4">
           <div className="text-xs text-slate-400"><span className="block mb-0.5 uppercase text-[10px] tracking-wider">Historial</span><span className="font-mono text-white text-sm">{prevLog ? `${prevLog.series?.[0]?.weight || prevLog.weight}kg` : '-'}</span></div>
           <div className="text-right"><span className="block text-[10px] text-blue-400 uppercase font-bold tracking-wider">Objetivo</span><span className="text-sm font-bold text-blue-200">{suggestion}</span></div>
        </div>
      )}
      
      <div className="space-y-2 mb-4">
          <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 px-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
              <div>Set</div>
              <div>Kg</div>
              <div>Reps</div>
              <div>✔</div>
          </div>
          {localSeries.map((set, idx) => (
              <div key={idx} className={`grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 items-center ${set.done ? 'opacity-50' : ''} transition-all`}>
                  <div className="flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-slate-700 text-xs flex items-center justify-center text-slate-300 font-bold">{idx + 1}</div></div>
                  <input type="number" inputMode="decimal" placeholder="-" value={set.weight} onChange={(e) => updateSet(idx, 'weight', e.target.value)} className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}/>
                  <input type="number" inputMode="numeric" placeholder="-" value={set.reps} onChange={(e) => updateSet(idx, 'reps', e.target.value)} className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}/>
                  <button onClick={() => updateSet(idx, 'done', !set.done)} className={`w-full h-full flex items-center justify-center rounded-lg border transition-all ${set.done ? 'bg-green-500 border-green-500 text-black' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-400'}`}><Check size={16} strokeWidth={3} /></button>
              </div>
          ))}
          <div className="flex justify-center gap-4 pt-2">
              <button onClick={addSet} className="text-xs text-blue-400 font-bold flex items-center gap-1 py-1 px-3 rounded hover:bg-blue-900/20 transition-colors"><Plus size={12}/> Añadir Set</button>
              {localSeries.length > 1 && (<button onClick={removeSet} className="text-xs text-red-400 font-bold flex items-center gap-1 py-1 px-3 rounded hover:bg-red-900/20 transition-colors"><Trash2 size={12}/> Quitar</button>)}
          </div>
      </div>

      <div className="mt-2 relative">
         <select value={currentRating} onChange={(e) => onLogUpdate(exercise.name, 'rating', Number(e.target.value))} className={`w-full p-3 rounded-lg text-sm font-bold border outline-none appearance-none transition-all cursor-pointer ${currentRating === 0 ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : ''} ${currentRating > 0 ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : ''} ${currentRating < 0 ? 'bg-red-500/10 border-red-500/50 text-red-400' : ''} ${currentRating === 99 ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : ''}`}>
            <option value="99" disabled>Evaluar Recuperación...</option>
            {RATING_GUIDE.map(r => <option key={r.val} value={r.val} className="bg-slate-900 text-slate-300 py-2">{r.label}</option>)}
         </select>
         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            {currentRating !== 99 && <CheckCircle2 size={16} />}
         </div>
      </div>
    </Card>
  );
}