import Hero from './Hero'
import About from './About'
import WhyUs from './WhyUs'
import { user } from '@/lib/getUser'
import { Navigate } from 'react-router-dom'
import Footer from './Footer'


const Home = () => {
  if (user != null) {
    return <Navigate to="/home" replace />
  }
  return (
    <>
      <Hero />
      <About />
      <WhyUs />
      <Footer />

    </>
  )
}

export default Home
