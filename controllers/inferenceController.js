// controllers/inferenceController.js
const InferenceRecord = require("../models/inferenceRecord");

// 📋 Obtener todos los registros
exports.getAllRecords = async (req, res) => {
  try {
    const records = await InferenceRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los registros", error });
  }
};

// 🔍 Obtener un registro por ID
exports.getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await InferenceRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el registro", error });
  }
};

// ❌ Eliminar un registro por ID
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await InferenceRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el registro", error });
  }
};