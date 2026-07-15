/**
 * HubCart2 – Wholesale B2B Product Seeder
 * Seller ID : 6a25505dcf857699dbbcb09c
 * Node ID   : 6a55f16463f0294a125fae0f
 * Node Type : WHOLESALE_B2B
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/products/product.model.js";

dotenv.config();

const SELLER_ID = new mongoose.Types.ObjectId("6a25505dcf857699dbbcb09c");
const NODE_ID   = new mongoose.Types.ObjectId("6a55f16463f0294a125fae0f");
const NODE_TYPE = "WHOLESALE_B2B";

const sl = (t) => t.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^\w-]+/g,"");

const products = [
  {
    productName:"Daawat Rozana Basmati Rice 26kg Wholesale Sack",
    slug:sl("daawat-rozana-basmati-rice-26kg"),
    productSkuId:"HBC2-RICE-001",barcode:"8901030813017",brand:"Daawat",
    categoryName:"Grocery",hsnCode:"10063010",unit:"kg",
    shortDescription:"Premium aged Basmati rice in a 26 kg wholesale sack — ideal for restaurants, caterers, and bulk retailers.",
    description:"Daawat Rozana Basmati Rice is sourced from the fertile plains of Punjab and Haryana, aged for a minimum of 12 months to develop its signature aroma and elongated grain structure. The grain's low starch content ensures individual non-sticky grains perfect for biryani, pulao, and jeera rice. Moisture tested below 12% and free from added colour or artificial aroma. Double-sealed sack retains freshness from warehouse to retail shelf. Packed under FSSAI registration with a dedicated quality batch code for full traceability. Ideal for grocery wholesalers, kiranas, and cloud kitchens. Min order 5 sacks. Carton equivalent 26 kg per unit.",
    isFeatured:true,isBestseller:true,stock:240,
    attribute:{salePrice:1690,mrpPrice:1950,weight:"26 kg",quantity:"240"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:5,minimumOrderValue:8450,
    gstPercentage:0,cartonQuantity:1,
    bulkPricing:[{minQty:5,maxQty:19,pricePerUnit:1690},{minQty:20,maxQty:49,pricePerUnit:1650},{minQty:50,maxQty:999,pricePerUnit:1610}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"HDPE Sack",
    ratingAverage:4.7,ratingCount:312,
    productImage:["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1536304993881-ff86e0c9b4a5?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1596560548464-f010aa9098a8?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80"
  },
  {
    productName:"Aashirvaad Select Sharbati Atta 50kg Wholesale Bag",
    slug:sl("aashirvaad-select-sharbati-atta-50kg"),
    productSkuId:"HBC2-ATTA-002",barcode:"8901030007018",brand:"Aashirvaad",
    categoryName:"Grocery",hsnCode:"11010000",unit:"kg",
    shortDescription:"Stone-ground premium Sharbati wheat atta in a 50 kg bulk bag for bakeries, restaurants, and wholesale traders.",
    description:"Aashirvaad Select Sharbati Atta is crafted from handpicked Sharbati wheat prized for its natural sweetness and superior gluten strength. The modern chakki-grinding process preserves the bran layer ensuring high dietary fibre and a rich golden colour. Each 50 kg wholesale bag features a sturdy multi-wall kraft-PE laminated construction keeping flour moisture-free for up to 9 months. Ideal for commercial kitchens, sweets factories, dhaba chains, and bulk grocery distributors. Free from bleaching agents, bromates, or artificial additives. FSSAI certified and batch-coded. Full pallet of 32 bags available on advance booking.",
    isFeatured:true,isBestseller:true,stock:185,
    attribute:{salePrice:1780,mrpPrice:1999,weight:"50 kg",quantity:"185"},
    discountPercentage:11,isWholesale:true,minimumOrderQty:2,minimumOrderValue:3560,
    gstPercentage:0,cartonQuantity:1,
    bulkPricing:[{minQty:2,maxQty:9,pricePerUnit:1780},{minQty:10,maxQty:31,pricePerUnit:1740},{minQty:32,maxQty:999,pricePerUnit:1700}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Kraft-PE Bag",
    ratingAverage:4.8,ratingCount:476,
    productImage:["https://images.unsplash.com/photo-1574325131876-a79997887d4a?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1612257999756-8e9e99c18a05?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1574325131876-a79997887d4a?w=400&q=80"
  },
  {
    productName:"Tata Sampann Chana Dal 30kg Wholesale Pack",
    slug:sl("tata-sampann-chana-dal-30kg"),
    productSkuId:"HBC2-DAL-003",barcode:"8901256080036",brand:"Tata Sampann",
    categoryName:"Grocery",hsnCode:"07132010",unit:"kg",
    shortDescription:"Unpolished Chana Dal retaining natural protein and minerals — 30 kg wholesale pack for traders and institutions.",
    description:"Tata Sampann Chana Dal is sourced from certified farms and processed with the brand's signature unpolished technology retaining the natural bran layer, ensuring maximum protein around 17g per 100g and dietary fibre. The wholesale 30 kg pack uses food-grade woven PP bags with inner polyethylene, preventing moisture ingress and insect contamination. Ideal for mid-size grocery stores, school canteens, hospital kitchens, and daal-mill operators. Sorted by advanced optical sorters for uniformity. No artificial colour or polish added. Shelf life 12 months. Each unit carries a printed lot number for full supply-chain traceability.",
    isFeatured:false,isBestseller:true,stock:160,
    attribute:{salePrice:1950,mrpPrice:2199,weight:"30 kg",quantity:"160"},
    discountPercentage:11,isWholesale:true,minimumOrderQty:3,minimumOrderValue:5850,
    gstPercentage:0,cartonQuantity:1,
    bulkPricing:[{minQty:3,maxQty:9,pricePerUnit:1950},{minQty:10,maxQty:29,pricePerUnit:1900},{minQty:30,maxQty:999,pricePerUnit:1860}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Woven PP Bag",
    ratingAverage:4.6,ratingCount:198,
    productImage:["https://images.unsplash.com/photo-1585153557695-fb1c5e113715?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1585153557695-fb1c5e113715?w=400&q=80"
  },
  {
    productName:"Fortune Kachi Ghani Mustard Oil 15L Wholesale Tin",
    slug:sl("fortune-kachi-ghani-mustard-oil-15l"),
    productSkuId:"HBC2-OIL-004",barcode:"8901030806026",brand:"Fortune",
    categoryName:"Grocery",hsnCode:"15141910",unit:"L",
    shortDescription:"Cold-pressed Kachi Ghani mustard oil in a 15 L metal tin — perfect for kirana and HORECA wholesale supply.",
    description:"Fortune Kachi Ghani Mustard Oil is cold-pressed using traditional methods preserving the natural glucosinolates giving it a characteristic pungency and golden-yellow colour prized in North and East Indian cuisine. The 15 L tin features a lacquered interior preventing metal-leach into the oil and a friction-seal lid for repeated opening in commercial kitchens. Rich in MUFA and PUFA with an ideal Omega-3 to Omega-6 ratio. Certified by AGMARK Grade-1 and compliant with PFA standards. Suitable for deep frying, tempering, pickling, and hair use. Shelf life 9 months. Wholesale availability in multiples of 4 tins (60 L).",
    isFeatured:true,isBestseller:true,stock:180,
    attribute:{salePrice:1749,mrpPrice:1999,weight:"15 L",quantity:"180"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:4,minimumOrderValue:6996,
    gstPercentage:5,cartonQuantity:4,
    bulkPricing:[{minQty:4,maxQty:11,pricePerUnit:1749},{minQty:12,maxQty:35,pricePerUnit:1700},{minQty:36,maxQty:999,pricePerUnit:1660}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Metal Tin",
    ratingAverage:4.7,ratingCount:387,
    productImage:["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1620706857370-e1b977f7f13d?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1548783300-4d5e4e3c7a34?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80"
  },
  {
    productName:"Uttam Sugar Refined White Sugar 50kg Wholesale Bag",
    slug:sl("uttam-sugar-refined-white-sugar-50kg"),
    productSkuId:"HBC2-SUGAR-005",barcode:"8906020990503",brand:"Uttam Sugar",
    categoryName:"Grocery",hsnCode:"17019100",unit:"kg",
    shortDescription:"S-30 grade premium refined white sugar — 50 kg bulk bag for sweet shops, bakeries, and FMCG distributors.",
    description:"Uttam Sugar S-30 Refined White Sugar is produced using state-of-the-art triple carbonatation and sulphitation refining delivering consistent ICUMSA 45 whiteness and maximum 99.7% sucrose purity. The 50 kg multi-wall paper bag with inner polyethylene moisture barrier is designed for ambient warehouse storage up to 24 months. Free from anti-caking agents. Suitable for confectionery, beverages, pharmaceuticals, and direct retail. Packed under FSSAI Lic with batch traceability. One of India's top 10 sugar producers. Bulk pallet of 50 bags available on bulk order.",
    isFeatured:false,isBestseller:true,stock:210,
    attribute:{salePrice:1990,mrpPrice:2150,weight:"50 kg",quantity:"210"},
    discountPercentage:7,isWholesale:true,minimumOrderQty:2,minimumOrderValue:3980,
    gstPercentage:5,cartonQuantity:1,
    bulkPricing:[{minQty:2,maxQty:9,pricePerUnit:1990},{minQty:10,maxQty:49,pricePerUnit:1950},{minQty:50,maxQty:999,pricePerUnit:1920}],
    dispatchSLA:"48 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Multi-wall Paper Bag",
    ratingAverage:4.5,ratingCount:143,
    productImage:["https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80"
  },
  {
    productName:"Tata Salt Lite Low-Sodium Iodized Salt 1kg x50 Case",
    slug:sl("tata-salt-lite-1kg-50-case"),
    productSkuId:"HBC2-SALT-006",barcode:"8901431112245",brand:"Tata",
    categoryName:"Grocery",hsnCode:"25010021",unit:"case",
    shortDescription:"50-unit wholesale case of Tata Salt Lite — reduced sodium iodized salt for health-conscious consumer markets.",
    description:"Tata Salt Lite contains 15% less sodium than regular table salt, making it the first choice of health-aware urban retailers and medical-nutrition distributors. Each 1 kg pouch uses vacuum-evaporation technology to yield uniform free-flowing crystals with consistent iodine levels at 15 PPM minimum. The 50-piece wholesale case is shrink-wrapped and palletised for easy fork-lift handling. Iodisation compliant with Prevention of Food Adulteration Act and WHO guidelines. Ideal for modern trade chains, hospital supply, and e-grocery platforms. Shelf life 36 months. Each pallet holds 40 cases.",
    isFeatured:false,isBestseller:true,stock:420,
    attribute:{salePrice:1050,mrpPrice:1150,weight:"50 kg",quantity:"420"},
    discountPercentage:9,isWholesale:true,minimumOrderQty:10,minimumOrderValue:10500,
    gstPercentage:0,cartonQuantity:50,
    bulkPricing:[{minQty:10,maxQty:49,pricePerUnit:1050},{minQty:50,maxQty:99,pricePerUnit:1020},{minQty:100,maxQty:999,pricePerUnit:990}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shrink-wrapped Case",
    ratingAverage:4.6,ratingCount:267,
    productImage:["https://images.unsplash.com/photo-1618042164219-62c820f10723?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1618042164219-62c820f10723?w=400&q=80"
  },
  {
    productName:"Tata Tea Gold Leaf Tea 1kg x12 Wholesale Box",
    slug:sl("tata-tea-gold-1kg-12-box"),
    productSkuId:"HBC2-TEA-007",barcode:"8901272019032",brand:"Tata Tea",
    categoryName:"Beverages",hsnCode:"09024090",unit:"box",
    shortDescription:"Premium Assam CTC and long-leaf blend — 12-unit wholesale box of Tata Tea Gold 1 kg for grocery distribution.",
    description:"Tata Tea Gold is a blend of 30% long-leaf Assam tea and 70% premium CTC, delivering a rich robust liquor with a refreshing aroma that has made it the No. 1 tea brand in India by retail volume. Each 1 kg foil-sealed pouch retains freshness for 24 months and the 12-pouch wholesale display box is ready for shelf-stacking or sub-distribution. Suitable for chain grocery stores, dhabas, corporate canteens, and vending machine operators. Sourced from certified gardens in Upper Assam. FSSAI certified with national recall-code traceability on every batch. High-velocity SKU typically turning within 2 weeks in modern trade.",
    isFeatured:true,isBestseller:true,stock:320,
    attribute:{salePrice:3120,mrpPrice:3480,weight:"12 kg",quantity:"320"},
    discountPercentage:10,isWholesale:true,minimumOrderQty:3,minimumOrderValue:9360,
    gstPercentage:5,cartonQuantity:12,
    bulkPricing:[{minQty:3,maxQty:9,pricePerUnit:3120},{minQty:10,maxQty:24,pricePerUnit:3060},{minQty:25,maxQty:999,pricePerUnit:3000}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Foil-sealed Display Box",
    ratingAverage:4.8,ratingCount:892,
    productImage:["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"
  },
  {
    productName:"Nescafe Classic Instant Coffee 200g x24 Wholesale Case",
    slug:sl("nescafe-classic-200g-24-jar-wholesale"),
    productSkuId:"HBC2-COFF-008",barcode:"8901030792368",brand:"Nescafe",
    categoryName:"Beverages",hsnCode:"21011100",unit:"case",
    shortDescription:"24-jar wholesale case of Nescafe Classic 200 g — the iconic instant coffee for modern trade and institutional supply.",
    description:"Nescafe Classic is crafted from a carefully selected blend of Robusta and Arabica beans, freeze-dried to capture the full depth of coffee flavour in every cup. Each 200 g glass jar features a tamper-evident metal lid and aroma-retention inner foil seal ensuring product integrity across long supply chains. The 24-jar display-ready case is the standard wholesale unit for supermarket buyers and institutional procurement. Dissolves instantly in hot or cold water making it the top choice for office pantries, fast-food counters, and vending operations. Caffeine content approximately 65 mg per 200 mL serving. Shelf life 24 months. Sourced from Nestle India's Nanjangud plant in Karnataka.",
    isFeatured:true,isBestseller:true,stock:150,
    attribute:{salePrice:8400,mrpPrice:9600,weight:"4.8 kg",quantity:"150"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:2,minimumOrderValue:16800,
    gstPercentage:18,cartonQuantity:24,
    bulkPricing:[{minQty:2,maxQty:5,pricePerUnit:8400},{minQty:6,maxQty:11,pricePerUnit:8200},{minQty:12,maxQty:999,pricePerUnit:8000}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Display-ready Case",
    ratingAverage:4.9,ratingCount:1180,
    productImage:["https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1598908314732-07113901949e?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&q=80"
  },
  {
    productName:"Everest Tikhalal Red Chilli Powder 500g x24 Wholesale Box",
    slug:sl("everest-tikhalal-red-chilli-powder-500g-24"),
    productSkuId:"HBC2-SPICE-009",barcode:"8906002220012",brand:"Everest",
    categoryName:"Grocery",hsnCode:"09042110",unit:"box",
    shortDescription:"Deep-red Tikhalal chilli powder with balanced heat — 24-pouch wholesale box for spice distributors.",
    description:"Everest Tikhalal Red Chilli Powder is ground from select varieties of sun-dried Byadgi and Mathania chillis, delivering a brilliant deep-red colour ASTA 90+ and moderate-to-high Scoville heat units ideal for Indian curries, marinades, and snack seasoning. Each 500 g foil-laminated pouch features nitrogen flushing to eliminate oxidation preserving the vibrant colour and essential oils for up to 18 months. The 24-pouch wholesale box is designed for quick-check shelf display and easy palletisation. No added colour, adulteration-free, and compliant with FSSAI and AGMARK Grade-1 standards. Ideal for masala manufacturers, restaurant chains, tiffin services, and retail grocery distributors.",
    isFeatured:false,isBestseller:true,stock:275,
    attribute:{salePrice:1980,mrpPrice:2280,weight:"12 kg",quantity:"275"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:5,minimumOrderValue:9900,
    gstPercentage:5,cartonQuantity:24,
    bulkPricing:[{minQty:5,maxQty:19,pricePerUnit:1980},{minQty:20,maxQty:49,pricePerUnit:1920},{minQty:50,maxQty:999,pricePerUnit:1870}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"N2-flushed Foil Box",
    ratingAverage:4.7,ratingCount:341,
    productImage:["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80"
  },
  {
    productName:"Happilo Premium Whole Cashews W240 1kg x12 Wholesale Case",
    slug:sl("happilo-premium-cashews-w240-1kg-12"),
    productSkuId:"HBC2-DRYFR-010",barcode:"8906015340121",brand:"Happilo",
    categoryName:"Grocery",hsnCode:"08013200",unit:"case",
    shortDescription:"W-240 whole cashew kernels in a 12-pack wholesale case — for gifting aggregators, bakeries, and dry-fruit retail.",
    description:"Happilo Premium W-240 Cashews are handpicked from the coastal cashew orchards of Goa, Kerala, and Tanzania, graded to the internationally recognised W-240 count indicating superior large kernel size. Each 1 kg vacuum-sealed pouch is packed in modified-atmosphere environment eliminating oxygen to prevent rancidity, retaining natural creaminess and mild-sweet flavour for up to 12 months. The 12-pouch wholesale case ships in a corrugated display-ready box designed for quick shelf deployment. Free from sulphur dioxide, added oils, and artificial flavours. Rich in zinc, magnesium, and heart-healthy MUFA. Ideal for premium kirana upgrades, gifting boxes, mithai shops, and health-food sections of modern trade.",
    isFeatured:true,isBestseller:false,stock:95,
    attribute:{salePrice:7980,mrpPrice:9480,weight:"12 kg",quantity:"95"},
    discountPercentage:16,isWholesale:true,minimumOrderQty:2,minimumOrderValue:15960,
    gstPercentage:12,cartonQuantity:12,
    bulkPricing:[{minQty:2,maxQty:5,pricePerUnit:7980},{minQty:6,maxQty:11,pricePerUnit:7700},{minQty:12,maxQty:999,pricePerUnit:7500}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"MAP Vacuum Pouch Case",
    ratingAverage:4.8,ratingCount:529,
    productImage:["https://images.unsplash.com/photo-1536304993881-ff86e0c9b4a5?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1574868498059-e6a16c3d6add?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1563729785453-6ad1f5f97e3e?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1536304993881-ff86e0c9b4a5?w=400&q=80"
  },
  {
    productName:"Parle-G Gold Glucose Biscuits 250g x48 Wholesale Case",
    slug:sl("parle-g-gold-glucose-biscuits-250g-48"),
    productSkuId:"HBC2-BISC-011",barcode:"8901050103040",brand:"Parle",
    categoryName:"Snacks",hsnCode:"19053100",unit:"case",
    shortDescription:"India's most iconic glucose biscuit — 48-pack wholesale case of Parle-G Gold 250 g for mass-market distribution.",
    description:"Parle-G Gold is the premium extension of India's best-selling biscuit brand, formulated with high-grade wheat flour, milk solids, and a touch of vanilla to deliver the distinctive Parle-G taste in a golden crisper form. Each 250 g pack contains individually-wrapped inner packets to maintain freshness and reduce breakage during transit. The 48-pack wholesale case is the standard replenishment unit for grocery chains, kiranas, and canteen contractors. Parle-G Gold delivers 4.2 g of protein and 72 kcal per 3-biscuit serving. Shelf life 9 months. Manufactured under Parle's HACCP-certified production lines. One of the highest-velocity SKUs in the Indian FMCG calendar.",
    isFeatured:false,isBestseller:true,stock:800,
    attribute:{salePrice:2640,mrpPrice:2880,weight:"12 kg",quantity:"800"},
    discountPercentage:8,isWholesale:true,minimumOrderQty:5,minimumOrderValue:13200,
    gstPercentage:18,cartonQuantity:48,
    bulkPricing:[{minQty:5,maxQty:19,pricePerUnit:2640},{minQty:20,maxQty:49,pricePerUnit:2580},{minQty:50,maxQty:999,pricePerUnit:2520}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Corrugated Display Case",
    ratingAverage:4.6,ratingCount:1140,
    productImage:["https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&q=80"
  },
  {
    productName:"Maggi 2-Minute Masala Noodles 70g x48 Wholesale Box",
    slug:sl("maggi-2-minute-masala-noodles-70g-48"),
    productSkuId:"HBC2-NOOD-012",barcode:"8901030677872",brand:"Maggi",
    categoryName:"Snacks",hsnCode:"19023010",unit:"box",
    shortDescription:"India's most beloved instant noodles — 48-unit wholesale box of Maggi 2-Minute Masala 70 g for retail and HORECA.",
    description:"Maggi 2-Minute Masala Noodles has dominated the Indian instant-noodle category for over 40 years. Each 70 g pack contains pre-steamed and dried noodle cake along with the iconic Masala Tastemaker sachet, a blend of 12 roasted spices and dehydrated vegetables delivering a rich tangy and addictively savoury flavour profile. The 48-pack wholesale box is the standard trade unit with shelf-ready secondary packaging option for gondola or counter display. Made at Nestle India's plants with zero trans-fat and complying with FSSAI food safety standards. Shelf life 12 months. One of the top-5 highest-velocity FMCG SKUs in India.",
    isFeatured:true,isBestseller:true,stock:650,
    attribute:{salePrice:1680,mrpPrice:1920,weight:"3.36 kg",quantity:"650"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:10,minimumOrderValue:16800,
    gstPercentage:18,cartonQuantity:48,
    bulkPricing:[{minQty:10,maxQty:29,pricePerUnit:1680},{minQty:30,maxQty:59,pricePerUnit:1640},{minQty:60,maxQty:999,pricePerUnit:1600}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shelf-ready Corrugated Box",
    ratingAverage:4.7,ratingCount:1190,
    productImage:["https://images.unsplash.com/photo-1612966608997-30794915839e?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1612966608997-30794915839e?w=400&q=80"
  },
  {
    productName:"Lifebuoy Total 10 Antibacterial Soap 125g x72 Wholesale Case",
    slug:sl("lifebuoy-total-10-soap-125g-72"),
    productSkuId:"HBC2-SOAP-013",barcode:"8901030752508",brand:"Lifebuoy",
    categoryName:"Personal Care",hsnCode:"34011130",unit:"case",
    shortDescription:"72-bar master case of Lifebuoy Total 10 Antibacterial Soap — 10 germ-protection claims for institutional supply.",
    description:"Lifebuoy Total 10 is India's No. 1 germ-protection soap, formulated with Activ Silver+ technology that fights 10 common germs and bacteria including E. coli, Staphylococcus aureus, and Salmonella with proven 99.9% germ-kill efficacy in clinical studies. Each 125 g bar features a firm long-lasting formulation with added moisturising agents preventing skin drying during frequent washing. The 72-bar wholesale master case is the standard bulk unit for hospitals, schools, corporate facilities, hotels, and mass-retail distributors. Each case contains 6 display-ready inner packs of 12 bars. Suitable for handwashing programme procurement and CSR health initiatives. Shelf life 36 months.",
    isFeatured:false,isBestseller:true,stock:560,
    attribute:{salePrice:2304,mrpPrice:2664,weight:"9 kg",quantity:"560"},
    discountPercentage:14,isWholesale:true,minimumOrderQty:5,minimumOrderValue:11520,
    gstPercentage:18,cartonQuantity:72,
    bulkPricing:[{minQty:5,maxQty:19,pricePerUnit:2304},{minQty:20,maxQty:49,pricePerUnit:2240},{minQty:50,maxQty:999,pricePerUnit:2180}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Master Carton",
    ratingAverage:4.7,ratingCount:748,
    productImage:["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1600857544200-b2f468e7f031?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80"
  },
  {
    productName:"Clinic Plus Strength Shine Shampoo 340ml x24 Wholesale Case",
    slug:sl("clinic-plus-strength-shine-shampoo-340ml-24"),
    productSkuId:"HBC2-SHMP-014",barcode:"8901030740475",brand:"Clinic Plus",
    categoryName:"Personal Care",hsnCode:"33051010",unit:"case",
    shortDescription:"24-bottle wholesale case of Clinic Plus Strength and Shine 340 ml — India's most trusted family shampoo.",
    description:"Clinic Plus Strength and Shine Shampoo is India's largest-selling shampoo by volume, trusted by over 100 million households. Enriched with milk protein and vitamins, it strengthens hair from root to tip, reducing breakage by up to 10x versus non-conditioning shampoo. Each 340 ml flip-top bottle features a tamper-evident seal. The 24-bottle wholesale case is standard for pharmacy chains, hair salons, beauty distributors, and FMCG modern-trade accounts. Suitable for all hair types and free from parabens. Formulated to a mild pH of 5.5. Shelf life 36 months from manufacture. Dispatch lead time 24 hours from confirmed order.",
    isFeatured:true,isBestseller:true,stock:310,
    attribute:{salePrice:3120,mrpPrice:3600,weight:"8.16 L",quantity:"310"},
    discountPercentage:13,isWholesale:true,minimumOrderQty:3,minimumOrderValue:9360,
    gstPercentage:18,cartonQuantity:24,
    bulkPricing:[{minQty:3,maxQty:9,pricePerUnit:3120},{minQty:10,maxQty:23,pricePerUnit:3040},{minQty:24,maxQty:999,pricePerUnit:2960}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Display Case",
    ratingAverage:4.5,ratingCount:621,
    productImage:["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1583864697784-a0efc8379f70?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80"
  },
  {
    productName:"Surf Excel Easy Wash Detergent Powder 4kg x6 Wholesale Case",
    slug:sl("surf-excel-easy-wash-4kg-6-wholesale"),
    productSkuId:"HBC2-DET-015",barcode:"8901030762361",brand:"Surf Excel",
    categoryName:"Household",hsnCode:"34024090",unit:"case",
    shortDescription:"6-pack wholesale case of Surf Excel Easy Wash 4 kg — India's leading detergent with advanced stain-removal technology.",
    description:"Surf Excel Easy Wash Detergent Powder is formulated with Dirt Magnets Technology that lifts and captures stubborn stains including turmeric, mud, ketchup, and oil in just a single wash even in cold water. Each 4 kg multi-wall paper box is designed for both front-load and top-load machines as well as hand-washing. The 6-pack wholesale case is the standard replenishment unit for supermarkets, general trade, and institutional laundry service providers. Phosphate-free and biodegradable surfactant blend complying with BIS IS 4955. Provides up to 80 washes per 4 kg pack. Shelf life 24 months. Manufactured by Hindustan Unilever Limited.",
    isFeatured:false,isBestseller:true,stock:390,
    attribute:{salePrice:2760,mrpPrice:3060,weight:"24 kg",quantity:"390"},
    discountPercentage:10,isWholesale:true,minimumOrderQty:4,minimumOrderValue:11040,
    gstPercentage:18,cartonQuantity:6,
    bulkPricing:[{minQty:4,maxQty:11,pricePerUnit:2760},{minQty:12,maxQty:23,pricePerUnit:2700},{minQty:24,maxQty:999,pricePerUnit:2640}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shrink-wrapped Case",
    ratingAverage:4.7,ratingCount:834,
    productImage:["https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80"
  },
  {
    productName:"Colgate MaxFresh Cool Mint Toothpaste 150g x36 Wholesale Case",
    slug:sl("colgate-maxfresh-cool-mint-150g-36"),
    productSkuId:"HBC2-TOOTH-016",barcode:"8901314023823",brand:"Colgate",
    categoryName:"Personal Care",hsnCode:"33061000",unit:"case",
    shortDescription:"36-tube wholesale case of Colgate MaxFresh 150 g Cool Mint — No. 1 toothpaste for long-lasting breath freshness.",
    description:"Colgate MaxFresh Cool Mint Toothpaste features unique Breath Strip technology with micro-bursts of mint-flavoured strips distributed throughout the gel base releasing a powerful cooling sensation upon brushing, delivering up to 12-hour fresh breath. Each 150 g tube is made from recyclable laminate with a precision flip-top cap. The 36-tube wholesale case is the standard procurement unit for pharmacy chains, supermarkets, and personal care distributors. Contains 1000 ppm fluoride for enamel protection and cavity prevention. Shelf life 30 months. Manufactured by Colgate-Palmolive India Ltd., certified by BIS and FSSAI.",
    isFeatured:true,isBestseller:true,stock:480,
    attribute:{salePrice:3060,mrpPrice:3564,weight:"5.4 kg",quantity:"480"},
    discountPercentage:14,isWholesale:true,minimumOrderQty:5,minimumOrderValue:15300,
    gstPercentage:18,cartonQuantity:36,
    bulkPricing:[{minQty:5,maxQty:17,pricePerUnit:3060},{minQty:18,maxQty:35,pricePerUnit:2990},{minQty:36,maxQty:999,pricePerUnit:2920}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Display Master Case",
    ratingAverage:4.6,ratingCount:712,
    productImage:["https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80"
  },
  {
    productName:"Pepsi Cola Carbonated Soft Drink 750ml x24 Wholesale Case",
    slug:sl("pepsi-cola-750ml-24-bottle-wholesale"),
    productSkuId:"HBC2-SFTDRK-017",barcode:"8901486000147",brand:"Pepsi",
    categoryName:"Beverages",hsnCode:"22021010",unit:"case",
    shortDescription:"24-bottle wholesale case of Pepsi Cola 750 ml — the original refreshing cola for retailers, restaurants, and event caterers.",
    description:"Pepsi Cola 750 ml PET bottle delivers the bold refreshing cola taste with the perfect blend of carbonation, sweetness, and caramel colour that has made Pepsi one of the world's most recognised beverage brands. Each bottle features a tamper-evident safety ring and a resealable screw cap for convenience. The 24-bottle wholesale case is packed on a shrink-wrapped half-pallet suitable for gondola display in modern trade formats. Ambient shelf life is 6 months from production date. Contains carbonated water, sugar, phosphoric acid, natural caramel, and caffeine in compliance with FSSAI Regulations. Ideal for restaurants, event catering, quick-service counters, hospitality procurement, and retail grocery chains.",
    isFeatured:true,isBestseller:true,stock:520,
    attribute:{salePrice:960,mrpPrice:1080,weight:"18 L",quantity:"520"},
    discountPercentage:11,isWholesale:true,minimumOrderQty:10,minimumOrderValue:9600,
    gstPercentage:28,cartonQuantity:24,
    bulkPricing:[{minQty:10,maxQty:49,pricePerUnit:960},{minQty:50,maxQty:99,pricePerUnit:940},{minQty:100,maxQty:999,pricePerUnit:915}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shrink-wrapped Half-pallet",
    ratingAverage:4.5,ratingCount:975,
    productImage:["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1554866585-cd94860890b7?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80"
  },
  {
    productName:"Bisleri Natural Mountain Water 1L x24 Wholesale Case",
    slug:sl("bisleri-natural-mountain-water-1l-24"),
    productSkuId:"HBC2-WATER-018",barcode:"8901207078118",brand:"Bisleri",
    categoryName:"Beverages",hsnCode:"22011010",unit:"case",
    shortDescription:"24-bottle wholesale case of Bisleri 1 L mineral water — 10-stage purified and FSSAI certified for institutional supply.",
    description:"Bisleri Natural Mountain Water undergoes a rigorous 10-stage purification process including microfiltration, reverse osmosis, UV treatment, and ozonation, ensuring that every bottle meets IS 13428 standard for packaged drinking water. The 1 L PET bottle features a unique tamper-evident Seal-Smart cap making any tampering immediately visible at the retail point. The 24-bottle wholesale case is designed for fork-lift pallet stacking at cold-storage or ambient warehouse environments. Minimum TDS 120 mg per L for a naturally balanced mineral profile. Zero bacteria, zero pesticide residue. Ideal for hotels, hospitals, airline catering, corporate offices, and convenience retail. Shelf life 2 years. Bisleri is India's most recognised water brand with 100+ plants nationwide.",
    isFeatured:false,isBestseller:true,stock:720,
    attribute:{salePrice:288,mrpPrice:360,weight:"24 L",quantity:"720"},
    discountPercentage:20,isWholesale:true,minimumOrderQty:20,minimumOrderValue:5760,
    gstPercentage:18,cartonQuantity:24,
    bulkPricing:[{minQty:20,maxQty:99,pricePerUnit:288},{minQty:100,maxQty:499,pricePerUnit:275},{minQty:500,maxQty:9999,pricePerUnit:265}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shrink-wrapped Pallet Case",
    ratingAverage:4.7,ratingCount:1050,
    productImage:["https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1614726365952-510103b1bef2?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80"
  },
  {
    productName:"Lays Magic Masala Chips 26g x96 Wholesale Master Case",
    slug:sl("lays-magic-masala-chips-26g-96"),
    productSkuId:"HBC2-SNACK-019",barcode:"8901491104015",brand:"Lay's",
    categoryName:"Snacks",hsnCode:"20052000",unit:"case",
    shortDescription:"96-pack wholesale master case of Lay's India's Magic Masala 26 g — India's favourite crunchy potato chips.",
    description:"Lays India's Magic Masala Chips are crafted from carefully selected freshly sliced potatoes cooked in sunflower oil and seasoned with a proprietary blend of tangy tamarind, aromatic spices, and raw mango powder delivering the uniquely addictive Indian masala flavour. Each 26 g individually sealed pouch is nitrogen-flushed to ensure maximum crunch and a 6-month shelf life at ambient temperatures. The 96-pouch master case is designed for shelf-ready secondary display deployment. FSSAI certified, trans-fat free, and Halal approved. Ideal for impulse-buy racks, petrol forecourts, college canteens, quick-service venues, and wholesale redistribution.",
    isFeatured:true,isBestseller:true,stock:870,
    attribute:{salePrice:1728,mrpPrice:1920,weight:"2.5 kg",quantity:"870"},
    discountPercentage:10,isWholesale:true,minimumOrderQty:10,minimumOrderValue:17280,
    gstPercentage:18,cartonQuantity:96,
    bulkPricing:[{minQty:10,maxQty:49,pricePerUnit:1728},{minQty:50,maxQty:99,pricePerUnit:1680},{minQty:100,maxQty:999,pricePerUnit:1632}],
    dispatchSLA:"24 Hours",warehouseLocation:"Manesar Warehouse, Gurugram",packagingType:"Shelf-ready Master Case",
    ratingAverage:4.8,ratingCount:1120,
    productImage:["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1506802913710-1f25b08de2ef?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80"
  },
  {
    productName:"Amul Gold Full Cream Pasteurised Milk 1L x12 Wholesale Crate",
    slug:sl("amul-gold-full-cream-milk-1l-12-crate"),
    productSkuId:"HBC2-DAIRY-020",barcode:"8901144000021",brand:"Amul",
    categoryName:"Dairy",hsnCode:"04012000",unit:"crate",
    shortDescription:"12-pouch wholesale crate of Amul Gold Full Cream 1 L — 6% fat, 9% SNF pasteurised milk for dairy retailers and HoReCa.",
    description:"Amul Gold Full Cream Pasteurised Milk is the premium offering from India's largest dairy cooperative GCMMF. Each 1 L pillow pouch contains milk standardised to minimum 6% fat and 9% SNF, offering a rich creamy texture ideal for direct consumption, premium tea and coffee, barista-style beverages, sweets, and home baking. Pasteurised using HTST technology that eliminates pathogens while preserving natural vitamins and proteins. The 12-pouch wholesale crate is delivered cold-chain at 4 degrees Celsius with a 3-day shelf life from dispatch. Ideal for dairy retailers, hotel breakfast counters, school canteens, and cloud-kitchen supply chains. Requires refrigerated storage at all times. FSSAI compliant with batch traceability from farm to shelf.",
    isFeatured:true,isBestseller:true,stock:330,
    attribute:{salePrice:756,mrpPrice:840,weight:"12 L",quantity:"330"},
    discountPercentage:10,isWholesale:true,minimumOrderQty:5,minimumOrderValue:3780,
    gstPercentage:0,cartonQuantity:12,
    bulkPricing:[{minQty:5,maxQty:19,pricePerUnit:756},{minQty:20,maxQty:49,pricePerUnit:735},{minQty:50,maxQty:999,pricePerUnit:714}],
    dispatchSLA:"12 Hours",warehouseLocation:"Cold Storage Unit, Gurugram",packagingType:"Insulated Milk Crate",
    ratingAverage:4.8,ratingCount:987,
    productImage:["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=1200&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&q=85&auto=format&fit=crop"],
    thumbnail:"https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80"
  }
];

async function run() {
  const dbUrl = process.env.MongoDb_Url;
  if (!dbUrl) { console.error("MongoDb_Url not defined"); process.exit(1); }

  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");

  let inserted=0, skipped=0;
  const errors=[];

  for (const p of products) {
    try {
      const exists = await Product.findOne({ productSkuId: p.productSkuId });
      if (exists) { console.log("Skipped (exists):", p.productSkuId); skipped++; continue; }

      const doc = new Product({
        sellerId:SELLER_ID, nodeId:NODE_ID, nodeType:NODE_TYPE,
        productName:p.productName, slug:p.slug, productSkuId:p.productSkuId,
        barcode:p.barcode, brand:p.brand, categoryName:p.categoryName,
        hsnCode:p.hsnCode, unit:p.unit,
        shortDescription:p.shortDescription, description:p.description,
        isFeatured:p.isFeatured, isBestseller:p.isBestseller,
        productImage:p.productImage, thumbnail:p.thumbnail,
        stock:p.stock, lowStockThreshold:Math.round(p.stock*0.1), stockBuffer:0,
        attribute:p.attribute, discountPercentage:p.discountPercentage,
        isWholesale:p.isWholesale, minimumOrderQty:p.minimumOrderQty,
        minimumOrderValue:p.minimumOrderValue, bulkPricing:p.bulkPricing,
        gstPercentage:p.gstPercentage, cartonQuantity:p.cartonQuantity,
        dispatchSLA:p.dispatchSLA, dispatchTiming:"9:00 AM - 6:00 PM",
        warehouseLocation:p.warehouseLocation, transportCategory:"Truck",
        packagingType:p.packagingType, businessCategory:"Grocery & FMCG Wholesale",
        isActive:true, isPublished:true, isDeleted:false,
        totalSales:0, totalOrders:0, totalViews:0,
        ratingAverage:p.ratingAverage, ratingCount:p.ratingCount
      });

      const saved = await doc.save();
      console.log(`[${++inserted}/20] Inserted: ${saved.productName} (${saved.productSkuId})`);
    } catch(err) {
      console.error("Error:", p.productSkuId, err.message);
      errors.push({sku:p.productSkuId, error:err.message});
    }
  }

  console.log("\n=== SEEDING COMPLETE ===");
  console.log("Inserted:", inserted);
  console.log("Skipped :", skipped);
  console.log("Errors  :", errors.length);
  if(errors.length) console.log(errors);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
