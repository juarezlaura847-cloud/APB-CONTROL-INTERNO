import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limit high enough in case equipment database grows
  app.use(express.json({ limit: "50mb" }));

  const DB_FILE = path.join(process.cwd(), "db.json");

  // Default database state
  const getInitialData = () => ({
    apb_finanzas_password: "APB12345",
    apb_catalogos_password: "APB12345",
    apb_equipos: [],
    apb_colaboradores: [
      "Ing. Carlos Mendoza",
      "Ing. Sofía Ruiz",
      "Tec. Alejandro Torres",
      "Ing. Mariana Gómez",
      "Por asignar"
    ],
    apb_recibidos: [
      "Diana Ruiz",
      "Ing. Carlos Mendoza",
      "Ing. Sofía Ruiz",
      "Tec. Alejandro Torres",
      "Ing. Mariana Gómez"
    ],
    updatedAt: Date.now()
  });

  const readData = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(content);
        // Automatic migration of old default password
        let migrated = false;
        if (data.apb_finanzas_password === "APB2026") {
          data.apb_finanzas_password = "APB12345";
          migrated = true;
        }
        if (data.apb_catalogos_password === "APB2026") {
          data.apb_catalogos_password = "APB12345";
          migrated = true;
        }
        if (migrated) {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
        }
        return data;
      }
    } catch (e) {
      console.error("Error reading database file", e);
    }
    return getInitialData();
  };

  const writeData = (data: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing database file", e);
    }
  };

  // Ensure DB file exists
  if (!fs.existsSync(DB_FILE)) {
    writeData(getInitialData());
  }

  // API endpoints
  app.get("/api/data", (req, res) => {
    res.json(readData());
  });

  app.post("/api/data", (req, res) => {
    const data = readData();
    const updates = req.body;

    let changed = false;
    const allowedKeys = [
      "apb_finanzas_password",
      "apb_catalogos_password",
      "apb_equipos",
      "apb_colaboradores",
      "apb_recibidos"
    ];

    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        data[key] = updates[key];
        changed = true;
      }
    }

    if (changed) {
      data.updatedAt = Date.now();
      writeData(data);
    }

    res.json({ success: true, data });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
