// Comprehensive Affiliate Link Database
// This file contains known affiliate link providers and their domains

const AFFILIATE_DATABASE = [
  // Major Affiliate Networks
  {
    patterns: ['go.linkby.com', 'prf.hn', 'partnerize.com'],
    service: 'Linkby/Partnerize',
    suggestedUrl: 'https://example.com/',
    description:
      'Major affiliate marketing platform with sophisticated bot detection',
  },
  {
    patterns: ['skimlinks.com', 'viglink.com', 'outbrain.com'],
    service: 'Skimlinks/VigLink/Outbrain',
    suggestedUrl: 'https://example.com/',
    description: 'Content monetization and affiliate platform',
  },
  {
    patterns: ['amazon.com/dp', 'amzn.to', 'amazon.com/gp'],
    service: 'Amazon Associates',
    suggestedUrl: 'https://www.amazon.com/',
    description: 'Amazon affiliate program',
  },
  {
    patterns: ['clickbank.com', 'clickbank.net'],
    service: 'ClickBank',
    suggestedUrl: 'https://example.com/',
    description: 'Digital product affiliate network',
  },
  {
    patterns: ['commissionjunction.com', 'cj.com'],
    service: 'Commission Junction (CJ)',
    suggestedUrl: 'https://example.com/',
    description: 'Major affiliate marketing network',
  },
  {
    patterns: ['shareasale.com', 'shareasale.net'],
    service: 'ShareASale',
    suggestedUrl: 'https://example.com/',
    description: 'E-commerce affiliate network',
  },
  {
    patterns: ['rakuten.com', 'rakuten.co.jp', 'ebates.com'],
    service: 'Rakuten Marketing',
    suggestedUrl: 'https://example.com/',
    description: 'Global affiliate marketing platform',
  },
  {
    patterns: ['awin.com', 'affiliatewindow.com'],
    service: 'Awin',
    suggestedUrl: 'https://example.com/',
    description: 'Global affiliate marketing network',
  },
  {
    patterns: ['impact.com', 'impactradius.com'],
    service: 'Impact',
    suggestedUrl: 'https://example.com/',
    description: 'Partnership automation platform',
  },
  {
    patterns: ['flexoffers.com'],
    service: 'FlexOffers',
    suggestedUrl: 'https://example.com/',
    description: 'Affiliate marketing network',
  },
  {
    patterns: ['pepperjam.com'],
    service: 'Pepperjam',
    suggestedUrl: 'https://example.com/',
    description: 'Affiliate marketing platform',
  },
  {
    patterns: ['avantlink.com'],
    service: 'AvantLink',
    suggestedUrl: 'https://example.com/',
    description: 'Outdoor and lifestyle affiliate network',
  },
  {
    patterns: ['linksynergy.com', 'linksynergy.net'],
    service: 'LinkShare (Rakuten)',
    suggestedUrl: 'https://example.com/',
    description: 'Affiliate marketing network',
  },
  {
    patterns: ['performics.com'],
    service: 'Performics',
    suggestedUrl: 'https://example.com/',
    description: 'Performance marketing agency',
  },
  {
    patterns: ['tradedoubler.com'],
    service: 'TradeTracker',
    suggestedUrl: 'https://example.com/',
    description: 'European affiliate network',
  },
  {
    patterns: ['webgains.com'],
    service: 'Webgains',
    suggestedUrl: 'https://example.com/',
    description: 'UK-based affiliate network',
  },
  {
    patterns: ['affiliatefuture.com'],
    service: 'Affiliate Future',
    suggestedUrl: 'https://example.com/',
    description: 'UK affiliate network',
  },
  {
    patterns: ['affiliatewindow.co.uk'],
    service: 'Affiliate Window',
    suggestedUrl: 'https://example.com/',
    description: 'UK affiliate network',
  },
  {
    patterns: ['dgmpro.com'],
    service: 'Digital Media Solutions',
    suggestedUrl: 'https://example.com/',
    description: 'Performance marketing platform',
  },
  {
    patterns: ['partnerize.com'],
    service: 'Partnerize',
    suggestedUrl: 'https://example.com/',
    description: 'Partnership automation platform',
  },

  // URL Shorteners (often used for affiliate links)
  {
    patterns: [
      'bit.ly',
      't.co',
      'tinyurl.com',
      'ow.ly',
      'buff.ly',
      'is.gd',
      'v.gd',
      'shorturl.at',
      'rb.gy',
      'cutt.ly',
      'short.io',
      'tiny.cc',
      'shorten.asia',
      'goo.gl',
      't.ly',
      'short.cm',
      'adf.ly',
      'sh.st',
      'bc.vc',
      'adfly.com',
      'sh.st',
      'bc.vc',
      'adf.ly',
      'sh.st',
      'bc.vc',
    ],
    service: 'URL Shortener',
    suggestedUrl: 'https://example.com/',
    description: 'URL shortening service (often used for affiliate links)',
  },

  // Social Media Affiliate Links
  {
    patterns: [
      'instagram.com/affiliate',
      'facebook.com/affiliate',
      'twitter.com/affiliate',
      'pinterest.com/affiliate',
    ],
    service: 'Social Media Affiliate',
    suggestedUrl: 'https://example.com/',
    description: 'Social media platform affiliate links',
  },

  // E-commerce Platform Affiliates
  {
    patterns: [
      'shopify.com/affiliate',
      'woocommerce.com/affiliate',
      'bigcommerce.com/affiliate',
      'magento.com/affiliate',
    ],
    service: 'E-commerce Platform Affiliate',
    suggestedUrl: 'https://example.com/',
    description: 'E-commerce platform affiliate programs',
  },

  // Travel Affiliate Networks
  {
    patterns: [
      'booking.com/affiliate',
      'expedia.com/affiliate',
      'hotels.com/affiliate',
      'tripadvisor.com/affiliate',
      'kayak.com/affiliate',
    ],
    service: 'Travel Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Travel booking affiliate programs',
  },

  // Financial Affiliate Networks
  {
    patterns: [
      'creditkarma.com/affiliate',
      'nerdwallet.com/affiliate',
      'bankrate.com/affiliate',
      'lendingtree.com/affiliate',
    ],
    service: 'Financial Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Financial services affiliate programs',
  },

  // Technology Affiliate Networks
  {
    patterns: [
      'microsoft.com/affiliate',
      'adobe.com/affiliate',
      'autodesk.com/affiliate',
      'intuit.com/affiliate',
    ],
    service: 'Technology Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Technology company affiliate programs',
  },

  // Gaming Affiliate Networks
  {
    patterns: [
      'steam.com/affiliate',
      'epicgames.com/affiliate',
      'origin.com/affiliate',
      'battle.net/affiliate',
    ],
    service: 'Gaming Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Gaming platform affiliate programs',
  },

  // Education Affiliate Networks
  {
    patterns: [
      'coursera.org/affiliate',
      'udemy.com/affiliate',
      'skillshare.com/affiliate',
      'masterclass.com/affiliate',
    ],
    service: 'Education Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Online education affiliate programs',
  },

  // Health & Fitness Affiliate Networks
  {
    patterns: [
      'myfitnesspal.com/affiliate',
      'fitbit.com/affiliate',
      'garmin.com/affiliate',
      'strava.com/affiliate',
    ],
    service: 'Health & Fitness Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Health and fitness affiliate programs',
  },

  // Fashion & Beauty Affiliate Networks
  {
    patterns: [
      'sephora.com/affiliate',
      'ulta.com/affiliate',
      'nordstrom.com/affiliate',
      'macys.com/affiliate',
    ],
    service: 'Fashion & Beauty Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Fashion and beauty affiliate programs',
  },

  // Food & Beverage Affiliate Networks
  {
    patterns: [
      'hellofresh.com/affiliate',
      'blueapron.com/affiliate',
      'instacart.com/affiliate',
      'doordash.com/affiliate',
    ],
    service: 'Food & Beverage Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Food delivery and meal kit affiliate programs',
  },

  // Subscription Service Affiliate Networks
  {
    patterns: [
      'netflix.com/affiliate',
      'spotify.com/affiliate',
      'hulu.com/affiliate',
      'disneyplus.com/affiliate',
    ],
    service: 'Subscription Service Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Streaming and subscription service affiliate programs',
  },

  // Home & Garden Affiliate Networks
  {
    patterns: [
      'wayfair.com/affiliate',
      'overstock.com/affiliate',
      'homedepot.com/affiliate',
      'lowes.com/affiliate',
    ],
    service: 'Home & Garden Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Home improvement and furniture affiliate programs',
  },

  // Automotive Affiliate Networks
  {
    patterns: [
      'carmax.com/affiliate',
      'cargurus.com/affiliate',
      'autotrader.com/affiliate',
      'cars.com/affiliate',
    ],
    service: 'Automotive Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Automotive sales and research affiliate programs',
  },

  // Insurance Affiliate Networks
  {
    patterns: [
      'geico.com/affiliate',
      'progressive.com/affiliate',
      'statefarm.com/affiliate',
      'allstate.com/affiliate',
    ],
    service: 'Insurance Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Insurance company affiliate programs',
  },

  // Real Estate Affiliate Networks
  {
    patterns: [
      'zillow.com/affiliate',
      'realtor.com/affiliate',
      'redfin.com/affiliate',
      'trulia.com/affiliate',
    ],
    service: 'Real Estate Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Real estate platform affiliate programs',
  },

  // Job & Career Affiliate Networks
  {
    patterns: [
      'indeed.com/affiliate',
      'linkedin.com/affiliate',
      'monster.com/affiliate',
      'careerbuilder.com/affiliate',
    ],
    service: 'Job & Career Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Job search and career platform affiliate programs',
  },

  // Pet & Animal Affiliate Networks
  {
    patterns: [
      'chewy.com/affiliate',
      'petco.com/affiliate',
      'petsmart.com/affiliate',
      'petfinder.com/affiliate',
    ],
    service: 'Pet & Animal Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Pet supplies and services affiliate programs',
  },

  // Sports & Outdoor Affiliate Networks
  {
    patterns: [
      'rei.com/affiliate',
      'dickssportinggoods.com/affiliate',
      'basspro.com/affiliate',
      'cabelas.com/affiliate',
    ],
    service: 'Sports & Outdoor Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Sports and outdoor equipment affiliate programs',
  },

  // Baby & Kids Affiliate Networks
  {
    patterns: [
      'buybuybaby.com/affiliate',
      'babiesrus.com/affiliate',
      'toysrus.com/affiliate',
      'target.com/affiliate',
    ],
    service: 'Baby & Kids Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: "Baby and children's products affiliate programs",
  },

  // Office & Business Affiliate Networks
  {
    patterns: [
      'staples.com/affiliate',
      'officedepot.com/affiliate',
      'quill.com/affiliate',
      'newegg.com/affiliate',
    ],
    service: 'Office & Business Affiliate Network',
    suggestedUrl: 'https://example.com/',
    description: 'Office supplies and business equipment affiliate programs',
  },
];

// Helper function to get affiliate information
function getAffiliateInfo(url) {
  const urlLower = url.toLowerCase();

  for (const service of AFFILIATE_DATABASE) {
    if (service.patterns.some(pattern => urlLower.includes(pattern))) {
      return {
        service: service.service,
        suggestedUrl: service.suggestedUrl,
        description: service.description,
      };
    }
  }

  return null; // Not an affiliate link
}

// Export for use in other files
export { AFFILIATE_DATABASE, getAffiliateInfo };
