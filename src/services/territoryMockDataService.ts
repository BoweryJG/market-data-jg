import { InfluenceLeader, TerritoryMetrics, GeographicPoint } from './territoryIntelligenceService';

// Premium provider data that rotates for public users
const PREMIUM_PROVIDERS: InfluenceLeader[] = [
  // New York Providers
  {
    id: 'ny-1',
    name: 'Dr. Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    organizationName: 'Manhattan Aesthetic Center',
    specialty: 'Facial Plastics',
    city: 'New York',
    state: 'NY',
    kolScore: 92,
    instagramFollowers: 45000,
    instagramEngagementRate: 4.8,
    linkedinConnections: 2800,
    youtubeSubscribers: 15000,
    realselfRating: 4.9,
    realselfReviewCount: 387,
    googleRating: 4.8,
    googleReviewCount: 512,
    verified: true,
    nationalInfluenceScore: 88,
    localInfluenceScore: 95,
    publishedArticles: 23,
    speakingEngagements: 14,
    trainingCoursesOffered: true,
  },
  {
    id: 'ny-2',
    name: 'Dr. Sarah Williams',
    firstName: 'Sarah',
    lastName: 'Williams',
    organizationName: 'Park Avenue Dermatology',
    specialty: 'Cosmetic Dermatology',
    city: 'New York',
    state: 'NY',
    kolScore: 89,
    instagramFollowers: 38000,
    instagramEngagementRate: 5.2,
    linkedinConnections: 2100,
    youtubeSubscribers: 8000,
    realselfRating: 4.8,
    realselfReviewCount: 296,
    googleRating: 4.7,
    googleReviewCount: 428,
    verified: true,
    nationalInfluenceScore: 85,
    localInfluenceScore: 92,
    publishedArticles: 18,
    speakingEngagements: 11,
    trainingCoursesOffered: false,
  },
  {
    id: 'ny-3',
    name: 'Dr. James Rodriguez',
    firstName: 'James',
    lastName: 'Rodriguez',
    organizationName: 'Upper East Side Aesthetics',
    specialty: 'Plastic Surgery',
    city: 'New York',
    state: 'NY',
    kolScore: 87,
    instagramFollowers: 52000,
    instagramEngagementRate: 3.9,
    linkedinConnections: 3200,
    youtubeSubscribers: 18000,
    realselfRating: 4.9,
    realselfReviewCount: 445,
    googleRating: 4.8,
    googleReviewCount: 623,
    verified: true,
    nationalInfluenceScore: 90,
    localInfluenceScore: 88,
    publishedArticles: 31,
    speakingEngagements: 22,
    trainingCoursesOffered: true,
  },
  {
    id: 'ny-4',
    name: 'Dr. Emily Chang',
    firstName: 'Emily',
    lastName: 'Chang',
    organizationName: 'SoHo Skin & Laser',
    specialty: 'Laser Medicine',
    city: 'New York',
    state: 'NY',
    kolScore: 84,
    instagramFollowers: 29000,
    instagramEngagementRate: 6.1,
    linkedinConnections: 1800,
    youtubeSubscribers: 5000,
    realselfRating: 4.7,
    realselfReviewCount: 213,
    googleRating: 4.6,
    googleReviewCount: 334,
    verified: true,
    nationalInfluenceScore: 78,
    localInfluenceScore: 86,
    publishedArticles: 12,
    speakingEngagements: 8,
    trainingCoursesOffered: false,
  },
  {
    id: 'ny-5',
    name: 'Dr. Robert Thompson',
    firstName: 'Robert',
    lastName: 'Thompson',
    organizationName: 'Chelsea Cosmetic Surgery',
    specialty: 'Body Contouring',
    city: 'New York',
    state: 'NY',
    kolScore: 86,
    instagramFollowers: 41000,
    instagramEngagementRate: 4.2,
    linkedinConnections: 2600,
    youtubeSubscribers: 12000,
    realselfRating: 4.8,
    realselfReviewCount: 367,
    googleRating: 4.7,
    googleReviewCount: 489,
    verified: true,
    nationalInfluenceScore: 83,
    localInfluenceScore: 89,
    publishedArticles: 20,
    speakingEngagements: 16,
    trainingCoursesOffered: true,
  },
  
  // Florida Providers
  {
    id: 'fl-1',
    name: 'Dr. Maria Gonzalez',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    organizationName: 'Miami Beach Aesthetics',
    specialty: 'Injectables',
    city: 'Miami Beach',
    state: 'FL',
    kolScore: 91,
    instagramFollowers: 58000,
    instagramEngagementRate: 5.5,
    linkedinConnections: 3400,
    youtubeSubscribers: 22000,
    realselfRating: 4.9,
    realselfReviewCount: 512,
    googleRating: 4.8,
    googleReviewCount: 687,
    verified: true,
    nationalInfluenceScore: 92,
    localInfluenceScore: 94,
    publishedArticles: 28,
    speakingEngagements: 19,
    trainingCoursesOffered: true,
  },
  {
    id: 'fl-2',
    name: 'Dr. Anthony Russo',
    firstName: 'Anthony',
    lastName: 'Russo',
    organizationName: 'Boca Raton Plastic Surgery',
    specialty: 'Breast Surgery',
    city: 'Boca Raton',
    state: 'FL',
    kolScore: 88,
    instagramFollowers: 34000,
    instagramEngagementRate: 4.1,
    linkedinConnections: 2300,
    youtubeSubscribers: 9000,
    realselfRating: 4.8,
    realselfReviewCount: 298,
    googleRating: 4.7,
    googleReviewCount: 412,
    verified: true,
    nationalInfluenceScore: 84,
    localInfluenceScore: 90,
    publishedArticles: 15,
    speakingEngagements: 12,
    trainingCoursesOffered: false,
  },
  {
    id: 'fl-3',
    name: 'Dr. Jennifer Martinez',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    organizationName: 'Orlando Aesthetic Institute',
    specialty: 'Non-Surgical Aesthetics',
    city: 'Orlando',
    state: 'FL',
    kolScore: 85,
    instagramFollowers: 31000,
    instagramEngagementRate: 5.8,
    linkedinConnections: 1900,
    youtubeSubscribers: 7000,
    realselfRating: 4.7,
    realselfReviewCount: 254,
    googleRating: 4.6,
    googleReviewCount: 378,
    verified: true,
    nationalInfluenceScore: 80,
    localInfluenceScore: 87,
    publishedArticles: 10,
    speakingEngagements: 9,
    trainingCoursesOffered: true,
  },
  {
    id: 'fl-4',
    name: 'Dr. William Davis',
    firstName: 'William',
    lastName: 'Davis',
    organizationName: 'Tampa Bay Cosmetic Center',
    specialty: 'Facial Rejuvenation',
    city: 'Tampa',
    state: 'FL',
    kolScore: 83,
    instagramFollowers: 27000,
    instagramEngagementRate: 4.5,
    linkedinConnections: 2000,
    youtubeSubscribers: 6000,
    realselfRating: 4.6,
    realselfReviewCount: 189,
    googleRating: 4.5,
    googleReviewCount: 290,
    verified: true,
    nationalInfluenceScore: 77,
    localInfluenceScore: 84,
    publishedArticles: 8,
    speakingEngagements: 6,
    trainingCoursesOffered: false,
  },
  {
    id: 'fl-5',
    name: 'Dr. Lisa Anderson',
    firstName: 'Lisa',
    lastName: 'Anderson',
    organizationName: 'Fort Lauderdale Dermatology',
    specialty: 'Medical Spa Services',
    city: 'Fort Lauderdale',
    state: 'FL',
    kolScore: 82,
    instagramFollowers: 25000,
    instagramEngagementRate: 5.3,
    linkedinConnections: 1700,
    youtubeSubscribers: 4000,
    realselfRating: 4.7,
    realselfReviewCount: 167,
    googleRating: 4.6,
    googleReviewCount: 245,
    verified: false,
    nationalInfluenceScore: 75,
    localInfluenceScore: 82,
    publishedArticles: 6,
    speakingEngagements: 5,
    trainingCoursesOffered: false,
  },
  
  // Additional rotating pool
  {
    id: 'ny-6',
    name: 'Dr. Alexander Kim',
    firstName: 'Alexander',
    lastName: 'Kim',
    organizationName: 'Brooklyn Heights Aesthetics',
    specialty: 'Regenerative Medicine',
    city: 'Brooklyn',
    state: 'NY',
    kolScore: 81,
    instagramFollowers: 23000,
    instagramEngagementRate: 6.2,
    linkedinConnections: 1600,
    youtubeSubscribers: 3500,
    realselfRating: 4.6,
    realselfReviewCount: 142,
    googleRating: 4.5,
    googleReviewCount: 198,
    verified: true,
    nationalInfluenceScore: 72,
    localInfluenceScore: 80,
    publishedArticles: 5,
    speakingEngagements: 4,
    trainingCoursesOffered: false,
  },
  {
    id: 'fl-6',
    name: 'Dr. Patricia Roberts',
    firstName: 'Patricia',
    lastName: 'Roberts',
    organizationName: 'Naples Aesthetic Surgery',
    specialty: 'Body Sculpting',
    city: 'Naples',
    state: 'FL',
    kolScore: 80,
    instagramFollowers: 21000,
    instagramEngagementRate: 4.8,
    linkedinConnections: 1500,
    youtubeSubscribers: 3000,
    realselfRating: 4.5,
    realselfReviewCount: 128,
    googleRating: 4.4,
    googleReviewCount: 176,
    verified: false,
    nationalInfluenceScore: 70,
    localInfluenceScore: 78,
    publishedArticles: 4,
    speakingEngagements: 3,
    trainingCoursesOffered: false,
  },
];

