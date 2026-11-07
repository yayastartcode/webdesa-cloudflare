import { useCallback, useState, type ReactNode } from 'react';

export type UploadedFile = { url: string; ufsUrl: string; name: string; key: string };
export async function uploadFile(file: File, pdf = false): Promise<UploadedFile> {
  const accepted = pdf ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!accepted.includes(file.type)) throw new Error('Jenis file tidak didukung');
  if (file.size > (pdf ? 16 : 4) * 1024 * 1024) throw new Error('Ukuran file terlalu besar');
  const response = await fetch(`/api/uploads?type=${pdf ? 'pdf' : 'image'}`, {
    method: 'POST', headers: { 'Content-Type': file.type }, body: file,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'Upload gagal');
  return { ...result, name: file.name };
}

export function usePendingUploads() {
  const [count, setCount] = useState(0);
  const onUploadStateChange = useCallback((pending: boolean) => setCount(current => Math.max(0, current + (pending ? 1 : -1))), []);
  return { isUploading: count > 0, onUploadStateChange };
}

type Props = {
  endpoint: 'imageUploader' | 'pdfUploader';
  onClientUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
  appearance?: Record<string, string>;
  content?: { button?: ReactNode | ((state: { ready: boolean; isUploading: boolean }) => ReactNode); allowedContent?: ReactNode };
  className?: string;
  inputLabel?: string;
  disabled?: boolean;
  onUploadStateChange?: (pending: boolean) => void;
};
export function UploadButton({ endpoint, onClientUploadComplete, onUploadError, appearance, content, className, inputLabel, disabled, onUploadStateChange }: Props) {
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const pdf = endpoint === 'pdfUploader';
  return <div className={className}>
    <label data-ut-element="button" className={`inline-flex cursor-pointer rounded-md px-4 py-2 text-sm font-medium focus-within:outline-2 focus-within:outline-orange-500 ${appearance?.button ?? ''}`}>
      {isUploading ? 'Mengunggah...' : (typeof content?.button === 'function' ? content.button({ ready: true, isUploading }) : content?.button) ?? 'Pilih file'}
      <input type="file" className="sr-only" aria-label={inputLabel ?? (pdf ? 'Upload PDF' : 'Upload gambar')}
        accept={pdf ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif'} disabled={isUploading || disabled}
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          setUploading(true); setError(''); onUploadStateChange?.(true);
          try {
            const result = await uploadFile(file, pdf);
            onClientUploadComplete?.([result]);
          } catch (error) {
            const failure = error instanceof Error ? error : new Error('Upload gagal');
            setError(failure.message); onUploadError?.(failure);
          } finally { setUploading(false); onUploadStateChange?.(false); input.value = ''; }
        }} />
    </label>
    {isUploading && <p role="status" className="mt-1 text-sm">Mengunggah file, mohon tunggu...</p>}
    <div data-ut-element="allowed-content" className="mt-1 text-xs">{content?.allowedContent ?? (pdf ? 'PDF (16 MB)' : 'Gambar (4 MB)')}</div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
export const UploadDropzone = UploadButton;
