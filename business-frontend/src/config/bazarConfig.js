import React from 'react';
import {
  LocalGroceryStore,
  Fastfood,
  Grass,
  Checkroom,
  Face,
  MenuBook,
  LocalFlorist,
  ElectricBolt,
  Science,
  Build,
  Flag
} from '@mui/icons-material';

// Bazar configurations
const bazarConfigs = {
  'daily-bazar': {
    title: 'নিত্যপণ্য বাজার',
    icon: <LocalGroceryStore />,
    searchPlaceholder: 'নিত্যপণ্য খুঁজুন...',
    categories: [
      {
        category: { bangla: "চাল ও ডাল", english: "Rice & Lentils" },
        icon: <LocalGroceryStore />,
        items: [
          { bangla: "চাল", english: "Rice", icon: <LocalGroceryStore /> },
          { bangla: "ডাল", english: "Lentils", icon: <LocalGroceryStore /> },
          { bangla: "চিড়া", english: "Flattened Rice", icon: <LocalGroceryStore /> }
        ]
      }
    ],
    products: [
      {
        id: 1,
        name: 'বাসমতি চাল',
        price: 120,
        originalPrice: 140,
        discount: 15,
        image: '/images/rice.jpg',
        store: 'রহিম স্টোর',
        category: 'চাল',
        slug: 'basmati-rice'
      }
    ],
    stores: [
      {
        name: 'রহিম স্টোর',
        district: 'ঢাকা',
        upazilla: 'ধানমন্ডি',
        bazar: 'ধানমন্ডি বাজার',
        products: []
      }
    ]
  },
  
  'food-bazar': {
    title: 'ফ্রেশ খাবার বাজার',
    icon: <Fastfood />,
    searchPlaceholder: 'ফ্রেশ খাবার খুঁজুন...',
    categories: [
      {
        category: { bangla: "ফল", english: "Fruits" },
        icon: <Fastfood />,
        items: [
          { bangla: "আম", english: "Mango", icon: <Fastfood /> },
          { bangla: "কলা", english: "Banana", icon: <Fastfood /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'grains': {
    title: 'শস্য বাজার',
    icon: <Grass />,
    searchPlaceholder: 'শস্য খুঁজুন...',
    categories: [
      {
        category: { bangla: "গম", english: "Wheat" },
        icon: <Grass />,
        items: [
          { bangla: "আটা", english: "Flour", icon: <Grass /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'garments-bazar': {
    title: 'গার্মেন্টস বাজার',
    icon: <Checkroom />,
    searchPlaceholder: 'পোশাক খুঁজুন...',
    categories: [
      {
        category: { bangla: "পুরুষের পোশাক", english: "Men's Clothing" },
        icon: <Checkroom />,
        items: [
          { bangla: "শার্ট", english: "Shirt", icon: <Checkroom /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'cosmetics-bazar': {
    title: 'কসমেটিক্স বাজার',
    icon: <Face />,
    searchPlaceholder: 'কসমেটিক্স খুঁজুন...',
    categories: [
      {
        category: { bangla: "ত্বকের যত্ন", english: "Skin Care" },
        icon: <Face />,
        items: [
          { bangla: "ফেসওয়াশ", english: "Face Wash", icon: <Face /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'book-bazar': {
    title: 'বই বাজার',
    icon: <MenuBook />,
    searchPlaceholder: 'বই খুঁজুন...',
    categories: [
      {
        category: { bangla: "সাহিত্য", english: "Literature" },
        icon: <MenuBook />,
        items: [
          { bangla: "উপন্যাস", english: "Novel", icon: <MenuBook /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'nursery-bazar': {
    title: 'নার্সারি বাজার',
    icon: <LocalFlorist />,
    searchPlaceholder: 'গাছপালা খুঁজুন...',
    categories: [
      {
        category: { bangla: "ফুলের গাছ", english: "Flower Plants" },
        icon: <LocalFlorist />,
        items: [
          { bangla: "গোলাপ", english: "Rose", icon: <LocalFlorist /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'electronics-bazar': {
    title: 'ইলেক্ট্রনিক্স বাজার',
    icon: <ElectricBolt />,
    searchPlaceholder: 'ইলেক্ট্রনিক্স খুঁজুন...',
    categories: [
      {
        category: { bangla: "মোবাইল", english: "Mobile" },
        icon: <ElectricBolt />,
        items: [
          { bangla: "স্মার্টফোন", english: "Smartphone", icon: <ElectricBolt /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'chemical-bazar': {
    title: 'কেমিক্যাল বাজার',
    icon: <Science />,
    searchPlaceholder: 'কেমিক্যাল খুঁজুন...',
    categories: [
      {
        category: { bangla: "পরিষ্কারের রাসায়নিক", english: "Cleaning Chemicals" },
        icon: <Science />,
        items: [
          { bangla: "ডিটারজেন্ট", english: "Detergent", icon: <Science /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'hardware-bazar': {
    title: 'হার্ডওয়্যার বাজার',
    icon: <Build />,
    searchPlaceholder: 'হার্ডওয়্যার খুঁজুন...',
    categories: [
      {
        category: { bangla: "যন্ত্রপাতি", english: "Tools" },
        icon: <Build />,
        items: [
          { bangla: "হাতুড়ি", english: "Hammer", icon: <Build /> }
        ]
      }
    ],
    products: [],
    stores: []
  },

  'national-bazar': {
    title: 'জাতীয় পণ্য বাজার',
    icon: <Flag />,
    searchPlaceholder: 'জাতীয় পণ্য খুঁজুন...',
    categories: [
      {
        category: { bangla: "দেশীয় পণ্য", english: "Local Products" },
        icon: <Flag />,
        items: [
          { bangla: "হস্তশিল্প", english: "Handicrafts", icon: <Flag /> }
        ]
      }
    ],
    products: [],
    stores: []
  }
};

// Function to get bazar configuration
export const getBazarConfig = (bazarType) => {
  return bazarConfigs[bazarType] || null;
};

// Function to get all bazar types
export const getAllBazarTypes = () => {
  return Object.keys(bazarConfigs);
};

export default bazarConfigs; 