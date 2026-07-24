require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

let memoryStore = {
  updatedAt: Date.now(),
  apb_equipos: [],
  apb_showroom_equipos: [],
  apb_colaboradores: [],
  apb_recibidos: [],
  apb_finanzas_password: "APB12345",
  apb_catalogos_password: "APB12345",
  apb_showroom_password: "medica123"
};

app.use(cors());
app.use(express.json());

let supabase = null;
try {
  supabase = require("./config/supabase");
} catch (error) {
  console.warn("Supabase no disponible, usando almacenamiento en memoria.", error.message);
}

async function loadSupabaseData() {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("equipos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.warn("No se pudo cargar Supabase, usando datos locales.", error.message);
    return null;
  }
}

app.get("/api/data", async (req, res) => {
  try {
    const supabaseData = await loadSupabaseData();

    if (supabaseData) {
      memoryStore.apb_equipos = supabaseData;
      memoryStore.updatedAt = Date.now();
    }

    res.json({
      success: true,
      updatedAt: memoryStore.updatedAt,
      apb_equipos: memoryStore.apb_equipos,
      apb_showroom_equipos: memoryStore.apb_showroom_equipos,
      apb_colaboradores: memoryStore.apb_colaboradores,
      apb_recibidos: memoryStore.apb_recibidos,
      apb_finanzas_password: memoryStore.apb_finanzas_password,
      apb_catalogos_password: memoryStore.apb_catalogos_password,
      apb_showroom_password: memoryStore.apb_showroom_password
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/data", async (req, res) => {
  try {
    const updates = req.body || {};
    memoryStore = {
      ...memoryStore,
      ...updates,
      updatedAt: Date.now()
    };

    res.json({ success: true, data: memoryStore });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/equipos", async (req, res) => {
  try {
    const supabaseData = await loadSupabaseData();
    if (supabaseData) {
      memoryStore.apb_equipos = supabaseData;
      memoryStore.updatedAt = Date.now();
    }

    res.json(memoryStore.apb_equipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});