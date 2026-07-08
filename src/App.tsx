import React, { useState, useEffect, useCallback, useMemo } from "react";
import { School, initialSchools, NotificationLog } from "./data/schoolsData";
import DashboardOverview from "./components/DashboardOverview";
import SchoolTable from "./components/SchoolTable";
import ImportData from "./components/ImportData";
import NotificationList from "./components/NotificationList";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  School as SchoolIcon,
  FileUp,
  Bell,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Calendar,
  Edit3,
  Lock
} from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
}

export default function App() {
  // --- STATE ---
  const [schools, setSchools] = useState<School[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "schools" | "import" | "notifications" | "settings">("overview");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [periode, setPeriode] = useState<string>("Juli 2026");
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [tempPeriod, setTempPeriod] = useState("Juli 2026");
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WIB";
  });

  // --- ADMIN MODE STATES ---
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("diba_gtk_is_admin") === "true";
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // --- REAL-TIME EXPRESS BACKEND SYNCHRONIZATION ---
  const fetchAllData = useCallback(() => {
    // Fetch schools
    fetch("/api/schools")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSchools(data);
        }
      })
      .catch((err) => console.error("Error fetching schools:", err));

    // Fetch notifications
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err));

    // Fetch period
    fetch("/api/period")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.period) {
          setPeriode(data.period);
          setTempPeriod(data.period);
        }
      })
      .catch((err) => console.error("Error fetching period:", err));
  }, []);

  // Sync admin mode preference
  useEffect(() => {
    localStorage.setItem("diba_gtk_is_admin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  // Fetch immediately on mount, and poll every 5 seconds for absolute real-time sync across devices
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // --- LIVE TICKING CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTimestamp = useCallback(() => {
    const formatted = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }) + " WIB";
    setLastUpdated(formatted);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }, [currentTime]);

  // --- TOAST NOTIFICATIONS TRIGGER ---
  const addToast = useCallback((title: string, message: string, type: Toast["type"]) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- PERIOD MODIFIER ---
  const handleUpdatePeriod = useCallback((p: string) => {
    setPeriode(p);
    setTempPeriod(p);
    fetch("/api/period", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period: p })
    })
      .then(() => {
        addToast("Periode Diubah", `Periode usulan TPG berhasil diubah ke ${p}.`, "success");
        fetchAllData();
      })
      .catch((err) => console.error("Error setting period:", err));
  }, [fetchAllData, addToast]);

  // --- DATA MUTATORS ---

  // Update a single school status (Manually clicked in table)
  const handleUpdateSchool = useCallback(
    (npsn: string, fields: Partial<School>) => {
      const school = schools.find((s) => s.npsn === npsn);
      if (!school) return;

      const hasVerifikasiChanged =
        fields.statusVerifikasi !== undefined &&
        school.statusVerifikasi !== fields.statusVerifikasi;
      
      const hasUploadChanged =
        fields.statusUpload !== undefined &&
        school.statusUpload !== fields.statusUpload;

      let notificationMessage = "";
      let notificationType: NotificationLog["type"] = "sistem";
      let oldValue = "";
      let newValue = "";

      if (hasVerifikasiChanged) {
        notificationMessage = fields.statusVerifikasi === "SUDAH"
          ? `Pemberkasan usulan TPG diverifikasi sukses oleh validator DIBA GTK.`
          : `Verifikasi usulan TPG ditarik kembali/dibatalkan oleh validator.`;
        notificationType = "verifikasi";
        oldValue = school.statusVerifikasi;
        newValue = fields.statusVerifikasi || "BELUM";

        addToast(
          "Perubahan Verifikasi",
          `Status verifikasi ${school.nama} telah diubah menjadi ${fields.statusVerifikasi}.`,
          fields.statusVerifikasi === "SUDAH" ? "success" : "warning"
        );
      } else if (hasUploadChanged) {
        notificationMessage = fields.statusUpload === "SUDAH"
          ? `Sekolah berhasil melengkapi upload berkas kelayakan TPG.`
          : `Berkas usulan dinonaktifkan / dihapus dari server DIBA.`;
        notificationType = "upload";
        oldValue = school.statusUpload;
        newValue = fields.statusUpload || "BELUM";

        addToast(
          "Status Unggahan",
          `Status upload berkas ${school.nama} sekarang adalah ${fields.statusUpload}.`,
          fields.statusUpload === "SUDAH" ? "success" : "info"
        );
      }

      // Optimistically update local state
      setSchools((prev) =>
        prev.map((s) => (s.npsn === npsn ? { ...s, ...fields } : s))
      );

      // Save to server
      fetch("/api/schools/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npsn, updates: fields })
      })
        .then(() => fetchAllData())
        .catch((err) => console.error("Error updating school:", err));

      if (notificationMessage) {
        const timestampString = new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        const newNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: timestampString,
          schoolName: school.nama,
          npsn: school.npsn,
          type: notificationType,
          message: notificationMessage,
          oldValue,
          newValue,
          isRead: false
        };

        // Optimistically add notification
        setNotifications((prev) => [newNotif, ...prev]);

        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotif)
        })
          .then(() => fetchAllData())
          .catch((err) => console.error("Error creating notification:", err));
      }

      updateTimestamp();
    },
    [schools, fetchAllData, addToast, updateTimestamp]
  );

  // Manually add school
  const handleAddSchool = useCallback(
    (newSchool: Omit<School, "no">) => {
      fetch("/api/schools/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool)
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || "Gagal menambahkan sekolah.");
            });
          }
          return res.json();
        })
        .then((result) => {
          if (result.success) {
            const addedSchool = result.school;
            addToast(
              "Lembaga Ditambahkan",
              `${addedSchool.nama} berhasil didaftarkan di wilayah ${addedSchool.kabKota}.`,
              "success"
            );

            const timestampString = new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            });

            const newNotif = {
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              timestamp: timestampString,
              schoolName: addedSchool.nama,
              npsn: addedSchool.npsn,
              type: "sistem" as const,
              message: `Sekolah baru berhasil ditambahkan secara manual ke database usulan.`,
              isRead: false
            };

            fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newNotif)
            }).then(() => fetchAllData());
          }
        })
        .catch((err: any) => {
          addToast("Gagal Menambahkan", err.message, "warning");
        });

      updateTimestamp();
    },
    [fetchAllData, addToast, updateTimestamp]
  );

  // Manually delete school
  const handleDeleteSchool = useCallback(
    (npsn: string) => {
      const school = schools.find((s) => s.npsn === npsn);
      if (!school) return;

      // Optimistic delete
      setSchools((prev) => prev.filter((s) => s.npsn !== npsn));

      fetch("/api/schools/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npsn })
      })
        .then(() => {
          addToast("Lembaga Dihapus", `${school.nama} telah dikeluarkan dari pemantauan.`, "warning");

          const timestampString = new Date().toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });

          const newNotif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: timestampString,
            schoolName: school.nama,
            npsn: school.npsn,
            type: "sistem" as const,
            message: `Lembaga sekolah dihapus seutuhnya dari database pengusul TPG.`,
            isRead: false
          };

          fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newNotif)
          }).then(() => fetchAllData());
        })
        .catch((err) => console.error("Error deleting school:", err));

      updateTimestamp();
    },
    [schools, fetchAllData, addToast, updateTimestamp]
  );

  // Bulk CSV Imports Handler
  const handleImportSchools = useCallback(
    (importedList: Omit<School, "no">[], mode: "merge" | "overwrite") => {
      fetch("/api/schools/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imported: importedList, mode })
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setSchools(result.schools);

            const timestampString = new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            });

            if (mode === "overwrite") {
              addToast(
                "Database Ditimpa",
                `Berhasil memuat seutuhnya ${importedList.length} sekolah baru dari file eksternal.`,
                "success"
              );

              const newNotif = {
                id: `notif-${Date.now()}`,
                timestamp: timestampString,
                schoolName: "Sistem Sinkronisasi",
                npsn: "CSV_BULK",
                type: "import" as const,
                message: `Penggantian massal sukses! Seluruh database ditimpa dengan ${importedList.length} data baru dari CSV.`,
                isRead: false
              };

              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newNotif)
              }).then(() => fetchAllData());
            } else {
              addToast(
                "Sinkronisasi Gabung Selesai",
                `Sinkronisasi massal berhasil memproses penggabungan data CSV.`,
                "success"
              );

              const newNotif = {
                id: `notif-${Date.now()}`,
                timestamp: timestampString,
                schoolName: "Sistem Sinkronisasi",
                npsn: "CSV_BULK",
                type: "import" as const,
                message: `Sinkronisasi massal berhasil memproses penggabungan data CSV dengan database aktif.`,
                isRead: false
              };

              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newNotif)
              }).then(() => fetchAllData());
            }
          }
        })
        .catch((err) => console.error("Error importing schools:", err));

      updateTimestamp();
    },
    [fetchAllData, addToast, updateTimestamp]
  );

  // Restore baseline 194 original records
  const handleResetData = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menyetel ulang seluruh database ke 194 data sekolah awal dari PDF rekap?"
      )
    ) {
      fetch("/api/schools/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setSchools(result.schools);
            addToast("Database Disetel Ulang", "Database berhasil dikembalikan ke 194 sekolah asli.", "info");

            const timestampString = new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            const newNotif = {
              id: `reset-${Date.now()}`,
              timestamp: timestampString,
              schoolName: "Sistem GTK",
              npsn: "SYSTEM",
              type: "sistem" as const,
              message: "Seluruh database sekolah di-reset paksa ke baseline rekap asli (194 Sekolah).",
              isRead: false
            };

            fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newNotif)
            }).then(() => fetchAllData());
          }
        })
        .catch((err) => console.error("Error resetting database:", err));

      updateTimestamp();
    }
  };

  // --- ADMIN PASSCODE VERIFICATION ---
  const handleVerifyPasscode = () => {
    if (passcode.trim() === "ginginfaujiyanti") {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPasscode("");
      addToast("Akses Diterima", "Mode Administrator aktif. Seluruh fitur edit, tambah, & hapus data telah dibuka.", "success");
    } else {
      setPasscodeError("Passcode salah. Silakan coba lagi.");
    }
  };

  // --- NOTIFICATION MANIPULATION ---
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then(() => fetchAllData())
      .catch((err) => console.error(err));

    addToast("Notifikasi Dibaca", "Semua log notifikasi ditandai sebagai terbaca.", "success");
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then(() => fetchAllData())
      .catch((err) => console.error(err));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);

    fetch("/api/notifications/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then(() => fetchAllData())
      .catch((err) => console.error(err));

    addToast("Log Dibersihkan", "Seluruh riwayat notifikasi telah dikosongkan.", "info");
  };

  // Unread notification computation
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* --- TOP BANNER/HEADER BAR --- */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Title / Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                <SchoolIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    DIBA GTK TPG MONITORING KCD XIII
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Sparkles size={10} /> Live
                  </span>

                  {/* Interactive Period Selector Badge */}
                  <div className="relative inline-block">
                    <button
                      onClick={() => {
                        setTempPeriod(periode);
                        setIsEditingPeriod(!isEditingPeriod);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer shadow-xs"
                      title="Klik untuk mengubah periode usulan"
                    >
                      <Calendar size={10} className="text-emerald-600 shrink-0" />
                      <span>Periode: {periode}</span>
                      <Edit3 size={8} className="opacity-60 shrink-0" />
                    </button>

                    <AnimatePresence>
                      {isEditingPeriod && (
                        <>
                          {/* Close backdrop */}
                          <div className="fixed inset-0 z-40" onClick={() => setIsEditingPeriod(false)} />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-3 text-left"
                          >
                            <div className="space-y-0.5">
                              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                <Calendar size={12} className="text-emerald-600" />
                                Pilih Periode Usulan TPG
                              </h5>
                              <p className="text-[10px] text-slate-400 font-medium">Ubah periode monitoring aktif secara real-time.</p>
                            </div>

                            {/* Presets */}
                            <div className="grid grid-cols-2 gap-1">
                              {["Juli 2026", "Agustus 2026", "September 2026", "Triwulan I 2026", "Triwulan II 2026", "Triwulan III 2026"].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => {
                                    handleUpdatePeriod(p);
                                    setIsEditingPeriod(false);
                                  }}
                                  className={`py-1 px-1.5 rounded text-[10px] font-bold text-left transition border cursor-pointer ${
                                    periode === p
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>

                            {/* Custom text option */}
                            <div className="border-t border-slate-100 pt-2 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Atur Kustom Periode</label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="Contoh: Oktober 2026"
                                  value={tempPeriod}
                                  onChange={(e) => setTempPeriod(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => {
                                    if (tempPeriod.trim()) {
                                      handleUpdatePeriod(tempPeriod.trim());
                                      setIsEditingPeriod(false);
                                    }
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer"
                                >
                                  Set
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Manajemen Data Verifikasi Usulan Tunjangan Profesi Guru
                </p>
              </div>
            </div>

            {/* Right Controls: Live Clock & Notification Center */}
            <div className="flex items-center gap-4">
              {/* Last Updated Badge */}
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Data Update Per:</span>
                <span className="text-[11px] font-semibold text-slate-700 font-mono bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/30">{lastUpdated}</span>
              </div>

              {/* Ticking Clock */}
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 text-[11px] font-semibold">
                <Clock size={13} className="text-indigo-600 animate-pulse" />
                <span className="font-mono">{formattedTime}</span>
              </div>

              {/* Admin Mode Toggle Button */}
              {isAdmin ? (
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    addToast("Keluar Admin", "Anda telah keluar dari Mode Administrator.", "info");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  title="Klik untuk Keluar dari Mode Administrator"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Mode Admin: Aktif</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPasscode("");
                    setPasscodeError("");
                    setShowAdminModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  title="Masuk sebagai Administrator untuk fitur Edit/Tambah"
                >
                  <Lock size={12} className="text-slate-400 shrink-0" />
                  <span>Masuk Admin</span>
                </button>
              )}

              {/* Notification Center Bell Indicator */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                  className={`p-2.5 rounded-xl border border-slate-100 transition relative cursor-pointer hover:bg-slate-50 ${
                    showNotificationPopup ? "bg-slate-50 text-indigo-600 border-indigo-200" : "bg-white text-slate-600"
                  }`}
                  title="Notifikasi Masuk"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-indigo-600 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border border-white animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown notification popup snippet */}
                <AnimatePresence>
                  {showNotificationPopup && (
                    <>
                      {/* Underlay to close dropdown */}
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setShowNotificationPopup(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-slate-50/75 border-b border-slate-100 flex justify-between items-center">
                          <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                            <Bell size={12} className="text-indigo-600" />
                            Notifikasi Terbaru ({unreadCount})
                          </h5>
                          <button
                            onClick={() => {
                              setActiveTab("notifications");
                              setShowNotificationPopup(false);
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                          >
                            Lihat Semua
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  handleMarkNotificationAsRead(notif.id);
                                  setActiveTab("notifications");
                                  setShowNotificationPopup(false);
                                }}
                                className={`p-3.5 text-xs hover:bg-slate-50/50 transition cursor-pointer flex gap-3 ${
                                  !notif.isRead ? "bg-indigo-50/5" : ""
                                }`}
                              >
                                <div className="shrink-0 mt-0.5">
                                  <span
                                    className={`w-2 h-2 rounded-full block ${
                                      notif.type === "verifikasi"
                                        ? "bg-indigo-600"
                                        : notif.type === "upload"
                                        ? "bg-emerald-500"
                                        : "bg-blue-500"
                                    }`}
                                  />
                                </div>
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-[10px] text-slate-800 truncate max-w-[120px]">
                                      {notif.schoolName || "Sistem"}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {notif.timestamp.split(" ")[0]}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                              Tidak ada log notifikasi masuk.
                            </div>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              handleMarkAllNotificationsAsRead();
                              setShowNotificationPopup(false);
                            }}
                            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-center text-[10px] font-bold text-indigo-700 border-t border-slate-100 cursor-pointer"
                          >
                            Tandai Semua Sebagai Terbaca
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- FLOATING TOAST POPUPS --- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
              className={`p-4 rounded-xl border shadow-xl flex gap-3 items-start bg-white ${
                toast.type === "success"
                  ? "border-emerald-100 shadow-emerald-50/25"
                  : toast.type === "warning"
                  ? "border-amber-100 shadow-amber-50/25"
                  : "border-indigo-100 shadow-indigo-50/25"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" ? (
                  <CheckCircle className="text-emerald-500 w-4 h-4" />
                ) : toast.type === "warning" ? (
                  <AlertTriangle className="text-amber-500 w-4 h-4" />
                ) : (
                  <Info className="text-indigo-500 w-4 h-4" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <h6 className="text-xs font-bold text-slate-800">{toast.title}</h6>
                <p className="text-[11px] text-slate-500 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 rounded-md p-0.5"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- NAVIGATION SUB-MENU TABS --- */}
      <nav className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 h-12 overflow-x-auto no-scrollbar">
            {/* Tab Overview */}
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-indigo-700 shadow-xs border-b border-indigo-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>📊 Ringkasan Visual</span>
            </button>

            {/* Tab Schools */}
            <button
              onClick={() => setActiveTab("schools")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                activeTab === "schools"
                  ? "bg-white text-indigo-700 shadow-xs border-b border-indigo-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <SchoolIcon size={14} />
              <span>🏫 Data Sekolah ({schools.length})</span>
            </button>

            {/* Tab Import */}
            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                activeTab === "import"
                  ? "bg-white text-indigo-700 shadow-xs border-b border-indigo-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <FileUp size={14} />
              <span>📥 Import Update CSV</span>
            </button>

            {/* Tab Notifications */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-white text-indigo-700 shadow-xs border-b border-indigo-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Bell size={14} />
              <span>🔔 Log Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN PAGE WORKSPACE STAGE --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none"
          >
            {activeTab === "overview" && <DashboardOverview schools={schools} lastUpdated={lastUpdated} periode={periode} />}

            {activeTab === "schools" && (
              <SchoolTable
                schools={schools}
                onUpdateSchool={handleUpdateSchool}
                onAddSchool={handleAddSchool}
                onDeleteSchool={handleDeleteSchool}
                onResetData={handleResetData}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "import" && (
              <ImportData
                onImportComplete={handleImportSchools}
                existingSchools={schools}
                isAdmin={isAdmin}
                onSetAdmin={setIsAdmin}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationList
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onClearAll={handleClearAllNotifications}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- FOOTER CREDITS --- */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Dashboard Monitoring - Rekapitulasi Usulan TPG KCD XIII</p>
          <div className="flex gap-4">
            <span>Kab. Ciamis</span>
            <span>•</span>
            <span>Kota Banjar</span>
            <span>•</span>
            <span>Kab. Pangandaran</span>
          </div>
        </div>
      </footer>

      {/* --- ADMIN PASSCODE VERIFICATION MODAL --- */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative z-10 overflow-hidden space-y-4 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Akses Mode Administrator</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Verifikasi identitas untuk mengaktifkan fitur edit & tambah.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Passcode Akses
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Masukkan passcode..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVerifyPasscode();
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none transition ${
                      passcodeError
                        ? "border-rose-300 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    }`}
                    autoFocus
                  />
                </div>
                {passcodeError ? (
                  <p className="text-[10px] text-rose-600 font-semibold">{passcodeError}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Gunakan kode <code className="bg-slate-100 text-slate-700 font-mono px-1 py-0.5 rounded font-bold">1234</code> untuk tujuan pengetesan langsung.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPasscode}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Masuk Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
