// controllers/inferenceController.js
const axios = require("axios");
const FormData = require("form-data");
const { Readable } = require("stream");
const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");

const FruitWeight = require("../models/fruitWeight");
const InferenceRecord = require("../models/inferenceRecord");
const gridFsService = require("../services/gridFsService");

// URL de FastAPI para detección
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000/detect/";

async function detectAndSave(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  try {
    // 1. Enviar imagen a FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const fastRes = await axios.post(FASTAPI_URL, form, {
      headers: form.getHeaders(),
    });
    const detections = fastRes.data.detections;

    // 2. Contar detecciones por tipo
    const countsMap = {};
    detections.forEach((det) => {
      countsMap[det.label] = (countsMap[det.label] || 0) + 1;
    });
    const counts = Object.entries(countsMap).map(([label, count]) => ({
      label,
      count,
    }));

    // 3. Obtener pesos promedio desde Mongo
    const labels = counts.map((c) => c.label);
    const weightDocs = await FruitWeight.find({
      fruitType: { $in: labels },
    }).lean();

    // 4. Calcular peso por tipo y total
    const weightByType = counts.map((c) => {
      const doc = weightDocs.find((w) => w.fruitType === c.label) || {};
      const avg = doc.averageWeight || 0;
      const total = c.count * avg;
      return {
        label: c.label,
        count: c.count,
        averageWeight: avg,
        totalWeight: total,
      };
    });
    const totalWeight = weightByType.reduce((sum, w) => sum + w.totalWeight, 0);
    const unit = weightDocs[0]?.unit || "g";

    // 5. Generar mensaje usando OpenAI Function Calling
    const openaiService = require("../services/openaiService");
    const message = await openaiService.generateSummary(
      counts,
      weightByType,
      totalWeight,
      unit
    );

    // 6. Guardar imágenes en GridFS
    const originalImageId = await gridFsService.storeFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Anotar imagen con bounding boxes
    const img = await loadImage(req.file.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "#FFFF00";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#FFFF00";
    ctx.font = "24px Arial";
    ctx.textBaseline = "top";

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox.map((n) => Math.round(n));
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const text = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
      const metrics = ctx.measureText(text);
      const th = 24;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(x1, y1 - th - 4, metrics.width + 8, th + 4);
      ctx.fillStyle = "#FFFF00";
      ctx.fillText(text, x1 + 4, y1 - th);
    });
    const annotatedBuffer = canvas.toBuffer("image/jpeg");
    const annotatedImageId = await gridFsService.storeFile(
      annotatedBuffer,
      `annotated-${req.file.originalname}`,
      "image/jpeg"
    );

    // 7. Guardar registro en MongoDB
    const record = await InferenceRecord.create({
      originalImageId,
      annotatedImageId,
      detections,
      counts,
      weightByType,
      totalWeight,
      weightUnit: unit,
      message,
    });

    // 8. Responder al cliente
    return res.status(201).json({
      recordId: record._id,
      message, // ¡asegúrate de incluirlo aquí!
      weightByType,
      totalWeight,
      unit,
    });
  } catch (error) {
    console.error("Error en controlador detectAndSave:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
  }
}

module.exports = { detectAndSave };
