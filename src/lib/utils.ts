
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DocumentStatus, PengurusJabatan, PondokJenis } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPeriode(periodeId: string): string {
  const year = periodeId.substring(0, 4);
  const month = periodeId.substring(4, 6);
  
  const monthNames = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
  ];
  
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}

export function getStatusBadgeClass(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.DIAJUKAN:
      return "status-badge-diajukan";
    case DocumentStatus.DITERIMA:
      return "status-badge-diterima";
    case DocumentStatus.REVISI:
      return "status-badge-revisi";
    default:
      return "";
  }
}

export function getPondokJenisLabel(jenis: PondokJenis): string {
  switch (jenis) {
    case PondokJenis.PPM:
      return "PPM";
    case PondokJenis.PPPM:
      return "PPPM";
    case PondokJenis.BOARDING:
      return "Boarding";
    default:
      return "Unknown";
  }
}

export function getPengurusJabatanLabel(jabatan: PengurusJabatan): string {
  switch (jabatan) {
    case PengurusJabatan.KETUA:
      return "Ketua";
    case PengurusJabatan.WAKIL_KETUA:
      return "Wakil Ketua";
    case PengurusJabatan.PINISEPUH:
      return "Pinisepuh";
    case PengurusJabatan.SEKRETARIS:
      return "Sekretaris";
    case PengurusJabatan.BENDAHARA:
      return "Bendahara";
    case PengurusJabatan.GURU:
      return "Guru";
    default:
      return "Unknown";
  }
}

export function generateRandomString(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getCurrentPeriodeId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}${month.toString().padStart(2, "0")}`;
}

export function isWithinDateRange(start: string, end: string): boolean {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  return now >= startDate && now <= endDate;
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}
