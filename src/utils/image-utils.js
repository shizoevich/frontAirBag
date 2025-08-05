/**
 * Utility functions for handling product images with consistent fallback logic
 */

// Default fallback image URL to use across the site
export const DEFAULT_FALLBACK_IMAGE = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';

/**
 * Gets the appropriate product image with fallback logic
 * @param {Object} product - Product object that may contain imageURLs, images, or img properties
 * @param {number} [index=0] - Index of the image to retrieve (defaults to first image)
 * @returns {string} URL of the product image or fallback image
 */
export const getProductImage = (product, index = 0) => {
  if (!product) return DEFAULT_FALLBACK_IMAGE;
  
  try {
    // Check for imageURLs array
    if (product.imageURLs && Array.isArray(product.imageURLs) && product.imageURLs.length > index) {
      const imageItem = product.imageURLs[index];
      if (typeof imageItem === 'string') return imageItem;
      return imageItem.img || imageItem.url || imageItem.src || DEFAULT_FALLBACK_IMAGE;
    }
    
    // Check for images array
    if (product.images && Array.isArray(product.images) && product.images.length > index) {
      const imageItem = product.images[index];
      if (typeof imageItem === 'string') return imageItem;
      return imageItem.url || imageItem.img || imageItem.src || DEFAULT_FALLBACK_IMAGE;
    }
    
    // Check for single img property
    if (product.img) return product.img;
    
    // Check for image property
    if (product.image) return product.image;
  } catch (error) {
    console.error('Error getting product image:', error);
  }
  
  // Return fallback if all else fails
  return DEFAULT_FALLBACK_IMAGE;
};

/**
 * Gets the product ID, normalizing between id and _id fields
 * @param {Object} product - Product object that may contain id or _id
 * @returns {string|null} Product ID or empty string if not found
 */
export const getProductId = (product) => {
  if (!product) return '';
  return product.id || product._id || '';
};
