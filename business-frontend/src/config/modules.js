/**
 * Module Registry
 * Defines all available modules in the ERP system
 */

export const MODULES = {
  // Core Modules (Always Available)
  INVENTORY: {
    id: 'inventory',
    name: 'Inventory Management',
    nameBn: 'ইনভেন্টরি ব্যবস্থাপনা',
    category: 'core',
    icon: 'Inventory',
    required: true,
    enabled: true,
    description: 'Manage products, stock levels, and inventory',
    descriptionBn: 'পণ্য, স্টক লেভেল এবং ইনভেন্টরি ব্যবস্থাপনা করুন',
    routes: ['/business/dashboard/products', '/business/dashboard/stock'],
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete']
  },

  // Sales Modules
  SALES: {
    id: 'sales',
    name: 'Sales & POS',
    nameBn: 'বিক্রয় এবং POS',
    category: 'sales',
    icon: 'PointOfSale',
    required: false,
    enabled: false,
    dependencies: ['inventory'],
    description: 'Point of Sale system and sales management',
    descriptionBn: 'পয়েন্ট অফ সেল সিস্টেম এবং বিক্রয় ব্যবস্থাপনা',
    routes: ['/business/dashboard/sales', '/business/pos-system'],
    permissions: ['sales.view', 'sales.create', 'sales.edit']
  },

  // Financial Modules
  ACCOUNTING: {
    id: 'accounting',
    name: 'Accounting',
    nameBn: 'হিসাবনিকাশ',
    category: 'financial',
    icon: 'AccountBalance',
    required: false,
    enabled: false,
    description: 'General ledger and accounting management',
    descriptionBn: 'সাধারণ খাতা এবং হিসাব ব্যবস্থাপনা',
    routes: ['/business/dashboard/accounting', '/business/dashboard/chart-of-accounts'],
    permissions: ['accounting.view', 'accounting.create', 'accounting.edit']
  },

  ACCOUNTS_PAYABLE: {
    id: 'accounts_payable',
    name: 'Accounts Payable',
    nameBn: 'প্রদেয় হিসাব',
    category: 'financial',
    icon: 'Payment',
    required: false,
    enabled: false,
    dependencies: ['accounting'],
    description: 'Manage vendor invoices and payments',
    descriptionBn: 'ভেন্ডর ইনভয়েস এবং পেমেন্ট ব্যবস্থাপনা করুন',
    routes: ['/business/dashboard/accounts-payable'],
    permissions: ['accounts_payable.view', 'accounts_payable.create']
  },

  ACCOUNTS_RECEIVABLE: {
    id: 'accounts_receivable',
    name: 'Accounts Receivable',
    nameBn: 'প্রাপ্তিযোগ্য হিসাব',
    category: 'financial',
    icon: 'Receipt',
    required: false,
    enabled: false,
    dependencies: ['accounting'],
    description: 'Manage customer invoices and collections',
    descriptionBn: 'গ্রাহক ইনভয়েস এবং সংগ্রহ ব্যবস্থাপনা করুন',
    routes: ['/business/dashboard/accounts-receivable'],
    permissions: ['accounts_receivable.view', 'accounts_receivable.create']
  },

  // Purchase Modules
  PURCHASE: {
    id: 'purchase',
    name: 'Purchase Management',
    nameBn: 'ক্রয় ব্যবস্থাপনা',
    category: 'procurement',
    icon: 'ShoppingCart',
    required: false,
    enabled: false,
    dependencies: ['inventory'],
    description: 'Purchase orders and procurement management',
    descriptionBn: 'ক্রয় আদেশ এবং ক্রয় ব্যবস্থাপনা',
    routes: ['/business/dashboard/purchase', '/business/dashboard/purchase-orders'],
    permissions: ['purchase.view', 'purchase.create', 'purchase.edit']
  },

  // CRM Modules
  CRM: {
    id: 'crm',
    name: 'Customer Relationship Management',
    nameBn: 'গ্রাহক সম্পর্ক ব্যবস্থাপনা',
    category: 'crm',
    icon: 'People',
    required: false,
    enabled: false,
    description: 'Manage customer relationships and interactions',
    descriptionBn: 'গ্রাহক সম্পর্ক এবং ইন্টারঅ্যাকশন ব্যবস্থাপনা করুন',
    routes: ['/business/dashboard/crm', '/business/dashboard/customers'],
    permissions: ['crm.view', 'crm.create', 'crm.edit']
  },

  // HR Modules
  HR: {
    id: 'hr',
    name: 'Human Resources',
    nameBn: 'মানব সম্পদ',
    category: 'hr',
    icon: 'Groups',
    required: false,
    enabled: false,
    description: 'Employee management and HR operations',
    descriptionBn: 'কর্মচারী ব্যবস্থাপনা এবং HR অপারেশন',
    routes: ['/business/dashboard/hr', '/business/dashboard/employees'],
    permissions: ['hr.view', 'hr.create', 'hr.edit']
  },

  PAYROLL: {
    id: 'payroll',
    name: 'Payroll',
    nameBn: 'বেতন',
    category: 'hr',
    icon: 'AttachMoney',
    required: false,
    enabled: false,
    dependencies: ['hr'],
    description: 'Employee payroll processing',
    descriptionBn: 'কর্মচারী বেতন প্রক্রিয়াকরণ',
    routes: ['/business/dashboard/payroll'],
    permissions: ['payroll.view', 'payroll.create']
  },

  // Warehouse Modules
  WAREHOUSE: {
    id: 'warehouse',
    name: 'Warehouse Management',
    nameBn: 'গুদাম ব্যবস্থাপনা',
    category: 'logistics',
    icon: 'Warehouse',
    required: false,
    enabled: false,
    dependencies: ['inventory'],
    description: 'Multi-warehouse and location management',
    descriptionBn: 'মাল্টি-গুদাম এবং অবস্থান ব্যবস্থাপনা',
    routes: ['/business/dashboard/warehouse'],
    permissions: ['warehouse.view', 'warehouse.create', 'warehouse.edit']
  },

  // Branch Management Module
  BRANCH_MANAGEMENT: {
    id: 'branch_management',
    name: 'Branch Management',
    nameBn: 'শাখা ব্যবস্থাপনা',
    category: 'logistics',
    icon: 'Store',
    required: false,
    enabled: false,
    dependencies: [],
    description: 'Manage multiple business branches and locations',
    descriptionBn: 'একাধিক ব্যবসায়িক শাখা এবং অবস্থান ব্যবস্থাপনা করুন',
    routes: ['/business/dashboard/branches', '/business/dashboard/branch-management'],
    permissions: ['branch.view', 'branch.create', 'branch.edit', 'branch.delete']
  },

  // Reporting Modules
  REPORTS: {
    id: 'reports',
    name: 'Advanced Reports',
    nameBn: 'উন্নত রিপোর্ট',
    category: 'analytics',
    icon: 'Assessment',
    required: false,
    enabled: false,
    description: 'Advanced reporting and analytics',
    descriptionBn: 'উন্নত রিপোর্টিং এবং বিশ্লেষণ',
    routes: ['/business/dashboard/reports', '/business/dashboard/analytics'],
    permissions: ['reports.view', 'reports.export']
  },

  // Special Features
  HALKHATA: {
    id: 'halkhata',
    name: 'Halkhata (Ledger)',
    nameBn: 'হালখাতা',
    category: 'financial',
    icon: 'AccountBalance',
    required: false,
    enabled: false,
    description: 'Traditional ledger system for customer accounts',
    descriptionBn: 'গ্রাহক অ্যাকাউন্টের জন্য ঐতিহ্যবাহী খাতা সিস্টেম',
    routes: ['/business/dashboard/halkhata', '/business/dashboard/halkhata/invitation', '/business/dashboard/halkhata/settings'],
    permissions: ['halkhata.view', 'halkhata.create', 'halkhata.edit']
  }
};