// Geographic data for demo territories
const GEOGRAPHIC_DATA: { [key: string]: GeographicPoint[] } = {
  NY: [
    { lat: 40.7128, lng: -74.0060, providerCount: 245, influenceScore: 890, city: 'Manhattan', zipCode: '10001' },
    { lat: 40.6782, lng: -73.9442, providerCount: 128, influenceScore: 456, city: 'Brooklyn', zipCode: '11201' },
    { lat: 40.7282, lng: -73.7949, providerCount: 87, influenceScore: 312, city: 'Queens', zipCode: '11354' },
    { lat: 40.8448, lng: -73.8648, providerCount: 65, influenceScore: 234, city: 'Bronx', zipCode: '10451' },
    { lat: 40.5795, lng: -74.1502, providerCount: 43, influenceScore: 167, city: 'Staten Island', zipCode: '10301' },
  ],
  FL: [
    { lat: 25.7617, lng: -80.1918, providerCount: 312, influenceScore: 1123, city: 'Miami', zipCode: '33101' },
    { lat: 26.1224, lng: -80.1373, providerCount: 156, influenceScore: 589, city: 'Fort Lauderdale', zipCode: '33301' },
    { lat: 28.5383, lng: -81.3792, providerCount: 134, influenceScore: 467, city: 'Orlando', zipCode: '32801' },
    { lat: 27.9506, lng: -82.4572, providerCount: 98, influenceScore: 345, city: 'Tampa', zipCode: '33602' },
    { lat: 26.4615, lng: -80.0728, providerCount: 76, influenceScore: 289, city: 'Boca Raton', zipCode: '33432' },
  ],
};

