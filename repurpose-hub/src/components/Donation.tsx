import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  ShoppingCart,
  Package,
  CheckCircle2,
  Recycle,
  ArrowRight,
  Heart,
  Loader2,
  AlertCircle,
  Minus,
  Plus
} from "lucide-react"
import { requestUrl } from "@/lib/requestUrl"
import { getCookie } from "@/lib/getUser"
import { useGuestCart } from "@/contexts/GuestCartContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

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
  createdAt?: string
}

interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  companyname: string
  imageurl: string
  stock: number
}

const ECO_PARTNERS = [
  { name: "Green Threads Hub", address: "123 Eco St, Mumbai", types: "All Fabric", impact: "High", distance: "2.5 km" },
  { name: "Reuse Collective", address: "45 Sustainable Ave, Delhi", types: "Cotton Only", impact: "Medium", distance: "4.2 km" },
  { name: "Vastra Donate", address: "8 Recycle Blvd, Bangalore", types: "Denim & Wool", impact: "Premium", distance: "5.8 km" },
  { name: "EcoFiber Foundation", address: "42 Greenway Rd, Mumbai", types: "All Types", impact: "High", distance: "1.8 km" },
  { name: "Threads of Hope", address: "78 Unity Lane, Delhi", types: "Casual Wear", impact: "Medium", distance: "3.1 km" },
]

const CLOTH_TYPE_MAP: Record<string, string> = {
  "shirts": "Shirts & Tops",
  "pants": "Pants & Trousers",
  "dresses": "Dresses",
  "jackets": "Jackets & Coats",
  "other": "Fabric / Other",
}

