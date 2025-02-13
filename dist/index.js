// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  players;
  upgrades;
  currentPlayerId = 1;
  currentUpgradeId = 1;
  constructor() {
    this.players = /* @__PURE__ */ new Map();
    this.upgrades = /* @__PURE__ */ new Map();
  }
  async getPlayer(id) {
    return this.players.get(id);
  }
  async createPlayer(insertPlayer) {
    const id = this.currentPlayerId++;
    const now = /* @__PURE__ */ new Date();
    const player = {
      ...insertPlayer,
      id,
      coins: 0,
      totalClicks: 0,
      energy: 100,
      lastEnergyRefill: now,
      clickPower: 1,
      autoClickPower: 0
    };
    this.players.set(id, player);
    return player;
  }
  async updatePlayer(id, data) {
    const player = await this.getPlayer(id);
    if (!player) throw new Error("Player not found");
    const updatedPlayer = { ...player, ...data };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  async getUpgrades(playerId) {
    return Array.from(this.upgrades.values()).filter((u) => u.playerId === playerId);
  }
  async addUpgrade(upgrade) {
    const id = this.currentUpgradeId++;
    const newUpgrade = {
      ...upgrade,
      id,
      level: upgrade.level ?? 1
      // Ensure level has a default value if not provided
    };
    this.upgrades.set(id, newUpgrade);
    return newUpgrade;
  }
  async updateUpgrade(id, data) {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) throw new Error("Upgrade not found");
    const updatedUpgrade = { ...upgrade, ...data };
    this.upgrades.set(id, updatedUpgrade);
    return updatedUpgrade;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  coins: integer("coins").notNull().default(0),
  totalClicks: integer("total_clicks").notNull().default(0),
  energy: integer("energy").notNull().default(100),
  lastEnergyRefill: timestamp("last_energy_refill").notNull().default(/* @__PURE__ */ new Date()),
  clickPower: integer("click_power").notNull().default(1),
  autoClickPower: integer("auto_click_power").notNull().default(0)
});
var upgrades = pgTable("upgrades", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  type: text("type").notNull(),
  // 'click_power', 'auto_click', 'energy_regen'
  level: integer("level").notNull().default(1)
});
var insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  coins: true,
  totalClicks: true,
  energy: true,
  lastEnergyRefill: true,
  clickPower: true,
  autoClickPower: true
});
var insertUpgradeSchema = createInsertSchema(upgrades).omit({
  id: true
});

// server/routes.ts
function registerRoutes(app2) {
  app2.post("/api/players", async (req, res) => {
    const parsed = insertPlayerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const player = await storage.createPlayer(parsed.data);
    res.json(player);
  });
  app2.get("/api/players/:id", async (req, res) => {
    const player = await storage.getPlayer(Number(req.params.id));
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  });
  app2.patch("/api/players/:id", async (req, res) => {
    const player = await storage.updatePlayer(Number(req.params.id), req.body);
    res.json(player);
  });
  app2.get("/api/players/:id/upgrades", async (req, res) => {
    const upgrades2 = await storage.getUpgrades(Number(req.params.id));
    res.json(upgrades2);
  });
  app2.post("/api/upgrades", async (req, res) => {
    const upgrade = await storage.addUpgrade(req.body);
    res.json(upgrade);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
