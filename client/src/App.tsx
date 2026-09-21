import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthFormPage";
import { Toaster } from "react-hot-toast";
import Editor from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";

const App = () => {

  
  return (
    <>

      <Toaster position="bottom-right" />

      <Routes>
        <Route path="/editor" element={<Editor />}/> 
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
