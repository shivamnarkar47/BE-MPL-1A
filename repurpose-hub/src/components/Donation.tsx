
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import { requestUrl } from "@/lib/requestUrl"
import { getCookie } from "@/lib/getUser"

interface ClothItem {
  id: number
  quantity: number
  clothType: string
}

interface Donation {
  id: number
  items: ClothItem[]
  user: string
  coins: number
}

export default function Donation() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [currentItems, setCurrentItems] = useState<ClothItem[]>([])
  const user = getCookie();
  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "donations",
    }).then((res) => {
      console.log(res.data)
      setDonations(res.data)
    }).catch((e) => {
      console.log("useEfect" + e)
    })
  }, [])
  const addItem = () => {
    setCurrentItems([...currentItems, { id: Date.now(), quantity: 1, clothType: "" }])
  }

  const removeItem = (id: number) => {
    setCurrentItems(currentItems.filter(item => item.id !== id))
  }

  const updateItem = (id: number, field: 'quantity' | 'clothType', value: number | string) => {
    setCurrentItems(currentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentItems.length > 0 && currentItems.every(item => item.quantity > 0 && item.clothType)) {
      const newDonation: Donation = {
        id: Date.now(),
        items: currentItems,
        user: user?.id,
        coins: 1
      }
      requestUrl({
        method: 'POST',
        endpoint: "donations",
        data: newDonation
      }).then((res) => {
        console.log(res.data)
        setDonations([newDonation, ...donations])
        setCurrentItems([])
      }).catch((e) => {
        console.log(e)
      })
    }
  }

  return (
    <div className="container mx-auto mt-20 p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Upcycling Donations</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentItems.map((item, index) => (
              <div key={index} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`clothType-${item.id}`}>Type of Cloth</Label>
                  <Select
                    value={item.clothType}
                    onValueChange={(value) => updateItem(item.id, 'clothType', value)}
                    required
                  >
                    <SelectTrigger id={`clothType-${item.id}`}>
                      <SelectValue placeholder="Select cloth type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shirts">Shirts</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="jackets">Jackets</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="ghost" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button type="submit" className="w-full -z-30" disabled={currentItems.length === 0}>
              Create Donation
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Recent Donations</h2>
      {donations.length > 0 ? (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Donation #{donation.id}</h3>
                <ul className="list-disc list-inside">
                  {donation.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity} {item.quantity > 1 ? "items" : "item"} of {item.clothType}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No donations yet. Be the first to donate!</p>
      )}
    </div>
  )
}
