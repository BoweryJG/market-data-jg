import { search as braveSearch } from './braveSearchService';

interface EnhancedProcedureData {
  detailedDescription: string;
  benefits: string[];
  candidatesFor: string[];
  latestTechniques: string[];
  expectedResults: string;
  preparationSteps: string[];
  aftercare: string[];
  averageSessionTime?: string;
  technologyUsed?: string[];
}

interface CacheEntry {
  data: EnhancedProcedureData;
  timestamp: number;
}

class ProcedureEnhancementService {
  private static instance: ProcedureEnhancementService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): ProcedureEnhancementService {
    if (!ProcedureEnhancementService.instance) {
      ProcedureEnhancementService.instance = new ProcedureEnhancementService();
    }
    return ProcedureEnhancementService.instance;
  }

  private getCacheKey(procedureName: string, industry: string): string {
    return `${industry}-${procedureName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  async getEnhancedProcedureData(
    procedureName: string,
    industry: 'dental' | 'aesthetic',
    existingDescription?: string
  ): Promise<EnhancedProcedureData> {
    const cacheKey = this.getCacheKey(procedureName, industry);
    
    // Check cache first
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isValidCache(cachedEntry)) {
      console.log(`✨ Using cached data for ${procedureName}`);
      return cachedEntry.data;
    }

    console.log(`🔍 Fetching enhanced data for ${procedureName}...`);

    try {
      // Construct comprehensive search query
      const searchQuery = `${procedureName} ${industry} procedure detailed description benefits candidates preparation aftercare latest techniques 2025`;
      
      // Fetch search results
      const searchResults = await braveSearch(searchQuery, 15);
      
      // Extract and process information from search results
      const enhancedData = await this.processSearchResults(
        searchResults,
        procedureName,
        industry,
        existingDescription
      );

      // Cache the results
      this.cache.set(cacheKey, {
        data: enhancedData,
        timestamp: Date.now()
      });

      return enhancedData;
    } catch (error) {
      console.error(`❌ Error fetching enhanced data for ${procedureName}:`, error);
      
      // Return fallback data
      return this.getFallbackData(procedureName, industry, existingDescription);
    }
  }

  private async processSearchResults(
    searchResults: any,
    procedureName: string,
    industry: string,
    existingDescription?: string
  ): Promise<EnhancedProcedureData> {
    const webResults = searchResults?.web?.results || [];
    
    // Extract information from search results
    const descriptions: string[] = [];
    const benefits: Set<string> = new Set();
    const techniques: Set<string> = new Set();
    const candidatesInfo: Set<string> = new Set();
    const preparationInfo: Set<string> = new Set();
    const aftercareInfo: Set<string> = new Set();

    webResults.forEach((result: any) => {
      const content = `${result.title} ${result.description}`.toLowerCase();
      
      // Extract descriptions
      if (result.description && result.description.length > 50) {
        descriptions.push(result.description);
      }

      // Extract benefits
      if (content.includes('benefit') || content.includes('advantage') || content.includes('improve')) {
        const benefitMatch = result.description.match(/(?:benefits?|advantages?|improves?)[^.]+\./gi);
        if (benefitMatch) {
          benefitMatch.forEach((b: string) => benefits.add(this.cleanText(b)));
        }
      }

      // Extract techniques
      if (content.includes('technique') || content.includes('technology') || content.includes('method')) {
        const techniqueMatch = result.description.match(/(?:techniques?|technology|methods?)[^.]+\./gi);
        if (techniqueMatch) {
          techniqueMatch.forEach((t: string) => techniques.add(this.cleanText(t)));
        }
      }

      // Extract candidate information
      if (content.includes('candidate') || content.includes('suitable for') || content.includes('ideal for')) {
        const candidateMatch = result.description.match(/(?:candidates?|suitable for|ideal for)[^.]+\./gi);
        if (candidateMatch) {
          candidateMatch.forEach((c: string) => candidatesInfo.add(this.cleanText(c)));
        }
      }

      // Extract preparation steps
      if (content.includes('prepare') || content.includes('before the procedure')) {
        const prepMatch = result.description.match(/(?:preparation|prepare|before the procedure)[^.]+\./gi);
        if (prepMatch) {
          prepMatch.forEach((p: string) => preparationInfo.add(this.cleanText(p)));
        }
      }

      // Extract aftercare
      if (content.includes('aftercare') || content.includes('recovery') || content.includes('post-procedure')) {
        const afterMatch = result.description.match(/(?:aftercare|recovery|post-procedure)[^.]+\./gi);
        if (afterMatch) {
          afterMatch.forEach((a: string) => aftercareInfo.add(this.cleanText(a)));
        }
      }
    });

    // Combine and enhance the description
    const enhancedDescription = this.createEnhancedDescription(
      procedureName,
      industry,
      descriptions,
      existingDescription
    );

    // Process and limit arrays
    const processedBenefits = this.processInfoSet(benefits, 5);
    const processedTechniques = this.processInfoSet(techniques, 4);
    const processedCandidates = this.processInfoSet(candidatesInfo, 4);
    const processedPreparation = this.processInfoSet(preparationInfo, 4);
    const processedAftercare = this.processInfoSet(aftercareInfo, 4);

    return {
      detailedDescription: enhancedDescription,
      benefits: processedBenefits,
      candidatesFor: processedCandidates,
      latestTechniques: processedTechniques,
      expectedResults: this.generateExpectedResults(procedureName, industry),
      preparationSteps: processedPreparation,
      aftercare: processedAftercare,
      averageSessionTime: this.estimateSessionTime(procedureName, industry),
      technologyUsed: this.identifyTechnology(procedureName, industry, techniques)
    };
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/^[^a-zA-Z]+/, '')
      .replace(/[^a-zA-Z]+$/, '')
      .trim();
  }

  private processInfoSet(infoSet: Set<string>, limit: number): string[] {
    return Array.from(infoSet)
      .filter(item => item.length > 20 && item.length < 200)
      .slice(0, limit)
      .map(item => {
        // Capitalize first letter and ensure proper ending
        const cleaned = item.charAt(0).toUpperCase() + item.slice(1);
        return cleaned.endsWith('.') ? cleaned : cleaned + '.';
      });
  }

  private createEnhancedDescription(
    procedureName: string,
    industry: string,
    descriptions: string[],
    existingDescription?: string
  ): string {
    // Start with existing description if available
    let enhanced = existingDescription || `${procedureName} is a ${industry} procedure that `;

    // Find the most comprehensive description from search results
    const bestDescription = descriptions
      .filter(d => d.length > 100)
      .sort((a, b) => b.length - a.length)[0];

    if (bestDescription && bestDescription.length > enhanced.length) {
      enhanced = bestDescription;
    }

    // Add context if the description is too short
    if (enhanced.length < 150) {
      enhanced += ` This ${industry} treatment is designed to address specific patient needs with modern techniques and proven results. `;
      enhanced += industry === 'dental' 
        ? 'The procedure focuses on improving oral health and function while ensuring patient comfort.'
        : 'This aesthetic treatment aims to enhance appearance and boost confidence through minimally invasive methods.';
    }

    return enhanced;
  }

  private generateExpectedResults(procedureName: string, industry: string): string {
    const baseResults = industry === 'dental'
      ? 'Patients can expect improved oral health, reduced discomfort, and enhanced dental function. '
      : 'Patients typically see visible improvements in appearance, enhanced confidence, and natural-looking results. ';

    return baseResults + `Results from ${procedureName} are generally long-lasting with proper care and maintenance.`;
  }

  private estimateSessionTime(procedureName: string, industry: string): string {
    // Basic estimation based on procedure type
    const name = procedureName.toLowerCase();
    
    if (name.includes('consultation') || name.includes('exam')) return '30-45 minutes';
    if (name.includes('cleaning') || name.includes('whitening')) return '45-60 minutes';
    if (name.includes('filling') || name.includes('injection')) return '30-60 minutes';
    if (name.includes('crown') || name.includes('implant')) return '60-120 minutes';
    if (name.includes('surgery') || name.includes('lift')) return '2-4 hours';
    
    return industry === 'dental' ? '45-90 minutes' : '30-90 minutes';
  }

  private identifyTechnology(
    procedureName: string,
    industry: string,
    techniques: Set<string>
  ): string[] {
    const technologies: string[] = [];
    const name = procedureName.toLowerCase();
    const techString = Array.from(techniques).join(' ').toLowerCase();

    // Common dental technologies
    if (industry === 'dental') {
      if (name.includes('implant') || techString.includes('implant')) technologies.push('3D Imaging');
      if (name.includes('crown') || techString.includes('cad')) technologies.push('CAD/CAM Technology');
      if (name.includes('laser') || techString.includes('laser')) technologies.push('Laser Dentistry');
      if (name.includes('digital') || techString.includes('digital')) technologies.push('Digital X-rays');
    }

    // Common aesthetic technologies
    if (industry === 'aesthetic') {
      if (name.includes('laser') || techString.includes('laser')) technologies.push('Advanced Laser Systems');
      if (name.includes('rf') || techString.includes('radiofrequency')) technologies.push('Radiofrequency Technology');
      if (name.includes('ultrasound') || techString.includes('ultrasound')) technologies.push('Ultrasound Technology');
      if (name.includes('injection') || techString.includes('injection')) technologies.push('Precision Injection Systems');
    }

    return technologies.length > 0 ? technologies : ['Modern Clinical Equipment'];
  }

  private getFallbackData(
    procedureName: string,
    industry: string,
    existingDescription?: string
  ): EnhancedProcedureData {
    return {
      detailedDescription: existingDescription || `${procedureName} is a professional ${industry} procedure performed by qualified practitioners.`,
      benefits: [
        `Addresses specific ${industry} concerns effectively.`,
        'Performed by experienced professionals.',
        'Uses modern techniques and equipment.',
        'Tailored to individual patient needs.'
      ],
      candidatesFor: [
        'Patients seeking professional treatment.',
        'Those looking for proven results.',
        'Individuals with specific treatment goals.',
        'Patients in good general health.'
      ],
      latestTechniques: [
        'State-of-the-art equipment and methods.',
        'Evidence-based treatment protocols.',
        'Minimally invasive approaches when possible.',
        'Patient comfort optimization.'
      ],
      expectedResults: `Professional results tailored to individual needs with proper care and follow-up.`,
      preparationSteps: [
        'Consultation with healthcare provider.',
        'Review of medical history.',
        'Discussion of treatment goals.',
        'Pre-procedure instructions as needed.'
      ],
      aftercare: [
        'Follow post-procedure instructions carefully.',
        'Attend scheduled follow-up appointments.',
        'Maintain recommended care routine.',
        'Contact provider with any concerns.'
      ],
      averageSessionTime: industry === 'dental' ? '45-90 minutes' : '30-90 minutes',
      technologyUsed: ['Modern Clinical Equipment']
    };
  }
}

export const procedureEnhancementService = ProcedureEnhancementService.getInstance();
export type { EnhancedProcedureData };