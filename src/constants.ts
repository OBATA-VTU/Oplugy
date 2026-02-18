
// Local Storage Keys
export const LOCAL_STORAGE_TOKEN_KEY = 'obata_token';
export const LOCAL_STORAGE_USER_KEY = 'obata_user';

// API Base URLs
export const OBATA_API_BASE_URL = process.env.REACT_APP_OBATA_API_BASE_URL || '/api/mock';

// Service Categories for Dashboard
export const SERVICE_CATEGORIES = [
  {
    id: 'airtime',
    name: 'Buy Airtime',
    description: 'Instant top-up for all networks.',
    path: '/airtime',
  },
  {
    id: 'data',
    name: 'Buy Data',
    description: 'Affordable data bundles for all networks.',
    path: '/data',
  },
  {
    id: 'bills',
    name: 'Pay Bills',
    description: 'Pay electricity bills seamlessly.',
    path: '/bills',
  },
  {
    id: 'cable',
    name: 'Cable TV',
    description: 'Subscribe to DStv, GOtv, and Startimes.',
    path: '/cable',
  },
  {
    id: 'pricing',
    name: 'Price List',
    description: 'Check current rates for all services.',
    path: '/pricing',
  },
  {
    id: 'gaming',
    name: 'Gaming Topup',
    description: 'Free Fire, COD, and more.',
    path: '/gaming',
  },
  {
    id: 'giftcards',
    name: 'Gift Cards',
    description: 'Buy & Sell global gift cards.',
    path: '/giftcards',
  },
  {
    id: 'airtime_to_cash',
    name: 'Airtime to Cash',
    description: 'Convert excess airtime to bank alert.',
    path: '/airtime-to-cash',
  },
];

export const AIRTIME_NETWORKS = [
  { id: 'MTN', name: 'MTN', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg' },
  { id: 'AIRTEL', name: 'Airtel', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Airtel_logo.png' },
  { id: 'GLO', name: 'Glo', image: 'https://cdn-icons-png.flaticon.com/512/8112/8112396.png' },
  { id: '9MOBILE', name: '9mobile', image: 'https://seeklogo.com/images/1/9mobile-logo-4E386762C9-seeklogo.com.png' },
];

export const DATA_NETWORKS = [
  { id: 'MTN', name: 'MTN', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg' },
  { id: 'AIRTEL', name: 'Airtel', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Airtel_logo.png' },
  { id: 'GLO', name: 'Glo', image: 'https://cdn-icons-png.flaticon.com/512/8112/8112396.png' },
  { id: '9MOBILE', name: '9mobile', image: 'https://seeklogo.com/images/1/9mobile-logo-4E386762C9-seeklogo.com.png' },
];

// Fixed Data Plan Types to match provider requirements (SME, GIFTING, DATASHARE, etc.)
export const DATA_PLAN_TYPES = [
  { id: 'SME', name: 'SME Data' },
  { id: 'GIFTING', name: 'Gifting' },
  { id: 'CORPORATE', name: 'Corporate Gifting' }, // Fallback for general
  { id: 'AWOOF', name: 'Awoof / Special' },
  { id: 'DATASHARE', name: 'Data Share' },
  { id: 'SMEPLUS', name: 'SME Plus' },
];

export const CABLE_BILLERS = [
  { id: 'DSTV', name: 'DStv', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/DStv_logo.svg' },
  { id: 'GOTV', name: 'GOtv', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/GOtv_logo.png' },
  { id: 'STARTIMES', name: 'Startimes', image: 'https://seeklogo.com/images/S/startimes-logo-A27618D237-seeklogo.com.png' },
];

export const SUBSCRIPTION_TYPES = [
  { id: 'RENEW', name: 'RENEW' },
  { id: 'CHANGE', name: 'CHANGE' },
];

export const PRICING_DATA = [
  { network: 'MTN', type: 'SME', size: '500MB', price: '150', validity: '30 DAYS' },
  { network: 'MTN', type: 'SME', size: '1GB', price: '280', validity: '30 DAYS' },
  { network: 'MTN', type: 'SME', size: '2GB', price: '560', validity: '30 DAYS' },
  { network: 'MTN', type: 'SME', size: '5GB', price: '1,350', validity: '30 DAYS' },
  { network: 'AIRTEL', type: 'CG', size: '1GB', price: '290', validity: '30 DAYS' },
  { network: 'GLO', type: 'GIFTING', size: '1GB', price: '300', validity: '30 DAYS' },
  { network: '9MOBILE', type: 'CORPORATE', size: '1GB', price: '320', validity: '30 DAYS' },
];
