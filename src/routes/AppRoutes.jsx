import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import Upload from "../pages/Upload/Upload";
import Chat from "../pages/Chat/Chat";
import Ideas from "../pages/Ideas/Ideas";

const AppRoutes = () => {
  return (
    //this routes dont support in gh pages only support in vercel
    <BrowserRouter basename="/Aetheron" >

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Upload />} />
          <Route path="chat" element={<Chat />} />
          <Route path="ideas" element={<Ideas />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  );
};

export default AppRoutes;