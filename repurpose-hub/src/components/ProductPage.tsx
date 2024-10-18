import { ChevronLeft, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { requestUrl } from '@/lib/requestUrl';
import { getCookie} from '@/lib/getUser';

type ProductType = {
  companyname: string,
  id: string,
  imageurl: string,
  name: string,
  price: string,
  quantity: number
}

export default function ProductPage() {
  const { productId } = useParams();
  const user = getCookie();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType>({})
  useEffect(() => {
    console.log(productId)
    requestUrl({
      method: "GET",
      endpoint: `products/${productId}`,
    }).then((res) => {
      console.log(res.data)
      setProduct(res.data)
    }).catch((e) => {
      console.log(e)
    })
  }, [])

  const addToCart = () => {
    requestUrl({
      method: "POST",
      endpoint: "cart/add",
      data: {
        user_id: user.id,
        items: [
          { "id": productId, ...product }
        ]
      }
    }).then((res) => {
      console.log(res.data);
      navigate("/cart");
    }).catch((e) => {
      console.error(e);
    })
  }

  return (
    <div className="container mx-auto px-4 gap-y-4 flex flex-col py-8">
      <Link className=' rounded-lg w-10 left-20 border-gray-300  hover:bg-gray-200 border bg-white text-gray-800 p-2' to={'/home'}>
        <ChevronLeft className="" />
      </Link>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-square">
              <img
                src={product.imageurl}
                alt={product.name}

                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{product.companyname}</p>
                <p className="text-2xl font-semibold mb-4">{product.price}</p>
                <p className="mb-6">
                  Availability: <span className="font-semibold">{product.quantity} in stock</span>
                </p>
                <div className="prose max-w-none mb-6">
                  <p>
                    This beautiful Multicolored Shimmery Striped Upcycled Handwoven Office Tote
                    is the perfect blend of style and sustainability. Handcrafted by skilled
                    artisans, this tote features a unique shimmery striped pattern that adds a
                    touch of elegance to your office attire.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" onClick={addToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button variant="outline" className="flex-1">Buy Now</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
