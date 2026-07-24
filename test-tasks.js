require("dotenv").config();
const axios = require("axios");

async function probarTasks() {

    try {

        // LOGIN
        const login = await axios.post(
            "https://api.2workers.me/v2/login",
            {
                apiKey: process.env.TWOWORKERS_API_KEY,
                apiToken: process.env.TWOWORKERS_API_TOKEN
            }
        );


        const token = login.data.result.accessToken;


        console.log("✅ Login correcto");


        // FILTRO
        const paramFilter = {
            startDate: "2026-07-01T00:00:00",
            endDate: "2026-07-31T23:59:59"
        };


        // TASKS
        const respuesta = await axios.get(
            "https://api.2workers.me/v2/tasks/",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                params: {
                    paramFilter: JSON.stringify(paramFilter),
                    page: 1,
                    pageSize: 100
                }
            }
        );


        console.log(
            "Tareas encontradas:",
            respuesta.data.result.entityList.length
        );


        console.log(
            JSON.stringify(
                respuesta.data.result.entityList[0],
                null,
                2
            )
        );


    } catch(error){

        console.log("❌ ERROR");

        if(error.response){
            console.log(error.response.status);
            console.log(error.response.data);
        }else{
            console.log(error.message);
        }

    }

}


probarTasks();