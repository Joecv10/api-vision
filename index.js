const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { createCanvas, loadImage } = require("canvas");

// Configuración de Express y Multer para recibir archivos
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// URL del microservicio FastAPI
const FASTAPI_URL = "http://localhost:8000/detect/";

// Endpoint /detect que proxy la imagen a FastAPI y dibuja bounding boxes con Jimp
app.post("/detect", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  try {
    // 1. Reenviar la imagen al microservicio FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(FASTAPI_URL, form, {
      headers: form.getHeaders(),
    });

    const { filename, detections } = response.data;

    // 2. Cargar la imagen original con Canvas
    const image = await loadImage(req.file.buffer);
    const { width, height } = image;

    // 3. Crear canvas para dibujar
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 4. Dibujar la imagen original en el canvas
    ctx.drawImage(image, 0, 0);

    // 5. Configurar estilos para bounding boxes y texto
    ctx.strokeStyle = "#FFFF00"; // Amarillo
    ctx.lineWidth = 3;
    ctx.fillStyle = "#FFFF00";
    ctx.font = "24px Arial";
    ctx.textBaseline = "top";

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox.map((n) => Math.round(n));
      const width = x2 - x1;
      const height = y2 - y1;

      // Dibujar rectángulo
      ctx.strokeRect(x1, y1, width, height);

      // Dibujar texto con fondo semi-transparente
      const text = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 24; // Altura aproximada del texto

      // Fondo semi-transparente para el texto
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(x1, y1 - textHeight - 4, textWidth + 8, textHeight + 4);

      // Texto en amarillo
      ctx.fillStyle = "#FFFF00";
      ctx.fillText(text, x1 + 4, y1 - textHeight);
    });

    // 6. Convertir canvas a buffer
    const annotatedBuffer = canvas.toBuffer("image/jpeg");

    // 7. (Aquí va la lógica de GridFS en Mongo)
    // TODO: subir annotatedBuffer y req.file.buffer a GridFS y obtener sus ObjectId.

    // 8. Enviar respuesta con JSON y anotada como Base64
    const annotatedBase64 = annotatedBuffer.toString("base64");
    return res.json({
      filename,
      detections,
      annotatedImage: `data:image/jpeg;base64,${annotatedBase64}`,
    });
  } catch (error) {
    console.error("Error al procesar la imagen en Express:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
  }
});

// Arrancar servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Express server listening on http://localhost:${PORT}`)
);
