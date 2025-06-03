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
  // Dental Categories
  'Diagnostic': { icon: MonitorHeart, color: '#2196F3' },
  'Preventive': { icon: Shield, color: '#4CAF50' },
  'Restorative': { icon: Healing, color: '#FF9800' },
  'Cosmetic': { icon: AutoAwesome, color: '#E91E63' },
  'Oral Surgery': { icon: MedicalServices, color: '#F44336' },
  'Endodontic': { icon: Biotech, color: '#9C27B0' },
  'Periodontic': { icon: Nature, color: '#4CAF50' },
  'Prosthodontic': { icon: Architecture, color: '#607D8B' },
  'Orthodontic': { icon: Straighten, color: '#00BCD4' },
  'Implantology': { icon: Build, color: '#3F51B5' },
  'Digital Dentistry': { icon: Computer, color: '#673AB7' },
  
  // Aesthetic Categories
  'Facial Aesthetic': { icon: FaceRetouchingNatural, color: '#E91E63' },
  'Injectables': { icon: Vaccines, color: '#9C27B0' },
  'Body': { icon: Accessibility, color: '#FF5722' },
  'Skin': { icon: WbSunny, color: '#FF9800' },
  'Hair': { icon: Grain, color: '#795548' },
  'Minimally Invasive': { icon: AutoFixHigh, color: '#00BCD4' },
  'Regenerative': { icon: Biotech, color: '#4CAF50' },
  'Lasers': { icon: Flare, color: '#FF6F00' },
  'Combination': { icon: Diamond, color: '#673AB7' },
  
  // Subcategories
  'Body Contouring': { icon: FitnessCenter, color: '#FF5722' },
  'Skin Resurfacing': { icon: Waves, color: '#00BCD4' },
  'Skin Tightening': { icon: SelfImprovement, color: '#4CAF50' },
  'Pigmentation': { icon: Palette, color: '#FF9800' },
  
  // Add more mappings as needed
};

// Default icon if category not found
export const defaultCategoryIcon = { icon: CategoryIcon, color: '#9E9E9E' };

// Get icon for category with fallback
export const getCategoryIconConfig = (categoryName: string) => {
  return categoryIcons[categoryName] || defaultCategoryIcon;
};