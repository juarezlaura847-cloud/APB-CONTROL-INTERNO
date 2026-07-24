const supabase = require("./config/supabase");

async function probarConexion() {

    const { data, error } = await supabase
        .from("EQUIPOSEquipos")
        .select("*");

    if (error) {
        console.log("❌ Error:");
        console.log(error);
    } else {
        console.log("✅ Conexión correcta con Supabase");
        console.log(data);
    }

}

probarConexion();