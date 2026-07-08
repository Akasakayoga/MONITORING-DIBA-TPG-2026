import React, { useMemo, useState } from "react";
import { School } from "../data/schoolsData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from "recharts";
import {
  School as SchoolIcon,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";

interface DashboardOverviewProps {
  schools: School[];
  lastUpdated?: string;
}

export default function DashboardOverview({ schools, lastUpdated }: DashboardOverviewProps) {
  // --- INTERACTIVE MATRIX STATES ---
  const [selectedRegion, setSelectedRegion] = useState<string>("Kabupaten Ciamis");
  const [selectedJenjang, setSelectedJenjang] = useState<string>("SMKN");
  const [statusFilter, setStatusFilter] = useState<"SEMUA" | "SUDAH" | "BELUM">("SEMUA");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Define lists for matrix headers
  const regionsList = ["Kabupaten Ciamis", "Kota Banjar", "Kabupaten Pangandaran"];
  const jenjangsList = ["SMAN", "SMAS", "SMKN", "SMKS", "SLBN", "SLBS", "Lainnya"];

  // Calculate cell helper
  const getCellStats = (region: string, jenjang: string) => {
    const filtered = schools.filter(s => s.kabKota === region && s.jenjang === jenjang);
    const total = filtered.length;
    const sudah = filtered.filter(s => s.statusVerifikasi === "SUDAH").length;
    const belum = total - sudah;
    const percent = total > 0 ? Math.round((sudah / total) * 100) : 0;
    return { total, sudah, belum, percent };
  };

  // Get schools matching current selection
  const selectedSchoolsList = useMemo(() => {
    return schools.filter(s => s.kabKota === selectedRegion && s.jenjang === selectedJenjang);
  }, [schools, selectedRegion, selectedJenjang]);

  // Calculate stats for current selection
  const selectedStats = useMemo(() => {
    const total = selectedSchoolsList.length;
    const sudah = selectedSchoolsList.filter(s => s.statusVerifikasi === "SUDAH").length;
    const belum = total - sudah;
    const percent = total > 0 ? Math.round((sudah / total) * 100) : 0;
    return { total, sudah, belum, percent };
  }, [selectedSchoolsList]);

  // Filter the list based on status tab and search query
  const filteredSelectedSchools = useMemo(() => {
    return selectedSchoolsList.filter((s) => {
      const matchesStatus =
        statusFilter === "SEMUA" ||
        (statusFilter === "SUDAH" && s.statusVerifikasi === "SUDAH") ||
        (statusFilter === "BELUM" && s.statusVerifikasi === "BELUM");

      const matchesSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery);

      return matchesStatus && matchesSearch;
    });
  }, [selectedSchoolsList, statusFilter, searchQuery]);

  // 1. Calculate General Metrics
  const metrics = useMemo(() => {
    const total = schools.length;
    const uploaded = schools.filter((s) => s.statusUpload === "SUDAH").length;
    const verified = schools.filter((s) => s.statusVerifikasi === "SUDAH").length;
    const pendingUpload = total - uploaded;
    const pendingVerifikasi = total - verified;

    const percentUploaded = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    const percentVerified = total > 0 ? Math.round((verified / total) * 100) : 0;

    return {
      total,
      uploaded,
      verified,
      pendingUpload,
      pendingVerifikasi,
      percentUploaded,
      percentVerified
    };
  }, [schools]);

  // 2. Data for Grafik per Jenjang (SMAN, SMAS, SMKN, SMKS, SLBN, SLBS)
  const jenjangChartData = useMemo(() => {
    const groups: Record<string, { sudah: number; belum: number }> = {
      SMAN: { sudah: 0, belum: 0 },
      SMAS: { sudah: 0, belum: 0 },
      SMKN: { sudah: 0, belum: 0 },
      SMKS: { sudah: 0, belum: 0 },
      SLBN: { sudah: 0, belum: 0 },
      SLBS: { sudah: 0, belum: 0 },
      Lainnya: { sudah: 0, belum: 0 }
    };

    schools.forEach((s) => {
      const key = s.jenjang;
      if (groups[key]) {
        if (s.statusVerifikasi === "SUDAH") {
          groups[key].sudah += 1;
        } else {
          groups[key].belum += 1;
        }
      }
    });

    return Object.entries(groups)
      .map(([name, counts]) => ({
        name,
        Sudah: counts.sudah,
        Belum: counts.belum,
        Total: counts.sudah + counts.belum
      }))
      .filter((item) => item.Total > 0); // Only show jenjang that exist in the active dataset
  }, [schools]);

  // 3. Data for Grafik per Kabupaten/Kota
  const kabKotaChartData = useMemo(() => {
    const groups: Record<string, { sudah: number; belum: number }> = {
      "Kabupaten Ciamis": { sudah: 0, belum: 0 },
      "Kota Banjar": { sudah: 0, belum: 0 },
      "Kabupaten Pangandaran": { sudah: 0, belum: 0 },
      Lainnya: { sudah: 0, belum: 0 }
    };

    schools.forEach((s) => {
      const key = s.kabKota;
      if (groups[key]) {
        if (s.statusVerifikasi === "SUDAH") {
          groups[key].sudah += 1;
        } else {
          groups[key].belum += 1;
        }
      }
    });

    return Object.entries(groups)
      .map(([name, counts]) => ({
        name: name.replace("Kabupaten ", "Kab. ").replace("Kota ", "Kota "),
        Sudah: counts.sudah,
        Belum: counts.belum,
        Total: counts.sudah + counts.belum
      }))
      .filter((item) => item.Total > 0);
  }, [schools]);

  // 4. Data for Pie Charts (Sudah vs Belum)
  const uploadPieData = useMemo(() => {
    return [
      { name: "Sudah Upload", value: metrics.uploaded, color: "#10b981" }, // Emerald-500
      { name: "Belum Upload", value: metrics.pendingUpload, color: "#f59e0b" } // Amber-500
    ];
  }, [metrics]);

  const verifikasiPieData = useMemo(() => {
    return [
      { name: "Sudah Verifikasi", value: metrics.verified, color: "#6366f1" }, // Indigo-500
      { name: "Belum Verifikasi", value: metrics.pendingVerifikasi, color: "#ef4444" } // Red-500
    ];
  }, [metrics]);

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md font-sans">
          <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-semibold text-slate-900">{entry.value} Sekolah</span>
            </div>
          ))}
          {payload.length > 1 && (
            <div className="mt-1 pt-1 border-t border-slate-100 text-xs font-medium text-slate-500 flex justify-between gap-4">
              <span>Total:</span>
              <span className="font-semibold text-slate-800">
                {(payload[0].value || 0) + (payload[1].value || 0)} Sekolah
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome / Meta Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight uppercase">Monitoring Usulan TPG KCD Wilayah XIII</h2>
          <p className="text-slate-300 text-xs">
            Sistem rekapitulasi data usulan Tunjangan Profesi Guru berdasarkan status pengunggahan berkas digital dari sekolah.
          </p>
        </div>
        {lastUpdated && (
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">Informasi Data Update Per</p>
              <p className="text-xs font-mono font-bold text-white">{lastUpdated}</p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Schools */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Total Lembaga</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{metrics.total}</h3>
            <p className="text-xs text-slate-400">Sekolah terdaftar di DIBA GTK</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
            <SchoolIcon size={24} />
          </div>
        </div>

        {/* Upload Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Berkas Diunggah</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 font-mono">{metrics.uploaded}</h3>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                {metrics.percentUploaded}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-amber-600 font-mono">{metrics.pendingUpload}</span> Belum Unggah Berkas
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileCheck size={24} />
          </div>
        </div>

        {/* Verified Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Sudah Verifikasi</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 font-mono">{metrics.verified}</h3>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {metrics.percentVerified}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-rose-600 font-mono">{metrics.pendingVerifikasi}</span> Belum Terverifikasi
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Alert Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Peringatan / Deviasi</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {schools.filter((s) => s.statusUpload === "SUDAH" && s.statusVerifikasi === "BELUM").length}
            </h3>
            <p className="text-xs text-slate-400">Upload berkas belum diverifikasi</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Progress Bar (Overall Completeness) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <h4 className="text-sm font-semibold text-slate-800">Progres Penyelesaian Usulan TPG</h4>
          </div>
          <span className="text-xs font-semibold text-indigo-700">
            {metrics.percentVerified}% Data Selesai Diverifikasi
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
          <div
            className="bg-indigo-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${metrics.percentVerified}%` }}
            title={`Terverifikasi: ${metrics.percentVerified}%`}
          />
          <div
            className="bg-emerald-400 h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(0, metrics.percentUploaded - metrics.percentVerified)}%` }}
            title={`Berkas Diupload tapi Belum Verifikasi: ${Math.max(0, metrics.percentUploaded - metrics.percentVerified)}%`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Terverifikasi ({metrics.verified} sekolah)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Upload Berkas (Antrean Verifikasi: {metrics.uploaded - metrics.verified} sekolah)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Belum Mulai Usulan ({metrics.pendingUpload} sekolah)</span>
          </div>
        </div>
      </div>

      {/* SECTION: MATRIKS & DETAIL PENYARINGAN WILAYAH */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <SchoolIcon size={16} />
              </span>
              Matriks Distribusi Usulan TPG (Penyaringan Wilayah & Jenjang)
            </h4>
            <p className="text-xs text-slate-500">
              Klik salah satu kotak pada matriks untuk memuat dan melihat daftar sekolah beserta status verifikasi detailnya secara interaktif.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-[11px] text-slate-500 font-semibold">Sudah Upload</span>
            <span className="text-slate-300">|</span>
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-slate-500 font-semibold">Belum Upload</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Interactive Cross-Tabulation Matrix Grid */}
          <div className="xl:col-span-8 space-y-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tabel Silang Wilayah x Jenjang
            </h5>
            
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs bg-slate-50/30">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-100/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 border-b border-slate-200">Kabupaten / Kota</th>
                    {jenjangsList.map((j) => (
                      <th key={j} className="py-3 px-4 border-b border-slate-200 text-center">{j}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {regionsList.map((region) => (
                    <tr key={region} className="hover:bg-indigo-50/10 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{region}</td>
                      {jenjangsList.map((j) => {
                        const { total, sudah, belum, percent } = getCellStats(region, j);
                        const isSelected = selectedRegion === region && selectedJenjang === j;
                        
                        if (total === 0) {
                          return (
                            <td key={j} className="py-3 px-4 text-center text-slate-300 font-mono">
                              -
                            </td>
                          );
                        }
                        
                        return (
                          <td
                            key={j}
                            onClick={() => {
                              setSelectedRegion(region);
                              setSelectedJenjang(j);
                              setSearchQuery("");
                              setStatusFilter("SEMUA");
                            }}
                            className={`py-3 px-2 text-center cursor-pointer transition-all duration-150 border-l border-slate-100/50 relative ${
                              isSelected
                                ? "bg-indigo-50 font-bold ring-2 ring-indigo-600 ring-inset"
                                : "hover:bg-indigo-50/30"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-slate-800 font-mono text-[13px]">
                                <span className="text-indigo-600 font-bold">{sudah}</span>
                                <span className="text-slate-400 text-xs">/{total}</span>
                              </span>
                              
                              {/* Pill status */}
                              <div className="w-12 bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden flex">
                                <div className="bg-indigo-500 h-full" style={{ width: `${percent}%` }} />
                                <div className="bg-amber-400 h-full" style={{ width: `${100 - percent}%` }} />
                              </div>
                              
                              {percent === 100 ? (
                                <span className="absolute top-1 right-1 text-[9px] text-emerald-500 font-bold">✓</span>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold">
                i
              </span>
              <p className="leading-relaxed">
                Tabel di atas memetakan sebaran dari <strong>194 data sekolah</strong>. Klik salah satu kotak, misalnya baris <strong>Kabupaten Ciamis</strong> kolom <strong>SMKN</strong>, untuk melihat status data individual di sebelah kanan.
              </p>
            </div>
          </div>

          {/* Right Column: Active Selection Detail Card & List */}
          <div className="xl:col-span-4 bg-slate-50/50 border border-slate-150 rounded-2xl p-4 flex flex-col space-y-4">
            {/* Header of Active Selection */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                  {selectedJenjang}
                </span>
                <span className="text-xs text-slate-400 font-medium">di</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {selectedRegion}
              </h4>
            </div>

            {/* Quick Micro-stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-medium uppercase">Total</span>
                <span className="text-base font-extrabold text-slate-800 font-mono">{selectedStats.total}</span>
              </div>
              <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/50">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase">Sudah</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">{selectedStats.sudah}</span>
              </div>
              <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/50">
                <span className="block text-[10px] text-amber-600 font-bold uppercase">Belum</span>
                <span className="text-base font-extrabold text-amber-700 font-mono">{selectedStats.belum}</span>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(["SEMUA", "SUDAH", "BELUM"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    statusFilter === tab
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "SEMUA" ? "Semua" : tab === "SUDAH" ? "Sudah" : "Belum"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700"
              />
              <span className="absolute left-2.5 top-2 text-slate-400">
                <Search size={14} />
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* List of Schools */}
            <div className="flex-1 max-h-[220px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {filteredSelectedSchools.length > 0 ? (
                filteredSelectedSchools.map((school) => {
                  const isVerified = school.statusVerifikasi === "SUDAH";
                  return (
                    <div key={school.npsn} className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-[11px]">
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-slate-800 truncate" title={school.nama}>
                          {school.nama}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">NPSN: {school.npsn}</p>
                      </div>
                      
                      <span
                        className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                            : "bg-amber-50 text-amber-700 border border-amber-100/50"
                        }`}
                      >
                        {isVerified ? "Sudah Upload" : "Belum Upload"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-[11px]">
                  {selectedSchoolsList.length === 0
                    ? `Tidak ada data ${selectedJenjang} di ${selectedRegion}`
                    : "Pencarian tidak ditemukan"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Jenjang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <BarChart3 size={18} className="text-indigo-600" />
            <h4 className="font-semibold text-slate-800">Usulan TPG per Jenjang Sekolah</h4>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jenjangChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Sudah" name="Terverifikasi" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Belum" name="Belum Verifikasi" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Kabupaten / Kota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Building2 size={18} className="text-indigo-600" />
            <h4 className="font-semibold text-slate-800">Usulan TPG per Wilayah Kabupaten / Kota</h4>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kabKotaChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Sudah" name="Terverifikasi" stackId="a" fill="#6366f1" />
                <Bar dataKey="Belum" name="Belum Verifikasi" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3 & 4: Progress Donuts (Side-by-side or stacked on mobile) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <PieIcon size={18} className="text-indigo-600" />
            <h4 className="font-semibold text-slate-800">Proporsi Kesiapan Dokumen & Verifikasi</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Donut Upload */}
            <div className="flex flex-col items-center space-y-2 border-r border-slate-100 last:border-r-0">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Upload Berkas</h5>
              <div className="h-44 w-full flex justify-center items-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={uploadPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {uploadPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Sekolah`]} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{metrics.percentUploaded}%</span>
                  <p className="text-[10px] text-slate-400 font-medium">Sudah Upload</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Sudah ({metrics.uploaded})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Belum ({metrics.pendingUpload})</span>
                </div>
              </div>
            </div>

            {/* Donut Verifikasi */}
            <div className="flex flex-col items-center space-y-2">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Verifikasi Data</h5>
              <div className="h-44 w-full flex justify-center items-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verifikasiPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {verifikasiPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Sekolah`]} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{metrics.percentVerified}%</span>
                  <p className="text-[10px] text-slate-400 font-medium">Terverifikasi</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-600 font-medium">Sudah ({metrics.verified})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-600 font-medium">Belum ({metrics.pendingVerifikasi})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
