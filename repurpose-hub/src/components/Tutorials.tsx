import { BookOpen, PlayCircle, Clock } from "lucide-react"
import TutorialGrid from './TutorialGrid'

const Tutorials = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-40" />

      <div className="container mx-auto px-5 md:px-10 relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest shadow-sm">
            <BookOpen size={14} className="fill-emerald-600" />
            Learn & Create
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Upcycling <span className="text-emerald-600">Tutorials</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
            Transform everyday items into extraordinary creations with our step-by-step video tutorials. Learn sustainable crafting techniques from expert creators.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <PlayCircle size={20} className="fill-emerald-600" />
                <span className="text-3xl font-black">150+</span>
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Video Tutorials</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Clock size={20} className="fill-blue-600" />
                <span className="text-3xl font-black">50+</span>
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Hours of Content</div>
            </div>
          </div>
        </div>

        {/* Tutorial Grid */}
        <TutorialGrid />
      </div>
    </section>
  )
}

export default Tutorials
