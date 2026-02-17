
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
  { id: 'AIRTEL', name: 'Airtel', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Airtel_logo.svg' },
  { id: 'GLO', name: 'Glo', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Glo_Telecom_logo.png/220px-Glo_Telecom_logo.png' },
  { id: '9MOBILE', name: '9Mobile', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/9mobile_Logo.svg/1200px-9mobile_Logo.svg.png' },
];

export const DATA_NETWORKS = [...AIRTIME_NETWORKS];

export const DATA_PLAN_TYPES = [
  { id: 'AWOOF', name: 'Awoof Data' },
  { id: 'GIFTING', name: 'Gifting Data' },
  { id: 'SME', name: 'SME Data' },
  { id: 'DATASHARE', name: 'Data Share' },
];

export const CABLE_BILLERS = [
  { id: 'DSTV', name: 'DSTV', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/DStv_logo.svg/1200px-DStv_logo.svg.png' },
  { id: 'GOTV', name: 'GOTV', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/GOtv_Logo.svg/1200px-GOtv_Logo.svg.png' },
  { id: 'STARTIMES', name: 'Startimes', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/StarTimes_logo.svg/1200px-StarTimes_logo.svg.png' },
  { id: 'SHOWMAX', name: 'Showmax', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Showmax_Logo.svg/1200px-Showmax_Logo.svg.png' },
];

export const SUBSCRIPTION_TYPES = [
  { id: 'RENEW', name: 'Renew Subscription' },
  { id: 'CHANGE', name: 'Change Plan' },
];
