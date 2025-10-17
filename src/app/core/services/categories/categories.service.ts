import { environment } from './../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Category } from '../../models/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly httpClient = inject(HttpClient);

  getAllCategories(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}categories`);
  }

  getCategoryById(categoryId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}categories/${categoryId}`);
  }

  getCategoryProducts(categoryId: string, pageNumber: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}products?category=${categoryId}&page=${pageNumber}`).pipe(
      catchError((error) => {
        console.error('Error fetching category products with category filter:', error);
        // Fallback: try to get all products and filter by category
        return this.httpClient.get(`${environment.baseUrl}products?page=${pageNumber}`).pipe(
          map((response: any) => {
            if (response.data && Array.isArray(response.data)) {
              // Filter products by category ID
              const filteredProducts = response.data.filter((product: any) => 
                product.category && product.category._id === categoryId
              );
              return {
                ...response,
                data: filteredProducts,
                results: filteredProducts.length
              };
            }
            return response;
          }),
          catchError((fallbackError) => {
            console.error('Error fetching all products as fallback:', fallbackError);
            return of({ data: [], results: 0 });
          })
        );
      })
    );
  }

  searchCategories(searchTerm: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}categories?search=${searchTerm}`);
  }
}
