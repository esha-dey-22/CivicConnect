"use client";
import { Github, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
  ];

  const footerLinks = [
    { title: 'Product', items: ['Features', 'Pricing', 'Security'] },
    { title: 'Company', items: ['About', 'Blog', 'Careers'] },
    { title: 'Support', items: ['Help Center', 'Contact', 'FAQ'] },
  ];

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 text-gray-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 text-center sm:px-6 md:grid-cols-4 md:text-left">
        {/* Brand */}
        <div>
          <h3 className="mb-4 text-2xl font-bold text-indigo-400">CivicConnect</h3>
          <p className="text-sm mb-6">
            Connecting communities with smart civic tools.
          </p>
          <div className="flex justify-center gap-4 md:justify-start">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Link Columns */}
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h4 className="mb-4 font-semibold text-white">{section.title}</h4>
            <ul className="space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm">
        <p className="text-gray-500">
          © {new Date().getFullYear()} CivicConnect. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-gray-500">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
