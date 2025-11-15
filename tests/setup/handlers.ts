import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for KbStore API
 *
 * These handlers provide realistic mock responses for integration tests.
 * Handlers are generated based on the API contract and can be customized
 * per test using server.use() in individual test files.
 */

const API_URL = 'http://localhost:5000/api';

// In-memory data stores for integration tests
let productsStore: any[] = [
  {
    productId: '1',
    sku: 'MTR-X500',
    name: 'Brushless Motor X500',
    dimensions: { width: 2.5, length: 3.0, height: 1.5, weight: 0.3 },
    quantity: 45,
    inventoryId: 'inv-001',
    stockThreshold: 10,
    leadTime: '12:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-15T10:30:00.0000000Z',
    updatedOn: '2024-02-20T14:22:18.1234567Z'
  },
  {
    productId: '2',
    sku: 'PROP-A450',
    name: 'Carbon Fiber Propeller 4.5"',
    dimensions: { width: 4.5, length: 4.5, height: 0.2, weight: 0.05 },
    quantity: 120,
    inventoryId: 'inv-002',
    stockThreshold: 20,
    leadTime: '06:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-10T08:15:00.0000000Z',
    updatedOn: '2024-02-18T09:45:30.5678901Z'
  },
  {
    productId: '3',
    sku: 'ESC-PRO60',
    name: 'Electronic Speed Controller 60A',
    dimensions: { width: 1.8, length: 2.2, height: 0.8, weight: 0.15 },
    quantity: 8,
    inventoryId: 'inv-003',
    stockThreshold: 15,
    leadTime: '24:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: false,
    createdOn: '2024-01-20T12:00:00.0000000Z',
    updatedOn: '2024-02-25T16:30:45.9876543Z'
  },
  {
    productId: '4',
    sku: 'BATT-3S2200',
    name: 'LiPo Battery 3S 2200mAh',
    dimensions: { width: 1.2, length: 4.0, height: 0.9, weight: 0.18 },
    quantity: 62,
    inventoryId: 'inv-004',
    stockThreshold: 25,
    leadTime: '18:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-05T14:45:00.0000000Z',
    updatedOn: '2024-02-22T11:10:20.2468135Z'
  },
  {
    productId: '5',
    sku: 'FRAME-250',
    name: 'Racing Frame 250mm',
    dimensions: { width: 10.0, length: 10.0, height: 2.5, weight: 0.45 },
    quantity: 35,
    inventoryId: 'inv-005',
    stockThreshold: 8,
    leadTime: '48:00:00',
    isStocked: true,
    isEnabled: false,
    isAvailable: false,
    createdOn: '2024-01-12T09:20:00.0000000Z',
    updatedOn: '2024-02-19T13:55:12.7531864Z'
  },
  {
    productId: '6',
    sku: 'CAM-HD720',
    name: 'FPV Camera 720p',
    dimensions: { width: 0.8, length: 1.2, height: 0.8, weight: 0.02 },
    quantity: 0,
    inventoryId: null,
    stockThreshold: null,
    leadTime: null,
    isStocked: false,
    isEnabled: false,
    isAvailable: false,
    createdOn: '2024-01-08T16:00:00.0000000Z',
    updatedOn: '2024-02-15T10:30:00.1357924Z'
  },
  {
    productId: '7',
    sku: 'RX-FRSKY',
    name: 'FrSky Receiver',
    dimensions: { width: 1.0, length: 1.5, height: 0.3, weight: 0.01 },
    quantity: 88,
    inventoryId: 'inv-007',
    stockThreshold: 30,
    leadTime: '08:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-18T11:30:00.0000000Z',
    updatedOn: '2024-02-28T15:20:40.9012345Z'
  },
  {
    productId: '8',
    sku: 'SERVO-MG90',
    name: 'Micro Servo MG90S',
    dimensions: { width: 0.9, length: 1.1, height: 0.5, weight: 0.014 },
    quantity: 150,
    inventoryId: 'inv-008',
    stockThreshold: 40,
    leadTime: '04:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-03T07:15:00.0000000Z',
    updatedOn: '2024-02-24T08:40:55.6543210Z'
  }
];

let inventoryStore: any[] = [
  {
    id: '1',
    partNumber: 'MOTOR-001',
    description: 'Brushless Motor Stock',
    quantity: 100,
    location: 'Warehouse A'
  }
];

