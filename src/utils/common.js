import {Dimensions} from 'react-native';
import uuid from 'react-native-uuid';

export const get = (object, path, defval = null) => {
  if (typeof path === 'string') {
    path = path.split('.');
  }
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : defval), object);
};

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

export const numberFormatter = num => {
  if (num < 999) {
    return num;
  } else if (num < 99999) {
    let val = parseInt(num / 1000);
    return val.toString() + 'K';
  } else if (num < 999999) {
    let val = parseInt(num / 100000);
    let k = parseInt((num % 100000) / 10000);
    return k ? val.toString() + '.' + k.toString() + 'L' : val.toString() + 'L';
  } else if (num > 999999) {
    let val = parseInt(num / 1000000);
    let k = parseInt((num % 1000000) / 100000);
    return k ? val.toString() + '.' + k.toString() + 'M' : val.toString() + 'M';
  }
};
export const timeSince = date => {
  const intervals = [
    {label: 'year', seconds: 31536000},
    {label: 'month', seconds: 2592000},
    {label: 'day', seconds: 86400},
    {label: 'hour', seconds: 3600},
    {label: 'minute', seconds: 60},
    {label: 'second', seconds: 1},
  ];

  let seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) seconds = 2;
  const interval = intervals.find(i => i?.seconds < seconds);
  const count = Math.floor(seconds / interval?.seconds);
  return `${count} ${interval?.label}${count !== 1 ? 's' : ''} ago`;
};

export const getVideoUrl = cdnLocation => {
  const {parentUrl, hls} = cdnLocation ?? {};
  return `${parentUrl}${hls}`;
};

export const getCreatorVideoUrl = cdnLocation => {
  const {parentUrl, path} = cdnLocation[0];
  return `${parentUrl}${path}`;
};

export const getThumbnailUrl = thumbnails => {
  let {parentUrl, path} = thumbnails?.small || thumbnails?.large || {};
  return parentUrl && path ? `${parentUrl}${path}` : '';
};

export const getThumbnailUrlCreator = thumbnails => {
  let {parentUrl, path} = thumbnails?.small[0] || thumbnails?.large[0] || {};
  return parentUrl && path ? `${parentUrl}${path}` : '';
};

export const getUniqueId = () => {
  return uuid.v4();
};

export const compareVersions = (version1, version2) => {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) {
      return true;
    } else if (v1[i] < v2[i]) {
      return false;
    }
  }

  return false;
};

export const formatDate = date => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options);
  return formattedDate;
};

export const convertUSDtoINR = (value = 0) => {
  return '₹' + Math.round((value * 80 + Number.EPSILON) * 100) / 100;
};

export function numberWithComma(number) {
  if (isNaN(number)) {
    return 0;
  } else {
    const numberStr = number?.toString();
    return numberStr?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

export const convertBytes = bytes => {
  const kilobyte = 1024;
  const megabyte = kilobyte * 1024;
  const gigabyte = megabyte * 1024;

  if (bytes < kilobyte) {
    return bytes + ' Bytes';
  } else if (bytes < megabyte) {
    return (bytes / kilobyte).toFixed(0) + ' KB';
  } else if (bytes < gigabyte) {
    return (bytes / megabyte).toFixed(2) + ' MB';
  } else {
    return (bytes / gigabyte).toFixed(2) + ' GB';
  }
};

// 16 August,2023 format
export const formatDate1 = date => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options);
  return formattedDate;
};

export const toFixedWithoutRound = (num, fixed = 0) => {
  var re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
};

export const formatDateIntoDays = date => {
  const options = {
    weekday: 'short',
  };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options);
  // Remove the day part (e.g., "Sun, " or "Mon, ")
  const weekdayOnly = formattedDate.slice(0, 3);

  return weekdayOnly;
};

