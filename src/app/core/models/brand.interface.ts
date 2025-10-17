export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProductsResponse {
  data: any[];
  results: number;
  metadata: {
    currentPage: number;
    limit: number;
    totalPages: number;
  };
}
