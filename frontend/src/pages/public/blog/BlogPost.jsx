import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SEOHead from '../../../components/seo/SEOHead';
import { blogPosts } from '../../../data/blogData';
import { 
  Breadcrumbs, 
  AuthorBlock, 
  TableOfContents, 
  ShareButtons, 
  CTASection 
} from '../../../components/blog/BlogComponents';

export default function BlogPost() {
  const { slug } = useParams();
  
  const post = useMemo(() => blogPosts.find(p => p.slug === slug), [slug]);
  
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter(p => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Schema Generation
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.image],
    "datePublished": post.date,
    "author": [{
      "@type": "Person",
      "name": post.author
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Indiafy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://india-fy.vercel.app/logo.png"
      }
    },
    "description": post.description
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://india-fy.vercel.app/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://india-fy.vercel.app/blog"
    },{
      "@type": "ListItem",
      "position": 3,
      "name": post.title,
      "item": `https://india-fy.vercel.app/blog/${post.slug}`
    }]
  };

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const schemas = [articleSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  // Simple Markdown to HTML parser for our custom content
  const renderContent = (markdown) => {
    // This is a basic parser. For production with complex markdown, use a library like marked or react-markdown.
    // Given our constrained environment, we'll manually parse the known structures safely.
    
    const html = markdown
      .replace(/### (.*)/g, '<h4 id="$1" class="text-xl font-bold mt-8 mb-4 text-zinc-900">$1</h4>')
      .replace(/## (.*)/g, '<h3 id="$1" class="text-2xl font-bold mt-12 mb-6 text-zinc-900 border-b border-zinc-100 pb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-6 text-zinc-700 leading-relaxed">')
      .replace(/<p class="mb-6 text-zinc-700 leading-relaxed"><\/p>/g, '') // Remove empty paragraphs
      .replace(/- (.*)/g, '<li class="ml-6 mb-2 list-disc text-zinc-700">$1</li>');

    // Add id to headings dynamically to match TOC logic
    const htmlWithIds = html.replace(/<h([34]) id="(.*?)">/g, (match, level, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h${level} id="${id}" class="${level === '3' ? 'text-2xl font-bold mt-12 mb-6 text-zinc-900 border-b border-zinc-100 pb-2' : 'text-xl font-bold mt-8 mb-4 text-zinc-900'}">`;
    });

    return <div dangerouslySetInnerHTML={{ __html: `<p class="mb-6 text-zinc-700 leading-relaxed">${htmlWithIds}</p>` }} />;
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <SEOHead 
        title={`${post.title} | Indiafy Blog`}
        description={post.description}
        canonical={`https://india-fy.vercel.app/blog/${post.slug}`}
        image={post.image}
        type="article"
        schemas={schemas}
      />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs title={post.title} category={post.category} />
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-8">
          {post.title}
        </h1>
        
        <AuthorBlock 
          author={post.author} 
          date={post.date} 
          readTime={post.readTime} 
        />
      </div>

      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="aspect-[21/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl relative">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
        
        <div className="lg:w-2/3 xl:w-3/4">
          <div className="prose prose-lg prose-indigo max-w-none">
            {renderContent(post.content)}
          </div>
          
          {/* FAQ Section */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-16 bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
              <h3 className="text-2xl font-bold text-zinc-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                {post.faqs.map((faq, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-bold text-zinc-900 mb-2">{faq.question}</h4>
                    <p className="text-zinc-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ShareButtons title={post.title} />
          <CTASection />
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4">
          <div className="sticky top-32">
            <TableOfContents content={post.content} />
          </div>
        </div>

      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="border-t border-zinc-200 pt-16">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-bold text-zinc-900">Related Articles</h3>
              <Link to="/blog" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center">
                View all <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rPost) => (
                <Link key={rPost.id} to={`/blog/${rPost.slug}`} className="group block">
                  <div className="bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={rPost.image} 
                        alt={rPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {rPost.title}
                      </h4>
                      <p className="text-zinc-600 text-sm line-clamp-2">
                        {rPost.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
