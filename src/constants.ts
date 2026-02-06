// Local Storage Keys
export const LOCAL_STORAGE_TOKEN_KEY = 'oplug_token';
export const LOCAL_STORAGE_USER_KEY = 'oplug_user';

// API Base URLs - Replace with actual URLs in production
// For local development, these can be set in a .env file (e.g., REACT_APP_OPLUG_API_BASE_URL)
export const OPLUG_API_BASE_URL = process.env.REACT_APP_OPLUG_API_BASE_URL || 'https://api.oplug.com/v1'; // Example placeholder for your Oplug backend

// The CIP API Base URL and Key have been moved to the server-side proxy (`/api/proxy.ts`)
// for security and to resolve CORS issues.

// Service Categories for Dashboard
export const SERVICE_CATEGORIES = [
  {
    id: 'airtime',
    name: 'Buy Airtime',
    description: 'Instant top-up for all networks.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3m0 0V.75a2.25 2.25 0 0 1 2.25-2.25H16.5M13.5 1.5v2.25C13.5 3.72 13.972 3.996 14.49 4.075M17.25 7.5h-5.25" /></svg>',
    path: '/airtime',
  },
  {
    id: 'data',
    name: 'Buy Data',
    description: 'Affordable data bundles for all networks.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L13.5 21.75l1.5-4.75a1.5 1.5 0 0 0-1.2-2.195H14.25Z" /></svg>',
    path: '/data',
  },
  {
    id: 'bills',
    name: 'Pay Bills',
    description: 'Electricity, water, and more.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.827l-.384.179a.75.75 0 0 1-.599.049L3.935 4.792A.75.75 0 0 0 3 5.485V14.5a3 3 0 0 0 3 3h1.5a.75.75 0 0 1 0 1.5H6a1.5 1.5 0 0 0-1.5 1.5v.75A.75.75 0 0 0 5.25 22h13.5a.75.75 0 0 0 .75-.75v-.75a1.5 1.5 0 0 0-1.5-1.5h-1.5a.75.75 0 0 1 0-1.5H18a3 3 0 0 0 3-3V5.485a.75.75 0 0 0-.935-.693l-6.643 1.116a.75.75 0 0 1-.599-.049l-.384-.179M12 2.25l-.384.179a.75.75 0 0 0-.599.049L3.935 3.792A.75.75 0 0 0 3 4.485V13.5a3 3 0 0 0 3 3h1.5a.75.75 0 0 1 0 1.5H6a1.5 1.5 0 0 0-1.5 1.5v.75A.75.75 0 0 0 5.25 21h13.5a.75.75 0 0 0 .75-.75v-.75a1.5 1.5 0 0 0-1.5-1.5h-1.5a.75.75 0 0 1 0-1.5H18a3 3 0 0 0 3-3V4.485a.75.75 0 0 0-.935-.693l-6.643 1.116a.75.75 0 0 1-.599-.049l-.384-.179M15.75 6.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75H18a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75h-2.25ZM4.5 9.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h2.25a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H4.5Z" clip-rule="evenodd" /></svg>',
    path: '/bills',
  },
  {
    id: 'cable',
    name: 'Cable TV',
    description: 'Subscribe to your favorite TV packages.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V12.75l1.547-7.33A2.25 2.25 0 0 1 7.252 3h9.496a2.25 2.25 0 0 1 2.205 2.42Z" /></svg>',
    path: '/cable',
  },
];

// Specific lists for operators and plan types, used by VTU services
export const AIRTIME_NETWORKS = [
  { id: 'MTN', name: 'MTN', image: 'https://img.oplug.com/networks/mtn.png' },
  { id: 'AIRTEL', name: 'Airtel', image: 'https://img.oplug.com/networks/airtel.png' },
  { id: 'GLO', name: 'Glo', image: 'https://img.oplug.com/networks/glo.png' },
  { id: '9MOBILE', name: '9Mobile', image: 'https://img.oplug.com/networks/9mobile.png' },
];

export const DATA_NETWORKS = [
  { id: 'MTN', name: 'MTN', image: 'https://img.oplug.com/networks/mtn.png' },
  { id: 'AIRTEL', name: 'Airtel', image: 'https://img.oplug.com/networks/airtel.png' },
  { id: 'GLO', name: 'Glo', image: 'https://img.oplug.com/networks/glo.png' },
  { id: '9MOBILE', name: '9Mobile', image: 'https://img.oplug.com/networks/9mobile.png' },
];

// CORRECTED: Data plan types now match the CIP API documentation
export const DATA_PLAN_TYPES = [
  { id: 'AWOOF', name: 'Awoof Data' },
  { id: 'GIFTING', name: 'Gifting Data' },
  { id: 'SME', name: 'SME Data' },
  { id: 'DATASHARE', name: 'Data Share' },
];

// CORRECTED: Added SHOWMAX to the list of cable billers
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
