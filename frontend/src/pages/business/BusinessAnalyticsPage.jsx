import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessAnalyticsPage() {
  const { currentStore } = useCatalog();
  const { storeOrders, storeCustomers } = useOperations();

  // Time period filter: '7d' | '30d' | '90d' | 'custom'
  const [timePeriod, setTimePeriod] = useState('7d');

  // Chart metric tab: 'revenue' | 'orders' | 'aov'
  const [chartMetric, setChartMetric] = useState('revenue');

  // SKU ranking toggle: 'top' | 'bottom'
  const [skuRankMode, setSkuRankMode] = useState('top');

  // Compare to previous period checkbox
  const [comparePrevious, setComparePrevious] = useState(true);

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Order-scoped calculations:
   * Only completed orders contribute to completed revenue:
   * - Delivery: DELIVERED
   * - Pickup: PICKED_UP
   * Cancelled and in-flight prep orders (PLACED, CONFIRMED, PREPARING, READY, READY_FOR_PICKUP, OUT_FOR_DELIVERY) are excluded.
   */
  const completedLiveOrders = useMemo(() => {
    return storeOrders.filter((o) => {
      if (o.fulfillmentType === 'delivery') return o.status === 'DELIVERED';
      if (o.fulfillmentType === 'pickup') return o.status === 'PICKED_UP';
      return o.status === 'DELIVERED' || o.status === 'PICKED_UP';
    });
  }, [storeOrders]);

  const cancelledOrders = useMemo(() => {
    return storeOrders.filter((o) => o.status === 'CANCELLED');
  }, [storeOrders]);

  const processingOrders = useMemo(() => {
    return storeOrders.filter((o) => {
      const isCompleted = (o.fulfillmentType === 'delivery' && o.status === 'DELIVERED') ||
                          (o.fulfillmentType === 'pickup' && o.status === 'PICKED_UP');
      return !isCompleted && o.status !== 'CANCELLED';
    });
  }, [storeOrders]);

  const liveCompletedRevenue = useMemo(() => {
    return completedLiveOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  }, [completedLiveOrders]);

  // Store-specific baseline analytics data based on selected store
  const storeAnalyticsData = useMemo(() => {
    const isStore01 = currentStore.id === 'store_01';

    if (isStore01) {
      // Sharma Supermarket (Supermarket format in Koramangala)
      return {
        '7d': {
          rangeLabel: 'Sep 01 – Sep 07, 2026',
          prevRangeLabel: 'Aug 25 – Aug 31, 2026',
          baseRevenue: 84250,
          prevRevenue: 74888,
          growthRevenue: '+12.5%',
          grossMargin: '24.2%',
          baseOrders: 126,
          prevOrders: 116,
          growthOrders: '+8.2%',
          ordersPerDay: '18.0',
          baseAov: 669,
          prevAov: 647,
          growthAov: '+3.4%',
          itemsPerBasket: '3.8',
          activeCustomers: 84,
          prevCustomers: 80,
          growthCustomers: '+5.4%',
          repeatRate: 78.6,
          returningCustomers: 66,
          newCustomers: 18,
          avgReturningSpend: 712,
          avgNewSpend: 603,
          deliveryOrders: 78,
          deliveryShare: '61.9%',
          deliveryOntime: '97.4%',
          deliveryTransit: '18 mins',
          pickupOrders: 36,
          pickupShare: '28.6%',
          pickupCompletion: '100%',
          pickupPrep: '8 mins',
          courierOrders: 12,
          courierShare: '9.5%',
          courierSla: '91.7%',
          courierHandoff: '4.2 hrs',
          dailyTrend: [
            { day: 'Sep 01', revenue: 10450, orders: 16, aov: 653, label: '₹10.4k' },
            { day: 'Sep 02', revenue: 11800, orders: 18, aov: 655, label: '₹11.8k' },
            { day: 'Sep 03', revenue: 13200, orders: 20, aov: 660, label: '₹13.2k' },
            { day: 'Sep 04', revenue: 12100, orders: 17, aov: 711, label: '₹12.1k' },
            { day: 'Sep 05', revenue: 14800, orders: 22, aov: 672, label: '₹14.8k' },
            { day: 'Sep 06 (Sat)', revenue: 16200, orders: 24, aov: 675, label: '₹16.2k ★', isPeak: true },
            { day: 'Sep 07 (Today)', revenue: 5700, orders: 9, aov: 633, label: '₹5.7k (Live)', isLive: true },
          ],
          prevTrendPoints: '30,130 140,119 250,103 360,98 470,88 580,72 680,66',
          currentTrendPoints: '30,115 140,98 250,81 360,94 470,61 580,44 680,172',
          areaPolygon: '30,220 30,115 140,98 250,81 360,94 470,61 580,44 680,172 680,220',
          topSkus: [
            { id: 'sku_1', name: 'Amul Taaza Homogenised Milk 1L', sku: 'AMUL-TZ-1L', category: 'Dairy & Eggs', units: 142, orders: 87, revenue: 9656, initials: 'AT' },
            { id: 'sku_2', name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'AASH-ATT-5K', category: 'Staples & Grains', units: 48, orders: 44, revenue: 11760, initials: 'AA' },
            { id: 'sku_3', name: 'Britannia 100% Whole Wheat Bread 400g', sku: 'BRIT-BRD-40', category: 'Bakery', units: 98, orders: 62, revenue: 4410, initials: 'BB' },
            { id: 'sku_4', name: 'Fortune Sunlite Refined Sunflower Oil 1L', sku: 'FORT-OIL-1L', category: 'Staples & Grains', units: 52, orders: 46, revenue: 8580, initials: 'FO' },
            { id: 'sku_5', name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'TATA-SLT-1K', category: 'Staples & Grains', units: 74, orders: 58, revenue: 2072, initials: 'TS' },
          ],
          bottomSkus: [
            { id: 'sku_b1', name: 'Epigamia Greek Yogurt 100g', sku: 'EPIG-YOG-10', category: 'Dairy & Eggs', units: 6, orders: 5, revenue: 360, initials: 'EY' },
            { id: 'sku_b2', name: 'Diet Coke Can 300ml', sku: 'COKE-DT-30', category: 'Beverages', units: 8, orders: 6, revenue: 320, initials: 'DC' },
            { id: 'sku_b3', name: 'Organic Chia Seeds 250g', sku: 'ORG-CHIA-25', category: 'Health & Wellness', units: 4, orders: 3, revenue: 640, initials: 'CS' },
            { id: 'sku_b4', name: 'Dark Chocolate Cookie 150g', sku: 'DARK-CK-15', category: 'Bakery', units: 7, orders: 5, revenue: 420, initials: 'DC' },
            { id: 'sku_b5', name: 'Almond Milk Unsweetened 1L', sku: 'ALM-MLK-1L', category: 'Dairy & Alternatives', units: 5, orders: 4, revenue: 950, initials: 'AM' },
          ],
          categories: [
            { name: 'Dairy & Eggs', revenue: 28420, share: 33.7, color: '#172554' },
            { name: 'Staples & Grains', revenue: 21650, share: 25.7, color: '#2563EB' },
            { name: 'Bakery & Bread', revenue: 14320, share: 17.0, color: '#316BF3' },
            { name: 'Personal & Household', revenue: 10020, share: 11.9, color: '#B7C4FD' },
            { name: 'Snacks & Confectionery', revenue: 9840, share: 11.7, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Dairy & Eggs (+18.4% YoY)',
        },
        '30d': {
          rangeLabel: 'Aug 09 – Sep 07, 2026',
          prevRangeLabel: 'Jul 10 – Aug 08, 2026',
          baseRevenue: 342100,
          prevRevenue: 310500,
          growthRevenue: '+10.2%',
          grossMargin: '23.8%',
          baseOrders: 512,
          prevOrders: 476,
          growthOrders: '+7.6%',
          ordersPerDay: '17.1',
          baseAov: 668,
          prevAov: 652,
          growthAov: '+2.5%',
          itemsPerBasket: '3.7',
          activeCustomers: 248,
          prevCustomers: 232,
          growthCustomers: '+6.9%',
          repeatRate: 81.2,
          returningCustomers: 201,
          newCustomers: 47,
          avgReturningSpend: 2890,
          avgNewSpend: 1940,
          deliveryOrders: 318,
          deliveryShare: '62.1%',
          deliveryOntime: '96.8%',
          deliveryTransit: '19 mins',
          pickupOrders: 148,
          pickupShare: '28.9%',
          pickupCompletion: '100%',
          pickupPrep: '9 mins',
          courierOrders: 46,
          courierShare: '9.0%',
          courierSla: '92.4%',
          courierHandoff: '4.4 hrs',
          dailyTrend: [
            { day: 'Week 1', revenue: 81200, orders: 122, aov: 665, label: '₹81.2k' },
            { day: 'Week 2', revenue: 86400, orders: 128, aov: 675, label: '₹86.4k' },
            { day: 'Week 3', revenue: 90250, orders: 136, aov: 663, label: '₹90.2k ★', isPeak: true },
            { day: 'Week 4', revenue: 84250, orders: 126, aov: 669, label: '₹84.2k' },
          ],
          prevTrendPoints: '40,140 220,110 440,90 660,80',
          currentTrendPoints: '40,120 220,95 440,75 660,85',
          areaPolygon: '40,220 40,120 220,95 440,75 660,85 660,220',
          topSkus: [
            { id: 'sku_1', name: 'Amul Taaza Homogenised Milk 1L', sku: 'AMUL-TZ-1L', category: 'Dairy & Eggs', units: 620, orders: 380, revenue: 42160, initials: 'AT' },
            { id: 'sku_2', name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'AASH-ATT-5K', category: 'Staples & Grains', units: 210, orders: 190, revenue: 51450, initials: 'AA' },
            { id: 'sku_3', name: 'Fortune Sunlite Refined Sunflower Oil 1L', sku: 'FORT-OIL-1L', category: 'Staples & Grains', units: 240, orders: 205, revenue: 39600, initials: 'FO' },
            { id: 'sku_4', name: 'Britannia 100% Whole Wheat Bread 400g', sku: 'BRIT-BRD-40', category: 'Bakery', units: 410, orders: 270, revenue: 18450, initials: 'BB' },
            { id: 'sku_5', name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'TATA-SLT-1K', category: 'Staples & Grains', units: 310, orders: 250, revenue: 8680, initials: 'TS' },
          ],
          bottomSkus: [
            { id: 'sku_b1', name: 'Epigamia Greek Yogurt 100g', sku: 'EPIG-YOG-10', category: 'Dairy & Eggs', units: 24, orders: 18, revenue: 1440, initials: 'EY' },
            { id: 'sku_b2', name: 'Organic Chia Seeds 250g', sku: 'ORG-CHIA-25', category: 'Health & Wellness', units: 15, orders: 12, revenue: 2400, initials: 'CS' },
            { id: 'sku_b3', name: 'Diet Coke Can 300ml', sku: 'COKE-DT-30', category: 'Beverages', units: 32, orders: 24, revenue: 1280, initials: 'DC' },
            { id: 'sku_b4', name: 'Dark Chocolate Cookie 150g', sku: 'DARK-CK-15', category: 'Bakery', units: 28, orders: 22, revenue: 1680, initials: 'DC' },
            { id: 'sku_b5', name: 'Almond Milk Unsweetened 1L', sku: 'ALM-MLK-1L', category: 'Dairy & Alternatives', units: 20, orders: 16, revenue: 3800, initials: 'AM' },
          ],
          categories: [
            { name: 'Dairy & Eggs', revenue: 114500, share: 33.5, color: '#172554' },
            { name: 'Staples & Grains', revenue: 88200, share: 25.8, color: '#2563EB' },
            { name: 'Bakery & Bread', revenue: 57400, share: 16.8, color: '#316BF3' },
            { name: 'Personal & Household', revenue: 41800, share: 12.2, color: '#B7C4FD' },
            { name: 'Snacks & Confectionery', revenue: 40200, share: 11.7, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Staples & Grains (+14.1% YoY)',
        },
        '90d': {
          rangeLabel: 'Jun 10 – Sep 07, 2026',
          prevRangeLabel: 'Mar 12 – Jun 09, 2026',
          baseRevenue: 1015000,
          prevRevenue: 928000,
          growthRevenue: '+9.4%',
          grossMargin: '24.0%',
          baseOrders: 1540,
          prevOrders: 1420,
          growthOrders: '+8.5%',
          ordersPerDay: '17.1',
          baseAov: 659,
          prevAov: 653,
          growthAov: '+0.9%',
          itemsPerBasket: '3.7',
          activeCustomers: 590,
          prevCustomers: 540,
          growthCustomers: '+9.3%',
          repeatRate: 83.5,
          returningCustomers: 493,
          newCustomers: 97,
          avgReturningSpend: 7820,
          avgNewSpend: 3100,
          deliveryOrders: 955,
          deliveryShare: '62.0%',
          deliveryOntime: '97.1%',
          deliveryTransit: '18 mins',
          pickupOrders: 446,
          pickupShare: '29.0%',
          pickupCompletion: '100%',
          pickupPrep: '8 mins',
          courierOrders: 139,
          courierShare: '9.0%',
          courierSla: '92.0%',
          courierHandoff: '4.3 hrs',
          dailyTrend: [
            { day: 'Month 1', revenue: 325000, orders: 490, aov: 663, label: '₹325k' },
            { day: 'Month 2', revenue: 348000, orders: 524, aov: 664, label: '₹348k ★', isPeak: true },
            { day: 'Month 3', revenue: 342000, orders: 526, aov: 650, label: '₹342k' },
          ],
          prevTrendPoints: '50,130 350,100 650,85',
          currentTrendPoints: '50,110 350,80 650,82',
          areaPolygon: '50,220 50,110 350,80 650,82 650,220',
          topSkus: [
            { id: 'sku_1', name: 'Amul Taaza Homogenised Milk 1L', sku: 'AMUL-TZ-1L', category: 'Dairy & Eggs', units: 1850, orders: 1140, revenue: 125800, initials: 'AT' },
            { id: 'sku_2', name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'AASH-ATT-5K', category: 'Staples & Grains', units: 640, orders: 580, revenue: 156800, initials: 'AA' },
            { id: 'sku_3', name: 'Fortune Sunlite Refined Sunflower Oil 1L', sku: 'FORT-OIL-1L', category: 'Staples & Grains', units: 710, orders: 610, revenue: 117150, initials: 'FO' },
            { id: 'sku_4', name: 'Britannia 100% Whole Wheat Bread 400g', sku: 'BRIT-BRD-40', category: 'Bakery', units: 1210, orders: 790, revenue: 54450, initials: 'BB' },
            { id: 'sku_5', name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'TATA-SLT-1K', category: 'Staples & Grains', units: 930, orders: 760, revenue: 26040, initials: 'TS' },
          ],
          bottomSkus: [
            { id: 'sku_b1', name: 'Epigamia Greek Yogurt 100g', sku: 'EPIG-YOG-10', category: 'Dairy & Eggs', units: 72, orders: 54, revenue: 4320, initials: 'EY' },
            { id: 'sku_b2', name: 'Organic Chia Seeds 250g', sku: 'ORG-CHIA-25', category: 'Health & Wellness', units: 42, orders: 36, revenue: 6720, initials: 'CS' },
            { id: 'sku_b3', name: 'Diet Coke Can 300ml', sku: 'COKE-DT-30', category: 'Beverages', units: 95, orders: 72, revenue: 3800, initials: 'DC' },
            { id: 'sku_b4', name: 'Dark Chocolate Cookie 150g', sku: 'DARK-CK-15', category: 'Bakery', units: 82, orders: 66, revenue: 4920, initials: 'DC' },
            { id: 'sku_b5', name: 'Almond Milk Unsweetened 1L', sku: 'ALM-MLK-1L', category: 'Dairy & Alternatives', units: 62, orders: 48, revenue: 11780, initials: 'AM' },
          ],
          categories: [
            { name: 'Dairy & Eggs', revenue: 340000, share: 33.5, color: '#172554' },
            { name: 'Staples & Grains', revenue: 264000, share: 26.0, color: '#2563EB' },
            { name: 'Bakery & Bread', revenue: 167500, share: 16.5, color: '#316BF3' },
            { name: 'Personal & Household', revenue: 124500, share: 12.3, color: '#B7C4FD' },
            { name: 'Snacks & Confectionery', revenue: 119000, share: 11.7, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Bakery & Bread (+16.2% YoY)',
        },
      };
    } else {
      // Shree Kirana & General Store (Neighborhood Kirana format in Thane)
      return {
        '7d': {
          rangeLabel: 'Sep 01 – Sep 07, 2026',
          prevRangeLabel: 'Aug 25 – Aug 31, 2026',
          baseRevenue: 28400,
          prevRevenue: 25600,
          growthRevenue: '+10.9%',
          grossMargin: '21.5%',
          baseOrders: 62,
          prevOrders: 57,
          growthOrders: '+8.8%',
          ordersPerDay: '8.9',
          baseAov: 458,
          prevAov: 449,
          growthAov: '+2.0%',
          itemsPerBasket: '2.9',
          activeCustomers: 44,
          prevCustomers: 41,
          growthCustomers: '+7.3%',
          repeatRate: 84.1,
          returningCustomers: 37,
          newCustomers: 7,
          avgReturningSpend: 512,
          avgNewSpend: 390,
          deliveryOrders: 38,
          deliveryShare: '61.3%',
          deliveryOntime: '98.2%',
          deliveryTransit: '14 mins',
          pickupOrders: 24,
          pickupShare: '38.7%',
          pickupCompletion: '100%',
          pickupPrep: '6 mins',
          courierOrders: 0,
          courierShare: '0.0%',
          courierSla: '100%',
          courierHandoff: '0 hrs',
          dailyTrend: [
            { day: 'Sep 01', revenue: 3800, orders: 8, aov: 475, label: '₹3.8k' },
            { day: 'Sep 02', revenue: 4100, orders: 9, aov: 455, label: '₹4.1k' },
            { day: 'Sep 03', revenue: 4400, orders: 10, aov: 440, label: '₹4.4k' },
            { day: 'Sep 04', revenue: 3900, orders: 8, aov: 487, label: '₹3.9k' },
            { day: 'Sep 05', revenue: 4900, orders: 11, aov: 445, label: '₹4.9k' },
            { day: 'Sep 06 (Sat)', revenue: 5200, orders: 12, aov: 433, label: '₹5.2k ★', isPeak: true },
            { day: 'Sep 07 (Today)', revenue: 2100, orders: 4, aov: 525, label: '₹2.1k (Live)', isLive: true },
          ],
          prevTrendPoints: '30,140 140,130 250,120 360,115 470,105 580,95 680,90',
          currentTrendPoints: '30,125 140,110 250,95 360,110 470,80 580,65 680,160',
          areaPolygon: '30,220 30,125 140,110 250,95 360,110 470,80 580,65 680,160 680,220',
          topSkus: [
            { id: 'shr_sku_1', name: 'Amul Taaza Milk 1L', sku: 'SHR-AMUL-1L', category: 'Dairy', units: 82, orders: 48, revenue: 4428, initials: 'AT' },
            { id: 'shr_sku_2', name: 'Modern Brown Bread 400g', sku: 'SHR-BRD-40', category: 'Bakery', units: 46, orders: 38, revenue: 2300, initials: 'BB' },
            { id: 'shr_sku_3', name: 'Tata Salt 1kg', sku: 'SHR-SLT-1K', category: 'Staples', units: 42, orders: 35, revenue: 1050, initials: 'TS' },
            { id: 'shr_sku_4', name: 'Wagh Bakri Tea 250g', sku: 'SHR-TEA-25', category: 'Beverages', units: 28, orders: 24, revenue: 3360, initials: 'WB' },
            { id: 'shr_sku_5', name: 'Fortune Sunflower Oil 1L', sku: 'SHR-OIL-1L', category: 'Staples', units: 22, orders: 20, revenue: 2970, initials: 'FO' },
          ],
          bottomSkus: [
            { id: 'shr_b1', name: 'Haldiram Bhujia 150g', sku: 'SHR-BHU-15', category: 'Snacks', units: 6, orders: 5, revenue: 240, initials: 'HB' },
            { id: 'shr_b2', name: 'Parle-G Gold 250g', sku: 'SHR-PAR-25', category: 'Bakery', units: 8, orders: 7, revenue: 240, initials: 'PG' },
            { id: 'shr_b3', name: 'Dettol Soap 125g', sku: 'SHR-DET-12', category: 'Personal Care', units: 5, orders: 4, revenue: 225, initials: 'DS' },
            { id: 'shr_b4', name: 'Colgate Strong Teeth 100g', sku: 'SHR-COL-10', category: 'Personal Care', units: 4, orders: 4, revenue: 240, initials: 'CT' },
            { id: 'shr_b5', name: 'Maggi 2-Minute Noodles 4-pack', sku: 'SHR-MAG-4P', category: 'Instant Food', units: 7, orders: 5, revenue: 420, initials: 'MN' },
          ],
          categories: [
            { name: 'Dairy & Milk', revenue: 10800, share: 38.0, color: '#172554' },
            { name: 'Staples & Grains', revenue: 7600, share: 26.8, color: '#2563EB' },
            { name: 'Bakery & Snacks', revenue: 4900, share: 17.3, color: '#316BF3' },
            { name: 'Beverages', revenue: 3300, share: 11.6, color: '#B7C4FD' },
            { name: 'Personal Care', revenue: 1800, share: 6.3, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Dairy & Milk (+22.1% YoY)',
        },
        '30d': {
          rangeLabel: 'Aug 09 – Sep 07, 2026',
          prevRangeLabel: 'Jul 10 – Aug 08, 2026',
          baseRevenue: 118400,
          prevRevenue: 109200,
          growthRevenue: '+8.4%',
          grossMargin: '21.2%',
          baseOrders: 264,
          prevOrders: 248,
          growthOrders: '+6.5%',
          ordersPerDay: '8.8',
          baseAov: 448,
          prevAov: 440,
          growthAov: '+1.8%',
          itemsPerBasket: '2.8',
          activeCustomers: 92,
          prevCustomers: 86,
          growthCustomers: '+7.0%',
          repeatRate: 85.5,
          returningCustomers: 79,
          newCustomers: 13,
          avgReturningSpend: 1320,
          avgNewSpend: 780,
          deliveryOrders: 161,
          deliveryShare: '61.0%',
          deliveryOntime: '97.8%',
          deliveryTransit: '15 mins',
          pickupOrders: 103,
          pickupShare: '39.0%',
          pickupCompletion: '100%',
          pickupPrep: '6 mins',
          courierOrders: 0,
          courierShare: '0.0%',
          courierSla: '100%',
          courierHandoff: '0 hrs',
          dailyTrend: [
            { day: 'Week 1', revenue: 28400, orders: 64, aov: 443, label: '₹28.4k' },
            { day: 'Week 2', revenue: 30100, orders: 67, aov: 449, label: '₹30.1k' },
            { day: 'Week 3', revenue: 31500, orders: 71, aov: 443, label: '₹31.5k ★', isPeak: true },
            { day: 'Week 4', revenue: 28400, orders: 62, aov: 458, label: '₹28.4k' },
          ],
          prevTrendPoints: '40,130 220,115 440,95 660,85',
          currentTrendPoints: '40,115 220,100 440,80 660,90',
          areaPolygon: '40,220 40,115 220,100 440,80 660,90 660,220',
          topSkus: [
            { id: 'shr_sku_1', name: 'Amul Taaza Milk 1L', sku: 'SHR-AMUL-1L', category: 'Dairy', units: 360, orders: 210, revenue: 19440, initials: 'AT' },
            { id: 'shr_sku_2', name: 'Modern Brown Bread 400g', sku: 'SHR-BRD-40', category: 'Bakery', units: 205, orders: 165, revenue: 10250, initials: 'BB' },
            { id: 'shr_sku_3', name: 'Tata Salt 1kg', sku: 'SHR-SLT-1K', category: 'Staples', units: 180, orders: 150, revenue: 4500, initials: 'TS' },
            { id: 'shr_sku_4', name: 'Wagh Bakri Tea 250g', sku: 'SHR-TEA-25', category: 'Beverages', units: 120, orders: 105, revenue: 14400, initials: 'WB' },
            { id: 'shr_sku_5', name: 'Fortune Sunflower Oil 1L', sku: 'SHR-OIL-1L', category: 'Staples', units: 98, orders: 88, revenue: 13230, initials: 'FO' },
          ],
          bottomSkus: [
            { id: 'shr_b1', name: 'Haldiram Bhujia 150g', sku: 'SHR-BHU-15', category: 'Snacks', units: 24, orders: 19, revenue: 960, initials: 'HB' },
            { id: 'shr_b2', name: 'Parle-G Gold 250g', sku: 'SHR-PAR-25', category: 'Bakery', units: 31, orders: 25, revenue: 930, initials: 'PG' },
            { id: 'shr_b3', name: 'Dettol Soap 125g', sku: 'SHR-DET-12', category: 'Personal Care', units: 18, orders: 16, revenue: 810, initials: 'DS' },
            { id: 'shr_b4', name: 'Colgate Strong Teeth 100g', sku: 'SHR-COL-10', category: 'Personal Care', units: 16, orders: 14, revenue: 960, initials: 'CT' },
            { id: 'shr_b5', name: 'Maggi 2-Minute Noodles 4-pack', sku: 'SHR-MAG-4P', category: 'Instant Food', units: 29, orders: 22, revenue: 1740, initials: 'MN' },
          ],
          categories: [
            { name: 'Dairy & Milk', revenue: 44200, share: 37.3, color: '#172554' },
            { name: 'Staples & Grains', revenue: 32100, share: 27.1, color: '#2563EB' },
            { name: 'Bakery & Snacks', revenue: 20600, share: 17.4, color: '#316BF3' },
            { name: 'Beverages', revenue: 13800, share: 11.7, color: '#B7C4FD' },
            { name: 'Personal Care', revenue: 7700, share: 6.5, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Beverages (+18.9% YoY)',
        },
        '90d': {
          rangeLabel: 'Jun 10 – Sep 07, 2026',
          prevRangeLabel: 'Mar 12 – Jun 09, 2026',
          baseRevenue: 345000,
          prevRevenue: 321000,
          growthRevenue: '+7.5%',
          grossMargin: '21.4%',
          baseOrders: 780,
          prevOrders: 735,
          growthOrders: '+6.1%',
          ordersPerDay: '8.7',
          baseAov: 442,
          prevAov: 436,
          growthAov: '+1.4%',
          itemsPerBasket: '2.8',
          activeCustomers: 180,
          prevCustomers: 168,
          growthCustomers: '+7.1%',
          repeatRate: 86.8,
          returningCustomers: 156,
          newCustomers: 24,
          avgReturningSpend: 3950,
          avgNewSpend: 1600,
          deliveryOrders: 476,
          deliveryShare: '61.0%',
          deliveryOntime: '97.6%',
          deliveryTransit: '15 mins',
          pickupOrders: 304,
          pickupShare: '39.0%',
          pickupCompletion: '100%',
          pickupPrep: '6 mins',
          courierOrders: 0,
          courierShare: '0.0%',
          courierSla: '100%',
          courierHandoff: '0 hrs',
          dailyTrend: [
            { day: 'Month 1', revenue: 110000, orders: 250, aov: 440, label: '₹110k' },
            { day: 'Month 2', revenue: 116600, orders: 266, aov: 438, label: '₹116k ★', isPeak: true },
            { day: 'Month 3', revenue: 118400, orders: 264, aov: 448, label: '₹118k' },
          ],
          prevTrendPoints: '50,135 350,110 650,95',
          currentTrendPoints: '50,120 350,90 650,85',
          areaPolygon: '50,220 50,120 350,90 650,85 650,220',
          topSkus: [
            { id: 'shr_sku_1', name: 'Amul Taaza Milk 1L', sku: 'SHR-AMUL-1L', category: 'Dairy', units: 1080, orders: 630, revenue: 58320, initials: 'AT' },
            { id: 'shr_sku_2', name: 'Modern Brown Bread 400g', sku: 'SHR-BRD-40', category: 'Bakery', units: 615, orders: 495, revenue: 30750, initials: 'BB' },
            { id: 'shr_sku_3', name: 'Tata Salt 1kg', sku: 'SHR-SLT-1K', category: 'Staples', units: 540, orders: 450, revenue: 13500, initials: 'TS' },
            { id: 'shr_sku_4', name: 'Wagh Bakri Tea 250g', sku: 'SHR-TEA-25', category: 'Beverages', units: 360, orders: 315, revenue: 43200, initials: 'WB' },
            { id: 'shr_sku_5', name: 'Fortune Sunflower Oil 1L', sku: 'SHR-OIL-1L', category: 'Staples', units: 294, orders: 264, revenue: 39690, initials: 'FO' },
          ],
          bottomSkus: [
            { id: 'shr_b1', name: 'Haldiram Bhujia 150g', sku: 'SHR-BHU-15', category: 'Snacks', units: 72, orders: 57, revenue: 2880, initials: 'HB' },
            { id: 'shr_b2', name: 'Parle-G Gold 250g', sku: 'SHR-PAR-25', category: 'Bakery', units: 93, orders: 75, revenue: 2790, initials: 'PG' },
            { id: 'shr_b3', name: 'Dettol Soap 125g', sku: 'SHR-DET-12', category: 'Personal Care', units: 54, orders: 48, revenue: 2430, initials: 'DS' },
            { id: 'shr_b4', name: 'Colgate Strong Teeth 100g', sku: 'SHR-COL-10', category: 'Personal Care', units: 48, orders: 42, revenue: 2880, initials: 'CT' },
            { id: 'shr_b5', name: 'Maggi 2-Minute Noodles 4-pack', sku: 'SHR-MAG-4P', category: 'Instant Food', units: 87, orders: 66, revenue: 5220, initials: 'MN' },
          ],
          categories: [
            { name: 'Dairy & Milk', revenue: 129000, share: 37.4, color: '#172554' },
            { name: 'Staples & Grains', revenue: 93500, share: 27.1, color: '#2563EB' },
            { name: 'Bakery & Snacks', revenue: 59800, share: 17.3, color: '#316BF3' },
            { name: 'Beverages', revenue: 40500, share: 11.7, color: '#B7C4FD' },
            { name: 'Personal Care', revenue: 22200, share: 6.4, color: '#D3E4FE' },
          ],
          fastestGrowingCategory: 'Staples & Grains (+15.4% YoY)',
        },
      };
    }
  }, [currentStore.id]);

  // Current active period configuration
  const activeConfig = useMemo(() => {
    const periodKey = timePeriod === 'custom' ? '7d' : timePeriod;
    return storeAnalyticsData[periodKey] || storeAnalyticsData['7d'];
  }, [storeAnalyticsData, timePeriod]);

  // Net realized revenue incorporates completed live orders dynamically
  const netRevenue = activeConfig.baseRevenue + liveCompletedRevenue;
  const netOrders = activeConfig.baseOrders + completedLiveOrders.length;
  const netAov = Math.round(netRevenue / Math.max(1, netOrders));
  const activeCustomerCount = Math.max(activeConfig.activeCustomers, storeCustomers.length);

  // Active top SKUs list
  const activeSkus = skuRankMode === 'top' ? activeConfig.topSkus : activeConfig.bottomSkus;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#172554',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Top Context & Header Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
          <span style={{ fontWeight: 600, color: '#172554' }}>{currentStore.name}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span>Growth &amp; Analytics</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: '#2563EB', fontWeight: 600 }}>Business Analytics</span>
        </nav>

        {/* Title + Period Controller & Export Button */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172554', margin: 0, letterSpacing: '-0.015em' }}>
              Analytics
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0', maxWidth: '650px' }}>
              Understand your store's performance, customer retention, and sales velocity patterns over time.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            {/* Global Period Controller */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: 'custom', label: 'Custom' },
              ].map((p) => {
                const isSelected = timePeriod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTimePeriod(p.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isSelected ? '#2563EB' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Export Menu Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  height: '38px',
                  borderRadius: '6px',
                  backgroundColor: '#172554',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(23, 37, 84, 0.2)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  download
                </span>
                Export Report
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  expand_more
                </span>
              </button>

              {isExportOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    width: '180px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #E2E8F0',
                    padding: '4px',
                    zIndex: 30,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      showToast('CSV export generated and downloaded.');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#172033',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF4FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>Export CSV</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>
                      table_view
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      showToast('PDF summary generated.');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#172033',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF4FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>Export PDF Summary</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>
                      picture_as_pdf
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Ribbon & Store Scope Notice */}
      <div
        style={{
          backgroundColor: '#EFF4FF',
          border: '1px solid #DCE9FF',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
              calendar_today
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#172554' }}>Active Range:</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#172033',
                border: '1px solid #E2E8F0',
              }}
            >
              {activeConfig.rangeLabel}
            </span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748B' }}>
            <input
              type="checkbox"
              checked={comparePrevious}
              onChange={(e) => setComparePrevious(e.target.checked)}
              style={{ accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <span>
              Compare to: <strong style={{ color: '#172033' }}>Previous period ({activeConfig.prevRangeLabel})</strong>
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
            verified_user
          </span>
          <span>
            Store Scope: <strong style={{ color: '#172554' }}>{currentStore.name} ({currentStore.id})</strong>
          </span>
        </div>
      </div>

      {/* Primary KPI Grid (4 Metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Net Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Total Net Revenue
            </span>
            <span style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#EFF4FF', color: '#2563EB', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                currency_rupee
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#172554' }}>
              ₹{netRevenue.toLocaleString('en-IN')}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF4FF',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_upward
              </span>
              {activeConfig.growthRevenue}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
            <span>vs ₹{activeConfig.prevRevenue.toLocaleString('en-IN')} previous</span>
            <span style={{ color: '#2563EB', fontWeight: 600 }}>Gross Margin {activeConfig.grossMargin}</span>
          </div>
        </div>

        {/* KPI 2: Order Count */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Completed Orders
            </span>
            <span style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#EFF4FF', color: '#2563EB', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                shopping_cart
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#172554' }}>
              {netOrders}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF4FF',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_upward
              </span>
              {activeConfig.growthOrders}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
            <span>vs {activeConfig.prevOrders} previous</span>
            <span style={{ color: '#172033', fontWeight: 600 }}>{activeConfig.ordersPerDay} orders/day</span>
          </div>
        </div>

        {/* KPI 3: AOV */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Avg Order Value (AOV)
            </span>
            <span style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#EFF4FF', color: '#2563EB', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                receipt_long
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#172554' }}>
              ₹{netAov}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF4FF',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_upward
              </span>
              {activeConfig.growthAov}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
            <span>vs ₹{activeConfig.prevAov} previous</span>
            <span style={{ color: '#172033', fontWeight: 600 }}>{activeConfig.itemsPerBasket} items/basket</span>
          </div>
        </div>

        {/* KPI 4: Active Customers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Active Customers
            </span>
            <span style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#EFF4FF', color: '#2563EB', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                group
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#172554' }}>
              {activeCustomerCount}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF4FF',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_upward
              </span>
              {activeConfig.growthCustomers}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
            <span>vs {activeConfig.prevCustomers} previous</span>
            <span style={{ color: '#2563EB', fontWeight: 600 }}>{activeConfig.repeatRate}% Repeat Rate</span>
          </div>
        </div>
      </div>

      {/* Sales Trend Visualizer Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
              Sales &amp; Volume Progression
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Daily comparison against historical period cycle
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            {/* Metric Tab Switcher */}
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                backgroundColor: '#EFF4FF',
                borderRadius: '8px',
              }}
            >
              {[
                { id: 'revenue', label: 'Revenue (₹)' },
                { id: 'orders', label: 'Orders (#)' },
                { id: 'aov', label: 'AOV (₹)' },
              ].map((m) => {
                const isActive = chartMetric === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChartMetric(m.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#2563EB' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#64748B',
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                <span style={{ fontWeight: 600, color: '#172033' }}>Current Period</span>
              </div>
              {comparePrevious && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '2px', borderBottom: '2px dashed #94A3B8' }}></span>
                  <span style={{ color: '#64748B' }}>Previous Period</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* High Precision SVG Vector Grid */}
        <div style={{ position: 'relative', width: '100%', height: '260px', paddingTop: '12px' }}>
          <svg
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
            preserveAspectRatio="none"
            viewBox="0 0 700 240"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18"></stop>
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"></stop>
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="20" y2="20" />
            <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="70" y2="70" />
            <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="120" y2="120" />
            <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="170" y2="170" />
            <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="700" y1="220" y2="220" />

            {/* Value Axis Labels */}
            <text x="0" y="16" fill="#94A3B8" fontSize="10px" fontFamily="Inter">
              {currentStore.id === 'store_01' ? '₹18,000' : '₹6,000'}
            </text>
            <text x="0" y="66" fill="#94A3B8" fontSize="10px" fontFamily="Inter">
              {currentStore.id === 'store_01' ? '₹14,000' : '₹4,500'}
            </text>
            <text x="0" y="116" fill="#94A3B8" fontSize="10px" fontFamily="Inter">
              {currentStore.id === 'store_01' ? '₹10,000' : '₹3,000'}
            </text>
            <text x="0" y="166" fill="#94A3B8" fontSize="10px" fontFamily="Inter">
              {currentStore.id === 'store_01' ? '₹6,000' : '₹1,500'}
            </text>
            <text x="0" y="216" fill="#94A3B8" fontSize="10px" fontFamily="Inter">
              {currentStore.id === 'store_01' ? '₹2,000' : '₹500'}
            </text>

            {/* Previous Period Trajectory (Dashed) */}
            {comparePrevious && (
              <polyline
                fill="none"
                points={activeConfig.prevTrendPoints}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeWidth="2"
              />
            )}

            {/* Filled Area Gradient */}
            <polygon fill="url(#areaGradient)" points={activeConfig.areaPolygon} />

            {/* Current Period Solid Line */}
            <polyline
              fill="none"
              points={activeConfig.currentTrendPoints}
              stroke="#2563EB"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />

            {/* Interactive Points */}
            <circle cx="30" cy="115" fill="#FFFFFF" r="4.5" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="140" cy="98" fill="#FFFFFF" r="4.5" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="250" cy="81" fill="#FFFFFF" r="4.5" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="360" cy="94" fill="#FFFFFF" r="4.5" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="470" cy="61" fill="#FFFFFF" r="4.5" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="580" cy="44" fill="#172554" r="5.5" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="680" cy="172" fill="#F59E0B" r="4.5" stroke="#172554" strokeWidth="2" />

            {/* Peak Tooltip Pin */}
            <g transform="translate(525, 6)">
              <rect fill="#172554" height="28" rx="4" width="115" />
              <text x="57" y="18" fill="#FFFFFF" fontSize="11px" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                {currentStore.id === 'store_01' ? 'Sep 06: ₹16,200' : 'Sep 06: ₹5,200'}
              </text>
            </g>
          </svg>

          {/* X-Axis Labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${activeConfig.dailyTrend.length}, 1fr)`,
              textAlign: 'center',
              paddingTop: '8px',
              fontSize: '11px',
              color: '#64748B',
            }}
          >
            {activeConfig.dailyTrend.map((t, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: t.isPeak ? '#EFF4FF' : 'transparent',
                  borderRadius: '4px',
                  padding: '2px 0',
                }}
              >
                <span style={{ display: 'block', fontWeight: 600, color: t.isPeak ? '#2563EB' : '#172033' }}>
                  {t.day}
                </span>
                <span style={{ fontSize: '11px', fontWeight: t.isPeak ? 700 : 500, color: t.isLive ? '#D97706' : t.isPeak ? '#172554' : '#64748B' }}>
                  {chartMetric === 'revenue' ? t.label : chartMetric === 'orders' ? `${t.orders} ord` : `₹${t.aov}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observation Insight Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#EFF4FF',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#172033',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '20px' }}>
            insights
          </span>
          <div style={{ flex: 1, lineHeight: 1.4 }}>
            <strong style={{ color: '#172554' }}>Demand Pattern Insight: </strong>
            Peak sales velocity observed on weekends between <strong>06:00 PM – 09:00 PM</strong>. Fresh dairy and staple
            basket sizes increased by 31% during evening rush hours at {currentStore.name}.
          </div>
        </div>
      </div>

      {/* Product & Category Breakdown (Two-Column Master Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Top SKUs (7 cols equiv) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  Top Performing SKUs
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Ranked by gross realized revenue across all checkout channels
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#EFF4FF', padding: '3px', borderRadius: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSkuRankMode('top')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: skuRankMode === 'top' ? '#FFFFFF' : 'transparent',
                    color: skuRankMode === 'top' ? '#172554' : '#64748B',
                    fontWeight: skuRankMode === 'top' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: skuRankMode === 'top' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Top 5
                </button>
                <button
                  type="button"
                  onClick={() => setSkuRankMode('bottom')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: skuRankMode === 'bottom' ? '#FFFFFF' : 'transparent',
                    color: skuRankMode === 'bottom' ? '#172554' : '#64748B',
                    fontWeight: skuRankMode === 'bottom' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: skuRankMode === 'bottom' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Bottom 5
                </button>
              </div>
            </div>

            {/* Top SKUs Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#EFF4FF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                    <th style={{ padding: '8px 12px', borderRadius: '4px 0 0 4px', fontWeight: 600 }}>Product &amp; SKU</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Units Sold</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Orders</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', borderRadius: '0 4px 4px 0', fontWeight: 600 }}>Revenue</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '13px', color: '#172033' }}>
                  {activeSkus.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: '#EFF4FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: '#172554',
                              fontSize: '11px',
                              flexShrink: 0,
                            }}
                          >
                            {item.initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: '#172554', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              SKU: {item.sku} · {item.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {item.units}
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>
                        {item.orders}
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#172554' }}>
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Velocity Watch Alert */}
          <div
            style={{
              backgroundColor: '#EFF4FF',
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '20px' }}>
                warning
              </span>
              <div style={{ fontSize: '12px', color: '#172033' }}>
                <strong style={{ color: '#172554' }}>Low Velocity Watch: </strong>
                <span>Epigamia Greek Yogurt (only 6 units sold in 7 days, shelf expiry risk)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Redirecting to discount creation for promotional clearance.')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Manage Discount
            </button>
          </div>
        </div>

        {/* Right Column: Category Distribution (5 cols equiv) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ paddingBottom: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                Category Revenue Share
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Proportional sales distribution across major departments
              </p>
            </div>

            {/* Multi-Segment Visual Bar */}
            <div
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '9999px',
                backgroundColor: '#EFF4FF',
                display: 'flex',
                overflow: 'hidden',
                margin: '16px 0',
              }}
            >
              {activeConfig.categories.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${c.share}%`,
                    height: '100%',
                    backgroundColor: c.color,
                  }}
                  title={`${c.name}: ${c.share}%`}
                />
              ))}
            </div>

            {/* Category List Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeConfig.categories.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                    <span style={{ fontWeight: 500, color: '#172554' }}>{cat.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 700, color: '#172554' }}>₹{cat.revenue.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '12px', color: '#64748B', width: '45px', textAlign: 'right' }}>
                      {cat.share}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#EFF4FF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#64748B' }}>Fastest Growing Department:</span>
              <span style={{ fontWeight: 700, color: '#2563EB' }}>{activeConfig.fastestGrowingCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Retention & Fulfillment Channels (Two-Column Master Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left: Customer Loyalty & Retention */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
              Customer Loyalty &amp; Retention
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Cohort dynamics and repeat buyer lifetime velocity
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                alignItems: 'center',
                gap: '16px',
                paddingTop: '16px',
              }}
            >
              {/* Mini SVG Progress Donut */}
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EFF4FF"
                    strokeWidth="4"
                  />
                  {/* Foreground circle (Repeat rate) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2563EB"
                    strokeDasharray={`${activeConfig.repeatRate}, 100`}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#172554' }}>
                    {activeConfig.repeatRate}%
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Repeat Rate</span>
                </div>
              </div>

              {/* Retention Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Returning Customers</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                      {activeConfig.returningCustomers} shoppers
                    </span>
                  </div>
                  <span style={{ padding: '2px 8px', backgroundColor: '#FFFFFF', color: '#2563EB', fontSize: '11px', fontWeight: 700, borderRadius: '4px' }}>
                    {activeConfig.repeatRate}%
                  </span>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>New First-Time Buyers</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                      {activeConfig.newCustomers} shoppers
                    </span>
                  </div>
                  <span style={{ padding: '2px 8px', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '11px', fontWeight: 700, borderRadius: '4px' }}>
                    {(100 - activeConfig.repeatRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#EFF4FF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#172033',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '18px' }}>
              loyalty
            </span>
            <span>
              Returning customers spend an average of{' '}
              <strong style={{ color: '#172554' }}>
                18% higher per basket (₹{activeConfig.avgReturningSpend})
              </strong>{' '}
              compared to first-time shoppers (₹{activeConfig.avgNewSpend}).
            </span>
          </div>
        </div>

        {/* Right: Fulfillment Methods & SLAs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
              Fulfillment Methods &amp; SLAs
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Logistics efficiency across delivery, pickup, and parcels
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
              {/* Local Delivery */}
              <div style={{ padding: '10px 14px', backgroundColor: '#EFF4FF', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#172554' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                      moped
                    </span>
                    Hyperlocal Delivery (0–8 km)
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#172554' }}>
                    {activeConfig.deliveryOrders} orders ({activeConfig.deliveryShare})
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                  <span>On-time Delivery Rate: <strong style={{ color: '#2563EB' }}>{activeConfig.deliveryOntime}</strong></span>
                  <span>Avg Transit: <strong style={{ color: '#172033' }}>{activeConfig.deliveryTransit}</strong></span>
                </div>
              </div>

              {/* Store Counter Pickup */}
              <div style={{ padding: '10px 14px', backgroundColor: '#EFF4FF', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#172554' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                      storefront
                    </span>
                    Store Counter Pickup
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#172554' }}>
                    {activeConfig.pickupOrders} orders ({activeConfig.pickupShare})
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                  <span>Completed Orders: <strong style={{ color: '#2563EB' }}>{activeConfig.pickupCompletion}</strong></span>
                  <span>Avg Prep Time: <strong style={{ color: '#172033' }}>{activeConfig.pickupPrep}</strong></span>
                </div>
              </div>

              {/* Regional Shipping / Courier */}
              {activeConfig.courierOrders > 0 && (
                <div style={{ padding: '10px 14px', backgroundColor: '#EFF4FF', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#172554' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                        local_shipping
                      </span>
                      Regional Courier / Inter-City
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#172554' }}>
                      {activeConfig.courierOrders} orders ({activeConfig.courierShare})
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                    <span>SLA Compliance: <strong style={{ color: '#2563EB' }}>{activeConfig.courierSla}</strong></span>
                    <span>Avg Hand-off: <strong style={{ color: '#172033' }}>{activeConfig.courierHandoff}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Health Status Pill Strip */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#EFF4FF',
              borderRadius: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
              <span style={{ color: '#172033', fontWeight: 500 }}>
                {netOrders} Completed ({((netOrders / Math.max(1, netOrders + processingOrders.length + cancelledOrders.length)) * 100).toFixed(1)}%)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
              <span style={{ color: '#172033', fontWeight: 500 }}>
                {processingOrders.length} Processing
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
              <span style={{ color: '#172033', fontWeight: 500 }}>
                {cancelledOrders.length} Cancelled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Store Data Isolation Footer Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#EFF4FF', borderRadius: '8px', color: '#172554', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              domain_verification
            </span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#172554' }}>
              Multi-Tenant Store Data Isolation
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              All transactional figures, customer retention rates, and fulfillment times belong strictly to{' '}
              <strong style={{ color: '#172033' }}>{currentStore.name} ({currentStore.address} Store #{currentStore.id})</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#2563EB' }}>
            sync
          </span>
          <span>Synced: Today, 05:42 PM IST</span>
        </div>
      </div>
    </div>
  );
}
