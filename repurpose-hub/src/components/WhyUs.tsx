import { Search, Sparkles, Share2 } from "lucide-react"

const WhyUs = () => {
  const steps = [
    {
      id: 1,
      title: "Explore Materials",
      description: "Discover a variety of materials available for repurposing. From everyday items to unique finds, we have everything you need.",
      icon: <Search size={32} />,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      id: 2,
      title: "Get Inspired",
      description: "Browse our project ideas and tutorials to find inspiration. Whether you’re a beginner or a pro, we’ve got something for everyone!",
      icon: <Sparkles size={32} />,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 3,
      title: "Create & Share",
      description: "Bring your ideas to life! After completing your project, share your creations with our community. Celebrate sustainability together.",
      icon: <Share2 size={32} />,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600"
    }
  ]

  return (
    <section className="py-24 md:py-32 bg-slate-50" id="why-us">
      <div className="container mx-auto px-5 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em]">Easy Protocol</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">How it works</h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Transform your waste into valuable resources with Repurpose Hub. Follow these simple steps to get started on your sustainable journey!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-emerald-100 via-blue-100 to-amber-100 hidden lg:block -z-0" />

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 group">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-2">
                <div className={`w-20 h-20 ${step.lightColor} ${step.textColor} rounded-3xl flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500`}>
                  {step.icon}
                  <div className={`absolute -top-3 -right-3 w-8 h-8 ${step.color} text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg`}>
                    {step.id}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {step.title}
                </h3>

                <p className="text-slate-500 font-medium leading-relaxed">
                  {step.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-emerald-500 transition-colors">
                  Step {step.id} <div className="h-[2px] flex-1 bg-current opacity-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyUs
