import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, ChevronRight, Youtube, Info, Filter, RefreshCw, Unlock, 
  Timer, Play, Pause, RotateCcw, X, Edit3, Check, ArrowUp, ArrowDown, 
  ArrowRight, Settings, Download, Upload, Link as LinkIcon, Unlink, 
  Plus, User, Smartphone, Menu, Trash2, Save, CheckCircle2, Trophy,
  BookOpen, FolderPlus
} from 'lucide-react';

// --- CONSTANTES ---
const DEFAULT_CATEGORIES = [
  "Horizontal Push", "Incline Push", "Vertical Push", 
  "Vertical Pull", "Horizontal Pull", 
  "Side Delts", "Rear Delts", 
  "Triceps", "Biceps", 
  "Quads", "Hamstrings", "Glutes", "Calves", "Abs"
];

const INITIAL_SETS_CONFIG: any = {
    "Quads": 3, "Chest": 3, "Horizontal Push": 2, "Incline Push": 2, "Vertical Push": 2,
    "Vertical Pull": 2, "Horizontal Pull": 2, "Hamstrings": 2, "Glutes": 2,
    "Side Delts": 3, "Rear Delts": 3, "Biceps": 3, "Triceps": 3, "Calves": 3, "Abs": 3
};

const MESOCYCLES = [
  { id: 'meso1', name: 'Meso 1: Base', weeks: 5, deloadWeek: 5 },
  { id: 'meso2', name: 'Meso 2: Hipertrofia', weeks: 5, deloadWeek: 5 },
  { id: 'meso3', name: 'Meso 3: Metabolito', weeks: 4, deloadWeek: 4 },
  { id: 'meso4', name: 'Meso 4: Resensibilización', weeks: 3, deloadWeek: 3 },
];

const RATING_GUIDE = [
  { val: 2, label: "2 - Nada adolorido", color: "bg-blue-100 text-blue-800" },
  { val: 1, label: "1 - Buen pump, sin dolor", color: "bg-green-100 text-green-800" },
  { val: 0, label: "0 - Recuperación justa", color: "bg-yellow-100 text-yellow-800" },
  { val: -1, label: "-1 - Todavía adolorido", color: "bg-orange-100 text-orange-800" },
  { val: -2, label: "-2 - Rendimiento bajó", color: "bg-red-100 text-red-800" }
];

// --- STORAGE ---
const STORAGE_KEY = 'rp_hypertrophy_data_v5'; 

const getStoredData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { plans: {}, logs: {}, settings: {} };
        return JSON.parse(data);
    } catch (e) {
        return { plans: {}, logs: {}, settings: {} };
    }
};

