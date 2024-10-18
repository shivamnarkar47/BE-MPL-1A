import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const Hero = () => {
  return (
    <header id="home">
      {/* Hero Container */}
      <div className="mx-auto max-w-7xl px-5 py-32 md:px-10 md:py-40">
        {/* Component */}
        <div className="mx-auto mb-8 w-full max-w-3xl text-center md:mb-12 lg:mb-16">
          {/* Hero Title */}
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Transforming Waste into Sustainable Solutions.
          </h1>
          <p className="mx-auto mb-5 max-w-lg text-sm text-gray-500 sm:text-xl md:mb-6 lg:mb-8">
            Give New Life to the Old, and Shape a Greener Tomorrow!
          </p>
          {/* Hero Button */}
          <div className="flex items-stretch md:flex-row flex-col gap-y-3 justify-center">
            <Link
              to="/register"
              className=" inline-block rounded-md bg-black px-8 py-4 text-center font-semibold text-white md:mr-6 lg:mr-8"
            >
              Get Started
            </Link>
            <a
              href="#about"
              className="flex items-center justify-center rounded-md border border-solid border-black px-6 py-3 font-bold text-black"
            >
              <p className="text-sm text-black sm:text-base">Learn More</p>
              <ChevronRight className="ml-2" />
            </a>
          </div>
        </div>
        {/* Hero Image */}
        <img
          src="https://tinybeans.com/wp-content/uploads/2022/03/upcycledcrafts_istock.jpg"
          alt=""
          className="inline-block max-h-[512px] w-full object-cover"
        />
      </div>
    </header>
  )
}

export default Hero
