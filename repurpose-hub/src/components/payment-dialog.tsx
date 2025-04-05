import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { requestUrl } from '@/lib/requestUrl'
import { getCookie } from '@/lib/getUser'
import { useNavigate } from 'react-router-dom'

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  total: number
}

export function PaymentDialog({ isOpen, onClose, total }: PaymentDialogProps) {
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)
  const user = getCookie();
  const navigate = useNavigate()
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing

    setIsPaymentSuccessful(true)
    setTimeout(() => {
      requestUrl({
        method: "POST",
        endpoint: "cart/checkout",
        data: {
          user_id: user.id,
          total_payment: total
        }

      }).then((res) => {
        console.log(res.data)
        navigate("/home")
      })

    }, 1500)
  }

  const handleClose = () => {
    setIsPaymentSuccessful(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isPaymentSuccessful ? "Payment Successful" : "Payment Details"}</DialogTitle>
        </DialogHeader>
        {isPaymentSuccessful ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Your payment was successful!</p>
            <p className="text-sm text-gray-500">Thank you for your purchase.</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} className='flex items-center justify-center flex-col'>
            <h1 className='p-20 font-bold text-center text-3xl tracking-tighter'>Pay now!</h1>
            <Button type="submit">Pay Rs.{total?.toFixed(2)}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
