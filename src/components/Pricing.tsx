'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses looking to automate simple processes',
    price: '$3,999',
    billing: 'one-time project fee',
    features: [
      'AI-powered chatbot integration',
      'Basic workflow automation',
      'Custom mobile or web application',
      '1 month of support',
      'Basic analytics dashboard',
    ],
    limitations: [
      'Limited AI training data',
      'Up to 1 business process automation',
    ],
    ctaText: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Ideal for growing companies with complex automation needs',
    price: '$8,999',
    billing: 'one-time project fee',
    features: [
      'Advanced AI integration',
      'Custom workflow automation',
      'Cross-platform application development',
      '3 months of priority support',
      'Advanced analytics and reporting',
      'API integrations with existing systems',
      'User training and documentation',
    ],
    limitations: [],
    ctaText: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with sophisticated automation requirements',
    price: 'Custom',
    billing: 'tailored to your needs',
    features: [
      'Full-scale AI solution development',
      'End-to-end business process automation',
      'Enterprise application suite',
      'Dedicated support team',
      'Custom analytics and BI solutions',
      'Seamless integrations with all systems',
      'On-site training and workshops',
      'Scalable infrastructure',
    ],
    limitations: [],
    ctaText: 'Contact Us',
    popular: false,
  },
];

export default function Pricing() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transparent Pricing for Every Need
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business requirements. All plans include custom development tailored to your specific needs.
          </p>
        </div>

        <div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden border ${
                plan.popular ? 'border-primary-500 shadow-xl relative' : 'border-gray-200 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 left-0 bg-primary-500 text-white text-sm font-medium text-center py-1">
                  Most Popular
                </div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-10' : ''}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.billing && (
                    <span className="text-gray-500 ml-2">{plan.billing}</span>
                  )}
                </div>
                
                <a
                  href="#contact"
                  className={`w-full btn ${
                    plan.popular ? 'btn-primary' : 'btn-outline'
                  } justify-center mb-8`}
                >
                  {plan.ctaText}
                </a>
                
                <div className="border-t border-gray-100 pt-6">
                  <p className="font-medium mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <p className="font-medium mb-4 mt-6">Limitations:</p>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="ml-3 text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-gray-600 mb-6">
            Need a custom solution not covered by these plans? We specialize in tailored development services to match your exact requirements.
          </p>
          <a href="#contact" className="btn btn-outline">
            Request Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
} 