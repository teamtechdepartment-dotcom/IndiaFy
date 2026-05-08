import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerAuthStore } from '../../store/sellerAuthStore';
import {
    Store,
    Truck,
    Zap,
    Plus,
    ArrowRight,
    ShieldCheck,
    Briefcase,
    Home,
    Cpu,
    Heart
} from 'lucide-react';
import WebsiteNavbar from '../../components/WebsiteNavbar';
import Footer from '../../components/Footer';
import StoreCreationWizard from './components/StoreCreationWizard';

// Dummy API data for nodes - normally fetched from /api/v1/sellerNodes
const MOCK_NODES = [
    {
        _id: "node1",
        nodeType: "local",
        isActive: true,
        storeDetails: {
            businessName: "Kishan Retail Point",
            orders: 18,
            revenue: 120000
        }
    }
];

export default function SellerHub() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSellerAuthStore();
    const [myNodes, setMyNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/seller-auth');
            return;
        }
        
        // Simulating API fetch for seller nodes
        setTimeout(() => {
            setMyNodes(MOCK_NODES);
            setIsLoading(false);
        }, 500);
    }, [isAuthenticated, navigate]);

    const hasWholesaleNode = myNodes.some(n => n.nodeType === "wholesale");
    const hasQuickNode = myNodes.some(n => n.nodeType === "quick-commerce");
    const hasHomeNode = myNodes.some(n => n.nodeType === "home-essentials");
    const hasElectronicsNode = myNodes.some(n => n.nodeType === "electronics");
    const hasPersonalCareNode = myNodes.some(n => n.nodeType === "personal-care");

    const [activeWizard, setActiveWizard] = useState(null);

    const handleCreateNode = (nodeType) => {
        setActiveWizard(nodeType);
    };

    const handleWizardSuccess = (nodeType, formData) => {
        // Optimistic UI update to instantly activate the node with the form data
        setMyNodes(prev => [...prev, {
            _id: `node_${nodeType}_${Date.now()}`,
            nodeType: nodeType,
            isActive: true,
            storeDetails: {
                businessName: formData.businessName || `${user?.firstName || 'My'} ${nodeType} Store`,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                orders: 0,
                revenue: 0
            }
        }]);
        setActiveWizard(null);
    };

    return (
        <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-blue-500 selection:text-white">
            <WebsiteNavbar />

            <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 animate-pulse mb-6">
                        <Briefcase size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Multi-Node Ecosystem
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        Seller <span className="text-zinc-700 italic">Hub.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
                        Welcome back, {user?.firstName}. Manage all your independent business operations from one unified command center. Select a node to enter its isolated dashboard.
                    </p>
                </div>

                {/* Available Nodes */}
                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* 1. Local Seller Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Store size={24} />
                            </div>
                            {myNodes.some(n => n.nodeType === "local") ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Local Retail</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Hyperlocal B2C commerce. Sell to customers in your immediate vicinity with instant delivery tracking.
                        </p>

                        <div className="mt-auto">
                            {myNodes.some(n => n.nodeType === "local") ? (
                                <button 
                                    onClick={() => navigate('/seller/local/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all">
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Wholesale B2B Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-amber-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Truck size={24} />
                            </div>
                            {hasWholesaleNode ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Wholesale B2B</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Bulk commerce infrastructure. Manage warehouse logistics, volume pricing tiers, and large-scale transport.
                        </p>

                        <div className="mt-auto">
                            {hasWholesaleNode ? (
                                <button 
                                    onClick={() => navigate('/seller/wholesale/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleCreateNode('wholesale')}
                                    className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                                >
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 3. Quick Commerce Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-teal-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <Zap size={24} />
                            </div>
                            {hasQuickNode ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Quick Commerce</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Dark store operations. Fulfill 10-minute ultra-fast deliveries with integrated active rider routing.
                        </p>

                        <div className="mt-auto">
                            {hasQuickNode ? (
                                <button 
                                    onClick={() => navigate('/quick/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-teal-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleCreateNode('quick-commerce')}
                                    className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                                >
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4. Home Essentials Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-orange-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Home size={24} />
                            </div>
                            {hasHomeNode ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Home Essentials</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Dedicated storefront for daily household needs, groceries, and staples.
                        </p>

                        <div className="mt-auto">
                            {hasHomeNode ? (
                                <button 
                                    onClick={() => navigate('/seller/home/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleCreateNode('home-essentials')}
                                    className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                                >
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 5. Electronics Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-purple-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Cpu size={24} />
                            </div>
                            {hasElectronicsNode ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Electronics</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Specialized catalog for gadgets, appliances, and high-value technical assets.
                        </p>

                        <div className="mt-auto">
                            {hasElectronicsNode ? (
                                <button 
                                    onClick={() => navigate('/seller/electronics/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-purple-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleCreateNode('electronics')}
                                    className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                                >
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 6. Personal Care Node */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-rose-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <Heart size={24} />
                            </div>
                            {hasPersonalCareNode ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                            ) : null}
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Personal Care</h3>
                        <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                            Dedicated hub for health, beauty, wellness, and self-care products.
                        </p>

                        <div className="mt-auto">
                            {hasPersonalCareNode ? (
                                <button 
                                    onClick={() => navigate('/seller/personal-care/dashboard')}
                                    className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                                >
                                    Enter Dashboard <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleCreateNode('personal-care')}
                                    className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                                >
                                    <Plus size={14} /> Create Node
                                </button>
                            )}
                        </div>
                    </div>

                </div>
                
                {/* Security Badge */}
                <div className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-center gap-2 text-zinc-600">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        Isolated Node Architecture • SOC-2 Compliant
                    </span>
                </div>
            </main>

            <Footer />

            {/* STORE CREATION WIZARD MODAL */}
            {activeWizard && (
                <StoreCreationWizard 
                    nodeType={activeWizard} 
                    onClose={() => setActiveWizard(null)} 
                    onSuccess={handleWizardSuccess} 
                />
            )}
        </div>
    );
}
