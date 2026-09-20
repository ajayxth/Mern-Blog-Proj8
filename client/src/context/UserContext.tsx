import { createContext, useContext,  useState } from "react";
import { lookInSession } from "../common/session";

type UserAuth = {
  access_token: string | null;
  username?: string;
  fullname?: string;
  profile_img?: string;
};

type UserContextType = {
  userAuth: UserAuth;
  setUserAuth: React.Dispatch<React.SetStateAction<UserAuth>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default UserContext

export const UserContextProvider = ({children}:{children:React.ReactNode}) =>{

    const [userAuth, setUserAuth] = useState<UserAuth>(() => {
    const userInSession = lookInSession("user");

    if (userInSession) {
      try {
        return JSON.parse(userInSession);
      } catch (error) {
        console.error("Invalid user data in sessionStorage:", error);
      }
    }

    return {
      access_token: null,
    };
  });


    const value ={
        userAuth,
        setUserAuth
    }


    return <UserContext.Provider value={value}>{children}</UserContext.Provider>

}


export const useUserContext = ()=>{
    const context = useContext(UserContext)

    if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return context
}