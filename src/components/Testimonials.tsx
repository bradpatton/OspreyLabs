'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    quote: "Osprey Labs transformed our customer service operations with their AI automation solution. We've seen a dramatic decrease in response times and a significant improvement in customer satisfaction.",
    author: "Sarah Johnson",
    title: "CTO, e-commerce company",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  {
    quote: "The custom inventory management app developed by Osprey Labs has revolutionized our retail operations. Their team's expertise in both AI and mobile development delivered a solution that exceeded our expectations.",
    author: "Michael Chen",
    title: "Operations Director, retail chain",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  {
    quote: "Working with Osprey Labs was a game-changer for our manufacturing processes. Their predictive maintenance system has paid for itself many times over by preventing downtime and extending equipment life.",
    author: "Robert Williams",
    title: "Plant Manager, manufacturing company",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <div
          ref={ref}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-secondary-100 text-secondary-800 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it. Here's what our clients have to say about working with Osprey Labs.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            
            <svg className="text-gray-200 w-16 h-16 absolute top-8 left-8 opacity-20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            
            <div className="relative">
              <div className="min-h-[200px] flex flex-col justify-between">
                <p className="text-xl md:text-2xl text-gray-700 mb-8 relative z-10">
                  "{testimonials[activeIndex].quote}"
                </p>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].author}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonials[activeIndex].author}</h4>
                    <p className="text-gray-600">{testimonials[activeIndex].title}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 