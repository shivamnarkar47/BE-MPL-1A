
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentDialog } from './payment-dialog'
import { requestUrl } from '@/lib/requestUrl'
import { user } from '@/lib/getUser'
import { Separator } from '@radix-ui/react-dropdown-menu'

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {

      await requestUrl({
        method: "GET",
        endpoint: `cart/${user?.id}`
      }).then((res) => {
        console.log(res.data)
        setCartItems(res.data)
      }).catch((e) => {
        // location.reload()
      })
    }
    fetchCart()
  }, [])

  const total = cartItems?.map((cart) => cart?.items.reduce((sum, item) => sum + item?.price.replace(",", "").split(" ").at(1) * (item.quantity + 1), 0))[0]
  console.log(total)
  console.log(cartItems.items)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length <= 0 ?
        (<p>Cart is empty</p>) :
        (
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems?.map((cart) => (
                cart?.items?.length > 0 && cart?.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span>{item.name}</span>
                    <span>
                      {item.quantity + 1} x Rs. {parseInt(item.price.replace(",", "").split(" ").at(1)).toFixed(2)}
                    </span>
                  </div>
                ))
              ))}
              <div className="flex justify-between items-center mb-2 ">
                <span>Service Fee</span>
                <span>Rs. {(total?.toFixed(2) * (20 / 100))}</span>
              </div>
              <Separator className='border' />
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="font-bold">Total:</span>
              <span>Rs. {total + (total?.toFixed(2) * (20 / 100))}</span>
            </CardFooter>
          </Card>
        )}
      <div className="mt-4">
        <Button disabled={cartItems.length == 0} onClick={() => setIsPaymentDialogOpen(true)}>Proceed to Payment</Button>
      </div>
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={total}
      />
    </div >
  )
}