const saveData = (newData: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

// --- COMPONENTES AISLADOS (PARA EVITAR BUGS DE TECLADO) ---

const SetRow = ({ index, set, onUpdate, onToggle }: any) => {
    const [weight, setWeight] = useState(set.weight);
    const [reps, setReps] = useState(set.reps);

    useEffect(() => {
        setWeight(set.weight);
        setReps(set.reps);
    }, [set]);

    const handleBlur = () => {
        if (weight !== set.weight || reps !== set.reps) {
            onUpdate(index, weight, reps);
        }
    };

    return (
        <div className={`grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 items-center ${set.done ? 'opacity-50' : ''} transition-all`}>
            <div className="flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-slate-700 text-xs flex items-center justify-center text-slate-300 font-bold">{index + 1}</div>
            </div>
            
            <input 
                type="number" inputMode="decimal" placeholder="-" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                onBlur={handleBlur}
                className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}
            />
            
            <input 
                type="number" inputMode="numeric" placeholder="-" 
                value={reps} 
                onChange={(e) => setReps(e.target.value)}
                onBlur={handleBlur}
                className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}
            />
            
            <button 
                onClick={() => onToggle(index)}
                className={`w-full h-full flex items-center justify-center rounded-lg border transition-all ${set.done ? 'bg-green-500 border-green-500 text-black' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-400'}`}
            >
                <Check size={16} strokeWidth={3} />
            </button>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

export default function RPApp() {
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [activeMeso, setActiveMeso] = useState('meso1');
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  
  // Data State Global
  const [fullData, setFullData] = useState<any>({ plans: {}, logs: {}, settings: {} });
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Inicialización
  useEffect(() => {
      const data = getStoredData();
      setFullData(data);
      setCustomExercises(data.settings?.exercises || []);
      setCustomCategories(data.settings?.categories || []);
      setLoading(false);
  }, []);

  // Helper de guardado
  const updateData = (path: string, value: any) => {
      const newData = { ...fullData };
      const parts = path.split('.');
      if(parts[0] === 'logs') {
          if(!newData.logs) newData.logs = {};
          newData.logs[parts[1]] = value;
      } else if (parts[0] === 'plans') {
          if(!newData.plans) newData.plans = {};
          newData.plans[parts[1]] = value;
      } else if (parts[0] === 'settings') {
          if(!newData.settings) newData.settings = {};
          newData.settings[parts[1]] = value;
      } else if (parts[0] === 'full') {
          // Full replace (import)
          setFullData(value);
          saveData(value);
          return;
      }
      
      setFullData(newData);
      saveData(newData);
  };

  // Handlers Globales
  const handleCreateExercise = (name: string, category: string) => {
      const newExercise = { name, category, url: '', isCustom: true };
      const updatedExercises = [...customExercises, newExercise];
      
      let updatedCategories = [...customCategories];
      if (!DEFAULT_CATEGORIES.includes(category) && !customCategories.includes(category)) {
          updatedCategories.push(category);
          setCustomCategories(updatedCategories);
      }

      setCustomExercises(updatedExercises);
      
      const newSettings = { ...fullData.settings, exercises: updatedExercises, categories: updatedCategories };
      const newData = { ...fullData, settings: newSettings };
      setFullData(newData);
      saveData(newData);
  };

  const userStructure = fullData.settings?.structure || {};
  const dailyCategories = userStructure[activeDay] || ["Horizontal Push", "Vertical Pull", "Quads", "Hamstrings", "Side Delts"];
  
  const EXERCISE_DB = useMemo(() => {
      const defaults = [
          { category: "Vertical Pull", name: "Assisted Overhand Pullup" },
          { category: "Vertical Pull", name: "Wide Grip Pullup" },
          { category: "Horizontal Push", name: "Flat Barbell Bench Press" },
          { category: "Horizontal Push", name: "Pushups" },
          { category: "Quads", name: "High Bar Squat" },
          { category: "Quads", name: "Leg Press" },
          { category: "Hamstrings", name: "Lying Leg Curl" },
          { category: "Side Delts", name: "Dumbbell Side Lateral Raise" },
      ];
      return [...defaults, ...customExercises];
  }, [customExercises]);

  const ALL_CATEGORIES = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);

  if (loading) return <div className="h-screen bg-slate-950 text-white flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-40">
      
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black italic text-blue-500">RP APP <span className="text-xs not-italic text-slate-500">v5.0</span></h1>
            <button onClick={() => setShowSettings(true)}><Menu className="text-slate-400"/></button>
        </div>
        
        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2">
            <select value={activeMeso} onChange={(e) => { setActiveMeso(e.target.value); setActiveWeek(1); }} className="bg-slate-800 text-sm p-2 rounded border border-slate-700">
              {MESOCYCLES.map(m => <option key={m.id} value={m.id}>{m.name.split(':')[0]}</option>)}
            </select>
            <select value={activeWeek} onChange={(e) => setActiveWeek(Number(e.target.value))} className="bg-slate-800 text-sm p-2 rounded border border-slate-700 text-center">
              {[1,2,3,4,5].map(w => <option key={w} value={w}>Sem {w}</option>)}
            </select>
            <select value={activeDay} onChange={(e) => setActiveDay(Number(e.target.value))} className="bg-slate-800 text-sm p-2 rounded border border-slate-700 text-center">
              {[1,2,3,4].map(d => <option key={d} value={d}>Día {d}</option>)}
            </select>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {dailyCategories.map((cat: string, idx: number) => (
            <ExerciseCard 
                key={`${activeMeso}-w${activeWeek}-d${activeDay}-s${idx}`} 
                slot={idx + 1}
                category={cat}
                day={activeDay}
                meso={activeMeso}
                week={activeWeek}
                fullData={fullData}
                onUpdateData={updateData}
                exerciseDB={EXERCISE_DB}
                allCategories={ALL_CATEGORIES}
                onCreateReq={() => setShowCreateModal(true)}
            />
        ))}
        
        <div className="pt-4 text-center">
            <button className="text-slate-500 text-sm border border-dashed border-slate-700 w-full py-3 rounded-xl hover:border-slate-500 hover:text-slate-300">
                + Añadir Slot (Configurar en Estructura)
            </button>
        </div>
      </main>

      <CreateExerciseModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateExercise}
        categories={ALL_CATEGORIES}
      />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} fullData={fullData} onImport={(d: any) => updateData('full', d)} />
    </div>
  );
}

