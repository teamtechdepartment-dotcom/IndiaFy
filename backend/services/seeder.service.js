import mongoose from "mongoose";
import Category from "../models/products/category.model.js";
import SubCategory from "../models/products/subCategory.model.js";
import Product from "../models/products/product.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";

// Helper to generate SEO friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// Seeder products definition
const PRODUCT_TEMPLATES = [
  {
    name: "Aashirvaad Atta 5kg",
    brand: "Aashirvaad",
    category: "Grocery",
    subCategory: "Atta & Flour",
    weight: "5kg",
    unit: "kg",
    mrp: 290,
    price: 260,
    hsn: "11010000",
    gst: 0,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Premium stone-ground whole wheat flour for soft rotis.",
    description: "Aashirvaad Whole Wheat Atta is made from the finest grains - heavy on the palm, golden amber in color, and hard in bite. It is ground using modern chakki process which ensures that the rotis remain soft and fluffy for a longer period.",
    images: [
      "https://images.unsplash.com/photo-1574325131876-a79997887d4a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "India Gate Basmati Rice 5kg",
    brand: "India Gate",
    category: "Grocery",
    subCategory: "Rice & Grains",
    weight: "5kg",
    unit: "kg",
    mrp: 650,
    price: 585,
    hsn: "10063010",
    gst: 0,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Aromatic and extra-long grain basmati rice.",
    description: "India Gate Basmati Rice Feast Rozzana is a premium quality aged basmati rice. Ideal for everyday dishes like pulao, biryani, and jeera rice. Its sweet taste and rich aroma make every meal special.",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591813902994-bc1b2ad7fc42?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598463289946-3b7f9c8d558b?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Fortune Sunflower Oil 1L",
    brand: "Fortune",
    category: "Grocery",
    subCategory: "Oils & Ghee",
    weight: "1L",
    unit: "L",
    mrp: 175,
    price: 149,
    hsn: "15121910",
    gst: 5,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Light and healthy refined sunflower oil for cooking.",
    description: "Fortune Refined Sunflower Oil is a healthy and nutritious cooking oil. Rich in vitamins and consisting mainly of polyunsaturated fatty acids, it is light, easy to digest and helps keep your heart healthy.",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620706857370-e1b977f7f13d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622484211148-717df3e6594d?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Tata Salt 1kg",
    brand: "Tata",
    category: "Grocery",
    subCategory: "Salt & Sugar",
    weight: "1kg",
    unit: "kg",
    mrp: 28,
    price: 25,
    hsn: "25010021",
    gst: 0,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Desh ka Namak - Iodized vacuum evaporated salt.",
    description: "Tata Salt has been a trusted staple in Indian households for decades. It is iodized to support health and vacuum-evaporated to ensure purity and uniform saltiness.",
    images: [
      "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Maggi 2-Minute Noodles",
    brand: "Nestle",
    category: "Snacks",
    subCategory: "Noodles",
    weight: "280g",
    unit: "pcs",
    mrp: 56,
    price: 52,
    hsn: "19023010",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "India's favorite instant masala noodles.",
    description: "Maggi 2-Minute Masala Noodles is the ultimate comfort food for millions of Indians. Prepared with a unique blend of 12 roasted spices, it offers a quick, delicious snack anytime of the day.",
    images: [
      "https://images.unsplash.com/photo-1612966608997-30794915839e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Amul Gold Milk 1L",
    brand: "Amul",
    category: "Dairy",
    subCategory: "Milk",
    weight: "1L",
    unit: "L",
    mrp: 66,
    price: 64,
    hsn: "04012000",
    gst: 0,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Fresh pasteurized full cream milk.",
    description: "Amul Gold full cream milk is pasteurized and homogenized, providing maximum cream and richness. Excellent for making tea, coffee, curd, desserts, and directly drinking.",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600718374662-0483d2b9da44?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Amul Butter 500g",
    brand: "Amul",
    category: "Dairy",
    subCategory: "Butter & Cheese",
    weight: "500g",
    unit: "pcs",
    mrp: 275,
    price: 258,
    hsn: "04051000",
    gst: 12,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Utterly Butterly Delicious pasteurized salted butter.",
    description: "Amul Salted Butter is made from fresh cream and has been a favorite spread in India for over 50 years. Add delicious flavor to your toast, parathas, baking, and general cooking.",
    images: [
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621528659556-9d32d0d5718a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610440042657-612c34dbf53e?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Britannia Good Day Biscuits",
    brand: "Britannia",
    category: "Snacks",
    subCategory: "Biscuits & Cookies",
    weight: "200g",
    unit: "pcs",
    mrp: 40,
    price: 35,
    hsn: "19053100",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Butter cookies loaded with cashew and almond nuts.",
    description: "Britannia Good Day Butter Cookies are tasty cashew nuts cookies, perfect to pair with tea, coffee, or a glass of hot milk.",
    images: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548940740-204726a19db3?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Parle-G Biscuits",
    brand: "Parle",
    category: "Snacks",
    subCategory: "Biscuits & Cookies",
    weight: "250g",
    unit: "pcs",
    mrp: 20,
    price: 18,
    hsn: "19053100",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "G maane Genius - Original glucose biscuits.",
    description: "Parle-G has been India's favorite tea-time biscuit for generations. Packed with milk and wheat, it is a healthy source of nutrition and energy.",
    images: [
      "https://images.unsplash.com/photo-1603532648955-039310d9ed75?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Oreo Vanilla Biscuits",
    brand: "Oreo",
    category: "Snacks",
    subCategory: "Biscuits & Cookies",
    weight: "120g",
    unit: "pcs",
    mrp: 35,
    price: 30,
    hsn: "19053100",
    gst: 18,
    isFeatured: true,
    isBestseller: false,
    shortDescription: "Twist, Lick, and Dunk vanilla cream cookies.",
    description: "Oreo is a delicious sandwich cookie consisting of two chocolate wafers with a sweet vanilla cream filling. Twist it, lick it, and dunk it in milk!",
    images: [
      "https://images.unsplash.com/photo-1551842340-e24c52044810?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528659555-528659555-528659555-528659555?q=80"
    ]
  },
  {
    name: "Coca Cola 750ml",
    brand: "Coca Cola",
    category: "Beverages",
    subCategory: "Soft Drinks",
    weight: "750ml",
    unit: "pcs",
    mrp: 45,
    price: 40,
    hsn: "22021010",
    gst: 28,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Original taste refreshing carbonated soft drink.",
    description: "Coca-Cola is the world's favorite soft drink, offering a crisp, refreshing, and unique cola taste. Best enjoyed ice-cold with meals or during celebrations.",
    images: [
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Pepsi 750ml",
    brand: "Pepsi",
    category: "Beverages",
    subCategory: "Soft Drinks",
    weight: "750ml",
    unit: "pcs",
    mrp: 45,
    price: 40,
    hsn: "22021010",
    gst: 28,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Bold and sweet carbonated beverage.",
    description: "Pepsi is a delicious and refreshing carbonated soft drink with a bold cola flavor. Perfectly complements spicy snacks and meals.",
    images: [
      "https://images.unsplash.com/photo-1534080391095-718a3e7127c5?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567103472667-6898f3a83cf2?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Sprite 750ml",
    brand: "Sprite",
    category: "Beverages",
    subCategory: "Soft Drinks",
    weight: "750ml",
    unit: "pcs",
    mrp: 45,
    price: 40,
    hsn: "22021010",
    gst: 28,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Clear lemon-lime carbonated soft drink.",
    description: "Sprite is a crisp, refreshing, lemon-lime flavored soft drink. It is caffeine-free and offers a burst of citrus refreshment.",
    images: [
      "https://images.unsplash.com/photo-1625772291326-50b38e0b4ae7?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Real Mixed Fruit Juice 1L",
    brand: "Real",
    category: "Beverages",
    subCategory: "Juices",
    weight: "1L",
    unit: "pcs",
    mrp: 130,
    price: 110,
    hsn: "20098990",
    gst: 12,
    isFeatured: true,
    isBestseller: false,
    shortDescription: "Richness of 9 nutritious fruits in one pack.",
    description: "Real Fruit Power Mixed Fruit Juice contains the goodness of 9 fruits - orange, apple, pineapple, guava, apricot, mango, peach, papaya, and banana, offering pure energy and refreshment.",
    images: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Red Label Tea 500g",
    brand: "Brooke Bond",
    category: "Beverages",
    subCategory: "Tea & Coffee",
    weight: "500g",
    unit: "pcs",
    mrp: 220,
    price: 199,
    hsn: "09024020",
    gst: 5,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "High-quality blend of tea leaves for a perfect cup.",
    description: "Brooke Bond Red Label Tea is a blend of tea leaves sourced from selected gardens, bringing together taste, color, and aroma to offer the perfect cup of chai.",
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Nescafe Classic Coffee 100g",
    brand: "Nestle",
    category: "Beverages",
    subCategory: "Tea & Coffee",
    weight: "100g",
    unit: "pcs",
    mrp: 320,
    price: 299,
    hsn: "21011110",
    gst: 5,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "100% pure instant coffee powder.",
    description: "NESCAFE Classic instant coffee powder is made from handpicked Robusta beans, slow-roasted to bring out a rich coffee aroma and an unmistakable smooth taste.",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Colgate Strong Teeth Toothpaste",
    brand: "Colgate",
    category: "Personal Care",
    subCategory: "Oral Care",
    weight: "200g",
    unit: "pcs",
    mrp: 120,
    price: 99,
    hsn: "33061020",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Calcium-rich formula for strong teeth and fresh breath.",
    description: "Colgate Strong Teeth is India's most trusted toothpaste. Formulated with Amino-Shakti, it helps add natural calcium to your teeth, strengthening them and protecting against cavities.",
    images: [
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593487568522-746db8894941?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Lux Soap",
    brand: "Lux",
    category: "Personal Care",
    subCategory: "Soaps & Shampoos",
    weight: "100g * 3",
    unit: "pcs",
    mrp: 110,
    price: 98,
    hsn: "34011110",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Lux Soft Touch beauty bar soap with rose water.",
    description: "Lux Soft Touch soap is infused with moisturizing Silk Essence and French Rose fragrance, leaving your skin feeling soft, smooth, and delicately scented.",
    images: [
      "https://images.unsplash.com/photo-1607006342411-9a3363f63ba2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Dove Shampoo",
    brand: "Dove",
    category: "Personal Care",
    subCategory: "Soaps & Shampoos",
    weight: "650ml",
    unit: "pcs",
    mrp: 550,
    price: 460,
    hsn: "33051090",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Intense Repair shampoo for damaged hair.",
    description: "Dove Intense Repair Shampoo contains Fiber Actives that penetrate deep inside the hair fiber, restoring damaged structure and reducing hair breakage.",
    images: [
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Clinic Plus Shampoo",
    brand: "Clinic Plus",
    category: "Personal Care",
    subCategory: "Soaps & Shampoos",
    weight: "340ml",
    unit: "pcs",
    mrp: 195,
    price: 175,
    hsn: "33051090",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Strong & Long Health shampoo with Milk Protein.",
    description: "Clinic Plus Strong & Long Health Shampoo nourishes hair from roots to tips. Infused with milk protein, it makes hair up to 35 times stronger and long.",
    images: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Dettol Antiseptic Liquid",
    brand: "Dettol",
    category: "Personal Care",
    subCategory: "Antiseptics",
    weight: "500ml",
    unit: "pcs",
    mrp: 233,
    price: 215,
    hsn: "38089400",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Trusted antiseptic disinfectant liquid.",
    description: "Dettol Antiseptic Disinfectant Liquid is a safe and gentle antiseptic that kills germs and protects against infection. Use for first aid, medical sanitation, and personal hygiene.",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616671276441-2f4c174ead0c?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Harpic Toilet Cleaner",
    brand: "Harpic",
    category: "Household",
    subCategory: "Toilet & Floor Cleaners",
    weight: "1L",
    unit: "pcs",
    mrp: 215,
    price: 185,
    hsn: "34029099",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Disinfectant toilet cleaner for 10x stain removal.",
    description: "Harpic Power Plus is a highly effective toilet cleaning liquid that kills 99.9% of germs, removes tough yellow scale, and leaves your toilet fresh.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585837575652-267c0ee123ff?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528740561666-ac2479603522?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Surf Excel Easy Wash",
    brand: "Surf Excel",
    category: "Household",
    subCategory: "Detergents & Soaps",
    weight: "1kg",
    unit: "kg",
    mrp: 140,
    price: 125,
    hsn: "34029049",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Daag acche hain - Premium detergent powder.",
    description: "Surf Excel Easy Wash is a superfine powder that dissolves easily and removes tough grease and mud stains, keeping clothes looking clean and bright.",
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510440847474-747474747474?q=80",
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Vim Dishwash Liquid",
    brand: "Vim",
    category: "Household",
    subCategory: "Dishwashers",
    weight: "500ml",
    unit: "pcs",
    mrp: 115,
    price: 99,
    hsn: "34029099",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Power of 100 lemons dishwashing gel.",
    description: "Vim Dishwash Gel with lemon extract is a concentrated liquid that cuts through tough grease easily without scratching or leaving any residue on utensils.",
    images: [
      "https://images.unsplash.com/photo-1585837575652-267c0ee123ff?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528740561666-ac2479603522?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Rin Detergent Bar",
    brand: "Rin",
    category: "Household",
    subCategory: "Detergents & Soaps",
    weight: "250g * 4",
    unit: "pcs",
    mrp: 80,
    price: 72,
    hsn: "34011911",
    gst: 18,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Detergent soap bar for white and bright clothes.",
    description: "Rin Detergent Bar brings clean brightness to your clothes. Scrub on collars and cuffs to dissolve yellowing and stubborn marks easily.",
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510440847474-747474747474?q=80"
    ]
  },
  {
    name: "Lizol Floor Cleaner",
    brand: "Lizol",
    category: "Household",
    subCategory: "Toilet & Floor Cleaners",
    weight: "975ml",
    unit: "pcs",
    mrp: 209,
    price: 189,
    hsn: "38089400",
    gst: 18,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Disinfectant surface cleaner killing 99.9% germs.",
    description: "Lizol Disinfectant Floor Cleaner is recommended by the Indian Medical Association. It provides 10 times better germ protection and leaves a pleasant floral fragrance.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528740561666-ac2479603522?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585837575652-267c0ee123ff?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Everest Garam Masala",
    brand: "Everest",
    category: "Grocery",
    subCategory: "Masalas & Spices",
    weight: "100g",
    unit: "pcs",
    mrp: 88,
    price: 79,
    hsn: "09109100",
    gst: 5,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "Perfect blend of aromatic spices for rich flavor.",
    description: "Everest Garam Masala is a signature blend of roasted ground spices. Added towards the end of cooking to infuse curry dishes with warm, rich, aromatic flavors.",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Catch Black Pepper",
    brand: "Catch",
    category: "Grocery",
    subCategory: "Masalas & Spices",
    weight: "100g",
    unit: "pcs",
    mrp: 110,
    price: 95,
    hsn: "09041130",
    gst: 5,
    isFeatured: false,
    isBestseller: false,
    shortDescription: "Freshly ground premium quality black pepper.",
    description: "Catch Black Pepper Powder is sourced from the best plantations in India. Ground at low temperatures to retain its natural oils, spicy kick, and fine aroma.",
    images: [
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Saffola Oats",
    brand: "Saffola",
    category: "Grocery",
    subCategory: "Oats & Breakfast",
    weight: "1kg",
    unit: "kg",
    mrp: 185,
    price: 155,
    hsn: "11042200",
    gst: 5,
    isFeatured: false,
    isBestseller: true,
    shortDescription: "100% natural rolled oats for healthy breakfast.",
    description: "Saffola Oats are made from high-quality whole grain oats. Rich in dietary fiber and protein, it helps manage cholesterol and offers a light, creamy breakfast bowl.",
    images: [
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Paper Boat Aamras",
    brand: "Paper Boat",
    category: "Beverages",
    subCategory: "Juices",
    weight: "250ml",
    unit: "pcs",
    mrp: 40,
    price: 35,
    hsn: "22029920",
    gst: 12,
    isFeatured: true,
    isBestseller: true,
    shortDescription: "Delicious sweet mango juice drink.",
    description: "Paper Boat Aamras is made from high-quality mango pulp. No added preservatives, colors, or carbonation. Relive the nostalgic taste of home-made mango juice.",
    images: [
      "https://images.unsplash.com/photo-1534080506375-15e05203360b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop"
    ]
  }
];

// Seed Category definition
const CATEGORIES_DATA = [
  {
    name: "Grocery",
    sku: "CAT-GRO",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400",
    subCategories: [
      { name: "Atta & Flour", sku: "SC-GRO-ATTA", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400" },
      { name: "Rice & Grains", sku: "SC-GRO-RICE", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400" },
      { name: "Oils & Ghee", sku: "SC-GRO-OIL", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400" },
      { name: "Salt & Sugar", sku: "SC-GRO-SALT", image: "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?q=80&w=400" },
      { name: "Masalas & Spices", sku: "SC-GRO-SPICE", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400" },
      { name: "Oats & Breakfast", sku: "SC-GRO-OATS", image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=400" }
    ]
  },
  {
    name: "Dairy",
    sku: "CAT-DAI",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400",
    subCategories: [
      { name: "Milk", sku: "SC-DAI-MILK", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400" },
      { name: "Butter & Cheese", sku: "SC-DAI-BUTTER", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400" }
    ]
  },
  {
    name: "Beverages",
    sku: "CAT-BEV",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400",
    subCategories: [
      { name: "Soft Drinks", sku: "SC-BEV-SOFT", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400" },
      { name: "Juices", sku: "SC-BEV-JUICE", image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400" },
      { name: "Tea & Coffee", sku: "SC-BEV-TEA", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400" }
    ]
  },
  {
    name: "Snacks",
    sku: "CAT-SNA",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?q=80&w=400",
    subCategories: [
      { name: "Biscuits & Cookies", sku: "SC-SNA-BISC", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400" },
      { name: "Noodles", sku: "SC-SNA-NOODLE", image: "https://images.unsplash.com/photo-1612966608997-30794915839e?q=80&w=400" }
    ]
  },
  {
    name: "Household",
    sku: "CAT-HOU",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400",
    subCategories: [
      { name: "Toilet & Floor Cleaners", sku: "SC-HOU-CLEAN", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400" },
      { name: "Detergents & Soaps", sku: "SC-HOU-DET", image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=400" },
      { name: "Dishwashers", sku: "SC-HOU-DISH", image: "https://images.unsplash.com/photo-1585837575652-267c0ee123ff?q=80&w=400" }
    ]
  },
  {
    name: "Personal Care",
    sku: "CAT-PER",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=400",
    subCategories: [
      { name: "Oral Care", sku: "SC-PER-ORAL", image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=400" },
      { name: "Soaps & Shampoos", sku: "SC-PER-SOAP", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400" },
      { name: "Antiseptics", sku: "SC-PER-ANTI", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400" }
    ]
  }
];

export const seedDatabase = async (force = false) => {
  try {

    // Find the dynamic store named Sharma Mart or fall back to any available seller node
    let sharmaMart = await SellerNode.findOne({ storeName: /Sharma Mart/i });
    if (!sharmaMart) {
      sharmaMart = await SellerNode.findOne({ status: "ACTIVE" }) || await SellerNode.findOne({});
    }
    if (!sharmaMart) {
      return { success: false, message: "No seller node found in DB to seed products." };
    }

    const nodeId = sharmaMart._id;
    const sellerId = sharmaMart.seller;
    const nodeType = sharmaMart.nodeType || "LOCAL_RETAIL";

    // Check if products already exist for this store to prevent duplicate seeding
    const existingCount = await Product.countDocuments({ nodeId });
    if (existingCount > 0 && !force) {
      return { success: true, message: `Store already seeded with ${existingCount} products. Skipping.`, count: existingCount };
    }

    // 1. Seed Categories & Subcategories
    console.log("Seeding Categories & Subcategories...");
    const categoryIdMap = {}; // name -> _id
    const subCategoryIdMap = {}; // name -> _id

    for (const catData of CATEGORIES_DATA) {
      let dbCat = await Category.findOne({ categoryName: catData.name });
      if (!dbCat) {
        dbCat = await Category.create({
          categoryName: catData.name,
          categoryImage: catData.image,
          skuId: catData.sku,
          visible: true,
          seoTitle: `${catData.name} Store`,
          seoDescription: `Shop best ${catData.name} items online`
        });
        console.log(`Created Category: ${catData.name}`);
      }
      categoryIdMap[catData.name] = dbCat._id;

      // Seed Subcategories
      for (const subData of catData.subCategories) {
        let dbSub = await SubCategory.findOne({ subCategoryName: subData.name });
        if (!dbSub) {
          dbSub = await SubCategory.create({
            categoryId: dbCat._id,
            subCategoryName: subData.name,
            subCategoryImage: subData.image,
            subSkuId: subData.sku
          });
          console.log(`Created SubCategory: ${subData.name}`);
        }
        subCategoryIdMap[subData.name] = dbSub._id;
      }
    }

    // 2. Seed Products
    console.log(`Seeding 30+ products for node ${nodeId}...`);
    let seedCount = 0;

    for (let i = 0; i < PRODUCT_TEMPLATES.length; i++) {
      const pTemp = PRODUCT_TEMPLATES[i];
      const sku = `SM-${pTemp.brand.substring(0, 3).toUpperCase()}-${(i + 1).toString().padStart(3, "0")}`;
      
      // Generate EAN-13 style Barcode starting with 890 (India)
      const barcode = `8901031${(100000 + i).toString()}`;

      // Check if product with this SKU already exists
      const existingProduct = await Product.findOne({ productSkuId: sku });
      if (existingProduct) {
        // If force, we can update or delete, but generally we avoid duplicates.
        if (force) {
          await Product.deleteOne({ productSkuId: sku });
        } else {
          console.log(`Product with SKU ${sku} already exists, skipping.`);
          continue;
        }
      }

      const slug = slugify(`${pTemp.name}-${sku}`);
      
      // Generate random stock between 50 and 300
      const stock = Math.floor(Math.random() * (300 - 50 + 1)) + 50;

      // Calculate discount percentage
      const discountPercentage = Math.round(((pTemp.mrp - pTemp.price) / pTemp.mrp) * 100);

      const productDoc = new Product({
        sellerId: sellerId,
        nodeId: nodeId,
        nodeType: nodeType,
        categoryName: pTemp.category,
        subCategoryId: subCategoryIdMap[pTemp.subCategory],
        productName: pTemp.name,
        slug: slug,
        productSkuId: sku,
        brand: pTemp.brand,
        barcode: barcode,
        hsnCode: pTemp.hsn,
        gstPercentage: pTemp.gst,
        shortDescription: pTemp.shortDescription,
        description: pTemp.description,
        productImage: pTemp.images,
        thumbnail: pTemp.images[0],
        stock: stock,
        lowStockThreshold: 10,
        attribute: {
          salePrice: pTemp.price,
          mrpPrice: pTemp.mrp,
          weight: pTemp.weight,
          quantity: stock.toString()
        },
        discountPercentage: discountPercentage,
        unit: pTemp.unit,
        isFeatured: pTemp.isFeatured,
        isBestseller: pTemp.isBestseller,
        isActive: true,
        isPublished: true,
        isDeleted: false
      });

      await productDoc.save();
      seedCount++;
    }

    console.log(`Successfully seeded ${seedCount} products into Sharma Mart!`);
    return { success: true, message: `Successfully seeded ${seedCount} products.`, count: seedCount };

  } catch (err) {
    console.error("❌ Error seeding database:", err);
    throw err;
  }
};
