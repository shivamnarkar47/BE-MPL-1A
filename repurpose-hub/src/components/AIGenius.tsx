import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Camera, Upload } from "lucide-react"
import axios from "axios"

const AIGenius = () => {
  const [image, setImage] = useState("")
  const [output, setOutput] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!image) return;

    // convert base64 into blob
    const response = await fetch(image);
    const blob = await response.blob();

    const imageFile = new File([blob], "image.jpg", {
      type: "image/jpg",
    });

    const formData = new FormData();
    formData.append("file", imageFile);
    
    await axios({
      method: "POST",
      url: "http://localhost:3000/upcycle/",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },

    }).then((res) => {
      console.log(res.data)
      setOutput(res.data)
    }).catch((e)=>{
      console.error("Error : ",e)
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mr-4"
              />
              <Button variant="outline" className="flex items-center">
                <Camera size={20} className="mr-2" />
                Take a photo
              </Button>
            </div>
            {image && (
              <img src={image} alt="Uploaded image" className="mt-4" />
            )}
            <Button onClick={handleSubmit} className="mt-4">
              <Upload size={20} className="mr-2" />
              Submit
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{output.suggestions}</p>
            {output && (
              <img src={`http://localhost:3000${output.image_url}`} alt="Uploaded image" className="mt-4" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AIGenius
