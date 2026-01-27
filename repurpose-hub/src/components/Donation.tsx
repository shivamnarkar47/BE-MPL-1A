import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PlusCircle,
  Trash2,
  Leaf,
  TrendingUp,
  MapPin,
  Truck,
  BookOpen,
  Gift,
  Clock,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react"
import { requestUrl } from "@/lib/requestUrl"
import { getCookie } from "@/lib/getUser"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ClothItem {
  id: number
  quantity: number
  clothType: string
}

interface Donation {
  id: string
  items: ClothItem[]
  user: string
  coins: number
  status?: string
}

const ECO_PARTNERS = [
  { name: "Green Threads Hub", address: "123 Eco St, Mumbai", types: "All Fabric", impact: "High" },
  { name: "Reuse Collective", address: "45 Sustainable Ave, Delhi", types: "Cotton Only", impact: "Medium" },
  { name: "Vastra Donate", address: "8 Recycle Blvd, Bangalore", types: "Denim & Wool", impact: "Premium" },
];

export default function Donation() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [currentItems, setCurrentItems] = useState<ClothItem[]>([])
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const user = getCookie();

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "donations",
    }).then((res) => {
      setDonations(res.data)
    }).catch((e) => {
      console.log("Donation fetch error:", e)
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
        id: Date.now().toString(),
        items: currentItems,
        user: user?.id,
        coins: Math.floor(currentItems.length * 10), // Give more coins for more items
        status: "Processing"
      }
      requestUrl({
        method: 'POST',
        endpoint: "donations",
        data: newDonation
      }).then(() => {
        setDonations([newDonation, ...donations])
        setCurrentItems([])
      }).catch((e) => console.log(e))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-10">
      <div className="max-w-[1400px] mx-auto space-y-12">

        {/* Hero & Impact Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
              <Leaf className="w-3 h-3" />
              Circular Economy
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight">Donation Hub</h1>
            <p className="text-slate-500 text-lg font-medium max-w-xl">
              Give your clothes a second life. Every donation helps reduce textile waste and earns you sustainability coins.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none bg-emerald-600 text-white rounded-[2rem] shadow-xl p-6 flex flex-col justify-between">
              <TrendingUp className="w-6 h-6 opacity-50" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">CO2 Offset</p>
                <h3 className="text-3xl font-black">12.4kg</h3>
              </div>
            </Card>
            <Card className="border-none bg-white rounded-[2rem] shadow-xl p-6 flex flex-col justify-between border border-slate-100">
              <Gift className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Coins</p>
                <h3 className="text-3xl font-black text-slate-900">{donations.reduce((acc, d) => acc + (d.coins || 0), 0)}</h3>
              </div>
            </Card>
          </div>
        </section>

        {/* Main Interface: Form & Explorer */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Create Donation (Bento Item) */}
          <Card className="xl:col-span-7 border-none bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <PlusCircle className="w-6 h-6 text-emerald-600" />
                  Collection Basket
                </CardTitle>
                <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full border-emerald-200 text-emerald-700 flex items-center gap-2 hover:bg-emerald-50">
                      <Truck className="w-4 h-4" />
                      <span className="text-xs font-bold">Schedule Pickup</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] bg-white border-none shadow-3xl p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900">Feature Coming Soon!</h2>
                      <p className="text-slate-500 font-medium">We're partnering with local logistics to bring seamless doorstep pickup to your area. Stay tuned!</p>
                    </div>
                    <Button onClick={() => setIsComingSoonOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Great, I'll wait!</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <div key={item.id} className="group flex items-end gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                            className="bg-white rounded-xl border-slate-200 h-12 text-center font-bold"
                            required
                          />
                        </div>
                        <div className="flex-[3] space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cloth Type</Label>
                          <Select
                            value={item.clothType}
                            onValueChange={(value) => updateItem(item.id, 'clothType', value)}
                            required
                          >
                            <SelectTrigger className="bg-white rounded-xl border-slate-200 h-12 font-bold focus:ring-emerald-500">
                              <SelectValue placeholder="What are you donating?" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-2">
                              <SelectItem value="shirts">👕 Shirts & Tops</SelectItem>
                              <SelectItem value="pants">👖 Pants & Trousers</SelectItem>
                              <SelectItem value="dresses">👗 Dresses</SelectItem>
                              <SelectItem value="jackets">🧥 Jackets & Coats</SelectItem>
                              <SelectItem value="other">🧵 Fabric / Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="h-48 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-3">
                      <PlusCircle className="w-10 h-10 opacity-20" />
                      <p className="font-bold uppercase text-[10px] tracking-widest">Empty Basket</p>
                    </div>
                  )}

                  <Button type="button" variant="outline" onClick={addItem} className="w-full h-14 rounded-2xl border-dashed border-2 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-black text-xs uppercase tracking-widest">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item to Basket
                  </Button>
                </div>

                <Button type="submit" disabled={currentItems.length === 0} className="w-full h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-30">
                  <Sparkles className="mr-2 w-6 h-6" />
                  CONFIRM DONATION
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Column: Locator & Explorer (Bento) */}
          <div className="xl:col-span-5 space-y-8">
            {/* Guide Card */}
            <Card className="border-none bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Donation Guide
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-medium tracking-wide leading-relaxed">Ensure your items reach their full potential.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-white/5 font-black text-[10px] uppercase">Details</Button>
              </div>
              <div className="grid grid-cols-1 gap-3 relative">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-200">Washed & Dried Items</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-200">Separated by Material</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs font-bold text-slate-200">No Heavily Soiled Rags</span>
                </div>
              </div>
            </Card>

            {/* Locator Card */}
            <Card className="border-none bg-white rounded-[2.5rem] shadow-xl p-8 space-y-6 flex flex-col overflow-hidden">
              <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900 mb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Eco-Partner Locator
              </CardTitle>
              <div className="space-y-4">
                {ECO_PARTNERS.map((partner, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all hover:bg-slate-900 hover:text-white">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-black uppercase tracking-widest">{partner.name}</h4>
                      <p className="text-[10px] opacity-60 font-medium">{partner.address}</p>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-white/10 border border-white/5">{partner.types}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-emerald-600 font-bold p-0 justify-start text-xs flex items-center gap-1 group">
                Explore All Centers <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">Your Activity</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sustainability Timeline</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="rounded-full flex items-center gap-2"><Clock className="w-4 h-4" /> <span className="text-xs font-bold">Past 30 Days</span></Button>
            </div>
          </div>

          {donations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation, idx) => (
                <Card key={donation.id} className="border-none bg-white rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden group animate-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                  <CardContent className="p-8 space-y-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch #{donation.id.toString().slice(-4)}</p>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-xl">Donation</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-bold uppercase tracking-tighter">{donation.status || "Completed"}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-slate-100 font-black text-emerald-600 text-sm">
                        +{donation.coins}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 border-slate-50">Items Catalog</p>
                      <ul className="space-y-2">
                        {donation.items.map((item, index) => (
                          <li key={index} className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-emerald-500 transition-colors" />
                              {item.clothType}
                            </span>
                            <span className="text-xs font-black text-slate-400">×{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 italic">
                        <Info className="w-3 h-3" />
                        Earned Sustainability Badges
                      </p>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="text-slate-300 w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Your journey hasn't started yet</p>
                <p className="text-slate-300 text-xs font-medium">Make your first donation above to earn coins.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
