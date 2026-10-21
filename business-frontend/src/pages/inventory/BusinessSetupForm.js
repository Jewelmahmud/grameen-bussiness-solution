import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  ListSubheader,
  Card,
  CardContent,
  CardActions,
  Chip,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ArrowLeft as ArrowLeftIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Percent as PercentIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Map as MapIcon,
  LocalPostOffice as PostOfficeIcon,
  Code as CodeIcon,
  Agriculture as AgricultureIcon,
  LocalFlorist as FloristIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as CafeIcon,
  BakeryDining as BakeryIcon,
  ShoppingCart as ShoppingCartIcon,
  Storefront as StorefrontIcon,
  PhoneAndroid as MobileIcon,
  Link as LinkIcon,
  CloudUpload as UploadIcon,
  Computer as ComputerIcon,
  LocalShipping as ShippingIcon,
  Factory as FactoryIcon,
  Build as BuildIcon,
  Code as CodeTechIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  LocalPharmacy as PharmacyIcon,
  Diamond as JewelryIcon,
  Hotel as HotelIcon,
  CleaningServices as CleaningIcon,
  EnergySavingsLeaf as EnergyIcon,
  Flight as DroneIcon,
  SmartToy as SmartHomeIcon,
  Fastfood as FastFoodIcon,
  Pets as LivestockIcon,
  WaterDrop as WaterIcon,
  ShoppingBag as ShoppingBagIcon,
  Laptop as LaptopIcon,
  DirectionsCar as TransportIcon,
  Apartment as RealEstateIcon,
  CameraAlt as PhotographyIcon,
  Movie as VideoIcon,
  DesignServices as DesignIcon,
  Event as EventIcon,
  PlayCircle as YouTubeIcon,
  LocalLaundryService as LaundryIcon,
  Security as SecurityIcon,
  Nature as EcoIcon,
  Memory as IoTIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BusinessSetupService from '../../services/BusinessSetupService';
import businessTypesData from '../../json/bussiness_types_and_units.json';

// Styled components
const SetupWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  padding: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '400px',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(102, 126, 234, 0.05) 100%)',
    borderRadius: '50%',
    transform: 'translate(50%, 50%)',
    pointerEvents: 'none',
  },
}));

const FooterBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '300px',
  backgroundImage: 'url(/registration_bg.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.6,
  [theme.breakpoints.down('md')]: {
    height: '200px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '150px',
  },
}));

const SetupContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(4, 3),
  paddingBottom: theme.spacing(10), // Add extra bottom padding to prevent content from being covered by footer image
  maxWidth: '800px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    paddingBottom: theme.spacing(8),
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2, 0),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    flexDirection: 'column',
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '60px',
  height: '60px',
  color: '#0a6abd',
  [theme.breakpoints.down('sm')]: {
    width: '50px',
    height: '50px',
  },
  '& svg': {
    width: '100%',
    height: '100%',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .back-button': {
    minWidth: 'auto',
    padding: theme.spacing(1),
    color: '#1a1a1a',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
}));

const StatusBadge = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: 'rgba(10, 106, 189, 0.1)',
  color: '#0a6abd',
  marginLeft: theme.spacing(1),
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(5),
  gap: theme.spacing(1),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#e0e0e0',
    zIndex: 0,
  },
}));

const StepCircle = styled(Box)(({ theme, active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: active || completed ? 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)' : '#e0e0e0',
  color: active || completed ? '#fff' : '#999',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  zIndex: 1,
  border: '3px solid #ffffff',
  boxShadow: active ? '0 0 0 4px rgba(10, 106, 189, 0.2)' : 'none',
  transition: 'all 0.3s ease',
}));

const StepConnector = styled(Box)(({ theme, active }) => ({
  flex: 1,
  height: '2px',
  background: active ? 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)' : '#e0e0e0',
  transition: 'background 0.3s ease',
}));

const FormCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#1a1a1a',
  marginBottom: theme.spacing(1),
}));

const FormDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#666',
  marginBottom: theme.spacing(4),
}));


const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0a6abd',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0a6abd',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#0a6abd',
    },
  },
}));

const StyledSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0a6abd',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0a6abd',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    left: '40px', // Adjust label position to avoid icon overlap
    '&.Mui-focused': {
      color: '#0a6abd',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      transformOrigin: 'top left',
      left: '0px', // Adjust label position to avoid icon overlap
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)',
  color: '#ffffff',
  boxShadow: 'none',
  minWidth: '200px',
  '&:hover': {
    background: 'linear-gradient(45deg, #2d0f6b 30%, #085a9d 90%)',
    boxShadow: 'none',
  },
  '&:disabled': {
    background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)',
    opacity: 0.6,
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.25, 3),
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: '#666',
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'transparent',
  },
}));

const stepLabels = ['ব্যবসার তথ্য', 'ব্যবসার সেটিংস', 'অবস্থান তথ্য', 'সাবস্ক্রিপশন প্যাকেজ'];

const BusinessSetupForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Business Information
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    business_name: '',
    business_type_uuid: '',
    business_code: '',
    address: '',
    subdomain: '',
    logo_url: '',
    tin_number: '',
    trade_license: '',
    opening_time: '',
    closing_time: '',
    enable_pos: true,
    enable_online_orders: false,
  });

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    currency_code: 'BDT',
    currency_symbol: '৳',
    timezone: 'Asia/Dhaka',
    date_format: 'DD/MM/YYYY',
    financial_year_start: '01-07',
    enable_vat: true,
    vat_percentage: 15.00,
    enable_discount: true,
    enable_barcode: true,
    enable_warranty: true,
    low_stock_threshold: 10,
    receipt_header: '',
    receipt_footer: '',
  });

  // Location Information
  const [locationInfo, setLocationInfo] = useState({
    country_uuid: '',
    division_uuid: '',
    district_uuid: '',
    upazila_uuid: '',
    postal_code: '',
  });

  // Dropdown options
  const [countries, setCountries] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);


  // Subscription packages
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'

  // Process business types from JSON
  // Icon mapping for business types
  const getBusinessTypeIcon = (categoryKey, subcategoryKey) => {
    const iconMap = {
      // Agriculture & Agro-Based
      'agriculture_agro': {
        'crop_farming': AgricultureIcon,
        'vegetable_farming': FloristIcon,
        'fruit_orchard': FloristIcon,
        'dairy_farm': LivestockIcon,
        'poultry_farm': LivestockIcon,
        'fish_farming': WaterIcon,
        'shrimp_farming': WaterIcon,
        'mushroom_farming': FloristIcon,
        'agro_processing': FactoryIcon,
        'rice_mill': FactoryIcon,
        'flour_mill': FactoryIcon,
        'cold_storage': InventoryIcon,
        'fertilizer_business': AgricultureIcon,
        'pesticide_sales': AgricultureIcon,
        'seed_business': AgricultureIcon,
      },
      // Livestock & Animal-Based
      'livestock_animal': {
        'dairy_milk': LivestockIcon,
        'beef_fattening': LivestockIcon,
        'goat_farming': LivestockIcon,
        'sheep_farming': LivestockIcon,
        'duck_farming': LivestockIcon,
        'quail_farming': LivestockIcon,
        'pigeon_farming': LivestockIcon,
        'fish_feed_production': FactoryIcon,
        'cattle_feed_production': FactoryIcon,
        'honey_beekeeping': LivestockIcon,
        'leather_processing': FactoryIcon,
      },
      // Food & Beverage
      'food_beverage': {
        'restaurant': RestaurantIcon,
        'cafe': CafeIcon,
        'bakery': BakeryIcon,
        'street_food_shop': FastFoodIcon,
        'catering_service': RestaurantIcon,
        'ice_cream_factory': FactoryIcon,
        'snack_chips_factory': FactoryIcon,
        'pickle_manufacturing': FactoryIcon,
        'spice_grinding': FactoryIcon,
        'water_bottling': WaterIcon,
        'juice_production': FactoryIcon,
      },
      // Retail & Wholesale
      'retail_wholesale': {
        'grocery_shop': ShoppingCartIcon,
        'super_shop': StorefrontIcon,
        'clothing_store': StorefrontIcon,
        'electronics_shop': ComputerIcon,
        'mobile_shop': MobileIcon,
        'cosmetics_shop': StorefrontIcon,
        'hardware_store': BuildIcon,
        'stationery_shop': StorefrontIcon,
        'bookstore': StorefrontIcon,
        'furniture_shop': StorefrontIcon,
        'wholesale_trader': ShoppingBagIcon,
      },
      // E-Commerce & Online
      'ecommerce_online': {
        'online_store': LaptopIcon,
        'multivendor_marketplace': LaptopIcon,
        'f_commerce': LaptopIcon,
        'dropshipping': ShippingIcon,
        'print_on_demand': FactoryIcon,
        'digital_products': CodeTechIcon,
        'online_grocery_delivery': ShoppingCartIcon,
        'food_delivery': FastFoodIcon,
        'online_pharmacy': PharmacyIcon,
        'e_learning_platform': SchoolIcon,
      },
      // Transport & Mobility
      'transport_mobility': {
        'ride_sharing': TransportIcon,
        'truck_transport': ShippingIcon,
        'bus_service': TransportIcon,
        'human_hauler': TransportIcon,
        'auto_rickshaw': TransportIcon,
        'courier_service': ShippingIcon,
        'cargo_shipping': ShippingIcon,
      },
      // Manufacturing & Industry
      'manufacturing_industry': {
        'garments_rmg': FactoryIcon,
        'textile_mill': FactoryIcon,
        'plastic_factory': FactoryIcon,
        'cement_factory': FactoryIcon,
        'steel_rod_factory': FactoryIcon,
        'brickfield': FactoryIcon,
        'pharmaceuticals': PharmacyIcon,
        'electronics_assembly': ComputerIcon,
        'furniture_manufacturing': FactoryIcon,
        'packaging_industry': FactoryIcon,
      },
      // Construction & Real Estate
      'construction_real_estate': {
        'real_estate_development': RealEstateIcon,
        'construction_firm': BuildIcon,
        'interior_design': DesignIcon,
        'architecture_firm': BuildIcon,
        'building_materials_supply': BuildIcon,
      },
      // IT & Technology
      'it_technology': {
        'software_company': CodeTechIcon,
        'web_development': CodeTechIcon,
        'app_development': CodeTechIcon,
        'ui_ux_design': DesignIcon,
        'cybersecurity': SecurityIcon,
        'it_training_center': SchoolIcon,
        'bpo_service': ComputerIcon,
        'cctv_security': SecurityIcon,
      },
      // Education & Training
      'education_training': {
        'school': SchoolIcon,
        'coaching_center': SchoolIcon,
        'language_center': SchoolIcon,
        'it_training_institute': SchoolIcon,
        'online_tutoring': LaptopIcon,
      },
      // Health & Medical
      'health_medical': {
        'hospital': HospitalIcon,
        'clinic': HospitalIcon,
        'diagnostic_center': HospitalIcon,
        'pharmacy': PharmacyIcon,
        'dental_clinic': HospitalIcon,
        'medical_equipment_supply': HospitalIcon,
      },
      // Fashion & Accessories
      'fashion_accessories': {
        'boutique': StorefrontIcon,
        'tailoring': StorefrontIcon,
        'beauty_parlour': StorefrontIcon,
        'spa': StorefrontIcon,
        'jewelry_shop': JewelryIcon,
        'handicrafts': StorefrontIcon,
      },
      // Creative, Media & Entertainment
      'creative_media_entertainment': {
        'photography_studio': PhotographyIcon,
        'videography_agency': VideoIcon,
        'graphics_design': DesignIcon,
        'animation_vfx': VideoIcon,
        'event_management': EventIcon,
        'youtube_business': YouTubeIcon,
      },
      // Pharmacy & Medicine
      'pharmacy_medicine': {
        'pharmacy': PharmacyIcon,
      },
      // Gold & Jewellery
      'gold_jewellery': {
        'gold_shop': JewelryIcon,
      },
      // Tourism & Hospitality
      'tourism_hospitality': {
        'hotel': HotelIcon,
        'resort': HotelIcon,
        'guest_house': HotelIcon,
        'travel_agency': TransportIcon,
        'tour_guide_service': TransportIcon,
      },
      // Home & Community Services
      'home_community_services': {
        'laundry_service': LaundryIcon,
        'home_cleaning': CleaningIcon,
        'pest_control': CleaningIcon,
        'security_service': SecurityIcon,
        'water_purification': WaterIcon,
        'waste_management': EcoIcon,
      },
      // Rural & Village-Based
      'rural_village_business': {
        'rice_mill_rural': FactoryIcon,
        'flour_mill_rural': FactoryIcon,
        'agricultural_machine_rental': AgricultureIcon,
        'handloom': FactoryIcon,
        'bamboo_products': StorefrontIcon,
        'village_pharmacy': PharmacyIcon,
        'tailoring_shop': StorefrontIcon,
        'mobile_servicing': MobileIcon,
        'fish_feed_mill': FactoryIcon,
      },
      // Energy & Utility
      'energy_utility': {
        'solar_energy_business': EnergyIcon,
        'generator_sales': EnergyIcon,
        'ev_charging_station': EnergyIcon,
        'water_supply_systems': WaterIcon,
      },
      // Environmental & Social Enterprise
      'environmental_social_enterprise': {
        'recycling_plant': EcoIcon,
        'plastic_waste_management': EcoIcon,
        'tree_nursery': FloristIcon,
        'ngo_services': EcoIcon,
      },
      // Emerging & Future Tech
      'emerging_future_tech': {
        'drone_services': DroneIcon,
        'iot_solutions': IoTIcon,
        'ai_based_services': AIIcon,
        'smart_home_systems': SmartHomeIcon,
      },
    };

    const categoryIcons = iconMap[categoryKey];
    if (categoryIcons && categoryIcons[subcategoryKey]) {
      return categoryIcons[subcategoryKey];
    }
    // Default icon
    return StoreIcon;
  };

  const processBusinessTypes = () => {
    const types = [];
    businessTypesData.business_categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        const IconComponent = getBusinessTypeIcon(category.key, subcategory.key);
        types.push({
          value: `${category.key}_${subcategory.key}`,
          label: subcategory.name_bn || subcategory.name_en,
          category: category.name_bn || category.name_en,
          categoryKey: category.key,
          subcategoryKey: subcategory.key,
          units: subcategory.units || [],
          icon: IconComponent,
        });
      });
    });
    return types;
  };

  const businessTypes = processBusinessTypes();

  // Load initial data
  useEffect(() => {
    document.title = 'ব্যবসায়িক তথ্য';
    loadInitialData();
  }, [locationInfo.country_uuid]);

  // Load countries on mount - this should be the first thing loaded
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await BusinessSetupService.getCountries();
        if (response.success && response.data) {
          setCountries(response.data);
          // Auto-select Bangladesh if available (optional - user can change it)
          const bangladesh = response.data.find(c => c.name === 'Bangladesh' || c.name_bn === 'বাংলাদেশ');
          if (bangladesh && !locationInfo.country_uuid) {
            setLocationInfo(prev => ({
              ...prev,
              country_uuid: bangladesh.country_uuid || bangladesh.uuid,
            }));
          }
        }
      } catch (err) {
        console.error('Error loading countries:', err);
        setError('দেশের তালিকা লোড করতে সমস্যা হয়েছে। পৃষ্ঠাটি রিফ্রেশ করুন।');
      }
    };
    fetchCountries();
  }, [locationInfo.country_uuid]);

  // Load divisions when country changes
  useEffect(() => {
    const fetchDivisions = async () => {
      if (locationInfo.country_uuid && countries.length > 0) {
        try {
          // Get the selected country name to pass to the API
          const selectedCountry = countries.find(c => (c.country_uuid || c.uuid) === locationInfo.country_uuid);
          const countryName = selectedCountry?.name || 'Bangladesh';
          
          const response = await BusinessSetupService.getDivisions(countryName);
          if (response.success && response.data) {
            setDivisions(response.data);
          } else {
            setDivisions([]);
          }
          setDistricts([]);
          setUpazilas([]);
          // Reset dependent fields
          setLocationInfo(prev => ({
            ...prev,
            division_uuid: '',
            district_uuid: '',
            upazila_uuid: '',
          }));
        } catch (err) {
          console.error('Error loading divisions:', err);
          setDivisions([]);
          setDistricts([]);
          setUpazilas([]);
        }
      } else {
        setDivisions([]);
        setDistricts([]);
        setUpazilas([]);
      }
    };
    // Only fetch if countries are loaded
    if (countries.length > 0) {
      fetchDivisions();
    }
  }, [locationInfo.country_uuid, countries]);

  // Load districts when division changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (locationInfo.division_uuid) {
        try {
          const response = await BusinessSetupService.getDistricts(locationInfo.division_uuid);
          if (response.success && response.data) {
            setDistricts(response.data);
          } else {
            setDistricts([]);
          }
          setUpazilas([]);
          // Reset dependent field
          setLocationInfo(prev => ({
            ...prev,
            district_uuid: '',
            upazila_uuid: '',
          }));
        } catch (err) {
          console.error('Error loading districts:', err);
          setDistricts([]);
          setUpazilas([]);
        }
      } else {
        setDistricts([]);
        setUpazilas([]);
      }
    };
    fetchDistricts();
  }, [locationInfo.division_uuid]);

  // Load upazilas when district changes
  useEffect(() => {
    const fetchUpazilas = async () => {
      if (locationInfo.district_uuid) {
        try {
          const response = await BusinessSetupService.getUpazilas(locationInfo.district_uuid);
          if (response.success && response.data) {
            setUpazilas(response.data);
          } else {
            setUpazilas([]);
          }
          // Reset dependent field
          setLocationInfo(prev => ({
            ...prev,
            upazila_uuid: '',
          }));
        } catch (err) {
          console.error('Error loading upazilas:', err);
          setUpazilas([]);
        }
      } else {
        setUpazilas([]);
      }
    };
    fetchUpazilas();
  }, [locationInfo.district_uuid]);

  const loadInitialData = async () => {
    setFetching(true);
    try {
      // Hardcoded subscription packages
      const packages = [
        {
          id: 'free',
          name: 'Free Package',
          name_bn: 'ফ্রি প্যাকেজ',
          price: 0,
          monthly_price: 0,
          billing_period: 'monthly',
          description: 'Forever free with limits',
          description_bn: 'সীমাবদ্ধতার সাথে চিরকালিন ফ্রি',
          features: [
            'সীমিত পণ্য সংযোজন',
            'মৌলিক ইনভেন্টরি ব্যবস্থাপনা',
            'সীমিত বিক্রয় রিপোর্ট',
            'কমিউনিটি সাপোর্ট'
          ]
        },
        {
          id: 'small',
          name: 'Small Business',
          name_bn: 'ছোট ব্যবসা',
          price: 500,
          monthly_price: 500,
          billing_period: 'monthly',
          description: 'Perfect for small businesses',
          description_bn: 'ছোট ব্যবসার জন্য উপযুক্ত',
          features: [
            'অসীম পণ্য সংযোজন',
            'সম্পূর্ণ ইনভেন্টরি ব্যবস্থাপনা',
            'বিক্রয় ও ক্রয় রিপোর্ট',
            'ইমেইল সাপোর্ট',
            'মাল্টি-ইউজার এক্সেস'
          ]
        },
        {
          id: 'mid',
          name: 'Mid size business',
          name_bn: 'মাঝারি ব্যবসা',
          price: 1500,
          monthly_price: 1500,
          billing_period: 'monthly',
          description: 'Ideal for growing businesses',
          description_bn: 'বর্ধিষ্ণু ব্যবসার জন্য আদর্শ',
          features: [
            'অসীম পণ্য ও বৈচিত্র্য',
            'উন্নত ইনভেন্টরি ব্যবস্থাপনা',
            'বিস্তারিত রিপোর্টিং ও বিশ্লেষণ',
            'অগ্রাধিকার ইমেইল সাপোর্ট',
            'অসীম ইউজার এক্সেস',
            'API এক্সেস'
          ]
        },
        {
          id: 'big',
          name: 'Big business',
          name_bn: 'বড় ব্যবসা',
          price: 3000,
          monthly_price: 3000,
          billing_period: 'monthly',
          description: 'For large scale businesses',
          description_bn: 'বৃহৎ ব্যবসার জন্য',
          features: [
            'অসীম সবকিছু',
            'এন্টারপ্রাইজ-গ্রেড ইনভেন্টরি',
            'উন্নত রিপোর্টিং ও ড্যাশবোর্ড',
            '২৪/৭ প্রাইওরিটি সাপোর্ট',
            'অসীম ইউজার ও পারমিশন',
            'ফুল API এক্সেস',
            'কাস্টমাইজেশন',
            'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার'
          ]
        }
      ];
      setSubscriptionPackages(packages);
      // Set default selected package to 'mid' (মাঝারি ব্যবসা)
      const defaultPackage = packages.find(pkg => pkg.id === 'mid');
      if (defaultPackage) {
        setSelectedPackage(defaultPackage);
      }
      // Locations are already loaded from JSON, no API call needed
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('ডেটা লোড করতে সমস্যা হয়েছে। পৃষ্ঠাটি রিফ্রেশ করুন।');
    } finally {
      setFetching(false);
    }
  };

  const handleBusinessInfoChange = (field) => (e) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Currency symbol mapping
  const currencySymbolMap = {
    'BDT': '৳',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'PKR': '₨',
    'NPR': '₨',
    'SAR': '﷼',
    'AED': 'د.إ',
  };

  const handleBusinessSettingsChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setBusinessSettings(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };
      // Automatically set currency symbol when currency code changes
      if (field === 'currency_code' && currencySymbolMap[value]) {
        updated.currency_symbol = currencySymbolMap[value];
      }
      return updated;
    });
  };

  const handleLocationInfoChange = (field) => (e) => {
    setLocationInfo(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Business Information
        if (!businessInfo.name || !businessInfo.business_name || !businessInfo.business_type_uuid) {
          setError('অনুগ্রহ করে সব আবশ্যক ক্ষেত্র পূরণ করুন');
          return false;
        }
        return true;
      case 1: // Business Settings
        // Settings are mostly optional or have defaults
        return true;
      case 2: // Location Information
        if (!locationInfo.country_uuid || !locationInfo.division_uuid || !locationInfo.district_uuid || !locationInfo.upazila_uuid) {
          setError('অনুগ্রহ করে সব অবস্থান তথ্য সম্পূর্ণ করুন (দেশ, বিভাগ, জেলা, উপজেলা)');
          return false;
        }
        return true;
      case 3: // Subscription Package
        if (!selectedPackage) {
          setError('অনুগ্রহ করে একটি সাবস্ক্রিপশন প্যাকেজ নির্বাচন করুন');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setError('');
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        tenant: {
          name: businessInfo.name,
          business_name: businessInfo.business_name,
          address: businessInfo.address,
          subdomain: businessInfo.subdomain || null,
          logo_url: businessInfo.logo_url || null,
          tin_number: businessInfo.tin_number || null,
          trade_license: businessInfo.trade_license || null,
          country_uuid: locationInfo.country_uuid,
          division_uuid: locationInfo.division_uuid,
          district_uuid: locationInfo.district_uuid,
          upazila_uuid: locationInfo.upazila_uuid,
          postal_code: locationInfo.postal_code || null,
        },
        business: {
          business_type_uuid: businessInfo.business_type_uuid,
          business_type_category_key: businessInfo.business_type_uuid ? businessInfo.business_type_uuid.split('_')[0] : null,
          business_type_subcategory_key: businessInfo.business_type_uuid ? businessInfo.business_type_uuid.split('_')[1] : null,
          name: businessInfo.business_name,
          code: businessInfo.business_code || businessInfo.business_name.substring(0, 10).toUpperCase().replace(/\s/g, '_'),
          address: businessInfo.address,
          opening_time: businessInfo.opening_time || null,
          closing_time: businessInfo.closing_time || null,
          enable_pos: businessInfo.enable_pos !== undefined ? businessInfo.enable_pos : true,
          enable_online_orders: businessInfo.enable_online_orders !== undefined ? businessInfo.enable_online_orders : false,
        },
        settings: businessSettings,
        location: {
          country_uuid: locationInfo.country_uuid,
          division_uuid: locationInfo.division_uuid,
          district_uuid: locationInfo.district_uuid,
          upazila_uuid: locationInfo.upazila_uuid,
          postal_code: locationInfo.postal_code || null,
        },
        subscription: {
          plan_id: selectedPackage?.id || selectedPackage?.plan_id || selectedPackage?.uuid || null,
          billing_period: billingPeriod,
        },
      };

      await BusinessSetupService.saveBusinessSetup(data);
      
      setSuccess('ব্যবসার তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/business/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'ডেটা সংরক্ষণ করতে সমস্যা হয়েছে';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessInfoTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="নাম *"
            value={businessInfo.name}
            onChange={handleBusinessInfoChange('name')}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="ব্যবসার নাম *"
            value={businessInfo.business_name}
            onChange={handleBusinessInfoChange('business_name')}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StoreIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={businessTypes}
            groupBy={(option) => option.category}
            getOptionLabel={(option) => option.label}
            value={businessTypes.find(type => type.value === businessInfo.business_type_uuid) || null}
            onChange={(event, newValue) => {
              setBusinessInfo(prev => ({
                ...prev,
                business_type_uuid: newValue ? newValue.value : '',
              }));
            }}
            disablePortal={false}
            ListboxProps={{
              style: {
                maxHeight: '300px',
              },
            }}
            renderInput={(params) => {
              const selectedOption = businessTypes.find(type => type.value === businessInfo.business_type_uuid);
              const SelectedIcon = selectedOption?.icon || CategoryIcon;
              return (
                <StyledTextField
                  {...params}
                  label="ব্যবসার ধরন *"
                  required
                  margin="normal"
                  placeholder="খুঁজুন..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SelectedIcon sx={{ color: '#0a6abd' }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              );
            }}
            renderOption={(props, option) => {
              const IconComponent = option.icon || StoreIcon;
              return (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconComponent sx={{ color: '#0a6abd', fontSize: 20 }} />
                  <Typography>{option.label}</Typography>
                </Box>
              );
            }}
            renderGroup={(params) => (
              <li key={params.key}>
                <ListSubheader
                  sx={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: 600,
                    color: '#0a6abd',
                    fontSize: '0.875rem',
                  }}
                >
                  {params.group}
                </ListSubheader>
                {params.children}
              </li>
            )}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.category.toLowerCase().includes(inputValue.toLowerCase())
              );
              return filtered;
            }}
            noOptionsText="কোন ফলাফল পাওয়া যায়নি"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#ffffff',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="ব্যবসার কোড"
            value={businessInfo.business_code}
            onChange={handleBusinessInfoChange('business_code')}
            helperText="খালি থাকলে স্বয়ংক্রিয়ভাবে তৈরি হবে"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="TIN নম্বর"
            value={businessInfo.tin_number}
            onChange={handleBusinessInfoChange('tin_number')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="ট্রেড লাইসেন্স"
            value={businessInfo.trade_license}
            onChange={handleBusinessInfoChange('trade_license')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="সাবডোমেইন"
            value={businessInfo.subdomain}
            onChange={handleBusinessInfoChange('subdomain')}
            margin="normal"
            placeholder="your-business"
            helperText="খালি থাকলে স্বয়ংক্রিয়ভাবে তৈরি হবে"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="logo-upload-button"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    setError('লোগোর আকার 5MB এর কম হতে হবে');
                    return;
                  }
                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    setError('শুধুমাত্র ছবি ফাইল আপলোড করা যাবে');
                    return;
                  }
                  // Convert to base64 or create object URL
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setBusinessInfo(prev => ({
                      ...prev,
                      logo_url: reader.result, // Store as base64 data URL
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label htmlFor="logo-upload-button">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{
                  borderColor: '#0a6abd',
                  color: '#0a6abd',
                  '&:hover': {
                    borderColor: '#085a9d',
                    backgroundColor: 'rgba(10, 106, 189, 0.04)',
                  },
                  py: 1.5,
                }}
              >
                {businessInfo.logo_url ? 'লোগো পরিবর্তন করুন' : 'লোগো আপলোড করুন'}
              </Button>
            </label>
            {businessInfo.logo_url && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={businessInfo.logo_url}
                  alt="Logo preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '100px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setBusinessInfo(prev => ({
                      ...prev,
                      logo_url: '',
                    }));
                  }}
                  sx={{ mt: 1 }}
                >
                  সরান
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>ব্যবসার সময়সূচী</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="খোলার সময়"
            type="time"
            value={businessInfo.opening_time}
            onChange={handleBusinessInfoChange('opening_time')}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="বন্ধের সময়"
            type="time"
            value={businessInfo.closing_time}
            onChange={handleBusinessInfoChange('closing_time')}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>সক্রিয় করুন/বন্ধ করুন</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessInfo.enable_pos}
                onChange={(e) => setBusinessInfo(prev => ({
                  ...prev,
                  enable_pos: e.target.checked
                }))}
              />
            }
            label="POS সক্রিয় করুন"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessInfo.enable_online_orders}
                onChange={(e) => setBusinessInfo(prev => ({
                  ...prev,
                  enable_online_orders: e.target.checked
                }))}
                disabled
              />
            }
            label="অনলাইন অর্ডার সক্রিয় করুন"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderBusinessSettingsTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            select
            label="মুদ্রা"
            value={businessSettings.currency_code}
            onChange={handleBusinessSettingsChange('currency_code')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
            SelectProps={{
              MenuProps: {
                disableScrollLock: true,
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              },
            }}
          >
            <MenuItem value="BDT">BDT (৳)</MenuItem>
            <MenuItem value="USD">USD ($)</MenuItem>
            <MenuItem value="EUR">EUR (€)</MenuItem>
            <MenuItem value="GBP">GBP (£)</MenuItem>
            <MenuItem value="INR">INR (₹)</MenuItem>
            <MenuItem value="PKR">PKR (₨)</MenuItem>
            <MenuItem value="NPR">NPR (₨)</MenuItem>
            <MenuItem value="SAR">SAR (﷼)</MenuItem>
            <MenuItem value="AED">AED (د.إ)</MenuItem>
          </StyledTextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            select
            label="সময় অঞ্চল"
            value={businessSettings.timezone}
            onChange={handleBusinessSettingsChange('timezone')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
            SelectProps={{
              MenuProps: {
                disableScrollLock: true,
                PaperProps: {
                  style: {
                    maxHeight: 400,
                  },
                },
              },
            }}
          >
            <MenuItem value="Asia/Dhaka">এশিয়া/ঢাকা (GMT+6)</MenuItem>
            <MenuItem value="Asia/Kolkata">এশিয়া/কলকাতা (GMT+5:30)</MenuItem>
            <MenuItem value="Asia/Karachi">এশিয়া/করাচি (GMT+5)</MenuItem>
            <MenuItem value="Asia/Kathmandu">এশিয়া/কাঠমান্ডু, নেপাল (GMT+5:45)</MenuItem>
            <MenuItem value="Asia/Thimphu">এশিয়া/থিম্পু, ভুটান (GMT+6)</MenuItem>
            <MenuItem value="Asia/Colombo">এশিয়া/কলম্বো, শ্রীলঙ্কা (GMT+5:30)</MenuItem>
            <MenuItem value="Asia/Dubai">এশিয়া/দুবাই (GMT+4)</MenuItem>
            <MenuItem value="Asia/Riyadh">এশিয়া/রিয়াদ (GMT+3)</MenuItem>
            <MenuItem value="Asia/Singapore">এশিয়া/সিঙ্গাপুর (GMT+8)</MenuItem>
            <MenuItem value="Asia/Bangkok">এশিয়া/ব্যাংকক (GMT+7)</MenuItem>
            <MenuItem value="Asia/Kuala_Lumpur">এশিয়া/কুয়ালালামপুর (GMT+8)</MenuItem>
            <MenuItem value="Asia/Jakarta">এশিয়া/জাকার্তা (GMT+7)</MenuItem>
            <MenuItem value="Asia/Manila">এশিয়া/ম্যানিলা (GMT+8)</MenuItem>
            <MenuItem value="Asia/Tokyo">এশিয়া/টোকিও (GMT+9)</MenuItem>
            <MenuItem value="Asia/Seoul">এশিয়া/সিউল (GMT+9)</MenuItem>
            <MenuItem value="Asia/Hong_Kong">এশিয়া/হংকং (GMT+8)</MenuItem>
            <MenuItem value="Asia/Shanghai">এশিয়া/শাংহাই (GMT+8)</MenuItem>
            <MenuItem value="Asia/Tehran">এশিয়া/তেহরান (GMT+3:30)</MenuItem>
            <MenuItem value="Asia/Baghdad">এশিয়া/বাগদাদ (GMT+3)</MenuItem>
            <MenuItem value="Asia/Kuwait">এশিয়া/কুয়েত (GMT+3)</MenuItem>
            <MenuItem value="Asia/Qatar">এশিয়া/কাতার (GMT+3)</MenuItem>
            <MenuItem value="Asia/Muscat">এশিয়া/মাস্কাট (GMT+4)</MenuItem>
            <MenuItem value="Asia/Yangon">এশিয়া/ইয়াঙ্গুন (GMT+6:30)</MenuItem>
            <MenuItem value="Asia/Kabul">এশিয়া/কাবুল (GMT+4:30)</MenuItem>
            <MenuItem value="Europe/London">ইউরোপ/লন্ডন (GMT+0)</MenuItem>
            <MenuItem value="Europe/Paris">ইউরোপ/প্যারিস (GMT+1)</MenuItem>
            <MenuItem value="Europe/Berlin">ইউরোপ/বার্লিন (GMT+1)</MenuItem>
            <MenuItem value="Europe/Madrid">ইউরোপ/মাদ্রিদ (GMT+1)</MenuItem>
            <MenuItem value="Europe/Rome">ইউরোপ/রোম (GMT+1)</MenuItem>
            <MenuItem value="Europe/Amsterdam">ইউরোপ/আমস্টারডাম (GMT+1)</MenuItem>
            <MenuItem value="Europe/Moscow">ইউরোপ/মস্কো (GMT+3)</MenuItem>
            <MenuItem value="America/New_York">আমেরিকা/নিউ ইয়র্ক (GMT-5)</MenuItem>
            <MenuItem value="America/Chicago">আমেরিকা/শিকাগো (GMT-6)</MenuItem>
            <MenuItem value="America/Denver">আমেরিকা/ডেনভার (GMT-7)</MenuItem>
            <MenuItem value="America/Los_Angeles">আমেরিকা/লস অ্যাঞ্জেলেস (GMT-8)</MenuItem>
            <MenuItem value="America/Toronto">আমেরিকা/টরন্টো (GMT-5)</MenuItem>
            <MenuItem value="America/Mexico_City">আমেরিকা/মেক্সিকো সিটি (GMT-6)</MenuItem>
            <MenuItem value="America/Sao_Paulo">আমেরিকা/সাও পাওলো (GMT-3)</MenuItem>
            <MenuItem value="America/Buenos_Aires">আমেরিকা/বুয়েনস আইরেস (GMT-3)</MenuItem>
            <MenuItem value="Africa/Cairo">আফ্রিকা/কায়রো (GMT+2)</MenuItem>
            <MenuItem value="Africa/Johannesburg">আফ্রিকা/জোহানেসবার্গ (GMT+2)</MenuItem>
            <MenuItem value="Africa/Lagos">আফ্রিকা/লাগোস (GMT+1)</MenuItem>
            <MenuItem value="Australia/Sydney">অস্ট্রেলিয়া/সিডনি (GMT+10)</MenuItem>
            <MenuItem value="Australia/Melbourne">অস্ট্রেলিয়া/মেলবোর্ন (GMT+10)</MenuItem>
            <MenuItem value="Australia/Perth">অস্ট্রেলিয়া/পার্থ (GMT+8)</MenuItem>
            <MenuItem value="Pacific/Auckland">প্যাসিফিক/অকল্যান্ড (GMT+12)</MenuItem>
            <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
          </StyledTextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="তারিখ ফরম্যাট"
            value={businessSettings.date_format}
            onChange={handleBusinessSettingsChange('date_format')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="আর্থিক বছরের শুরু"
            value={businessSettings.financial_year_start}
            onChange={handleBusinessSettingsChange('financial_year_start')}
            placeholder="MM-DD (উদাহরণ: 01-07)"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="VAT শতাংশ"
            type="number"
            value={businessSettings.vat_percentage}
            onChange={handleBusinessSettingsChange('vat_percentage')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PercentIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
              inputProps: { min: 0, max: 100, step: 0.01 },
            }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="নিম্ন স্টক সীমা"
            type="number"
            value={businessSettings.low_stock_threshold}
            onChange={handleBusinessSettingsChange('low_stock_threshold')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WarningIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
              inputProps: { min: 0 },
            }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>সক্রিয় করুন/বন্ধ করুন</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessSettings.enable_vat}
                onChange={handleBusinessSettingsChange('enable_vat')}
              />
            }
            label="VAT সক্রিয় করুন"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessSettings.enable_discount}
                onChange={handleBusinessSettingsChange('enable_discount')}
              />
            }
            label="ছাড় সক্রিয় করুন"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessSettings.enable_barcode}
                onChange={handleBusinessSettingsChange('enable_barcode')}
              />
            }
            label="বারকোড সক্রিয় করুন"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={businessSettings.enable_warranty}
                onChange={handleBusinessSettingsChange('enable_warranty')}
              />
            }
            label="ওয়ারেন্টি সক্রিয় করুন"
          />
        </Grid>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="রশিদ হেডার"
            value={businessSettings.receipt_header}
            onChange={handleBusinessSettingsChange('receipt_header')}
            multiline
            rows={3}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignItems: 'flex-start', pt: 1 }}>
                  <DescriptionIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="রশিদ ফুটার"
            value={businessSettings.receipt_footer}
            onChange={handleBusinessSettingsChange('receipt_footer')}
            multiline
            rows={3}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignItems: 'flex-start', pt: 1 }}>
                  <DescriptionIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderLocationInfoTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
              <MapIcon sx={{ color: '#0a6abd' }} />
            </Box>
            <StyledSelect fullWidth required>
              <InputLabel>দেশ</InputLabel>
              <Select
                value={locationInfo.country_uuid}
                onChange={handleLocationInfoChange('country_uuid')}
                label="দেশ"
                sx={{ pl: 5 }}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {countries.map((country) => (
                  <MenuItem key={country.country_uuid || country.uuid} value={country.country_uuid || country.uuid}>
                    {country.name_bn || country.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledSelect>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
              <MapIcon sx={{ color: '#0a6abd' }} />
            </Box>
            <StyledSelect fullWidth required>
              <InputLabel>বিভাগ</InputLabel>
              <Select
                value={locationInfo.division_uuid}
                onChange={handleLocationInfoChange('division_uuid')}
                label="বিভাগ"
                disabled={!locationInfo.country_uuid}
                sx={{ pl: 5 }}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {divisions.map((division) => (
                  <MenuItem key={division.division_uuid || division.uuid} value={division.division_uuid || division.uuid}>
                    {division.name_bn || division.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledSelect>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', mt: 2, mb: 1 }}>
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
              <MapIcon sx={{ color: '#0a6abd' }} />
            </Box>
            <StyledSelect fullWidth required>
              <InputLabel>জেলা</InputLabel>
              <Select
                value={locationInfo.district_uuid}
                onChange={handleLocationInfoChange('district_uuid')}
                label="জেলা"
                disabled={!locationInfo.division_uuid}
                sx={{ pl: 5 }}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {districts.map((district) => (
                  <MenuItem key={district.district_uuid || district.uuid} value={district.district_uuid || district.uuid}>
                    {district.name_bn || district.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledSelect>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', mt: 2, mb: 1 }}>
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
              <MapIcon sx={{ color: '#0a6abd' }} />
            </Box>
            <StyledSelect fullWidth required>
              <InputLabel>উপজেলা/থানা *</InputLabel>
              <Select
                value={locationInfo.upazila_uuid}
                onChange={handleLocationInfoChange('upazila_uuid')}
                label="উপজেলা/থানা *"
                disabled={!locationInfo.district_uuid}
                sx={{ pl: 5 }}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {upazilas.map((upazila) => (
                  <MenuItem key={upazila.upazila_uuid || upazila.uuid} value={upazila.upazila_uuid || upazila.uuid}>
                    {upazila.name_bn || upazila.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledSelect>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="পোস্টাল কোড"
            value={locationInfo.postal_code}
            onChange={handleLocationInfoChange('postal_code')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PostOfficeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="ঠিকানা"
            value={businessInfo.address}
            onChange={handleBusinessInfoChange('address')}
            multiline
            rows={3}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignItems: 'flex-start', alignSelf: 'flex-start', pt: 1.5 }}>
                  <HomeIcon sx={{ color: '#0a6abd' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderSubscriptionPackagesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body1" sx={{ color: '#666' }}>
          আপনার ব্যবসার জন্য একটি সাবস্ক্রিপশন প্যাকেজ নির্বাচন করুন
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: billingPeriod === 'monthly' ? '#0a6abd' : '#666', fontWeight: billingPeriod === 'monthly' ? 600 : 400 }}>
            মাসিক
          </Typography>
          <Switch
            checked={billingPeriod === 'yearly'}
            onChange={(e) => setBillingPeriod(e.target.checked ? 'yearly' : 'monthly')}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0a6abd',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#0a6abd',
              },
            }}
          />
          <Typography variant="body2" sx={{ color: billingPeriod === 'yearly' ? '#0a6abd' : '#666', fontWeight: billingPeriod === 'yearly' ? 600 : 400 }}>
            বার্ষিক
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {subscriptionPackages.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              সাবস্ক্রিপশন প্যাকেজ এখনও উপলব্ধ নয়। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
            </Alert>
          </Grid>
        ) : (
          subscriptionPackages.map((pkg) => {
            const isSelected = selectedPackage && selectedPackage.id === pkg.id;
            // Calculate price based on billing period
            const basePrice = pkg.monthly_price || pkg.price || 0;
            const price = billingPeriod === 'yearly' ? Math.round(basePrice * 12 * 0.8) : basePrice; // 20% discount for yearly
            const name = pkg.name_bn || pkg.name || pkg.plan_name || 'প্যাকেজ';
            const description = pkg.description_bn || pkg.description || pkg.plan_description || '';
            
            return (
              <Grid item xs={12} sm={6} md={3} key={pkg.id || pkg.plan_id || pkg.uuid}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isSelected ? '3px solid #0a6abd' : '2px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 24px rgba(10, 106, 189, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
                    '&:hover': {
                      boxShadow: isSelected ? '0 8px 24px rgba(10, 106, 189, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(-2px)',
                      borderColor: isSelected ? '#0a6abd' : '#0a6abd',
                    },
                    backgroundColor: isSelected ? 'rgba(10, 106, 189, 0.08)' : '#ffffff',
                    position: 'relative',
                    '&::before': isSelected ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)',
                      borderRadius: '8px 8px 0 0',
                    } : {},
                  }}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: isSelected ? '#0a6abd' : '#1a1a1a',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {name}
                      </Typography>
                      {isSelected && (
                        <Chip
                          icon={<CheckIcon sx={{ color: '#fff !important' }} />}
                          label="নির্বাচিত"
                          color="primary"
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)', 
                            color: '#fff',
                            fontWeight: 600,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': {
                                boxShadow: '0 0 0 0 rgba(10, 106, 189, 0.4)',
                              },
                              '50%': {
                                boxShadow: '0 0 0 8px rgba(10, 106, 189, 0)',
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: isSelected ? '#0a6abd' : '#666',
                          mb: 0.5,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        ৳{price.toLocaleString('en-BD')}
                        {price === 0 && (
                          <Typography 
                            component="span" 
                            variant="caption" 
                            sx={{ 
                              ml: 1, 
                              color: '#4CAF50',
                              fontWeight: 600,
                            }}
                          >
                            (ফ্রি)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {billingPeriod === 'monthly' ? 'মাসিক' : 'বার্ষিক'}
                        {billingPeriod === 'yearly' && (
                          <Typography 
                            component="span" 
                            variant="caption" 
                            sx={{ 
                              ml: 1, 
                              color: '#4CAF50',
                              fontWeight: 600,
                            }}
                          >
                            (২০% ছাড়)
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    {description && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 2, minHeight: '40px' }}>
                        {description}
                      </Typography>
                    )}

                    {pkg.features && pkg.features.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                          বৈশিষ্ট্য:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {pkg.features.map((feature, idx) => (
                            <Typography
                              key={idx}
                              component="li"
                              variant="body2"
                              sx={{ color: '#666', mb: 0.5 }}
                            >
                              {feature}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={isSelected ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackage(pkg);
                      }}
                      startIcon={isSelected ? <CheckIcon /> : null}
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        py: 1.2,
                        background: isSelected ? 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)' : 'transparent',
                        borderColor: isSelected ? 'transparent' : '#0a6abd',
                        borderWidth: isSelected ? 0 : '2px',
                        color: isSelected ? '#fff' : '#0a6abd',
                        boxShadow: isSelected ? '0 4px 12px rgba(10, 106, 189, 0.3)' : 'none',
                        '&:hover': {
                          background: isSelected 
                            ? 'linear-gradient(45deg, #2d0f6b 30%, #085a9d 90%)' 
                            : 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)',
                          color: '#fff',
                          borderColor: 'transparent',
                          boxShadow: isSelected 
                            ? '0 6px 16px rgba(10, 106, 189, 0.4)' 
                            : '0 4px 12px rgba(10, 106, 189, 0.3)',
                          transform: 'scale(1.02)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isSelected ? 'নির্বাচিত' : 'নির্বাচন করুন'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );

  if (fetching) {
    return (
      <SetupWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress sx={{ color: '#0a6abd' }} size={60} />
        </Box>
      </SetupWrapper>
    );
  }

  return (
    <SetupWrapper>
      <FooterBackground />
      <SetupContainer>
        {/* Logo Section */}
        <LogoContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LogoIcon>
              <Package />
            </LogoIcon>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.5rem' }}>
              গ্রামীণ ব্যবসা
            </Typography>
          </Box>
          <Box sx={{ width: '2px', height: '50px', backgroundColor: '#e0e0e0' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LogoIcon>
              <ShoppingBag />
            </LogoIcon>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.5rem' }}>
              গ্রামীণ বাজার
            </Typography>
          </Box>
        </LogoContainer>
        {/* Header Section */}
        <HeaderSection>
          <SecondaryButton
            startIcon={<ArrowLeftIcon />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            ফিরে যান
          </SecondaryButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            ব্যবসার তথ্য সেটআপ
          </Typography>
          <StatusBadge>চলমান</StatusBadge>
        </HeaderSection>

        {/* Progress Indicator */}
        <ProgressIndicator>
          {stepLabels.map((label, index) => (
            <React.Fragment key={index}>
              <StepCircle
                active={activeStep === index}
                completed={activeStep > index}
              >
                {activeStep > index ? '✓' : index + 1}
              </StepCircle>
              {index < stepLabels.length - 1 && (
                <StepConnector active={activeStep > index} />
              )}
            </React.Fragment>
          ))}
        </ProgressIndicator>

        {/* Form Card */}
        <FormCard>
          <FormTitle>{stepLabels[activeStep]}</FormTitle>
          <FormDescription>
            আপনার ব্যবসার তথ্য সম্পূর্ণ করতে অনুগ্রহ করে নিম্নলিখিত তথ্যগুলো পূরণ করুন
          </FormDescription>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 1,
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 1,
              }}
            >
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {activeStep === 0 && renderBusinessInfoTab()}
            {activeStep === 1 && renderBusinessSettingsTab()}
            {activeStep === 2 && renderLocationInfoTab()}
            {activeStep === 3 && renderSubscriptionPackagesTab()}
          </Box>
        </FormCard>

        {/* Action Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: 2,
          }}
        >
          <SecondaryButton
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            পূর্ববর্তী
          </SecondaryButton>
          {activeStep === stepLabels.length - 1 ? (
            <PrimaryButton
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              পরবর্তী
            </PrimaryButton>
          )}
        </Box>
      </SetupContainer>
    </SetupWrapper>
  );
};

export default BusinessSetupForm;

