import { lazy } from 'react';

export const bannerConfigs = {
  '/food-bazar': {
    title: "Food Bazar",
    subtitle: "Explore our food collection",
    breadcrumbs: [
      { label: "Food", link: "/food" }
    ],
    currentPlaceholder: "Search for food...",
    videoSrc: "/videos/food.mp4",
    hero: {
      title: "কি খাবার খাবেন?",
      subtitle: "আপনার পছন্দের খাবার এখন আপনার দোরগোড়ায়",
      placeholders: ['বিরিয়ানি', 'কারী', 'চাইনিজ', 'ইলিশ', 'মালাইকারি', 'বাটার চিকেন'],
      searchPlaceholder: "খাবার, রেস্টুরেন্ট খুঁজুন..."
    }
  },
  '/grocery-bazar': {
    title: "Grocery Bazar",
    subtitle: "Fresh groceries at your doorstep",
    breadcrumbs: [
      { label: "Grocery", link: "/grocery" }
    ],
    currentPlaceholder: "Search for groceries...",
    videoSrc: "/videos/grocery.mp4",
    hero: {
      title: "কি কেনাকাটা করবেন?",
      subtitle: "তাজা সবজি এবং নিত্য প্রয়োজনীয় পণ্য পৌঁছে যাবে আপনার বাসায়",
      placeholders: ['চাল', 'ডাল', 'আটা', 'তেল', 'মসলা', 'সবজি'],
      searchPlaceholder: "পণ্য খুঁজুন..."
    }
  },
  '/clothing-bazar': {
    title: "Clothing Bazar",
    subtitle: "Discover latest fashion trends",
    breadcrumbs: [
      { label: "Clothing", link: "/clothing" }
    ],
    currentPlaceholder: "Search for clothes...",
    videoSrc: "/videos/clothing.mp4",
    hero: {
      title: "কি ফ্যাশন খুঁজছেন?",
      subtitle: "আধুনিক ফ্যাশন এবং ঐতিহ্যবাহী পোশাক",
      placeholders: ['শাড়ি', 'পাঞ্জাবি', 'কুর্তা', 'সালোয়ার', 'লেহেঙ্গা', 'ব্লাউজ'],
      searchPlaceholder: "পোশাক খুঁজুন..."
    }
  },
  // Add more configurations for other routes as needed
};

// Default banner configuration
export const defaultBannerConfig = {
  title: "Grameen Bazar",
  subtitle: "Your local marketplace",
  breadcrumbs: [],
  currentPlaceholder: "Search...",
  videoSrc: "/videos/default.mp4",
  hero: {
    title: "কি কেনাকাটা করবেন?",
    subtitle: "গ্রামীণ কেনাকাটার অভিজ্ঞতা এখন আপনার মোবাইল ফোনে",
    placeholders: ['পণ্য', 'খাবার', 'পোশাক', 'প্রসাধনী', 'ঔষধ', 'মুদি'],
    searchPlaceholder: "বাজার, পন্য, দোকানের নাম লিখুন..."
  }
};

// Helper function to get banner config based on pathname
export const getBannerConfig = (pathname) => {
  return bannerConfigs[pathname] || defaultBannerConfig;
}; 