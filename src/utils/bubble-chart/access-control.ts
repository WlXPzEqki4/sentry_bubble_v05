
/**
 * Check if a user can access a specific network based on classification levels
 */
export const canAccessNetwork = (userClassificationLevel: string, networkClassificationLevel: string): boolean => {
  const normalizedUser = normalizeClassification(userClassificationLevel);
  const normalizedNetwork = normalizeClassification(networkClassificationLevel);

  // Users with top secret clearance can access all networks
  if (normalizedUser.includes('topsecret')) {
    return true;
  }

  // Networks requiring top secret cannot be accessed without top secret clearance
  if (normalizedNetwork === 'topsecret') {
    return false;
  }

  // Users with secret clearance can access secret and unclassified networks
  if (normalizedUser.includes('secret')) {
    return normalizedNetwork !== 'topsecret';
  }

  // Users with only unclassified clearance can only access unclassified networks
  return normalizedNetwork === 'unclassified';
};

/**
 * Normalize classification string for consistent comparison
 */
export const normalizeClassification = (classification: string): string => {
  if (!classification) return 'unclassified';
  
  // Convert to lowercase and remove spaces, dashes, and underscores
  const normalized = classification.toLowerCase().replace(/[_\s-]+/g, '');
  
  // Handle special case of "top secret" which gets split by the replace above
  if (normalized.includes('top') && normalized.includes('secret')) {
    return 'topsecret';
  }
  
  return normalized;
};
