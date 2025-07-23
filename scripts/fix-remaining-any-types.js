#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File to fix
const filePath = path.join(__dirname, '../services/api-client.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Import the types we need to use
const typeImports = `import { 
  Procedure, 
  Company, 
  Category, 
  SearchResult, 
  MarketIntelligence,
  SubscriptionStatus 
} from './types/api-types';`;

// Replace the import line to include our types
content = content.replace(
  "import { BaseApiResponse, ApiError, ErrorData, RequestOptions } from './types/api-types';",
  typeImports.replace(/\n/g, ' ').replace(/\s+/g, ' ')
);

// Define replacements for each method
const methodReplacements = [
  // Health check
  { from: /public async checkHealth\(\): Promise<any> {/, to: 'public async checkHealth(): Promise<{ status: string; timestamp: string }> {' },
  { from: /this\.apiGateway\.get<any>\('\/api\/health'\)/, to: "this.apiGateway.get<{ status: string; timestamp: string }>('/api/health')" },
  
  // Categories
  { from: /public async getCategories\(\): Promise<any\[\]> {/, to: 'public async getCategories(): Promise<Category[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/categories'\)/, to: "this.apiGateway.get<Category[]>('/api/categories')" },
  
  { from: /public async getCategoryById\(id: string\): Promise<any> {/, to: 'public async getCategoryById(id: string): Promise<Category> {' },
  { from: /this\.apiGateway\.get<any>\(`\/api\/categories\/\$\{id\}`\)/, to: "this.apiGateway.get<Category>(`/api/categories/${id}`)" },
  
  // Procedures
  { from: /public async getProcedures\(limit: number = 20, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getProcedures(limit: number = 20, offset: number = 0): Promise<Procedure[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/procedures'/, to: "this.apiGateway.get<Procedure[]>('/api/procedures'" },
  
  { from: /public async getProcedureById\(id: string\): Promise<any> {/, to: 'public async getProcedureById(id: string): Promise<Procedure> {' },
  { from: /this\.apiGateway\.get<any>\(`\/api\/procedures\/\$\{id\}`\)/, to: "this.apiGateway.get<Procedure>(`/api/procedures/${id}`)" },
  
  { from: /public async searchProcedures\(query: string, filters\?: Record<string, any>\): Promise<any\[\]> {/, to: 'public async searchProcedures(query: string, filters?: Record<string, unknown>): Promise<Procedure[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/procedures\/search'/, to: "this.apiGateway.get<Procedure[]>('/api/procedures/search'" },
  
  // Market Growth
  { from: /public async getMarketGrowth\(procedureId: string, filters\?: Record<string, any>\): Promise<any> {/, to: 'public async getMarketGrowth(procedureId: string, filters?: Record<string, unknown>): Promise<MarketIntelligence> {' },
  { from: /this\.apiGateway\.get<any>\(`\/api\/market-growth\/\$\{procedureId\}`/, to: "this.apiGateway.get<MarketIntelligence>(`/api/market-growth/${procedureId}`" },
  
  // News
  { from: /public async getNews\(limit: number = 10, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getNews(limit: number = 10, offset: number = 0): Promise<SearchResult[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/news'/, to: "this.apiGateway.get<SearchResult[]>('/api/news'" },
  
  { from: /public async getNewsByCategory\(categoryId: string, limit: number = 10, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getNewsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<SearchResult[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\(`\/api\/news\/category\/\$\{categoryId\}`/, to: "this.apiGateway.get<SearchResult[]>(`/api/news/category/${categoryId}`" },
  
  { from: /public async getNewsByProcedureCategory\(procedureCategoryId: string, limit: number = 10, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getNewsByProcedureCategory(procedureCategoryId: string, limit: number = 10, offset: number = 0): Promise<SearchResult[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\(`\/api\/news\/procedure-category\/\$\{procedureCategoryId\}`/, to: "this.apiGateway.get<SearchResult[]>(`/api/news/procedure-category/${procedureCategoryId}`" },
  
  { from: /public async getTopNewsByProcedureCategories\(limit: number = 3\): Promise<any\[\]> {/, to: 'public async getTopNewsByProcedureCategories(limit: number = 3): Promise<SearchResult[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/news\/top-by-procedure-categories'/, to: "this.apiGateway.get<SearchResult[]>('/api/news/top-by-procedure-categories'" },
  
  // Query execution
  { from: /public async executeQuery\(query: string\): Promise<any> {/, to: 'public async executeQuery(query: string): Promise<ApiResponse<unknown>> {' },
  { from: /const response = await this\.apiGateway\.post<any>\('\/api\/query'/, to: "const response = await this.apiGateway.post<unknown>('/api/query'" },
  
  // Companies
  { from: /public async getCompanies\(limit: number = 20, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getCompanies(limit: number = 20, offset: number = 0): Promise<Company[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\('\/api\/companies'/, to: "this.apiGateway.get<Company[]>('/api/companies'" },
  
  { from: /public async getCompanyById\(id: string\): Promise<any> {/, to: 'public async getCompanyById(id: string): Promise<Company> {' },
  { from: /this\.apiGateway\.get<any>\(`\/api\/companies\/\$\{id\}`\)/, to: "this.apiGateway.get<Company>(`/api/companies/${id}`)" },
  
  { from: /public async getCompaniesByCategory\(categoryId: string, limit: number = 20, offset: number = 0\): Promise<any\[\]> {/, to: 'public async getCompaniesByCategory(categoryId: string, limit: number = 20, offset: number = 0): Promise<Company[]> {' },
  { from: /this\.apiGateway\.get<any\[\]>\(`\/api\/companies\/category\/\$\{categoryId\}`/, to: "this.apiGateway.get<Company[]>(`/api/companies/category/${categoryId}`" },
];

// Apply all replacements
methodReplacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all remaining "any" types in api-client.ts');
console.log('📝 Changes made:');
console.log('  - Added proper type imports');
console.log('  - Replaced all method return types with specific types');
console.log('  - Updated generic parameters in API calls');
console.log('\nPlease run TypeScript compilation to verify all types are correct.');