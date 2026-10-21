import React from 'react';
import {
  LocalGroceryStore,
  Restaurant,
  LocalFlorist,
  Hardware,
  ElectricBolt,
  Checkroom,
  LocalPharmacy,
  LocalGasStation,
  Build,
  Science,
  LocalShipping,
  Home,
  School,
  SportsEsports,
  Pets,
  ChildCare,
  LocalHospital,
  LocalCarWash,
  LocalPrintshop,
  LocalLibrary
} from '@mui/icons-material';

// Store Type Configuration with Categories and Measurement Units
export const storeTypeConfig = {
  'grocery': {
    name: { bn: 'মুদি দোকান', en: 'Grocery Store' },
    icon: <LocalGroceryStore />,
    categories: [
      {
        name: { bn: 'চাল ও ডাল', en: 'Rice & Lentils' },
        subCategories: [
          { bn: 'চাল', en: 'Rice' },
          { bn: 'ডাল', en: 'Lentils' },
          { bn: 'চিড়া', en: 'Flattened Rice' },
          { bn: 'খই', en: 'Puffed Rice' }
        ],
        units: ['কেজি', 'গ্রাম', 'প্যাকেট', 'লিটার']
      },
      {
        name: { bn: 'তেল ও ঘি', en: 'Oils & Ghee' },
        subCategories: [
          { bn: 'সরিষার তেল', en: 'Mustard Oil' },
          { bn: 'সয়াবিন তেল', en: 'Soybean Oil' },
          { bn: 'রান্নার তেল', en: 'Cooking Oil' },
          { bn: 'ঘি', en: 'Ghee' }
        ],
        units: ['লিটার', 'মিলি লিটার', 'কেজি']
      },
      {
        name: { bn: 'মশলা', en: 'Spices' },
        subCategories: [
          { bn: 'হলুদ', en: 'Turmeric' },
          { bn: 'মরিচ', en: 'Chili' },
          { bn: 'ধনিয়া', en: 'Coriander' },
          { bn: 'জিরা', en: 'Cumin' }
        ],
        units: ['কেজি', 'গ্রাম', 'প্যাকেট']
      }
    ],
    defaultUnits: ['কেজি', 'গ্রাম', 'লিটার', 'মিলি লিটার', 'প্যাকেট', 'বোতল', 'টিন']
  },

  'vegetables': {
    name: { bn: 'সবজির দোকান', en: 'Vegetable Store' },
    icon: <LocalGroceryStore />,
    categories: [
      {
        name: { bn: 'পাতা জাতীয় সবজি', en: 'Leafy Vegetables' },
        subCategories: [
          { bn: 'পালং শাক', en: 'Spinach' },
          { bn: 'লাল শাক', en: 'Red Spinach' },
          { bn: 'কলমি শাক', en: 'Water Spinach' }
        ],
        units: ['কেজি', 'গ্রাম', 'বান্ডিল', 'পিস']
      },
      {
        name: { bn: 'মূল জাতীয় সবজি', en: 'Root Vegetables' },
        subCategories: [
          { bn: 'আলু', en: 'Potato' },
          { bn: 'পেঁয়াজ', en: 'Onion' },
          { bn: 'গাজর', en: 'Carrot' },
          { bn: 'মুলা', en: 'Radish' }
        ],
        units: ['কেজি', 'গ্রাম', 'পিস', 'ডজন']
      }
    ],
    defaultUnits: ['কেজি', 'গ্রাম', 'পিস', 'বান্ডিল', 'ডজন', 'প্যাকেট']
  },

  'sweets': {
    name: { bn: 'মিষ্টির দোকান', en: 'Sweet Store' },
    icon: <Restaurant />,
    categories: [
      {
        name: { bn: 'দেশি মিষ্টি', en: 'Local Sweets' },
        subCategories: [
          { bn: 'রসগোল্লা', en: 'Rasgulla' },
          { bn: 'গুলাব জামুন', en: 'Gulab Jamun' },
          { bn: 'সন্দেশ', en: 'Sandesh' }
        ],
        units: ['কেজি', 'গ্রাম', 'পিস', 'ডজন']
      },
      {
        name: { bn: 'বিস্কুট ও কেক', en: 'Biscuits & Cakes' },
        subCategories: [
          { bn: 'বিস্কুট', en: 'Biscuits' },
          { bn: 'কেক', en: 'Cakes' },
          { bn: 'পেস্ট্রি', en: 'Pastries' }
        ],
        units: ['প্যাকেট', 'পিস', 'কেজি', 'গ্রাম']
      }
    ],
    defaultUnits: ['কেজি', 'গ্রাম', 'পিস', 'ডজন', 'প্যাকেট', 'বোতল']
  },

  'electronics': {
    name: { bn: 'ইলেকট্রনিক্স দোকান', en: 'Electronics Store' },
    icon: <ElectricBolt />,
    categories: [
      {
        name: { bn: 'মোবাইল ফোন', en: 'Mobile Phones' },
        subCategories: [
          { bn: 'স্মার্টফোন', en: 'Smartphones' },
          { bn: 'বাটন ফোন', en: 'Feature Phones' },
          { bn: 'ট্যাবলেট', en: 'Tablets' }
        ],
        units: ['পিস', 'সেট', 'বক্স']
      },
      {
        name: { bn: 'কম্পিউটার', en: 'Computers' },
        subCategories: [
          { bn: 'ল্যাপটপ', en: 'Laptops' },
          { bn: 'ডেস্কটপ', en: 'Desktops' },
          { bn: 'মনিটর', en: 'Monitors' }
        ],
        units: ['পিস', 'সেট', 'বক্স', 'ইউনিট']
      }
    ],
    defaultUnits: ['পিস', 'সেট', 'বক্স', 'ইউনিট', 'প্যাকেট']
  },

  'hardware': {
    name: { bn: 'হার্ডওয়্যার দোকান', en: 'Hardware Store' },
    icon: <Hardware />,
    categories: [
      {
        name: { bn: 'টুলস', en: 'Tools' },
        subCategories: [
          { bn: 'হাতুড়ি', en: 'Hammer' },
          { bn: 'রেঞ্চ', en: 'Wrench' },
          { bn: 'স্ক্রু ড্রাইভার', en: 'Screwdriver' }
        ],
        units: ['পিস', 'সেট', 'বক্স', 'ইউনিট']
      },
      {
        name: { bn: 'পাইপ ও ফিটিংস', en: 'Pipes & Fittings' },
        subCategories: [
          { bn: 'পিভিসি পাইপ', en: 'PVC Pipes' },
          { bn: 'জিআই পাইপ', en: 'GI Pipes' },
          { bn: 'ফিটিংস', en: 'Fittings' }
        ],
        units: ['ফুট', 'মিটার', 'পিস', 'সেট']
      }
    ],
    defaultUnits: ['পিস', 'সেট', 'ফুট', 'মিটার', 'কেজি', 'গ্রাম', 'বক্স']
  },

  'restaurant': {
    name: { bn: 'রেস্টুরেন্ট', en: 'Restaurant' },
    icon: <Restaurant />,
    categories: [
      {
        name: { bn: 'খাবার', en: 'Food Items' },
        subCategories: [
          { bn: 'রাইস আইটেম', en: 'Rice Items' },
          { bn: 'রুটি আইটেম', en: 'Bread Items' },
          { bn: 'মাংস আইটেম', en: 'Meat Items' }
        ],
        units: ['প্লেট', 'পিস', 'সার্ভিং', 'কেজি']
      },
      {
        name: { bn: 'পানীয়', en: 'Beverages' },
        subCategories: [
          { bn: 'চা', en: 'Tea' },
          { bn: 'কফি', en: 'Coffee' },
          { bn: 'জুস', en: 'Juice' }
        ],
        units: ['কাপ', 'গ্লাস', 'বোতল', 'মিলি লিটার']
      }
    ],
    defaultUnits: ['প্লেট', 'পিস', 'সার্ভিং', 'কাপ', 'গ্লাস', 'বোতল', 'কেজি']
  },

  'pharmacy': {
    name: { bn: 'ফার্মেসি', en: 'Pharmacy' },
    icon: <LocalPharmacy />,
    categories: [
      {
        name: { bn: 'ওষুধ', en: 'Medicines' },
        subCategories: [
          { bn: 'ট্যাবলেট', en: 'Tablets' },
          { bn: 'ক্যাপসুল', en: 'Capsules' },
          { bn: 'সিরাপ', en: 'Syrup' }
        ],
        units: ['স্ট্রিপ', 'বোতল', 'পিস', 'কেজি', 'গ্রাম']
      },
      {
        name: { bn: 'স্বাস্থ্য সামগ্রী', en: 'Health Products' },
        subCategories: [
          { bn: 'ভিটামিন', en: 'Vitamins' },
          { bn: 'প্রোটিন', en: 'Protein' },
          { bn: 'মিনারেল', en: 'Minerals' }
        ],
        units: ['বোতল', 'প্যাকেট', 'কেজি', 'গ্রাম']
      }
    ],
    defaultUnits: ['স্ট্রিপ', 'বোতল', 'প্যাকেট', 'পিস', 'কেজি', 'গ্রাম', 'মিলি লিটার']
  }
};

