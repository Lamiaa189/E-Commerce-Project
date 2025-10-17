import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'brands/:slug/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'categories/:slug/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'details/:slug/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'details/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'orders/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
