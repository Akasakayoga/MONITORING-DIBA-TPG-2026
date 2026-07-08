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
  X
} from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
}

export default function App() {
  // --- STATE ---
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem("diba_gtk_schools");
    return saved ? JSON.parse(saved) : initialSchools;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem("diba_gtk_notifications");
    if (saved) return JSON.parse(saved);

    // Default Initial Notifications for pristine presentation
    const initDate = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    return [
      {
        id: "init-1",
        timestamp: initDate,
        schoolName: "Sistem DIBA GTK",
        npsn: "SYSTEM",
        type: "sistem",
        message: "Database awal berhasil dimuat seutuhnya dari file rekap rekap. 194 Lembaga Sekolah berhasil dipetakan ke sistem.",
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
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "schools" | "import" | "notifications">("overview");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("diba_gtk_schools", JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem("diba_gtk_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // --- LIVE TICKING CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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

  // --- AUTOMATIC NOTIFICATION LOGGER ---
  const addNotificationLog = useCallback(
    (params: Omit<NotificationLog, "id" | "timestamp" | "isRead">) => {
      const timestampString = new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const newNotif: NotificationLog = {
        ...params,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: timestampString,
        isRead: false
      };

      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // --- DATA MUTATORS ---

  // Update a single school status (Manually clicked in table)
  const handleUpdateSchool = useCallback(
    (npsn: string, fields: Partial<School>) => {
      setSchools((prevSchools) => {
        return prevSchools.map((school) => {
          if (school.npsn !== npsn) return school;

          // Detect significant changes to trigger automated notifications
          const hasVerifikasiChanged =
            fields.statusVerifikasi !== undefined &&
            school.statusVerifikasi !== fields.statusVerifikasi;
          
          const hasUploadChanged =
            fields.statusUpload !== undefined &&
            school.statusUpload !== fields.statusUpload;

          if (hasVerifikasiChanged) {
            addNotificationLog({
              schoolName: school.nama,
              npsn: school.npsn,
              type: "verifikasi",
              message:
                fields.statusVerifikasi === "SUDAH"
                  ? `Pemberkasan usulan TPG diverifikasi sukses oleh validator DIBA GTK.`
                  : `Verifikasi usulan TPG ditarik kembali/dibatalkan oleh validator.`,
              oldValue: school.statusVerifikasi,
              newValue: fields.statusVerifikasi
            });

            addToast(
              "Perubahan Verifikasi",
              `Status verifikasi ${school.nama} telah diubah menjadi ${fields.statusVerifikasi}.`,
              fields.statusVerifikasi === "SUDAH" ? "success" : "warning"
            );
          } else if (hasUploadChanged) {
            addNotificationLog({
              schoolName: school.nama,
              npsn: school.npsn,
              type: "upload",
              message:
                fields.statusUpload === "SUDAH"
                  ? `Sekolah berhasil melengkapi upload berkas kelayakan TPG.`
                  : `Berkas usulan dinonaktifkan / dihapus dari server DIBA.`,
              oldValue: school.statusUpload,
              newValue: fields.statusUpload
            });

            addToast(
              "Status Unggahan",
              `Status upload berkas ${school.nama} sekarang adalah ${fields.statusUpload}.`,
              fields.statusUpload === "SUDAH" ? "success" : "info"
            );
          }

          return { ...school, ...fields };
        });
      });
    },
    [addNotificationLog, addToast]
  );

  // Manually add school
  const handleAddSchool = useCallback(
    (newSchool: Omit<School, "no">) => {
      setSchools((prev) => {
        const nextNo = prev.length > 0 ? Math.max(...prev.map((s) => s.no)) + 1 : 1;
        const schoolWithNo: School = {
          ...newSchool,
          no: nextNo
        };

        addNotificationLog({
          schoolName: schoolWithNo.nama,
          npsn: schoolWithNo.npsn,
          type: "sistem",
          message: `Sekolah baru berhasil ditambahkan secara manual ke database usulan.`
        });

        addToast(
          "Lembaga Ditambahkan",
          `${schoolWithNo.nama} berhasil didaftarkan di wilayah ${schoolWithNo.kabKota}.`,
          "success"
        );

        return [...prev, schoolWithNo];
      });
    },
    [addNotificationLog, addToast]
  );

  // Manually delete school
  const handleDeleteSchool = useCallback(
    (npsn: string) => {
      setSchools((prev) => {
        const match = prev.find((s) => s.npsn === npsn);
        if (!match) return prev;

        addNotificationLog({
          schoolName: match.nama,
          npsn: match.npsn,
          type: "sistem",
          message: `Lembaga sekolah dihapus seutuhnya dari database pengusul TPG.`
        });

        addToast("Lembaga Dihapus", `${match.nama} telah dikeluarkan dari pemantauan.`, "warning");

        return prev.filter((s) => s.npsn !== npsn);
      });
    },
    [addNotificationLog, addToast]
  );

  // Bulk CSV Imports Handler
  const handleImportSchools = useCallback(
    (importedList: Omit<School, "no">[], mode: "merge" | "overwrite") => {
      if (mode === "overwrite") {
        const formattedList: School[] = importedList.map((item, index) => ({
          ...item,
          no: index + 1
        }));

        setSchools(formattedList);

        addNotificationLog({
          schoolName: "Sistem Sinkronisasi",
          npsn: "CSV_BULK",
          type: "import",
          message: `Penggantian massal sukses! Seluruh database ditimpa dengan ${importedList.length} data baru dari CSV.`
        });

        addToast(
          "Database Ditimpa",
          `Berhasil memuat seutuhnya ${importedList.length} sekolah baru dari file eksternal.`,
          "success"
        );
      } else {
        // MERGE / UPDATE MODE
        setSchools((currentSchools) => {
          let updatedCount = 0;
          let addedCount = 0;

          const updatedList = [...currentSchools];

          importedList.forEach((imported) => {
            const matchIndex = updatedList.findIndex((s) => s.npsn === imported.npsn);

            if (matchIndex !== -1) {
              const oldSchool = updatedList[matchIndex];
              const verifikasiChanged = oldSchool.statusVerifikasi !== imported.statusVerifikasi;
              const uploadChanged = oldSchool.statusUpload !== imported.statusUpload;

              if (verifikasiChanged || uploadChanged) {
                updatedCount++;
                updatedList[matchIndex] = {
                  ...oldSchool,
                  nama: imported.nama, // Update name if spelling changed
                  jenjang: imported.jenjang,
                  kabKota: imported.kabKota,
                  statusUpload: imported.statusUpload,
                  statusVerifikasi: imported.statusVerifikasi
                };

                // Log automatic notification if verification changed significantly
                if (verifikasiChanged) {
                  addNotificationLog({
                    schoolName: imported.nama,
                    npsn: imported.npsn,
                    type: "verifikasi",
                    message: `[Update Massal] Status verifikasi diperbarui otomatis dari file sinkronisasi CSV.`,
                    oldValue: oldSchool.statusVerifikasi,
                    newValue: imported.statusVerifikasi
                  });
                }
              }
            } else {
              // Add as new school
              addedCount++;
              const nextNo = updatedList.length > 0 ? Math.max(...updatedList.map((s) => s.no)) + 1 : 1;
              updatedList.push({
                ...imported,
                no: nextNo
              });

              addNotificationLog({
                schoolName: imported.nama,
                npsn: imported.npsn,
                type: "import",
                message: `[Lembaga Baru] Didaftarkan otomatis melalui penggabungan file CSV.`
              });
            }
          });

          addToast(
            "Sinkronisasi Gabung Selesai",
            `Sinkronisasi massal berhasil memproses ${updatedCount} baris perubahan status dan ${addedCount} lembaga baru.`,
            "success"
          );

          return updatedList;
        });
      }
    },
    [addNotificationLog, addToast]
  );

  // Restore baseline 194 original records
  const handleResetData = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menyetel ulang seluruh database ke 194 data sekolah awal dari PDF rekap?"
      )
    ) {
      setSchools(initialSchools);
      setNotifications((prev) => {
        const timestampString = new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        return [
          {
            id: `reset-${Date.now()}`,
            timestamp: timestampString,
            schoolName: "Sistem GTK",
            npsn: "SYSTEM",
            type: "sistem",
            message: "Seluruh database sekolah di-reset paksa ke baseline rekap asli (194 Sekolah).",
            isRead: false
          },
          ...prev
        ];
      });
      addToast("Database Disetel Ulang", "Database berhasil dikembalikan ke 194 sekolah asli.", "info");
    }
  };

  // --- NOTIFICATION MANIPULATION ---
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast("Notifikasi Dibaca", "Semua log notifikasi ditandai sebagai terbaca.", "success");
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
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
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    DIBA GTK TPG MONITORING
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Sparkles size={10} /> Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Manajemen Data Verifikasi Usulan Tunjangan Profesi Guru
                </p>
              </div>
            </div>

            {/* Right Controls: Live Clock & Notification Center */}
            <div className="flex items-center gap-4">
              {/* Ticking Clock */}
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 text-[11px] font-semibold">
                <Clock size={13} className="text-indigo-600 animate-pulse" />
                <span className="font-mono">{formattedTime}</span>
              </div>

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
            {activeTab === "overview" && <DashboardOverview schools={schools} />}

            {activeTab === "schools" && (
              <SchoolTable
                schools={schools}
                onUpdateSchool={handleUpdateSchool}
                onAddSchool={handleAddSchool}
                onDeleteSchool={handleDeleteSchool}
                onResetData={handleResetData}
              />
            )}

            {activeTab === "import" && (
              <ImportData onImportComplete={handleImportSchools} existingSchools={schools} />
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
          <p>© 2026 Aplikasi DIBA GTK - Rekapitulasi Usulan TPG</p>
          <div className="flex gap-4">
            <span>Kab. Ciamis</span>
            <span>•</span>
            <span>Kota Banjar</span>
            <span>•</span>
            <span>Kab. Pangandaran</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
