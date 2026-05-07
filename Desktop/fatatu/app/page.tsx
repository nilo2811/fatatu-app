'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { analyzeFood } from '../lib/ai';

type Meal = { id: number; name: string; kcal: number; protein: number; carbs: number; fat: number; created_at: string };

type Recipe = {
  title: string;
  tag: "REDUKCJA" | "MASA" | "UTRZYMANIE";
  kcal: number; p: number; c: number; f: number;
  time: string;
  ingredients: string[];
  steps: string[];
};

const RECIPES: Recipe[] = [
  // --- REDUKCJA (8) ---
  { title: "Skyrowy Omlet Puszysty", tag: "REDUKCJA", kcal: 350, p: 40, c: 15, f: 12, time: "10 min", ingredients: ["2 jajka M", "150g Skyru naturalnego", "30g mąki", "Erytrytol", "Borówki"], steps: ["Wymieszaj skyr z jajkami i słodzikiem.", "Dodaj mąkę, mieszaj na gładką masę.", "Smaż pod przykryciem 5 min z jednej strony.", "Obróć i dosmaż 2 minuty."] },
  { title: "Bowl z Tuńczykiem", tag: "REDUKCJA", kcal: 310, p: 38, c: 12, f: 10, time: "5 min", ingredients: ["1 puszka tuńczyka", "Mix sałat", "1 jajko ugotowane", "50g kukurydzy", "Sos jogurtowo-czosnkowy"], steps: ["Odsącz tuńczyka.", "Ułóż sałatę, dodaj tuńczyka i kukurydzę.", "Dodaj jajko w ćwiartkach i polej sosem."] },
  { title: "Fit Tortilla Gyros", tag: "REDUKCJA", kcal: 440, p: 35, c: 48, f: 12, time: "15 min", ingredients: ["1 tortilla pełnoziarnista", "120g kurczaka", "Kapusta pekińska", "Pomidor", "Przyprawa gyros"], steps: ["Kurczaka usmaż bez tłuszczu.", "Podgrzej tortillę.", "Nałóż sos, warzywa i mięso.", "Ciasno zwiń."] },
  { title: "Twaróg na Słodko", tag: "REDUKCJA", kcal: 320, p: 45, c: 15, f: 8, time: "5 min", ingredients: ["250g chudego twarogu", "15g masła orzechowego", "Słodzik", "Maliny"], steps: ["Twaróg rozgnieć widelcem.", "Dodaj masło i słodzik, wymieszaj.", "Posyp owocami."] },
  { title: "Makaron Boloński Light", tag: "REDUKCJA", kcal: 480, p: 38, c: 65, f: 9, time: "20 min", ingredients: ["150g mielonego z indyka", "70g makaronu", "200ml passaty", "Cebula, czosnek"], steps: ["Ugotuj makaron.", "Podsmaż cebulę i mięso.", "Zalej passatą i duś 10 min.", "Wymieszaj."] },
  { title: "Szakszuka Warzywna", tag: "REDUKCJA", kcal: 300, p: 20, c: 20, f: 15, time: "15 min", ingredients: ["2 jajka", "Pół puszki pomidorów", "Cebula", "Papryka"], steps: ["Podsmaż warzywa.", "Zalej pomidorami.", "Wbij jajka i przykryj do ścięcia białek."] },
  { title: "Zoodles z Krewetkami", tag: "REDUKCJA", kcal: 250, p: 30, c: 10, f: 8, time: "15 min", ingredients: ["Cukinia", "150g krewetek", "Czosnek", "Cytryna"], steps: ["Zrób makaron z cukinii.", "Krewetki smaż na czosnku 3 min.", "Dodaj cukinię na 2 minuty.", "Skrop cytryną."] },
  { title: "Zupa Krem z Pomidorów", tag: "REDUKCJA", kcal: 280, p: 15, c: 35, f: 10, time: "20 min", ingredients: ["Puszka pomidorów", "Cebula", "Bulion", "Feta light"], steps: ["Podsmaż cebulę.", "Dodaj pomidory i bulion.", "Gotuj 15 min i zblenduj.", "Posyp fetą."] },

  // --- MASA (8) ---
  { title: "Kurczak Curry", tag: "MASA", kcal: 850, p: 55, c: 105, f: 22, time: "25 min", ingredients: ["200g kurczaka", "120g ryżu", "50ml mleczka kokosowego", "Pasta curry"], steps: ["Ugotuj ryż.", "Smaż kurczaka.", "Dodaj mleczko i curry, duś.", "Podawaj z ryżem."] },
  { title: "Szejk Snikers", tag: "MASA", kcal: 980, p: 48, c: 120, f: 35, time: "3 min", ingredients: ["100g owsianych", "1 banan", "40g masła orzechowego", "30g białka", "Mleko"], steps: ["Zmiel płatki.", "Dodaj resztę składników.", "Zblenduj na gładko."] },
  { title: "Gulasz Wołowy", tag: "MASA", kcal: 890, p: 52, c: 90, f: 32, time: "50 min", ingredients: ["180g wołowiny", "120g kaszy", "Marchewka", "Cebula"], steps: ["Wołowinę duś z warzywami 40 min.", "Ugotuj kaszę.", "Podawaj z sosem."] },
  { title: "Burger XXL", tag: "MASA", kcal: 1100, p: 65, c: 110, f: 45, time: "25 min", ingredients: ["200g wołowiny", "Bułka burgerowa", "Cheddar", "Boczek"], steps: ["Usmaż kotlety.", "Upiecz boczek.", "Złóż burgera z dodatkami."] },
  { title: "Pasta Pesto", tag: "MASA", kcal: 950, p: 60, c: 90, f: 40, time: "20 min", ingredients: ["150g makaronu", "200g kurczaka", "Pesto", "Mozzarella"], steps: ["Ugotuj makaron.", "Usmaż kurczaka.", "Wymieszaj z pesto i serem."] },
  { title: "Naleśniki Orzechowe", tag: "MASA", kcal: 850, p: 35, c: 110, f: 30, time: "20 min", ingredients: ["2 jajka", "150g mąki", "Mleko", "Masło orzechowe"], steps: ["Zrób ciasto.", "Usmaż grube naleśniki.", "Posmaruj masłem."] },
  { title: "Risotto Grzybowe", tag: "MASA", kcal: 820, p: 55, c: 100, f: 20, time: "30 min", ingredients: ["120g ryżu arborio", "150g kurczaka", "Pieczarki", "Parmezan"], steps: ["Podsmaż kurczaka i grzyby.", "Dodawaj bulion do ryżu.", "Wymieszaj z serem."] },
  { title: "Owsianka Czekoladowa", tag: "MASA", kcal: 900, p: 30, c: 130, f: 25, time: "10 min", ingredients: ["120g płatków", "Mleko", "Czekolada gorzka", "Banan"], steps: ["Ugotuj płatki.", "Rozpuść w nich czekoladę.", "Ułóż banana."] },

  // --- UTRZYMANIE (8) ---
  { title: "Pieczony Łosoś", tag: "UTRZYMANIE", kcal: 580, p: 42, c: 45, f: 28, time: "30 min", ingredients: ["150g łososia", "300g ziemniaków", "Brokuły", "Cytryna"], steps: ["Upiecz ziemniaki.", "Dołóż łososia i brokuły.", "Piecz 15 min."] },
  { title: "Kanapki z Awokado", tag: "UTRZYMANIE", kcal: 500, p: 25, c: 45, f: 25, time: "10 min", ingredients: ["Chleb żytni", "Awokado", "2 jajka"], steps: ["Ugotuj jajka (6 min).", "Zrób pastę z awokado.", "Nałóż na chleb."] },
  { title: "Buddha Bowl", tag: "UTRZYMANIE", kcal: 550, p: 30, c: 60, f: 20, time: "20 min", ingredients: ["Tofu wędzone", "Komosa ryżowa", "Warzywa", "Sezam"], steps: ["Ugotuj komosę.", "Usmaż tofu.", "Ułóż składniki w misce."] },
  { title: "Placki z Cukinii", tag: "UTRZYMANIE", kcal: 450, p: 20, c: 40, f: 22, time: "20 min", ingredients: ["Cukinia", "1 jajko", "Mąka", "Jogurt naturalny"], steps: ["Zetrzyj i odciśnij cukinię.", "Wymieszaj z jajkiem i mąką.", "Smaż na złoto."] },
  { title: "Wrap z Falafelem", tag: "UTRZYMANIE", kcal: 600, p: 22, c: 75, f: 24, time: "15 min", ingredients: ["Tortilla", "Falafele", "Hummus", "Warzywa"], steps: ["Podgrzej falafele.", "Posmaruj tortillę hummusem.", "Zawiń z warzywami."] },
  { title: "Sałatka Cezar", tag: "UTRZYMANIE", kcal: 550, p: 45, c: 30, f: 26, time: "15 min", ingredients: ["Sałata rzymska", "Kurczak", "Grzanki", "Parmezan"], steps: ["Grilluj kurczaka.", "Zrób sos jogurtowy.", "Wymieszaj wszystko."] },
  { title: "Pieczone Bataty", tag: "UTRZYMANIE", kcal: 600, p: 45, c: 65, f: 18, time: "35 min", ingredients: ["Batat", "Kurczak", "Fasolka szparagowa"], steps: ["Upiecz bataty (20 min).", "Dodaj kurczaka i fasolkę.", "Piecz 15 min."] },
  { title: "Naleśniki Proteinowe", tag: "UTRZYMANIE", kcal: 510, p: 35, c: 60, f: 15, time: "20 min", ingredients: ["Jajko", "Mleko", "Mąka", "Twarożek grani"], steps: ["Zrób ciasto z białkiem.", "Usmaż naleśniki.", "Posmaruj twarożkiem."] }
];

