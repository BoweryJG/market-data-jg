const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Extracted from Perplexity Deep Research
const realProviders = [
  // Upper East Side Dental
  {
    provider_name: 'Tend Upper East Side',
    practice_name: 'Tend',
    address: '1320 Third Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10021',
    phone: '(212) 335-0275',
    website: 'www.hellotend.com',
    industry: 'dental',
    specialties: ['general dentistry', 'cosmetic dentistry'],
    procedures_offered: ['general dentistry', 'invisalign', 'implants', 'emergency care'],
    provider_type: 'group',
    ownership_type: 'dso',
    tech_adoption_score: 92,
    growth_potential_score: 88,
    data_source: 'research',
    verified: true,
    notes: 'Does not accept Medicaid/Medicare Advantage'
  },
  {
    provider_name: 'Upper East Smiles',
    practice_name: 'Upper East Smiles',
    address: '261 E. 78th St',
    city: 'New York',
    state: 'NY',
    zip_code: '10075',
    phone: '(212) 517-9000',
    website: 'www.uppereastsmiles.com',
    industry: 'dental',
    specialties: ['endodontics', 'periodontics', 'cosmetic dentistry'],
    procedures_offered: ['root canals', 'gum treatment', 'veneers', 'implants'],
    provider_type: 'group',
    ownership_type: 'independent',
    tech_adoption_score: 85,
    growth_potential_score: 82,
    data_source: 'research',
    verified: true,
    notes: 'Interdisciplinary care, ADA-recognized specialties'
  },
  {
    provider_name: 'NYC Dental Upper East Side',
    practice_name: 'NYC Dental',
    address: '1317 Third Ave, 2nd Floor',
    city: 'New York',
    state: 'NY',
    zip_code: '10021',
    phone: '(212) 348-5492',
    website: 'www.nycdent.com',
    industry: 'dental',
    specialties: ['cosmetic dentistry', 'general dentistry'],
    procedures_offered: ['porcelain veneers', 'digital scanning', 'teeth whitening', 'crowns'],
    provider_type: 'group',
    ownership_type: 'independent',
    tech_adoption_score: 90,
    equipment_brands: ['Digital Scanner'],
    growth_potential_score: 85,
    data_source: 'research',
    verified: true
  },
  {
    provider_name: 'ZenDentistry Upper East Side',
    practice_name: 'ZenDentistry',
    address: '30 E 60th St, Ste 401',
    city: 'New York',
    state: 'NY',
    zip_code: '10022',
    phone: '(929) 501-5190',
    website: 'www.zendentistry.com',
    industry: 'dental',
    specialties: ['holistic dentistry', 'cosmetic dentistry'],
    procedures_offered: ['holistic care', 'minimally invasive treatments', 'mercury-free fillings'],
    provider_type: 'group',
    ownership_type: 'independent',
    tech_adoption_score: 88,
    growth_potential_score: 83,
    data_source: 'research',
    verified: true
  },

  // Midtown Medical Spas
  {
    provider_name: 'Midtown Medical Spa and Lasers of NYC',
    practice_name: 'Midtown Medical Spa',
    address: '461 Park Ave S, Ste M',
    city: 'New York',
    state: 'NY',
    zip_code: '10016',
    phone: '(646) 956-2139',
    website: 'www.midtownmedicalspa.com',
    industry: 'aesthetic',
    specialties: ['medical spa', 'laser treatments', 'body contouring'],
    procedures_offered: ['coolsculpting', 'microneedling', 'thread lifts', 'laser therapies'],
    provider_type: 'spa',
    ownership_type: 'independent',
    tech_adoption_score: 94,
    equipment_brands: ['CoolSculpting', 'Laser Systems'],
    growth_potential_score: 90,
    data_source: 'research',
    verified: true,
    notes: 'Non-invasive procedures dominate 70% of services'
  },
  {
    provider_name: 'Dr. Brian Cohen, MD',
    practice_name: 'JEMA Beauty Medical Spa',
    address: '461 Park Ave S',
    city: 'New York',
    state: 'NY',
    zip_code: '10016',
    website: 'www.jemabeauty.com',
    industry: 'aesthetic',
    specialties: ['plastic surgery', 'medical spa'],
    procedures_offered: ['fibroblast plasma therapy', 'hydrafacial', 'prp hair restoration', 'botox'],
    provider_type: 'spa',
    ownership_type: 'independent',
    tech_adoption_score: 91,
    growth_potential_score: 87,
    data_source: 'research',
    verified: true
  },

  // Brooklyn Dental
  {
    provider_name: 'The Brooklyn Hospital Dental Center',
    practice_name: 'The Brooklyn Hospital Center',
    address: '155 Ashland Pl',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '11201',
    phone: '(718) 250-8963',
    website: 'www.tbh.org',
    industry: 'dental',
    specialties: ['pediatric dentistry', 'oral surgery'],
    procedures_offered: ['pediatric care', 'oral surgery', 'iv sedation', 'emergency care'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 82,
    growth_potential_score: 78,
    data_source: 'research',
    verified: true,
    insurance_accepted: ['Medicaid', 'Medicare', 'Most major insurance'],
    notes: 'Hospital-based dental center'
  },
  {
    provider_name: 'Bayside Laser Dental',
    practice_name: 'Bayside Laser Dental',
    address: '36-51 Bell Blvd, Ste 201',
    city: 'Queens',
    state: 'NY',
    zip_code: '11361',
    phone: '(718) 224-7272',
    website: 'www.baysidelaserdental.com',
    industry: 'dental',
    specialties: ['laser dentistry', 'cosmetic dentistry'],
    procedures_offered: ['laser dentistry', 'cosmetic whitening', 'veneers', 'crowns'],
    provider_type: 'group',
    ownership_type: 'independent',
    tech_adoption_score: 89,
    equipment_brands: ['Laser Systems'],
    growth_potential_score: 84,
    data_source: 'research',
    verified: true
  },
  {
    provider_name: 'NYU Langone Brooklyn Dental',
    practice_name: 'NYU Langone Health',
    address: 'Multiple locations in Flatbush and Sunset Park',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '11220',
    phone: '(718) 630-7000',
    website: 'www.nyulangone.org',
    industry: 'dental',
    specialties: ['general dentistry', 'oral surgery'],
    procedures_offered: ['general dentistry', 'oral surgery', 'pediatric care'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 86,
    growth_potential_score: 80,
    data_source: 'research',
    verified: true,
    insurance_accepted: ['Medicaid', 'Sliding scale fees'],
    notes: 'Medicaid-friendly with sliding-scale fees'
  },

  // Queens Aesthetic
  {
    provider_name: 'LIC Lifestyle & Beauty',
    practice_name: 'LIC Lifestyle & Beauty',
    address: 'Long Island City waterfront',
    city: 'Queens',
    state: 'NY',
    zip_code: '11101',
    website: 'www.liclifestyle.com',
    industry: 'aesthetic',
    specialties: ['medical spa', 'weight loss'],
    procedures_offered: ['prescription weight loss', 'laser therapies', 'body contouring'],
    provider_type: 'spa',
    ownership_type: 'independent',
    tech_adoption_score: 87,
    growth_potential_score: 85,
    data_source: 'research',
    verified: true
  },
  {
    provider_name: 'Dr. V\'s NY Med Spa',
    practice_name: 'Dr. V\'s NY Med Spa',
    address: 'Multiple locations in Queens',
    city: 'Queens',
    state: 'NY',
    zip_code: '11101',
    website: 'www.drvsnymedspa.com',
    industry: 'aesthetic',
    specialties: ['medical spa', 'cosmetic dermatology'],
    procedures_offered: ['botox', 'laser skin resurfacing', 'iv therapy', 'dermal fillers'],
    provider_type: 'spa',
    ownership_type: 'independent',
    tech_adoption_score: 88,
    growth_potential_score: 86,
    data_source: 'research',
    verified: true
  },
  {
    provider_name: 'Astoria Aesthetics',
    practice_name: 'Astoria Aesthetics',
    address: 'Central Astoria',
    city: 'Queens',
    state: 'NY',
    zip_code: '11102',
    website: 'www.astoriaaesthetics.com',
    industry: 'aesthetic',
    specialties: ['medical spa', 'cosmetic treatments'],
    procedures_offered: ['botox', 'dermal fillers', 'pdo threads', 'chemical peels'],
    provider_type: 'spa',
    ownership_type: 'independent',
    tech_adoption_score: 85,
    growth_potential_score: 83,
    data_source: 'research',
    verified: true,
    notes: '40% of clients are first-gen immigrants seeking culturally sensitive care'
  },

  // NYC Dermatology
  {
    provider_name: 'Mount Sinai Dermatology',
    practice_name: 'Mount Sinai Health System',
    address: 'West 57th St & East 85th St',
    city: 'New York',
    state: 'NY',
    zip_code: '10019',
    phone: '(212) 241-6500',
    website: 'www.mountsinai.org',
    industry: 'aesthetic',
    specialties: ['dermatology', 'mohs surgery'],
    procedures_offered: ['mohs surgery', 'patch testing', 'skin cancer treatment', 'cosmetic dermatology'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 92,
    growth_potential_score: 88,
    data_source: 'research',
    verified: true,
    notes: 'Newly available Mohs surgery at Bellevue'
  },
  {
    provider_name: 'NYU Langone Dermatology',
    practice_name: 'NYU Langone Health',
    address: '240 E 38th St',
    city: 'New York',
    state: 'NY',
    zip_code: '10016',
    phone: '(212) 263-7300',
    website: 'www.nyulangone.org',
    industry: 'aesthetic',
    specialties: ['dermatology', 'research'],
    procedures_offered: ['autoimmune skin disorders', 'pediatric dermatology', 'skin cancer', 'cosmetic procedures'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 95,
    growth_potential_score: 90,
    data_source: 'research',
    verified: true,
    notes: 'AI-driven skin cancer detection with 98% accuracy'
  },
  {
    provider_name: 'Dr. Gary Rothfeld, MD',
    practice_name: 'Park Avenue Dermatology',
    address: '128 Central Park S',
    city: 'New York',
    state: 'NY',
    zip_code: '10019',
    phone: '(212) 644-4484',
    website: 'www.nycdermatologist.com',
    industry: 'aesthetic',
    specialties: ['dermatology', 'skin cancer'],
    procedures_offered: ['skin cancer excision', 'psoriasis treatment', 'cosmetic dermatology'],
    provider_type: 'solo',
    ownership_type: 'independent',
    tech_adoption_score: 86,
    growth_potential_score: 82,
    data_source: 'research',
    verified: true,
    notes: 'Vitals Top Doctor'
  },

  // Manhattan Plastic Surgery
  {
    provider_name: 'Dr. Mark Sultan, MD',
    practice_name: 'Mark Sultan MD',
    address: '1165 Park Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10128',
    phone: '(212) 289-1851',
    website: 'www.sultancenter.com',
    industry: 'aesthetic',
    specialties: ['plastic surgery', 'breast reconstruction'],
    procedures_offered: ['breast reconstruction', 'facial rejuvenation', 'body contouring'],
    provider_type: 'solo',
    ownership_type: 'independent',
    years_in_practice: 30,
    tech_adoption_score: 88,
    growth_potential_score: 85,
    data_source: 'research',
    verified: true,
    notes: '20+ years in Best Doctors lists'
  },
  {
    provider_name: 'NYC Health + Hospitals/MEETH',
    practice_name: 'NYC Health + Hospitals',
    address: '800A 5th Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10065',
    phone: '(212) 434-4500',
    website: 'www.nychealthandhospitals.org',
    industry: 'aesthetic',
    specialties: ['plastic surgery', 'reconstructive surgery'],
    procedures_offered: ['reduced-cost fellowship procedures', 'reconstructive surgery', 'cosmetic surgery'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 83,
    growth_potential_score: 79,
    data_source: 'research',
    verified: true,
    insurance_accepted: ['Medicaid', 'Medicare', 'Reduced cost options']
  },
  {
    provider_name: 'Dr. David Rapaport, MD',
    practice_name: 'Park Avenue Plastic Surgeon',
    address: '35 E 35th St',
    city: 'New York',
    state: 'NY',
    zip_code: '10016',
    phone: '(212) 249-9955',
    website: 'www.parkavenueplasticsurgeon.com',
    industry: 'aesthetic',
    specialties: ['plastic surgery', 'minimally invasive'],
    procedures_offered: ['conservative techniques', 'minimally invasive procedures', 'facial surgery', 'body contouring'],
    provider_type: 'solo',
    ownership_type: 'independent',
    tech_adoption_score: 87,
    growth_potential_score: 84,
    data_source: 'research',
    verified: true,
    notes: 'Philosophy: Conservative, minimally invasive techniques'
  }
];

// Additional providers from deep research
const additionalProviders = [
  {
    provider_name: 'Columbia University Dental Clinic',
    practice_name: 'Columbia University Medical Center',
    address: '622 W 168th St',
    city: 'New York',
    state: 'NY',
    zip_code: '10032',
    phone: '(212) 305-6726',
    website: 'www.dental.columbia.edu',
    industry: 'dental',
    specialties: ['general dentistry', 'student clinic'],
    procedures_offered: ['low-cost care', 'general dentistry', 'student supervised treatments'],
    provider_type: 'clinic',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 78,
    growth_potential_score: 75,
    data_source: 'research',
    verified: true,
    insurance_accepted: ['Medicaid', 'Sliding scale'],
    notes: 'Low-cost care for uninsured patients'
  },
  {
    provider_name: 'Dr. Sara Babich, DDS',
    practice_name: 'Yorkville Pediatric Dentistry',
    address: '1535 York Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10028',
    phone: '(212) 717-0666',
    website: 'www.drbabich.com',
    industry: 'dental',
    specialties: ['pediatric dentistry'],
    procedures_offered: ['pediatric care', 'preventive dentistry', 'early intervention'],
    provider_type: 'solo',
    ownership_type: 'independent',
    tech_adoption_score: 82,
    growth_potential_score: 80,
    data_source: 'research',
    verified: true,
    notes: 'Early dental intervention reduces lifelong costs by 50%'
  },
  {
    provider_name: 'Dr. Monica Halem, MD',
    practice_name: 'Dermatology & Laser Group',
    address: '2035 Lakeville Rd',
    city: 'New Hyde Park',
    state: 'NY',
    zip_code: '11040',
    phone: '(516) 775-0222',
    website: 'www.dermlasergroupny.com',
    industry: 'aesthetic',
    specialties: ['dermatology', 'mohs surgery'],
    procedures_offered: ['mohs surgery', 'laser treatments', 'cosmetic dermatology'],
    provider_type: 'group',
    ownership_type: 'independent',
    tech_adoption_score: 90,
    growth_potential_score: 87,
    data_source: 'research',
    verified: true,
    notes: 'Mohs surgery is the gold standard for NYC aging population'
  },
  {
    provider_name: 'Bellevue Hospital Dermatology',
    practice_name: 'NYC Health + Hospitals/Bellevue',
    address: '462 1st Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10016',
    phone: '(212) 562-4141',
    website: 'www.nychealthandhospitals.org/bellevue',
    industry: 'aesthetic',
    specialties: ['dermatology', 'mohs surgery'],
    procedures_offered: ['mohs micrographic surgery', 'skin cancer treatment', 'general dermatology'],
    provider_type: 'hospital',
    ownership_type: 'hospital_owned',
    tech_adoption_score: 88,
    growth_potential_score: 85,
    data_source: 'research',
    verified: true,
    insurance_accepted: ['Medicaid', 'Medicare', 'NYC Care'],
    notes: '$285k Mohs lab reduces wait times to 24 hours'
  }
];

async function insertRealProviders() {
  console.log('🚀 Inserting real provider data from research...\n');
  
  const allProviders = [...realProviders, ...additionalProviders];
  let savedCount = 0;
  let errorCount = 0;
  
  for (const provider of allProviders) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('provider_locations')
        .select('id')
        .eq('provider_name', provider.provider_name)
        .eq('address', provider.address)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('provider_locations')
          .insert({
            ...provider,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`❌ Error saving ${provider.practice_name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Saved: ${provider.practice_name} - ${provider.provider_name}`);
          savedCount++;
        }
      } else {
        console.log(`⏭️  Skipped (exists): ${provider.practice_name}`);
      }
    } catch (err) {
      console.error(`❌ Error with ${provider.practice_name}:`, err.message);
      errorCount++;
    }
  }
  
  // Get final count
  const { count } = await supabase
    .from('provider_locations')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Summary:`);
  console.log(`   New providers saved: ${savedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total providers in database: ${count}`);
}

// Execute
insertRealProviders().catch(console.error);