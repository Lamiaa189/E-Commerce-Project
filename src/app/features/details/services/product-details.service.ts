import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private readonly httpClient = inject(HttpClient);

  getProductDetails(id: string | null): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}products/${id}`);
  }
}
