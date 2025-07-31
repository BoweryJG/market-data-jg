// This file handles mapping between old category structures and the new hierarchy

import { CategoryHierarchy } from '../../types';

// Map dental categories to hierarchy IDs
const dentalCategoryMap: Record<string, number> = {
  'Diagnostic': 1,
  'Preventive': 2,
  'Restorative': 3,
  'Cosmetic': 4,
  'Oral Surgery': 5,
  'Endodontic': 6,
  'Periodontic': 7,
  'Prosthodontic': 8,
  'Orthodontic': 9,
  'Implantology': 10,
  'Sleep Dentistry': 2, // Map to Preventive
  'Pediatric': 2, // Map to Preventive
  'Adjunctive': 11, // Map to Digital Dentistry
  'TMJ/Orofacial Pain': 5, // Map to Oral Surgery
  'Digital Dentistry': 11
};

// Map specific dental procedures to categories
const dentalProcedureCategoryMap: Record<string, number> = {
  'implants': 10, // Implantology
  'dental implants': 10,
  'implant - endosteal': 10,
  'crown - porcelain/ceramic': 8, // Prosthodontic
  'crowns': 8,
  'invisalign treatment': 9, // Orthodontic
  'aligners': 9,
  'braces': 9,
  'orthodontics': 9,
  'scaling & root planing': 7, // Periodontic
  'veneers': 4, // Cosmetic
  'whitening': 4,
  'teeth whitening': 4,
  'root canal': 6, // Endodontic
  'fillings': 3 // Restorative
};

// Map aesthetic categories to hierarchy IDs
const aestheticCategoryMap: Record<string, number> = {
  'Facial Aesthetic': 12,
  'Injectables': 13,
  'Body': 14,
  'Skin': 15,
  'Hair': 16,
  'Minimally Invasive': 17,
  'Regenerative': 18,
  'Lasers': 19,
  'Combination': 20,
  'Body Contouring': 47,
  'Skin Tightening': 49,
  'Skin Resurfacing': 48,
  'Tech-Enhanced': 17,
  'Face': 12,
  'Breast Procedures': 14,
  'Biotech': 18,
  'Facial Procedures': 12,
  'Vascular': 15,
  'Pigmentation': 51,
  'Cellulite': 49,
  'Scar/Stretch Mark': 49
};

// Map specific aesthetic procedures to categories
const aestheticProcedureCategoryMap: Record<string, number> = {
  'botox': 13, // Injectables
  'filler': 13,
  'dermal filler': 13,
  'dermal fillers': 13,
  'lip filler': 13,
  'injectables': 13,
  'pdo threads': 17, // Minimally Invasive
  'pdo': 17,
  'prp': 18, // Regenerative
  'prf': 18,
  'prp/prf': 18,
  'prf treatment': 18,
  'body contouring': 47,
  'liposuction': 47,
  'laser treatments': 19, // Lasers
  'facial aesthetic': 12,
  'breast procedures': 14, // Body
  'skin resurfacing': 48,
  'skin tightening': 49,
  'cellulite': 49,
  'scar/stretch mark': 49,
  'pigmentation': 51
};

// Procedure name to category mapping for automatic classification
const procedureToIndustryMap: Record<string, 'dental' | 'aesthetic'> = {
  // Dental procedures
  'implants': 'dental',
  'dental implants': 'dental',
  'implant - endosteal': 'dental',
  'crown - porcelain/ceramic': 'dental',
  'invisalign treatment': 'dental',
  'aligners': 'dental',
  'scaling & root planing': 'dental',
  'veneers': 'dental',
  'whitening': 'dental',
  'teeth whitening': 'dental',
  'orthodontics': 'dental',
  'braces': 'dental',
  'root canal': 'dental',
  'fillings': 'dental',
  'crowns': 'dental',
  
  // Aesthetic procedures
  'botox': 'aesthetic',
  'filler': 'aesthetic',
  'dermal filler': 'aesthetic',
  'dermal fillers': 'aesthetic',
  'lip filler': 'aesthetic',
  'pdo threads': 'aesthetic',
  'pdo': 'aesthetic',
  'prp': 'aesthetic',
  'prf': 'aesthetic',
  'prp/prf': 'aesthetic',
  'prf treatment': 'aesthetic',
  'body contouring': 'aesthetic',
  'liposuction': 'aesthetic',
  'laser treatments': 'aesthetic',
  'injectables': 'aesthetic',
  'facial aesthetic': 'aesthetic',
  'breast procedures': 'aesthetic',
  'skin resurfacing': 'aesthetic',
  'skin tightening': 'aesthetic',
  'cellulite': 'aesthetic',
  'scar/stretch mark': 'aesthetic',
  'pigmentation': 'aesthetic'
};

// Enhanced procedure categorization function
export const categorizeProcedure = (procedureName: string): 'dental' | 'aesthetic' | null => {
  if (!procedureName) return null;
  
  const name = procedureName.toLowerCase().trim();
  
  // Direct lookup first
  if (procedureToIndustryMap[name]) {
    return procedureToIndustryMap[name];
  }
  
  // Partial matching for procedures that might have variations
  for (const [key, industry] of Object.entries(procedureToIndustryMap)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      return industry;
    }
  }
  
  return null;
};

// Function to map a procedure to hierarchy categories
export const mapProcedureToHierarchy = (
  procedure: any, 
  industry?: 'dental' | 'aesthetic',
  categoryHierarchy: CategoryHierarchy[] = []
): number[] => {
  // Auto-detect industry if not provided
  let detectedIndustry = industry;
  const procedureName = procedure.procedure_name || procedure.name || '';
  
  if (!industry) {
    const autoDetected = categorizeProcedure(procedureName);
    if (autoDetected) {
      detectedIndustry = autoDetected;
    }
  }
  
  if (!detectedIndustry) return [];
  
  // First try direct procedure name mapping
  const name = procedureName.toLowerCase().trim();
  const procedureMap = detectedIndustry === 'dental' 
    ? dentalProcedureCategoryMap 
    : aestheticProcedureCategoryMap;
  
  // Check for direct procedure name match
  let hierarchyId = procedureMap[name];
  
  // If no direct match, try partial matching
  if (!hierarchyId) {
    for (const [key, id] of Object.entries(procedureMap)) {
      if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
        hierarchyId = id;
        break;
      }
    }
  }
  
  // If still no match, fall back to category mapping
  if (!hierarchyId) {
    const categoryMap = detectedIndustry === 'dental' 
      ? dentalCategoryMap 
      : aestheticCategoryMap;
    
    const categoryName = procedure.category || '';
    hierarchyId = categoryMap[categoryName];
  }
  
  if (hierarchyId) {
    // Find this category and all its parent categories
    const result: number[] = [hierarchyId];
    
    // Add parent category if this is a subcategory
    const category = categoryHierarchy.find(c => c.id === hierarchyId);
    if (category?.parent_id) {
      result.push(category.parent_id);
    }
    
    return result;
  }
  
  return [];
};

// Function to check if a procedure belongs to a hierarchy category
export const procedureBelongsToCategory = (
  procedure: any,
  categoryId: number,
  industry?: 'dental' | 'aesthetic',
  categoryHierarchy: CategoryHierarchy[] = []
): boolean => {
  // Get category mappings for this procedure (industry will be auto-detected)
  const hierarchyIds = mapProcedureToHierarchy(procedure, industry, categoryHierarchy);
  
  // Check if the selected category is in the hierarchy ids
  return hierarchyIds.includes(categoryId);
};
