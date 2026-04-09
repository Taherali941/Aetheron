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
        <Route path="/" element={<Layout />} />
          <Route index element={<LandingPage />} />
        {/* 1. Landing Page sits outside the Layout (Full Screen) */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Catch-all for the old path if it's cached in your browser */}
        <Route path="/landingpage" element={<Navigate to="/" replace />} />

        {/* 3. Dashboard Routes wrapped in the Layout (Sidebar starts here) */}
        <Route element={<Layout />}>
          
        <Route path="/upload" element={<ResearchAnalyzer />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/gaps" element={<ResearchGaps />} />
        <Route path="/contradictions" element={<Contradictions />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/chat" element={<Chat />} />

        </Route>

        {/* 4. Global fallback to prevent blank pages */}

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>

  );

};



export default AppRoutes;