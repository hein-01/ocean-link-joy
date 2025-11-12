// Synonym dictionary for enhanced search functionality
export interface SynonymDict {
  [key: string]: string[];
}

export const synonymDictionary: SynonymDict = {
  // Food & Dining
  'food': ['restaurant', 'dining', 'eatery', 'cafe', 'bistro', 'diner', 'kitchen'],
  'restaurant': ['food', 'dining', 'eatery', 'cafe', 'bistro', 'diner'],
  'cafe': ['coffee', 'coffeehouse', 'coffee shop', 'restaurant', 'food'],
  'coffee': ['cafe', 'coffeehouse', 'coffee shop', 'espresso', 'latte'],
  'bar': ['pub', 'tavern', 'lounge', 'nightclub', 'drinks'],
  'pizza': ['italian', 'food', 'restaurant', 'dining'],
  'burger': ['food', 'restaurant', 'fast food', 'dining'],
  
  // Retail & Shopping
  'shop': ['store', 'retail', 'shopping', 'market', 'outlet'],
  'store': ['shop', 'retail', 'shopping', 'market', 'outlet'],
  'clothing': ['fashion', 'apparel', 'clothes', 'garments', 'wear'],
  'fashion': ['clothing', 'apparel', 'clothes', 'style', 'boutique'],
  'electronics': ['tech', 'technology', 'gadgets', 'devices', 'computers'],
  'phone': ['mobile', 'smartphone', 'cellular', 'electronics'],
  'computer': ['tech', 'electronics', 'laptop', 'pc', 'technology'],
  
  // Services
  'repair': ['fix', 'service', 'maintenance', 'restoration'],
  'fix': ['repair', 'service', 'maintenance', 'restoration'],
  'doctor': ['physician', 'medical', 'clinic', 'healthcare', 'health'],
  'medical': ['doctor', 'physician', 'clinic', 'healthcare', 'health'],
  'lawyer': ['attorney', 'legal', 'law firm', 'advocate'],
  'attorney': ['lawyer', 'legal', 'law firm', 'advocate'],
  'salon': ['beauty', 'hair', 'spa', 'grooming', 'cosmetics'],
  'beauty': ['salon', 'spa', 'cosmetics', 'makeup', 'hair'],
  'gym': ['fitness', 'workout', 'exercise', 'training', 'health'],
  'fitness': ['gym', 'workout', 'exercise', 'training', 'health'],
  
  // Automotive
  'car': ['auto', 'automobile', 'vehicle', 'automotive'],
  'auto': ['car', 'automobile', 'vehicle', 'automotive'],
  'garage': ['auto', 'car', 'repair', 'service', 'mechanic'],
  'mechanic': ['auto', 'car', 'repair', 'service', 'garage'],
  
  // Real Estate & Construction
  'house': ['home', 'property', 'real estate', 'residence'],
  'home': ['house', 'property', 'real estate', 'residence'],
  'construction': ['building', 'contractor', 'renovation'],
  'contractor': ['construction', 'building', 'renovation'],
  
  // Education & Learning
  'school': ['education', 'learning', 'academy', 'institute'],
  'education': ['school', 'learning', 'academy', 'institute', 'training'],
  'tutor': ['education', 'learning', 'teaching', 'instructor'],
  'teacher': ['education', 'learning', 'tutor', 'instructor'],
  
  // Entertainment & Events
  'event': ['party', 'celebration', 'function', 'occasion'],
  'party': ['event', 'celebration', 'function', 'entertainment'],
  'music': ['entertainment', 'band', 'concert', 'audio'],
  'photography': ['photo', 'photographer', 'pictures', 'images'],
  
  // Financial Services
  'bank': ['financial', 'finance', 'banking', 'money'],
  'finance': ['bank', 'financial', 'banking', 'money', 'loan'],
  'insurance': ['financial', 'coverage', 'policy', 'protection'],
  
  // Transportation
  'taxi': ['transport', 'cab', 'ride', 'transportation'],
  'transport': ['taxi', 'cab', 'ride', 'transportation', 'delivery'],
  'delivery': ['transport', 'shipping', 'courier', 'logistics'],
  
  // Health & Wellness
  'pharmacy': ['medicine', 'drugs', 'health', 'medical'],
  'medicine': ['pharmacy', 'drugs', 'health', 'medical'],
  'spa': ['wellness', 'beauty', 'relaxation', 'massage'],
  'massage': ['spa', 'wellness', 'therapy', 'health'],
  
  // Professional Services
  'accountant': ['accounting', 'finance', 'tax', 'bookkeeping'],
  'consulting': ['consultant', 'advisory', 'professional', 'services'],
  'marketing': ['advertising', 'promotion', 'branding', 'digital'],
  'web': ['website', 'internet', 'online', 'digital'],
  
  // Clothing & Accessories - Women's
  "women's shoes": ['women shoes', 'womens shoes', 'shoes for women', 'shoes for woman', 'shoe for women', 'shoe for woman', 'shoe women', 'shoe woman', "woman's shoe", "womans shoe", 'woman shoes', 'lady shoes', 'ladies shoes', 'girls shoes', 'female shoes'],
  "women's accessories": ['women accessories', 'womens accessories', 'accessories for women', 'accessories for woman', 'accessory for women', 'accessory for woman', 'accessory women', 'accessory woman', "woman's accessories", "womans accessories", 'woman accessories', 'lady accessories', 'ladies accessories', 'girls accessories', 'female accessories'],
  "women's bags": ['women bags', 'womens bags', 'bags for women', 'bags for woman', 'bag for women', 'bag for woman', 'bag women', 'bag woman', "woman's bags", "womans bags", 'woman bags', 'lady bags', 'ladies bags', 'girls bags', 'female bags'],
  "women's clothing": ['women clothing', 'womens clothing', 'clothes for women', 'clothes for woman', 'clothing for women', 'clothing for woman', 'clothing women', 'clothing woman', "woman's clothing", "womans clothing", 'woman clothing', 'lady clothing', 'ladies clothing', 'girls clothing', 'female clothing'],
  
  // Clothing & Accessories - Men's
  "men's shoes": ['men shoes', 'mens shoes', 'shoes for men', 'shoes for man', 'shoe for men', 'shoe for man', 'shoe men', 'shoe man', "man's shoe", "mans shoe", 'man shoes', 'guy shoes', 'guys shoes', 'male shoes'],
  "men's accessories": ['men accessories', 'mens accessories', 'accessories for men', 'accessories for man', 'accessory for men', 'accessory for man', 'accessory men', 'accessory man', "man's accessories", "mans accessories", 'man accessories', 'guy accessories', 'guys accessories', 'male accessories'],
  "men's bags": ['men bags', 'mens bags', 'bags for men', 'bags for man', 'bag for men', 'bag for man', 'bag men', 'bag man', "man's bags", "mans bags", 'man bags', 'guy bags', 'guys bags', 'male bags'],
  "men's clothing": ['men clothing', 'mens clothing', 'clothes for men', 'clothes for man', 'clothing for men', 'clothing for man', 'clothing men', 'clothing man', "man's clothing", "mans clothing", 'man clothing', 'guy clothing', 'guys clothing', 'male clothing'],
  
  // Kids wear variations
  "kids wear": ['kids clothing', 'kids clothes', 'children wear', 'children clothing', 'children clothes', 'child wear', 'child clothing', 'child clothes', 'kidswear', 'kids fashion', 'children fashion'],
  
  // Individual item variations
  'shoes': ['shoe', 'footwear', 'sneakers', 'boots', 'sandals'],
  'bags': ['bag', 'handbags', 'purses', 'backpacks', 'totes'],
  'accessories': ['accessory', 'jewelry', 'belts', 'scarves', 'hats'],
  
  // Gender variations
  'women': ['woman', 'lady', 'ladies', 'girl', 'girls', 'female'],
  'men': ['man', 'guy', 'guys', 'male'],
  'kids': ['children', 'child', 'boy', 'boys', 'girl', 'girls'],

  // Common informal terms
  'cheap': ['affordable', 'budget', 'low cost', 'inexpensive'],
  'expensive': ['premium', 'luxury', 'high end', 'costly'],
  'fast': ['quick', 'rapid', 'speedy', 'express'],
  'good': ['quality', 'excellent', 'great', 'best'],
  'near': ['close', 'nearby', 'local', 'around'],
};

