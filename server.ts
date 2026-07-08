import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initialSchools, School, getJenjang, getKabKota, NotificationLog } from "./src/data/schoolsData.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));

// Paths for JSON Database
const DB_DIR = path.join(process.cwd(), "data");
const SCHOOLS_PATH = path.join(DB_DIR, "schools.json");
const NOTIFICATIONS_PATH = path.join(DB_DIR, "notifications.json");
const PERIOD_PATH = path.join(DB_DIR, "period.json");

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Database Helpers
function getSchools(): School[] {
  if (!fs.existsSync(SCHOOLS_PATH)) {
    fs.writeFileSync(SCHOOLS_PATH, JSON.stringify(initialSchools, null, 2));
    return initialSchools;
  }
  try {
    const raw = fs.readFileSync(SCHOOLS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading schools db, resetting to initial", err);
    return initialSchools;
  }
}

function saveSchools(schools: School[]) {
  fs.writeFileSync(SCHOOLS_PATH, JSON.stringify(schools, null, 2));
}

function getNotifications(): NotificationLog[] {
  if (!fs.existsSync(NOTIFICATIONS_PATH)) {
    const initDate = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";

    const defaultNotifs: NotificationLog[] = [
      {
        id: "init-1",
        timestamp: initDate,
        schoolName: "Sistem DIBA GTK",
        npsn: "SYSTEM",
        type: "sistem",
        message: "Database awal berhasil dimuat seutuhnya dari file rekap. 194 Lembaga Sekolah berhasil dipetakan ke sistem.",
        isRead: false
      },
      {
        id: "init-2",
        timestamp: initDate,
        schoolName: "Penyaringan Wilayah",
        npsn: "WILAYAH",
        type: "sistem",
        message: "Sistem mendeteksi 3 area administratif aktif: Kabupaten Ciamis, Kota Banjar, dan Kabupaten Pangandaran.",
        isRead: true
      }
    ];
    fs.writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(defaultNotifs, null, 2));
    return defaultNotifs;
  }
  try {
    const raw = fs.readFileSync(NOTIFICATIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveNotifications(notifications: NotificationLog[]) {
  fs.writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(notifications, null, 2));
}

function getPeriod(): string {
  if (!fs.existsSync(PERIOD_PATH)) {
    fs.writeFileSync(PERIOD_PATH, "Juli 2026");
    return "Juli 2026";
  }
  try {
    return fs.readFileSync(PERIOD_PATH, "utf-8").trim();
  } catch (err) {
    return "Juli 2026";
  }
}

function savePeriod(period: string) {
  fs.writeFileSync(PERIOD_PATH, period.trim());
}

// ==================== API ENDPOINTS ====================

// GET Schools
app.get("/api/schools", (req, res) => {
  res.json(getSchools());
});

// UPDATE School status or fields
app.post("/api/schools/update", (req, res) => {
  const { npsn, updates } = req.body;
  if (!npsn) {
    return res.status(400).json({ error: "NPSN is required" });
  }

  const schools = getSchools();
  const index = schools.findIndex((s) => s.npsn === npsn);
  if (index === -1) {
    return res.status(404).json({ error: "School not found" });
  }

  schools[index] = { ...schools[index], ...updates };
  saveSchools(schools);
  res.json({ success: true, school: schools[index] });
});

// ADD School
app.post("/api/schools/add", (req, res) => {
  const { npsn, nama, statusUpload, statusVerifikasi } = req.body;
  if (!npsn || !nama) {
    return res.status(400).json({ error: "NPSN and Nama are required" });
  }

  const schools = getSchools();
  if (schools.some((s) => s.npsn === npsn)) {
    return res.status(400).json({ error: `Sekolah dengan NPSN ${npsn} sudah ada di database.` });
  }

  const maxNo = schools.reduce((max, s) => (s.no > max ? s.no : max), 0);
  const newSchool: School = {
    no: maxNo + 1,
    npsn,
    nama: nama.toUpperCase(),
    jenjang: getJenjang(nama),
    kabKota: getKabKota(nama),
    statusUpload: statusUpload || "BELUM",
    statusVerifikasi: statusVerifikasi || "BELUM"
  };

  schools.push(newSchool);
  saveSchools(schools);
  res.json({ success: true, school: newSchool });
});

// DELETE School
app.post("/api/schools/delete", (req, res) => {
  const { npsn } = req.body;
  if (!npsn) {
    return res.status(400).json({ error: "NPSN is required" });
  }

  const schools = getSchools();
  const filtered = schools.filter((s) => s.npsn !== npsn);
  if (schools.length === filtered.length) {
    return res.status(404).json({ error: "School not found" });
  }

  // Re-number
  const renumbered = filtered.map((s, idx) => ({ ...s, no: idx + 1 }));
  saveSchools(renumbered);
  res.json({ success: true });
});

// RESET database to initialSchools
app.post("/api/schools/reset", (req, res) => {
  saveSchools(initialSchools);
  res.json({ success: true, schools: initialSchools });
});

// GET Notifications
app.get("/api/notifications", (req, res) => {
  res.json(getNotifications());
});

// ADD Notification
app.post("/api/notifications", (req, res) => {
  const notification = req.body;
  const notifications = getNotifications();
  notifications.unshift(notification);
  saveNotifications(notifications);
  res.json({ success: true, notification });
});

// MARK Notifications Read
app.post("/api/notifications/mark-read", (req, res) => {
  const { id } = req.body;
  const notifications = getNotifications();
  if (id) {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifications[idx].isRead = true;
    }
  } else {
    notifications.forEach((n) => (n.isRead = true));
  }
  saveNotifications(notifications);
  res.json({ success: true });
});

// CLEAR Notifications
app.post("/api/notifications/clear", (req, res) => {
  saveNotifications([]);
  res.json({ success: true });
});

// GET Period
app.get("/api/period", (req, res) => {
  res.json({ period: getPeriod() });
});

// POST Period
app.post("/api/period", (req, res) => {
  const { period } = req.body;
  if (!period) {
    return res.status(400).json({ error: "Period is required" });
  }
  savePeriod(period);
  res.json({ success: true, period });
});

// BATCH IMPORT / SYNC Schools (Merge or Overwrite)
app.post("/api/schools/import", (req, res) => {
  const { imported, mode } = req.body; // mode: 'merge' | 'overwrite'
  if (!Array.isArray(imported)) {
    return res.status(400).json({ error: "Imported data must be an array" });
  }

  let schools = getSchools();

  if (mode === "overwrite") {
    schools = imported.map((item, idx) => ({
      no: idx + 1,
      npsn: item.npsn,
      nama: item.nama.toUpperCase(),
      jenjang: item.jenjang || getJenjang(item.nama),
      kabKota: item.kabKota || getKabKota(item.nama),
      statusUpload: item.statusUpload || "BELUM",
      statusVerifikasi: item.statusVerifikasi || "BELUM"
    }));
  } else {
    // merge mode
    imported.forEach((item) => {
      const existingIdx = schools.findIndex((s) => s.npsn === item.npsn);
      if (existingIdx !== -1) {
        schools[existingIdx] = {
          ...schools[existingIdx],
          ...item,
          nama: item.nama ? item.nama.toUpperCase() : schools[existingIdx].nama,
          jenjang: item.nama ? getJenjang(item.nama) : schools[existingIdx].jenjang,
          kabKota: item.nama ? getKabKota(item.nama) : schools[existingIdx].kabKota
        };
      } else {
        const maxNo = schools.reduce((max, s) => (s.no > max ? s.no : max), 0);
        schools.push({
          no: maxNo + 1,
          npsn: item.npsn,
          nama: item.nama.toUpperCase(),
          jenjang: getJenjang(item.nama),
          kabKota: getKabKota(item.nama),
          statusUpload: item.statusUpload || "BELUM",
          statusVerifikasi: item.statusVerifikasi || "BELUM"
        });
      }
    });

    // Re-number to ensure clean index
    schools = schools.map((s, idx) => ({ ...s, no: idx + 1 }));
  }

  saveSchools(schools);
  res.json({ success: true, schools });
});


// ==================== VITE CLIENT INTEGRATION ====================

async function startServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
