import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, Calendar, Briefcase, Heart, MessageSquare, Award, ArrowRight, 
  CheckCircle, GraduationCap, Building2, Globe, TrendingUp, Shield,
  Sparkles, Zap, BookOpen, UserCheck, Send, BarChart3, Menu, X,
  GraduationCapIcon, Brain, Database, Network, Mail, FileCheck,
  UserPlus, BellRing, FolderOpen, Target
} from 'lucide-react'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: Shield,
      title: 'Centralized Multi-College Platform',
      description: 'One powerful system serving unlimited colleges with role-based access control and unique college codes.',
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: UserCheck,
      title: 'Smart Approval Workflows',
      description: 'Multi-level approval system from superadmin to college admin with automated email notifications.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Targeted Job Posting',
      description: 'Alumni can post jobs with precise targeting - by batch, year, or specific user groups.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Smart alumni-student matching based on skills and interests across colleges.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileCheck,
      title: 'ATS Score Analysis',
      description: 'Instant resume scoring against job descriptions for students and alumni.',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Network,
      title: 'Complete Ecosystem',
      description: 'Connect students, alumni, faculty, and admin in one unified platform.',
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    }
  ]

  const stats = [
    { value: '5', label: 'User Roles', icon: Users },
    { value: '100%', label: 'Automated Workflows', icon: Zap },
    { value: 'AI', label: 'Powered Matching', icon: Brain },
    { value: '360°', label: 'Dashboard Analytics', icon: BarChart3 }
  ]

  const userTypes = [
    {
      title: 'Superadmin',
      icon: Shield,
      benefits: [
        'College registration approval',
        'Automated code generation',
        'System-wide analytics',
        'Query management'
      ]
    },
    {
      title: 'College Admin',
      icon: Building2,
      benefits: [
        'User approval workflows',
        'Batch notifications',
        'Event & donation management',
        'Year-wise analytics'
      ]
    },
    {
      title: 'Students',
      icon: GraduationCap,
      benefits: [
        'AI mentor recommendations',
        'ATS resume scoring',
        'Targeted job access',
        'Mentorship requests'
      ]
    },
    {
      title: 'Alumni',
      icon: Award,
      benefits: [
        'Targeted job posting',
        'Mentorship opportunities',
        'Event organization',
        'Directory access'
      ]
    },
    {
      title: 'Faculty',
      icon: BookOpen,
      benefits: [
        'Event management',
        'Student directory',
        'Profile management',
        'Direct communication'
      ]
    }
  ]

  const workflow = [
    {
      step: '1',
      title: 'Superadmin Approval',
      description: 'College registers and awaits superadmin verification',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '2',
      title: 'Unique Code Generation',
      description: 'Approved colleges receive unique registration code via email',
      icon: Mail,
      color: 'from-green-500 to-emerald-500'
    },
    {
      step: '3',
      title: 'User Registration',
      description: 'Students, alumni, faculty register using college code',
      icon: UserPlus,
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '4',
      title: 'College Admin Approval',
      description: 'College admin verifies and approves user registrations',
      icon: UserCheck,
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation - same as before */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                <Database className="w-6 h-6" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AlumniHub
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {/* <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </Link>
              <Link to="/demo" className="text-gray-600 hover:text-gray-900 font-medium">
                Demo
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Link> */}
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                Start Now
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden py-4 border-t border-gray-100"
            >
              <div className="flex flex-col space-y-4">
                {/* <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium py-2">Features</Link> */}
                {/* <Link to="/demo" className="text-gray-600 hover:text-gray-900 font-medium py-2">Demo</Link> */}
                {/* <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium py-2">Pricing</Link> */}
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium py-2">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-center">
                  Start Now
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 inline-block"
              >
                {/* <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                  <Brain className="w-4 h-4 mr-2" />
                  AI-Powered Alumni Management
                </span> */}
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Centralized Alumni Platform for{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  All Colleges
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                One powerful platform serving unlimited colleges with multi-level approvals, 
                AI recommendations, ATS scoring, and targeted job posting. Built with MERN stack 
                for scalability and performance.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center">
                  Register Your College
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-center">
                  Login
                </Link>
              </div>
{/* 
              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>MERN Stack</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Tailwind CSS</span>
                                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cloud Ready</span>
                </div>
              </div> */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-2xl" />
                
                <div className="relative z-10">
  <img
    src="https://www.vaave.com/media/hero-banner-illustration.png"
    alt="Alumni Management Platform"
    style={{ width: "400px", height: "auto" }}
  />
</div>


                {/* Floating feature cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">AI Matching</p>
                      <p className="text-xs text-gray-600">Smart Recommendations</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">ATS Score</p>
                      <p className="text-xs text-gray-600">Resume Analysis</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 relative bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 mb-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Enterprise-Grade Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900"
            >
              Everything You Need in One Platform
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Built with modern technology stack for scalability and performance
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Powerful Dashboards for Every Role
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Role-based access with custom features and analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-6">{type.title}</h3>
                <ul className="space-y-3">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Streamlined Approval Workflow
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Multi-level approval system with automated notifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -z-10" />
                )}
                
                <div className="text-center">
                  <div className={`w-28 h-28 mx-auto bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center shadow-xl mb-6 relative`}>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md">
                      {item.step}
                    </span>
                    <item.icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Built with Modern Technology
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Enterprise-grade stack for reliability and scalability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'MongoDB', icon: Database, color: 'from-green-500 to-emerald-500' },
              { name: 'Express.js', icon: Zap, color: 'from-gray-600 to-gray-800' },
              { name: 'React.js', icon: Sparkles, color: 'from-blue-400 to-cyan-500' },
              { name: 'Node.js', icon: Network, color: 'from-green-600 to-green-800' },
              { name: 'Tailwind CSS', icon: Sparkles, color: 'from-teal-400 to-blue-500' },
              { name: 'JWT Auth', icon: Shield, color: 'from-purple-500 to-pink-500' },
              { name: 'AI/ML', icon: Brain, color: 'from-indigo-500 to-purple-500' },
              { name: 'Cloud Ready', icon: Globe, color: 'from-orange-500 to-red-500' }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col items-center group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <tech.icon className="w-10 h-10 text-white" />
                </div>
                <p className="font-semibold text-gray-800">{tech.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full opacity-10 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl"
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full text-green-300 text-sm font-medium mb-8"
          >
                       <Sparkles className="w-4 h-4 mr-2" />
            Limited Time Offer - 30 Day Free Trial
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your Alumni Management?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Join the next generation of colleges using AI-powered alumni management 
            with multi-level approvals, targeted job posting, and smart recommendations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="group bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/demo" className="bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-200">
              Request Live Demo
            </Link>
          </motion.div>
          
          <p className="mt-8 text-gray-400 text-sm">
            No credit card required • 30-day free trial • Full feature access
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Platform Capabilities
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-10 h-10 text-indigo-600" />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  {stat.value}
                </motion.p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Advanced Features That Set Us Apart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Targeted Job Posting</h3>
                  <p className="text-gray-600">Alumni can post jobs with granular targeting - select specific batches, years, or user groups for maximum relevance.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Recommendation Engine</h3>
                  <p className="text-gray-600">Smart alumni-student matching based on skills, interests, and career goals across your college network.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">ATS Score Analysis</h3>
                  <p className="text-gray-600">Instant resume scoring against job descriptions. Alumni can view top-matching students for referrals.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BellRing className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Smart Notifications</h3>
                  <p className="text-gray-600">Batch-wise notifications, event reminders, and personalized updates for all user types.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8">
                <img
                  src="https://cdn.dribbble.com/users/1525393/screenshots/15522833/media/9c5e0e88186ab6efa683fccac712f605.gif"
                  alt="Dashboard Preview"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">25,000+</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-sm text-gray-600">Jobs Posted</p>
                    <p className="text-2xl font-bold text-gray-900">1,200+</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How does the approval workflow work?",
                a: "Colleges register and await superadmin approval. Once approved, they receive a unique code via email. This code is used by students, alumni, and faculty to register. College admin then approves these registrations."
              },
              {
                q: "What makes your platform different?",
                a: "We offer a centralized system for all colleges with multi-level approvals, AI-powered recommendations, ATS scoring, and targeted job posting - all built with modern MERN stack."
              },
              {
                q: "Can alumni from different colleges connect?",
                a: "Yes! Our AI recommendation system can suggest connections across colleges based on skills and interests, fostering a broader professional network."
              },
              {
                q: "Is the platform really scalable?",
                a: "Built with MERN stack and designed for cloud deployment, our platform can handle unlimited colleges and users with optimal performance."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-white">AlumniHub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Centralized alumni management platform for all colleges with AI-powered features.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link to="/guides" className="hover:text-white transition-colors">Integration Guides</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 AlumniHub. All rights reserved. Built with MERN Stack + Tailwind CSS.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link to="/security" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom styles for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}

export default LandingPage