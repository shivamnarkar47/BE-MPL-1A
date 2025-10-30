import { requestUrl } from '@/lib/requestUrl'
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();


  const formSubmit = async (data: any) => {
    console.log(data)
    await requestUrl({
      method: "POST",
      data: data,
      endpoint: "createUser"
    }).then((res) => {
      console.log(res.data)
      Cookies.set('user', JSON.stringify(res.data), { expires: 3, secure: true, sameSite: 'Strict' });
      navigate("/home")
    }).catch((e) => {
      console.error(e);
    })
  }
  
  console.log(errors)
  return (
    <section className="pt-20">
      {/* Container */}
      <div className="grid gap-0 md:h-screen md:grid-cols-2">
        {/* Component */}
        <div className="flex items-center justify-center px-5 py-16 md:px-10 md:py-20">
          <div className="max-w-md text-center">
            <h2 className="mb-8 text-3xl font-bold md:mb-12 md:text-5xl lg:mb-16">
              Start your 14-day free trial
            </h2>
            {/* Form */}
            <div className="mx-auto max-w-sm mb-4 pb-4">
              <form onSubmit={handleSubmit(formSubmit)}>
                <div className="relative">
                  <img
                    alt=""
                    src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9455fae6cf89_EnvelopeSimple.svg"
                    className="absolute left-5 top-3 inline-block"
                  />
                  <input
                    type="text"
                    className="mb-4 block h-9 w-full rounded-md border border-solid border-black px-3 py-6 pl-14 text-sm text-black placeholder:text-black"
                    placeholder="Full Name"
                    {...register("full_name")}
                  />
                </div>
                <div className="relative mb-4">
                  <img
                    alt=""
                    src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9455fae6cf89_EnvelopeSimple.svg"
                    className="absolute left-5 top-3 inline-block"
                  />
                  <input
                    type="text"
                    className="mb-4 block h-9 w-full rounded-md border border-solid border-black px-3 py-6 pl-14 text-sm text-black placeholder:text-black"
                    placeholder="Email Address"
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  />
                </div>
                <div className="relative mb-4">
                  <img
                    alt=""
                    src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a946794e6cf8a_Lock-2.svg"
                    className="absolute left-5 top-3 inline-block"
                  />
                  <input
                    type="password"
                    className="mb-4 block h-9 w-full rounded-md border border-solid border-black px-3 py-6 pl-14 text-sm text-black placeholder:text-black"
                    placeholder="Password (min 8 characters)"
                    {...register("password", { required: true, min: 8 })}
                  />
                </div>
                <label className="mb-6 flex items-center justify-start pb-12 pl-5 font-medium md:mb-10 lg:mb-1">
                  <input
                    type="checkbox"
                    name="checkbox"
                    className="float-left mt-1"
                    required
                  />
                  <span
                    className="ml-4 inline-block cursor-pointer text-sm"
                  >
                    I agree with the
                    <a href="#" className="font-bold ml-1">
                      Terms &amp; Conditions
                    </a>
                  </span>
                </label>
                <input
                  type="submit"
                  value="Join Flowspark"
                  className="inline-block w-full cursor-pointer items-center bg-black px-6 py-3 text-center font-semibold text-white"
                />
              </form>
            </div>

          </div>
        </div>
        {/* Component */}
        <div className="flex items-center justify-center bg-gray-100">
          <div className="mx-auto max-w-md px-5 py-16 md:px-10 md:py-24 lg:py-32">
            <div className="mb-5 flex h-14 w-14 flex-col items-center justify-center bg-white md:mb-6 lg:mb-8">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a949eade6cf7d_Vector-2.svg"
                alt=""
                className="inline-block"
              />
            </div>
            <p className="mb-8 text-sm sm:text-base md:mb-12 lg:mb-16">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus dolor purus non enim.
            </p>
            <p className="text-sm font-bold sm:text-base">John Robert</p>
            <p className="text-sm sm:text-sm">Senior Webflow Developer</p>
          </div>
        </div>
      </div>
    </section>

  )
}

export default Register

