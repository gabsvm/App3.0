import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, ChevronRight, Youtube, Info, Filter, RefreshCw, Unlock, 
  Timer, Play, Pause, RotateCcw, X, Edit3, Check, ArrowUp, ArrowDown, 
  ArrowRight, Settings, Download, Upload, Link as LinkIcon, Unlink, 
  Plus, User, Smartphone, Menu, Trash2, Save, CheckCircle2, Trophy,
  BookOpen, FolderPlus, Calendar, List
} from 'lucide-react';

// --- UTILIDADES ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// --- CONFIGURACIÓN ---
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

const STORAGE_KEY = 'rp_hypertrophy_data_v7';

// --- DATA MANAGER ---
const getStoredData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { programs: [], activeProgramId: null, settings: {} };
        return JSON.parse(data);
    } catch (e) {
        return { programs: [], activeProgramId: null, settings: {} };
    }
};

const saveData = (newData: any) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) { console.error("Error saving", e); }
};

// --- COMPONENTES UI ---

const SetRow = ({ index, set, onUpdate, onToggle }: any) => {
    const [weight, setWeight] = useState(set.weight);
    const [reps, setReps] = useState(set.reps);

    useEffect(() => { setWeight(set.weight); setReps(set.reps); }, [set]);

    const handleBlur = () => {
        if (weight !== set.weight || reps !== set.reps) onUpdate(index, weight, reps);
    };

    return (
        <div className={`grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 items-center ${set.done ? 'opacity-50' : ''} transition-all`}>
            <div className="flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-slate-700 text-xs flex items-center justify-center text-slate-300 font-bold">{index + 1}</div></div>
            <input type="number" inputMode="decimal" placeholder="-" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={handleBlur} className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}/>
            <input type="number" inputMode="numeric" placeholder="-" value={reps} onChange={(e) => setReps(e.target.value)} onBlur={handleBlur} className={`w-full bg-slate-900 border ${set.done ? 'border-green-900 text-green-500' : 'border-slate-700 text-white'} rounded-lg py-2 text-center font-bold outline-none focus:border-blue-500 transition-colors`}/>
            <button onClick={() => onToggle(index)} className={`w-full h-full flex items-center justify-center rounded-lg border transition-all ${set.done ? 'bg-green-500 border-green-500 text-black' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-400'}`}><Check size={16} strokeWidth={3} /></button>
        </div>
    );
};

