import React, { useState } from "react";
import { NotificationLog } from "../data/schoolsData";
import {
  Bell,
  Trash2,
  Check,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Upload,
  Info,
  Calendar,
  Search
} from "lucide-react";

interface NotificationListProps {
  notifications: NotificationLog[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationList({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onMarkAsRead
}: NotificationListProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === "ALL" || n.type === filterType;
    const matchesSearch =
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.npsn.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const getIcon = (type: NotificationLog["type"]) => {
    switch (type) {
      case "verifikasi":
        return (
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 size={16} />
          </div>
        );
      case "upload":
        return (
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Upload size={16} />
          </div>
        );
      case "import":
        return (
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FileCheck size={16} />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
            <Info size={16} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            Sistem Notifikasi & Log Aktivitas
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat pembaruan status verifikasi data usulan TPG secara otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition"
            >
              <Check size={14} />
              Tandai Semua Terbaca
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition"
            >
              <Trash2 size={14} />
              Bersihkan Log
            </button>
          )}
        </div>
      </div>

      {/* Filters Subpanel */}
      <div className="p-4 bg-slate-50/75 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari log nama sekolah / NPSN / pesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Type */}
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: "ALL", label: "Semua Log" },
            { value: "verifikasi", label: "Status Verifikasi" },
            { value: "upload", label: "Pemberkasan" },
            { value: "import", label: "Pembaruan CSV" },
            { value: "sistem", label: "Sistem" }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterType === opt.value
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && onMarkAsRead(notif.id)}
              className={`p-4 flex gap-4 hover:bg-slate-50/50 transition cursor-pointer relative ${
                !notif.isRead ? "bg-indigo-50/10" : ""
              }`}
            >
              {/* Unread indicator circle */}
              {!notif.isRead && (
                <span className="absolute top-4 left-2 w-2 h-2 bg-indigo-600 rounded-full" />
              )}

              <div className="shrink-0">{getIcon(notif.type)}</div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {notif.schoolName ? `${notif.schoolName} (${notif.npsn})` : "Sistem GTK"}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-medium whitespace-nowrap shrink-0">
                    <Calendar size={10} />
                    <span>{notif.timestamp}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.message}</p>

                {/* Status difference pill */}
                {notif.oldValue && notif.newValue && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      {notif.oldValue}
                    </span>
                    <span className="text-[10px] text-slate-400">→</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        notif.newValue === "SUDAH"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {notif.newValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={28} className="text-slate-300" />
            <p className="font-semibold text-slate-600">Tidak ada notifikasi</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Belum ada aktivitas baru atau tidak ada log yang cocok dengan filter pencarian Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
