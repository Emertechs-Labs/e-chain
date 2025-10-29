'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaTwitter, FaGithub, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  
  const handleSubscriptionChange = (checked: boolean) => {
    setIsSubscribed(checked);
    if (checked && email) {
      // Handle subscription logic here
      console.log('Subscribed with email:', email);
      // You can add your subscription API call here
    } else if (!checked) {
      // Handle unsubscribe logic here
      console.log('Unsubscribed');
    }
  };
  
  const socialLinks = [
    { name: 'Twitter', icon: <FaTwitter className="w-5 h-5" />, href: 'https://x.com/eventsonchain' },
    { name: 'GitHub', icon: <FaGithub className="w-5 h-5" />, href: 'https://github.com/emertechs-Labs/echain' },
    { name: 'Facebook', icon: <FaFacebook className="w-5 h-5" />, href: 'https://www.facebook.com/share/1JQeq5La3v/' },
    { name: 'Instagram', icon: <FaInstagram className="w-5 h-5" />, href: 'https://www.instagram.com/eventsonchain' },
    { name: 'WhatsApp', icon: <FaWhatsapp className="w-5 h-5" />, href: 'https://chat.whatsapp.com/KKZ6Z9SOUfHIKwFVWzWI6t' },
  ];
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Marketplace', href: '/events' },
        { name: 'Create Event', href: '/events/create' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Guides', href: '/guides' },
        { name: 'API Status', href: '/status' },
        { name: 'Help Center', href: '/support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Echain
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The future of event ticketing powered by blockchain technology. Creating transparent, secure, and engaging experiences.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                  aria-label={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase mb-4">
              SHARE YOUR FEEDBACK
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest updates, news and product offers.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (email) {
                      try {
                        const response = await fetch('/api/feedback', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            rating: 5, // Default positive rating for newsletter signup
                            category: 'general',
                            message: `Newsletter subscription request from: ${email}`,
                            email: email,
                            url: window.location.href,
                            sessionId: `newsletter_${Date.now()}`
                          })
                        })

                        if (response.ok) {
                          console.log('Newsletter feedback submitted successfully');
                          alert('Thank you for subscribing! We\'ll keep you updated.');
                          setEmail('');
                        } else {
                          throw new Error('Failed to submit');
                        }
                      } catch (error) {
                        console.error('Error submitting newsletter feedback:', error);
                        alert('Failed to subscribe. Please try again.');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 whitespace-nowrap"
                >
                  Submit
                </button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSubscribed}
                  onChange={(e) => handleSubscriptionChange(e.target.checked)}
                  className="w-5 h-5 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">
                  {isSubscribed ? 'Subscribed to newsletter' : 'Subscribe to newsletter'}
                </span>
              </label>
            </form>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} Echain. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
