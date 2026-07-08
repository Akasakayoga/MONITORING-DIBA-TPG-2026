export interface School {
  no: number;
  npsn: string;
  nama: string;
  jenjang: "SMAN" | "SMAS" | "SMKN" | "SMKS" | "SLBN" | "SLBS" | "Lainnya";
  kabKota: "Kabupaten Ciamis" | "Kota Banjar" | "Kabupaten Pangandaran" | "Lainnya";
  statusUpload: "SUDAH" | "BELUM";
  statusVerifikasi: "SUDAH" | "BELUM";
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  schoolName: string;
  npsn: string;
  type: "upload" | "verifikasi" | "import" | "sistem";
  message: string;
  oldValue?: string;
  newValue?: string;
  isRead: boolean;
}

// Function to programmatically determine Jenjang from school name
export function getJenjang(nama: string): School["jenjang"] {
  const upper = nama.toUpperCase();
  if (upper.startsWith("SMAN")) return "SMAN";
  if (upper.startsWith("SMAS")) return "SMAS";
  if (upper.startsWith("SMKN")) return "SMKN";
  if (upper.startsWith("SMKS")) return "SMKS";
  if (upper.startsWith("SLBN")) return "SLBN";
  if (upper.startsWith("SLBS")) return "SLBS";
  return "Lainnya";
}

// Function to programmatically determine Kab/Kota from school name
export function getKabKota(nama: string): School["kabKota"] {
  const upper = nama.toUpperCase();
  if (upper.includes("KABUPATEN CIAMIS") || upper.includes("CIAMIS")) return "Kabupaten Ciamis";
  if (upper.includes("KOTA BANJAR") || upper.includes("BANJAR")) return "Kota Banjar";
  if (upper.includes("KABUPATEN PANGANDARAN") || upper.includes("PANGANDARAN")) return "Kabupaten Pangandaran";
  return "Lainnya";
}

