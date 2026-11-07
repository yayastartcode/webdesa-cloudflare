export interface InfoRecord {
  id: string;
  title: string;
  slug: string;
  pdfUrl: string;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
