import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ResearchAnalyzer from "../pages/Upload/ResearchAnalyzer";
import Chat from "../pages/Chat/Chat";
import Ideas from "../pages/Ideas/Ideas";
import LandingPage from "../pages/Landing Page/LandingPage";
import Summary from "../pages/Chat/Summary";
import ResearchGaps from "../pages/Chat/ResearchGap";
import Contradictions from "../pages/Chat/Contradictions";

const AppRoutes = () => {

  return (

    <BrowserRouter basename="/Aetheron">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Upload />} />
          <Route path="chat" element={<Chat />} />
          <Route path="ideas" element={<Ideas />} />
        </Route>



        {/* 4. Global fallback to prevent blank pages */}

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>

  );

};



export default AppRoutes;