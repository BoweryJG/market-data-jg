export interface EstimatedProcedure {
  name: string;
  category: string;
  industry: 'dental' | 'aesthetic';
  market_size_usd: number;
  growth_rate: number;
  average_cost_usd: number;
  top_companies: string[];
  confidence_score: number;
  volume_per_year: number;
}

export interface EstimatedMarketData {
  year: number;
  procedures: EstimatedProcedure[];
  total_market_size: number;
  average_growth_rate: number;
}

// Sample data generator for medical device market
export function getEstimatedMarketData(year: number): EstimatedMarketData {
  const baseYear = 2025;
  const yearDiff = year - baseYear;
  const growthFactor = Math.pow(1.08, yearDiff); // 8% annual growth
  
  const baseProcedures: EstimatedProcedure[] = [
    // Dental procedures
    {
      name: "Dental Implants",
      category: "Implants",
      industry: "dental",
      market_size_usd: 4500000000 * growthFactor,
      growth_rate: 12.5,
      average_cost_usd: 3500,
      top_companies: ["Straumann", "Dentsply Sirona", "Nobel Biocare", "Zimmer Biomet"],
      confidence_score: 85,
      volume_per_year: 3000000
    },
    {
      name: "Clear Aligners",
      category: "Orthodontics",
      industry: "dental",
      market_size_usd: 3200000000 * growthFactor,
      growth_rate: 15.8,
      average_cost_usd: 4500,
      top_companies: ["Align Technology", "3M", "Dentsply Sirona", "Ormco"],
      confidence_score: 90,
      volume_per_year: 2500000
    },
    {
      name: "Dental Crowns",
      category: "Restorative",
      industry: "dental",
      market_size_usd: 2800000000 * growthFactor,
      growth_rate: 8.5,
      average_cost_usd: 1200,
      top_companies: ["Dentsply Sirona", "Ivoclar Vivadent", "3M", "GC Corporation"],
      confidence_score: 88,
      volume_per_year: 5000000
    },
    {
      name: "Root Canal Treatment",
      category: "Endodontics",
      industry: "dental",
      market_size_usd: 1900000000 * growthFactor,
      growth_rate: 6.2,
      average_cost_usd: 900,
      top_companies: ["Dentsply Sirona", "Kerr", "Coltene", "FKG Dentaire"],
      confidence_score: 82,
      volume_per_year: 15000000
    },
    {
      name: "Teeth Whitening",
      category: "Cosmetic",
      industry: "dental",
      market_size_usd: 1200000000 * growthFactor,
      growth_rate: 10.5,
      average_cost_usd: 500,
      top_companies: ["Philips", "Ultradent", "SDI Limited", "Colgate"],
      confidence_score: 78,
      volume_per_year: 8000000
    },
    
    // Aesthetic procedures
    {
      name: "Botox Injections",
      category: "Injectables",
      industry: "aesthetic",
      market_size_usd: 5200000000 * growthFactor,
      growth_rate: 14.2,
      average_cost_usd: 600,
      top_companies: ["Allergan", "Ipsen", "Merz", "Evolus"],
      confidence_score: 92,
      volume_per_year: 7000000
    },
    {
      name: "Dermal Fillers",
      category: "Injectables",
      industry: "aesthetic",
      market_size_usd: 4100000000 * growthFactor,
      growth_rate: 16.5,
      average_cost_usd: 800,
      top_companies: ["Allergan", "Galderma", "Merz", "Teoxane"],
      confidence_score: 89,
      volume_per_year: 4500000
    },
    {
      name: "Laser Hair Removal",
      category: "Energy-based",
      industry: "aesthetic",
      market_size_usd: 1800000000 * growthFactor,
      growth_rate: 11.8,
      average_cost_usd: 300,
      top_companies: ["Lumenis", "Cynosure", "Cutera", "Syneron Candela"],
      confidence_score: 85,
      volume_per_year: 12000000
    },
    {
      name: "Chemical Peels",
      category: "Skin Resurfacing",
      industry: "aesthetic",
      market_size_usd: 1200000000 * growthFactor,
      growth_rate: 9.5,
      average_cost_usd: 200,
      top_companies: ["SkinCeuticals", "Obagi", "PCA Skin", "Glytone"],
      confidence_score: 80,
      volume_per_year: 6000000
    },
    {
      name: "Microneedling",
      category: "Skin Resurfacing",
      industry: "aesthetic",
      market_size_usd: 950000000 * growthFactor,
      growth_rate: 18.2,
      average_cost_usd: 350,
      top_companies: ["Eclipse", "SkinPen", "Dermapen", "MDPen"],
      confidence_score: 77,
      volume_per_year: 3500000
    },
    {
      name: "IPL Photofacial",
      category: "Energy-based",
      industry: "aesthetic",
      market_size_usd: 1600000000 * growthFactor,
      growth_rate: 10.8,
      average_cost_usd: 400,
      top_companies: ["Lumenis", "Cutera", "Syneron Candela", "Sciton"],
      confidence_score: 83,
      volume_per_year: 4000000
    },
    {
      name: "CoolSculpting",
      category: "Body Contouring",
      industry: "aesthetic",
      market_size_usd: 2200000000 * growthFactor,
      growth_rate: 13.5,
      average_cost_usd: 2000,
      top_companies: ["Allergan", "BTL", "InMode", "Cutera"],
      confidence_score: 86,
      volume_per_year: 1200000
    },
    {
      name: "Thread Lift",
      category: "Minimally Invasive",
      industry: "aesthetic",
      market_size_usd: 850000000 * growthFactor,
      growth_rate: 22.5,
      average_cost_usd: 1500,
      top_companies: ["Aptos", "Silhouette Soft", "PDO Max", "MINT"],
      confidence_score: 74,
      volume_per_year: 600000
    },
    {
      name: "Platelet-Rich Plasma",
      category: "Regenerative",
      industry: "aesthetic",
      market_size_usd: 650000000 * growthFactor,
      growth_rate: 19.8,
      average_cost_usd: 900,
      top_companies: ["Eclipse", "Emcyte", "Arthrex", "Apex Biologix"],
      confidence_score: 72,
      volume_per_year: 800000
    },
    {
      name: "Laser Skin Resurfacing",
      category: "Energy-based",
      industry: "aesthetic",
      market_size_usd: 2800000000 * growthFactor,
      growth_rate: 12.2,
      average_cost_usd: 2500,
      top_companies: ["Lumenis", "Sciton", "Cynosure", "Cutera"],
      confidence_score: 88,
      volume_per_year: 1200000
    }
  ];
  
  // Add some random variation to make it look more realistic
  const procedures = baseProcedures.map(proc => ({
    ...proc,
    market_size_usd: proc.market_size_usd * (0.9 + Math.random() * 0.2),
    growth_rate: proc.growth_rate + (Math.random() - 0.5) * 2,
    confidence_score: Math.min(100, proc.confidence_score + Math.floor(Math.random() * 5))
  }));
  
  const total_market_size = procedures.reduce((sum, proc) => sum + proc.market_size_usd, 0);
  const average_growth_rate = procedures.reduce((sum, proc) => sum + proc.growth_rate, 0) / procedures.length;
  
  return {
    year,
    procedures,
    total_market_size,
    average_growth_rate
  };
}