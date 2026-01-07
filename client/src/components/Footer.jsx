import { Mail, Phone, MapPin, X, Github, Linkedin } from "lucide-react";
// import logo from ""
import logo from "../images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo & About */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img
              src={logo}
              alt="CivicIssueReporter Logo"
              className="w-10 h-10"
            />
            <h2 className="text-lg font-semibold">CivicTracks</h2>
          </div>
          <p className="text-sm text-gray-600">
            Empowering communities to report and resolve civic issues through
            technology and civic engagement.
          </p>

          <div className="flex space-x-4 mt-4">
            <X className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
            <Github className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
            <Linkedin className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#">Report Issue</a></li>
            <li><a href="#">View Reports</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Community Guidelines</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>support@civicTracks.com</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+91 0123456789</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>
                123 Civic Center, <br /> Community City, CC 12345
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t mt-6 py-4 text-center text-sm text-gray-500">
        © 2024 CivicTracks. All rights reserved. Building better
        communities together.
      </div>
    </footer>
  );
}
