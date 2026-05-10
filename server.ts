import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "MedSync Nexus" });
  });

  // Mock FHIR Patient Data for Demo Mode
  app.get("/api/patients", (req, res) => {
    res.json([
      {
        id: "pat-001",
        name: "Jameson, Robert",
        dob: "1958-04-12",
        gender: "male",
        condition: "Congestive Heart Failure",
        status: "Post-Discharge",
        risk: "high"
      },
      {
        id: "pat-002",
        name: "Chen, Mei",
        dob: "1972-09-21",
        gender: "female",
        condition: "Type 2 Diabetes mellitus",
        status: "Maintenance",
        risk: "medium"
      },
      {
        id: "pat-003",
        name: "Schmidt, Erika",
        dob: "1945-12-02",
        gender: "female",
        condition: "Post-surgical Hip Arthroplasty",
        status: "Recovery",
        risk: "low"
      }
    ]);
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
    console.log(`MedSync Nexus Server running on http://localhost:${PORT}`);
  });
}

startServer();
