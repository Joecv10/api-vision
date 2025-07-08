import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

// Configuración de Express y Multer para recibir archivos
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// URL del microservicio FastAPI
const FASTAPI_URL = "http://localhost:8000/detect/";

// Endpoint /detect que proxy la imagen a FastAPI
app.post("/detect", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  try {
    // Construir FormData para FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Enviar petición al microservicio FastAPI
    const response = await axios.post(FASTAPI_URL, form, {
      headers: form.getHeaders(),
    });

    // Devolver al cliente móvil la respuesta original
    return res.json(response.data);
  } catch (error) {
    console.error("Error al reenviar al microservicio FastAPI:", error.message);
    return res
      .status(500)
      .json({ message: "Error al procesar la imagen.", error: error.message });
  }
});

// Arrancar servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
