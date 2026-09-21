import { Link } from "react-router-dom"
import pageNotFoundImg from "../assets/404.png"
import logo from "../assets/logo-horizontal-light.svg"
const PageNotFound = () => {
  return (
    <section className='h-cover relative p-10 flex flex-col items-center gap-20 text-center'>
        <img src={pageNotFoundImg} className="select-none border-2 border-grey w-72 aspect-square object-cover rounded " alt="" />
        <h1 className="text-4xl font-gelasio leading-7 ">Page Not Found</h1>
        <p className="text-dark-grey text-xl leading-7 -mt-8">The page  you are looking doesnot exists. Head Back to <Link to={"/"} className="text-black underline"> Home Page.</Link></p>

        <div className="mt-auto">

            <img src={logo} className="h-8 object-contain block mx-auto select-none" alt="" />
            <p className="mt-5 text-dark-grey">Read stories fo your choice.</p>

        </div>
    </section>
  )
}

export default PageNotFound