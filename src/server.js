const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS bloqueado para:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true
}));
app.use(cookieParser());



db.getConnection()
  .then(() => console.log("Conectado a la base de datos"))
  .catch((err) =>
    console.error("Error en la conexión a la base de datos:", err)
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
