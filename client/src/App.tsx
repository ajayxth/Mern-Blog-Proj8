import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthFormPage";
import { Toaster } from "react-hot-toast";
import Editor from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./components/ProfilePage";
import BlogPage from "./pages/BlogPage";
import SideNav from "./components/SideNav";
import ChangePassword from "./pages/ChangePassword";
import EditProfile from "./pages/EditProfile";
import { ManageBlogs } from "./pages/ManageBlogs";
import AlgorithmPage from "./pages/AlgorithmPage";
import LandingPage from "./pages/LandingPage";

const App = () => {

  
  return (
    <>

      <Toaster position="bottom-right" />

      <Routes>
        <Route path="/editor" element={<Editor />}/> 
        <Route path="/editor/:blog_id" element={<Editor />}/> 

        <Route path="/" element={<Navbar />}>
          <Route index element={<LandingPage />} />
          <Route path="blogs" element={<HomePage />} />
          <Route path="algorithms" element={<AlgorithmPage />} />
          <Route path="dashboard" element={<SideNav />}>
            <Route path="blogs" element={<ManageBlogs/>} />

          </Route>
          <Route path="settings" element={<SideNav />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />

          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<ProfilePage />} />
          <Route path="/blog/:blog_id" element={<BlogPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
