// Additional Integration Cost Data for 250+ procedures
// Extension of integrationCostData.ts

import { IntegrationCostData } from './integrationCostData';

export const ADDITIONAL_INTEGRATION_COSTS: Record<string, IntegrationCostData> = {
  // ADVANCED DENTAL PROCEDURES
  'dental bridge': { min: 15000, max: 35000, equipment_min: 10000, equipment_max: 30000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'dental crown': { min: 12000, max: 30000, equipment_min: 8000, equipment_max: 25000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'dentures': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'dental onlay': { min: 12000, max: 28000, equipment_min: 8000, equipment_max: 23000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'dental inlay': { min: 12000, max: 28000, equipment_min: 8000, equipment_max: 23000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'tooth extraction': { min: 5000, max: 15000, equipment_min: 3000, equipment_max: 12000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'wisdom teeth': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 17000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'gum grafting': { min: 15000, max: 35000, equipment_min: 12000, equipment_max: 30000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'crown lengthening': { min: 12000, max: 28000, equipment_min: 9000, equipment_max: 23000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'dental filling': { min: 3000, max: 8000, equipment_min: 2000, equipment_max: 6000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'composite filling': { min: 4000, max: 10000, equipment_min: 3000, equipment_max: 8000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'amalgam filling': { min: 3000, max: 7000, equipment_min: 2000, equipment_max: 5000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'root canal': { min: 10000, max: 25000, equipment_min: 8000, equipment_max: 22000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'apicoectomy': { min: 15000, max: 35000, equipment_min: 12000, equipment_max: 30000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'dental bonding': { min: 5000, max: 12000, equipment_min: 3000, equipment_max: 9000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'dental sealants': { min: 2000, max: 5000, equipment_min: 1000, equipment_max: 3000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  'fluoride treatment': { min: 1000, max: 3000, equipment_min: 500, equipment_max: 2000, training: 1000, confidence: 'estimated', updated: '2024-01', roi_months: 2 },
  'night guard': { min: 8000, max: 18000, equipment_min: 6000, equipment_max: 15000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'tmj treatment': { min: 12000, max: 30000, equipment_min: 10000, equipment_max: 25000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'sleep apnea': { min: 15000, max: 40000, equipment_min: 12000, equipment_max: 35000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  
  // FACIAL AESTHETIC PROCEDURES
  'lip augmentation': { min: 6000, max: 15000, equipment_min: 0, equipment_max: 2000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'lip flip': { min: 5000, max: 12000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  'cheek augmentation': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'chin augmentation': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'jaw contouring': { min: 10000, max: 25000, equipment_min: 0, equipment_max: 3000, training: 7000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'temple filler': { min: 7000, max: 18000, equipment_min: 0, equipment_max: 2000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'tear trough': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 2000, training: 6000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'nasolabial folds': { min: 7000, max: 18000, equipment_min: 0, equipment_max: 2000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'marionette lines': { min: 7000, max: 18000, equipment_min: 0, equipment_max: 2000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'bunny lines': { min: 5000, max: 12000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  'gummy smile': { min: 5000, max: 12000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  'masseter botox': { min: 6000, max: 15000, equipment_min: 0, equipment_max: 2000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'neck botox': { min: 6000, max: 15000, equipment_min: 0, equipment_max: 2000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'decolletage': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  
  // BODY PROCEDURES
  'brazilian butt lift': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 50000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'liposuction': { min: 30000, max: 70000, equipment_min: 25000, equipment_max: 60000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 18 },
  'tummy tuck': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'arm lift': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'thigh lift': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'mommy makeover': { min: 35000, max: 80000, equipment_min: 30000, equipment_max: 70000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 20 },
  'breast augmentation': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'breast lift': { min: 18000, max: 45000, equipment_min: 13000, equipment_max: 35000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 14 },
  'breast reduction': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'gynecomastia': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  
  // REGENERATIVE MEDICINE
  'stem cell therapy': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'exosome therapy': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'growth factors': { min: 12000, max: 30000, equipment_min: 8000, equipment_max: 25000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'mesotherapy': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 15000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'carboxytherapy': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  
  // MINIMALLY INVASIVE PROCEDURES
  'mini facelift': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'neck lift': { min: 18000, max: 45000, equipment_min: 13000, equipment_max: 35000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 14 },
  'brow lift': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'eyelid surgery': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'rhinoplasty': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 40000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'otoplasty': { min: 12000, max: 30000, equipment_min: 8000, equipment_max: 25000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  
  // SCAR & STRETCH MARK TREATMENTS
  'scar revision': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 55000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'stretch marks': { min: 30000, max: 70000, equipment_min: 25000, equipment_max: 65000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 14 },
  'keloid treatment': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 45000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'acne scars': { min: 35000, max: 80000, equipment_min: 30000, equipment_max: 75000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  
  // INTIMATE WELLNESS
  'vaginal rejuvenation': { min: 40000, max: 90000, equipment_min: 35000, equipment_max: 85000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 18 },
  'labiaplasty': { min: 15000, max: 40000, equipment_min: 10000, equipment_max: 30000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'o-shot': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'p-shot': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  
  // WELLNESS TREATMENTS
  'cryotherapy': { min: 30000, max: 70000, equipment_min: 25000, equipment_max: 65000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'hyperbaric oxygen': { min: 50000, max: 120000, equipment_min: 45000, equipment_max: 115000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 20 },
  'red light therapy': { min: 5000, max: 25000, equipment_min: 4000, equipment_max: 23000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'infrared sauna': { min: 10000, max: 30000, equipment_min: 8000, equipment_max: 28000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'float therapy': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 55000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'salt therapy': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 45000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  
  // DIAGNOSTIC & TESTING
  'food sensitivity': { min: 5000, max: 15000, equipment_min: 3000, equipment_max: 12000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'allergy testing': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 17000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'genetic testing': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'microbiome testing': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 15000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'hormone testing': { min: 5000, max: 15000, equipment_min: 3000, equipment_max: 10000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  
  // MISCELLANEOUS TREATMENTS
  'platelet rich fibrin': { min: 8000, max: 18000, equipment_min: 5000, equipment_max: 15000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 7 },
  'vampire facial': { min: 10000, max: 22000, equipment_min: 7000, equipment_max: 18000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'aquagold': { min: 5000, max: 12000, equipment_min: 2000, equipment_max: 8000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'plasma pen': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 17000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 7 },
  'fibroblast': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 17000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 7 },
  'jet peel': { min: 15000, max: 35000, equipment_min: 12000, equipment_max: 32000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'aquafacial': { min: 18000, max: 40000, equipment_min: 15000, equipment_max: 37000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 9 },
  'diamond glow': { min: 20000, max: 45000, equipment_min: 17000, equipment_max: 42000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'geneo facial': { min: 25000, max: 50000, equipment_min: 22000, equipment_max: 47000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'oxygeneo': { min: 25000, max: 50000, equipment_min: 22000, equipment_max: 47000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
};