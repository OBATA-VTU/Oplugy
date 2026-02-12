
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
  { id: 'AIRTEL', name: 'Airtel', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Airtel_logo.svg' },
  { id: 'GLO', name: 'Glo', image: 'https://upload.wikimedia.org/wikipedia/en/7/77/Glo_Telecom_logo.png' },
  { id: 'ETISALAT', name: '9Mobile', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/9mobile_Logo.svg/1200px-9mobile_Logo.svg.png' },
];

export const DATA_NETWORKS = [...AIRTIME_NETWORKS];

export const DATA_PLAN_TYPES = [
  { id: 'AWOOF', name: 'Awoof Data' },
  { id: 'GIFTING', name: 'Gifting Data' },
  { id: 'SME', name: 'SME Data' },
  { id: 'DATASHARE', name: 'Data Share' },
];

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
