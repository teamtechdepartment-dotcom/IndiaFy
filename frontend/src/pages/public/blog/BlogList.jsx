import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, BookOpen } from 'lucide-react';
import SEOHead from '../../../components/seo/SEOHead';
import { blogPosts, categories } from '../../../data/blogData';

export default function BlogList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter logic
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const standardPosts = filteredPosts.slice(1);

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Indiafy Blog",
      "description": "Insights, guides, and stories about hyper-local commerce, verified sellers, and the future of shopping in Gurugram.",
      "url": "https://india-fy.vercel.app/blog"
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": filteredPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://india-fy.vercel.app/blog/${post.slug}`
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20">
      <SEOHead 
        title="Indiafy Blog | Hyperlocal Commerce & Shopping Insights"
        description="Read the latest insights on quick commerce, local shopping, wholesale, and seller growth in Gurugram on the Indiafy Blog."
        canonical="https://india-fy.vercel.app/blog"
        type="website"
        schemas={schemas}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            The Indiafy <span className="text-indigo-600">Blog</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Insights, guides, and stories about hyper-local commerce, verified sellers, and the future of shopping in Gurugram.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-600" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-12 hide-scrollbar gap-2">
          <button
            onClick={() => setActiveCategory('All')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'All' 
                ? 'bg-white shadow-sm border border-slate-200 text-slate-900' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-zinc-200'
            }`}
          >
            All Articles
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category 
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-900' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-zinc-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* No Results State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
                <div className="md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-white shadow-sm border border-slate-200/10 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-indigo-600 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-slate-500 mb-4 font-medium">
                    <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{featuredPost.category}</span>
                    <span className="mx-3">•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-500 mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed">
                    {featuredPost.description}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Read Article <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Standard Posts Grid */}
        {standardPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {standardPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block h-full">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-slate-500 mb-3 font-medium">
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{post.category}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 mb-6 line-clamp-2 text-sm leading-relaxed">
                      {post.description}
                    </p>
                    <div className="mt-auto flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Read Article <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
