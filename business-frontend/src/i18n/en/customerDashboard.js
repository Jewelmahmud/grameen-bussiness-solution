const customerDashboardEn = {
  hero: {
    welcome: (name) => `Welcome, ${name}!`,
    subtitle: 'Your dashboard. Visit related product pages to shop more'
  },
  stats: {
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    points: 'Points',
    nextReward: 'Next Reward'
  },
  labels: {
    memberSinceSuffix: 'Member since',
    order: 'Order',
    itemsSuffix: 'items',
    phone: 'Phone:',
    default: 'Default',
    home: 'Home',
    office: 'Office',
    expires: 'Expires',
    store: 'Store:',
    orderNumber: 'Order No:',
    orderDate: 'Order Date:',
    totalItems: 'Total Items:',
    totalAmount: 'Total Amount:'
  },
  sidebar: {
    title: 'Dashboard Menu',
    orders: 'My Orders',
    wishlist: 'Wishlist',
    addresses: 'Addresses',
    payments: 'Payment Methods',
    editProfile: 'Edit Profile'
  },
  orders: {
    header: 'My Orders',
    subheader: 'View the list and status of all your orders',
    support: 'Customer Support',
    status: {
      delivered: 'Delivered',
      shipped: 'Shipped',
      processing: 'Processing',
      pending: 'Pending'
    },
    tracking: 'Tracking',
    viewDetails: 'View Details',
    emptyTitle: 'No orders yet',
    emptySubtitle: 'You haven’t placed any orders yet. Start shopping!',
    startShopping: 'Start Shopping'
  },
  wishlist: {
    header: 'My Wishlist',
    subheader: 'Items saved to buy later',
    emptyTitle: 'Your wishlist is empty',
    emptySubtitle: 'Add products to your wishlist to buy later.',
    viewProducts: 'View Products',
    addToCart: 'Add to Cart',
    view: 'View'
  },
  addresses: {
    header: 'My Addresses',
    subheader: 'Saved addresses for delivery',
    addNew: 'Add New Address',
    edit: 'Edit',
    delete: 'Delete'
  },
  payments: {
    header: 'Payment Methods',
    subheader: 'Your saved payment methods',
    addNew: 'Add New Payment Method'
  },
  recommended: {
    header: 'Recommended for You',
    subheader: 'Specially curated products based on your preferences',
    product: (n) => `Recommended Product ${n}`,
    storeName: 'Store Name'
  },
  dialogs: {
    address: {
      title: 'Add New Address',
      type: 'Address Type',
      types: { home: 'Home', office: 'Office' },
      detail: 'Full Address',
      phone: 'Phone Number',
      cancel: 'Cancel',
      save: 'Save'
    },
    payment: {
      title: 'Add New Payment Method',
      type: 'Payment Type',
      types: { card: 'Credit Card', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
      numberCard: 'Card Number',
      numberAccount: 'Account Number',
      expiry: 'Expiry (MM/YY)',
      cancel: 'Cancel',
      save: 'Save'
    },
    order: {
      title: 'Order Details',
      orderId: (id) => `Order ID: #${id}`,
      orderInfo: 'Order Information',
      deliveryInfo: 'Delivery Information',
      status: 'Status:',
      tracking: 'Track',
      trackingNote: 'Click Track for more details',
      summary: 'Order Summary',
      close: 'Close'
    }
  }
};

export default customerDashboardEn;


