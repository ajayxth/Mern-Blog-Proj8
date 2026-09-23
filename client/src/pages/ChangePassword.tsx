
import { useRef, useState } from 'react'
import AnimationWrapper from '../common/animation'
import InputBox from '../components/InputComponent'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useUserContext } from '../context/UserContext'
import { removeFromSession } from '../common/session'

const ChangePassword = () => {

    const {userAuth:{access_token},setUserAuth} = useUserContext()

    const [loading,setLoading] = useState(false)

    const changePasswordForm = useRef<HTMLFormElement>(null)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const signOutUser = ()=>{
    removeFromSession("user")
    setUserAuth({access_token:null})
    
  }


    const handleSubmit =async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()

        if (!changePasswordForm.current) return;

        const form = new FormData(changePasswordForm.current)
        const formData: Record<string, string> = {}

        for(const[key,value] of form.entries()){
            formData[key] = value.toString()
        }

        const {currentPassword,newPassword} = formData

        if(!currentPassword?.length || !newPassword?.length){
            toast.error("Fill all inputs.")
            return
        }

        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
            toast.error("Password needs to be  6-20 character long. Atleast one uppercase,one numerical.")
            return
        }

        if (!access_token) {
            toast.error("Your session has expired. Please sign in again.")
            return
        }


        const loadingToast = toast.loading("Updating password...")

        try{
            setLoading(true)
            const data = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/change-password",formData,{
                headers:{
                    Authorization: `Bearer ${access_token}`
                }
            })

            toast.success("Password updated Successfully")
            signOutUser()

        }catch(error){
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error || "Something went wrong.")
            } else {
                toast.error("Something went wrong.")
            }
        }finally{
            setLoading(false)
            toast.dismiss(loadingToast)

        }



    }
  return (
    <AnimationWrapper>
        <form ref={changePasswordForm} >
            <h1 className='max-md:hidden '> Change password</h1>

            <div className='py-10 w-full md:max-w-[400px] '>
                <InputBox name='currentPassword' type='password' className="profile-edit-input" placeholder='Current Password' icon='fi-rr-unlock' />

                <InputBox name='newPassword' type='password' className="profile-edit-input" placeholder='New Password' icon='fi-rr-unlock' />

                <button  onClick={handleSubmit} className='btn-dark px-10 cursor-pointer' type='submit'>{loading ? "Changing password..." :"Change Password"}</button>
            </div>
        </form>

    </AnimationWrapper>
  )
}

export default ChangePassword