// Module Categories
export const MODULE_CATEGORIES = {
  core: { name: 'Core', nameBn: 'মূল', color: '#1976d2' },
  sales: { name: 'Sales', nameBn: 'বিক্রয়', color: '#2e7d32' },
  financial: { name: 'Financial', nameBn: 'আর্থিক', color: '#ed6c02' },
  procurement: { name: 'Procurement', nameBn: 'ক্রয়', color: '#9c27b0' },
  crm: { name: 'CRM', nameBn: 'গ্রাহক', color: '#0288d1' },
  hr: { name: 'HR', nameBn: 'মানব সম্পদ', color: '#d32f2f' },
  logistics: { name: 'Logistics', nameBn: 'লজিস্টিক', color: '#388e3c' },
  analytics: { name: 'Analytics', nameBn: 'বিশ্লেষণ', color: '#7b1fa2' }
};

// Get module by ID
export const getModuleById = (moduleId) => {
  return Object.values(MODULES).find(module => module.id === moduleId);
};

// Get all modules in a category
export const getModulesByCategory = (category) => {
  return Object.values(MODULES).filter(module => module.category === category);
};

// Get modules by IDs
export const getModulesByIds = (moduleIds) => {
  return moduleIds.map(id => getModuleById(id)).filter(Boolean);
};

