import { ChevronRight, ArrowRight, Star, Leaf } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const Hero = () => {
  return (
    <header id="home" className="relative min-h-[90vh] flex items-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 rounded-l-[300px] blur-3xl -z-10 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />

      <div className="container mx-auto px-5 md:px-10 py-40 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12  items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest shadow-sm">
              <Leaf size={14} className="fill-emerald-600" />
              Sustainability First
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Transforming <span className="text-emerald-600">Waste</span> into Sustainable Solutions.
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              Give New Life to the Old, and Shape a Greener Tomorrow! Join the movement of repurposed luxury and artisanal sustainability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/10 group">
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <a href="#about">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 border-slate-200 text-slate-900 font-black text-lg hover:bg-slate-50 transition-all active:scale-95">
                  Learn More
                  <ChevronRight className="ml-1" />
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className="fill-yellow-500" />)}
                  <span className="text-slate-900 font-black text-sm ml-1">4.9/5</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by 2k+ Eco-Enthusiasts</p>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/20 transform lg:rotate-3 hover:rotate-0 transition-transform duration-700">
              <img
                src="https://tinybeans.com/wp-content/uploads/2022/03/upcycledcrafts_istock.jpg"
                alt="Upcycled Crafts"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
            </div>

            {/* Floating Glass Cards */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 max-w-[200px] animate-bounce-slow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Leaf size={20} />
                </div>
                <div className="font-black text-slate-900 leading-none">
                  <span className="text-2xl">500+</span>
                  <p className="text-[10px] text-slate-400 uppercase">Items Saved</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 z-20 bg-white/70 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50 animate-float">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={16} />
                <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Premium quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Hero
