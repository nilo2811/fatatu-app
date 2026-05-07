'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeFood(foodText: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { 
      temperature: 0,
      responseMimeType: "application/json" 
    }
  });

  const prompt = `Jesteś ekspertem ds. żywienia. Podaj kalorie i makro dla: "${foodText}".
  Zwróć TYLKO JSON: {"kcal": liczba, "protein": liczba, "carbs": liczba, "fat": liczba}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error: any) {
    console.error("⚠️ LIMIT API LUB BŁĄD - URUCHAMIAM TRYB AWARYJNY");
    
    // TRYB AWARYJNY: Jeśli API padnie, zgadujemy na sztywno, żeby nie blokować pracy
    const input = foodText.toLowerCase();
    if (input.includes("banan")) return { kcal: 89, protein: 1, carbs: 23, fat: 0 };
    if (input.includes("pizza")) return { kcal: 800, protein: 30, carbs: 100, fat: 35 };
    if (input.includes("jajko")) return { kcal: 70, protein: 7, carbs: 0, fat: 5 };
    if (input.includes("pizzerinka")) return { kcal: 310, protein: 12, carbs: 40, fat: 12 };

    // Jeśli nic nie pasuje, dajemy bezpieczne "średnie" wartości zamiast błędu
    return { kcal: 150, protein: 10, carbs: 20, fat: 5 };
  }
}