import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { requestUrl } from "@/lib/requestUrl"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { Separator} from "@/components/ui/separator"


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
    <div className=" h-full mx-0 p-10 md:mx-auto py-8 ">
      <h1 className="text-3xl font-bold mb-3">Latest Tutorials</h1>
      <Separator className="mb-5"/>
      <div className="max-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial:TutorialType) => (
          <Link key={tutorial._id} to={tutorial.yt_link} target="_blank">

          <Card  className="flex flex-col w-[300px] md:w-10/12 hover:bg-gray-300 transition">
            <CardHeader className="p-0">
              <img
                src={tutorial.img_src}
                alt={tutorial.title}
                width={300}
                height={200}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{tutorial.timing}</span>
                <span className="text-sm text-muted-foreground">{tutorial.author}</span>
                
              </div>
              <h2 className="text-xl font-bold mb-2">{tutorial.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{tutorial.desc}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-muted">
              <span className="text-sm text-muted-foreground">{tutorial.date_added}</span>
              {/* <span className="text-sm text-muted-foreground">{tutorial.views} views</span> */}
            </CardFooter>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
