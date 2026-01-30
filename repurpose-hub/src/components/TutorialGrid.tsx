import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { requestUrl } from "@/lib/requestUrl"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


type TutorialType = {
    _id:string
    yt_link: string
    img_src: string
    timing: string
    author: string
    title: string
    desc: string
    date_added: string
    views: string
}


export default function TutorialGrid() {
  const [tutorials, setTutorials] = useState([]);
  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "allTutorials"
    }).then((res) => {
      console.log(res.data)
      setTutorials(res.data)
    }).catch((e)=>{
        console.error(e)
      })
  }, [])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {tutorials.map((tutorial:TutorialType) => (
          <Link key={tutorial._id} to={tutorial.yt_link} target="_blank" className="group">
            <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="p-0 overflow-hidden rounded-t-2xl">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={tutorial.img_src}
                    alt={tutorial.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-full">
                    {tutorial.timing}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {tutorial.author}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {tutorial.desc}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-6 pt-0 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400">
                  {tutorial.date_added}
                </span>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-black uppercase tracking-wider">
                  Watch Now
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
