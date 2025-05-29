
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentStatus } from "@/types";
import { Edit, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RevisionActionsProps {
  documentType: 'rab' | 'lpj';
  documentId: string;
  status: DocumentStatus;
  pesanRevisi?: string;
}

export const RevisionActions: React.FC<RevisionActionsProps> = ({
  documentType,
  documentId,
  status,
  pesanRevisi
}) => {
  const navigate = useNavigate();

  const handleRevise = () => {
    if (documentType === 'rab') {
      navigate(`/admin-pondok/rab/create?revise=${documentId}`);
    } else {
      navigate(`/admin-pondok/lpj/create?revise=${documentId}`);
    }
  };

  if (status !== DocumentStatus.REVISI) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dokumen perlu direvisi!</strong><br />
          {pesanRevisi && (
            <>
              <strong>Pesan Revisi:</strong><br />
              {pesanRevisi}
            </>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Badge variant="destructive" className="px-3 py-1">
          Status: Perlu Revisi
        </Badge>
        
        <Button onClick={handleRevise} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Revisi {documentType.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};
