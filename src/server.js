const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

db.getConnection()
  .then(() => console.log("✅ Conectado a la base de datos"))
  .catch((err) =>
    console.error("❌ Error en la conexión a la base de datos:", err)
  );

const authUserRouter = require("./routes/userRoutes");
app.use("/api", authUserRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada", code: "E404" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