class TerritoryMockDataService {
  private rotationIndex = 0;
  private lastRotation = 0;
  private readonly ROTATION_INTERVAL = 60000; // Rotate every minute

  /**
   * Get rotating top 10 providers for public display
   */
  getRotatingTopProviders(state: 'NY' | 'FL' | 'all' = 'all'): InfluenceLeader[] {
    const now = Date.now();
    
    // Rotate the index if enough time has passed
    if (now - this.lastRotation > this.ROTATION_INTERVAL) {
      this.rotationIndex = (this.rotationIndex + 1) % 3; // 3 different rotations
      this.lastRotation = now;
    }

    let providers = PREMIUM_PROVIDERS;
    
    // Filter by state if specified
    if (state !== 'all') {
      providers = providers.filter(p => p.state === state);
    }

    // Sort by KOL score descending
    providers.sort((a, b) => b.kolScore - a.kolScore);

    // Rotate the starting point
    const startIndex = this.rotationIndex * 3;
    const rotatedProviders = [
      ...providers.slice(startIndex),
      ...providers.slice(0, startIndex)
    ];

    // Return top 10
    return rotatedProviders.slice(0, 10);
  }

  /**
   * Get mock territory metrics for demo mode
   */
  getMockTerritoryMetrics(state: 'NY' | 'FL'): TerritoryMetrics {
    const baseMetrics = {
      NY: {
        territoryId: 'state-ny',
        name: 'New York',
        state: 'NY',
        providerCount: 768,
        influenceScore: 85,
        marketSize: 2850000000,
        growthRate: 12.5,
        opportunityScore: 78,
        competitiveDensity: 92,
        avgRevenue: 675000,
      },
      FL: {
        territoryId: 'state-fl',
        name: 'Florida',
        state: 'FL',
        providerCount: 892,
        influenceScore: 88,
        marketSize: 3200000000,
        growthRate: 15.8,
        opportunityScore: 82,
        competitiveDensity: 87,
        avgRevenue: 725000,
      },
    };

    const metrics = baseMetrics[state];
    const topInfluencers = this.getRotatingTopProviders(state).slice(0, 5);
    const geographicData = GEOGRAPHIC_DATA[state];

    return {
      ...metrics,
      topInfluencers,
      geographicData,
    };
  }

