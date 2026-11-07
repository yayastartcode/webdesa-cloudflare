export type ReportData = {
  generatedAt: string;
  users: { total: number; active: number };
  posts: { total: number; published: number; drafts: number };
  employees: number;
  gallery: { total: number; active: number };
  info: { total: number; active: number };
  complaints: { total: number; pending: number; in_progress: number; resolved: number; closed: number };
  population: { totalPopulation: number; malePopulation: number; femalePopulation: number; households: number; temporaryResidents: number; populationMutations: number; updatedAt: string } | null;
  budget: { year: number; pendapatanDesa: number; belanjaDesa: number; updatedAt: string } | null;
  recent: { label: string; updatedAt: string; href: string }[];
};
