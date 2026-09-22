import InputBox from "../components/InputComponent";
import googleIcon from "../assets/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/animation";
import toast from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useUserContext } from "../context/UserContext";
import { authWithGoogle } from "../common/firebase";

type UserAuthFormProps = {
  type: "sign-in" | "sign-up";
};

const UserAuthForm = ({ type }: UserAuthFormProps) => {
  const {
    userAuth: { access_token },
    setUserAuth,
  } = useUserContext();

  // console.log(access_token);

  const userAuthThroughServer = async (
    serverRoute: string,
    formData: Record<string, string>,
  ) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
        formData,
      );
      storeInSession("user", JSON.stringify(data.user));
      setUserAuth(data.user)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const serverRoute =
      type == "sign-in" ? "/api/auth/signin" : "/api/auth/signup";

    const formData = Object.fromEntries(
      new FormData(e.currentTarget),
    ) as Record<string, string>;

    const { fullname, email, password } = formData;

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // Validate fullname only during signup
    if (type === "sign-up" && (!fullname || fullname.length < 3)) {
      return toast.error("Full Name must be at least 3 characters.");
    }

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return toast.error("Invalid Email.");
    }

    // Validate password
    if (!password || !passwordRegex.test(password)) {
      return toast.error(
        "Password must be 6-20 characters long with at least 1 uppercase letter, 1 lowercase letter, and 1 number.",
      );
    }

    userAuthThroughServer(serverRoute, formData);

    // console.log(formData);
  };

  const handleGoogleAuth =async (e:React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault()
    try{
      const user = await authWithGoogle()
      const serverRoute = "/api/auth/google-auth"
      const access_token = await user.getIdToken();

      const formdata = {
        access_token
      }

      userAuthThroughServer(serverRoute,formdata)
    
    }catch(error){
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (

    access_token ? <Navigate to={"/"} /> :
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-[80%] max-w-100">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1> 

          {type !== "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button type="submit" className="btn-dark cursor-pointer center mt-14">
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button onClick={handleGoogleAuth} className="btn-dark flex cursor-pointer items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} className="w-5" />
            continue with google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};
export default UserAuthForm;
