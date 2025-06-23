import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUnmatched() {
  // Names we tried to update
  const attemptedNames = [
    'Botox (OnabotulinumtoxinA)',
    'Juvederm (Hyaluronic Acid Filler)', 
    'Restylane (Hyaluronic Acid Filler)',
    'Breast Augmentation',
    'Liposuction',
    'Tummy Tuck',
    'Chemical Peel',
    'Laser Skin Resurfacing',
    'Microneedling',
    'CoolSculpting',
    'Dysport',
    'Xeomin',
    'Sculptra (Poly-L-Lactic Acid Filler)',
    'Radiesse',
    'Bellafill',
    'Kybella (Deoxycholic Acid)',
    'HydraFacial',
    'IPL (Intense Pulsed Light)',
    'Fraxel',
    'Clear + Brilliant',
    'Ultherapy',
    'Thermage',
    'Thread Lift',
    'PRP for Hair Loss',
    'Laser Hair Removal',
    'Vaginoplasty',
    'Labiaplasty',
    'Brazilian Butt Lift',
    'Facelift',
    'Rhinoplasty',
    'Blepharoplasty',
    'Brow Lift',
    'Chin Augmentation',
    'Lip Augmentation',
    'Vampire Facial (PRP)',
    'Dermaplaning',
    'Microdermabrasion'
  ];

  // Get all procedure names from database
  const { data: dbProcedures, error } = await supabase
    .from('aesthetic_procedures')
    .select('id, procedure_name')
    .order('procedure_name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const dbNames = dbProcedures?.map(p => p.procedure_name) || [];
  
  console.log('=== Unmatched Procedures ===\n');
  console.log('Procedures we tried to update but didn\'t match database names:\n');
  
  const unmatched = attemptedNames.filter(name => !dbNames.includes(name));
  unmatched.forEach(name => console.log(`- ${name}`));
  
  console.log('\n=== Close Matches ===\n');
  
  // Find close matches
  unmatched.forEach(searchName => {
    const searchLower = searchName.toLowerCase();
    const matches = dbNames.filter(dbName => {
      const dbLower = dbName.toLowerCase();
      return dbLower.includes(searchLower.split(' ')[0]) || 
             searchLower.includes(dbLower.split(' ')[0]);
    });
    
    if (matches.length > 0) {
      console.log(`"${searchName}" might match:`);
      matches.forEach(m => console.log(`  - ${m}`));
      console.log('');
    }
  });

  // Count total procedures
  console.log(`\n=== Summary ===`);
  console.log(`Total aesthetic procedures: ${dbNames.length}`);
  console.log(`Procedures with RealSelf mappings: ${attemptedNames.length}`);
  console.log(`Successfully matched: ${attemptedNames.length - unmatched.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
}

checkUnmatched().catch(console.error);