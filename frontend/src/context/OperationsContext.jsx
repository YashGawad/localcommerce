/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCatalog } from './CatalogContext';
import { MOCK_STAFF } from '../data/staff';

/**
 * Standard Order Lifecycle Statuses:
 * 
 * Delivery Lifecycle:
 * PLACED → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
 * 
 * Pickup Lifecycle:
 * PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP → PICKED_UP
 * 
 * Cancellation:
 * CANCELLED
 */

const INITIAL_STORE_ORDERS = {
  store_01: [
    {
      id: 'LC-10484',
      orderNumber: '#LC-10484',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'Out for Delivery',
      statusBadgeVariant: 'warning',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Express Run (30 min)',
      placedAt: 'Today, 10:15 AM',
      estimatedDelivery: 'Today, 10:52 AM (In 4 mins)',
      deliveredAt: null,
      subtotal: 323,
      deliveryFee: 25,
      discount: 20,
      platformFee: 0,
      taxes: 12,
      total: 340,
      paymentMethod: 'UPI',
      paymentDetails: 'Razorpay UPI (ID: pay_Okj82Vf9)',
      paymentStatus: 'PAID',
      amountToCollect: 0,
      invoiceNumber: '#INV-99014',
      distance: '1.2 km',
      sector: 'Koramangala • 1.2 km away',
      promisedTime: '11:15 AM',
      assignedTime: '10:42 AM',
      thermalSeal: 'Pass (Seal #402-V)',
      totalWeight: '~2.85 kg',
      customer: {
        id: 'cust_sharma_02',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com',
        tier: 'Gold Tier',
        pastOrdersCount: 42,
        address: 'Flat 402, Green Glen Apartments, 17th Main Road, 4th Block, Koramangala, Bengaluru, KA 560034',
        streetAddress: 'Flat 402, Green Glen Apartments\n17th Main Road, 4th Block\nKoramangala, Bengaluru, KA 560034',
        landmark: 'Opposite Koramangala Club Gate 2',
        customerNote: 'Please buzz Apartment 402 on the intercom at the main gate. If not answering bell, please call on phone. Do not leave bags in direct sun.',
      },
      deliveryPartner: {
        id: 'staff_shm_05',
        name: 'Vikram Rao',
        initials: 'VR',
        code: '#DEL-04',
        phone: '+91 98205 33445',
        role: 'Dedicated Store Delivery Partner',
        vehicle: 'Two-wheeler (KA-01-EQ-9841)',
        status: 'In-transit with thermal crate',
      },
      items: [
        {
          id: 'item_84_01',
          productId: 'shm_prod_amul_taaza',
          title: 'Amul Taaza Homogenised Milk',
          unit: 'Volume: 1 Litre Tetra Pak',
          quantity: 2,
          price: 54,
          total: 108,
          handlingNote: 'Chilled 4°C',
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
        },
        {
          id: 'item_84_02',
          productId: 'shm_prod_brown_bread',
          title: 'Britannia Whole Wheat Bread',
          unit: 'Net Weight: 400g Fresh Loaf',
          quantity: 1,
          price: 45,
          total: 45,
          handlingNote: 'Crush Fragile',
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
        {
          id: 'item_84_03',
          productId: 'shm_prod_eggs',
          title: 'Fresh Farm White Eggs',
          unit: 'Pack of 6 Tray',
          quantity: 1,
          price: 65,
          total: 65,
          handlingNote: 'Cushioned Top',
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1W-Fy1SasZSUdbaW9IgDyhnoCodVMhFLE_ZiwibzUdJgqphI27EbXd5g0nZMLK_0YPtq0xYM-bTWWYLOk9A2an9QJkdH-SPGdmVkIZyCCh8RUezk9I_8PF0ts4lfDvyu-5PUJCC263Vap-ppXflFXrk05FoufQM_oCOPzuUjedLuWNulc7QOcjTOSO5KbRlMGMHwhRjZ0rlXuVaegxiOCdVvMWQAfP-ulLcXX4p5CsVgsh-xHyh_es_',
        },
        {
          id: 'item_84_04',
          productId: 'shm_prod_yogurt',
          title: 'Epigamia Greek Yogurt (Blueberry)',
          unit: '100g Individual Cups',
          quantity: 3,
          price: 40,
          total: 120,
          handlingNote: 'Keep Cold',
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1WWaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00112233445566778899aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Ready & Packed', time: '10:15 AM', completed: true, note: 'Packed at Counter Rack B-2 by Suresh Sharma. Verified 4 line items into insulated thermal crate #4.' },
        { step: 2, label: 'Dispatched via Express Rider', time: '10:30 AM', completed: true, note: 'Handed over to Vikram Rao (Two-wheeler KA-01-EQ-9841). Temperature log verified: Cold chain locked at 4°C.' },
        { step: 3, label: 'Out for Delivery (In Transit)', time: '10:42 AM', completed: true, current: true, note: 'Rider is 350 meters away from Green Glen Apartments. Navigating 17th Main Road, Koramangala 4th Block.' },
        { step: 4, label: 'Completed Handover', time: 'Pending OTP Verification', completed: false, note: 'Awaiting 4-digit recipient PIN or signed proof-of-delivery from Flat 402.' },
      ],
    },
    {
      id: 'LC-10483',
      orderNumber: '#LC-10483',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'READY',
      statusLabel: 'Ready for Dispatch',
      statusBadgeVariant: 'primary',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Standard Delivery',
      placedAt: 'Today, 10:20 AM',
      estimatedDelivery: 'Today, 11:45 AM',
      deliveredAt: null,
      subtotal: 248,
      deliveryFee: 25,
      discount: 0,
      platformFee: 0,
      taxes: 0,
      total: 273,
      paymentMethod: 'Cash on Delivery',
      paymentDetails: 'Collect cash at door',
      paymentStatus: 'PENDING',
      amountToCollect: 273,
      invoiceNumber: '#INV-99013',
      distance: '1.8 km',
      sector: 'Koramangala • 1.8 km away',
      promisedTime: '11:45 AM',
      dockTime: '10:35 AM',
      customer: {
        id: 'cust_sneha_r',
        name: 'Sneha Reddy',
        phone: '+91 98450 11223',
        email: 'sneha.reddy@example.com',
        pastOrdersCount: 5,
        address: '#88, 5th Cross, 6th Block, Koramangala, Bangalore 560095',
        streetAddress: '#88, 5th Cross, 6th Block, Koramangala, Bangalore 560095',
        landmark: 'Near 6th Block BBMP Office',
        customerNote: 'Keep change for ₹500 if possible.',
      },
      deliveryPartner: {
        id: 'staff_shm_05',
        name: 'Vikram Rao',
        initials: 'VR',
        code: '#DEL-04',
        phone: '+91 98205 33445',
        role: 'Dedicated Store Delivery Partner',
      },
      items: [
        {
          id: 'item_83_01',
          productId: 'shm_prod_aashirvaad_atta',
          title: 'Aashirvaad Superior MP Shudh Chakki Atta',
          unit: '5 kg Pack',
          quantity: 1,
          price: 245,
          total: 245,
          handlingNote: 'Standard Dry',
        },
        {
          id: 'item_83_02',
          productId: 'shm_prod_tata_salt',
          title: 'Tata Salt Vacuum Evaporated Iodised Salt',
          unit: '1 kg Pouch',
          quantity: 1,
          price: 28,
          total: 28,
          handlingNote: 'Standard Dry',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '10:20 AM', completed: true },
        { step: 2, label: 'Confirmed by Store', time: '10:22 AM', completed: true },
        { step: 3, label: 'Order Ready & Packed', time: '10:35 AM', completed: true, current: true, note: 'Ready at dispatch dock' },
        { step: 4, label: 'Out for Delivery', time: 'Pending', completed: false },
        { step: 5, label: 'Delivered', time: 'Pending', completed: false },
      ],
    },
    {
      id: 'LC-10478',
      orderNumber: '#LC-10478',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'DELIVERED',
      statusLabel: 'Delivered',
      statusBadgeVariant: 'success',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Delivered Cycle 1',
      placedAt: 'Today, 8:15 AM',
      estimatedDelivery: 'Today, 9:24 AM',
      deliveredAt: 'Today, 09:10 AM',
      subtotal: 74,
      deliveryFee: 25,
      discount: 0,
      platformFee: 0,
      taxes: 0,
      total: 99,
      paymentMethod: 'UPI',
      paymentDetails: 'Pre-paid UPI • Google Pay',
      paymentStatus: 'PAID',
      amountToCollect: 0,
      invoiceNumber: '#INV-99008',
      distance: '2.1 km',
      sector: 'Koramangala • 2.1 km',
      deliveredTime: 'Delivered 09:10 AM',
      deliveredNote: 'On-time (14m ahead)',
      customer: {
        id: 'cust_anita_d',
        name: 'Anita Desai',
        phone: '+91 98111 22334',
        email: 'anita.desai@example.com',
        pastOrdersCount: 9,
        address: '1st Main, ST Bed Layout, Koramangala, Bangalore 560034',
      },
      deliveryPartner: {
        id: 'staff_shm_05',
        name: 'Vikram Rao',
        initials: 'VR',
        code: '#DEL-04',
      },
      items: [
        {
          id: 'item_78_01',
          title: 'Snacks & Pantry Bundle',
          quantity: 2,
          price: 37,
          total: 74,
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '8:15 AM', completed: true },
        { step: 2, label: 'Order Packed', time: '8:35 AM', completed: true },
        { step: 3, label: 'Out for Delivery', time: '8:45 AM', completed: true },
        { step: 4, label: 'Delivered', time: '9:10 AM', completed: true, current: true },
      ],
    },
    {
      id: 'LC-10482',
      orderNumber: '#LC-10482',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'PREPARING',
      statusLabel: 'Processing',
      statusBadgeVariant: 'info',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Local Delivery',
      placedAt: 'Today, 10:15 AM',
      estimatedDelivery: 'Today, 11:00 AM (Express 45m)',
      deliveredAt: null,
      subtotal: 785,
      deliveryFee: 25,
      discount: 40,
      platformFee: 0,
      total: 770,
      paymentMethod: 'UPI',
      paymentDetails: 'Google Pay • rahulsharma@okhdfcbank',
      paymentStatus: 'PAID',
      invoiceNumber: '#INV-99012',
      customer: {
        id: 'cust_sharma',
        name: 'Rahul Sharma',
        phone: '+91 98201 88210',
        email: 'rahul.sharma@example.com',
        pastOrdersCount: 12,
        address: 'Flat 302, Palm Grove Apts, 4th Block, Koramangala, Bangalore 560034',
        landmark: 'Near Wipro Park Signal',
        customerNote: 'Please ring the bell twice and leave outside the flat door.',
      },
      deliveryPartner: {
        name: 'Ramesh Kumar',
        initials: 'RK',
        phone: '+91 98205 33445',
        role: 'Dedicated Store Delivery Partner',
        vehicle: 'Ather 450X (KA-01-EQ-4492)',
        status: 'Assigned, awaiting dispatch',
      },
      items: [
        {
          id: 'item_01',
          productId: 'shm_prod_amul_taaza',
          title: 'Amul Taaza Homogenised Toned Milk',
          unit: '1 Litre Pouch',
          quantity: 2,
          price: 55,
          total: 110,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
        },
        {
          id: 'item_02',
          productId: 'shm_prod_brown_bread',
          title: 'Modern 100% Whole Wheat Brown Bread',
          unit: '400 g Loaf',
          quantity: 2,
          price: 52,
          total: 104,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
        {
          id: 'item_03',
          productId: 'shm_prod_fortune_oil',
          title: 'Fortune Sunlite Refined Sunflower Oil',
          unit: '1 Litre Pouch',
          quantity: 2,
          price: 138,
          total: 276,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1WWaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00112233445566778899aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
        },
        {
          id: 'item_04',
          productId: 'shm_prod_aashirvaad_atta',
          title: 'Aashirvaad Superior MP Shudh Chakki Atta',
          unit: '5 kg Pack',
          quantity: 1,
          price: 245,
          total: 245,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1V1q4rT8T03L38g2sK4j_x_8Xp-g8T4gG-v38aC4P1K0x8a1b0c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '10:15 AM', completed: true, note: 'Routed to Sharma Supermarket' },
        { step: 2, label: 'Confirmed by Store', time: '10:18 AM', completed: true, note: 'Inventory verified' },
        { step: 3, label: 'Preparing & Packing', time: '10:25 AM', completed: true, current: true, note: 'Floor staff packaging items' },
        { step: 4, label: 'Ready for Dispatch', time: 'Est. 10:35 AM', completed: false, note: 'Staged at bay 2' },
        { step: 5, label: 'Out for Delivery', time: 'Est. 10:40 AM', completed: false, note: 'Rider Ramesh Kumar' },
        { step: 6, label: 'Delivered', time: 'Est. 11:00 AM', completed: false, note: 'Contactless handover' },
      ],
    },
    {
      id: 'LC-10481',
      orderNumber: '#LC-10481',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'PLACED',
      statusLabel: 'Pending Action',
      statusBadgeVariant: 'warning',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Local Delivery',
      placedAt: 'Today, 10:42 AM (6 mins ago)',
      estimatedDelivery: 'Today, 11:30 AM',
      deliveredAt: null,
      subtotal: 980,
      deliveryFee: 25,
      discount: 0,
      platformFee: 0,
      total: 1005,
      paymentMethod: 'UPI',
      paymentDetails: 'PhonePe • priyapatil@ybl',
      paymentStatus: 'PAID',
      invoiceNumber: '#INV-99011',
      customer: {
        id: 'cust_priya',
        name: 'Priya Patil',
        phone: '+91 98202 44551',
        email: 'priya.patil@example.com',
        pastOrdersCount: 4,
        address: 'Bungalow 14, 5th Block, Koramangala, Bangalore 560095',
        landmark: 'Near Sony World Junction',
        customerNote: 'Please call before arriving.',
      },
      deliveryPartner: null,
      items: [
        {
          id: 'item_11',
          productId: 'shm_prod_aashirvaad_atta',
          title: 'Aashirvaad Superior MP Shudh Chakki Atta',
          unit: '5 kg Pack',
          quantity: 2,
          price: 245,
          total: 490,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1V1q4rT8T03L38g2sK4j_x_8Xp-g8T4gG-v38aC4P1K0x8a1b0c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0',
        },
        {
          id: 'item_12',
          productId: 'shm_prod_fortune_oil',
          title: 'Fortune Sunlite Refined Sunflower Oil',
          unit: '1 Litre Pouch',
          quantity: 2,
          price: 138,
          total: 276,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1WWaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00112233445566778899aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
        },
        {
          id: 'item_13',
          productId: 'shm_prod_thums_up_cola',
          title: 'Thums Up Charged Strong Cola Beverage',
          unit: '750 ml Bottle',
          quantity: 3,
          price: 40,
          total: 120,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1UVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuV',
        },
        {
          id: 'item_14',
          productId: 'shm_prod_brown_bread',
          title: 'Modern 100% Whole Wheat Brown Bread',
          unit: '400 g Loaf',
          quantity: 1,
          price: 52,
          total: 52,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '10:42 AM', completed: true, current: true, note: 'Needs immediate merchant confirmation' },
        { step: 2, label: 'Confirm Order', time: 'Pending', completed: false },
        { step: 3, label: 'Preparing', time: 'Pending', completed: false },
        { step: 4, label: 'Ready for Dispatch', time: 'Pending', completed: false },
        { step: 5, label: 'Out for Delivery', time: 'Pending', completed: false },
      ],
    },
    {
      id: 'LC-10480',
      orderNumber: '#LC-10480',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'READY_FOR_PICKUP',
      statusLabel: 'Ready for Pickup',
      statusBadgeVariant: 'primary',
      fulfillmentType: 'pickup',
      fulfillmentLabel: 'Store Pickup',
      placedAt: 'Today, 9:50 AM',
      estimatedDelivery: 'Ready for Counter Collection',
      deliveredAt: null,
      subtotal: 310,
      deliveryFee: 0,
      discount: 0,
      platformFee: 0,
      total: 310,
      paymentMethod: 'Cash on Counter',
      paymentDetails: 'Pay at Store Desk',
      paymentStatus: 'PENDING',
      invoiceNumber: '#INV-99010',
      customer: {
        id: 'cust_vikram',
        name: 'Vikram Joshi',
        phone: '+91 98203 11990',
        email: 'vikram.j@example.com',
        pastOrdersCount: 8,
        address: 'Self Pickup at Store Bay',
        landmark: 'Counter Bay 1',
        customerNote: 'Will pick up during lunch hour.',
      },
      deliveryPartner: null,
      items: [
        {
          id: 'item_21',
          productId: 'shm_prod_amul_taaza',
          title: 'Amul Taaza Homogenised Toned Milk',
          unit: '1 Litre Pouch',
          quantity: 2,
          price: 55,
          total: 110,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
        },
        {
          id: 'item_22',
          productId: 'shm_prod_tata_salt',
          title: 'Tata Salt Vacuum Evaporated Iodised Salt',
          unit: '1 kg Pouch',
          quantity: 2,
          price: 26,
          total: 52,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1Xj_e_y_Z9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
        },
        {
          id: 'item_23',
          productId: 'shm_prod_thums_up_cola',
          title: 'Thums Up Charged Strong Cola Beverage',
          unit: '750 ml Bottle',
          quantity: 2,
          price: 40,
          total: 80,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1UVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuV',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '9:50 AM', completed: true },
        { step: 2, label: 'Confirmed by Store', time: '9:52 AM', completed: true },
        { step: 3, label: 'Packed & Staged', time: '10:05 AM', completed: true },
        { step: 4, label: 'Ready for Counter Pickup', time: '10:10 AM', completed: true, current: true, note: 'Awaiting customer arrival' },
        { step: 5, label: 'Picked Up', time: 'Pending', completed: false },
      ],
    },
    {
      id: 'LC-10475',
      orderNumber: '#LC-10475',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'Out for Delivery',
      statusBadgeVariant: 'warning',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Local Delivery',
      placedAt: 'Today, 9:20 AM',
      estimatedDelivery: 'Today, 9:55 AM',
      deliveredAt: null,
      subtotal: 510,
      deliveryFee: 25,
      discount: 0,
      platformFee: 0,
      total: 535,
      paymentMethod: 'UPI',
      paymentDetails: 'Paytm • ananyaiyer@paytm',
      paymentStatus: 'PAID',
      invoiceNumber: '#INV-99005',
      customer: {
        id: 'cust_ananya',
        name: 'Ananya Iyer',
        phone: '+91 98204 77661',
        email: 'ananya.iyer@example.com',
        pastOrdersCount: 15,
        address: 'Villa 8, Green Glen Layout, Bellandur / Koramangala Outer Ring, Bangalore',
        landmark: 'Opposite Shell Fuel Station',
        customerNote: 'Leave at security gate if not answering.',
      },
      deliveryPartner: {
        name: 'Ramesh Kumar',
        initials: 'RK',
        phone: '+91 98205 33445',
        role: 'Dedicated Store Delivery Partner',
        vehicle: 'Ather 450X (KA-01-EQ-4492)',
        status: 'En route with package',
      },
      items: [
        {
          id: 'item_31',
          productId: 'shm_prod_fortune_oil',
          title: 'Fortune Sunlite Refined Sunflower Oil',
          unit: '1 Litre Pouch',
          quantity: 3,
          price: 138,
          total: 414,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1WWaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00112233445566778899aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
        },
        {
          id: 'item_32',
          productId: 'shm_prod_brown_bread',
          title: 'Modern 100% Whole Wheat Brown Bread',
          unit: '400 g Loaf',
          quantity: 1,
          price: 52,
          total: 52,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '9:20 AM', completed: true },
        { step: 2, label: 'Confirmed by Store', time: '9:22 AM', completed: true },
        { step: 3, label: 'Packed & Staged', time: '9:35 AM', completed: true },
        { step: 4, label: 'Dispatched to Rider', time: '9:40 AM', completed: true },
        { step: 5, label: 'Out for Delivery', time: '9:42 AM', completed: true, current: true, note: 'Rider Ramesh Kumar en route' },
        { step: 6, label: 'Delivered', time: 'Pending', completed: false },
      ],
    },
    {
      id: 'LC-10461',
      orderNumber: '#LC-10461',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'DELIVERED',
      statusLabel: 'Delivered',
      statusBadgeVariant: 'success',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Store Delivery',
      placedAt: 'Yesterday, 4:15 PM',
      estimatedDelivery: 'Yesterday, 4:50 PM',
      deliveredAt: 'Yesterday, 4:42 PM',
      subtotal: 408,
      deliveryFee: 20,
      discount: 0,
      platformFee: 0,
      total: 428,
      paymentMethod: 'Card',
      paymentDetails: 'Visa ending in •••• 4291',
      paymentStatus: 'PAID',
      invoiceNumber: '#INV-88741',
      customer: {
        id: 'cust_amit',
        name: 'Amit Trivedi',
        phone: '+91 98201 44829',
        email: 'amit.trivedi@example.com',
        pastOrdersCount: 6,
        address: 'Flat 402, Shree Ganesh Heights, Koramangala 4th Block',
        landmark: 'Near BDA Complex',
      },
      deliveryPartner: {
        name: 'Ramesh Kumar',
        initials: 'RK',
        phone: '+91 98205 33445',
        role: 'Store Associate Delivery',
      },
      items: [
        {
          id: 'item_41',
          productId: 'shm_prod_aashirvaad_atta',
          title: 'Aashirvaad Superior MP Shudh Chakki Atta',
          unit: '5 kg Pack',
          quantity: 1,
          price: 245,
          total: 245,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1V1q4rT8T03L38g2sK4j_x_8Xp-g8T4gG-v38aC4P1K0x8a1b0c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0',
        },
        {
          id: 'item_42',
          productId: 'shm_prod_amul_taaza',
          title: 'Amul Taaza Homogenised Toned Milk',
          unit: '1 Litre Pouch',
          quantity: 2,
          price: 55,
          total: 110,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '4:15 PM', completed: true },
        { step: 2, label: 'Confirmed by Store', time: '4:18 PM', completed: true },
        { step: 3, label: 'Packed & Dispatched', time: '4:28 PM', completed: true },
        { step: 4, label: 'Out for Delivery', time: '4:32 PM', completed: true },
        { step: 5, label: 'Delivered', time: '4:42 PM', completed: true, current: true },
      ],
    },
    {
      id: 'LC-10450',
      orderNumber: '#LC-10450',
      storeId: 'store_01',
      storeName: 'Sharma Supermarket',
      status: 'CANCELLED',
      statusLabel: 'Cancelled',
      statusBadgeVariant: 'error',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Local Delivery',
      placedAt: '2 days ago',
      estimatedDelivery: null,
      deliveredAt: null,
      subtotal: 210,
      deliveryFee: 0,
      discount: 0,
      platformFee: 0,
      total: 210,
      paymentMethod: 'UPI',
      paymentDetails: 'Refunded to UPI',
      paymentStatus: 'REFUNDED',
      invoiceNumber: '#INV-99001',
      cancelReason: 'Out of Stock - Cannot Substitute',
      customer: {
        id: 'cust_sneha',
        name: 'Sneha Verma',
        phone: '+91 98201 22334',
        email: 'sneha.v@example.com',
        pastOrdersCount: 2,
        address: 'Flat 101, Lakeview Apts, Koramangala 1st Block',
      },
      deliveryPartner: null,
      items: [
        {
          id: 'item_51',
          productId: 'shm_prod_brown_bread',
          title: 'Modern 100% Whole Wheat Brown Bread',
          unit: '400 g Loaf',
          quantity: 4,
          price: 52,
          total: 208,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '11:15 AM', completed: true },
        { step: 2, label: 'Cancelled by Store (Out of Stock)', time: '11:20 AM', completed: true, current: true },
      ],
    },
  ],

  store_02: [
    {
      id: 'LC-10482',
      orderNumber: '#LC-10482',
      storeId: 'store_02',
      storeName: 'Shree Kirana & General Store',
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'Out for Delivery',
      statusBadgeVariant: 'warning',
      fulfillmentType: 'delivery',
      fulfillmentLabel: 'Store Delivery',
      placedAt: 'Today, 8:05 PM',
      estimatedDelivery: 'Today, 8:45 PM (~15 mins)',
      deliveredAt: null,
      subtotal: 156,
      deliveryFee: 20,
      discount: 0,
      platformFee: 0,
      total: 176,
      paymentMethod: 'UPI',
      paymentDetails: 'Google Pay • amittrivedi@oksbi',
      paymentStatus: 'PAID',
      invoiceNumber: '#INV-88912',
      customer: {
        id: 'cust_amit',
        name: 'Amit Trivedi',
        phone: '+91 98201 44829',
        email: 'amit.trivedi@example.com',
        pastOrdersCount: 8,
        address: 'Flat 402, Shree Ganesh Heights, Ram Maruti Road, Panch Pakhadi, Thane West',
        landmark: 'Opposite Saraswati High School Ground',
        customerNote: 'Ring bell twice, leave with tower security if unavailable',
      },
      deliveryPartner: {
        name: 'Rahul Patil',
        initials: 'RP',
        phone: '+91 98201 44829',
        role: 'Dedicated Shree Kirana Delivery Partner',
        vehicle: 'TVS Jupiter (MH-04-AB-9821)',
        status: 'On the way with thermal grocery bag',
      },
      items: [
        {
          id: 'item_61',
          productId: 'shr_prod_amul_taaza',
          title: 'Amul Taaza Homogenised Toned Milk',
          unit: '1 Litre Pouch',
          quantity: 1,
          price: 54,
          total: 54,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
        },
        {
          id: 'item_62',
          productId: 'shr_prod_brown_bread',
          title: 'Modern 100% Whole Wheat Brown Bread',
          unit: '400 g Loaf',
          quantity: 1,
          price: 50,
          total: 50,
          image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
        },
      ],
      timeline: [
        { step: 1, label: 'Order Placed', time: '8:05 PM', completed: true },
        { step: 2, label: 'Order Confirmed by Shree Kirana', time: '8:08 PM', completed: true },
        { step: 3, label: 'Preparing & Packed', time: '8:20 PM', completed: true },
        { step: 4, label: 'Ready for Dispatch', time: '8:26 PM', completed: true },
        { step: 5, label: 'Out for Delivery', time: '8:31 PM', completed: true, current: true, note: 'Rider Rahul Patil is en route' },
        { step: 6, label: 'Delivered', time: 'Est. 8:45 PM', completed: false },
      ],
    },
  ],
};

const INITIAL_CUSTOMER_METRICS = {
  cust_sharma: {
    notes: [
      { id: 'note_1', text: 'Prefers morning delivery slots before 11 AM.', author: 'Vikram Malhotra', date: 'Sep 02, 2026' },
      { id: 'note_2', text: 'Requested paper bags rather than plastic.', author: 'Suresh Sharma', date: 'Aug 20, 2026' },
    ],
    tags: ['Gold Tier', 'Morning Shopper', 'Regular Dairy'],
  },
  cust_priya: {
    notes: [
      { id: 'note_3', text: 'Call upon arrival at main gate security.', author: 'Vikram Malhotra', date: 'Sep 05, 2026' },
    ],
    tags: ['Returning Customer', 'Express Orders'],
  },
  cust_vikram: {
    notes: [],
    tags: ['Self Pickup', 'Lunchtime Counter'],
  },
  cust_ananya: {
    notes: [
      { id: 'note_4', text: 'VIP high-basket customer. Verified address.', author: 'Suresh Sharma', date: 'Sep 01, 2026' },
    ],
    tags: ['VIP Customer', 'High Basket Value'],
  },
  cust_amit: {
    notes: [
      { id: 'note_5', text: 'Doorbell is loud, kindly ring only once.', author: 'Sunil Chawla', date: 'Aug 14, 2026' },
    ],
    tags: ['Regular Buyer', 'UPI Preferred'],
  },
  cust_sneha: {
    notes: [],
    tags: ['New Customer'],
  },
};

const OperationsContext = createContext(null);

export function OperationsProvider({ children }) {
  const { currentStore } = useCatalog();

  // Multi-store orders state
  const [ordersMap, setOrdersMap] = useState(INITIAL_STORE_ORDERS);

  // Store-specific customer relationship metadata (notes, tags)
  const [customerMeta, setCustomerMeta] = useState(INITIAL_CUSTOMER_METRICS);

  // Store staff list
  const [staffList, setStaffList] = useState(MOCK_STAFF);

  // Active store's orders
  const storeOrders = useMemo(() => {
    return ordersMap[currentStore.id] || [];
  }, [ordersMap, currentStore.id]);

  // Active store's staff
  const storeStaff = useMemo(() => {
    return staffList.filter((s) => s.storeId === currentStore.id);
  }, [staffList, currentStore.id]);

  // Active store's customers (computed from customers who have orders in this store)
  const storeCustomers = useMemo(() => {
    const customerMap = new Map();

    storeOrders.forEach((order) => {
      const c = order.customer;
      if (!c) return;

      const existing = customerMap.get(c.id) || {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.placedAt,
        status: 'Active',
        tags: customerMeta[c.id]?.tags || ['Regular'],
        notes: customerMeta[c.id]?.notes || [],
      };

      existing.totalOrders += 1;
      if (order.status !== 'CANCELLED') {
        existing.totalSpent += order.total;
      }
      customerMap.set(c.id, existing);
    });

    return Array.from(customerMap.values());
  }, [storeOrders, customerMeta]);

  /**
   * Transition order status forward
   */
  const updateOrderStatus = (orderId, nextStatus, extra = {}, targetStoreId = null) => {
    setOrdersMap((prev) => {
      // Find the store that holds this order
      let resolvedStoreId = targetStoreId || currentStore.id;
      if (!prev[resolvedStoreId]?.some((o) => o.id === orderId)) {
        for (const [sKey, oList] of Object.entries(prev)) {
          if (oList.some((o) => o.id === orderId)) {
            resolvedStoreId = sKey;
            break;
          }
        }
      }

      const storeList = prev[resolvedStoreId] || [];
      const updatedList = storeList.map((order) => {
        if (order.id === orderId) {
          // Guard: Cannot transition backwards or change terminal statuses
          if (order.status === 'DELIVERED' || order.status === 'PICKED_UP') {
            console.warn(`Cannot change status of already completed order ${orderId} (${order.status})`);
            return order;
          }
          if (order.status === 'CANCELLED') {
            console.warn(`Cannot change status of cancelled order ${orderId}`);
            return order;
          }

          // Label and badge variant mapping
          let statusLabel = nextStatus;
          let statusBadgeVariant = 'info';

          if (nextStatus === 'CONFIRMED') {
            statusLabel = 'Confirmed';
            statusBadgeVariant = 'info';
          } else if (nextStatus === 'PREPARING') {
            statusLabel = 'Processing';
            statusBadgeVariant = 'info';
          } else if (nextStatus === 'READY') {
            statusLabel = 'Ready for Dispatch';
            statusBadgeVariant = 'primary';
          } else if (nextStatus === 'READY_FOR_PICKUP') {
            statusLabel = 'Ready for Pickup';
            statusBadgeVariant = 'primary';
          } else if (nextStatus === 'OUT_FOR_DELIVERY') {
            statusLabel = 'Out for Delivery';
            statusBadgeVariant = 'warning';
          } else if (nextStatus === 'DELIVERED') {
            statusLabel = 'Delivered';
            statusBadgeVariant = 'success';
          } else if (nextStatus === 'PICKED_UP') {
            statusLabel = 'Picked Up';
            statusBadgeVariant = 'success';
          } else if (nextStatus === 'CANCELLED') {
            statusLabel = 'Cancelled';
            statusBadgeVariant = 'error';
          }

          // Timeline progression
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newTimeline = (order.timeline || []).map((step) => {
            const stepLabelLower = step.label.toLowerCase();
            const nextStatusLower = nextStatus.toLowerCase();
            const isMatch =
              stepLabelLower.includes(nextStatusLower) ||
              (nextStatus === 'READY_FOR_PICKUP' && stepLabelLower.includes('pickup') && stepLabelLower.includes('ready')) ||
              (nextStatus === 'PICKED_UP' && stepLabelLower.includes('picked up')) ||
              (nextStatus === 'READY' && (stepLabelLower.includes('dispatch') || stepLabelLower.includes('ready'))) ||
              (nextStatus === 'DELIVERED' && (stepLabelLower.includes('handover') || stepLabelLower.includes('delivered')));
            if (isMatch) {
              return { ...step, completed: true, current: true, time: nowTime };
            }
            return step;
          });

          return {
            ...order,
            status: nextStatus,
            statusLabel,
            statusBadgeVariant,
            deliveredAt: nextStatus === 'DELIVERED' ? `Today, ${nowTime}` : order.deliveredAt,
            ...extra,
            timeline: newTimeline,
          };
        }
        return order;
      });

      return {
        ...prev,
        [resolvedStoreId]: updatedList,
      };
    });
  };

  /**
   * Assign Delivery Partner to an Order
   */
  const assignRider = (orderId, riderData) => {
    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', {
      deliveryPartner: riderData,
    });
  };

  /**
   * Cancel an order with reason
   */
  const cancelOrder = (orderId, reason) => {
    setOrdersMap((prev) => {
      const storeList = prev[currentStore.id] || [];
      const updatedList = storeList.map((order) => {
        if (order.id === orderId) {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...order,
            status: 'CANCELLED',
            statusLabel: 'Cancelled',
            statusBadgeVariant: 'error',
            cancelReason: reason,
            timeline: [
              ...(order.timeline || []),
              {
                step: (order.timeline?.length || 0) + 1,
                label: `Cancelled by Store (${reason})`,
                time: nowTime,
                completed: true,
                current: true,
              },
            ],
          };
        }
        return order;
      });

      return {
        ...prev,
        [currentStore.id]: updatedList,
      };
    });
  };

  /**
   * Customer Notes & Tags
   */
  const addCustomerNote = (customerId, noteText) => {
    const newNote = {
      id: `note_${Date.now()}`,
      text: noteText,
      author: 'Store Staff',
      date: 'Today',
    };

    setCustomerMeta((prev) => {
      const existing = prev[customerId] || { notes: [], tags: [] };
      return {
        ...prev,
        [customerId]: {
          ...existing,
          notes: [newNote, ...existing.notes],
        },
      };
    });
  };

  const addCustomerTag = (customerId, tag) => {
    setCustomerMeta((prev) => {
      const existing = prev[customerId] || { notes: [], tags: [] };
      if (existing.tags.includes(tag)) return prev;
      return {
        ...prev,
        [customerId]: {
          ...existing,
          tags: [...existing.tags, tag],
        },
      };
    });
  };

  /**
   * Staff Operations (Add, Update, Toggle, Remove)
   */
  const addStaff = (staffData) => {
    const newStaff = {
      id: `staff_${Date.now()}`,
      storeId: currentStore.id,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role || 'Staff',
      roleLabel: staffData.roleLabel || `${staffData.role} Associate`,
      roleBadgeVariant:
        staffData.role === 'Owner'
          ? 'primary'
          : staffData.role === 'Manager'
          ? 'info'
          : staffData.role === 'Delivery Staff'
          ? 'warning'
          : 'neutral',
      scope: staffData.scope || 'Store Floor Operations',
      status: 'Active',
      avatar: staffData.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      joinedDate: 'Today',
      lastActive: 'Just now',
      deliveriesCount: 0,
    };

    setStaffList((prev) => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaff = (staffId, updates) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, ...updates } : s))
    );
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const removeStaff = (staffId) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
  };

  const value = {
    ordersMap,
    staffList,
    storeOrders,
    updateOrderStatus,
    assignRider,
    cancelOrder,
    storeCustomers,
    addCustomerNote,
    addCustomerTag,
    storeStaff,
    addStaff,
    updateStaff,
    toggleStaffStatus,
    removeStaff,
  };

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
