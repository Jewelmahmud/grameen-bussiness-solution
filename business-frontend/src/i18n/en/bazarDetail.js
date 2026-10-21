const bazarDetailEn = {
  loading: 'Loading bazar details...',
  hero: {
    rating: 'Rating',
    established: 'Established',
    shops: 'Shops',
    dailyVisitors: 'Daily visitors',
    size: 'Size'
  },
  specialties: {
    title: 'Specialties',
    buyHere: 'Shop in this bazar'
  },
  tabs: {
    overview: 'Overview',
    stores: 'Stores',
    reviews: 'Reviews'
  },
  overview: {
    aboutSuffix: ' about',
    details: 'Detailed Description',
    contact: 'Contact Information',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    openingHours: 'Opening Hours',
    location: 'Location',
    mapLoading: 'Loading map...',
    rating: 'Rating'
  },
  sidebarInfo: {
    title: 'Bazar Information',
    established: 'Established',
    weeklyHoliday: 'Weekly Holiday',
    size: 'Bazar Size',
    rating: 'Rating'
  },
  facilities: {
    title: 'Facilities',
    parkingYes: 'Parking',
    parkingNo: 'No Parking',
    atmYes: 'ATM',
    atmNo: 'No ATM',
    wheelchairYes: 'Wheelchair accessible',
    wheelchairNo: 'Not wheelchair accessible'
  },
  stores: {
    title: (name) => `Stores in ${name}`,
    categoryPrefix: 'Category: ',
    viewStore: 'View store'
  },
  reviews: {
    title: 'Customer Reviews',
    loadMore: 'Load more reviews',
    summaryTitle: 'Rating Summary',
    basedOn: (count) => `Based on ${count} reviews`,
    helpful: (n) => `Helpful (${n})`,
    reply: 'Reply'
  },
  writeReview: {
    title: 'Write a Review',
    subtitle: 'Share your experience with others',
    button: 'Write a review'
  },
  dialog: {
    title: 'Write a Review',
    subtitle: (name) => `Share your thoughts about ${name}`,
    guestToggle: 'Review as guest',
    nameLabel: 'Your name',
    namePh: 'Enter your name',
    emailLabel: 'Email (optional)',
    emailPh: 'Enter your email address',
    ratingLabel: 'Give a rating',
    commentLabel: 'Your comment',
    commentPh: 'Share your experience about this bazar...',
    helper: 'Your review will help others make better decisions',
    cancel: 'Cancel',
    submit: 'Submit review',
    successSubmit: 'Your review has been submitted successfully!',
    validation: {
      commentRequired: 'Please enter your comment.',
      nameRequired: 'Please enter your name.'
    }
  },
  cart: {
    added: (name) => `${name} added to cart!`
  },
  locationDialog: {
    title: 'Congratulations!',
    selected: 'Your bazar has been selected',
    instruction1: 'This has been set as your current bazar.',
    instruction2: 'Choose the category you want to shop from below:',
    categoryPrompt: 'What would you like to shop for?',
    bottomNotePrefix: 'These products will be sourced from',
    bottomNoteSuffix: '',
    close: 'Maybe later'
  }
};

export default bazarDetailEn;


