import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import blogPosts from '../data/blogPosts';

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  if (relatedPosts.length < 2) {
    const morePosts = blogPosts
      .filter(p => p.id !== post.id && p.category !== post.category)
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...morePosts);
  }

  return (
    <main className="blog-post-page bg-gray-50 min-h-screen pb-16">
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.keywords}
        url={`https://www.velaagencies.com/blog/${post.slug}`}
        image={post.image}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          author: { '@type': 'Organization', name: 'Vela Agencies' },
          publisher: { '@type': 'Organization', name: 'Vela Agencies' },
          datePublished: post.date,
          url: `https://www.velaagencies.com/blog/${post.slug}`,
        }}
      />

      {/* Article Header */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">
              {post.category}
            </span>
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-white mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <span>By {post.author}</span>
              <span className="w-1 h-1 bg-white/60 rounded-full"></span>
              <span>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="w-1 h-1 bg-white/60 rounded-full"></span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-brand transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{post.title}</span>
        </nav>

        {/* Article Body */}
        <article
          className="bg-white rounded-2xl shadow-md p-6 md:p-10 prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-gray-900
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-brand prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:my-4 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share / CTA */}
        <div className="mt-10 bg-brand/5 rounded-2xl p-8 text-center border border-brand/10">
          <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
            Ready to Order Crackers?
          </h3>
          <p className="text-gray-600 mb-5">
            Visit Vela Agencies - Sivakasi's most trusted crackers shop since 2000
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/shop"
              className="bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-[#F8B400] hover:text-white transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <a
              href="https://wa.me/919994703605"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#1ebe5d] transition-colors shadow-lg"
            >
              WhatsApp Enquiry
            </a>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(rp => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={rp.image}
                      alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-xs font-bold text-brand uppercase tracking-wide mb-2">{rp.category}</span>
                    <h4 className="font-heading text-base font-bold text-gray-900 group-hover:text-brand transition-colors line-clamp-2 mb-2">
                      {rp.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">{rp.excerpt}</p>
                    <span className="text-brand text-sm font-semibold mt-3 inline-flex items-center gap-1">
                      Read More
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </div>
    </main>
  );
};

export default BlogPost;
