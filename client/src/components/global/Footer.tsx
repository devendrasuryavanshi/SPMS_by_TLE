import React from "react";
import { GraduationCap, Github, Linkedin, Mail, Clock, BarChart3, Users, Calendar, TrendingUp } from "lucide-react";
import { Link } from "@nextui-org/react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  if (window.location.pathname.startsWith("/student/")) {
    return null;
  }

  const footerLinks = [
    {
      title: "Student Management",
      links: [
        { name: "Student Profiles", path: "/students", icon: <Users size={14} /> },
        { name: "Contest History", path: "/contest-tracker", icon: <Calendar size={14} /> },
        { name: "Problem Analytics", path: "/problems", icon: <BarChart3 size={14} /> },
        { name: "Performance Tracking", path: "/performance", icon: <TrendingUp size={14} /> }
      ]
    },
    {
      title: "System Features",
      links: [
        { name: "Codeforces Sync", path: "/sync-settings", icon: <Clock size={14} /> },
        { name: "Inactivity Detection", path: "/inactivity", icon: <Mail size={14} /> },
        { name: "Data Management", path: "/data-management", icon: <BarChart3 size={14} /> },
        { name: "Email Notifications", path: "/notifications", icon: <Mail size={14} /> }
      ]
    },
    {
      title: "Analytics & Reports",
      links: [
        { name: "Rating Graphs", path: "/rating-analysis", icon: <TrendingUp size={14} /> },
        { name: "Submission Heatmaps", path: "/heatmaps", icon: <BarChart3 size={14} /> },
        { name: "Problem Difficulty Stats", path: "/difficulty-stats", icon: <BarChart3 size={14} /> },
        { name: "Contest Performance", path: "/contest-performance", icon: <Calendar size={14} /> }
      ]
    }
  ];

  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "https://github.com/devendrasuryavanshi"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "https://www.linkedin.com/in/devendrasuryavanshi/"
    },
    {
      name: "Email",
      icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "mailto:devendrasooryavanshee@gmail.com"
    }
  ];

  return (
    <footer className="w-full py-8 sm:py-12 px-4 bg-surface dark:bg-surface-dark border-t border-secondary/20 dark:border-secondary-dark/20 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={24} className="text-primary dark:text-primary-dark" />
              <span className="font-bold text-xl text-text-primary dark:text-text-primary-dark">SPMS</span>
            </div>
            <p className="text-sm text-secondary dark:text-secondary-dark mb-4 leading-relaxed">
              Student Progress Management System - Comprehensive platform for tracking competitive programming progress,
              contest performance, and problem-solving analytics.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background dark:bg-background-dark text-secondary dark:text-secondary-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10 hover:text-primary dark:hover:text-primary-dark transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.path}
                      className="flex items-center gap-2 text-sm text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary/20 dark:border-secondary-dark/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-secondary dark:text-secondary-dark">
              © {currentYear} SPMS - Student Progress Management System. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/api-docs"
                className="text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                API Documentation
              </Link>
              <Link
                href="/support"
                className="text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
