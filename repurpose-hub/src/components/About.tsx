import { Target, Heart, ShieldCheck } from "lucide-react"

const About = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60" />

      <div className="container mx-auto px-5 md:px-10">
        <div className="max-w-3xl mb-16 md:mb-24 space-y-4">
          <div className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em]">The Story Behind</div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Meet <span className="text-emerald-600">RePurpose Hub</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
            RePurpose Hub is your destination for eco-friendly upcycling and sustainable living. We empower individuals and communities to transform discarded items into valuable resources.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2.5rem] rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10" />
            <img
              src="https://cdn.pixabay.com/photo/2018/12/08/03/52/upcycling-3862781_640.jpg"
              alt="Upcycling Workshop"
              className="w-full h-[500px] rounded-[2rem] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl animate-float max-w-[200px]">
              <div className="text-4xl font-black text-emerald-400 mb-1">10k+</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pounds of Waste Diverted Yearly</div>
            </div>
          </div>

          <div className="space-y-12 lg:pl-10">
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <Target size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Our Mission</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    At Repurpose Hub, we are dedicated to transforming waste into valuable resources. We believe in the power of creativity and sustainability, striving to create a community where innovative ideas flourish.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                  <Heart size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Our Community</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    We provide a collaborative space that encourages experimentation, learning, and sharing. By fostering partnerships, we aim to cultivate a culture of sustainability.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Our Responsibility</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Join us in our journey to make repurposing a way of life, where every item has the potential for a second chance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
