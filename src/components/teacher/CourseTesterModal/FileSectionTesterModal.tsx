import { FileDown, Files, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseFile } from "@/types";

type FileSectionTesterModalProps = {
    files: CourseFile[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isUploadingPdf: boolean;
    handleDownloadPdf: (file: CourseFile) => void;
    handleDeleteFile: (file: CourseFile) => void;
}

export function FileSectionTesterModal({ files, handleFileUpload, fileInputRef, isUploadingPdf, handleDownloadPdf, handleDeleteFile }: FileSectionTesterModalProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                    <Files className="h-4 w-4" />
                    Documents PDF ({files.length})
                </h5>
                <div>
                    <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPdf}>
                        {isUploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-1" /> Ajouter</>}
                    </Button>
                </div>
            </div>
            {files.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document attaché</p>
            ) : (
                <div className="space-y-1">
                    {files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/30 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{f.fileName}</span>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownloadPdf(f)}>
                                    <FileDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteFile(f)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}