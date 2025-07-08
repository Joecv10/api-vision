const { Schema, model } = require("mongoose");

const FruitWeightSchema = new Schema({
  fruitType: { type: String, required: true, unique: true },
  averageWeight: { type: Number, required: true }, // en gramos
  unit: { type: String, default: "g" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model("FruitWeight", FruitWeightSchema);
