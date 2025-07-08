// services/openaiService.js
const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY no está definida");

/**
 * Genera un ÚNICO mensaje variado y amigable en español con los resultados.
 *  - Cuando no se detecta nada, produce un mensaje divertido cada vez.
 *  - Cuando hay detecciones, resume el conteo y el peso con tono cercano.
 * Utiliza temperature y top_p altos para variabilidad, pero fuerza al modelo a
 * devolver **solo una frase** (sin listados ni separadores).
 */
async function generateSummary(counts, weightByType, totalWeight, unit) {
  const noDetection = !counts.length || totalWeight === 0;

  // Construimos el prompt con la instrucción explícita de UN solo mensaje
  const userPrompt = noDetection
    ? `No se detectaron frutas ni verduras en la imagen. Escribe UNA sola frase breve, divertida y diferente cada vez en español (puedes usar emojis). Ejemplo: "¡Ups! No encontramos nada fresco, prueba con otra foto 🍏"`
    : `He detectado las siguientes frutas/verduras y pesos:\n${counts
        .map((c) => `- ${c.label}: ${c.count} unidad${c.count > 1 ? "es" : ""}`)
        .join("\n")}\n${weightByType
        .map((w) => `- ${w.label}: ${w.totalWeight} ${unit}`)
        .join(
          "\n"
        )}\nPeso total: ${totalWeight} ${unit}.\nRedáctame UNA sola frase breve, alegre y variada en español que resuma el resultado (no incluyas listas ni separadores). Puedes usar emojis.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente creativo que genera frases simpáticas para una app que pesa frutas y verduras. Debes responder siempre con UNA sola frase.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.75,
      max_tokens: 60,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  let content = response.data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    // Fallback genérico si la API falla
    return noDetection
      ? "¡Ups! No encontramos frutas o verduras en tu imagen. ¡Prueba con otra foto! 😉"
      : `¡Genial! Detectamos varias frutas/verduras y el peso total es ${totalWeight} ${unit}.`;
  }

  // Si el modelo aún así devolviera varias líneas/separadores, nos quedamos con la primera frase.
  content = content.split(/\n|---/)[0].trim();
  return content;
}

module.exports = { generateSummary };
