// services/openaiService.js
const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY no está definida");

/**
 * Llama a OpenAI para generar un mensaje natural
 */
async function generateSummary(counts, weightByType, totalWeight, unit) {
  // Construimos un prompt con los datos
  const summaryPrompt = `
  He detectado las siguientes frutas y sus totales:
  ${counts.map((c) => `- ${c.label}: ${c.count} unidades`).join("\n")}
  El peso por tipo es:
  ${weightByType
    .map((w) => `- ${w.label}: ${w.totalWeight} ${unit}`)
    .join("\n")}
  Peso total: ${totalWeight} ${unit}.
  Por favor, genera un mensaje breve en español resumiendo esto.
  `;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que genera resúmenes claros y concisos.",
        },
        { role: "user", content: summaryPrompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content;
  return content?.trim() || `Peso total estimado: ${totalWeight} ${unit}.`;
}

module.exports = { generateSummary };
