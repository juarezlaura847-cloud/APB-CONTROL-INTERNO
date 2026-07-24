const axios = require("axios");
require("dotenv").config();
console.log("ESTOY EJECUTANDO EL NUEVO test-login.js");
const API_URL = "https://api.2workers.me/v2";

async function login() {
  const body = {
    apiKey: process.env.TWOWORKERS_API_KEY,
    apiToken: process.env.TWOWORKERS_API_TOKEN,
  };

  console.log(body);

  const response = await axios.post(
    `${API_URL}/login`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log(response.data);
}

login().catch(console.error);