import { Link } from 'react-router-dom'
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 mb-3">
            🐝 TaskMint
          </Link>
          <p className="text-green-300 text-sm">
            Complete micro-tasks and earn real money. Join thousands of workers and buyers on our platform.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-green-300 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3">Follow Us</h3>
          <div className="flex gap-4 text-2xl">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors"><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors"><FaLinkedin /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors"><FaTwitter /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-green-400 text-sm mt-8 border-t border-green-700 pt-4">
        © {new Date().getFullYear()} TaskMint. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
