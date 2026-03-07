import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, User } from 'lucide-react';

const BlogPage: React.FC = () => {
  const posts = [
    {
      title: "How to Save More on Data in Nigeria",
      excerpt: "Learn the best strategies to reduce your monthly data spending without sacrificing connectivity.",
      author: "Oplug Team",
      date: "March 5, 2026",
      image: "https://picsum.photos/seed/data/800/400"
    },
    {
      title: "The Future of VTU and Digital Payments",
      excerpt: "Exploring how automated systems are changing the way Nigerians pay for essential services.",
      author: "Admin",
      date: "February 28, 2026",
      image: "https://picsum.photos/seed/tech/800/400"
    },
    {
      title: "Why Your Business Needs a VTU API",
      excerpt: "Discover how integrating our API can help you scale your business and offer more value to customers.",
      author: "Dev Team",
      date: "February 15, 2026",
      image: "https://picsum.photos/seed/api/800/400"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-24">
        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-12">
          Insights <br />
          <span className="text-blue-600">& News.</span>
        </h1>
        <p className="text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-black uppercase tracking-tight">
          Stay updated with the latest trends in digital payments and VTU services.
        </p>
      </div>

      <div className="grid lg:grid-cols-1 gap-24">
        {posts.map((post, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group cursor-pointer"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[16/9] rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-8">
                <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{post.date}</span>
                  </div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center space-x-4 text-blue-600 font-black uppercase tracking-widest text-xs">
                  <span>Read Full Article</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
