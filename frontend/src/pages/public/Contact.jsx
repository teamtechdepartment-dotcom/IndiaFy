import React, { useState } from "react";
import { Mail, MessageSquare, Phone, Clock, Send, ShieldCheck, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! Our support team will respond shortly.", {
      icon: "✉️",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const supportChannels = [
    {
      title: "General Support",
      desc: "For order issues, account help, and buyer queries.",
      email: "support@indiafy.com",
      time: "Under 2 hours",
      icon: <MessageSquare size={24} className="text-blue-500" />
    },
    {
      title: "Seller Support",
      desc: "Dedicated channel for verified node operators.",
      email: "sellers@indiafy.com",
      time: "Under 30 mins",
      icon: <ShieldCheck size={24} className="text-emerald-500" />
    },
    {
      title: "Wholesale Support",
      desc: "For B2B bulk inquiries and supplier relations.",
      email: "wholesale@indiafy.com",
      time: "Under 1 hour",
      icon: <Phone size={24} className="text-purple-500" />
    }
  ];

  const faqs = [
    {
      q: "How do I track my order?",
      a: "You can track your order in real-time by going to 'Profile > Order History' and clicking 'Track Order' on your active delivery."
    },
    {
      q: "What is the return policy?",
      a: "Returns are accepted within 3-7 days depending on the category. The item must be in its original condition. Check our Refund Policy for more details."
    },
    {
      q: "How does Video Packing work?",
      a: "For high-value items, our sellers are required to record the packaging process to ensure you get exactly what you ordered. You can view this video after delivery."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Contact Support | Indiafy"
        description="Get in touch with Indiafy's premium support team. General, seller, and wholesale support channels available 24/7."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <Mail size={16} /> 24/7 Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Our specialized support teams are ready to resolve your issues with unmatched speed.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        
        {/* SUPPORT CHANNELS */}
        <section className="mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {supportChannels.map((channel, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                  {channel.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{channel.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 h-10">{channel.desc}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <Mail size={16} className="text-slate-400" />
                    {channel.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
                    <Clock size={14} /> Avg. Response: {channel.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          
          {/* BUSINESS INQUIRY FORM */}
          <section>
            <h2 className="text-3xl font-black tracking-tight mb-2">Send a Message</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                  placeholder="Tell us details..."
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                Send Message <Send size={16} />
              </button>
            </form>
          </section>

          {/* FAQ */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle size={28} className="text-slate-300" />
              <h2 className="text-3xl font-black tracking-tight">Quick Answers</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-sm font-bold text-emerald-800 mb-1">Need more help?</p>
              <p className="text-xs font-medium text-emerald-600 mb-4">Browse our comprehensive Help Center for detailed guides.</p>
              <a href="/help-center" className="text-xs font-black bg-white text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                Visit Help Center
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
