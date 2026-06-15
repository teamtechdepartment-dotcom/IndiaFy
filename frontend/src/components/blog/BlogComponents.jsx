/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link2, 
  ChevronRight, 
  Home,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Breadcrumbs = ({ title, category }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/" className="hover:text-indigo-600 flex items-center transition-colors">
        <Home className="w-4 h-4 mr-1" />
        Home
      </Link>
      <ChevronRight className="w-4 h-4 flex-shrink-0" />
      <Link to="/blog" className="hover:text-indigo-600 transition-colors">
        Blog
      </Link>
      <ChevronRight className="w-4 h-4 flex-shrink-0" />
      <Link to={`/blog?category=${category}`} className="hover:text-indigo-600 transition-colors">
        {category}
      </Link>
      <ChevronRight className="w-4 h-4 flex-shrink-0" />
      <span className="text-zinc-900 font-medium truncate max-w-[200px] sm:max-w-md">
        {title}
      </span>
    </nav>
  );
};

export const AuthorBlock = ({ author, date, readTime }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 mb-8 border-y border-zinc-100 py-4">
      <div className="flex items-center font-medium text-zinc-900">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold">
          {author.charAt(0)}
        </div>
        {author}
      </div>
      <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300"></div>
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-1.5 text-zinc-400" />
        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300"></div>
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1.5 text-zinc-400" />
        {readTime}
      </div>
    </div>
  );
};

export const TableOfContents = ({ content }) => {
  const headings = useMemo(() => {
    if (!content) return [];
    // Extract ## and ### headings
    const matches = content.match(/^(##|###)\s+(.+)$/gm) || [];
    return matches.map((match, index) => {
      const isSub = match.startsWith('###');
      const text = match.replace(/^(##|###)\s+/, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text, isSub, index };
    });
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <h3 className="font-bold text-lg mb-4 text-zinc-900">Table of Contents</h3>
      <ul className="space-y-3">
        {headings.map((heading) => (
          <li 
            key={heading.index} 
            className={`text-sm ${heading.isSub ? 'ml-4 text-zinc-500' : 'font-medium text-zinc-700'}`}
          >
            <a 
              href={`#${heading.id}`}
              className="hover:text-indigo-600 transition-colors line-clamp-1"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ShareButtons = ({ title }) => {
  const url = window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-3 mt-12 pt-8 border-t border-zinc-100">
      <span className="font-semibold text-zinc-900 mr-2">Share this article:</span>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-700 hover:text-white transition-colors"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button 
        onClick={copyLink}
        className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const CTASection = () => {
  return (
    <div className="mt-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      <h3 className="text-2xl sm:text-3xl font-bold mb-4 relative z-10">
        Ready to scale your local business?
      </h3>
      <p className="text-indigo-100 mb-8 max-w-2xl mx-auto relative z-10">
        Join thousands of verified sellers on Indiafy and reach more customers in Gurugram today. Setup takes less than 5 minutes.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        <Link 
          to="/seller/login" 
          className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors w-full sm:w-auto shadow-xl shadow-black/10"
        >
          Become a Seller
        </Link>
        <Link 
          to="/" 
          className="px-8 py-3 bg-indigo-800/50 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors border border-indigo-400/30 w-full sm:w-auto"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
};
