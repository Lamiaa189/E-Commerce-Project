import { environment } from './../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Brand, BrandProductsResponse } from '../../models/brand.interface';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private readonly httpClient = inject(HttpClient);

  getAllBrands(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}brands`);
  }

  getBrandById(brandId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}brands/${brandId}`);
  }

  getBrandProducts(brandId: string, pageNumber: number = 1, searchTerm: string = '', sortBy: string = 'name', sortOrder: string = 'asc'): Observable<any> {
    // Get all products and filter by brand
    // This is more reliable than relying on the API's brand filter
    return this.httpClient.get(`${environment.baseUrl}products?page=${pageNumber}&limit=100`).pipe(
      map((response: any) => {
        if (response.data && Array.isArray(response.data)) {
          // Filter products by brand ID
          let filteredProducts = response.data.filter((product: any) => {
            const productBrandId = product.brand?._id || product.brand?.id;
            return productBrandId === brandId;
          });
          
          // Apply client-side search
          if (searchTerm.trim()) {
            filteredProducts = filteredProducts.filter((product: any) =>
              product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          // Apply client-side sorting
          filteredProducts.sort((a: any, b: any) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          return {
            ...response,
            data: filteredProducts,
            results: filteredProducts.length
          };
        }
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return of({ data: [], results: 0 });
      })
    );
  }

  searchBrands(searchTerm: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}brands?search=${searchTerm}`);
  }
}