// Function to get store type configuration
export const getStoreTypeConfig = (storeType) => {
  return storeTypeConfig[storeType] || null;
};

// Function to get all store types
export const getAllStoreTypes = () => {
  return Object.keys(storeTypeConfig);
};

// Function to get categories for a store type
export const getCategoriesForStoreType = (storeType) => {
  const config = getStoreTypeConfig(storeType);
  return config ? config.categories : [];
};

// Function to get units for a store type
export const getUnitsForStoreType = (storeType) => {
  const config = getStoreTypeConfig(storeType);
  return config ? config.defaultUnits : [];
};

// Function to get subcategories for a specific category
export const getSubCategoriesForCategory = (storeType, categoryName) => {
  const config = getStoreTypeConfig(storeType);
  if (!config) return [];
  
  const category = config.categories.find(cat => 
    cat.name.bn === categoryName || cat.name.en === categoryName
  );
  
  return category ? category.subCategories : [];
};

// Function to get units for a specific category
export const getUnitsForCategory = (storeType, categoryName) => {
  const config = getStoreTypeConfig(storeType);
  if (!config) return [];
  
  const category = config.categories.find(cat => 
    cat.name.bn === categoryName || cat.name.en === categoryName
  );
  
  return category ? category.units : config.defaultUnits;
};
