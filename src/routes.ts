import { lazy } from 'react';
import { RouteConfig } from './types';

const HomePage = lazy(() => import('./pages/HomePage'));
const MarketPulsePage = lazy(() => import('./pages/MarketPulsePage'));
// These pages don't exist yet, will be created later
// const CategoryPage = lazy(() => import('./pages/CategoryPage'));
// const ProcedureDetailsPage = lazy(() => import('./pages/ProcedureDetailsPage'));
// const SearchPage = lazy(() => import('./pages/SearchPage'));
// const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    exact: true,
  },
  {
    path: '/pulse',
    element: MarketPulsePage,
    exact: true,
  },
  // Temporarily commented out routes for pages that don't exist yet
  /*
  {
    path: '/category/:categoryId',
    element: CategoryPage,
  },
  {
    path: '/procedure/:procedureId',
    element: ProcedureDetailsPage,
  },
  {
    path: '/search',
    element: SearchPage,
  },
  {
    path: '*',
    element: NotFoundPage,
  },
  */
];
