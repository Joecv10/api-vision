// routes/inferenceRoutes.js
const express = require("express");
const multer = require("multer");
const { detectAndSave } = require("../controllers/inferenceController");

// Configurar Multer para manejo en memoria
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// POST /detect -> procesa imagen, calcula pesos y guarda registro
router.post("/detect", upload.single("file"), detectAndSave);

module.exports = router;
