const apiKey = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

async function generateContent(prompt) {
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error en generateContent:', error);
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
    const result = await generateContent(prompt);
    
    // Extraer JSON de la respuesta
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Asegurar máximo 3 recomendaciones y que duración sea en horas
      return parsed.slice(0, 3).map(r => ({
        ...r,
        suggestedDuration: Math.max(1, Math.round(r.suggestedDuration))
      }));
    }
    return [];
  } catch (error) {
    console.error("Error al generar recomendaciones con Gemini:", error);
    return [];
  }
}

module.exports = { generateContent, generateRecommendations };