export const get7DayDifference = () => {
  const temp = new Date();
  const today = new Date(temp);

  // Subtract one day from the current date
  today.setDate(today.getDate() - 1);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 6);

  const startDate = new Date(today);
  startDate.setDate(today.getDate());

  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  return {endDate: formattedStartDate, startDate: formattedEndDate};
};

export const get30DayDifference = () => {
  const temp = new Date();
  const today = new Date(temp);

  // Subtract one day from the current date
  today.setDate(today.getDate());

  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 30);

  const startDate = new Date(today);
  startDate.setDate(today.getDate());

  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  return {endDate: formattedStartDate, startDate: formattedEndDate};
};

export const formatWalletAddress = (address, firstCount = 5, lastCount = 5) => {
  let last = address?.slice(-lastCount);
  let first = address?.substring(0, firstCount);
  return `${first}...${last}`;
};

export const generateTransparentColor = (hex, alpha) => {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const dollarToInrWithRupeeSign = (value = 0) => {
  return '₹' + Math.round((value * 80 + Number.EPSILON) * 100) / 100;
};

export const dollarToInr = (value = 0) => {
  if (value == 0) {
    return 0;
  }
  return Math.round((value * 80 + Number.EPSILON) * 100) / 100;
};

// export const round = (value = 0) => {
//   return Math.trunc(value * 100) / 100
// }

export const round = (value = 0, decimals = 2) => {
  return Number(Math.trunc(value + 'e' + decimals) + 'e-' + decimals);
};

export const calculateProfitLoss = royaltyReturn => {
  const {percent = 0, amount = 0, returnType = 'profit'} = royaltyReturn || {};
  if (returnType == 'profit') {
    return (
      '+' + dollarToInrWithRupeeSign(amount) + ' (' + round(percent) + ')%'
    );
  } else {
    return (
      '-' + dollarToInrWithRupeeSign(amount) + ' (' + round(percent) + ')%'
    );
  }
};

export const uptoTwoDecimalPlaces = amount => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const numFormatter = num => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(2) + ' K'; // convert to K for number from > 1000 < 1 million
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + ' Mn'; // convert to M for number from > 1 million
  } else if (num < 900) {
    return num; // if value < 1000, nothing to do
  }
};

export const checkPercentage = (
  totalTokenAmount,
  balance,
  fantigerCoinValue,
  promoCode,
) => {
  var total = totalTokenAmount;
  var bal = balance;
  var promoCodeValue = promoCode;
  var coin;
  coin = Number(fantigerCoinValue / 100);
  total = totalTokenAmount * 80;
  bal = balance * 80;
  promoCodeValue = promoCode * 80;
  if (bal + coin + promoCodeValue < total) {
    const diff = parseFloat((total - (bal + coin)).toFixed(2));
    if (diff.toFixed(2) <= 0.1) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

export const coinToINR = coin => {
  return Math.round((coin / 100 + Number.EPSILON) * 100) / 100;
};

// In case of upper limit - round off till 2 decimals to lower value
export const percentHigh = (num = 0, percent) => {
  let temp = num * round(percent / 100) + num;
  let value = (Math.floor(temp * 100) / 100).toFixed(2);
  return value;
};
// In case of lower limit - round off till 2 decimals to higher value
export const percentLow = (num = 0, percent) => {
  let temp = num - num * round(percent / 100);
  return round(temp);
};

export const percentValue = (price, percent = 0.5) => {
  let temp = Math.round(((percent / 100) * price + Number.EPSILON) * 100) / 100;
  return temp;
};

export const getCoinsInMn = (views, digits = 1, config) => {
  const viewsLookup = [
    {value: 1, symbol: ''},
    {value: 1e6, symbol: 'M'},
    {value: 1e9, symbol: 'B'},
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

  const item = viewsLookup
    .slice()
    .reverse()
    .find(item => views >= item.value);

  if (config?.extras) {
    return {
      value: item
        ? (views / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
        : '0',
      extras: !item ? false : views % item.value === 0 ? false : true,
    };
  }

  return item
    ? (views / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
};

export const formatTime = time => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
