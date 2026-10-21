import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { testBengaliNumerals, parsePrice, formatPriceForDisplay } from '../utils/priceUtils';

const CartTest = () => {
  const { addToCart, debugCartData, clearCart } = useCart();

  const sampleProducts = [
    {
      id: 1,
      name: 'বাসমতী চাল',
      price: 85,
      image: '/api/placeholder/150/120',
      store: 'রাজশাহী স্টোর',
      stock: 50
    },
    {
      id: 2,
      name: 'ডাল (মুগ)',
      price: 120,
      image: '/api/placeholder/150/120',
      store: 'ঢাকা স্টোর',
      stock: 30
    },
    {
      id: 3,
      name: 'টমেটো',
      price: 40,
      image: '/api/placeholder/150/120',
      store: 'সিলেট স্টোর',
      stock: 100
    },
    {
      id: 4,
      name: 'পেঁয়াজ',
      price: 65,
      image: '/api/placeholder/150/120',
      store: 'চট্টগ্রাম স্টোর',
      stock: 80
    }
  ];

  // Bengali numeral test products (similar to DailyBazar format)
  const bengaliProducts = [
    {
      id: 101,
      name: 'সরিষার তেল ১লিটার',
      price: '৳১৮০.০০',
      image: '/api/placeholder/150/120',
      store: 'ফ্রেশ মার্ট',
      stock: 20
    },
    {
      id: 102,
      name: 'তরল দুধ ১লিটার',
      price: '৳৬৫.০০',
      image: '/api/placeholder/150/120',
      store: 'ডেইলি নিডস স্টোর',
      stock: 30
    },
    {
      id: 103,
      name: 'ডিটারজেন্ট পাউডার',
      price: '৭৫.০০',
      image: '/api/placeholder/150/120',
      store: 'ফ্রেশ প্লাস',
      stock: 15
    }
  ];

  const addSampleProduct = (product) => {
    addToCart(product, 1);
  };

  const addAllSampleProducts = () => {
    sampleProducts.forEach(product => {
      addToCart(product, Math.floor(Math.random() * 3) + 1);
    });
  };

  const addBengaliProducts = () => {
    bengaliProducts.forEach(product => {
      addToCart(product, 1);
    });
  };

  const clearCartAndStorage = () => {
    clearCart();
    localStorage.removeItem('cart');
  };

  // Test the Bengali conversion function using utility
  const testBengaliConversion = () => {
    const testPrices = ['৳১৮০.০০', '৳৬৫.০০', '৭৫.০০', '১২০.০০'];
    
    testPrices.forEach(price => {
      const parsed = parsePrice(price);
      const formatted = formatPriceForDisplay(price);
    });
  };

  const showLocalStorageData = () => {
    const storedCart = localStorage.getItem('cart');
    try {
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item, index) => {
          });
        }
      }
    } catch (e) {
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        কার্ট টেস্ট করুন
      </Typography>
      
      <Typography variant="subtitle2" gutterBottom>
        নরমাল পণ্য (সংখ্যা):
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {sampleProducts.map((product) => (
          <Button
            key={product.id}
            variant="outlined"
            size="small"
            onClick={() => addSampleProduct(product)}
            sx={{ fontSize: '0.8rem' }}
          >
            {product.name} যোগ করুন
          </Button>
        ))}
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        বাংলা সংখ্যা পণ্য (ডেইলি বাজার ফরম্যাট):
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {bengaliProducts.map((product) => (
          <Button
            key={product.id}
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() => addSampleProduct(product)}
            sx={{ fontSize: '0.8rem' }}
          >
            {product.name} যোগ করুন
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={addAllSampleProducts}
          size="small"
        >
          সব নরমাল পণ্য যোগ করুন
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={addBengaliProducts}
          size="small"
        >
          সব বাংলা পণ্য যোগ করুন
        </Button>
        
        <Button
          variant="outlined"
          onClick={debugCartData}
          size="small"
        >
          কার্ট ডেটা দেখুন
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={clearCartAndStorage}
          size="small"
        >
          কার্ট সাফ করুন
        </Button>

        <Button
          variant="outlined"
          color="info"
          onClick={showLocalStorageData}
          size="small"
        >
          স্টোরেজ দেখুন
        </Button>

        <Button
          variant="outlined"
          color="warning"
          onClick={testBengaliConversion}
          size="small"
        >
          বাংলা কনভার্শন টেস্ট
        </Button>

        <Button
          variant="outlined"
          color="success"
          onClick={testBengaliNumerals}
          size="small"
        >
          ইউটিলিটি টেস্ট
        </Button>
      </Box>
    </Box>
  );
};

export default CartTest; 