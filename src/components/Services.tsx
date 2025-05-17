'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const services = [
  {
    title: 'AI Solutions & Integration',
    description: 'Leverage the latest in artificial intelligence without the headache. We integrate AI technologies into your business processes and ensure all systems work seamlessly together. From deploying an AI chatbot that handles customer inquiries to implementing predictive analytics that guide your decisions, we take care of the heavy lifting. Our team also provides strategic AI consulting to identify high-ROI opportunities and train your staff on new AI tools, so you get the most value out of every innovation.',
    features: [
      'AI Chatbots & Virtual Assistants',
      'Predictive Analytics & Insights',
      'Document Processing Automation',
      'Machine Learning Integration',
      'AI Strategy & Training',
    ],
    image: '/images/neeqolah-creative-works-qbId5TLFG2s-unsplash.jpg',
  },
  {
    title: 'Business Process Automation',
    description: 'We map out your key workflows and automate them using the latest tools and AI techniques. Whether it\'s streamlining your sales pipeline or speeding up fulfillment, we implement solutions that reduce manual work and operational costs. The result is a more efficient, error-free business where your team can focus on high-value activities instead of busywork.',
    features: [
      'CRM & Sales Automation',
      'Marketing & Email Automation',
      'Operations & Workflow Automation',
      'Inventory & Order Management',
      'Scheduling & Billing Automation',
    ],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Custom Business Software Development',
    description: 'When off-the-shelf software falls short, we build custom solutions from the ground up. Our developers create applications tailored precisely to your business requirements - whether you need a custom CRM, a specialized web/mobile app, or an internal workflow tool. We incorporate AI capabilities where appropriate and ensure every custom solution integrates with your operations. You get software that solves your exact challenges and scales with your growth.',
    features: [
      'Custom CRM & Database Systems',
      'Web & Mobile Applications',
      'AI Dashboards & BI Tools',
      'Internal Workflow Tools',
      'Legacy System Modernization',
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
                    {index === 0 ? (
                      <img 
                        src="/images/neeqolah-creative-works-qbId5TLFG2s-unsplash.jpg"
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
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