  /**
   * Get mock heat map data for visualization
   */
  getMockGeographicHeatmap(state: 'NY' | 'FL'): GeographicPoint[] {
    const points = GEOGRAPHIC_DATA[state];
    
    // Add some variation to make it look dynamic
    return points.map(point => ({
      ...point,
      providerCount: Math.round(point.providerCount * (0.95 + Math.random() * 0.1)),
      influenceScore: Math.round(point.influenceScore * (0.95 + Math.random() * 0.1)),
    }));
  }

  /**
   * Get demo market insights
   */
  getMockMarketInsights(state: 'NY' | 'FL') {
    return {
      topSpecialties: [
        { specialty: 'Injectables', count: 234, avgInfluence: 82 },
        { specialty: 'Facial Plastics', count: 189, avgInfluence: 78 },
        { specialty: 'Body Contouring', count: 156, avgInfluence: 75 },
        { specialty: 'Laser Medicine', count: 142, avgInfluence: 73 },
        { specialty: 'Non-Surgical Aesthetics', count: 128, avgInfluence: 71 },
      ],
      marketConcentration: state === 'NY' ? [
        { city: 'Manhattan', providerCount: 245, marketShare: 31.9 },
        { city: 'Brooklyn', providerCount: 128, marketShare: 16.7 },
        { city: 'Queens', providerCount: 87, marketShare: 11.3 },
        { city: 'Bronx', providerCount: 65, marketShare: 8.5 },
        { city: 'Staten Island', providerCount: 43, marketShare: 5.6 },
      ] : [
        { city: 'Miami', providerCount: 312, marketShare: 35.0 },
        { city: 'Fort Lauderdale', providerCount: 156, marketShare: 17.5 },
        { city: 'Orlando', providerCount: 134, marketShare: 15.0 },
        { city: 'Tampa', providerCount: 98, marketShare: 11.0 },
        { city: 'Boca Raton', providerCount: 76, marketShare: 8.5 },
      ],
      growthTrends: [
        { month: 'Jan', newProviders: 12, influenceGrowth: 3.2 },
        { month: 'Feb', newProviders: 15, influenceGrowth: 4.1 },
        { month: 'Mar', newProviders: 18, influenceGrowth: 5.3 },
        { month: 'Apr', newProviders: 14, influenceGrowth: 3.8 },
        { month: 'May', newProviders: 22, influenceGrowth: 6.7 },
        { month: 'Jun', newProviders: 19, influenceGrowth: 5.5 },
      ],
    };
  }
}

export const territoryMockDataService = new TerritoryMockDataService();