const http = require("http");

// Probar puerto 3005
const testPort = (port) => {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: port,
        path: "/salud",
        method: "GET",
      },
      (res) => {
        console.log(`✅ Puerto ${port}: OK (${res.statusCode})`);
        resolve(true);
      }
    );

    req.on("error", (err) => {
      console.log(`❌ Puerto ${port}: Error - ${err.message}`);
      resolve(false);
    });

    req.setTimeout(2000, () => {
      console.log(`⏰ Puerto ${port}: Timeout`);
      resolve(false);
    });

    req.end();
  });
};

const testBackend = async () => {
  console.log("🔍 Probando conexión al backend...\n");

  const ports = [3001, 3002, 3005, 3006];

  for (const port of ports) {
    await testPort(port);
  }

  console.log("\n📋 Resumen:");
  console.log("- Puerto 3001: Original (probablemente ocupado)");
  console.log("- Puerto 3002: Configurado en .env");
  console.log("- Puerto 3005: Alternativo (según logs)");
  console.log("- Puerto 3006: Alternativo (según logs)");
};

testBackend();