export const handlers = [
  // Products endpoints
  http.get(`${API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '25');

    const start = page * size;
    const end = start + size;
    const results = productsStore.slice(start, end);

    return HttpResponse.json({
      totalItems: productsStore.length,
      page: page,
      size: size,
      results: results
    });
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = productsStore.find(p => p.id === params.id);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.post(`${API_URL}/products`, async ({ request }) => {
    const payload = (await request.json()) as any;
    const newProduct = {
      id: String(productsStore.length + 1),
      ...payload,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    productsStore.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.put(`${API_URL}/products/:id`, async ({ params, request }) => {
    const payload = (await request.json()) as any;
    const index = productsStore.findIndex(p => p.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    productsStore[index] = {
      ...productsStore[index],
      ...payload,
      updatedAt: new Date()
    };
    return HttpResponse.json(productsStore[index]);
  }),

  http.delete(`${API_URL}/products/:id`, ({ params }) => {
    const index = productsStore.findIndex(p => p.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    productsStore.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/products/:id/enable`, ({ params }) => {
    const product = productsStore.find(p => p.id === params.id);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    product.enabled = true;
    product.updatedAt = new Date();
    return HttpResponse.json(product);
  }),

  http.post(`${API_URL}/products/:id/disable`, ({ params }) => {
    const product = productsStore.find(p => p.id === params.id);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    product.enabled = false;
    product.updatedAt = new Date();
    return HttpResponse.json(product);
  }),

  // Inventory endpoints
  http.get(`${API_URL}/inventory`, () => {
    return HttpResponse.json(inventoryStore);
  }),

  http.get(`${API_URL}/inventory/:id`, ({ params }) => {
    const item = inventoryStore.find(i => i.id === params.id);
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  http.post(`${API_URL}/inventory`, async ({ request }) => {
    const payload = (await request.json()) as any;
    const newItem = {
      id: String(inventoryStore.length + 1),
      ...payload
    };
    inventoryStore.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  })
];

/**
 * Reset stores to initial state
 * Call this in test setup to ensure clean state
 */
export function resetStores() {
  productsStore = [
    {
      productId: '1',
      sku: 'MTR-X500',
      name: 'Brushless Motor X500',
      dimensions: { width: 2.5, length: 3.0, height: 1.5, weight: 0.3 },
      quantity: 45,
      inventoryId: 'inv-001',
      stockThreshold: 10,
      leadTime: '12:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: true,
      createdOn: '2024-01-15T10:30:00.0000000Z',
      updatedOn: '2024-02-20T14:22:18.1234567Z'
    },
    {
      productId: '2',
      sku: 'PROP-A450',
      name: 'Carbon Fiber Propeller 4.5"',
      dimensions: { width: 4.5, length: 4.5, height: 0.2, weight: 0.05 },
      quantity: 120,
      inventoryId: 'inv-002',
      stockThreshold: 20,
      leadTime: '06:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: true,
      createdOn: '2024-01-10T08:15:00.0000000Z',
      updatedOn: '2024-02-18T09:45:30.5678901Z'
    },
    {
      productId: '3',
      sku: 'ESC-PRO60',
      name: 'Electronic Speed Controller 60A',
      dimensions: { width: 1.8, length: 2.2, height: 0.8, weight: 0.15 },
      quantity: 8,
      inventoryId: 'inv-003',
      stockThreshold: 15,
      leadTime: '24:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: false,
      createdOn: '2024-01-20T12:00:00.0000000Z',
      updatedOn: '2024-02-25T16:30:45.9876543Z'
    },
    {
      productId: '4',
      sku: 'BATT-3S2200',
      name: 'LiPo Battery 3S 2200mAh',
      dimensions: { width: 1.2, length: 4.0, height: 0.9, weight: 0.18 },
      quantity: 62,
      inventoryId: 'inv-004',
      stockThreshold: 25,
      leadTime: '18:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: true,
      createdOn: '2024-01-05T14:45:00.0000000Z',
      updatedOn: '2024-02-22T11:10:20.2468135Z'
    },
    {
      productId: '5',
      sku: 'FRAME-250',
      name: 'Racing Frame 250mm',
      dimensions: { width: 10.0, length: 10.0, height: 2.5, weight: 0.45 },
      quantity: 35,
      inventoryId: 'inv-005',
      stockThreshold: 8,
      leadTime: '48:00:00',
      isStocked: true,
      isEnabled: false,
      isAvailable: false,
      createdOn: '2024-01-12T09:20:00.0000000Z',
      updatedOn: '2024-02-19T13:55:12.7531864Z'
    },
    {
      productId: '6',
      sku: 'CAM-HD720',
      name: 'FPV Camera 720p',
      dimensions: { width: 0.8, length: 1.2, height: 0.8, weight: 0.02 },
      quantity: 0,
      inventoryId: null,
      stockThreshold: null,
      leadTime: null,
      isStocked: false,
      isEnabled: false,
      isAvailable: false,
      createdOn: '2024-01-08T16:00:00.0000000Z',
      updatedOn: '2024-02-15T10:30:00.1357924Z'
    },
    {
      productId: '7',
      sku: 'RX-FRSKY',
      name: 'FrSky Receiver',
      dimensions: { width: 1.0, length: 1.5, height: 0.3, weight: 0.01 },
      quantity: 88,
      inventoryId: 'inv-007',
      stockThreshold: 30,
      leadTime: '08:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: true,
      createdOn: '2024-01-18T11:30:00.0000000Z',
      updatedOn: '2024-02-28T15:20:40.9012345Z'
    },
    {
      productId: '8',
      sku: 'SERVO-MG90',
      name: 'Micro Servo MG90S',
      dimensions: { width: 0.9, length: 1.1, height: 0.5, weight: 0.014 },
      quantity: 150,
      inventoryId: 'inv-008',
      stockThreshold: 40,
      leadTime: '04:00:00',
      isStocked: true,
      isEnabled: true,
      isAvailable: true,
      createdOn: '2024-01-03T07:15:00.0000000Z',
      updatedOn: '2024-02-24T08:40:55.6543210Z'
    }
  ];

  inventoryStore = [
    {
      id: '1',
      partNumber: 'MOTOR-001',
      description: 'Brushless Motor Stock',
      quantity: 100,
      location: 'Warehouse A'
    }
  ];
}