export default function Home() {
  const [tab, setTab] = useState<'journal' | 'recipes'>('journal');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'REDUKCJA' | 'MASA' | 'UTRZYMANIE'>('ALL');
  const [foodInput, setFoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [goal, setGoal] = useState({ kcal: 2500, protein: 160, carbs: 250, fat: 80 });
  const [profile, setProfile] = useState({ age: '', weight: '', height: '', activity: 'Siedzący tryb życia', target: 'Redukcja (Deficyt kaloryczny)' });

  useEffect(() => {
    fetchMeals();
    const savedGoal = localStorage.getItem('fatatu_goal');
    if (savedGoal) setGoal(JSON.parse(savedGoal));
    const savedProfile = localStorage.getItem('fatatu_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const fetchMeals = async () => {
    const { data } = await supabase.from('meals').select('*').order('created_at', { ascending: false });
    if (data) setMeals(data);
  };

  const handleAddFood = async (e?: React.FormEvent, manualData?: any) => {
    if (e) e.preventDefault();
    const nameToSave = manualData ? manualData.title : foodInput;
    if (!nameToSave || isLoading) return;
    setIsLoading(true);
    try {
      let nutrition;
      if (manualData) {
        nutrition = { kcal: manualData.kcal, protein: manualData.p, carbs: manualData.c, fat: manualData.f };
      } else {
        nutrition = await analyzeFood(nameToSave);
      }
      const { data, error } = await supabase.from('meals').insert([{
        name: nameToSave.trim(),
        kcal: Math.round(nutrition.kcal || 0),
        protein: Math.round(nutrition.protein || 0),
        carbs: Math.round(nutrition.carbs || 0),
        fat: Math.round(nutrition.fat || 0)
      }]).select();
      if (error) throw error;
      if (data) { setMeals([data[0], ...meals]); setFoodInput(''); }
    } catch (err) { alert("Błąd bazy danych."); } finally { setIsLoading(false); }
  };

  const calculateLocalGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(profile.weight); const h = parseFloat(profile.height); const a = parseInt(profile.age);
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    let mult = profile.activity.includes('Lekka') ? 1.375 : profile.activity.includes('Średnia') ? 1.55 : profile.activity.includes('wysoka') ? 1.725 : 1.2;
    let tdee = bmr * mult;
    let finalKcal = profile.target.includes('Redukcja') ? tdee - 400 : profile.target.includes('Budowa') ? tdee + 300 : tdee;
    const p = w * 2.0; const f = w * 1.0; const c = (finalKcal - (p * 4) - (f * 9)) / 4;
    const newGoals = { kcal: Math.round(finalKcal), protein: Math.round(p), fat: Math.round(f), carbs: Math.round(c) };
    setGoal(newGoals); localStorage.setItem('fatatu_goal', JSON.stringify(newGoals)); localStorage.setItem('fatatu_profile', JSON.stringify(profile));
    setShowSettings(false);
  };

  const current = meals.reduce((acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.protein, c: acc.c + m.carbs, f: acc.f + m.fat }), { kcal: 0, p: 0, c: 0, f: 0 });
  const filteredRecipes = filter === 'ALL' ? RECIPES : RECIPES.filter(r => r.tag === filter);

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-900 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        <header className="flex flex-col items-center relative mt-4 md:mt-0">
          <h1 className="text-5xl md:text-6xl font-black text-indigo-600 italic tracking-tighter">FATATU</h1>
          <nav className="flex gap-2 mt-4 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => {setTab('journal'); setSelectedRecipe(null);}} className={`px-4 md:px-8 py-2 md:py-2.5 rounded-xl font-black text-sm md:text-base transition-all ${tab === 'journal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}>DZIENNIK</button>
            <button onClick={() => setTab('recipes')} className={`px-4 md:px-8 py-2 md:py-2.5 rounded-xl font-black text-sm md:text-base transition-all ${tab === 'recipes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}>PRZEPISY ⚡</button>
          </nav>
          <button onClick={() => setShowSettings(!showSettings)} className="absolute right-0 top-0 md:top-2 font-bold text-[10px] md:text-xs bg-white text-slate-400 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">⚙️ PROFIL</button>
        </header>

        {showSettings && (
          <form onSubmit={calculateLocalGoals} className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-indigo-100 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-5"><h3 className="font-black uppercase text-xs text-indigo-400">Twoje dane</h3></div>
            <input type="number" placeholder="Wiek" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-indigo-500 outline-none" />
            <input type="number" placeholder="Waga kg" value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})} className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-indigo-500 outline-none" />
            <input type="number" placeholder="Wzrost cm" value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-indigo-500 outline-none" />
            <select value={profile.activity} onChange={e => setProfile({...profile, activity: e.target.value})} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs col-span-1 md:col-span-2">
              <option>Siedzący tryb życia</option><option>Lekka (1-3 treningi)</option><option>Średnia (3-5 treningów)</option><option>Bardzo wysoka</option>
            </select>
            <button type="submit" className="col-span-1 md:col-span-5 bg-indigo-600 text-white font-black py-4 rounded-xl">ZAPISZ I OBLICZ 🚀</button>
          </form>
        )}

        {tab === 'journal' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Kalorie" cur={current.kcal} max={goal.kcal} unit="kcal" col="bg-indigo-500" />
              <StatCard title="Białko" cur={current.p} max={goal.protein} unit="g" col="bg-rose-500" />
              <StatCard title="Węgle" cur={current.c} max={goal.carbs} unit="g" col="bg-amber-500" />
              <StatCard title="Tłuszcze" cur={current.f} max={goal.fat} unit="g" col="bg-emerald-500" />
            </div>
            <form onSubmit={handleAddFood} className="bg-white p-2 rounded-3xl shadow-xl border border-indigo-50 flex flex-col md:flex-row gap-2">
              <input type="text" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="Co zjadłeś?" className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-transparent focus:outline-none" disabled={isLoading} />
              <button disabled={isLoading} className="px-6 md:px-10 py-3 md:py-4 bg-indigo-600 text-white rounded-2xl font-black">{isLoading ? 'ANALIZA...' : 'DODAJ'}</button>
            </form>
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-800">Historia dnia</h2>
              {meals.map(m => (
                <div key={m.id} className="relative bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden">
                  <div className="w-full pr-12 md:pr-0">
                    <div className="font-black text-lg md:text-xl capitalize text-slate-800 leading-tight">{m.name}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm font-bold mt-2">
                      <span className="text-indigo-500">{m.kcal} kcal</span><span className="text-rose-400">B: {m.protein}g</span><span className="text-amber-400">W: {m.carbs}g</span><span className="text-emerald-400">T: {m.fat}g</span>
                    </div>
                  </div>
                  {/* PRZYCISK X - NAPRAWIONY NA DOTYK */}
                  <button 
                    onPointerDown={async (e) => {
                      e.stopPropagation();
                      if (window.confirm("Usunąć ten posiłek?")) {
                        const original = [...meals];
                        setMeals(prev => prev.filter(meal => meal.id !== m.id));
                        const { error } = await supabase.from('meals').delete().match({ id: m.id });
                        if (error) { setMeals(original); alert("Błąd bazy: " + error.message); }
                      }
                    }}
                    className="absolute top-0 right-0 z-[9999] w-14 h-14 flex items-center justify-center text-slate-300 hover:text-rose-500 active:text-rose-600 transition-all touch-none"
                  >
                    <span className="bg-slate-50 w-8 h-8 flex items-center justify-center rounded-xl pointer-events-none font-bold">✕</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {!selectedRecipe ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>Wszystkie</button>
                  <button onClick={() => setFilter('REDUKCJA')} className={`px-4 py-2 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${filter === 'REDUKCJA' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-white text-slate-400 border border-slate-100'}`}>🔥 Redukcja</button>
                  <button onClick={() => setFilter('MASA')} className={`px-4 py-2 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${filter === 'MASA' ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}`}>💪 Masa</button>
                  <button onClick={() => setFilter('UTRZYMANIE')} className={`px-4 py-2 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${filter === 'UTRZYMANIE' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-400 border border-slate-100'}`}>⚖️ Utrzymanie</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-10">
                  {filteredRecipes.map((r, i) => (
                    <div key={i} onClick={() => setSelectedRecipe(r)} className="bg-white rounded-[2rem] p-6 md:p-8 space-y-4 border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl transition-all">
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase ${r.tag === 'REDUKCJA' ? 'bg-rose-100 text-rose-600' : r.tag === 'MASA' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{r.tag}</span>
                        <span className="text-slate-300 font-bold text-[10px] md:text-xs uppercase">{r.time}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{r.title}</h3>
                      <div className="flex flex-wrap gap-2 text-[10px] md:text-[11px] font-bold">
                        <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-500">{r.kcal} kcal</span><span className="bg-rose-50 px-3 py-1 rounded-lg text-rose-500">B: {r.p}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-indigo-50 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                  <button onClick={() => setSelectedRecipe(null)} className="text-indigo-600 font-black flex items-center gap-2 uppercase text-xs md:text-sm">← Powrót</button>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 italic tracking-tighter leading-tight">{selectedRecipe.title}</h2>
                    <div className="grid grid-cols-2 md:flex md:gap-6 gap-4 py-4 border-y border-slate-50">
                      <div className="text-left md:text-center"><div className="text-xl md:text-2xl font-black text-indigo-600">{selectedRecipe.kcal}</div><div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">kcal</div></div>
                      <div className="text-left md:text-center"><div className="text-xl md:text-2xl font-black text-rose-500">{selectedRecipe.p}g</div><div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">Białko</div></div>
                      <div className="text-left md:text-center"><div className="text-xl md:text-2xl font-black text-amber-500">{selectedRecipe.c}g</div><div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">Węgle</div></div>
                      <div className="text-left md:text-center"><div className="text-xl md:text-2xl font-black text-emerald-500">{selectedRecipe.f}g</div><div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">Tłuszcz</div></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4"><h3 className="text-lg font-black uppercase">🛒 Składniki</h3>
                      <ul className="space-y-2">{selectedRecipe.ingredients.map((ing, i) => (<li key={i} className="font-bold text-slate-600 bg-slate-50 p-3 rounded-xl text-sm">• {ing}</li>))}</ul>
                    </div>
                    <div className="space-y-4"><h3 className="text-lg font-black uppercase">👨‍🍳 Tutorial</h3>
                      <ol className="space-y-4">{selectedRecipe.steps.map((step, i) => (<li key={i} className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-[10px]">{i+1}</span><p className="text-slate-600 text-sm">{step}</p></li>))}</ol>
                    </div>
                  </div>
                  <button 
                    onClick={() => { handleAddFood(undefined, selectedRecipe); setTab('journal'); setSelectedRecipe(null); }}
                    className="w-full py-4 md:py-6 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all"
                  >
                    DODAJ DO DZIENNIKA ✨
                  </button>
                </div>
              </div>
            ) }
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, cur, max, unit, col }: any) {
  const prc = Math.min((cur / max) * 100, 100);
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1">{title}</div>
      <div className="flex items-baseline gap-1 break-all"><span className="text-2xl md:text-3xl font-black text-slate-800">{cur}</span><span className="text-[10px] md:text-xs font-bold text-slate-400">{unit}</span></div>
      <div><div className="w-full bg-slate-100 h-2 md:h-2.5 rounded-full mt-3 overflow-hidden"><div className={`h-full ${col} transition-all duration-1000`} style={{ width: `${prc}%` }} /></div><div className="text-[9px] md:text-[10px] font-bold text-slate-300 mt-2 text-right">CEL: {max}</div></div>
    </div>
  );
}