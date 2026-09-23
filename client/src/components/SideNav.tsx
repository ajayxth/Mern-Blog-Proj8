import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { useEffect, useRef, useState } from "react";

const SideNav = () => {
  const {
    userAuth: { access_token },
  } = useUserContext();

  const page = location.pathname.split("/")[2] ?? "blogs"

  
  const [pageState,setPageState] = useState(page.replace("-"," "))
  const [showSideNav,setShowSideNav] = useState(false)

  const activeTabLine = useRef<HTMLDivElement | null>(null);
const sidebarIconTab = useRef<HTMLButtonElement | null>(null);
const pageStatetab = useRef<HTMLButtonElement | null>(null);

const changePageState = (e: React.MouseEvent<HTMLButtonElement>) => {
  const { offsetWidth, offsetLeft } = e.currentTarget;

  if (activeTabLine.current) {
    activeTabLine.current.style.width = `${offsetWidth}px`;
    activeTabLine.current.style.left = `${offsetLeft}px`;
  }

  if (e.currentTarget === sidebarIconTab.current) {
    setShowSideNav((prev) => !prev);
  } else {
    setShowSideNav(false);
  }
};


useEffect(()=>{
    setShowSideNav(false)
    pageStatetab.current?.click()

},[pageState])
  return !access_token ? (
    <Navigate to={"/signin"} />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30 ">

            <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto relative">
                <button onClick={changePageState} ref={sidebarIconTab} className="p-5 capitalize "><i className="fi fi-rr-bars-staggered pointer-events-none"></i></button>

                <button ref={pageStatetab} onClick={changePageState} className="p-5 capitalize ">
                    {pageState}
                </button>

                <div ref={activeTabLine} className="absolute bottom-0 h-0.5 border-0 bg-black duration-500" />

            </div>



            <div className={"min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%)] max-md:px-16 max-md:-ml-7 duration-500 " + (!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto")}>
                <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
                <hr className="border-grey -ml-6 mb-8 " />

                <NavLink to="/dashboard/blogs" onClick={(e)=>setPageState(e.currentTarget.innerText)} className="sidebar-link">
                <i className="fi fi-rr-document"></i>
                Blogs
                </NavLink>

                <NavLink to="/dashboard/notification" onClick={(e)=>setPageState(e.currentTarget.innerText)} className="sidebar-link">
                <i className="fi fi-rr-bell"></i>
                Notification
                </NavLink>

                <NavLink to="/editor" onClick={(e)=>setPageState(e.currentTarget.innerText)} className="sidebar-link">
                <i className="fi fi-rr-file-edit"></i>
                Write
                </NavLink>

                <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
                <hr className="border-grey -ml-6 mb-8 " />

                <NavLink to="/settings/edit-profile" onClick={(e)=>setPageState(e.currentTarget.innerText)} className="sidebar-link">
                <i className="fi fi-rr-user"></i>
                Edit Profile
                </NavLink>

                <NavLink to="/settings/change-password" onClick={(e)=>setPageState(e.currentTarget.innerText)} className="sidebar-link">
                <i className="fi fi-rr-file-edit"></i>
                Change Password
                </NavLink>

            </div>
        </div>

        <div className="max-md:-mt-8 mt-5 w-full">
        <Outlet />
      </div>

      </section>

      
    </>
  );
};

export default SideNav;
