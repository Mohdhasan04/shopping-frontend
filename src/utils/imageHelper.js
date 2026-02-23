/**
 * Helper functions for handling product images
 */

const BACKEND_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : `http://${window.location.hostname}:5000`;

/**
 * Convert image path to full URL
 * @param {string} imagePath - Image path from database
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '') {
    return getPlaceholder();
  }

  // If already full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If base64 data URL, return as is
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // If placeholder, return as is
  if (imagePath.startsWith('/api/placeholder')) {
    return imagePath;
  }

  // If starts with /uploads, add backend URL
  if (imagePath.startsWith('/uploads/')) {
    return BACKEND_URL + imagePath;
  }

  // If starts with uploads but missing slash
  if (imagePath.startsWith('uploads/')) {
    return BACKEND_URL + '/' + imagePath;
  }

  // Default: assume it's in uploads folder
  return BACKEND_URL + '/uploads/' + imagePath;
};

/**
 * Get the first available image from product
 * @param {object} product - Product object
 * @returns {string} Image URL
 */
export const getFirstImage = (product) => {
  if (!product) return getPlaceholder();

  // Check in order: image, images[0], thumbnail
  if (product.image) {
    return getImageUrl(product.image);
  }

  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }

  if (product.thumbnail) {
    return getImageUrl(product.thumbnail);
  }

  // Fallback to placeholder
  return getPlaceholder();
};

/**
 * Get all product images as full URLs
 * @param {object} product - Product object
 * @returns {Array} Array of image URLs
 */
export const getAllImages = (product) => {
  if (!product) return [getPlaceholder()];

  const images = [];

  // Add main image
  if (product.image) {
    images.push(getImageUrl(product.image));
  }

  // Add images array
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      const url = getImageUrl(img);
      if (!images.includes(url)) images.push(url);
    });
  }

  // Add thumbnail
  if (product.thumbnail) {
    const thumbUrl = getImageUrl(product.thumbnail);
    if (!images.includes(thumbUrl)) images.push(thumbUrl);
  }

  // If no images found, use placeholder
  if (images.length === 0) {
    images.push(getPlaceholder());
  }

  return images;
};

/**
 * Get a placeholder image (base64 SVG)
 * @returns {string} Base64 placeholder image
 */
export const getPlaceholder = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNlNWU1ZTUiLz48dGV4dCB4PSIyNTAiIHk9IjI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Check if image exists (not a placeholder)
 * @param {string} url - Image URL
 * @returns {boolean} True if not a placeholder
 */
export const isRealImage = (url) => {
  if (!url) return false;
  return !url.startsWith('data:image') && !url.includes('placeholder');
};