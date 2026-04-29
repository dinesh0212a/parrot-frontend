// Utility for restaurant and food images

// Get random restaurant images from Unsplash API
export const getRandomRestaurantImage = (category) => {
  const queries = {
    'Burgers & Fast food': ['burger', 'fast food', 'McDonald'],
    'Biryani': ['biryani', 'rice dish', 'Indian rice'],
    'Pizza': ['pizza', 'cheese pizza'],
    'Drinks': ['beverage', 'soft drink', 'juice'],
    'Noodles': ['noodles', 'Chinese noodles', 'pasta'],
    'Breakfast': ['breakfast', 'pancakes', 'toast'],
  };

  const query = queries[category]?.[Math.floor(Math.random() * queries[category].length)] || 'restaurant food';
  const width = 500;
  const height = 300;
  
  // Using Unsplash API for random food images
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
};

// Get placeholder image with fallback
export const getRestaurantPlaceholder = (restaurantName, width = 400, height = 250) => {
  // Using UI Avatars or placeholder service
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(restaurantName.substring(0, 20))}`;
};

// Generate consistent random image for restaurant based on name
export const getRestaurantImageById = (restaurantId, category, width = 400) => {
  const seed = restaurantId?.substring(0, 8) || Math.random().toString();
  const queries = {
    'Burgers & Fast food': 'burger',
    'Biryani': 'biryani',
    'Pizza': 'pizza',
    'Drinks': 'beverage',
    'Noodles': 'noodles',
    'Breakfast': 'breakfast',
  };
  
  const query = queries[category] || 'restaurant';
  
  // This creates a unique but consistent image per restaurant
  return `https://source.unsplash.com/${width}x300/?${query}&sig=${seed}`;
};

// Validate image URL
export const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
