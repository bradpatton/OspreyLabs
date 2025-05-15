'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const services = [
  {
    title: 'AI Automation',
    description: 'Leverage artificial intelligence to automate complex business processes, reduce manual work, and increase operational efficiency.',
    features: [
      'Intelligent document processing',
      'Predictive maintenance systems',
      'Automated decision systems',
      'Natural language processing solutions',
      'Virtual assistants and chatbots',
    ],
    image: 'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Custom Software Development',
    description: 'Build tailor-made software solutions designed specifically for your unique business needs and workflows.',
    features: [
      'Web application development',
      'Enterprise software solutions',
      'API development and integration',
      'Legacy system modernization',
      'Cloud-native architecture',
    ],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Integrated AI Solutions for Customer Engagement',
    description: 'Enhance customer experiences with intelligent AI solutions. From chatbots to personalized marketing automation, we create seamless systems that engage, qualify, and support your customers at every touchpoint.',
    features: [
      'AI Chatbots for 24/7 Customer Support',
      'Personalized Marketing Automation',
      'AI-Powered Lead Qualification',
      'Sentiment Analysis for Customer Feedback',
      'Predictive Customer Insights',
    ],
    image: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

export default function Services() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-secondary-100 text-secondary-800 mb-4">
            Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comprehensive Solutions for Business Growth
          </h2>
          <p className="text-xl text-gray-600">
            We offer end-to-end services to help businesses leverage AI and custom software to solve complex problems and drive innovation.
          </p>
        </div>

        <div 
          ref={ref} 
          className="grid grid-cols-1 gap-16"
        >
          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                <div className={`order-2 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                    </div>
                  </div>
                </div>
                
                <div className={`order-1 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <a href="#contact" className="btn btn-primary">
                      Learn More
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 