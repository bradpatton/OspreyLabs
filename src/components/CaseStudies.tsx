'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const caseStudies = [
  {
    title: 'AI-Powered Customer Service Automation',
    industry: 'E-commerce',
    description: 'Developed an intelligent chatbot that reduced support ticket volume by 65% and improved customer satisfaction scores.',
    results: [
      'Reduced support costs by 45%',
      'Improved response time from hours to seconds',
      '98% accuracy in resolving common issues',
    ],
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Predictive Maintenance System',
    industry: 'Manufacturing',
    description: 'Built a machine learning system that predicts equipment failures before they happen, preventing costly downtime.',
    results: [
      'Reduced unplanned downtime by 78%',
      'Saved $2.5M in maintenance costs annually',
      'Extended equipment lifespan by 15%',
    ],
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Custom Mobile Inventory Management',
    industry: 'Retail',
    description: 'Designed a cross-platform mobile app that streamlined inventory management across 52 store locations.',
    results: [
      'Inventory accuracy improved from 82% to 98%',
      '35% reduction in stockouts',
      'Reduced manual counting hours by 80%',
    ],
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export default function CaseStudies() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="case-studies" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800 mb-4">
            Case Studies
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transforming Businesses with Intelligent Solutions
          </h2>
          <p className="text-xl text-gray-600">
            See how we've helped organizations across industries solve complex challenges and achieve remarkable results.
          </p>
        </div>

        <div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col"
            >
              <div className="relative h-48 w-full">
                <img
                  src={study.image}
                  alt={study.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-white/20 text-white backdrop-blur-sm mb-2">
                    {study.industry}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4">{study.title}</h3>
                <p className="text-gray-600 mb-6 flex-1">{study.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-primary-700">Key Results:</h4>
                  {study.results.map((result, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                      <p className="ml-2 text-sm text-gray-700">{result}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors flex items-center gap-1 text-sm">
                    Read Full Case Study
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#contact" className="btn btn-outline">
            Discuss Your Project
          </a>
        </div>
      </div>
    </section>
  );
} 