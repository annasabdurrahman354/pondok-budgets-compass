
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PengurusJabatan } from "@/types";
import { X } from "lucide-react";

interface PengurusFormData {
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

interface PengurusFormProps {
  pengurus: PengurusFormData;
  onChange: (data: PengurusFormData) => void;
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export const PengurusForm: React.FC<PengurusFormProps> = ({
  pengurus,
  onChange,
  onRemove,
  showRemoveButton = true
}) => {
  const handleFieldChange = (field: keyof PengurusFormData, value: string) => {
    onChange({
      ...pengurus,
      [field]: field === 'jabatan' ? value as PengurusJabatan : value
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg relative">
      {showRemoveButton && (
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
      
      <div>
        <Label htmlFor="nama">Nama Pengurus</Label>
        <Input
          id="nama"
          value={pengurus.nama}
          onChange={(e) => handleFieldChange('nama', e.target.value)}
          placeholder="Nama lengkap pengurus"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="jabatan">Jabatan</Label>
        <Select 
          value={pengurus.jabatan} 
          onValueChange={(value) => handleFieldChange('jabatan', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jabatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PengurusJabatan.KETUA}>Ketua</SelectItem>
            <SelectItem value={PengurusJabatan.WAKIL_KETUA}>Wakil Ketua</SelectItem>
            <SelectItem value={PengurusJabatan.SEKRETARIS}>Sekretaris</SelectItem>
            <SelectItem value={PengurusJabatan.BENDAHARA}>Bendahara</SelectItem>
            <SelectItem value={PengurusJabatan.ANGGOTA}>Anggota</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
        <Input
          id="nomor_telepon"
          value={pengurus.nomor_telepon}
          onChange={(e) => handleFieldChange('nomor_telepon', e.target.value)}
          placeholder="Nomor telepon pengurus"
        />
      </div>
    </div>
  );
};
