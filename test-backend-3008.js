const http = require("http");

console.log("🔍 Verificando backend en puerto 3008...");

const req = http.request(
  {
    hostname: "localhost",
    port: 3008,
    path: "/salud",
    method: "GET",
  },
  (res) => {
    console.log(
      `✅ Backend responde en puerto 3008 (Status: ${res.statusCode})`
    );

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("📄 Respuesta del backend:");
      console.log(data);
    });
  }
);

req.on("error", (err) => {
  console.log(`❌ Error conectando al puerto 3008: ${err.message}`);
  console.log("💡 Verifica que el backend esté corriendo");
});

req.setTimeout(5000, () => {
  console.log("⏰ Timeout - El backend no responde en 5 segundos");
});

req.end();
