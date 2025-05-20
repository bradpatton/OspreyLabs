'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

// Job posting interface
interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Contract
  description: string;
  requirements: string[];
  responsibilities: string[];
  isExpanded: boolean;
}

export default function CareersPage() {
  // Sample job postings data
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    {
      id: 'ai-engineer-1',
      title: 'AI Engineer',
      department: 'Engineering',
      location: 'Remote (US)',
      type: 'Full-time',
      description: 'We\'re looking for an experienced AI Engineer to help us build and deploy cutting-edge AI solutions for our clients. You\'ll work with a team of engineers to design, develop, and implement AI systems that solve complex business problems.',
      requirements: [
        'Bachelor\'s or Master\'s degree in Computer Science, AI, or related field',
        '3+ years of experience in machine learning and AI development',
        'Proficiency in Python and relevant ML frameworks (TensorFlow, PyTorch)',
        'Experience with large language models and generative AI',
        'Strong problem-solving skills and attention to detail',
        'Excellent communication and collaboration abilities'
      ],
      responsibilities: [
        'Design and develop AI solutions for client projects',
        'Implement and fine-tune machine learning models',
        'Collaborate with cross-functional teams to understand requirements',
        'Optimize AI systems for performance and scalability',
        'Stay current with the latest AI research and technologies',
        'Document technical specifications and processes'
      ],
      isExpanded: false
    },
    {
      id: 'frontend-dev-1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Hybrid (Panama City)',
      type: 'Full-time',
      description: 'Join our team as a Senior Frontend Developer to create beautiful, responsive, and user-friendly interfaces for our client applications. You\'ll work closely with designers and backend developers to build seamless user experiences.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of experience in frontend development',
        'Expert knowledge of React, Next.js, and TypeScript',
        'Strong understanding of modern CSS and responsive design',
        'Experience with state management libraries and frontend testing',
        'Portfolio demonstrating UI/UX excellence'
      ],
      responsibilities: [
        'Develop responsive and accessible user interfaces',
        'Collaborate with designers to implement UI/UX designs',
        'Write clean, maintainable, and efficient code',
        'Optimize applications for maximum performance',
        'Implement and maintain quality standards and best practices',
        'Mentor junior developers and contribute to team growth'
      ],
      isExpanded: false
    },
    {
      id: 'product-manager-1',
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid (Panama City)',
      type: 'Full-time',
      description: 'We\'re seeking an experienced Product Manager to lead the development of our AI automation products. You\'ll work with stakeholders to define product strategy, roadmap, and features that deliver exceptional value to our clients.',
      requirements: [
        'Bachelor\'s degree in Business, Computer Science, or related field',
        '4+ years of experience in product management',
        'Experience with AI or SaaS products',
        'Strong analytical and problem-solving skills',
        'Excellent communication and leadership abilities',
        'Knowledge of agile development methodologies'
      ],
      responsibilities: [
        'Define product vision, strategy, and roadmap',
        'Gather and prioritize product requirements',
        'Work with engineering teams to deliver features',
        'Analyze market trends and competitive landscape',
        'Collaborate with sales and marketing on go-to-market strategies',
        'Measure and report on product performance metrics'
      ],
      isExpanded: false
    },
    {
      id: 'data-scientist-1',
      title: 'Senior Data Scientist',
      department: 'Data Science',
      location: 'Hybrid (Panama City)',
      type: 'Full-time',
      description: 'Join our data science team to help clients extract valuable insights from their data. You\'ll design and implement data analysis pipelines, build predictive models, and communicate findings to stakeholders.',
      requirements: [
        'Master\'s or PhD in Data Science, Statistics, or related field',
        '5+ years of experience in data science',
        'Strong programming skills in Python and SQL',
        'Experience with data visualization and BI tools',
        'Knowledge of statistical analysis and machine learning',
        'Excellent problem-solving and communication skills'
      ],
      responsibilities: [
        'Design and implement data analysis methodologies',
        'Build predictive models and machine learning algorithms',
        'Extract insights from complex datasets',
        'Communicate findings to technical and non-technical stakeholders',
        'Collaborate with engineering teams to implement data solutions',
        'Stay current with the latest data science research and techniques'
      ],
      isExpanded: false
    }
  ]);

  // Toggle job posting expansion
  const toggleJobExpansion = (id: string) => {
    setJobPostings(prevPostings =>
      prevPostings.map(posting =>
        posting.id === id
          ? { ...posting, isExpanded: !posting.isExpanded }
          : posting
      )
    );
  };

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  // Get unique departments and locations for filters
  const departments = Array.from(new Set(jobPostings.map(job => job.department)));
  const locations = Array.from(new Set(jobPostings.map(job => job.location)));

  // Apply filters
  const filteredJobs = jobPostings.filter(job => 
    (departmentFilter === '' || job.department === departmentFilter) &&
    (locationFilter === '' || job.location === locationFilter)
  );

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Help us build the future of AI automation and custom software solutions. We're looking for talented individuals who are passionate about technology and innovation.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a href="#open-positions" className="btn bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700 transition-colors">
                  View Open Positions
                </a>
                {/* <Link href="/about" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 transition-colors">
                  About Our Company
                </Link> */}
              </div>
            </motion.div>
            
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/neeqolah-creative-works-qbId5TLFG2s-unsplash.jpg"
                  alt="Team collaboration at Osprey Labs"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-white mr-2" viewBox="0 0 403.7 219.36" xmlns="http://www.w3.org/2000/svg">
                      <path d="M48.89,69.64c8.97,0,16.49.06,24.02-.01,38.07-.38,76.14-.74,114.21-1.23,26.26-.33,51.76,4.15,76.8,11.82,1.88.58,3.83.95,5.78,1.27,1.43.24,2.89.23,4.34.33.24-.4.48-.79.72-1.19-2.77-2.01-5.3-4.59-8.36-5.95-20.46-9.1-41.75-15.15-64.1-17.26-45.11-4.25-90.26-1.01-135.39-.7C31.84,56.97,12.64,38.87.18,10.84c-.18-.41-.13-.93-.18-1.35,23.29.47,46.49.77,69.69,1.47,20.26.61,40.55,1.09,60.74,2.67,49.16,3.85,95.01,17.13,132.75,51.21,8.29,7.49,15.49,16.22,24.22,25.47-2.82,0-4.47.07-6.12-.01-10.03-.52-20.06-1.35-30.1-1.56-23.49-.49-46.69,2.42-69.62,7.29-20.1,4.28-40,9.51-60.13,13.67-19.48,4.03-36.4-2.83-51.44-14.82-8.29-6.61-14.47-15.27-21.11-25.25Z" fill="currentColor" />
                      <path d="M309.3,107.57c-6.91-24.95-18.9-45.81-41.41-59.11,8.98-3.72,17.38-7.19,25.78-10.66-.14-.8-.29-1.6-.43-2.41-3.47,0-6.97.3-10.41-.06-7.16-.77-14.58-.93-21.37-3.05-15.64-4.87-25.08-16.39-30.19-32.28.75.07,1.41-.07,1.83.19,14.88,9.21,31.57,9.68,48.22,10.17,17.3.51,34.61.61,51.9,1.28,11.97.47,23.68,2.22,32.78,11.44,7.45,7.55,8.55,14.65,4.43,24.5-2.98,7.11-5.08,14.6-7.88,21.8-.55,1.42-2.31,2.62-3.79,3.37-7.25,3.67-14.1,7.73-19.45,14.18-6.5,7.84-9.45,17.32-13.1,26.52-3.84,9.66-7.3,19.51-11.82,28.84-3.21,6.62-7.84,12.54-11.93,18.7-13.36,20.09-32.67,32.26-54.11,41.75-10.49,4.65-21.32,7.57-33.76,9.33,4.15-4.94,7.92-8.82,11.01-13.18,15.02-21.25,29.86-42.63,44.76-63.97.95-1.36,1.98-2.69,2.71-4.17,6.71-13.56,18.06-20.14,32.45-22.22,1.09-.16,2.15-.53,3.78-.95Z" fill="currentColor" />
                      <path d="M114.31,125.21c8.98-2.43,17.89-5.21,26.96-7.23,27.59-6.14,55.05-13.28,82.94-17.52,20.19-3.07,40.98-2.24,61.51-2.87,2.46-.08,4.98,1.61,7.35,3.06-24.44,3.45-45.35,15.97-67.69,24.45-12.75,4.84-25.28,10.55-38.37,14.15-19.69,5.41-39.16,2.48-57.9-5.32-5.16-2.15-10.16-4.7-15.24-7.06.14-.56.29-1.12.43-1.67Z" fill="currentColor" />
                      <path d="M55.82,177.07c8.03-.95,14.95-1.92,21.9-2.56,30.35-2.83,60.23-8.27,89.68-16.19,11.72-3.15,23.7-5.38,35.28-8.96,9.07-2.8,17.71-7.03,26.55-10.63,2.07-.84,4.14-1.68,6.24-2.35-33.07,24-67.03,46.51-105.88,59.53-25.25,8.46-49.04,4.38-69.44-14.12-1.29-1.17-2.38-2.58-4.34-4.73Z" fill="currentColor" />
                      <path d="M270.61,120.99c-6.26,7.89-12.6,15.72-18.76,23.69-9.91,12.83-19.28,26.12-29.69,38.52-8.05,9.6-16.98,18.55-26.18,27.04-7.16,6.61-16.54,8.87-26.09,9.08-12.55.28-24.96-1.09-36.86-5.49-1.76-.65-3.37-1.7-5.79-2.95,1.43-.88,2-1.39,2.66-1.6,31.83-10.39,60.21-27.25,86.58-47.69,7.92-6.14,16.56-12.18,22.28-20.16,8.16-11.39,21.04-13.77,30.94-21.47.3.34.61.68.91,1.03Z" fill="currentColor" />
                      <path d="M395.63,89.75c-1.88-12.49-7.29-16.72-25.55-19.74,2.15-5.31,4.19-10.42,6.27-15.51,2.04-4.99,4.11-9.97,6.2-15.02,21.39,7.25,28.03,30.86,13.08,50.26Z" fill="currentColor" />
                    </svg>
                    <span className="text-white font-medium">Osprey Labs Team</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Company Culture Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Life at Osprey Labs</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Innovation First</h3>
                </div>
                <p className="text-gray-600">
                  We encourage creative thinking and bold ideas. Our team is constantly pushing boundaries and exploring new technologies to solve complex problems.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Collaborative Culture</h3>
                </div>
                <p className="text-gray-600">
                  We believe in the power of teamwork. Our diverse team brings together different perspectives and skills to create exceptional solutions.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Growth Opportunities</h3>
                </div>
                <p className="text-gray-600">
                  We invest in our team's professional development. You'll have opportunities to learn new skills, attend conferences, and advance your career.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Remote-Friendly</h3>
                </div>
                <p className="text-gray-600">
                  We embrace flexible work arrangements. Whether you prefer working remotely or in one of our offices, we support your work style.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Our Benefits</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4">
                  <p className="font-medium">Competitive Salary</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Health Insurance</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Flexible PTO</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">401(k) Matching</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Remote Work Options</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Learning Stipend</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Home Office Budget</p>
                </div>
                <div className="p-4">
                  <p className="font-medium">Team Retreats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Job Listings Section */}
      <section id="open-positions" className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          
          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-center">
            <div className="w-full md:w-auto">
              <select
                className="w-full md:w-64 p-2 border border-gray-300 rounded"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-auto">
              <select
                className="w-full md:w-64 p-2 border border-gray-300 rounded"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Job Listings */}
          <div className="max-w-4xl mx-auto">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No positions matching your criteria at the moment.</p>
                <p className="mt-2">Please check back later or adjust your filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleJobExpansion(job.id)}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-primary-600">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {job.department}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {job.location}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center">
                          <span className="text-primary-600 font-medium flex items-center">
                            {job.isExpanded ? 'Hide Details' : 'View Details'}
                            <svg 
                              className={`ml-2 h-5 w-5 transform transition-transform ${job.isExpanded ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {job.isExpanded && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="prose max-w-none">
                          <p className="mb-6">{job.description}</p>
                          
                          <h4 className="text-lg font-medium mb-2">Responsibilities:</h4>
                          <ul className="list-disc pl-5 mb-6">
                            {job.responsibilities.map((item, index) => (
                              <li key={index} className="mb-1">{item}</li>
                            ))}
                          </ul>
                          
                          <h4 className="text-lg font-medium mb-2">Requirements:</h4>
                          <ul className="list-disc pl-5 mb-6">
                            {job.requirements.map((item, index) => (
                              <li key={index} className="mb-1">{item}</li>
                            ))}
                          </ul>
                          
                          <div className="mt-8">
                            <Link 
                              href={`/careers/apply?job=${job.id}`}
                              className="btn btn-primary"
                            >
                              Apply for this position
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* No Positions Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">Don't See a Position That Fits?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're always looking for talented individuals to join our team. Send us your resume and let us know how you can contribute to Osprey Labs.
            </p>
            <Link href="/careers/apply" className="btn btn-primary">
              Submit General Application
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 