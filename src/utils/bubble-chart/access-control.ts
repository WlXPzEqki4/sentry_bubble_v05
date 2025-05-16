
/**
 * Check if a user has access to a network based on their classification level
 */
export const canAccessNetwork = (userClassificationLevel: string, networkClassification: string): boolean => {
  const levels = ['unclassified', 'secret', 'top_secret'];
  
  // User might have multiple clearance levels
  const userLevels = userClassificationLevel.toLowerCase().split(',').map(level => level.trim());
  
  // Check if user has sufficient clearance for the network
  return userLevels.some(userLevel => {
    const userIndex = levels.indexOf(userLevel);
    const networkIndex = levels.indexOf(networkClassification.toLowerCase());
    return userIndex >= networkIndex && userIndex !== -1 && networkIndex !== -1;
  });
};
