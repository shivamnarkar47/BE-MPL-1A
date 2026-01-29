import { Link } from "react-router-dom"
import { Github, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500/5 rounded-full blur-3xl -z-0" />

      <div className="container mx-auto px-5 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Logo & Info */}
          <div className="space-y-6">
            <Link to={'/'} className="inline-block">
              <h1 className="text-3xl font-black tracking-tighter text-white">
                Repurpose <span className="text-emerald-500">Hub.</span>
              </h1>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed">
              Premium upcycled curation studio dedicated to artisanal sustainability and a greener future.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-white/10">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'Marketplace', 'Tutorials', 'Donations'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-colors font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Connect</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-400">
                <Mail size={18} className="text-emerald-500" />
                <span className="font-medium">contact@repurposehub.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone size={18} className="text-emerald-500" />
                <span className="font-medium">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin size={18} className="text-emerald-500 shrink-0" />
                <span className="font-medium">Repurpose Hub Studio,<br />Artisan District, MH</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Repurpose Hub. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
