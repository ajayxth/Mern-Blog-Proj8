import { Link } from "react-router-dom";
import AnimationWrapper from "../common/animation";
import { useUserContext } from "../context/UserContext";
import { removeFromSession } from "../common/session";

type UserNavigationPanelProps = {
  closePanel: () => void;
};


const UserNavigationPanel = ({closePanel}:UserNavigationPanelProps) => {
  const {
    userAuth: { username },setUserAuth
  } = useUserContext();

  const signOutUser = ()=>{
    removeFromSession("user")
    setUserAuth({access_token:null})
    closePanel()
  }

  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white abosolute right-0 border border-grey w-60 duration-200">
        <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
          <i className="fi fi-rr-file-edit"></i>
          <p>Write</p>
        </Link>

        <Link to={`/user/${username}`} className="link pl-8 py-4">
          Profile
        </Link>
        <Link to="/dashboard/blogs" className="link pl-8 py-4">
          Dashboard
        </Link>
        <Link to="/settings/edit-profile" className="link pl-8 py-4">
          Settings
        </Link>
        <span className="absolute border-t border-gray-300 w-full"></span>
        <button onClick={signOutUser} className="text-left p-4 hover:bg-grey cursor-pointer w-full pl-8 py-4">
          <h1 className="font-medium text-lg mg-1  inline">Sign Out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
