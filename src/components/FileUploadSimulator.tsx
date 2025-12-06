import { useState, useRef } from 'react';
import { Upload, FileText, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadSimulatorProps {
  onUploadComplete: (file: File) => void;
  accept?: string;
  label?: string;
  disabled?: boolean;
}

export const FileUploadSimulator = ({ 
  onUploadComplete, 
  accept = ".pdf,.jpg,.jpeg,.png",
  label = "Upload Salary Slip",
  disabled = false
}: FileUploadSimulatorProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setUploadState('uploading');
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUploadState('success');
    onUploadComplete(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleSimulatedUpload = async () => {
    // Create a mock file for demo purposes
    const mockFile = new File(['dummy content'], 'salary_slip_dec_2024.pdf', { type: 'application/pdf' });
    await processFile(mockFile);
  };

  if (uploadState === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-green-600 dark:text-green-400">Document Uploaded Successfully</p>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>
    );
  }

  if (uploadState === 'uploading') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-primary">Uploading & Verifying...</p>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer",
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <p className="font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground text-center">
          Drag & drop your file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supported: PDF, JPG, PNG (Max 5MB)
        </p>
      </div>

      {/* Demo Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleSimulatedUpload}
        disabled={disabled}
      >
        <FileText className="h-4 w-4 mr-2" />
        Use Demo Salary Slip
      </Button>
    </div>
  );
};
