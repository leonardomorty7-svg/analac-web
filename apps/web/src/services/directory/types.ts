export interface DirectorySearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  category?: string;
  region?: string;
}

export interface PaginatedDirectoryResponse {
  data: OrganizationDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Contrato de Datos Público (DTO) para la UI
export interface OrganizationDTO {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string;
  status: string;
  verified: boolean;
  logo?: string;
  location: {
    city: string;
    department: string;
  };
  summary: string;
  description?: string;
  foundationYear?: number;
  coverage: string[];
  products: string[];
  certifications: string[];
  contacts?: {
    email?: string;
    phone?: string;
    website?: string;
  } | undefined;
  faqs?: {
    question: string;
    answer: string;
  }[];
}
