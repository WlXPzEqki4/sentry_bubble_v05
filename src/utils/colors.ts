
// Color palette for different families/communities in the network
const FAMILY_COLORS: Record<string, string> = {
  // Romeo and Juliet families
  'Montague': '#3B82F6', // Blue
  'Capulet': '#EC4899',  // Pink
  'Neutral': '#8B5CF6',  // Purple
  
  // Criminal network families
  'Leadership': '#F97316', // Orange
  'Management': '#14B8A6', // Teal
  'Operations': '#6366F1', // Indigo
  'External': '#8B5CF6',   // Purple
  
  // Intelligence network families
  'US Intelligence': '#10B981',   // Green
  'US Domestic': '#3B82F6',       // Blue
  'UK Intelligence': '#6366F1',   // Indigo
  'Russia': '#EC4899',            // Pink
  'China': '#F97316',             // Orange
  'Israel': '#8B5CF6',            // Purple
  'Germany': '#14B8A6',           // Teal
  'France': '#EF4444',            // Red
  'Alliance': '#F59E0B',          // Amber
  'Canada': '#6366F1',            // Indigo
  'Australia': '#10B981',         // Green
  
  // Sudan news network categories
  'N1_Drone_Warfare': '#E11D48',          // Red
  'N2_Humanitarian_Crisis': '#2563EB',     // Blue
  'N3_Atrocities_Darfur': '#7C3AED',       // Purple
  'N4_Political_Fragmentation': '#F59E0B', // Amber
  'N5_International_Involvement': '#10B981' // Green
};

// Default color when family is not specified
const DEFAULT_COLOR = '#8B5CF6'; // Purple

// Function to get color based on family name
export const getFamilyColor = (family: string): string => {
  if (!family) return DEFAULT_COLOR;
  
  // Check if the family string contains any of the category prefixes
  const categories = Object.keys(FAMILY_COLORS);
  for (const category of categories) {
    if (family.includes(category)) {
      return FAMILY_COLORS[category];
    }
  }
  
  return FAMILY_COLORS[family] || DEFAULT_COLOR;
};
