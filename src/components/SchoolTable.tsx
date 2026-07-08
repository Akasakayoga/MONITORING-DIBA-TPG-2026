import React, { useState, useMemo } from "react";
import { School, getJenjang, getKabKota } from "../data/schoolsData";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Download,
  AlertCircle,
  Lock
} from "lucide-react";

interface SchoolTableProps {
  schools: School[];
  onUpdateSchool: (npsn: string, fields: Partial<School>) => void;
  onAddSchool: (school: Omit<School, "no">) => void;
  onDeleteSchool: (npsn: string) => void;
  onResetData: () => void;
  isAdmin?: boolean;
}

export default function SchoolTable({
  schools,
  onUpdateSchool,
  onAddSchool,
  onDeleteSchool,
  onResetData,
  isAdmin = false
}: SchoolTableProps) {
  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState<string>("ALL");
  const [filterKabKota, setFilterKabKota] = useState<string>("ALL");
  const [filterUpload, setFilterUpload] = useState<string>("ALL");
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add School Modal/Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchoolNpsn, setNewSchoolNpsn] = useState("");
  const [newSchoolNama, setNewSchoolNama] = useState("");
  const [newSchoolUpload, setNewSchoolUpload] = useState<"SUDAH" | "BELUM">("BELUM");
  const [newSchoolVerifikasi, setNewSchoolVerifikasi] = useState<"SUDAH" | "BELUM">("BELUM");
  const [formError, setFormError] = useState("");

  // Clean filters helper
  const resetFilters = () => {
    setSearchQuery("");
    setFilterJenjang("ALL");
    setFilterKabKota("ALL");
    setFilterUpload("ALL");
    setFilterVerifikasi("ALL");
    setCurrentPage(1);
  };

  // Filtered Schools Computation
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Search text matching
      const matchesSearch =
        school.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.npsn.includes(searchQuery);

      // Category matching
      const matchesJenjang = filterJenjang === "ALL" || school.jenjang === filterJenjang;
      const matchesKabKota = filterKabKota === "ALL" || school.kabKota === filterKabKota;
      const matchesUpload = filterUpload === "ALL" || school.statusUpload === filterUpload;
      const matchesVerifikasi =
        filterVerifikasi === "ALL" || school.statusVerifikasi === filterVerifikasi;

      return matchesSearch && matchesJenjang && matchesKabKota && matchesUpload && matchesVerifikasi;
    });
  }, [schools, searchQuery, filterJenjang, filterKabKota, filterUpload, filterVerifikasi]);

  // Pagination Math
  const totalItems = filteredSchools.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedSchools = useMemo(() => {
    return filteredSchools.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSchools, startIndex, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Add school submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newSchoolNpsn.trim() || !newSchoolNama.trim()) {
      setFormError("NPSN dan Nama Sekolah wajib diisi.");
      return;
    }

    if (newSchoolNpsn.length < 8) {
      setFormError("NPSN harus minimal 8 digit angka.");
      return;
    }

    // Check duplicate
    if (schools.some((s) => s.npsn === newSchoolNpsn.trim())) {
      setFormError(`Sekolah dengan NPSN ${newSchoolNpsn} sudah terdaftar.`);
      return;
    }

    const schoolNameUpper = newSchoolNama.trim().toUpperCase();

    onAddSchool({
      npsn: newSchoolNpsn.trim(),
      nama: schoolNameUpper,
      jenjang: getJenjang(schoolNameUpper),
      kabKota: getKabKota(schoolNameUpper),
      statusUpload: newSchoolUpload,
      statusVerifikasi: newSchoolVerifikasi
    });

    // Reset Form
    setNewSchoolNpsn("");
    setNewSchoolNama("");
    setNewSchoolUpload("BELUM");
    setNewSchoolVerifikasi("BELUM");
    setShowAddForm(false);
  };

  // Helper to trigger CSV download of active (filtered) list
  const handleExportCSV = () => {
    const headers = ["No", "NPSN", "Nama Sekolah", "Jenjang", "Kabupaten/Kota", "Status Upload Berkas", "Status Verifikasi"];
    const rows = filteredSchools.map((s, idx) => [
      idx + 1,
      `'${s.npsn}`, // Add single quote to prevent Excel from trimming leading zeros
      s.nama,
      s.jenjang,
      s.kabKota,
      s.statusUpload,
      s.statusVerifikasi
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_usulan_tpg_filtered_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Header and Quick Buttons */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            Database Usulan TPG DIBA GTK
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Menampilkan <span className="font-bold text-slate-700 font-mono">{filteredSchools.length}</span> dari{" "}
            <span className="font-medium text-slate-600 font-mono">{schools.length}</span> lembaga sekolah
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus size={16} />
              Tambah Sekolah
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold cursor-not-allowed opacity-75 shadow-xs transition"
              title="Tambah Sekolah dinonaktifkan (Mode Lihat Saja)"
            >
              <Lock size={13} className="text-slate-400" />
              Tambah Sekolah
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Download size={16} />
            Ekspor Rekap CSV
          </button>

          {isAdmin ? (
            <button
              onClick={onResetData}
              title="Reset ke Data Asli (194 Sekolah)"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl hover:text-slate-950 transition cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          ) : (
            <button
              disabled
              title="Sengaja dinonaktifkan (Mode Lihat Saja)"
              className="p-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl cursor-not-allowed opacity-75 transition"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Alert Banner */}
      {isAdmin ? (
        <div className="bg-emerald-50 border-b border-emerald-100/70 px-5 py-3 flex items-center gap-3 text-xs text-emerald-800">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="leading-relaxed">
            <strong>Mode Administrator Aktif:</strong> Anda memiliki akses penuh. Anda bisa klik status <strong>UPLOAD</strong> atau status <strong>VERIFIKASI</strong> di tabel di bawah untuk memperbarui datanya secara instan. Anda juga dapat menambah atau menghapus sekolah.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50/60 border-b border-amber-100/50 px-5 py-3 flex items-center gap-3 text-xs text-amber-800">
          <Lock size={14} className="text-amber-600 shrink-0" />
          <p className="leading-relaxed">
            <strong>Mode Pemantauan Terbatas (Read-Only):</strong> Fitur penambahan data, penghapusan data, dan manipulasi status usulan sengaja dinonaktifkan untuk publik. Data di bawah ini bersifat informatif untuk memantau progress pengunggahan berkas TPG.
          </p>
        </div>
      )}

      {/* Add School Drawer/Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-5 bg-indigo-50/50 border-b border-indigo-100/50 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Plus size={16} /> Tambah Data Sekolah Baru
            </h5>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">NPSN Sekolah</label>
              <input
                type="text"
                placeholder="Contoh: 20211505"
                value={newSchoolNpsn}
                onChange={(e) => setNewSchoolNpsn(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap & Wilayah Sekolah</label>
              <input
                type="text"
                placeholder="Contoh: SMAN 1 CIAMIS KABUPATEN CIAMIS"
                value={newSchoolNama}
                onChange={(e) => setNewSchoolNama(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Upload Berkas</label>
                <select
                  value={newSchoolUpload}
                  onChange={(e) => {
                    const val = e.target.value as "SUDAH" | "BELUM";
                    setNewSchoolUpload(val);
                    // If upload is BELUM, verifikasi must also be BELUM
                    if (val === "BELUM") {
                      setNewSchoolVerifikasi("BELUM");
                    }
                  }}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BELUM">BELUM</option>
                  <option value="SUDAH">SUDAH</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Verifikasi</label>
                <select
                  value={newSchoolVerifikasi}
                  disabled={newSchoolUpload === "BELUM"}
                  onChange={(e) => setNewSchoolVerifikasi(e.target.value as "SUDAH" | "BELUM")}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="BELUM">BELUM</option>
                  <option value="SUDAH">SUDAH</option>
                </select>
              </div>
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg font-medium">
              <AlertCircle size={14} />
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 shadow-sm transition"
            >
              Simpan Lembaga
            </button>
          </div>
        </form>
      )}

      {/* Filters Dashboard */}
      <div className="p-5 bg-slate-50/75 border-b border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <SlidersHorizontal size={14} className="text-slate-500" />
          <span>Alat Penyaringan & Pencarian Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / NPSN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Jenjang */}
          <select
            value={filterJenjang}
            onChange={(e) => {
              setFilterJenjang(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Semua Jenjang (SMAN/SMKS/SLB)</option>
            <option value="SMAN">SMAN</option>
            <option value="SMAS">SMAS</option>
            <option value="SMKN">SMKN</option>
            <option value="SMKS">SMKS</option>
            <option value="SLBN">SLBN</option>
            <option value="SLBS">SLBS</option>
          </select>

          {/* Filter Wilayah */}
          <select
            value={filterKabKota}
            onChange={(e) => {
              setFilterKabKota(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kabupaten / Kota</option>
            <option value="Kabupaten Ciamis">Kabupaten Ciamis</option>
            <option value="Kota Banjar">Kota Banjar</option>
            <option value="Kabupaten Pangandaran">Kabupaten Pangandaran</option>
          </select>

          {/* Filter Upload */}
          <select
            value={filterUpload}
            onChange={(e) => {
              setFilterUpload(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status Upload</option>
            <option value="SUDAH">Status Upload: SUDAH</option>
            <option value="BELUM">Status Upload: BELUM</option>
          </select>

          {/* Filter Verifikasi */}
          <select
            value={filterVerifikasi}
            onChange={(e) => {
              setFilterVerifikasi(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status Verifikasi</option>
            <option value="SUDAH">Status Verifikasi: SUDAH</option>
            <option value="BELUM">Status Verifikasi: BELUM</option>
          </select>
        </div>

        {/* Clear active filter indicator */}
        {(searchQuery || filterJenjang !== "ALL" || filterKabKota !== "ALL" || filterUpload !== "ALL" || filterVerifikasi !== "ALL") && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 italic">
              Menyaring dengan kriteria terpilih... ditemukan {filteredSchools.length} baris data.
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <th className="py-3.5 px-4 text-center w-14">No</th>
              <th className="py-3.5 px-4 w-28">NPSN</th>
              <th className="py-3.5 px-4 min-w-[280px]">Nama Sekolah</th>
              <th className="py-3.5 px-4 w-28">Jenjang</th>
              <th className="py-3.5 px-4 w-48">Kabupaten / Kota</th>
              <th className="py-3.5 px-4 text-center w-40">Status Upload Berkas</th>
              <th className="py-3.5 px-4 text-center w-40">Status Verifikasi</th>
              <th className="py-3.5 px-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedSchools.length > 0 ? (
              paginatedSchools.map((school, index) => {
                const globalIndex = startIndex + index + 1;

                return (
                  <tr key={school.npsn} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">{globalIndex}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{school.npsn}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{school.nama}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          school.jenjang.startsWith("SMK")
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : school.jenjang.startsWith("SMA")
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-orange-50 text-orange-700 border border-orange-100"
                        }`}
                      >
                        {school.jenjang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{school.kabKota}</td>

                     {/* Status Upload Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            const nextVal = school.statusUpload === "SUDAH" ? "BELUM" : "SUDAH";
                            onUpdateSchool(school.npsn, {
                              statusUpload: nextVal,
                              // If we toggle upload to BELUM, we must auto-toggle verifikasi to BELUM as well
                              statusVerifikasi: nextVal === "BELUM" ? "BELUM" : school.statusVerifikasi
                            });
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition hover:scale-105 border cursor-pointer ${
                            school.statusUpload === "SUDAH"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                          title="Klik untuk mengubah status upload berkas"
                        >
                          {school.statusUpload === "SUDAH" ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>SUDAH</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-amber-500" />
                              <span>BELUM</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border cursor-default ${
                            school.statusUpload === "SUDAH"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                          title={school.statusUpload === "SUDAH" ? "Sudah Unggah Berkas" : "Belum Unggah Berkas"}
                        >
                          {school.statusUpload === "SUDAH" ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>SUDAH</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-amber-500" />
                              <span>BELUM</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Verifikasi Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      {isAdmin ? (
                        <button
                          disabled={school.statusUpload === "BELUM"}
                          onClick={() => {
                            const nextVal = school.statusVerifikasi === "SUDAH" ? "BELUM" : "SUDAH";
                            onUpdateSchool(school.npsn, { statusVerifikasi: nextVal });
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition border disabled:opacity-50 disabled:hover:scale-100 ${
                            school.statusUpload === "BELUM"
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : school.statusVerifikasi === "SUDAH"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:scale-105 cursor-pointer"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:scale-105 cursor-pointer"
                          }`}
                          title={school.statusUpload === "BELUM" ? "Harus unggah berkas terlebih dahulu" : "Klik untuk mengubah status verifikasi"}
                        >
                          {school.statusVerifikasi === "SUDAH" && school.statusUpload === "SUDAH" ? (
                            <>
                              <CheckCircle2 size={12} className="text-indigo-600" />
                              <span>SUDAH</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-rose-500" />
                              <span>BELUM</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border cursor-default ${
                            school.statusUpload === "BELUM"
                              ? "bg-slate-100 text-slate-400 border-slate-200"
                              : school.statusVerifikasi === "SUDAH"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                          title={school.statusUpload === "BELUM" ? "Belum Unggah Berkas" : school.statusVerifikasi === "SUDAH" ? "Sudah Terverifikasi" : "Belum Terverifikasi"}
                        >
                          {school.statusVerifikasi === "SUDAH" && school.statusUpload === "SUDAH" ? (
                            <>
                              <CheckCircle2 size={12} className="text-indigo-600" />
                              <span>SUDAH</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-rose-500" />
                              <span>BELUM</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action column (Delete) */}
                    <td className="py-3.5 px-4 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus sekolah "${school.nama}"?`)) {
                              onDeleteSchool(school.npsn);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Lembaga"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed opacity-50"
                          title="Hapus lembaga dinonaktifkan (Mode Lihat Saja)"
                        >
                          <Lock size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SlidersHorizontal size={24} className="text-slate-300" />
                    <p className="font-semibold text-slate-600">Data Sekolah Tidak Ditemukan</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Silakan sesuaikan filter pencarian atau klik tombol "Hapus Semua Filter" di atas.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Tampilkan baris:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 px-2 py-1 rounded-md focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              dari <span className="font-semibold font-mono text-slate-700">{totalItems}</span> entri tersaring
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Sliding window for pagination numbers
              let pageNum = i + 1;
              if (currentPage > 3 && totalPages > 5) {
                if (currentPage + 2 <= totalPages) {
                  pageNum = currentPage - 3 + i;
                } else {
                  pageNum = totalPages - 5 + i + 1;
                }
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