export default function Donation() {
  const navigate = useNavigate()
  const [donations, setDonations] = useState<Donation[]>([])
  const [currentItems, setCurrentItems] = useState<ClothItem[]>([])
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [userCartItems, setUserCartItems] = useState<CartItem[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalCoins, setTotalCoins] = useState(0)
  const user = getCookie()
  const { guestCartItems, removeFromGuestCart } = useGuestCart()

  useEffect(() => {
    fetchDonations()
    calculateTotalCoins()
  }, [])

  useEffect(() => {
    if (isCartModalOpen) {
      loadCartItems()
    }
  }, [isCartModalOpen])

  const fetchDonations = async () => {
    try {
      const res = await requestUrl({
        method: "GET",
        endpoint: "donations",
      })
      setDonations(res.data || [])
    } catch (e) {
      console.error("Donation fetch error:", e)
      toast.error("Failed to load donation history")
    }
  }

  const calculateTotalCoins = () => {
    const coins = donations.reduce((acc, d) => acc + (d.coins || 0), 0)
    setTotalCoins(coins)
  }

  const loadCartItems = async () => {
    setIsLoadingCart(true)
    try {
      // Load guest cart items
      setCartItems(guestCartItems || [])

      // Load user cart items if logged in
      if (user?.id) {
        const response = await requestUrl({
          method: "GET",
          endpoint: `cart/${user.id}`,
        })
        if (response.data && response.data[0]?.items) {
          setUserCartItems(response.data[0].items)
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      toast.error("Failed to load cart items")
    } finally {
      setIsLoadingCart(false)
    }
  }

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

  const toggleCartItem = (itemId: string) => {
    setSelectedCartItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const addSelectedCartItemsToDonation = () => {
    const allCartItems = [...cartItems, ...userCartItems]
    const selectedItems = allCartItems.filter(item => selectedCartItems.includes(item.id))

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item")
      return
    }

    // Convert cart items to donation items
    const newDonationItems = selectedItems.map(item => ({
      id: Date.now() + Math.random(),
      quantity: item.quantity,
      clothType: determineClothType(item.name)
    }))

    setCurrentItems(prev => [...prev, ...newDonationItems])
    setIsCartModalOpen(false)
    setSelectedCartItems([])

    // Remove donated items from cart
    selectedItems.forEach(item => {
      if (cartItems.find(c => c.id === item.id)) {
        removeFromGuestCart(item.id)
      }
    })

    toast.success(`${selectedItems.length} item(s) added to donation basket`)
  }

  const determineClothType = (itemName: string): string => {
    const name = itemName.toLowerCase()
    if (name.includes("shirt") || name.includes("top") || name.includes("blouse")) return "shirts"
    if (name.includes("pant") || name.includes("trouser") || name.includes("jean")) return "pants"
    if (name.includes("dress")) return "dresses"
    if (name.includes("jacket") || name.includes("coat")) return "jackets"
    return "other"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentItems.length === 0) {
      toast.error("Please add at least one item to donate")
      return
    }

    if (!currentItems.every(item => item.quantity > 0 && item.clothType)) {
      toast.error("Please fill in all item details")
      return
    }

    setIsSubmitting(true)
    try {
      const newDonation: Donation = {
        id: Date.now().toString(),
        items: currentItems,
        user: user?.id || "guest",
        coins: Math.floor(currentItems.reduce((acc, item) => acc + item.quantity * 10, 0)),
        status: "Processing",
        createdAt: new Date().toISOString()
      }

      await requestUrl({
        method: 'POST',
        endpoint: "donations",
        data: newDonation
      })

      setDonations([newDonation, ...donations])
      setCurrentItems([])
      setIsSuccessModalOpen(true)
      calculateTotalCoins()
      toast.success("Donation submitted successfully!")
    } catch (e) {
      console.error(e)
      toast.error("Failed to submit donation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getImpactLevel = (coins: number) => {
    if (coins >= 100) return { label: "Eco Warrior", color: "bg-emerald-600" }
    if (coins >= 50) return { label: "Green Hero", color: "bg-green-500" }
    if (coins >= 20) return { label: "Eco Starter", color: "bg-teal-500" }
    return { label: "New Contributor", color: "bg-blue-500" }
  }

  const impact = getImpactLevel(totalCoins)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-white">
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 lg:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl -ml-10 -mb-10" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Leaf className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Circular Economy</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                Give Clothes a<br />
                <span className="text-emerald-200">Second Life</span>
              </h1>
              <p className="text-emerald-100 text-lg font-medium max-w-lg leading-relaxed">
                Transform your wardrobe into environmental impact. Every item donated reduces textile waste and earns you sustainability coins.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-8 rounded-2xl bg-white text-emerald-700 font-black hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Recycle className="w-5 h-5 mr-2" />
                  Start Donating
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCartModalOpen(true)}
                  className="h-14 px-8 rounded-2xl border-2 border-white/40 text-white font-black hover:bg-white/10 transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Donate from Cart
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-white/10 backdrop-blur-md text-white rounded-3xl p-6 flex flex-col justify-between hover:bg-white/15 transition-colors">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">CO2 Saved</p>
                  <h3 className="text-4xl font-black">{(totalCoins * 0.08).toFixed(1)}kg</h3>
                </div>
              </Card>

              <Card className="border-none bg-white text-emerald-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <Gift className="w-8 h-8" />
                  <Badge className={`${impact.color} text-white text-xs font-bold uppercase tracking-wider`}>
                    {impact.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Total Coins</p>
                  <h3 className="text-4xl font-black">{totalCoins}</h3>
                </div>
              </Card>

              <Card className="border-none bg-white/10 backdrop-blur-md text-white rounded-3xl p-6 flex flex-col justify-center text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 className="text-3xl font-black">{donations.length}</h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Donations Made</p>
              </Card>

              <Card className="border-none bg-white/10 backdrop-blur-md text-white rounded-3xl p-6 flex flex-col justify-center text-center">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 className="text-3xl font-black">
                  {donations.reduce((acc, d) => acc + d.items.reduce((sum, i) => sum + i.quantity, 0), 0)}
                </h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Items Donated</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShoppingCart, label: "Cart Items", action: () => setIsCartModalOpen(true), color: "bg-blue-500" },
            { icon: Truck, label: "Schedule Pickup", action: () => setIsComingSoonOpen(true), color: "bg-amber-500" },
            { icon: MapPin, label: "Find Centers", action: () => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' }), color: "bg-purple-500" },
            { icon: BookOpen, label: "Guidelines", action: () => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' }), color: "bg-pink-500" },
          ].map((action, idx) => (
            <Button
              key={idx}
              onClick={action.action}
              variant="outline"
              className="h-auto py-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center gap-3 transition-all group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">{action.label}</span>
            </Button>
          ))}
        </section>

        {/* Main Content Grid */}
        <div id="donation-form" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Donation Form */}
          <Card className="xl:col-span-7 border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    Donation Basket
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Add items you want to donate and track your impact
                  </CardDescription>
                </div>
                {currentItems.length > 0 && (
                  <Badge variant="secondary" className="h-8 px-4 text-sm font-bold">
                    {currentItems.reduce((acc, item) => acc + item.quantity, 0)} items
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-end gap-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 transition-all hover:border-emerald-200 hover:shadow-md hover:bg-white"
                      >
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs font-black uppercase text-slate-400">Quantity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="bg-white rounded-xl border-slate-200 h-10 w-20 text-center font-bold text-lg"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-[3] space-y-2">
                          <Label className="text-xs font-black uppercase text-slate-400">Cloth Type</Label>
                          <Select
                            value={item.clothType}
                            onValueChange={(value) => updateItem(item.id, 'clothType', value)}
                            required
                          >
                            <SelectTrigger className="bg-white rounded-xl border-slate-200 h-12 font-bold focus:ring-emerald-500">
                              <SelectValue placeholder="Select cloth type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-2">
                              <SelectItem value="shirts">👕 Shirts & Tops</SelectItem>
                              <SelectItem value="pants">👖 Pants & Trousers</SelectItem>
                              <SelectItem value="dresses">👗 Dresses</SelectItem>
                              <SelectItem value="jackets">🧥 Jackets & Coats</SelectItem>
                              <SelectItem value="other">🧵 Fabric & Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                        <Gift className="w-10 h-10 text-emerald-400" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-bold text-slate-600 text-lg">Your basket is empty</p>
                        <p className="text-sm text-slate-400">Add items to start your donation</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCartModalOpen(true)}
                        className="mt-2"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Import from Cart
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full h-14 rounded-2xl border-2 border-dashed hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-bold"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Another Item
                  </Button>
                </div>

                {currentItems.length > 0 && (
                  <div className="pt-4 space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">You'll earn</p>
                          <p className="text-sm text-emerald-600">
                            {Math.floor(currentItems.reduce((acc, item) => acc + item.quantity * 10, 0))} coins for this donation
                          </p>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-14 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 w-5 h-5" />
                            Confirm Donation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="xl:col-span-5 space-y-6">

            {/* Donation Guide */}
            <Card id="guide" className="border-none bg-slate-900 text-white rounded-[2rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                  </div>
                  Donation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {[
                  { icon: CheckCircle2, text: "Clean & washed items", good: true },
                  { icon: CheckCircle2, text: "Separated by material type", good: true },
                  { icon: AlertCircle, text: "No heavily stained items", good: false },
                  { icon: AlertCircle, text: "No damaged or torn fabric", good: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl ${item.good ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                  >
                    <item.icon className={`w-5 h-5 ${item.good ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-sm font-bold">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Partner Locator */}
            <Card id="partners" className="border-none bg-white rounded-[2rem] shadow-xl overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    Donation Centers
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-bold">{ECO_PARTNERS.length} nearby</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-3">
                    {ECO_PARTNERS.map((partner, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900">{partner.name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {partner.address}
                            </p>
                          </div>
                          <Badge className={`text-xs font-bold ${
                            partner.impact === 'High' ? 'bg-emerald-100 text-emerald-700' :
                            partner.impact === 'Premium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {partner.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">{partner.types}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            {partner.distance}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button variant="ghost" className="w-full mt-4 text-emerald-600 font-bold hover:bg-emerald-50">
                  View All Centers <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Impact Card */}
            <Card className="border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2rem] shadow-xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Your Impact</h3>
                    <p className="text-emerald-100 text-sm">Keep up the great work!</p>
                  </div>
                </div>
                <Separator className="bg-white/20" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-black">{(totalCoins * 0.5).toFixed(0)}L</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Water Saved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{(totalCoins * 0.3).toFixed(0)}%</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Less Waste</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Donation History */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">Your Donations</h2>
              <p className="text-sm text-slate-500 font-medium">Track your sustainability journey</p>
            </div>
            <Button variant="outline" className="rounded-full font-bold">
              <Clock className="w-4 h-4 mr-2" />
              Past 30 Days
            </Button>
          </div>

          {donations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <Card
                  key={donation.id}
                  className="border-none bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all group overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Donation #{donation.id.toString().slice(-4)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <span className="font-black text-emerald-600">+{donation.coins}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Items</p>
                      <div className="flex flex-wrap gap-2">
                        {donation.items.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs font-medium">
                            {CLOTH_TYPE_MAP[item.clothType] || item.clothType} ×{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Badge className={`text-xs font-bold ${
                        donation.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        donation.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {donation.status || "Processing"}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-emerald-600 font-bold hover:bg-emerald-50">
                        Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none bg-slate-50 rounded-3xl py-16 text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-emerald-300 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No donations yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Start your sustainability journey by making your first donation above</p>
              <Button onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Make First Donation
              </Button>
            </Card>
          )}
        </section>
      </div>

      {/* Cart Import Modal */}
      <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none">
          <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              Import from Cart
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Select items from your cart to donate and earn extra coins
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {isLoadingCart ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-medium">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 && userCartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Your cart is empty</h3>
                <p className="text-slate-500 mb-6">Add items to your cart first to donate them</p>
                <Button onClick={() => navigate('/market')}>Browse Marketplace</Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {/* Guest Cart Items */}
                  {cartItems.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Guest Cart</h4>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleCartItem(item.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedCartItems.includes(item.id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedCartItems.includes(item.id)
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-slate-300'
                            }`}>
                              {selectedCartItems.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <img
                              src={item.imageurl || '/placeholder.svg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{item.name}</h4>
                              <p className="text-sm text-slate-500">{item.companyname}</p>
                              <p className="text-sm font-bold text-emerald-600 mt-1">{item.price}</p>
                            </div>
                            <Badge variant="secondary" className="font-bold">Qty: {item.quantity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* User Cart Items */}
                  {userCartItems.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Your Cart</h4>
                      {userCartItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleCartItem(item.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedCartItems.includes(item.id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedCartItems.includes(item.id)
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-slate-300'
                            }`}>
                              {selectedCartItems.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <img
                              src={item.imageurl || '/placeholder.svg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{item.name}</h4>
                              <p className="text-sm text-slate-500">{item.companyname}</p>
                              <p className="text-sm font-bold text-emerald-600 mt-1">{item.price}</p>
                            </div>
                            <Badge variant="secondary" className="font-bold">Qty: {item.quantity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-slate-100 gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl font-bold">Cancel</Button>
            </DialogClose>
            <Button
              onClick={addSelectedCartItemsToDonation}
              disabled={selectedCartItems.length === 0 || isLoadingCart}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              Add {selectedCartItems.length} Item{selectedCartItems.length !== 1 ? 's' : ''} to Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-2">Thank You!</h2>
            <p className="text-emerald-100">Your donation has been received</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-emerald-600">+{donations[0]?.coins || 0}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Coins Earned</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-emerald-600">
                  {donations[0]?.items.reduce((acc, i) => acc + i.quantity, 0) || 0}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Donated</p>
              </div>
            </div>

            <p className="text-slate-600 font-medium">
              Your contribution helps reduce textile waste and supports sustainable fashion.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Pickup Coming Soon */}
      <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
        <DialogContent className="rounded-3xl bg-white border-none shadow-2xl p-10 text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
            <Truck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Coming Soon!</h2>
            <p className="text-slate-500 font-medium">
              We're partnering with local logistics providers to bring doorstep pickup to your area.
            </p>
          </div>
          <Button onClick={() => setIsComingSoonOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