/**
 * Normalizes text by removing possessives, extra spaces, and standardizing format
 * @param text - The text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/'/g, '') // Remove apostrophes (women's -> womens)
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim();
}

/**
 * Generates phrase variations for better matching
 * @param phrase - The original phrase
 * @returns Array of phrase variations
 */
function generatePhraseVariations(phrase: string): string[] {
  const normalized = normalizeText(phrase);
  const variations = new Set<string>([normalized, phrase.toLowerCase()]);
  
  // Check if this exact phrase has predefined synonyms
  Object.keys(synonymDictionary).forEach(key => {
    if (normalizeText(key) === normalized) {
      synonymDictionary[key].forEach(synonym => {
        variations.add(normalizeText(synonym));
        variations.add(synonym.toLowerCase());
      });
    }
  });
  
  return Array.from(variations);
}

/**
 * Expands search terms with synonyms and phrase variations
 * @param query - The search query string
 * @returns Object with exact phrases and individual terms for better matching
 */
export function expandSearchTerms(query: string): { exactPhrases: string[], individualTerms: string[] } {
  if (!query || typeof query !== 'string') return { exactPhrases: [], individualTerms: [] };
  
  const exactPhrases = new Set<string>();
  const individualTerms = new Set<string>();
  const originalQuery = query.toLowerCase().trim();
  
  // Add original query as exact phrase
  exactPhrases.add(originalQuery);
  
  // First, try to match the entire query as a phrase and expand with synonyms
  const phraseVariations = generatePhraseVariations(originalQuery);
  phraseVariations.forEach(variation => exactPhrases.add(variation));
  
  // Check for exact phrase matches in synonym dictionary and add their synonyms
  const normalizedQuery = normalizeText(originalQuery);
  Object.keys(synonymDictionary).forEach(key => {
    const normalizedKey = normalizeText(key);
    if (normalizedKey === normalizedQuery || key.toLowerCase() === originalQuery) {
      // Add the key itself and all its synonyms as exact phrases
      exactPhrases.add(key.toLowerCase());
      exactPhrases.add(normalizedKey);
      synonymDictionary[key].forEach(synonym => {
        exactPhrases.add(synonym.toLowerCase());
        exactPhrases.add(normalizeText(synonym));
      });
    }
  });
  
  // Also check if any synonyms point back to our query
  Object.entries(synonymDictionary).forEach(([key, synonyms]) => {
    synonyms.forEach(synonym => {
      if (normalizeText(synonym) === normalizedQuery || synonym.toLowerCase() === originalQuery) {
        // Add the key and all other synonyms as exact phrases
        exactPhrases.add(key.toLowerCase());
        exactPhrases.add(normalizeText(key));
        synonyms.forEach(syn => {
          exactPhrases.add(syn.toLowerCase());
          exactPhrases.add(normalizeText(syn));
        });
      }
    });
  });
  
  // Handle individual words for fallback matching
  const terms = originalQuery.split(/\s+/).filter(term => term.length > 0);
  
  terms.forEach(term => {
    const normalizedTerm = normalizeText(term);
    individualTerms.add(term);
    individualTerms.add(normalizedTerm);
    
    // Add synonyms for individual terms
    if (synonymDictionary[term]) {
      synonymDictionary[term].forEach(synonym => {
        individualTerms.add(synonym.toLowerCase());
        individualTerms.add(normalizeText(synonym));
      });
    }
    
    if (synonymDictionary[normalizedTerm]) {
      synonymDictionary[normalizedTerm].forEach(synonym => {
        individualTerms.add(synonym.toLowerCase());
        individualTerms.add(normalizeText(synonym));
      });
    }
  });
  
  return {
    exactPhrases: Array.from(exactPhrases).filter(term => term.length > 0),
    individualTerms: Array.from(individualTerms).filter(term => term.length > 0)
  };
}

