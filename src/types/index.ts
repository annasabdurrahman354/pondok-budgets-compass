// Enums
export enum UserRole {
  ADMIN_PUSAT = "admin_pusat",
  ADMIN_PONDOK = "admin_pondok",
}

export enum PondokJenis {
  PPM = "ppm",
  PPPM = "pppm",
  BOARDING = "boarding",
}

export enum PengurusJabatan {
  KETUA = "ketua",
  WAKIL_KETUA = "wakil_ketua",
  PINISEPUH = "pinisepuh",
  SEKRETARIS = "sekretaris",
  BENDAHARA = "bendahara",
  GURU = "guru",
}

export enum DocumentStatus {
  DIAJUKAN = "diajukan",
  DITERIMA = "diterima",
  REVISI = "revisi",
}

// User related types
export interface UserProfile {
  id: string;
  email: string;
  nomor_telepon: string;
  nama: string;
  role: UserRole;
  pondok_id: string | null;
  pondok?: Pondok;
  created_at?: string;
  updated_at?: string;
}

// Location related types
export interface Provinsi {
  id: string;
  nama: string;
}

export interface Kota {
  id: string;
  nama: string;
  provinsi_id: string;
}

export interface DaerahSambung {
  id: string;
  nama: string;
}

// Pondok related types
export interface Pondok {
  id: string;
  nama: string;
  nomor_telepon: string;
  jenis: PondokJenis;
  alamat: string;
  kode_pos: string;
  kota_id: string;
  provinsi_id: string;
  daerah_sambung_id: string;
  updated_at: string;
  accepted_at: string | null;
  pengurus?: Pengurus[];
  kota?: Kota;
  provinsi?: Provinsi;
  daerah_sambung?: DaerahSambung;
}

export interface Pengurus {
  id?: string;
  pondok_id: string;
  nama: string;
  nomor_telepon: string;
  jabatan: PengurusJabatan;
}

// Time period related types
export interface Periode {
  id: string; // YYYYMM
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

export interface PeriodeFormData {
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

// Document related types
export interface RAB {
  id?: string;
  pondok_id: string;
  periode_id: string;
  status: DocumentStatus;
  saldo_awal: number;
  rencana_pemasukan: number;
  rencana_pengeluaran: number;
  dokumen_path: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
  pesan_revisi: string | null;
  pondok?: Pondok;
  periode?: Periode;
}

export interface LPJ {
  id?: string;
  pondok_id: string;
  periode_id: string;
  status: DocumentStatus;
  saldo_awal: number;
  rencana_pemasukan: number;
  rencana_pengeluaran: number;
  realisasi_pemasukan: number;
  realisasi_pengeluaran: number;
  sisa_saldo: number;
  dokumen_path: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
  pesan_revisi: string | null;
  pondok?: Pondok;
  periode?: Periode;
}

// Mock data
export const mockProvinsi: Provinsi[] = [
  { id: "p1", nama: "DKI Jakarta" },
  { id: "p2", nama: "Jawa Barat" },
  { id: "p3", nama: "Jawa Tengah" },
  { id: "p4", nama: "Jawa Timur" },
  { id: "p5", nama: "DIY Yogyakarta" },
];

export const mockKota: Kota[] = [
  { id: "k1", nama: "Jakarta Pusat", provinsi_id: "p1" },
  { id: "k2", nama: "Jakarta Barat", provinsi_id: "p1" },
  { id: "k3", nama: "Bandung", provinsi_id: "p2" },
  { id: "k4", nama: "Bogor", provinsi_id: "p2" },
  { id: "k5", nama: "Semarang", provinsi_id: "p3" },
  { id: "k6", nama: "Solo", provinsi_id: "p3" },
  { id: "k7", nama: "Surabaya", provinsi_id: "p4" },
  { id: "k8", nama: "Malang", provinsi_id: "p4" },
  { id: "k9", nama: "Yogyakarta", provinsi_id: "p5" },
];

export const mockDaerahSambung: DaerahSambung[] = [
  { id: "d1", nama: "Daerah Sambung 1" },
  { id: "d2", nama: "Daerah Sambung 2" },
  { id: "d3", nama: "Daerah Sambung 3" },
  { id: "d4", nama: "Daerah Sambung 4" },
];

export const mockPeriode: Periode = {
  id: "202505", 
  tahun: 2025,
  bulan: 5,
  awal_rab: "2025-04-01T00:00:00Z",
  akhir_rab: "2025-04-15T23:59:59Z",
  awal_lpj: "2025-05-01T00:00:00Z",
  akhir_lpj: "2025-05-15T23:59:59Z",
};
