const storeDetailEn = {
  breadcrumbs: { home: 'Home', bazars: 'Bazars' },
  loading: 'Loading store details...',
  verified: 'Verified Store',
  locatedIn: (place) => `📍 Located in ${place}`,
  tabs: { products: 'Products', about: 'About', reviews: 'Reviews' },
  common: { all: 'All' },
  labels: {
    products: 'Products',
    premiumStore: 'Premium Store',
    stock: 'Stock:',
    totalProducts: 'Total Products',
    rating: 'Rating',
    reviews: 'Reviews',
    stars: 'stars',
    discount: 'OFF'
  },
  productsSection: {
    titleWithCount: (count) => `Products (${count})`
  },
  about: {
    title: (name) => `About ${name}`,
    productTypes: '🛍️ Product Types',
    stats: '📊 Statistics'
  },
  review: {
    heading: 'Customer Reviews & Comments',
    write: 'Write a Review',
    cancel: 'Cancel',
    basedOn: (count) => `Based on ${count} reviews`,
    formTitle: 'Write Your Review',
    yourName: 'Your Name',
    ratingLabel: 'Give a Rating',
    ratingHint: 'Hover over the stars for precise rating',
    commentPlaceholder: 'Share your experience about this store...',
    submit: 'Submit Review'
  },
  contact: {
    title: '📞 Contact Information',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    website: 'Website'
  },
  hours: {
    title: '🕐 Store Hours',
    weekdaysLabel: 'Monday - Friday',
    saturdayLabel: 'Saturday',
    sundayLabel: 'Sunday'
  },
  buttons: {
    details: 'Details',
    addToCart: 'Add to Bag',
    cancel: 'Cancel',
    viewCart: 'View Cart'
  },
  quickStats: {
    title: 'Quick Statistics',
    products: 'Products',
    rating: 'Rating'
  },
  tooltips: {
    addToWishlist: 'Add to wishlist'
  }
};

export default storeDetailEn;


