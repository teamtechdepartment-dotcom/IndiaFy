import { performance } from 'perf_hooks';
import { getRecommendations } from './services/recommendation.service.js';
import mongoose from 'mongoose';

// Mock dependencies
import Product from './models/products/product.model.js';
import locationService from './services/location.service.js';
import * as interactionService from './services/interaction.service.js';

// Setup Mock Data
const mockNodes = [
  { _id: new mongoose.Types.ObjectId(), distanceMeters: 1000 }, // 1km
  { _id: new mongoose.Types.ObjectId(), distanceMeters: 3000 }, // 3km
];

const mockCandidates = [
  {
    _id: new mongoose.Types.ObjectId(),
    productName: "Wireless Headphones X",
    categoryName: "Electronics",
    brand: "Sony",
    totalSales: 1000,
    totalViews: 5000,
    nodeId: mockNodes[0]._id,
    stock: 50,
    lowStockThreshold: 5,
    isActive: true,
    status: "ACTIVE",
    isDeleted: false
  },
  {
    _id: new mongoose.Types.ObjectId(),
    productName: "Running Shoes Y",
    categoryName: "Footwear",
    brand: "Nike",
    totalSales: 200,
    totalViews: 1000,
    nodeId: mockNodes[1]._id,
    stock: 2,
    lowStockThreshold: 5,
    isActive: true,
    status: "ACTIVE",
    isDeleted: false
  },
  {
    _id: new mongoose.Types.ObjectId(),
    productName: "Generic Electronics",
    categoryName: "Electronics",
    brand: "Generic",
    totalSales: 5000,
    totalViews: 20000,
    nodeId: new mongoose.Types.ObjectId(), // outside 5km
    stock: 0, // out of stock
    lowStockThreshold: 5,
    isActive: true,
    status: "ACTIVE",
    isDeleted: false
  }
];

// Apply Mocks
let mongoOpCount = 0;

locationService.getNearbySellerNodes = async () => {
    mongoOpCount++;
    return mockNodes;
};

interactionService.getCombinedInterestProfile = async () => {
    mongoOpCount++;
    return {
        sessionInterest: { products: [], brands: [{ id: "sony", score: 1.0 }], categories: [] },
        persistentInterest: { products: [], brands: [], categories: [{ id: "electronics", score: 0.8 }] }
    };
};

Product.aggregate = async (pipeline) => {
    mongoOpCount++;
    // Simulate latency
    await new Promise(r => setTimeout(r, 10));
    
    // Simulate pipeline behavior
    const hasSearch = pipeline[0].$match.$text;
    const hasNodeFilter = pipeline[0].$match.nodeId;
    
    let res = [...mockCandidates];
    
    if (hasNodeFilter) {
        const validIds = pipeline[0].$match.nodeId.$in.map(id => id.toString());
        res = res.filter(c => validIds.includes(c.nodeId.toString()));
    }
    
    if (hasSearch) {
        res.forEach(c => c.textScore = 1.0);
    }
    
    return res;
};

async function runBenchmark(name, req, iterations = 20) {
    console.log(`\n--- BENCHMARK: ${name} ---`);
    const latencies = [];
    mongoOpCount = 0; // reset

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await getRecommendations(req);
        const end = performance.now();
        latencies.push(end - start);
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / iterations;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(iterations * 0.5)];
    const p95 = latencies[Math.floor(iterations * 0.95)];
    
    // Single run to get query count
    const opsPerRequest = mongoOpCount / iterations;

    console.log(`Operations/Req: ${opsPerRequest}`);
    console.log(`Avg: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${min.toFixed(2)}ms`);
    console.log(`Max: ${max.toFixed(2)}ms`);
    console.log(`p50: ${p50.toFixed(2)}ms`);
    console.log(`p95: ${p95.toFixed(2)}ms`);
}

async function execute() {
    await runBenchmark("Anonymous Homepage", { latitude: 28.7, longitude: 77.1 });
    await runBenchmark("Authenticated Homepage", { latitude: 28.7, longitude: 77.1, customerId: "auth123" });
    await runBenchmark("Anonymous Search", { latitude: 28.7, longitude: 77.1, searchQuery: "wireless headphones" });
    await runBenchmark("Authenticated Search", { latitude: 28.7, longitude: 77.1, customerId: "auth123", searchQuery: "wireless headphones" });
    await runBenchmark("Location Disabled", { customerId: "auth123" });
}

execute();
