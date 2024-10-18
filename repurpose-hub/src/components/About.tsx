
const About = () => {
  return (
    <section id="about">
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-28">
        {/* Title */}
        <h2 className="mb-8 text-3xl font-bold md:text-5xl lg:mb-14">
          Meet RePurpose Hub
        </h2>
        <p className="mb-8 max-w-lg text-sm text-gray-500 sm:text-base lg:mb-24">
          RePurpose Hub is your destination for eco-friendly upcycling and sustainable living. We empower individuals and communities to transform discarded items into valuable resources, reducing waste and promoting environmental responsibility. Join us in rethinking consumption and crafting a greener future, one repurposed item at a time.
        </p>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <img
            src="https://cdn.pixabay.com/photo/2018/12/08/03/52/upcycling-3862781_640.jpg"
            alt=""
            className="inline-block h-full w-full rounded-2xl object-cover"
          />
          <div className="flex flex-col gap-5 rounded-2xl border border-solid border-black p-10 sm:p-20">
            <h2 className="text-3xl font-bold md:text-5xl">Our Mission</h2>
            <p className="text-sm text-gray-500 sm:text-base">
              At Repurpose Hub, we are dedicated to transforming waste into valuable resources. We believe in the power of creativity and sustainability, striving to create a community where innovative ideas flourish. Our goal is to inspire individuals and businesses to rethink their consumption patterns, repurpose materials, and reduce their environmental footprint.
              <br />
              We provide a collaborative space that encourages experimentation, learning, and sharing. By fostering partnerships and promoting awareness, we aim to cultivate a culture of sustainability that not only benefits the planet but also enhances the quality of life for all.
              <br />
              Join us in our journey to make repurposing a way of life, where every item has the potential for a second chance.            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
