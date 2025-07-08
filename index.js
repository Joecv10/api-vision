// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Conectar a MongoDB
const connectDB = require("./config/db");

// Rutas
const inferenceRoutes = require("./routes/inferenceRoutes");

async function startServer() {
  // 1. Conectar a la base de datos
  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }

  // 2. Inicializar Express
  const app = express();

  // 3. Middlewares globales
  app.use(cors());
  app.use(express.json()); // Por si se requieren JSON bodies

  // 4. Rutas
  app.use("/api", inferenceRoutes);

  // 5. Ruta raíz
  app.get("/", (req, res) => {
    res.send("API Vision - Peso de Frutas. Endpoint: POST /api/detect");
  });

  // 6. Arrancar servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
