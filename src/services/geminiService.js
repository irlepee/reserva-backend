const apiKey = 'AIzaSyBzRLD2sxCJ-23k0k4hNsRfg23U7adW5rI';
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // ms

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContent(prompt, retries = 0) {
  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      // Reintentar silenciosamente en errores 503 (Service Unavailable) y 429 (Too Many Requests)
      if ((response.status === 503 || response.status === 429) && retries < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * (Math.pow(2, retries)); // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`API error ${response.status}. Esperando ${waitTime}ms antes de reintentar... (${retries + 1}/${MAX_RETRIES})`);
        await delay(waitTime);
        return generateContent(prompt, retries + 1);
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // No relanzar error aquí, dejar que el llamador lo maneje
    throw error;
  }
}

async function generateRecommendations(userPatterns, relevantResources) {
  // Construir prompt limpio
  const favoriteHoursSet = new Set(userPatterns.favoriteHours);
  const hourRange = favoriteHoursSet.size > 0 
    ? Math.min(...favoriteHoursSet) + " a " + Math.max(...favoriteHoursSet) + " horas"
    : "sin horarios registrados";

  const prompt = `
Eres un asistente recomendador de reservas. Analiza los patrones del usuario y recomienda MÁXIMO 3 nuevas reservas con horarios específicos.

PATRONES DEL USUARIO:
- Sitios favoritos: ${userPatterns.preferredSites.join(", ") || "ninguno"}
- Tipos de recursos favoritos: ${userPatterns.preferredResourceTypes.join(", ") || "ninguno"}
- Horarios preferidos: ${hourRange}
- Hora promedio de reserva: ${userPatterns.averageHour}:00 horas
- Duración promedio: ${userPatterns.averageDuration} horas
- Frecuencia de uso: ${userPatterns.averageFrequency.toFixed(1)} reservas por semana

RECURSOS DISPONIBLES (CON DISPONIBILIDAD):
${relevantResources.map(r => 
  `- ${r.name} (${r.type}, ${r.site}) - Disponible a las ${r.suggestedHour}:00 por ${r.suggestedDuration} hora(s): ${r.isAvailable ? "SÍ" : "NO"}`
).join("\n") || "ninguno disponible"}

TAREA:
Basándote en sus patrones, recomienda MÁXIMO 3 recursos que podrían ser de su interés.
IMPORTANTE: 
- Debe ser máximo 3 recomendaciones
- Cada una debe incluir la hora exacta en formato HH (solo número, ej: 14 para las 14:00)
- Cada una debe incluir duración en HORAS COMPLETAS (1, 2, 3, etc.)
- Solo recomienda recursos que estén disponibles (isAvailable: true)
- Explica brevemente por qué encaja

RESPUESTA (SOLO JSON, sin markdown):
[
  {
    "resourceName": "nombre del recurso",
    "resourceType": "tipo",
    "site": "nombre del sitio",
    "suggestedHour": 14,
    "suggestedDuration": 2,
    "reason": "por qué lo recomendamos (máximo 50 caracteres)"
  }
]
`;

  try {
    console.log("=== ENVIANDO A GEMINI ===");
    console.log("Prompt:", prompt.substring(0, 200) + "...");
    
    const result = await generateContent(prompt);
    console.log("=== RESPUESTA DE GEMINI ===");
    console.log("Raw response:", result);
    
    // Extraer JSON de la respuesta
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    console.log("JSON Match found:", !!jsonMatch);
    
    if (jsonMatch) {
      console.log("JSON extraído:", jsonMatch[0]);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("Parsed:", parsed);
      console.log("Cantidad recomendaciones:", parsed.length);
      
      // Asegurar máximo 3 recomendaciones y que duración sea en horas
      return parsed.slice(0, 3).map(r => ({
        ...r,
        suggestedDuration: Math.max(1, Math.round(r.suggestedDuration))
      }));
      
      console.log("Recomendaciones finales:", result);
      return result;
    }
    
    console.log("No se encontró JSON en la respuesta");
    return [];
  } catch (error) {
    // Fallback silencioso: devolver array vacío sin logs de error
    console.error("Error en generateRecommendations:", error.message);
    return [];
  }
}

module.exports = { generateContent, generateRecommendations };