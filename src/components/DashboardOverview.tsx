import React, { useMemo } from "react";
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
  TrendingUp
} from "lucide-react";

interface DashboardOverviewProps {
  schools: School[];
}

export default function DashboardOverview({ schools }: DashboardOverviewProps) {
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
