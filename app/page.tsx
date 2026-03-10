"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Square,
  Menu,
  X,
  Check,
  Plus,
  Minus,
  Send,
  Users,
  BarChart3,
} from "lucide-react";
export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0B0F19] text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2">
              <Square className="w-5 h-5 fill-white text-white" />
              <span className="text-xl font-semibold tracking-wide font-poppins">
                Insurance
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-sm font-medium hover:text-[#C6F200] transition-colors"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-sm font-medium hover:text-[#C6F200] transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm font-medium hover:text-[#C6F200] transition-colors"
              >
                About Us
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-[#C6F200] transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="text-sm font-medium hover:text-[#C6F200] transition-colors"
              >
                Contact Us
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/auth/login"
                className="bg-[#C6F200] text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors"
              >
                Sign in
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0B0F19] border-t border-gray-800 p-4 space-y-4">
            <a
              href="#home"
              onClick={closeMobileMenu}
              className="block text-sm font-medium hover:text-[#C6F200]"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="block text-sm font-medium hover:text-[#C6F200]"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={closeMobileMenu}
              className="block text-sm font-medium hover:text-[#C6F200]"
            >
              About Us
            </a>
            <a
              href="#pricing"
              onClick={closeMobileMenu}
              className="block text-sm font-medium hover:text-[#C6F200]"
            >
              Pricing
            </a>
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="block text-sm font-medium hover:text-[#C6F200]"
            >
              Contact Us
            </a>
            <Link
              href="/auth/login"
              className="w-full block text-center bg-[#C6F200] text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#b0d600]"
            >
              Sign in
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-[#0B0F19] pt-10 pb-12 relative overflow-hidden scroll-mt-24"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-[#0e3b5e] via-40% to-cyan-500 opacity-90 blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-tight mb-6 font-poppins">
            The Complete Governance Platform
            <br />
            for <span className="text-[#C6F200]">Corporate Insurance</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
            A centralized repository for all insurance artifacts to ensure zero
            compliance gaps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-[#C6F200] text-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard/admin"
              className="w-full sm:w-auto bg-white text-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
              Try Demo
            </Link>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="bg-gray-900 px-3 py-1 rounded text-xs text-gray-400 ml-4 w-64">
                insurance-platform.com/dashboard
              </div>
            </div>
            <div className="p-6 bg-[#0F1218] min-h-[400px] text-left">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Mock */}
                <div className="w-full md:w-64 space-y-6 hidden md:block">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 text-[#C6F200] rounded-lg text-sm font-medium">
                      <Square className="w-4 h-4" /> Home
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
                      <BarChart3 className="w-4 h-4" /> Reporting
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
                      <Users className="w-4 h-4" /> Users
                    </div>
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-white text-xl font-semibold font-poppins">
                      Insurance Overview
                    </h3>
                    <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">
                      + Add Customer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">
                        Total Customers
                      </div>
                      <div className="text-white text-2xl font-semibold">
                        2,420
                      </div>
                      <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                        ↑ 20%
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">Members</div>
                      <div className="text-white text-2xl font-semibold">
                        1,210
                      </div>
                      <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                        ↑ 15%
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">
                        Active Now
                      </div>
                      <div className="text-white text-2xl font-semibold">
                        316
                      </div>
                      <div className="flex -space-x-2 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gray-600 border border-gray-800"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fake Table */}
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-700">
                      <span>Company</span>
                      <span>Status</span>
                      <span>Users</span>
                      <span>License</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm text-gray-300"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gray-700"></div>{" "}
                          Company {i}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 text-xs">
                          Active
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-[#C6F200]"></div>
                        </div>
                        <span>Pro</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 font-medium mb-8">
            Trusted by over 200+ Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-70">
            {/* Text-based Logos for simulation */}
            <span className="text-xl font-bold font-serif">ASPEN</span>
            <span className="text-xl font-bold italic">Crop & Highlight</span>
            <span className="text-2xl font-bold">N</span>
            <span className="text-xl font-light tracking-widest">Millssy</span>
            <span className="text-lg font-semibold">Peppermint</span>
            <span className="text-lg font-bold flex items-center gap-1">
              <div className="w-4 h-4 bg-black rounded-full"></div> Pixie Labs
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-12 bg-gray-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 font-poppins">
              Everything You Need to
              <br />
              Manage Your Insurance in{" "}
              <span className="text-blue-600">One Platform</span>
            </h2>
            <p className="text-gray-500">
              From quotation comparison and approvals to claims settlement and
              renewals, across every unit and risk location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-200 rounded-xl mb-6 flex items-center justify-center">
                  {/* Placeholder Graphic */}
                  <div className="text-gray-400 font-medium">
                    Feature Graphic {item}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
                  Feature {item}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                  id luctus felis. Curabitur id venenatis augue. Praesent
                  tincidunt massa vel aliquam fermentum.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="about" className="py-12 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4 font-poppins">
              Trusted by Businesses Across Industries
            </h2>
            <p className="text-gray-500">
              Empowering businesses across Industries with a smarter Insurance
              Management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-50 p-6 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      Wade Warren{" "}
                      {i <= 3 && (
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full ml-1"
                          title="Verified"
                        ></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Penthouse Studios
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id luctus felis. Curabitur id venenatis augue. Praesent tincidunt massa vel aliquam fermentum."
                  }
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-[#C6F200] text-black px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors">
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 bg-gray-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4 font-poppins">
              Flexible Plans for Every Business
            </h2>
            <p className="text-gray-500">
              We provide flexible pricing plans designed to fit the size and
              needs of your business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Starter */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-poppins">
                Starter Plan
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">$29.00</span>
              </div>
              <p className="text-sm text-gray-500 mb-8">7 Days Free Trial</p>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>

              <ul className="space-y-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Lorem ipsum dolor sit amet.
                  </li>
                ))}
                {[1, 2].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-400"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                      <X className="w-3 h-3" />
                    </div>
                    Lorem ipsum dolor sit amet.
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#C6F200] text-black py-3 rounded-full text-sm font-semibold hover:bg-[#b0d600]">
                Get Started
              </button>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-[#0B2132] p-8 rounded-2xl border border-gray-800 transform lg:-translate-y-4 shadow-xl relative">
              <h3 className="text-xl font-medium text-white mb-2 font-poppins">
                Pro Plan
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$59.00</span>
              </div>
              <p className="text-sm text-gray-400 mb-8">7 Days Free Trial</p>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Best
                for growing teams.
              </p>

              <ul className="space-y-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center text-[#C6F200] shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Lorem ipsum dolor sit amet.
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-red-900/20 flex items-center justify-center text-red-800 shrink-0">
                    <X className="w-3 h-3" />
                  </div>
                  Lorem ipsum dolor sit amet.
                </li>
              </ul>
              <button className="w-full bg-[#C6F200] text-black py-3 rounded-full text-sm font-semibold hover:bg-[#b0d600]">
                Get Started
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-poppins">
                Enterprise Plan
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">$99.00</span>
              </div>
              <p className="text-sm text-gray-500 mb-8">7 Days Free Trial</p>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>

              <ul className="space-y-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Lorem ipsum dolor sit amet.
                  </li>
                ))}
              </ul>
              <button className="w-full bg-[#C6F200] text-black py-3 rounded-full text-sm font-semibold hover:bg-[#b0d600]">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4 font-poppins">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500">
              Find clear and detailed answers to the most common questions about
              our platform.
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <button
                  className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="text-lg font-medium text-gray-900">
                    0{i} Frequently Asked Question {i}
                  </span>
                  {openFaqIndex === i ? (
                    <Minus className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaqIndex === i && (
                  <div className="pb-4 text-gray-500 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Duis id luctus felis. Curabitur id venenatis augue. Praesent
                    tincidunt massa vel aliquam fermentum. Vivamus ut gravida
                    lacus. Nulla ut libero a urna placerat efficitur ut nec sem.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto bg-[#0E3B5E] rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-[#0e3b5e] to-[#0a2740] opacity-100 z-0"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 font-poppins">
              For all your Insurance Policy Management Needs
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-10">
              A centralized repository for all insurance artifacts to ensure
              zero compliance gaps.
            </p>
            <Link
              href="/auth/signup"
              className="bg-[#C6F200] text-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-white pt-16 pb-8 border-t border-gray-100 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Square className="w-5 h-5 fill-black text-black font-poppins" />
                <span className="text-xl font-semibold tracking-wide">
                  Insurance
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
                Join Hundreds of businesses already transforming their policy
                management process
              </p>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200"
                  ></div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-6 font-poppins">
                Company
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Career
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Testimonial
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-6 font-poppins">
                Product
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <a href="#features" className="hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-6 font-poppins">
                Newsletter
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Subscribe to our newsletter
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div>All rights reserved</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600">
                Cookies Policy
              </a>
              <a href="#" className="hover:text-gray-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-600">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
