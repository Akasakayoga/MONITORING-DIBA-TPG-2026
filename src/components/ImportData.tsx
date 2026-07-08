import React, { useState, useRef } from "react";
import { School, getJenjang, getKabKota, cleanNpsn } from "../data/schoolsData";
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  Check,
  Database,
  ArrowRight,
  RefreshCw,
  Lock
} from "lucide-react";

interface ImportDataProps {
  onImportComplete: (imported: Omit<School, "no">[], mode: "merge" | "overwrite") => void;
  existingSchools: School[];
  isAdmin?: boolean;
  onSetAdmin?: (isAdmin: boolean) => void;
}

export default function ImportData({ onImportComplete, existingSchools, isAdmin = false, onSetAdmin }: ImportDataProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<Omit<School, "no">[]>([]);
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats on what would happen during Merge
  const mergeStats = React.useMemo(() => {
    if (parsedData.length === 0) return { updates: 0, newSchools: 0, noChange: 0 };
    let updates = 0;
    let newSchools = 0;
    let noChange = 0;

    parsedData.forEach((imported) => {
      const match = existingSchools.find((e) => e.npsn === imported.npsn);
      if (match) {
        if (
          match.statusUpload !== imported.statusUpload ||
          match.statusVerifikasi !== imported.statusVerifikasi ||
          match.nama !== imported.nama
        ) {
          updates += 1;
        } else {
          noChange += 1;
        }
      } else {
        newSchools += 1;
      }
    });

    return { updates, newSchools, noChange };
  }, [parsedData, existingSchools]);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // CSV parsing logic
  const handleFile = (file: File) => {
    setErrorMessage("");
    setSuccessMessage("");
    setParsedData([]);

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setErrorMessage("Format berkas tidak didukung. Silakan gunakan file CSV (.csv).");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        if (!text) {
          setErrorMessage("File kosong atau rusak.");
          return;
        }

        // Remove UTF-8 Byte Order Mark (BOM) if present
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setErrorMessage("CSV harus memiliki minimal satu baris tajuk (headers) dan satu baris data.");
          return;
        }

        // Auto-detect delimiter: comma vs semicolon vs tab
        let firstLine = lines[0] || "";
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        
        let delimiter = ",";
        if (semicolonCount > commaCount && semicolonCount > tabCount) {
          delimiter = ";";
        } else if (tabCount > commaCount && tabCount > semicolonCount) {
          delimiter = "\t";
        }

        // Parse CSV headers (lowercased & cleaned)
        const rawHeaders = firstLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
        
        // Find indexes for NPSN, Nama Sekolah, Status Upload, Status Verifikasi
        let npsnIdx = rawHeaders.findIndex((h) => h.includes("npsn"));
        let namaIdx = rawHeaders.findIndex((h) => h.includes("nama") || h.includes("sekolah") || h.includes("lembaga") || h.includes("nama_sekolah") || h.includes("nama sekolah"));
        let uploadIdx = rawHeaders.findIndex((h) => 
          h.includes("upload") || 
          h.includes("unggah") || 
          h.includes("berkas") || 
          h.includes("dokumen") ||
          h.includes("sptjm") ||
          h.includes("file") ||
          h.includes("upload_berkas") ||
          h.includes("status_upload")
        );
        let verifikasiIdx = rawHeaders.findIndex((h) => 
          h.includes("verifikasi") || 
          h.includes("verif") || 
          h.includes("setuju") || 
          h.includes("acc") ||
          h.includes("valid") ||
          h.includes("keterangan") ||
          h.includes("ket") ||
          h.includes("status_verifikasi")
        );

        // If uploadIdx is still -1, search for other common terms
        if (uploadIdx === -1) {
          uploadIdx = rawHeaders.findIndex((h) => h.includes("tpg") || h.includes("kirim"));
        }
        // If verifikasiIdx is still -1, look for generic status column (excluding matched upload column)
        if (verifikasiIdx === -1) {
          verifikasiIdx = rawHeaders.findIndex((h, idx) => idx !== uploadIdx && h.includes("status"));
        }

        // Robust fallbacks if header index matching failed
        if (rawHeaders.length >= 2) {
          if (npsnIdx === -1) npsnIdx = 0;
          if (namaIdx === -1) {
            namaIdx = npsnIdx === 0 ? 1 : 0;
          }
        }
        if (rawHeaders.length >= 4) {
          if (uploadIdx === -1) {
            // Find an unused index for upload
            uploadIdx = [0, 1, 2, 3].find((i) => i !== npsnIdx && i !== namaIdx) ?? 2;
          }
          if (verifikasiIdx === -1) {
            // Find the remaining unused index for verification
            verifikasiIdx = [0, 1, 2, 3].find((i) => i !== npsnIdx && i !== namaIdx && i !== uploadIdx) ?? 3;
          }
        }

        if (npsnIdx === -1 || namaIdx === -1) {
          setErrorMessage("Kolom 'NPSN' dan 'Nama Sekolah' tidak terdeteksi. Pastikan file CSV memiliki baris header.");
          return;
        }

        const tempSchools: Omit<School, "no">[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty rows

          // Simple CSV parser that handles quotes and the detected delimiter
          const columns: string[] = [];
          let currentField = "";
          let insideQuotes = false;

          for (let charIdx = 0; charIdx < line.length; charIdx++) {
            const char = line[charIdx];
            if (char === '"' || char === "'") {
              insideQuotes = !insideQuotes;
            } else if (char === delimiter && !insideQuotes) {
              columns.push(currentField.trim());
              currentField = "";
            } else {
              currentField += char;
            }
          }
          columns.push(currentField.trim());

          // Clean values
          const rawNpsn = cleanNpsn(columns[npsnIdx]?.replace(/^["']|["']$/g, "") || "");
          const nama = columns[namaIdx]?.replace(/^["']|["']$/g, "").toUpperCase() || "";

          if (!rawNpsn || !nama) continue; // Skip invalid rows

          // Parse Upload Status
          let statusUpload: "SUDAH" | "BELUM" = "BELUM";
          if (uploadIdx !== -1 && uploadIdx < columns.length) {
            const upVal = columns[uploadIdx]?.replace(/^["']|["']$/g, "").trim().toUpperCase();
            if (
              upVal === "SUDAH" || 
              upVal === "YA" || 
              upVal === "YES" || 
              upVal === "1" || 
              upVal === "TRUE" || 
              upVal === "Y" ||
              upVal === "OK" ||
              upVal === "DONE" ||
              upVal === "TERKIRIM"
            ) {
              statusUpload = "SUDAH";
            }
          }

          // Parse Verifikasi Status
          let statusVerifikasi: "SUDAH" | "BELUM" = "BELUM";
          if (verifikasiIdx !== -1 && verifikasiIdx < columns.length) {
            const verVal = columns[verifikasiIdx]?.replace(/^["']|["']$/g, "").trim().toUpperCase();
            if (
              verVal === "SUDAH" || 
              verVal === "YA" || 
              verVal === "YES" || 
              verVal === "1" || 
              verVal === "TRUE" || 
              verVal === "Y" ||
              verVal === "OK" ||
              verVal === "DONE" ||
              verVal === "VERIFIED" ||
              verVal === "TERVERIFIKASI"
            ) {
              statusVerifikasi = "SUDAH";
            }
          }

          // If Upload is BELUM, Verifikasi MUST be BELUM
          if (statusUpload === "BELUM") {
            statusVerifikasi = "BELUM";
          }

          tempSchools.push({
            npsn: rawNpsn,
            nama: nama,
            jenjang: getJenjang(nama),
            kabKota: getKabKota(nama),
            statusUpload: statusUpload,
            statusVerifikasi: statusVerifikasi
          });
        }

        if (tempSchools.length === 0) {
          setErrorMessage("Tidak ada data sekolah valid yang berhasil diproses dari file CSV.");
        } else {
          setParsedData(tempSchools);
        }
      } catch (err) {
        setErrorMessage("Gagal memproses file. Pastikan struktur tabel CSV valid.");
      }
    };

    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (parsedData.length === 0) return;
    onImportComplete(parsedData, importMode);
    setSuccessMessage(
      `Berhasil mengimpor ${parsedData.length} data sekolah dengan metode ${
        importMode === "merge" ? "Gabung & Update" : "Ganti Semua"
      }.`
    );
    setParsedData([]);
    setFileName("");
  };

  // Simple template generator for CSV
  const handleDownloadTemplate = () => {
    const headers = ["NPSN", "Nama Sekolah", "Status Upload Berkas", "Status Verifikasi"];
    const sampleRows = [
      ["'10203040", "SMAN 1 CONTOH KABUPATEN CIAMIS", "SUDAH", "SUDAH"],
      ["'50607080", "SMKS CONTOH BANJAR KOTA BANJAR", "SUDAH", "BELUM"],
      ["'90807060", "SLBS CONTOH PANGANDARAN KABUPATEN PANGANDARAN", "BELUM", "BELUM"]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...sampleRows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "templat_import_diba_gtk.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Read-Only Alert Banner covering full width of the view */}
      {isAdmin ? (
        <div className="lg:col-span-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800 shadow-xs">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div>
            <p className="font-bold">Mode Administrator Aktif (Akses Sinkronisasi Terbuka)</p>
            <p className="mt-0.5 text-slate-600 font-medium">
              Anda memiliki wewenang untuk memperbarui pangkalan data melalui unggahan CSV. Anda dapat memilih metode penggabungan (merge) atau penulisan ulang (overwrite), lalu mengklik tombol <strong>Terapkan Sinkronisasi Data</strong> untuk menyimpan perubahan.
            </p>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-3 bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-amber-800 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Mode Pemantauan Terbatas (Read-Only)</p>
              <p className="mt-0.5 text-slate-600 font-medium leading-relaxed">
                Halaman sinkronisasi CSV saat ini dinonaktifkan untuk publik. Anda dapat mempratinjau data sekolah dari CSV di sini. Untuk mengaktifkan penyimpanan data ke database, silakan masukkan Passcode Administrator.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
            <input
              type="password"
              placeholder="Passcode Admin..."
              className="px-2.5 py-1.5 border border-amber-200 bg-white rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 w-36 text-slate-700 font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim() === "ginginfaujiyanti") {
                    onSetAdmin?.(true);
                  } else {
                    alert("Passcode salah! Silakan coba lagi.");
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement);
                if (input && input.value.trim() === "ginginfaujiyanti") {
                  onSetAdmin?.(true);
                } else {
                  alert("Passcode salah! Silakan coba lagi.");
                }
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
            >
              Buka Akses
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone & Config */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm">Unggah File Pembaruan Data</h4>
          <p className="text-xs text-slate-400">
            Unggah file CSV baru untuk menyinkronkan status verifikasi sekolah atau menambah daftar baru.
          </p>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition min-h-[180px] ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Tarik & Lepas file di sini, atau Klik untuk memilih</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Mendukung format .csv / CSV standar excel</p>
          </div>
        </div>

        {fileName && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <FileCheck size={16} className="text-indigo-600" />
              <span className="truncate max-w-[150px] font-mono">{fileName}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {parsedData.length} baris
            </span>
          </div>
        )}

        {/* Template download & help */}
        <div className="p-4 bg-indigo-50/30 border border-indigo-100/30 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <HelpCircle size={14} className="text-indigo-600" />
            <span>Format Struktur Kolom CSV</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Pastikan kolom CSV setidaknya menyertakan header: <strong>NPSN</strong>, <strong>Nama Sekolah</strong>, <strong>Status Upload Berkas</strong>, dan <strong>Status Verifikasi</strong>.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
          >
            Unduh Contoh Templat CSV
          </button>
        </div>

        {/* Mode Config */}
        {parsedData.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-600">Pilih Metode Sinkronisasi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode("merge")}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  importMode === "merge"
                    ? "border-indigo-500 bg-indigo-50/20 text-indigo-950 shadow-xs"
                    : "border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Database size={12} className={importMode === "merge" ? "text-indigo-600" : ""} />
                  <span className="text-xs font-bold">Gabung & Update</span>
                </div>
                <span className="text-[9px] text-slate-400">
                  Update status sekolah lama, dan tambahkan sekolah baru jika belum ada.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode("overwrite")}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  importMode === "overwrite"
                    ? "border-rose-500 bg-rose-50/10 text-rose-950 shadow-xs"
                    : "border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <RefreshCw size={12} className={importMode === "overwrite" ? "text-rose-600" : ""} />
                  <span className="text-xs font-bold text-rose-950">Ganti Semua</span>
                </div>
                <span className="text-[9px] text-slate-400">
                  Hapus semua database lama dan ganti seutuhnya dengan isi file baru.
                </span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl font-medium">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl font-medium">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {parsedData.length > 0 && (
          isAdmin ? (
            <button
              onClick={handleApplyImport}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              Terapkan Sinkronisasi Data
              <ArrowRight size={14} />
            </button>
          ) : (
            <div className="space-y-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
              <button
                disabled
                className="w-full py-2.5 bg-slate-200 border border-slate-300 text-slate-400 rounded-xl text-xs font-bold transition cursor-not-allowed flex items-center justify-center gap-2"
                title="Sinkronisasi dinonaktifkan (Mode Lihat Saja)"
              >
                <Lock size={14} className="text-slate-400" />
                Terapkan Sinkronisasi (Mode Lihat Saja)
              </button>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Masukkan Passcode Admin untuk Menyimpan:</label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    placeholder="Masukkan Passcode..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        if (val.trim() === "ginginfaujiyanti") {
                          onSetAdmin?.(true);
                        } else {
                          alert("Passcode salah! Silakan coba lagi.");
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      if (input && input.value.trim() === "ginginfaujiyanti") {
                        onSetAdmin?.(true);
                      } else {
                        alert("Passcode salah! Silakan coba lagi.");
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                  >
                    Buka
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Preview Section */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full min-h-[400px]">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Pratinjau Data Impor</h4>
            <p className="text-xs text-slate-400">
              Menampilkan {parsedData.length > 0 ? parsedData.length : 0} data sekolah terpindah dari CSV.
            </p>
          </div>
          {parsedData.length > 0 && importMode === "merge" && (
            <div className="flex gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                {mergeStats.updates} Diperbarui
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                {mergeStats.newSchools} Lembaga Baru
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-bold border border-slate-200">
                {mergeStats.noChange} Tetap
              </span>
            </div>
          )}
        </div>

        {parsedData.length > 0 ? (
          <div className="overflow-auto flex-1 max-h-[360px] border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100 sticky top-0">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-24">NPSN</th>
                  <th className="py-2.5 px-3">Nama Sekolah</th>
                  <th className="py-2.5 px-3 w-20">Jenjang</th>
                  <th className="py-2.5 px-3 w-32">Status Upload</th>
                  <th className="py-2.5 px-3 w-32">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parsedData.map((row, idx) => {
                  const alreadyExists = existingSchools.some((e) => e.npsn === row.npsn);

                  return (
                    <tr
                      key={row.npsn + "-" + idx}
                      className={`hover:bg-slate-50/50 ${
                        importMode === "merge" && !alreadyExists ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{row.npsn}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{row.nama}</span>
                          {importMode === "merge" && !alreadyExists && (
                            <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                              BARU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-flex px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500">
                          {row.jenjang}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.statusUpload === "SUDAH"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {row.statusUpload}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.statusVerifikasi === "SUDAH"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {row.statusVerifikasi}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 p-8 border border-slate-100 rounded-xl bg-slate-50/20">
            <Database size={32} className="text-slate-300" />
            <p className="font-bold text-slate-600">Pratinjau Data Kosong</p>
            <p className="text-xs text-slate-400 text-center max-w-sm">
              Tarik atau pilih file CSV di panel sebelah kiri untuk melihat struktur tabel data sekolah sebelum melakukan sinkronisasi database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
