
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentDialog } from './payment-dialog'
import { requestUrl } from '@/lib/requestUrl'
import { user } from '@/lib/getUser'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { ScrollArea } from './ui/scroll-area'

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [pastOrders,setPastOrders] = useState([])
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

    const ordersRes = async ()=>{await requestUrl({
      method: "GET",
      endpoint: `orders/${user?.id}`
    }).then((res) => {
      console.log(res.data)
      setPastOrders(res.data)
      setIsPaymentDialogOpen(false)
    }).catch((e) => {
      // location.reload()
    })}
    
    

    fetchCart()
    if (user?.id) {
      ordersRes()
    }
  }, [])
  function calculateCartTotal(cartItems:any) {
    let total = 0;
    
    for (const item of cartItems) {
      // Extract numeric price
      const numericPrice = parseFloat(item.price.replace("Rs.", "").replace(/,/g, "").trim());
  
      // Calculate item total
      const itemTotal = numericPrice * (item.quantity % (item.quantity -1));
  
      // Add to total
      total += itemTotal;
    }
  
    return total;
  }
  let total = 0;
  if(cartItems.length == 0 ) {
    total = 0
  }
  else{
     total = calculateCartTotal(cartItems[0]?.items);
  }
  
// let total = 0
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
                      {item.quantity - (item.quantity-1)  } x Rs. {parseInt(item.price.replace(",", "").split(" ").at(1)).toFixed(2)}
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
              <span>Rs. {total + (total?.toFixed(2) * (20 / 100))}.00</span>
            </CardFooter>
          </Card>
        )}
      <div className="mt-4">
        <Button disabled={cartItems.length == 0} onClick={() => setIsPaymentDialogOpen(true)}>Proceed to Payment</Button>
      </div>
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={total + (total?.toFixed(2) * (20 / 100))}
      />
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Past Orders</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ScrollArea className="h-full pr-4">
              {pastOrders.map(order => (
                <div key={order.id} className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Order #{order.id}</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <Separator className="my-2" />
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between py-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity - (item.quantity - 1)}
                        </p>
                      </div>
                      <p className="text-right">
                        <span className="block text-sm">
                          {item.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.status}
                        </span>
                      </p>
                    </div>
                  ))}
                
                  <Separator className="my-4" />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div >
  )
}
