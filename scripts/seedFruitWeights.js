// scripts/seedFruitWeights.js
const mongoose = require("mongoose");
require("dotenv").config();
const FruitWeight = require("../models/fruitWeight");

// Conexión a la base de datos 'pesoFrutas'
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pesoFrutas";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB en", MONGO_URI);

    // Limpiar la colección existente
    await FruitWeight.deleteMany({});
    console.log("Colección fruit_weights limpiada");

    // Datos de ejemplo para insertar
    const seedData = [
      { fruitType: "Banana", averageWeight: 118 },
      { fruitType: "Brocoli", averageWeight: 150 },
      { fruitType: "Guayaba", averageWeight: 50 },
      { fruitType: "Manzana", averageWeight: 182 },
      { fruitType: "Pepino", averageWeight: 300 },
      { fruitType: "Zanahoria", averageWeight: 61 },
    ];

    await FruitWeight.insertMany(seedData);
    console.log("Datos de ejemplo insertados en fruit_weights");

    process.exit(0);
  } catch (error) {
    console.error("Error al seedear datos:", error);
    process.exit(1);
  }
}

seed();
