import { lazy } from 'react';
import { RouteConfig } from './types';

const HomePage = lazy(() => import('./pages/HomePage'));
const MarketPulsePage = lazy(() => import('./pages/MarketPulsePage'));

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
];
