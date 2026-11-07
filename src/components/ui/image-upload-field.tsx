import { useId, useState } from 'react';
import { UploadButton } from '@/lib/upload';
import { Input } from './input';
import { Button } from './button';

type Props = {
  label: string;
  previewClassName?: string;
  value?: string | null;
  onChange: (url: string) => void;
  onUploadStateChange?: (pending: boolean) => void;
  required?: boolean;
  disabled?: boolean;
};

export function ImageUploadField({ label, value = '', onChange, onUploadStateChange, required, disabled, previewClassName }: Props) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  return <fieldset disabled={disabled} aria-label={label} className="min-w-0 space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
    <legend className="px-1 text-sm font-medium">{label}{required ? ' *' : ' (Opsional)'}</legend>
    <UploadButton endpoint="imageUploader" inputLabel={`Upload ${label.toLowerCase()}`} disabled={disabled}
      content={{ button: value ? 'Ganti gambar' : 'Pilih gambar', allowedContent: 'JPG, PNG, WebP, GIF — maksimal 4 MB' }}
      onUploadStateChange={pending => { setUploading(pending); onUploadStateChange?.(pending); }}
      onClientUploadComplete={files => { if (files[0]) onChange(files[0].url); }} />
    {value && <div className="space-y-2">
      <img src={value} alt={`Pratinjau ${label.toLowerCase()}`} className={previewClassName ?? "max-h-40 max-w-full rounded-md border bg-gray-50 object-contain dark:bg-gray-800"} />
      <Button type="button" size="sm" variant="outline" disabled={uploading || disabled} onClick={() => onChange('')}>Hapus gambar</Button>
    </div>}
    <details className="text-sm">
      <summary className="cursor-pointer text-gray-500 dark:text-gray-400">Gunakan URL gambar</summary>
      <label htmlFor={id} className="mt-2 block text-xs">URL {label.toLowerCase()}</label>
      <Input id={id} inputMode="url" value={value ?? ''} disabled={uploading || disabled}
        placeholder="https://example.com/gambar.jpg" onChange={event => onChange(event.target.value)} className="mt-1" />
    </details>
  </fieldset>;
}
