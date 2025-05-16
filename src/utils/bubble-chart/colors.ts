
/**
 * Define a color palette for different communities
 */
const COMMUNITY_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
];

/**
 * Get a color for a specific community using a consistent mapping
 */
export const getCommunityColor = (community: number | string | undefined): string => {
  // Handle undefined or non-numeric communities
  if (community === undefined) return COMMUNITY_COLORS[0];

  // Convert string to number if needed
  const communityIndex = typeof community === 'number' 
    ? community % COMMUNITY_COLORS.length 
    : typeof community === 'string' 
      ? parseInt(community, 10) % COMMUNITY_COLORS.length || 0
      : 0;
      
  return COMMUNITY_COLORS[communityIndex];
};