const PlanEditor = ({ isOpen, onClose, onSave, categories }: any) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [daysCount, setDaysCount] = useState(4);
    const [structure, setStructure] = useState<any>({ 1: [] });

    useEffect(() => {
        const newStructure = { ...structure };
        for (let i = 1; i <= daysCount; i++) if (!newStructure[i]) newStructure[i] = [];
        setStructure(newStructure);
    }, [daysCount]);

    if (!isOpen) return null;

    const handleSave = () => {
        if(!name.trim()) return alert("Nombre requerido");
        onSave({ id: generateId(), name, description: desc, daysCount, structure, createdAt: new Date().toISOString(), logs: {}, plans: {} });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[100] overflow-y-auto">
            <div className="max-w-2xl mx-auto p-4 pb-20">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-950 py-4 border-b border-slate-800 z-10">
                    <h2 className="text-xl font-bold text-white flex gap-2 items-center"><Edit3 className="text-blue-500"/> Crear Plan</h2>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400"><X size={20}/></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div><label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Nombre</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Especialización Pecho" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none text-lg font-bold"/></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Descripción</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Objetivo del plan..." className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-20 text-sm"/></div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Días / Semana</label>
                            <div className="flex gap-2 overflow-x-auto">{[2,3,4,5,6].map(d => (<button key={d} onClick={() => setDaysCount(d)} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${daysCount === d ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{d} D</button>))}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Estructura</h3>
                        {Array.from({length: daysCount}).map((_, i) => {
                            const dayNum = i + 1;
                            const daySlots = structure[dayNum] || [];
                            return (
                                <div key={dayNum} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                    <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex justify-between items-center"><span className="font-bold text-blue-400">Día {dayNum}</span><span className="text-xs text-slate-500">{daySlots.length} Slots</span></div>
                                    <div className="p-3 space-y-2">
                                        {daySlots.map((cat: string, idx: number) => (
                                            <div key={idx} className="flex gap-2 items-center"><span className="text-xs font-mono text-slate-500 w-4">{idx + 1}</span><select value={cat} onChange={(e) => { const n = [...structure[dayNum]]; n[idx] = e.target.value; setStructure({...structure, [dayNum]: n}); }} className="flex-1 bg-slate-800 text-white text-sm p-2 rounded border border-slate-700 focus:border-blue-500 outline-none">{categories.map((c: string) => <option key={c} value={c}>{c}</option>)}</select><button onClick={() => { const n = [...structure[dayNum]]; n.splice(idx, 1); setStructure({...structure, [dayNum]: n}); }} className="text-red-400 p-2 hover:bg-red-900/20 rounded"><Trash2 size={16}/></button></div>
                                        ))}
                                        <button onClick={() => { const n = [...(structure[dayNum] || []), categories[0]]; setStructure({...structure, [dayNum]: n}); }} className="w-full py-2 mt-2 border border-dashed border-slate-700 rounded text-slate-500 text-xs hover:border-slate-500 hover:text-slate-300 flex justify-center items-center gap-1"><Plus size={12}/> Slot</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800"><button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"><Save size={20}/> Guardar Plan</button></div>
            </div>
        </div>
    );
};

const PlansView = ({ programs, onSelect, onCreate, onDelete }: any) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
            <div className="mb-8"><h1 className="text-3xl font-black italic text-blue-500 mb-1">MIS PLANES</h1><p className="text-slate-400 text-sm">Selecciona o crea una rutina.</p></div>
            <div className="space-y-4">
                {programs.map((plan: any) => (
                    <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative group hover:border-slate-600 transition-all">
                        <div className="absolute top-4 right-4 flex gap-2"><button onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) onDelete(plan.id); }} className="p-2 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={18}/></button></div>
                        <div onClick={() => onSelect(plan.id)} className="cursor-pointer">
                            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{plan.description}</p>
                            <div className="flex gap-3 text-xs font-mono text-slate-500 uppercase tracking-wider"><span className="flex items-center gap-1"><Calendar size={12}/> {plan.daysCount} Días</span><span className="flex items-center gap-1"><List size={12}/> {Object.values(plan.structure).flat().length} Slots</span></div>
                        </div>
                        <button onClick={() => onSelect(plan.id)} className="mt-4 w-full bg-blue-600/10 text-blue-400 border border-blue-600/20 py-2 rounded-lg font-bold text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">Entrenar <ArrowRight size={16}/></button>
                    </div>
                ))}
                {programs.length === 0 && <div className="text-center py-10 opacity-50"><Dumbbell size={48} className="mx-auto mb-4 text-slate-600"/><p>No tienes planes.</p></div>}
                <button onClick={onCreate} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus size={24}/> Crear Nuevo Plan</button>
            </div>
        </div>
    );
};

