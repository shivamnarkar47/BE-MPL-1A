import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Camera, Upload, Recycle, Lightbulb } from "lucide-react"
import axios from "axios"

const AIGenius = () => {
  const [image, setImage] = useState("")
  const [language, setLanguage] = useState("en")
  const [output, setOutput] = useState({
    suggestions: "",
    image_url: "",
    recyclable_info: "",
    recycling_steps: [] as string[],
    detected_object: "",
    tts_url: ""
  })
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!image) return
    setLoading(true)

    try {
      // Convert base64 → Blob → File
      const response = await fetch(image)
      const blob = await response.blob()
      const imageFile = new File([blob], "image.jpg", { type: "image/jpg" })

      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("language", language)

      const res = await axios.post("http://localhost:3001/upcycle/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setOutput(res.data)
    } catch (error) {
      console.error("Error:", error)
      alert("Error processing image. Check backend logs.")
    } finally {
      setLoading(false)
    }
  }

  // 🎧 Auto play TTS whenever new audio URL is received
  useEffect(() => {
    if (output.tts_url) {
      const audio = new Audio(`http://localhost:3001${output.tts_url}`)
      audio.play().catch(err => console.warn("Autoplay failed:", err))
    }
  }, [output.tts_url])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Item for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              <Button variant="outline" className="flex items-center">
                <Camera size={18} className="mr-2" />
                Take a photo
              </Button>
            </div>

            {/* 🌐 Language Toggle */}
            <div className="flex items-center space-x-2 mt-3">
              <label htmlFor="lang" className="font-medium">Language:</label>
              <select
                id="lang"
                className="border rounded-md p-2 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {image && (
              <img
                src={image}
                alt="Uploaded image"
                className="mt-4 rounded-lg border shadow-sm max-h-64 object-cover w-full"
              />
            )}

            <Button
              onClick={handleSubmit}
              className="mt-4 flex items-center justify-center"
              disabled={loading || !image}
            >
              {loading ? "Processing..." : (
                <>
                  <Upload size={18} className="mr-2" />
                  Analyze Item
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          {output.detected_object ? (
            <div className="space-y-6">
              {/* Detected Object */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Detected Object:</h3>
                <p className="text-lg font-bold text-blue-900">{output.detected_object}</p>
              </div>

              {/* Upcycling Suggestions */}
              {output.suggestions && output.suggestions !== "No specific upcycling idea found." && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-800">Upcycling Ideas</h3>
                  </div>
                  <p className="whitespace-pre-line text-yellow-700">
                    {output.suggestions}
                  </p>

                  {output.image_url && (
                    <img
                      src={`http://localhost:3001${output.image_url}`}
                      alt="Upcycling idea"
                      className="mt-3 rounded-lg shadow-md max-h-48 object-cover w-full"
                    />
                  )}
                </div>
              )}

              {/* Recycling Information */}
              {output.recyclable_info && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Recycle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">Recycling Information</h3>
                  </div>
                  <p className="text-green-700 font-medium mb-3">
                    ♻️ {output.recyclable_info}
                  </p>

                  {/* Recycling Steps */}
                  {output.recycling_steps && output.recycling_steps.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-green-800 mb-2">How to Recycle:</h4>
                      <ul className="space-y-2">
                        {output.recycling_steps.map((step, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Player */}
              {output.tts_url && (
                <div className="bg-purple-50 p-4 rounded-lg hidden">
                  <h3 className="font-semibold text-purple-800 mb-2">Audio Guide</h3>
                  <audio 
                    controls 
                    className="w-full"
                    src={`http://localhost:3001${output.tts_url}`}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Recycle className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">Upload an image to analyze recyclability and get upcycling ideas.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AIGenius