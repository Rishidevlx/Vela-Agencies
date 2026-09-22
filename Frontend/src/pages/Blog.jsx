import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import blogPosts from '../data/blogPosts';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <main className="blog-page bg-gray-50 min-h-screen pb-16">
      <SEO
        title="Crackers Blog - Diwali Tips & Guide | Vela Agencies"
        description="Read expert guides on diwali crackers safety, ordering tips, green crackers, and more. Vela Agencies blog - your complete Sivakasi crackers knowledge hub."
        keywords="diwali crackers online, sivakasi crackers, crackers safety tips, green crackers, vela agencies blog"
        url="https://www.velaagencies.com/blog"
      />

      {/* Blog Banner */}
      <div className="bg-brand text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg text-white/90">
            Expert guides, safety tips, and everything you need to know about Sivakasi crackers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-brand text-white shadow-lg shadow-brand/30'
                  : 'bg-white text-gray-700 hover:bg-brand/10 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              {/* Post Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {post.category}
                </span>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="font-heading text-lg font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-600 mb-5 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:gap-3 transition-all duration-300"
                >
                  Read More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-semibold">No posts found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Blog;
