/**
 * LocalCommerce Catalog Data
 * Demonstrates:
 * Global Products = Canonical catalog identity
 * Store Listings = Store-specific price, availability, and stock level
 */

export const GLOBAL_PRODUCTS = [
  {
    id: 'prod_amul_taaza',
    sku: 'AML-TZ-1000',
    title: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul Dairy Co.',
    unit: '1 Litre Pouch',
    category: 'bakery-dairy',
    categoryName: 'Bakery & Dairy',
    description: 'Pasteurized homogenized toned milk with 3.0% Fat and 8.5% SNF. Wholesome, rich, and essential for daily tea, coffee, breakfast bowls, and whole-family balanced nutrition.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
    mrp: 56,
    rating: 4.8,
    reviewsCount: 128,
    nutrition: {
      energy: '58 kcal',
      fat: '3.0%',
      protein: '3.2 g',
      calcium: '120 mg',
    },
    variants: [
      { name: '500 ml', priceOffset: -26 },
      { name: '1 Litre Pouch', priceOffset: 0, default: true },
      { name: '6 Litre Bulk Pack', priceOffset: 260 },
    ],
  },
  {
    id: 'prod_brown_bread',
    sku: 'BRD-WHT-400G',
    title: 'Modern 100% Whole Wheat Brown Bread',
    brand: 'Modern Bakery',
    unit: '400 g Loaf',
    category: 'bakery-dairy',
    categoryName: 'Bakery & Dairy',
    description: 'Freshly baked sliced whole wheat bread with high fiber content and soft wholesome texture, baked daily at local partner bakeries.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
    mrp: 55,
    rating: 4.7,
    reviewsCount: 94,
    nutrition: {
      energy: '245 kcal',
      fat: '1.8 g',
      protein: '9.1 g',
      fiber: '6.4 g',
    },
    variants: [
      { name: '400 g Loaf', priceOffset: 0, default: true },
      { name: '800 g Family Loaf', priceOffset: 45 },
    ],
  },
  {
    id: 'prod_aashirvaad_atta',
    sku: 'ASH-AT-5KG',
    title: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
    brand: 'Aashirvaad',
    unit: '5 kg Sack',
    category: 'groceries',
    categoryName: 'Groceries & Staples',
    description: '100% pure whole wheat grain flour. Ground with traditional chakki process to preserve natural dietary fiber and authentic golden softness.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XkPUYafA-5800eOSYQ3qL24yOMjNBtgT0xj04UL54GhEbzlc23mx94Gd6rpJ53EyouWYZdhhPx7JjLC8nmBsGCaZGAcJ2112nyD95IhhUOna5Mj84a4uwuGiEQcc4MWt0V1sqYilDd6KjdQ6LTw2CaCqwnHcXJ2plKqmtejFwVlPmP4ceDkJgzYkwID3RBIyq7pOWPgQ0xB1KeB5LOxhql3f3GsLUtKYr0QzSnNmnowd9FGaMr0tY_',
    mrp: 260,
    rating: 4.9,
    reviewsCount: 312,
    nutrition: {
      energy: '364 kcal',
      fat: '1.7 g',
      protein: '11.5 g',
      carbs: '75.2 g',
    },
    variants: [
      { name: '1 kg Trial Pack', priceOffset: -205 },
      { name: '5 kg Sack', priceOffset: 0, default: true },
      { name: '10 kg Saver Sack', priceOffset: 240 },
    ],
  },
  {
    id: 'prod_tata_salt',
    sku: 'TTS-SLT-1KG',
    title: 'Tata Salt Vacuum Evaporated Iodized Salt',
    brand: 'Tata Salt',
    unit: '1 kg Pack',
    category: 'groceries',
    categoryName: 'Groceries & Staples',
    description: 'Desh Ka Namak. Pure vacuum evaporated food-grade salt crystals enriched with guaranteed iodine concentration for whole-family health.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XGlhF1XNUTn0uRI_JSOd2mefs9y5-SVIkHjE5UGfoIXW_OwnSa-KYJyHAL8PJ9-LcGePJCeSSXVEwvfhuVNcxEV-jxW3Kezxyy3_x1dwRFfqbx49DmU9EheSIMgeVA8dJgG1Wgbtc7GyDiUFYpRt8OQD1cJXNhrCe4Rtk9CfE4Gm08PWShITrMCgfiaq4rkP1A-9r6JW-dEE7FFEi94TPkY854s4J1LLlat6IUWqTukHiyWvPJxVhYIw',
    mrp: 28,
    rating: 4.9,
    reviewsCount: 420,
    nutrition: {
      sodium: '38.7 g',
      iodine: '15 ppm min',
      purity: '99.6%',
    },
    variants: [
      { name: '1 kg Pack', priceOffset: 0, default: true },
    ],
  },
  {
    id: 'prod_thums_up_cola',
    sku: 'THU-COL-750ML',
    title: 'Thums Up Charged Strong Cola Soda',
    brand: 'Thums Up',
    unit: '750 ml Bottle',
    category: 'beverages',
    categoryName: 'Beverages & Drinks',
    description: 'Crisp, spicy and refreshing fizzy cola with signature Indian bold bite. Chilled and delivered directly from local refrigeration.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UXcPf1czW1R060epyOAmTzEeST_n_awuwEorBGT7et4ojDd3ajEHlNSVMm-93zGWiCBf7LdzftQIUrAl_g4Ct7ihgWLRVk4yg-CtMQ6KxJU2T_HVms9TAst_6WolYtsv5bEjuCFn_uHmFgDRl5EYKVx7qU27kXfEPXuiPznmdXnILJdonLRTitCUTW-9wUpnDq_b0sRheJ54k-k5NiKL59hc_9kwh_goVhpJ3qR4O13AZdjeggUHDBnA',
    mrp: 45,
    rating: 4.7,
    reviewsCount: 165,
    nutrition: {
      energy: '44 kcal',
      carbs: '11 g',
      sugar: '10.8 g',
    },
    variants: [
      { name: '250 ml Can', priceOffset: -20 },
      { name: '750 ml Bottle', priceOffset: 0, default: true },
    ],
  },
];