const WorkoutView = ({ program, onUpdateProgram, onBack, exerciseDB, allCategories, onCreateExercise, activeMeso, setActiveMeso, activeWeek, setActiveWeek, activeDay, setActiveDay }: any) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    if (!program) return <div>Error: No hay plan activo</div>;

    const dailySlots = program.structure[activeDay] || [];
    const currentMesoConfig = MESOCYCLES.find(m => m.id === activeMeso);
    const isDeload = activeWeek === currentMesoConfig?.deloadWeek;

    const handleExerciseSelect = (day: number, slot: number, exercise: any) => {
        const planId = `${activeMeso}_day_${day}`;
        const currentPlan = program.plans?.[planId] || { exercises: {} };
        const newPlan = { ...currentPlan, exercises: { ...currentPlan.exercises, [slot]: exercise } };
        onUpdateProgram(`plans.${planId}`, newPlan);
    };

    const handleLogUpdate = (exerciseName: string, field: string, value: any) => {
        const logId = `${activeMeso}_w${activeWeek}_d${activeDay}`;
        const currentLog = program.logs?.[logId] || { exercises: {} };
        const currentEx = currentLog.exercises?.[exerciseName] || { series: [], rating: 0 };
        let updatedEx = { ...currentEx };
        if (field === 'series') updatedEx.series = value;
        else updatedEx[field] = value;
        const newDayLog = { ...currentLog, exercises: { ...currentLog.exercises, [exerciseName]: updatedEx } };
        onUpdateProgram(`logs.${logId}`, newDayLog);
    };

    const handleSlotChange = (newCat: string, slotIdx: number) => {
        const newDaySlots = [...dailySlots];
        newDaySlots[slotIdx] = newCat;
        const newStructure = { ...program.structure, [activeDay]: newDaySlots };
        onUpdateProgram('structure', newStructure);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-40">
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white"><ChevronRight className="rotate-180" size={20}/> <span className="font-bold text-xs uppercase tracking-widest truncate max-w-[150px]">{program.name}</span></button>
                    <div className="flex gap-2">{isDeload && <span className="text-[10px] bg-green-500 text-black font-black px-2 py-1 rounded animate-pulse">DELOAD</span>}</div>
                </div>
                <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2">
                    <select value={activeMeso} onChange={e => { setActiveMeso(e.target.value); setActiveWeek(1); }} className="bg-slate-800 text-sm p-2 rounded border border-slate-700 outline-none">{MESOCYCLES.map(m => <option key={m.id} value={m.id}>{m.name.split(':')[0]}</option>)}</select>
                    <select value={activeWeek} onChange={e => setActiveWeek(Number(e.target.value))} className="bg-slate-800 text-sm p-2 rounded border border-slate-700 text-center outline-none">{[1,2,3,4,5].map(w => <option key={w} value={w}>Sem {w}</option>)}</select>
                    <select value={activeDay} onChange={e => setActiveDay(Number(e.target.value))} className="bg-slate-800 text-sm p-2 rounded border border-slate-700 text-center outline-none">{Array.from({length: program.daysCount || 4}).map((_, i) => <option key={i+1} value={i+1}>Día {i+1}</option>)}</select>
                </div>
            </header>
            <main className="p-4 space-y-4">
                {dailySlots.length === 0 && <div className="text-center text-slate-500 py-10">Este día está vacío. Edita el plan para añadir slots.</div>}
                {dailySlots.map((cat: string, idx: number) => (
                    <ExerciseCard 
                        key={`${program.id}-${activeMeso}-w${activeWeek}-d${activeDay}-s${idx+1}`}
                        slot={idx + 1} category={cat} day={activeDay} meso={activeMeso} week={activeWeek}
                        program={program} onSelectExercise={handleExerciseSelect} onLogUpdate={handleLogUpdate} onCategoryChange={(newCat: string) => handleSlotChange(newCat, idx)}
                        exerciseDB={exerciseDB} allCategories={allCategories} onCreateReq={() => setShowCreateModal(true)} isDeload={isDeload}
                    />
                ))}
            </main>
            <CreateExerciseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={onCreateExercise} categories={allCategories} />
        </div>
    );
};