// Helper to clean NPSN (remove leading single quote)
export function cleanNpsn(npsn: string): string {
  return npsn.replace(/^'/, "");
}

export const rawSchoolsData: Array<{ no: number; npsn: string; nama: string; statusUpload: "SUDAH" | "BELUM"; statusVerifikasi: "SUDAH" | "BELUM" }> = [
  // Page 1
  { no: 1, npsn: "69988146", nama: "SMKS AS SULTHONIAH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 2, npsn: "20229665", nama: "SMKN 2 BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 3, npsn: "69786620", nama: "SLBS DARUL ISHLAH KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 4, npsn: "70003343", nama: "SMKN CIMERAK KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 5, npsn: "20254620", nama: "SMKN 1 CIJULANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 6, npsn: "20258211", nama: "SLBS BAG ABC MUHAMMADIYAH BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 7, npsn: "69926941", nama: "SMKN 2 PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 8, npsn: "20211499", nama: "SMAN 3 CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 9, npsn: "20211526", nama: "SMKS PUTERA PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 10, npsn: "69759219", nama: "SMKN 1 PANJALU KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 11, npsn: "20267661", nama: "SLBS BAG ABC PUTRA PASUNDAN 1 KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 12, npsn: "20211525", nama: "SMKS PGRI CIKONENG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 13, npsn: "20251810", nama: "SMKN 1 RAJADESA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 14, npsn: "20225278", nama: "SMAN 3 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 15, npsn: "20238437", nama: "SMAN 1 SINDANGKASIH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 16, npsn: "20233694", nama: "SMKN 1 KAWALI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 17, npsn: "69762706", nama: "SMKS TRI BINTANG PURWADADI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 18, npsn: "20252287", nama: "SMAN 1 CIMARAGAS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 19, npsn: "70024225", nama: "SMAS TAHFIDZ ANHARUL ULUM KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 20, npsn: "20256408", nama: "SMAS IBNU SIENA CIKONENG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 21, npsn: "20211505", nama: "SMAN 1 PANAWANGAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 22, npsn: "20211565", nama: "SMAN 1 CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 23, npsn: "20211490", nama: "SMAN 1 KAWALI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 24, npsn: "20211512", nama: "SMKN 2 CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 25, npsn: "20251798", nama: "SMAS PLUS INFORMATIKA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 26, npsn: "20253667", nama: "SMKS AL AZHAR BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 27, npsn: "60728541", nama: "SMKS BHAKTI KENCANA PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 28, npsn: "20258272", nama: "SLBN WIDI ASIH KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 29, npsn: "20254638", nama: "SMKS AL FATTAH BOJONGMENGGER KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 30, npsn: "20253097", nama: "SMKN 1 RANCAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 31, npsn: "20256282", nama: "SMKN 1 PADAHERANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 32, npsn: "20270894", nama: "SLBS HARAPAN SAKINAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 33, npsn: "20253142", nama: "SMKS FARMASI PASUNDAN KAWALI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 34, npsn: "69759288", nama: "SMKS AL HUDA SADANANYA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },

  // Page 2
  { no: 35, npsn: "20211566", nama: "SMKS MUHAMMADIYAH KAWALI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 36, npsn: "20258212", nama: "SLBS YPK CIJULANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 37, npsn: "20225279", nama: "SMAN 1 BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 38, npsn: "20263126", nama: "SLBN SINDANGSARI CIKONENG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 39, npsn: "60728393", nama: "SMKN 4 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 40, npsn: "69976651", nama: "SMKS MA ARIF NURUL HUDA UTSMANIYYAH LUMBUNG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 41, npsn: "20211578", nama: "SMAN 1 CIHAURBEUTI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 42, npsn: "70013944", nama: "SMAN 1 PANUMBANGAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 43, npsn: "20254634", nama: "SMKS AL HUDA TURALAK KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 44, npsn: "20253152", nama: "SMAN 1 SUKADANA KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 45, npsn: "20251964", nama: "SMAS YRM CIHAWAR KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 46, npsn: "69987056", nama: "SMKN 1 KALIPUCANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 47, npsn: "69759272", nama: "SMKS NU PELITA NUSANTARA KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 48, npsn: "20263125", nama: "SLBN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 49, npsn: "69756872", nama: "SLBS TAMAN RAFLESIA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 50, npsn: "20211530", nama: "SMKS LPT CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 51, npsn: "20258459", nama: "SLBN CIJEUNGJING KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 52, npsn: "20254624", nama: "SMKS SILIWANGI AMS BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 53, npsn: "20254663", nama: "SMKN 3 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 54, npsn: "20211503", nama: "SMAN 1 MANGUNJAYA KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 55, npsn: "69759274", nama: "SMKS VIP MAMBAUS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 56, npsn: "20211560", nama: "SMAS MUHAMMADIYAH PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 57, npsn: "69892759", nama: "SMKS KARYA NASIONAL SINDANGKASIH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 58, npsn: "20254646", nama: "SMKS AL IKHLAS SUSURU PANAWANGAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 59, npsn: "20254632", nama: "SMKS AL KAUTSAR KALIPUCANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 60, npsn: "20211562", nama: "SMAS PLUS MULTAZAM KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 61, npsn: "20237887", nama: "SMKS TARUNA BANGSA KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 62, npsn: "20263114", nama: "SLBS AL HUDA SADANANYA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 63, npsn: "20225280", nama: "SMAN 2 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 64, npsn: "60724655", nama: "SLBN BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 65, npsn: "69946200", nama: "SMKS PELITA BANGSA MANGUNJAYA KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 66, npsn: "20258330", nama: "SLBS BAG BC BINA HARAPAN PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 67, npsn: "20211511", nama: "SMKN 1 PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 68, npsn: "70001826", nama: "SMAN 1 CIGUGUR KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 69, npsn: "20254625", nama: "SMKS BHAKTI KENCANA CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },

  // Page 3
  { no: 70, npsn: "69920674", nama: "SMKS MA ARIF NU TARBIYATUL HUDA CIMARAGAS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 71, npsn: "70033729", nama: "SLBN CIMERAK KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 72, npsn: "69759273", nama: "SMKS KESEHATAN PARIGI KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 73, npsn: "69883502", nama: "SMKS BAKTI KARYA PARIGI KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 74, npsn: "69899974", nama: "SMKS PLUS MAARIF NU PARIGI KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 75, npsn: "69947412", nama: "SMKS DHARMA AGUNG SIDAMULIH KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 76, npsn: "20225283", nama: "SMKS PASUNDAN 1 BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 77, npsn: "69949542", nama: "SMKS AL ASYARIAH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 78, npsn: "69954421", nama: "SMKS NU 2 BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 79, npsn: "69974135", nama: "SMKS BANJAR MANDIRI KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 80, npsn: "70042032", nama: "SMAS AL MANSHUR KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 81, npsn: "20225281", nama: "SMKS HIKMAH BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 82, npsn: "20211498", nama: "SMKS MUHAMMADIYAH 2 BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 83, npsn: "20211491", nama: "SMAN 1 BAREGBEG KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 84, npsn: "20254636", nama: "SMKS BAHRUL ULUUM KAWALI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 85, npsn: "69952943", nama: "SMKS MA ARIF NU AL MUZAYYIN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 86, npsn: "69758345", nama: "SMKS SAMUDERA BUANA LANGKAPLANCAR KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 87, npsn: "20211563", nama: "SMAN 1 BANJARSARI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 88, npsn: "20254647", nama: "SMKS MAARIF SABILUNNAJAT RANCAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 89, npsn: "20252464", nama: "SMAS AR RISSALAH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 90, npsn: "20211509", nama: "SMAN 1 RANCAH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 91, npsn: "20211510", nama: "SMKN 1 CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 92, npsn: "20253143", nama: "SMKS YASIRA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 93, npsn: "69894474", nama: "SMKS IT IBNU AHKAM KALIPUCANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 94, npsn: "69988141", nama: "SMAS TERPADU CIKANYERE KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 95, npsn: "20263130", nama: "SLBN RANCAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 96, npsn: "69950863", nama: "SMKS MANARUL HUDA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 97, npsn: "69935515", nama: "SMAS KSATRIA NUSANTARA PADAHERANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 98, npsn: "69920278", nama: "SMKS MUHAMMADIYAH MANGUNJAYA KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 99, npsn: "20272134", nama: "SMKS PASUNDAN PADAHERANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 100, npsn: "69928466", nama: "SMKS PLUS DARUNNAJAH PADAHERANG KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 101, npsn: "20254630", nama: "SMKS TEKNOLOGI MODERN KALIPUCANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 102, npsn: "20211497", nama: "SMKS MUHAMMADIYAH 1 BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 103, npsn: "20263279", nama: "SMAN 1 LUMBUNG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 104, npsn: "20263118", nama: "SLBS BINA HARAPAN BANGSA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },

  // Page 4
  { no: 105, npsn: "69972417", nama: "SMKS TUNAS HARAPAN PURWADADI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 106, npsn: "20263285", nama: "SMKS AL IHSAN PAMARICAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 107, npsn: "69774870", nama: "SMKS AL HUSNA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 108, npsn: "70040620", nama: "SMAS ISLAM TERPADU AR ROFI`I JATILUHUR KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 109, npsn: "60728389", nama: "SMKS MAARIF NU BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 110, npsn: "20252465", nama: "SMAS PLUS DARUSSALAM KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 111, npsn: "20211492", nama: "SMKS HEPWETI CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 112, npsn: "20263113", nama: "SLBS AL BAROKAH BAREGBEG KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 113, npsn: "20251847", nama: "SMAN 1 LANGKAPLANCAR KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 114, npsn: "20263119", nama: "SLBS BUDI BAKTI I KAWALI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 115, npsn: "20211529", nama: "SMKS LPS 1 CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 116, npsn: "69787069", nama: "SMKS AL MASTURIYAH LANGKAPLANCAR KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 117, npsn: "20272055", nama: "SMKS MAARIF NU CIHAURBEUTI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 118, npsn: "20254621", nama: "SMKN 1 CIPAKU KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 119, npsn: "69882355", nama: "SMAS TERPADU DAMPASAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 120, npsn: "70035433", nama: "SLBS YMK ASY SYIFA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 121, npsn: "20254622", nama: "SMKS GALUH RAHAYU SINDANGKASIH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 122, npsn: "69935069", nama: "SMKS MIFTAHUL IHSAN KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 123, npsn: "20211508", nama: "SMAN 1 PARIGI KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 124, npsn: "20225276", nama: "SMAS AL AZHAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 125, npsn: "69988140", nama: "SMAS ERHA JATINAGARA KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 126, npsn: "20263121", nama: "SLBS BUDI BAKTI 2 KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 127, npsn: "20255008", nama: "SMAN 2 BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 128, npsn: "20251831", nama: "SMKS LPS 2 CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 129, npsn: "69882394", nama: "SMKS MIFTAHUL ULUM CIMERAK KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 130, npsn: "70034375", nama: "SLBN CIHAURBEUTI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 131, npsn: "20211506", nama: "SMAN 1 PANGANDARAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 132, npsn: "20263295", nama: "SMKS MIFTAHUL HUDA II JATINAGARA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 133, npsn: "60726572", nama: "SMKS BHAKTI KENCANA BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 134, npsn: "20211524", nama: "SMKS PASUNDAN CIJULANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 135, npsn: "20254643", nama: "SMKS INFORMATIKA AL IHYA BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 136, npsn: "69946268", nama: "SMKS AL IHSAN LANGKAPLANCAR KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 137, npsn: "69968464", nama: "SMKN 1 PANUMBANGAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 138, npsn: "20252466", nama: "SMKS MIFTAHUSSALAM KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 139, npsn: "60724654", nama: "SLBN LANGENSARI KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },

  // Page 5
  { no: 140, npsn: "70040370", nama: "SMKS MA ARIF NU KAWALI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 141, npsn: "69946301", nama: "SMKS RAHAYU IHSANI KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 142, npsn: "20211500", nama: "SMAN 2 CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 143, npsn: "20225275", nama: "SMKS PASUNDAN 2 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 144, npsn: "69995497", nama: "SMKS MA`ARIF NU BANJARSARI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 145, npsn: "20263274", nama: "SMAS AL HASAN BANJARSARI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 146, npsn: "20211504", nama: "SMAN 1 PAMARICAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 147, npsn: "70006980", nama: "SMAS TERPADU AL MU`AAWANAH KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 148, npsn: "20254633", nama: "SMKS MAARIF NU CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 149, npsn: "20225284", nama: "SMKS BINA PUTERA BANJAR KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 150, npsn: "69948105", nama: "SMKS MAARIF NU CIPAKU KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 151, npsn: "69995692", nama: "SMAS INFORMATIKA NURUL BAYAN KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 152, npsn: "69898931", nama: "SLBS SAASIH CIGUGUR KABUPATEN PANGANDARAN", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 153, npsn: "20258273", nama: "SLBS YPI AL MAGHFIROH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 154, npsn: "20254644", nama: "SMKS NURUL HUDA PANUMBANGAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 155, npsn: "69976927", nama: "SMKS MA ARIF RIYADLUSH SHOLAWAT KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 156, npsn: "70003746", nama: "SMKS PETERNAKAN CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 157, npsn: "70029513", nama: "SLBS DARUL HIDAYAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 158, npsn: "69831550", nama: "SMKS ASY SYIFA 02 PARIGI KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 159, npsn: "20254627", nama: "SMKS TERPADU YAKPIDATEK KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 160, npsn: "69759289", nama: "SLBS PANCARAN IMAN CIAMIS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 161, npsn: "70031960", nama: "SMKS TERPADU AL HASAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 162, npsn: "20225282", nama: "SMKN 1 BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 163, npsn: "69907851", nama: "SMKS MA ARIF NU CIDOLOG KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 164, npsn: "20252324", nama: "SMAN 1 CISAGA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 165, npsn: "69972351", nama: "SMKS AL ISTIQOMAH RANCAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 166, npsn: "69946799", nama: "SMKS MAARIF CIJULANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 167, npsn: "69965478", nama: "SMKS PUTRA PANJALU KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 168, npsn: "20211502", nama: "SMAN 1 LAKBOK KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 169, npsn: "60729212", nama: "SLBS MEKAR MANDIRI BATULAWANG KOTA BANJAR", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 170, npsn: "69786494", nama: "SLBS AS SURUR RAJADESA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 171, npsn: "69947388", nama: "SMKS INDUSTRI PERUNGGASAN PANJALU (IPP) KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 172, npsn: "70051695", nama: "SMAS IT MD FATHAHILLAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 173, npsn: "20263116", nama: "SLBS BAITURRAHMAN CISAGA KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 174, npsn: "70055164", nama: "SMKN 1 TAMBAKSARI KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },

  // Page 6
  { no: 175, npsn: "69954591", nama: "SMKS MA ARIF NU AL MUSHLIHUUN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 176, npsn: "69893499", nama: "SMKS NURUL HUDA AL GINA KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 177, npsn: "69984154", nama: "SMKS DAARUL MUTTAQIEN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 178, npsn: "20263299", nama: "SMKS PLUS MULTAZAM PANAWANGAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 179, npsn: "20263112", nama: "SLBS AGROWISATA SHALEHA PANJALU KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 180, npsn: "69930735", nama: "SLBS FIRDAUS KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 181, npsn: "69894020", nama: "SMKS HIDAYAH PAKUAN KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 182, npsn: "20263115", nama: "SLBS AMANAH KAWALI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 183, npsn: "69863248", nama: "SLBS MANDIRI PANUMBANGAN KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 184, npsn: "70010787", nama: "SMAS NUSANTARA CIAMIS KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 185, npsn: "20258344", nama: "SLBS DARMA PUTRA KALIPUCANG KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 186, npsn: "20254187", nama: "SMKS TEKNOLOGI YAYASAN AL FALAH KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 187, npsn: "69945332", nama: "SLBS AL FALAH KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 188, npsn: "20268924", nama: "SMKS PASAWAHAN BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 189, npsn: "70011225", nama: "SMAS AL FADLIL KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 190, npsn: "20254648", nama: "SMKS MUHAMMADIYAH 3 BANJARSARI KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 191, npsn: "20276075", nama: "SMKS AL MANAR KABUPATEN CIAMIS", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 192, npsn: "70043021", nama: "SMAS ISLAM TERPADU IRFANI QURANICPRENEUR BILINGUAL SCHOOL KABUPATEN CIAMIS", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" },
  { no: 193, npsn: "69985878", nama: "SMKS NU AL ITQON CIMERAK KABUPATEN PANGANDARAN", statusUpload: "BELUM", statusVerifikasi: "BELUM" },
  { no: 194, npsn: "20225285", nama: "SMKS MUHAMMADIYAH BANJAR KOTA BANJAR", statusUpload: "SUDAH", statusVerifikasi: "SUDAH" }
];

export const initialSchools: School[] = rawSchoolsData.map((item) => ({
  no: item.no,
  npsn: cleanNpsn(item.npsn),
  nama: item.nama,
  jenjang: getJenjang(item.nama),
  kabKota: getKabKota(item.nama),
  statusUpload: item.statusUpload,
  statusVerifikasi: item.statusVerifikasi
}));