/**
 * Creates a search query with OR conditions for all expanded terms
 * @param field - The database field to search in
 * @param expandedTerms - Array of search terms including synonyms
 * @returns Formatted query string for Supabase
 */
export function createExpandedSearchQuery(field: string, expandedTerms: string[]): string {
  return expandedTerms
    .map(term => `${field}.ilike.%${term}%`)
    .join(',');
}

/**
 * Maps informal category names to formal ones
 * @param category - The category string to normalize
 * @returns Normalized category name
 */
export function normalizeCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'food': 'Restaurant',
    'restaurant': 'Restaurant', 
    'cafe': 'Restaurant',
    'shop': 'Retail Store',
    'store': 'Retail Store',
    'clothing': 'Retail Store',
    'fashion': 'Retail Store',
    'medical': 'Healthcare',
    'doctor': 'Healthcare',
    'clinic': 'Healthcare',
    'legal': 'Legal Services',
    'lawyer': 'Legal Services',
    'attorney': 'Legal Services',
    'auto': 'Automotive',
    'car': 'Automotive',
    'garage': 'Automotive',
    'house': 'Real Estate',
    'home': 'Real Estate',
    'property': 'Real Estate',
    'school': 'Education',
    'education': 'Education',
  };
  
  return categoryMap[category.toLowerCase()] || category;
}