// --- CARD DE EJERCICIO ---
const ExerciseCard = ({ slot, category, day, meso, week, fullData, onUpdateData, exerciseDB, allCategories, onCreateReq }: any) => {
    const planId = `${meso}_day_${day}`;
    const logId = `${meso}_w${week}_d${day}`;
    
    const plan = fullData.plans?.[planId]?.exercises?.[slot]; 
    const log = fullData.logs?.[logId]?.exercises?.[plan?.name] || {}; 

    const [isEditingCat, setIsEditingCat] = useState(false);

    const handleSelectExercise = (exName: string) => {
        const currentPlan = fullData.plans?.[planId] || { exercises: {} };
        const newPlan = { ...currentPlan, exercises: { ...currentPlan.exercises, [slot]: { name: exName, category } } };
        onUpdateData(`plans.${planId}`, newPlan);
    };

    const handleUpdateSeries = (newSeries: any[]) => {
        const currentDayLog = fullData.logs?.[logId] || { exercises: {} };
        const currentExLog = currentDayLog.exercises?.[plan?.name] || {};
        const newExLog = { ...currentExLog, series: newSeries };
        const newDayLog = { ...currentDayLog, exercises: { ...currentDayLog.exercises, [plan.name]: newExLog } };
        onUpdateData(`logs.${logId}`, newDayLog);
    };

    const handleUpdateRating = (rating: number) => {
        const currentDayLog = fullData.logs?.[logId] || { exercises: {} };
        const currentExLog = currentDayLog.exercises?.[plan?.name] || {};
        const newExLog = { ...currentExLog, rating };
        const newDayLog = { ...currentDayLog, exercises: { ...currentDayLog.exercises, [plan.name]: newExLog } };
        onUpdateData(`logs.${logId}`, newDayLog);
    };

    const handleUpdateCategory = (newCat: string) => {
        const settings = fullData.settings || {};
        const structure = settings.structure || {}; 
        const currentDayStructure = structure[day] || ["Horizontal Push", "Vertical Pull", "Quads", "Hamstrings", "Side Delts"];
        
        const newDayStructure = [...currentDayStructure];
        newDayStructure[slot - 1] = newCat;
        
        const newSettings = { ...settings, structure: { ...structure, [day]: newDayStructure } };
        onUpdateData('settings', newSettings); 
        setIsEditingCat(false);
    };

    const defaultSeriesCount = INITIAL_SETS_CONFIG[category] || 2;
    const series = log.series || Array(defaultSeriesCount).fill({ weight: '', reps: '', done: false });

    const filteredExercises = exerciseDB.filter((ex: any) => ex.category === category);

    if (!plan) {
        return (
            <Card className="border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setIsEditingCat(!isEditingCat)} className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border border-blue-500/30">
                            {category} <Edit3 size={10}/>
                        </button>
                    </div>
                    <span className="text-slate-500 font-black text-2xl opacity-20">{slot}</span>
                </div>

                {isEditingCat ? (
                    <div className="mb-4 bg-slate-900 p-2 rounded border border-slate-600">
                        <p className="text-xs text-slate-400 mb-1">Cambiar Categoría del Slot:</p>
                        <select 
                            className="w-full bg-slate-800 text-white p-2 rounded" 
                            value={category} 
                            onChange={(e) => handleUpdateCategory(e.target.value)}
                        >
                            {allCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Seleccionar Ejercicio:</label>
                        <select 
                            className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-700"
                            onChange={(e) => handleSelectExercise(e.target.value)}
                            value=""
                        >
                            <option value="" disabled>-- Elige uno --</option>
                            {filteredExercises.map((ex: any) => (
                                <option key={ex.name} value={ex.name}>{ex.isCustom ? '👤 ' : ''}{ex.name}</option>
                            ))}
                        </select>
                        <button onClick={onCreateReq} className="w-full py-2 text-xs text-green-400 border border-green-900 rounded bg-green-900/10 flex justify-center gap-1 items-center">
                            <Plus size={12}/> Crear Nuevo Ejercicio
                        </button>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{category}</span>
                    <h3 className="text-lg font-bold text-white flex gap-2 items-center">
                        {plan.name} 
                        <button onClick={() => handleSelectExercise('')} className="text-slate-600 hover:text-red-400"><RefreshCw size={12}/></button>
                    </h3>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 px-2 text-[10px] text-slate-500 font-bold uppercase text-center">
                    <div>#</div><div>Kg</div><div>Reps</div><div>Ok</div>
                </div>
                
                {series.map((s: any, idx: number) => (
                    <SetRow 
                        key={idx} 
                        index={idx} 
                        set={s} 
                        onUpdate={(i: number, w: string, r: string) => {
                            const newSeries = [...series];
                            newSeries[i] = { ...newSeries[i], weight: w, reps: r };
                            handleUpdateSeries(newSeries);
                        }}
                        onToggle={(i: number) => {
                            const newSeries = [...series];
                            newSeries[i] = { ...newSeries[i], done: !newSeries[i].done };
                            handleUpdateSeries(newSeries);
                        }}
                    />
                ))}

                <div className="flex justify-center gap-4 pt-2">
                    <button 
                        onClick={() => handleUpdateSeries([...series, {weight: series[series.length-1]?.weight || '', reps: '', done: false}])}
                        className="text-xs text-blue-400 font-bold flex items-center gap-1 bg-slate-900 px-3 py-1 rounded"
                    >
                        <Plus size={12}/> Set
                    </button>
                    {series.length > 1 && (
                        <button 
                            onClick={() => handleUpdateSeries(series.slice(0, -1))}
                            className="text-xs text-red-400 font-bold flex items-center gap-1 bg-slate-900 px-3 py-1 rounded"
                        >
                            <Trash2 size={12}/>
                        </button>
                    )}
                </div>
            </div>

            <select 
                value={log.rating !== undefined ? log.rating : 99}
                onChange={(e) => handleUpdateRating(Number(e.target.value))}
                className={`w-full p-2 rounded text-sm font-bold border outline-none
                    ${log.rating === 0 ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700' : 
                      log.rating > 0 ? 'bg-blue-900/30 text-blue-400 border-blue-700' :
                      log.rating < 0 ? 'bg-red-900/30 text-red-400 border-red-700' : 
                      'bg-slate-800 border-slate-600 text-slate-400'}
                `}
            >
                <option value={99} disabled>Evaluar Recuperación...</option>
                {RATING_GUIDE.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
            </select>
        </Card>
    );
};

// --- MODALES ---

const CreateExerciseModal = ({ isOpen, onClose, onCreate, categories }: any) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState(categories[0] || 'Chest');
    const [isCustomCat, setIsCustomCat] = useState(false);
    const [customCatName, setCustomCatName] = useState('');

    if(!isOpen) return null;

    const handleSubmit = () => {
        const finalCat = isCustomCat ? customCatName : category;
        if(name && finalCat) {
            onCreate(name, finalCat);
            setName('');
            setCustomCatName('');
            setIsCustomCat(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-white font-bold mb-4">Nuevo Ejercicio</h3>
                
                <label className="text-xs text-slate-400 block mb-1">Nombre</label>
                <input 
                    className="w-full bg-slate-800 text-white border border-slate-600 p-2 rounded mb-4"
                    value={name} onChange={e => setName(e.target.value)} autoFocus
                />

                <label className="text-xs text-slate-400 block mb-1">Categoría</label>
                {!isCustomCat ? (
                    <div className="flex gap-2 mb-6">
                        <select 
                            className="w-full bg-slate-800 text-white border border-slate-600 p-2 rounded"
                            value={category} onChange={e => setCategory(e.target.value)}
                        >
                            {categories.map((c:string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={() => setIsCustomCat(true)} className="bg-slate-800 border border-slate-600 p-2 rounded hover:bg-slate-700">
                            <FolderPlus className="text-blue-400" size={20}/>
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 mb-6">
                        <input 
                            placeholder="Nueva Categoría..."
                            className="w-full bg-slate-800 text-white border border-blue-500 p-2 rounded"
                            value={customCatName} onChange={e => setCustomCatName(e.target.value)}
                        />
                        <button onClick={() => setIsCustomCat(false)} className="text-xs text-slate-400">Cancelar</button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 p-3 rounded bg-slate-800 text-white">Cancelar</button>
                    <button onClick={handleSubmit} className="flex-1 p-3 rounded bg-blue-600 text-white font-bold">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, fullData, onImport }: any) => {
    const fileRef = useRef<any>(null);
    if (!isOpen) return null;
    
    const handleExport = () => {
        const blob = new Blob([JSON.stringify(fullData)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'rp_backup.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const handleImportFile = (e: any) => {
        const reader = new FileReader();
        reader.onload = (ev: any) => onImport(JSON.parse(ev.target.result));
        reader.readAsText(e.target.files[0]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-sm space-y-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings className="text-blue-500"/> Ajustes</h3>
                <button onClick={handleExport} className="w-full p-4 bg-slate-800 rounded flex items-center gap-3 text-white hover:bg-slate-700"><Download size={20}/> Exportar Backup</button>
                <button onClick={() => fileRef.current.click()} className="w-full p-4 bg-slate-800 rounded flex items-center gap-3 text-white hover:bg-slate-700"><Upload size={20}/> Importar Backup</button>
                <input type="file" ref={fileRef} className="hidden" onChange={handleImportFile} />
                <button onClick={() => { if(confirm("Borrar todo?")) { localStorage.clear(); window.location.reload(); } }} className="w-full p-4 bg-red-900/20 text-red-400 rounded flex items-center gap-3 hover:bg-red-900/30"><Trash2 size={20}/> Resetear Fábrica</button>
                <button onClick={onClose} className="w-full p-2 text-slate-500 text-sm mt-2">Cerrar</button>
            </div>
        </div>
    );
};