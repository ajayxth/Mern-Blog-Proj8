import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthFormPage";
import { Toaster } from "react-hot-toast";
import Editor from "./pages/EditorPage";

const App = () => {

  
  return (
    <>

      <Toaster position="bottom-right" />

      <Routes>
        <Route path="/editor" element={<Editor />}/> 
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
