// routes/inferenceRoutes.js
const express = require("express");
const router = express.Router();
const inferenceController = require("../controllers/inferenceController");

// GET /api/v1/records - Obtener todos los registros
router.get("/records", inferenceController.getAllRecords);

// GET /api/v1/records/:id - Obtener un registro por ID
router.get("/records/:id", inferenceController.getRecordById);

// DELETE /api/v1/records/:id - Eliminar un registro
router.delete("/records/:id", inferenceController.deleteRecord);

module.exports = router;