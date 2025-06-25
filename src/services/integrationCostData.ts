// Integration Cost Data for Medical/Dental Procedures
// Based on market research and verified sources

import { ADDITIONAL_INTEGRATION_COSTS } from './additionalIntegrationCosts';

export interface IntegrationCostData {
  min: number;
  max: number;
  equipment_min?: number;
  equipment_max?: number;
  training?: number;
  confidence: 'verified' | 'researched' | 'calculated' | 'estimated';
  updated: string;
  roi_months?: number;
  notes?: string;
}

// Verified costs from research
export const INTEGRATION_COSTS: Record<string, IntegrationCostData> = {
  // AESTHETIC INJECTABLES (Verified from research)
  'botox': { min: 5500, max: 17000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 3 },
  'dysport': { min: 5500, max: 17000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 3 },
  'xeomin': { min: 5500, max: 17000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 3 },
  'jeuveau': { min: 5500, max: 17000, equipment_min: 0, equipment_max: 2000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 3 },
  'juvederm': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 4000, confidence: 'verified', updated: '2024-01', roi_months: 4 },
  'restylane': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 4000, confidence: 'verified', updated: '2024-01', roi_months: 4 },
  'sculptra': { min: 10000, max: 25000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 5 },
  'radiesse': { min: 10000, max: 25000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 5 },
  'rha collection': { min: 10000, max: 25000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 5 },
  'belotero': { min: 8000, max: 20000, equipment_min: 0, equipment_max: 3000, training: 4000, confidence: 'researched', updated: '2024-01', roi_months: 4 },
  
  // AESTHETIC ENERGY DEVICES (Verified from research)
  'morpheus8': { min: 73000, max: 123000, equipment_min: 70000, equipment_max: 120000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 15 },
  'emsculpt neo': { min: 80000, max: 95000, equipment_min: 75000, equipment_max: 90000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 18 },
  'emsculpt': { min: 40000, max: 80000, equipment_min: 35000, equipment_max: 75000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 15 },
  'fraxel': { min: 19000, max: 25000, equipment_min: 16000, equipment_max: 22000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 12 },
  'fraxel dual': { min: 25000, max: 40000, equipment_min: 22000, equipment_max: 37000, training: 3000, confidence: 'researched', updated: '2024-01', roi_months: 14 },
  'coolsculpting': { min: 60000, max: 125000, equipment_min: 55000, equipment_max: 120000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 18 },
  'ultherapy': { min: 65000, max: 150000, equipment_min: 60000, equipment_max: 145000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 20 },
  'thermage': { min: 45000, max: 90000, equipment_min: 40000, equipment_max: 85000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 16 },
  'ipl photofacial': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 55000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 10 },
  'laser hair removal': { min: 30000, max: 80000, equipment_min: 25000, equipment_max: 75000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12 },
  'picosure': { min: 80000, max: 150000, equipment_min: 75000, equipment_max: 145000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 18 },
  'picosure pro': { min: 85000, max: 160000, equipment_min: 80000, equipment_max: 155000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 18 },
  'picoway': { min: 47000, max: 120000, equipment_min: 45000, equipment_max: 115000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 16, notes: 'Average $62,000' },
  'enlighten': { min: 90000, max: 200000, equipment_min: 85000, equipment_max: 195000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 20, notes: 'Tri-wavelength' },
  'discovery pico': { min: 80000, max: 150000, equipment_min: 75000, equipment_max: 145000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 18, notes: 'No consumables' },
  'co2 laser resurfacing': { min: 40000, max: 100000, equipment_min: 35000, equipment_max: 95000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 15 },
  
  // VASCULAR & IPL DEVICES (Verified/Researched)
  'excel v+': { min: 60000, max: 120000, equipment_min: 55000, equipment_max: 115000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 14, notes: 'Cutera dual-wavelength' },
  'vbeam perfecta': { min: 50000, max: 100000, equipment_min: 45000, equipment_max: 95000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12 },
  'ipl m22': { min: 40000, max: 90000, equipment_min: 35000, equipment_max: 85000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 10 },
  'stellar m22': { min: 87000, max: 109000, equipment_min: 85000, equipment_max: 105000, training: 4000, confidence: 'verified', updated: '2024-01', roi_months: 15, notes: '9 applicators, no consumables' },
  
  // DENTAL DIGITAL SCANNERS (Verified)
  'itero scanner': { min: 20000, max: 50000, equipment_min: 20000, equipment_max: 50000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 24, notes: 'Training included' },
  'itero': { min: 20000, max: 50000, equipment_min: 20000, equipment_max: 50000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 24 },
  '3shape trios': { min: 12400, max: 27900, equipment_min: 12400, equipment_max: 27900, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 30, notes: 'First year support included' },
  'trios scanner': { min: 12400, max: 27900, equipment_min: 12400, equipment_max: 27900, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 30 },
  'primescan': { min: 25000, max: 40000, equipment_min: 24995, equipment_max: 40000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 24, notes: 'Cloud-native version $24,995' },
  'intraoral scanner': { min: 12000, max: 50000, equipment_min: 12000, equipment_max: 50000, training: 0, confidence: 'researched', updated: '2024-01', roi_months: 24 },
  
  // DENTAL IMAGING (Verified)
  'cbct': { min: 50000, max: 150000, equipment_min: 50000, equipment_max: 150000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 36, notes: 'Pre-owned 30-50% less' },
  'cone beam': { min: 50000, max: 150000, equipment_min: 50000, equipment_max: 150000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 36 },
  'digital radiography': { min: 15000, max: 30000, equipment_min: 15000, equipment_max: 30000, training: 2000, confidence: 'verified', updated: '2024-01', roi_months: 18 },
  'planmeca': { min: 1500, max: 100000, equipment_min: 1500, equipment_max: 100000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 24 },
  
  // DENTAL LASERS (Verified)
  'dental laser': { min: 3000, max: 80000, equipment_min: 3000, equipment_max: 80000, training: 3000, confidence: 'verified', updated: '2024-01', roi_months: 18 },
  'diode laser': { min: 3000, max: 10000, equipment_min: 3000, equipment_max: 10000, training: 2000, confidence: 'verified', updated: '2024-01', roi_months: 12, notes: 'Most affordable option' },
  'er:yag laser': { min: 20000, max: 80000, equipment_min: 20000, equipment_max: 80000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 24 },
  'co2 dental laser': { min: 20000, max: 60000, equipment_min: 20000, equipment_max: 60000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 20 },
  
  // DENTAL IMPLANTS & SURGERY (Researched)
  'dental implant': { min: 25000, max: 45000, equipment_min: 20000, equipment_max: 40000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12 },
  'all-on-4': { min: 35000, max: 65000, equipment_min: 30000, equipment_max: 60000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 15 },
  'yomi robotic': { min: 100000, max: 200000, equipment_min: 0, equipment_max: 0, training: 15000, confidence: 'researched', updated: '2024-01', roi_months: 24, notes: 'Subscription model' },
  'x-guide': { min: 45000, max: 60000, equipment_min: 40000, equipment_max: 55000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 18 },
  'bone grafting': { min: 15000, max: 30000, equipment_min: 10000, equipment_max: 25000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 10 },
  'sinus lift': { min: 20000, max: 35000, equipment_min: 15000, equipment_max: 30000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 12 },
  
  // DENTAL COSMETIC (Researched)
  'clear aligners': { min: 17000, max: 42000, equipment_min: 15000, equipment_max: 40000, training: 2000, confidence: 'researched', updated: '2024-01', roi_months: 9 },
  'invisalign': { min: 20000, max: 50000, equipment_min: 18000, equipment_max: 45000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 10 },
  'teeth whitening': { min: 1000, max: 3000, equipment_min: 800, equipment_max: 2500, training: 500, confidence: 'verified', updated: '2024-01', roi_months: 2 },
  'zoom whitening': { min: 3000, max: 8000, equipment_min: 2500, equipment_max: 7000, training: 1000, confidence: 'researched', updated: '2024-01', roi_months: 3 },
  'veneers': { min: 15000, max: 40000, equipment_min: 12000, equipment_max: 35000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 8 },
  'cad/cam crown': { min: 80000, max: 150000, equipment_min: 75000, equipment_max: 145000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 20 },
  'cerec': { min: 90000, max: 160000, equipment_min: 85000, equipment_max: 155000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 22 },
  'cad/cam milling': { min: 90000, max: 112000, equipment_min: 90000, equipment_max: 112000, training: 5000, confidence: 'verified', updated: '2024-01', roi_months: 36 },
  '3d printer dental': { min: 5000, max: 50000, equipment_min: 5000, equipment_max: 50000, training: 2000, confidence: 'verified', updated: '2024-01', roi_months: 18, notes: '14.9% CAGR growth' },
  'dental microscope': { min: 15000, max: 50000, equipment_min: 15000, equipment_max: 50000, training: 3000, confidence: 'researched', updated: '2024-01', roi_months: 24 },
  'piezo surgery': { min: 8000, max: 25000, equipment_min: 8000, equipment_max: 25000, training: 3000, confidence: 'researched', updated: '2024-01', roi_months: 18 },
  'prf centrifuge': { min: 3000, max: 8000, equipment_min: 3000, equipment_max: 8000, training: 1500, confidence: 'researched', updated: '2024-01', roi_months: 9 },
  'ozone therapy': { min: 5000, max: 15000, equipment_min: 5000, equipment_max: 15000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'the wand': { min: 3000, max: 6000, equipment_min: 3000, equipment_max: 6000, training: 1000, confidence: 'researched', updated: '2024-01', roi_months: 8 },
  
  // BODY CONTOURING (Verified/Researched)
  'venus legacy': { min: 6000, max: 40000, equipment_min: 6000, equipment_max: 40000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 10, notes: 'No consumables' },
  'btl vanquish': { min: 7500, max: 39500, equipment_min: 7500, equipment_max: 39500, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 12, notes: 'No consumables' },
  'vanquish': { min: 7500, max: 39500, equipment_min: 7500, equipment_max: 39500, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 12 },
  'accent prime': { min: 45000, max: 90000, equipment_min: 40000, equipment_max: 85000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 14, notes: '9 technologies, no consumables' },
  'bodyfx': { min: 40000, max: 80000, equipment_min: 35000, equipment_max: 75000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 14, notes: 'Zero consumables' },
  'exilis': { min: 35000, max: 70000, equipment_min: 30000, equipment_max: 65000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 15, notes: 'V-tip consumables required' },
  'exilis ultra': { min: 40000, max: 80000, equipment_min: 35000, equipment_max: 75000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 16, notes: 'V-tip consumables $250-750/box' },
  'pelleve': { min: 25000, max: 50000, equipment_min: 20000, equipment_max: 45000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 10, notes: 'No consumables' },
  'tempsure': { min: 15000, max: 86000, equipment_min: 15000, equipment_max: 86000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 12, notes: 'Handpiece recharge $1649' },
  'trusculpt': { min: 40000, max: 85000, equipment_min: 35000, equipment_max: 80000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 15 },
  'sculpsure': { min: 45000, max: 90000, equipment_min: 40000, equipment_max: 85000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 16 },
  'velashape': { min: 35000, max: 70000, equipment_min: 30000, equipment_max: 65000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 13 },
  
  // SKIN TIGHTENING & ULTRASOUND
  'sofwave': { min: 80000, max: 150000, equipment_min: 75000, equipment_max: 145000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 18, notes: 'Low fee-per-use consumables' },
  'profound': { min: 50000, max: 100000, equipment_min: 45000, equipment_max: 95000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 16 },
  'infini': { min: 40000, max: 80000, equipment_min: 35000, equipment_max: 75000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 14 },
  'endymed': { min: 35000, max: 70000, equipment_min: 30000, equipment_max: 65000, training: 5000, confidence: 'calculated', updated: '2024-01', roi_months: 12 },
  
  // MICRONEEDLING & RF MICRONEEDLING (Verified/Researched)
  'microneedling': { min: 3000, max: 8000, equipment_min: 2000, equipment_max: 6000, training: 2000, confidence: 'researched', updated: '2024-01', roi_months: 4 },
  'vivace': { min: 45000, max: 85000, equipment_min: 40000, equipment_max: 80000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12, notes: 'Based on $850/treatment avg' },
  'vivace rf': { min: 45000, max: 85000, equipment_min: 40000, equipment_max: 80000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12 },
  'secret rf': { min: 30000, max: 45000, equipment_min: 30000, equipment_max: 45000, training: 0, confidence: 'verified', updated: '2024-01', roi_months: 10, notes: '$50/tip consumable' },
  'genius rf': { min: 55000, max: 95000, equipment_min: 50000, equipment_max: 90000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 14, notes: 'AI-based, 49 gold needles' },
  'potenza': { min: 50000, max: 90000, equipment_min: 45000, equipment_max: 85000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 12 },
  'microneedling rf': { min: 25000, max: 60000, equipment_min: 22000, equipment_max: 55000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 10 },
  'dermapen': { min: 3500, max: 8500, equipment_min: 2500, equipment_max: 7000, training: 1500, confidence: 'researched', updated: '2024-01', roi_months: 4 },
  'skinpen': { min: 4000, max: 9000, equipment_min: 3000, equipment_max: 7500, training: 1500, confidence: 'researched', updated: '2024-01', roi_months: 5 },
  
  // THREAD LIFTS (Estimated)
  'pdo thread lift': { min: 8000, max: 20000, equipment_min: 5000, equipment_max: 15000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'silhouette instalift': { min: 10000, max: 25000, equipment_min: 7000, equipment_max: 20000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 7 },
  
  // CHEMICAL PEELS (Verified)
  'chemical peel': { min: 2000, max: 5000, equipment_min: 1000, equipment_max: 3000, training: 2000, confidence: 'verified', updated: '2024-01', roi_months: 2 },
  'vi peel': { min: 3000, max: 7000, equipment_min: 2000, equipment_max: 5000, training: 2000, confidence: 'researched', updated: '2024-01', roi_months: 3 },
  'perfect derma peel': { min: 3500, max: 8000, equipment_min: 2500, equipment_max: 6000, training: 2000, confidence: 'researched', updated: '2024-01', roi_months: 3 },
  'jessner peel': { min: 2500, max: 6000, equipment_min: 1500, equipment_max: 4000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  'tca peel': { min: 2000, max: 5000, equipment_min: 1000, equipment_max: 3000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 2 },
  
  // ADDITIONAL INJECTABLES (Pattern-based)
  'kybella': { min: 8000, max: 18000, equipment_min: 0, equipment_max: 2000, training: 4000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'plla': { min: 10000, max: 25000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'pcl fillers': { min: 10000, max: 22000, equipment_min: 0, equipment_max: 3000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'prp': { min: 8000, max: 15000, equipment_min: 5000, equipment_max: 10000, training: 3000, confidence: 'researched', updated: '2024-01', roi_months: 6 },
  'prf': { min: 8000, max: 15000, equipment_min: 5000, equipment_max: 10000, training: 3000, confidence: 'researched', updated: '2024-01', roi_months: 6 },
  
  // HAIR RESTORATION (Estimated)
  'prp hair': { min: 10000, max: 20000, equipment_min: 7000, equipment_max: 15000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'hair transplant': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 50000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'scalp micropigmentation': { min: 8000, max: 15000, equipment_min: 5000, equipment_max: 10000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  
  // WELLNESS & ALTERNATIVE (Estimated)
  'iv therapy': { min: 5000, max: 15000, equipment_min: 3000, equipment_max: 10000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'hormone therapy': { min: 10000, max: 25000, equipment_min: 5000, equipment_max: 15000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
  'peptide therapy': { min: 8000, max: 20000, equipment_min: 3000, equipment_max: 10000, training: 10000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'weight loss program': { min: 5000, max: 15000, equipment_min: 2000, equipment_max: 8000, training: 7000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  
  // VEIN TREATMENTS (Estimated based on laser equipment)
  'sclerotherapy': { min: 3000, max: 8000, equipment_min: 1000, equipment_max: 5000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'spider vein': { min: 25000, max: 60000, equipment_min: 20000, equipment_max: 55000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 10 },
  'varicose vein': { min: 35000, max: 80000, equipment_min: 30000, equipment_max: 75000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  
  // ORTHODONTICS & ALIGNERS (Researched)
  'braces': { min: 15000, max: 30000, equipment_min: 10000, equipment_max: 25000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'lingual braces': { min: 20000, max: 40000, equipment_min: 15000, equipment_max: 35000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'ceramic braces': { min: 18000, max: 35000, equipment_min: 13000, equipment_max: 30000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  
  // DENTAL SPECIALTIES (Estimated)
  'endodontics': { min: 20000, max: 50000, equipment_min: 15000, equipment_max: 45000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 15 },
  'periodontics': { min: 25000, max: 55000, equipment_min: 20000, equipment_max: 50000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 18 },
  'prosthodontics': { min: 30000, max: 70000, equipment_min: 25000, equipment_max: 65000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 20 },
  'oral surgery': { min: 35000, max: 80000, equipment_min: 30000, equipment_max: 75000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 24 },
  
  // SKIN TREATMENTS (Pattern-based)
  'hydrafacial': { min: 20000, max: 40000, equipment_min: 18000, equipment_max: 38000, training: 2000, confidence: 'researched', updated: '2024-01', roi_months: 8 },
  'dermaplaning': { min: 1500, max: 3500, equipment_min: 500, equipment_max: 2000, training: 1500, confidence: 'estimated', updated: '2024-01', roi_months: 2 },
  'microdermabrasion': { min: 3000, max: 10000, equipment_min: 2000, equipment_max: 8000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'led light therapy': { min: 5000, max: 25000, equipment_min: 4000, equipment_max: 23000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  'oxygen facial': { min: 8000, max: 20000, equipment_min: 6000, equipment_max: 18000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 6 },
  
  // TATTOO & PIGMENTATION (Based on laser tech)
  'tattoo removal': { min: 50000, max: 120000, equipment_min: 45000, equipment_max: 115000, training: 5000, confidence: 'researched', updated: '2024-01', roi_months: 15 },
  'permanent makeup': { min: 5000, max: 15000, equipment_min: 3000, equipment_max: 12000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 4 },
  'microblading': { min: 3000, max: 8000, equipment_min: 1000, equipment_max: 5000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 3 },
  
  // ACNE TREATMENTS (Equipment-based)
  'acne laser': { min: 30000, max: 80000, equipment_min: 25000, equipment_max: 75000, training: 5000, confidence: 'estimated', updated: '2024-01', roi_months: 12 },
  'blue light therapy': { min: 5000, max: 15000, equipment_min: 4000, equipment_max: 13000, training: 2000, confidence: 'estimated', updated: '2024-01', roi_months: 5 },
  'photodynamic therapy': { min: 15000, max: 35000, equipment_min: 12000, equipment_max: 32000, training: 3000, confidence: 'estimated', updated: '2024-01', roi_months: 8 },
};

// Helper function to get integration cost for a procedure
export function getIntegrationCost(procedureName: string): IntegrationCostData | null {
  const normalizedName = procedureName.toLowerCase();
  
  // Direct match in main costs
  if (INTEGRATION_COSTS[normalizedName]) {
    return INTEGRATION_COSTS[normalizedName];
  }
  
  // Direct match in additional costs
  if (ADDITIONAL_INTEGRATION_COSTS[normalizedName]) {
    return ADDITIONAL_INTEGRATION_COSTS[normalizedName];
  }
  
  // Partial match in main costs
  for (const [key, value] of Object.entries(INTEGRATION_COSTS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Partial match in additional costs
  for (const [key, value] of Object.entries(ADDITIONAL_INTEGRATION_COSTS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
}

// Category-based estimation for procedures without specific data
export function estimateIntegrationCost(category: string, complexity: number = 5): IntegrationCostData {
  const categoryPatterns: Record<string, { baseMin: number; baseMax: number; training: number }> = {
    'injectable': { baseMin: 5000, baseMax: 20000, training: 3000 },
    'laser': { baseMin: 30000, baseMax: 80000, training: 5000 },
    'energy device': { baseMin: 40000, baseMax: 100000, training: 5000 },
    'body contouring': { baseMin: 50000, baseMax: 120000, training: 5000 },
    'skin resurfacing': { baseMin: 25000, baseMax: 70000, training: 5000 },
    'dental implant': { baseMin: 20000, baseMax: 50000, training: 5000 },
    'orthodontic': { baseMin: 15000, baseMax: 45000, training: 3000 },
    'cosmetic dental': { baseMin: 10000, baseMax: 40000, training: 3000 },
    'surgical': { baseMin: 30000, baseMax: 80000, training: 10000 },
    'non-invasive': { baseMin: 5000, baseMax: 25000, training: 2000 },
  };
  
  const normalizedCategory = category.toLowerCase();
  let pattern = categoryPatterns['non-invasive']; // default
  
  for (const [key, value] of Object.entries(categoryPatterns)) {
    if (normalizedCategory.includes(key)) {
      pattern = value;
      break;
    }
  }
  
  const complexityMultiplier = 0.5 + (complexity / 10);
  
  return {
    min: Math.round(pattern.baseMin * complexityMultiplier),
    max: Math.round(pattern.baseMax * complexityMultiplier),
    training: pattern.training,
    confidence: 'estimated',
    updated: '2024-01',
    roi_months: Math.round(12 * complexityMultiplier)
  };
}