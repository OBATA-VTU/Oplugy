
// Local Storage Keys
export const LOCAL_STORAGE_TOKEN_KEY = 'oplug_token';
export const LOCAL_STORAGE_USER_KEY = 'oplug_user';

// API Base URLs - This is for a potential separate backend for Oplug user management.
// Kept for structure, but not used by the hardcoded auth system.
export const OPLUG_API_BASE_URL = process.env.REACT_APP_OPLUG_API_BASE_URL || '/api/mock';

// The CIP API Base URL and Key are managed by the server-side proxy (`/api/proxy.ts`).

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
    description: 'Subscribe to your favorite TV packages.',
    path: '/cable',
  },
];

// Specific lists for operators and plan types, used by VTU services
export const AIRTIME_NETWORKS = [
  { id: 'MTN', name: 'MTN', image: 'https://img.oplug.com/networks/mtn.png' },
  { id: 'AIRTEL', name: 'Airtel', image: 'https://img.oplug.com/networks/airtel.png' },
  { id: 'GLO', name: 'Glo', image: 'https://img.oplug.com/networks/glo.png' },
  // CORRECTED: The CIP API uses 'ETISALAT' as the identifier for 9Mobile.
  { id: 'ETISALAT', name: '9Mobile', image: 'https://img.oplug.com/networks/9mobile.png' },
];

export const DATA_NETWORKS = [...AIRTIME_NETWORKS];

// CORRECTED: Data plan types now match the CIP API documentation
export const DATA_PLAN_TYPES = [
  { id: 'AWOOF', name: 'Awoof Data' },
  { id: 'GIFTING', name: 'Gifting Data' },
  { id: 'SME', name: 'SME Data' },
  { id: 'DATASHARE', name: 'Data Share' },
];

// CORRECTED: Added SHOWMAX to the list of cable billers as per API docs
export const CABLE_BILLERS = [
  { id: 'DSTV', name: 'DSTV', image: 'https://img.oplug.com/billers/dstv.png' },
  { id: 'GOTV', name: 'GOTV', image: 'https://img.oplug.com/billers/gotv.png' },
  { id: 'STARTIMES', name: 'Startimes', image: 'https://img.oplug.com/billers/startimes.png' },
  { id: 'SHOWMAX', name: 'Showmax', image: 'https://img.oplug.com/billers/showmax.png' },
];

export const SUBSCRIPTION_TYPES = [
  { id: 'RENEW', name: 'Renew Subscription' },
  { id: 'CHANGE', name: 'Change Plan' },
];
