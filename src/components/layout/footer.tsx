'use client'

import Link from 'next/link'
import { Instagram, Facebook, Linkedin } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    "Find Freelancers": [
      "Web Development",
      "UI/UX Design", 
      "Content Writing",
      "Digital Marketing"
    ],
    "For Freelancers": [
      "Create Profile",
      "Browse Projects",
      "Get Hired",
      "Earn Money"
    ],
    "For Clients": [
      "Post a Project",
      "Hire Freelancers",
      "Manage Projects",
      "Payment Protection"
    ]
  }

  return (
    <footer className="bg-gray-900 text-white py-16 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Contact */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Huma GPT</h3>
            <p className="text-gray-400 mb-4">
              AI-powered platform connecting clients with skilled freelancers worldwide.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>hello@humagpt.com</p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Huma GPT. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
