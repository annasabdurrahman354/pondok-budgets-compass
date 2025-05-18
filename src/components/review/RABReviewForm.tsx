
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DocumentStatus, RAB } from "@/types";
import { updateRABStatus } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RABReviewFormProps {
  rab: RAB;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
  action: "approve" | "revise";
}

export const RABReviewForm = ({
  rab,
  isOpen,
  onClose,
  onStatusUpdated,
  action,
}: RABReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesan, setPesan] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const status = action === "approve" ? DocumentStatus.DITERIMA : DocumentStatus.REVISI;
      const success = await updateRABStatus(rab.id!, status, action === "revise" ? pesan : undefined);
      
      if (success) {
        toast.success(
          action === "approve" 
            ? "RAB berhasil disetujui" 
            : "Permintaan revisi RAB berhasil dikirim"
        );
        onStatusUpdated();
        onClose();
      } else {
        throw new Error("Gagal memperbarui status RAB");
      }
    } catch (error: any) {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionText = action === "approve" ? "Setujui RAB" : "Minta Revisi RAB";
  const actionDescription = action === "approve" 
    ? "RAB yang disetujui tidak dapat diubah kembali." 
    : "Silakan tuliskan alasan mengapa RAB perlu direvisi.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionText}</DialogTitle>
          <DialogDescription>
            {actionDescription}
          </DialogDescription>
        </DialogHeader>
        
        {action === "revise" && (
          <div className="space-y-2 py-4">
            <label htmlFor="revisionMessage" className="text-sm font-medium">
              Pesan Revisi
            </label>
            <Textarea
              id="revisionMessage"
              placeholder="Tuliskan alasan revisi di sini..."
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || (action === "revise" && !pesan.trim())}
            variant={action === "approve" ? "default" : "destructive"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              actionText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
