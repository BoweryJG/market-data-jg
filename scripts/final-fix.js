#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: path.resolve(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const originalContent = content;
  
  // Fix missing closing parentheses
  content = content.replace(/\);/g, (match, index) => {
    // Count open and close parentheses before this position
    const before = content.substring(Math.max(0, index - 200), index);
    const openCount = (before.match(/\(/g) || []).length;
    const closeCount = (before.match(/\)/g) || []).length;
    
    if (openCount > closeCount + 1) {
      return ')'.repeat(openCount - closeCount) + ';';
    }
    return match;
  });
  
  // Fix specific syntax patterns
  content = content.replace(/useEffect\(\(\)/g, 'useEffect(()');
  content = content.replace(/=>\s*\)\s*=>/g, '=> ');
  content = content.replace(/action:\s*\(\)\s*=>/g, 'action: () =>');
  
  // Fix array/object syntax
  content = content.replace(/\},\s*toLogData\(/g, '}, ');
  content = content.replace(/\),\s*toLogData\(/g, '), ');
  content = content.replace(/\]\);/g, '];');
  
  // Fix specific logger and toLogData issues
  content = content.replace(/logger\.(info|error|warn|debug)\('([^']+)',\s*toLogData\(([^)]+)\);/g, 
    'logger.$1(\'$2\', toLogData($3));');
  
  // Fix broken parentheses in specific locations
  content = content.replace(/\.from\('([^']+)'\);/g, '.from(\'$1\')');
  content = content.replace(/const\s+(\w+)\s*=\s*theme\.breakpoints\.down\('md'\);/g, 
    'const $1 = theme.breakpoints.down(\'md\');');
  
  // Fix missing closing parentheses in supabase client creation
  if (file.includes('supabase.ts')) {
    content = content.replace(/getStandardAuthConfig\(\);/, 'getStandardAuthConfig());');
  }
  
  // Fix missing closing parentheses in logger
  if (file.includes('logging/logger.ts')) {
    content = content.replace(/this\.addTransport\(new ConsoleTransport\(\);/, 
      'this.addTransport(new ConsoleTransport());');
  }
  
  // Fix crossDomainAuth
  if (file.includes('crossDomainAuth.ts')) {
    content = content.replace(/\.includes\(`:\${port}`\);/, '.includes(`:${port}`));');
  }
  
  // Fix useSubscription.test.ts
  if (file.includes('useSubscription.test.ts')) {
    content = content.replace(/}\);vi\.mock/, '}));\n\nvi.mock');
    content = content.replace(/\}\);describe/, '}));\n\ndescribe');
    content = content.replace(/const \{ result \} = renderHook/g, 'const { result } = renderHook');
    content = content.replace(/expect\(response\.current/g, 'expect(result.current');
    content = content.replace(/await response\.current/g, 'await result.current');
    content = content.replace(/return await response\.current/g, 'return await result.current');
    content = content.replace(/Error\('Network error'\);/g, 'Error(\'Network error\'));');
    content = content.replace(/Error\('Payment failed'\);/g, 'Error(\'Payment failed\'));');
  }
  
  // Fix specific procedure service issues
  if (file.includes('procedureEnhancementService.ts')) {
    content = content.replace(/benefitMatch\.forEach\(\(b: string\)\s*=>\s*benefits\.add\(this\.cleanText\(b\)\);/g,
      'benefitMatch.forEach((b: string) => benefits.add(this.cleanText(b)));');
    content = content.replace(/techniqueMatch\.forEach\(\(t: string\)\s*=>\s*techniques\.add\(this\.cleanText\(t\)\);/g,
      'techniqueMatch.forEach((t: string) => techniques.add(this.cleanText(t)));');
    content = content.replace(/candidateMatch\.forEach\(\(c: string\)\s*=>\s*candidatesInfo\.add\(this\.cleanText\(c\)\);/g,
      'candidateMatch.forEach((c: string) => candidatesInfo.add(this.cleanText(c)));');
    content = content.replace(/prepMatch\.forEach\(\(p: string\)\s*=>\s*preparationInfo\.add\(this\.cleanText\(p\)\);/g,
      'prepMatch.forEach((p: string) => preparationInfo.add(this.cleanText(p)));');
    content = content.replace(/afterMatch\.forEach\(\(a: string\)\s*=>\s*aftercareInfo\.add\(this\.cleanText\(a\)\);/g,
      'afterMatch.forEach((a: string) => aftercareInfo.add(this.cleanText(a)));');
  }
  
  // Fix marketPulseService
  if (file.includes('marketPulseService.ts')) {
    content = content.replace(/Math\.round\(Math\.min\(100, gapPercentage \* 3\);/g,
      'Math.round(Math.min(100, gapPercentage * 3));');
    content = content.replace(/Math\.min\(100, Math\.round\(convergenceRatio \* 2 \+ convergenceGrowth\);/g,
      'Math.min(100, Math.round(convergenceRatio * 2 + convergenceGrowth));');
  }
  
  // Fix galaxyDataService
  if (file.includes('galaxyDataService.ts')) {
    content = content.replace(/const text = \(result\.title/g, 'const text = (response.title');
    content = content.replace(/keywords\.some\(kw => text\.includes\(kw\);/g,
      'keywords.some(kw => text.includes(kw));');
    content = content.replace(/this\.categorizeSignal\(result\.title\);/g,
      'this.categorizeSignal(response.title);');
    content = content.replace(/error: \(error as Error\)\)\.message/g, 'error: (error as Error).message');
  }
  
  // Fix Dashboard.tsx
  if (file.includes('Dashboard.tsx') && !file.includes('Enhanced')) {
    content = content.replace(/parseInt\(_event\.target\.value, 10\);/g,
      'parseInt(_event.target.value, 10));');
    content = content.replace(/\}\);  \}, \[selectedIndustry/g,
      '});\n  }, [selectedIndustry');
  }
  
  // Fix auth files
  if (file.includes('Auth/') || file.includes('pages/')) {
    content = content.replace(/new URLSearchParams\(window\.location\.hash\.substring\(1\);/g,
      'new URLSearchParams(window.location.hash.substring(1));');
    content = content.replace(/toLogData\(!!accessToken, !!refreshToken\);/g,
      'toLogData({ hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });');
    content = content.replace(/toLogData\(data\.session\.user\.email\);/g,
      'toLogData({ email: data.session.user.email });');
    content = content.replace(/logger\.(error|info|warn|debug)\(([^,]+),\s*errorToLogData\(([^)]+)\);/g,
      'logger.$1($2, errorToLogData($3));');
  }
  
  // Fix component files
  if (file.includes('components/')) {
    content = content.replace(/setPulseRate\(Math\.min\(120, 60 \+ velocity \* 4\);/g,
      'setPulseRate(Math.min(120, 60 + velocity * 4));');
    content = content.replace(/theme\.breakpoints\.down\('md'\);/g,
      'theme.breakpoints.down(\'md\');');
    content = content.replace(/theme\.breakpoints\.down\('sm'\);/g,
      'theme.breakpoints.down(\'sm\');');
    content = content.replace(/useState<Set<string>>\(new Set\(\);/g,
      'useState<Set<string>>(new Set());');
    content = content.replace(/setSettings\(prev => \(\{ \.\.\.prev, \[setting\]: value \}\);/g,
      'setSettings(prev => ({ ...prev, [setting]: value }));');
    content = content.replace(/logger\.info\('Saving settings:', toLogData\(settings\);/g,
      'logger.info(\'Saving settings:\', toLogData(settings));');
    content = content.replace(/logger\.info\('Generate company report for:', toLogData\(companyName\);/g,
      'logger.info(\'Generate company report for:\', toLogData(companyName));');
    content = content.replace(/logger\.info\('Searching for:', toLogData\(searchQuery\);/g,
      'logger.info(\'Searching for:\', toLogData(searchQuery));');
    content = content.replace(/logger\.info\('Selected:', toLogData\(result\);/g,
      'logger.info(\'Selected:\', toLogData(result));');
    content = content.replace(/logger\.info\('New category discovered:', toLogData\(category\);/g,
      'logger.info(\'New category discovered:\', toLogData(category));');
    content = content.replace(/setVisibleInsights\(prev => prev\.filter\(i => i\.id !== id\);/g,
      'setVisibleInsights(prev => prev.filter(i => i.id !== id));');
  }
  
  // Fix QuickActionsBar specific issues
  if (file.includes('QuickActionsBar')) {
    content = content.replace(/{ icon: <Phone \/>, name: 'Call', action: \(\) => logger\.info\('Call'\) }, { icon: <Email \/>.*/g,
      `{ icon: <Phone />, name: 'Call', action: () => logger.info('Call') },
    { icon: <Email />, name: 'Email', action: () => logger.info('Email') },
    { icon: <CalendarToday />, name: 'Schedule', action: () => logger.info('Schedule') },
    { icon: <Note />, name: 'Note', action: () => setQuickNoteOpen(true) },
    { icon: <FormatQuote />, name: 'Quote', action: () => logger.info('Quote') },
    { icon: <CameraAlt />, name: 'Photo', action: () => logger.info('Photo') }`);
    
    content = content.replace(/action: \(\)\) => logger\.info\('Open account'\), toLogData\(\},/g,
      'action: () => logger.info(\'Open account\') },');
    content = content.replace(/action: \(\)\) => logger\.info\('Open contact'\), toLogData\(\},/g,
      'action: () => logger.info(\'Open contact\') },');
    content = content.replace(/action: \(\)\) => logger\.info\('Open product'\), toLogData\(\},/g,
      'action: () => logger.info(\'Open product\') }');
    content = content.replace(/\]\);$/gm, '];');
  }
  
  if (content !== originalContent) {
    modified = true;
    totalFixed++;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);