// Multi-Tenant Store Listings: Demonstrates that each local store sets its own price and stock status
export const STORE_LISTINGS = {
  // Shree Kirana (store_02)
  store_02: [
    { productId: 'prod_amul_taaza', storePrice: 54, mrp: 56, inStock: true, availability: 'In Stock', deliveryTime: '20–30 mins', isRecommended: true },
    { productId: 'prod_brown_bread', storePrice: 50, mrp: 55, inStock: true, availability: 'In Stock', deliveryTime: '20–30 mins', isRecommended: true },
    { productId: 'prod_aashirvaad_atta', storePrice: 248, mrp: 260, inStock: true, availability: 'In Stock', deliveryTime: '20–30 mins', isRecommended: true },
    { productId: 'prod_tata_salt', storePrice: 25, mrp: 28, inStock: true, availability: 'In Stock', deliveryTime: '20–30 mins', isRecommended: true },
    { productId: 'prod_thums_up_cola', storePrice: 42, mrp: 45, inStock: true, availability: 'In Stock', deliveryTime: '20–30 mins', isRecommended: true },
  ],
  // Sharma Supermarket (store_01)
  store_01: [
    { productId: 'prod_amul_taaza', storePrice: 55, mrp: 56, inStock: true, availability: 'In Stock', deliveryTime: '25–35 mins' },
    { productId: 'prod_brown_bread', storePrice: 52, mrp: 55, inStock: true, availability: 'In Stock', deliveryTime: '25–35 mins' },
    { productId: 'prod_aashirvaad_atta', storePrice: 245, mrp: 260, inStock: true, availability: 'In Stock', deliveryTime: '25–35 mins' },
    { productId: 'prod_tata_salt', storePrice: 26, mrp: 28, inStock: true, availability: 'In Stock', deliveryTime: '25–35 mins' },
    { productId: 'prod_thums_up_cola', storePrice: 40, mrp: 45, inStock: true, availability: 'In Stock', deliveryTime: '25–35 mins' },
  ],
  // Sharma Artisanal Bakery (store_03)
  store_03: [
    { productId: 'prod_brown_bread', storePrice: 48, mrp: 55, inStock: true, availability: 'In Stock', deliveryTime: '30–40 mins', isRecommended: true },
    { productId: 'prod_amul_taaza', storePrice: 56, mrp: 56, inStock: false, availability: 'Out of Stock', deliveryTime: '30–40 mins' },
  ],
  // Fresh Greens Organics (store_04)
  store_04: [
    { productId: 'prod_amul_taaza', storePrice: 56, mrp: 56, inStock: false, availability: 'Out of Stock', deliveryTime: '45–55 mins' },
    { productId: 'prod_aashirvaad_atta', storePrice: 255, mrp: 260, inStock: true, availability: 'Low Stock', deliveryTime: '45–55 mins' },
  ],
};

/**
 * Helper to get all store listings for a given global product
 */
export const getListingsForProduct = (productId) => {
  const listings = [];
  for (const [storeId, items] of Object.entries(STORE_LISTINGS)) {
    const listing = items.find((i) => i.productId === productId);
    if (listing) {
      listings.push({
        ...listing,
        storeId,
      });
    }
  }
  return listings;
};
