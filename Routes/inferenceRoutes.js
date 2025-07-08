// routes/inferenceRoutes.js
const express = require("express");
const multer = require("multer");
const {
  detectAndSave,
  getAllRecords,
  getRecordById,
  deleteRecord,
} = require("../controllers/inferenceController");

// Configurar Multer para manejo en memoria
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// POST /detect -> procesa imagen, calcula pesos y guarda registro
router.post("/detect", upload.single("file"), detectAndSave);

// GET /api/records - Obtener todos los registros
router.get("/records", getAllRecords);

// GET /api/records/:id - Obtener un registro por ID
router.get("/records/:id", getRecordById);

// DELETE /api/records/:id - Eliminar un registro
router.delete("/records/:id", deleteRecord);

module.exports = router;
