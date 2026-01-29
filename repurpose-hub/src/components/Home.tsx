import Hero from './Hero'
import About from './About'
import WhyUs from './WhyUs'
import TrendingProducts from './TrendingProducts'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import { user } from '@/lib/getUser'
import { Navigate } from 'react-router-dom'
import Footer from './Footer'


const Home = () => {
  if (user != null) {
    return <Navigate to="/home" replace />
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <div className="space-y-0">
        <TrendingProducts />
        <PersonalizedRecommendations />
        <About />
        <WhyUs />
      </div>
      <Footer />
    </div>
  )
}

export default Home
