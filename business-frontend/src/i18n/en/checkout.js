const checkoutEn = {
  header: {
    title: '🛒 Checkout',
    subtitle: 'Follow the steps below to complete your order'
  },
  steps: ['Order Details', 'Shipping Info', 'Payment', 'Confirmation'],
  order: {
    details: 'Order Details',
    verify: 'Please review the items you have ordered',
    subtotal: 'Subtotal',
    delivery: 'Delivery Charge',
    free: 'Free 🎉',
    total: 'Total',
    goToShipping: 'Go to Shipping'
  },
  shipping: {
    title: 'Shipping Information',
    desc: 'Provide accurate information for delivery',
    fullName: 'Full Name *',
    email: 'Email *',
    phone: 'Phone Number *',
    district: 'District *',
    noDistrict: 'No district found',
    searchDistrict: 'Search district...',
    city: 'City/Upazila *',
    postal: 'Postal Code',
    address: 'Full Address *',
    addressPh: 'House/Flat no, street, area',
    instruction: 'Delivery Instructions (optional)',
    instructionPh: 'Special notes e.g. leave at gate, call before delivery',
    prev: 'Back',
    goToPayment: 'Proceed to Payment',
    notice: '📍 Within Grameenbazar & Grameen Delivery service areas: delivery within hours; outside (nationwide): within 2-3 days',
    errors: {
      fullName: 'Full name is required',
      email: 'Valid email is required',
      phone: 'Valid Bangladeshi phone number is required',
      address: 'Address is required',
      city: 'City is required',
      district: 'Please select a district'
    }
  },
  payment: {
    title: 'Payment Method',
    desc: 'Choose your preferred payment method',
    info: 'Payment Information',
    mobile: 'Mobile Number *',
    cardNumber: 'Card Number *',
    cardHolder: 'Cardholder Name *',
    expiry: 'Expiry *',
    cvv: 'CVV *',
    recommended: 'Recommended',
    cashSelectedTitle: '🎉 Cash on Delivery selected!',
    cashSelectedDesc: 'Pay when the order arrives. No advance payment needed.',
    orderSummary: '💰 Order Summary',
    paymentFee: 'Payment Fee',
    labels: {
      mobilePh: '01XXXXXXXXX',
      cardNumberPh: '1234 5678 9012 3456',
      expiryPh: 'MM/YY',
      cvvPh: '123'
    },
    prev: 'Back',
    confirm: 'Confirm Order',
    processing: 'Processing order...'
  },
  sidebar: {
    orderSummary: 'Order Summary',
    moreItems: (n) => `+${n} more items...`,
    notices: {
      securePayment: 'Secure Payment',
      fastDelivery: 'Fast Delivery',
      warranty: 'With Guarantee'
    }
  },
  success: {
    title: 'Order Successful!',
    orderNo: (id) => `Order No: #${id}`,
    desc: 'Your order has been received. We will contact you soon.',
    deliveryInfo: 'Delivery Info',
    track: 'Track Order',
    home: 'Go Home',
    fields: {
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      payment: 'Payment',
      total: 'Total'
    }
  },
  guards: {
    cartEmpty: 'Your cart is empty. Please add some items first.',
    startShopping: 'Start Shopping'
  },
  paymentMethods: {
    cash: { name: 'Cash on Delivery', desc: 'Pay when your order arrives', fee: 0 },
    bkash: { name: 'bKash', desc: 'Pay with bKash', fee: 0 },
    nagad: { name: 'Nagad', desc: 'Pay with Nagad', fee: 0 },
    rocket: { name: 'Rocket', desc: 'Pay with Rocket', fee: 0 },
    card: { name: 'Credit/Debit Card', desc: 'Visa, MasterCard and others', fee: 25 },
    bank: { name: 'Bank Transfer', desc: 'Transfer to bank account', fee: 15 }
  }
};

export default checkoutEn;


