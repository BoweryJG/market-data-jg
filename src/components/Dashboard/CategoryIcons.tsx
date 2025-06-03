import React from 'react';
import {
  MonitorHeart,
  Shield,
  Healing,
  AutoAwesome,
  MedicalServices,
  Biotech,
  Nature,
  Architecture,
  Straighten,
  Build,
  Computer,
  FaceRetouchingNatural,
  Vaccines,
  Accessibility,
  WbSunny,
  Grain,
  AutoFixHigh,
  Flare,
  Diamond,
  FitnessCenter,
  Waves,
  SelfImprovement,
  Palette,
  LocalPharmacy,
  SentimentVerySatisfied,
  Spa,
  Science,
  MedicalInformation,
  Face,
  Psychology,
  Engineering,
  CameraAlt,
  LocalHospital,
  Mood,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Icon mapping with explicit icon components
export const categoryIcons: Record<string, { icon: React.ComponentType<any>, color: string }> = {
  // Dental Categories (with and without "Procedures" suffix) - ENHANCED COLORS
  'Diagnostic': { icon: MonitorHeart, color: '#1E88E5' }, // Brilliant Blue
  'Diagnostic Procedures': { icon: MonitorHeart, color: '#1E88E5' },
  'Preventive': { icon: Shield, color: '#43A047' }, // Emerald Green
  'Preventive Procedures': { icon: Shield, color: '#43A047' },
  'Restorative': { icon: Healing, color: '#FB8C00' }, // Vibrant Orange
  'Restorative Procedures': { icon: Healing, color: '#FB8C00' },
  'Cosmetic': { icon: AutoAwesome, color: '#E91E63' }, // Hot Pink
  'Cosmetic Procedures': { icon: AutoAwesome, color: '#E91E63' },
  'Oral Surgery': { icon: MedicalServices, color: '#E53935' }, // Crimson Red
  'Oral Surgery Procedures': { icon: MedicalServices, color: '#E53935' },
  'Endodontic': { icon: Biotech, color: '#8E24AA' }, // Royal Purple
  'Endodontic Procedures': { icon: Biotech, color: '#8E24AA' },
  'Periodontic': { icon: Nature, color: '#43A047' }, // Forest Green
  'Periodontic Procedures': { icon: Nature, color: '#43A047' },
  'Prosthodontic': { icon: Architecture, color: '#546E7A' }, // Steel Blue
  'Prosthodontic Procedures': { icon: Architecture, color: '#546E7A' },
  'Orthodontic': { icon: Straighten, color: '#00ACC1' }, // Turquoise
  'Orthodontic Procedures': { icon: Straighten, color: '#00ACC1' },
  'Implantology': { icon: Build, color: '#3949AB' }, // Indigo
  'Implantology Procedures': { icon: Build, color: '#3949AB' },
  'Digital Dentistry': { icon: Computer, color: '#5E35B1' }, // Deep Purple
  'Digital Dentistry Procedures': { icon: Computer, color: '#5E35B1' },
  
  // Aesthetic Categories - LUXURY COLORS
  'Facial Aesthetic': { icon: FaceRetouchingNatural, color: '#EC407A' }, // Rose Gold
  'Facial Aesthetic Procedures': { icon: FaceRetouchingNatural, color: '#EC407A' },
  'Injectables': { icon: Vaccines, color: '#AB47BC' }, // Orchid Purple
  'Injectables Procedures': { icon: Vaccines, color: '#AB47BC' },
  'Body': { icon: Accessibility, color: '#FF5722' }, // Flame Orange
  'Body Procedures': { icon: Accessibility, color: '#FF5722' },
  'Skin': { icon: WbSunny, color: '#FFB300' }, // Golden Amber
  'Skin Procedures': { icon: WbSunny, color: '#FFB300' },
  'Hair': { icon: Grain, color: '#6D4C41' }, // Mahogany
  'Hair Procedures': { icon: Grain, color: '#6D4C41' },
  'Minimally Invasive': { icon: AutoFixHigh, color: '#00BCD4' }, // Crystal Blue
  'Minimally Invasive Procedures': { icon: AutoFixHigh, color: '#00BCD4' },
  'Regenerative': { icon: Biotech, color: '#66BB6A' }, // Jade Green
  'Regenerative Procedures': { icon: Biotech, color: '#66BB6A' },
  'Lasers': { icon: Flare, color: '#FF6F00' }, // Electric Orange
  'Lasers Procedures': { icon: Flare, color: '#FF6F00' },
  'Combination': { icon: Diamond, color: '#7E57C2' }, // Amethyst
  'Combination Procedures': { icon: Diamond, color: '#7E57C2' },
  
  // Subcategories
  'Body Contouring': { icon: FitnessCenter, color: '#FF5722' },
  'Body Contouring Procedures': { icon: FitnessCenter, color: '#FF5722' },
  'Skin Resurfacing': { icon: Waves, color: '#00BCD4' },
  'Skin Resurfacing Procedures': { icon: Waves, color: '#00BCD4' },
  'Skin Tightening': { icon: SelfImprovement, color: '#4CAF50' },
  'Skin Tightening Procedures': { icon: SelfImprovement, color: '#4CAF50' },
  'Pigmentation': { icon: Palette, color: '#FF9800' },
  'Pigmentation Procedures': { icon: Palette, color: '#FF9800' },
  
  // Additional categories from console logs
  'Imaging': { icon: CameraAlt, color: '#2196F3' },
  'Imaging Procedures': { icon: CameraAlt, color: '#2196F3' },
  'Single Implants': { icon: Build, color: '#3F51B5' },
  'Extractions': { icon: MedicalServices, color: '#F44336' },
  'Whitening': { icon: AutoAwesome, color: '#FFC107' },
  'Whitening Procedures': { icon: AutoAwesome, color: '#FFC107' },
  'Cleanings': { icon: Spa, color: '#4CAF50' },
  'Cleanings Procedures': { icon: Spa, color: '#4CAF50' },
  'Ablative Lasers': { icon: Flare, color: '#FF5722' },
  'MediFacial Combos': { icon: Face, color: '#E91E63' },
  'Fillings': { icon: Healing, color: '#FF9800' },
  'Fillings Procedures': { icon: Healing, color: '#FF9800' },
  'PRP Treatments': { icon: Biotech, color: '#4CAF50' },
  'Hair Restoration': { icon: Grain, color: '#795548' },
  'Neuromodulators': { icon: Psychology, color: '#9C27B0' },
  'Non-surgical Facial': { icon: Face, color: '#E91E63' },
  'Non-surgical Facial Procedures': { icon: Face, color: '#E91E63' },
  'Stem Cell Procedures': { icon: Science, color: '#4CAF50' },
  'Stem Cell Procedures Procedures': { icon: Science, color: '#4CAF50' },
  'Sealants': { icon: Shield, color: '#00BCD4' },
  'Sealants Procedures': { icon: Shield, color: '#00BCD4' },
  'Crowns': { icon: Architecture, color: '#795548' },
  'Crowns Procedures': { icon: Architecture, color: '#795548' },
  'Screening': { icon: MonitorHeart, color: '#2196F3' },
  'Screening Procedures': { icon: MonitorHeart, color: '#2196F3' },
  'Veneers': { icon: Architecture, color: '#607D8B' },
  'Veneers Procedures': { icon: Architecture, color: '#607D8B' },
  'Bone Grafting': { icon: Engineering, color: '#FF7043' },
  'Bone Grafting Procedures': { icon: Engineering, color: '#FF7043' },
  'Full Arch Implants': { icon: Build, color: '#3F51B5' },
  'Facial Contouring': { icon: Face, color: '#E91E63' },
  'Facial Contouring Procedures': { icon: Face, color: '#E91E63' },
  'Dermal Fillers': { icon: Vaccines, color: '#E91E63' },
  'Dermal Fillers Procedures': { icon: Vaccines, color: '#E91E63' },
  'Body Tightening': { icon: FitnessCenter, color: '#FF5722' },
  'Body Tightening Procedures': { icon: FitnessCenter, color: '#FF5722' },
  'Hair Removal': { icon: Grain, color: '#795548' },
  'Hair Removal Procedures': { icon: Grain, color: '#795548' },
  'Non-ablative Lasers': { icon: AutoFixHigh, color: '#FF9800' },
  'Total Face Rejuvenation': { icon: FaceRetouchingNatural, color: '#E91E63' },
  'Total Face Rejuvenation Procedures': { icon: FaceRetouchingNatural, color: '#E91E63' },
  'Bridges': { icon: Architecture, color: '#607D8B' },
  'Bridges Procedures': { icon: Architecture, color: '#607D8B' },
  'Mini Implants': { icon: Build, color: '#3F51B5' },
  'Esthetic Bonding': { icon: AutoAwesome, color: '#E91E63' },
  'Esthetic Bonding Procedures': { icon: AutoAwesome, color: '#E91E63' },
  'Facial Resurfacing': { icon: Waves, color: '#00BCD4' },
  'Facial Resurfacing Procedures': { icon: Waves, color: '#00BCD4' },
  'Fractionated Lasers': { icon: Flare, color: '#FF6F00' },
  'Fractionated Lasers Procedures': { icon: Flare, color: '#FF6F00' },
  'Biostimulators': { icon: Biotech, color: '#4CAF50' },
  'Biostimulators Procedures': { icon: Biotech, color: '#4CAF50' },
  'Fluoride Treatments': { icon: Shield, color: '#00BCD4' },
  'Fluoride Treatments Procedures': { icon: Shield, color: '#00BCD4' },
  'Body Transformation Packages': { icon: FitnessCenter, color: '#FF5722' },
  'Body Transformation Packages Procedures': { icon: FitnessCenter, color: '#FF5722' },
  'Cellulite Treatments': { icon: FitnessCenter, color: '#FFA726' },
  'Cellulite Treatments Procedures': { icon: FitnessCenter, color: '#FFA726' },
  'Digital Diagnostics': { icon: Computer, color: '#673AB7' },
  'Digital Diagnostics Procedures': { icon: Computer, color: '#673AB7' },
  'Growth Factor Therapies': { icon: Biotech, color: '#4CAF50' },
  'Growth Factor Therapies Procedures': { icon: Biotech, color: '#4CAF50' },
  'Tissue Procedures': { icon: Healing, color: '#FF9800' },
  'Tissue Procedures Procedures': { icon: Healing, color: '#FF9800' },
  'Pediatric': { icon: Face, color: '#FFC107' },
  'Pediatric Procedures': { icon: Face, color: '#FFC107' },
  'TMJ/Orofacial Pain': { icon: MedicalServices, color: '#F44336' },
  'TMJ/Orofacial Pain Procedures': { icon: MedicalServices, color: '#F44336' },
  'Sleep Dentistry': { icon: Mood, color: '#673AB7' },
  'Sleep Dentistry Procedures': { icon: Mood, color: '#673AB7' },
  'Adjunctive': { icon: LocalHospital, color: '#2196F3' },
  'Adjunctive Procedures': { icon: LocalHospital, color: '#2196F3' },
};

// Default icon if category not found
export const defaultCategoryIcon = { icon: CategoryIcon, color: '#9E9E9E' };

// Get icon for category with fallback
export const getCategoryIconConfig = (categoryName: string) => {
  // Try exact match first
  if (categoryIcons[categoryName]) {
    return categoryIcons[categoryName];
  }
  
  // Try without "Procedures" suffix
  const nameWithoutProcedures = categoryName.replace(' Procedures', '');
  if (categoryIcons[nameWithoutProcedures]) {
    return categoryIcons[nameWithoutProcedures];
  }
  
  // Return default
  return defaultCategoryIcon;
};