const ExerciseCard = ({ slot, category, day, meso, week, program, onSelectExercise, onLogUpdate, onCategoryChange, exerciseDB, allCategories, onCreateReq, isDeload }: any) => {
    const planId = `${meso}_day_${day}`;
    const logId = `${meso}_w${week}_d${day}`;
    const plan = program.plans?.[planId]?.exercises?.[slot]; 
    const log = program.logs?.[logId]?.exercises?.[plan?.name] || {}; 
    const [isEditingCat, setIsEditingCat] = useState(false);
    const defaultSeriesCount = INITIAL_SETS_CONFIG[category] || 2;
    const series = log.series || Array(defaultSeriesCount).fill({ weight: '', reps: '', done: false });
    const filteredExercises = exerciseDB.filter((ex: any) => ex.category === category);

    if (!plan) {
        return (
            <div className="bg-slate-800 border-l-4 border-blue-500 p-4 rounded-r-xl shadow-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                    <button onClick={() => setIsEditingCat(!isEditingCat)} className="text-xs font-bold uppercase bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-500/30 flex gap-1 items-center">{category} <Edit3 size={10}/></button>
                    <span className="text-slate-600 font-black text-xl opacity-30">#{slot}</span>
                </div>
                {isEditingCat ? (
                    <select className="w-full bg-slate-900 text-white p-2 rounded mb-2" value={category} onChange={(e) => { onCategoryChange(e.target.value); setIsEditingCat(false); }}>{allCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}</select>
                ) : (
                    <div className="flex gap-2">
                        <select className="flex-1 bg-slate-900 text-white p-3 rounded-lg border border-slate-700 outline-none" onChange={(e) => { const ex = exerciseDB.find((x:any) => x.name === e.target.value); onSelectExercise(day, slot, ex); }} value=""><option value="" disabled>Seleccionar Ejercicio...</option>{filteredExercises.map((ex: any) => <option key={ex.name} value={ex.name}>{ex.isCustom?'👤 ':''}{ex.name}</option>)}</select>
                        <button onClick={onCreateReq} className="bg-slate-700 p-3 rounded-lg text-green-400"><Plus size={20}/></button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-slate-800 border ${isDeload ? 'border-green-800' : 'border-slate-700'} p-4 rounded-xl shadow-lg mb-4 relative`}>
            {isDeload && <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">DELOAD (-50%)</div>}
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{category}</div><h3 className="text-lg font-bold text-white leading-tight">{plan.name}</h3></div>
                <button onClick={() => onSelectExercise(day, slot, null)} className="text-slate-600 hover:text-red-400 p-1"><RefreshCw size={14}/></button>
            </div>
            <div className="space-y-2 mb-4">
                <div className="grid grid-cols-[0.5fr_1.5fr_1.5fr_0.5fr] gap-2 px-2 text-[10px] text-slate-500 font-bold uppercase text-center"><div>#</div><div>Kg</div><div>Reps</div><div>Ok</div></div>
                {series.map((s: any, idx: number) => (
                    <SetRow key={idx} index={idx} set={s} onUpdate={(i: number, w: string, r: string) => { const newSeries = [...series]; newSeries[i] = { ...newSeries[i], weight: w, reps: r }; onLogUpdate(plan.name, 'series', newSeries); }} onToggle={(i: number) => { const newSeries = [...series]; newSeries[i] = { ...newSeries[i], done: !newSeries[i].done }; onLogUpdate(plan.name, 'series', newSeries); }} />
                ))}
                <div className="flex justify-center gap-3 pt-2">
                    <button onClick={() => onLogUpdate(plan.name, 'series', [...series, {weight: series[series.length-1]?.weight||'', reps:'', done:false}])} className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">+</button>
                    {series.length > 1 && <button onClick={() => onLogUpdate(plan.name, 'series', series.slice(0, -1))} className="bg-slate-700 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">-</button>}
                </div>
            </div>
            <select value={log.rating !== undefined ? log.rating : 99} onChange={(e) => onLogUpdate(plan.name, 'rating', Number(e.target.value))} className={`w-full p-3 rounded-lg text-sm font-bold border outline-none appearance-none cursor-pointer transition-colors ${log.rating === 0 ? 'bg-yellow-900/20 text-yellow-500 border-yellow-600' : log.rating > 0 ? 'bg-blue-900/20 text-blue-400 border-blue-600' : log.rating < 0 ? 'bg-red-900/20 text-red-400 border-red-600' : 'bg-slate-900 border-slate-600 text-slate-400'}`}>
                <option value={99} disabled>Evaluar Recuperación...</option>
                {RATING_GUIDE.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
            </select>
        </div>
    );
};

// --- APP WRAPPER ---
export default function RPApp() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'plans' | 'app'>('plans');
  const [data, setData] = useState<any>({ programs: [], activeProgramId: null, settings: {} });
  const [activeMeso, setActiveMeso] = useState('meso1');
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
      const stored = getStoredData();
      setData(stored);
      setCustomExercises(stored.settings?.exercises || []);
      setCustomCategories(stored.settings?.categories || []);
      setLoading(false);
  }, []);

  const updateGlobalData = (newData: any) => { setData(newData); saveData(newData); };
  const handleCreatePlan = (newPlan: any) => { const updatedPrograms = [...data.programs, newPlan]; updateGlobalData({ ...data, programs: updatedPrograms }); };
  const handleDeletePlan = (planId: string) => { const updatedPrograms = data.programs.filter((p: any) => p.id !== planId); updateGlobalData({ ...data, programs: updatedPrograms }); if (data.activeProgramId === planId) setView('plans'); };
  const handleSelectPlan = (planId: string) => { updateGlobalData({ ...data, activeProgramId: planId }); setView('app'); };
  
  const activeProgram = data.programs.find((p: any) => p.id === data.activeProgramId);
  const updateActiveProgram = (field: string, value: any) => {
      if (!activeProgram) return;
      const updatedProgram = { ...activeProgram };
      if (field.includes('.')) { const [root, key] = field.split('.'); updatedProgram[root] = { ...updatedProgram[root], [key]: value }; } 
      else { updatedProgram[field] = value; }
      const updatedPrograms = data.programs.map((p: any) => p.id === activeProgram.id ? updatedProgram : p);
      updateGlobalData({ ...data, programs: updatedPrograms });
  };

  const EXERCISE_DB_DEFAULT = [
      { category: "Vertical Pull", name: "Assisted Overhand Pullup" },
      { category: "Vertical Pull", name: "Lat Pulldown" },
      { category: "Horizontal Push", name: "Flat Barbell Bench Press" },
      { category: "Horizontal Push", name: "Pushups" },
      { category: "Quads", name: "Squat" },
      { category: "Quads", name: "Leg Press" },
      { category: "Hamstrings", name: "Lying Leg Curl" },
      { category: "Side Delts", name: "Dumbbell Side Lateral Raise" },
  ];
  const allExercises = useMemo(() => [...EXERCISE_DB_DEFAULT, ...customExercises], [customExercises]);
  const allCategories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);

  const handleCreateExerciseGlobal = (name: string, category: string) => {
      const newEx = { name, category, isCustom: true };
      const newExercises = [...customExercises, newEx];
      let newCats = [...customCategories];
      if(!DEFAULT_CATEGORIES.includes(category) && !customCategories.includes(category)) { newCats.push(category); }
      setCustomExercises(newExercises); setCustomCategories(newCats);
      updateGlobalData({ ...data, settings: { ...data.settings, exercises: newExercises, categories: newCats } });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500">Cargando...</div>;

  if (view === 'plans') return (<> <PlansView programs={data.programs} onSelect={handleSelectPlan} onCreate={() => document.getElementById('plan-creator-trigger')?.click()} onDelete={handleDeletePlan} /> <PlanEditorButtonTrigger onSave={handleCreatePlan} categories={allCategories}/></>);

  return (
      <WorkoutView 
          program={activeProgram} onUpdateProgram={updateActiveProgram} onBack={() => setView('plans')}
          exerciseDB={allExercises} allCategories={allCategories} onCreateExercise={handleCreateExerciseGlobal}
          activeMeso={activeMeso} setActiveMeso={setActiveMeso} activeWeek={activeWeek} setActiveWeek={setActiveWeek} activeDay={activeDay} setActiveDay={setActiveDay}
      />
  );
}

// Botón trigger oculto para el modal (hack rápido para no elevar estado UI)
const PlanEditorButtonTrigger = ({onSave, categories}:any) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button id="plan-creator-trigger" className="hidden" onClick={()=>setOpen(true)}></button>
            <PlanEditor isOpen={open} onClose={()=>setOpen(false)} onSave={onSave} categories={categories}/>
        </>
    )
}

// --- CREAR EJERCICIO MODAL ---
const CreateExerciseModal = ({ isOpen, onClose, onCreate, category }: any) => {
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