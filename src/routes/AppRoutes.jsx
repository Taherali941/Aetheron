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

        {/* 1. Landing page — full screen, no layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landingpage" element={<Navigate to="/" replace />} />

        {/* 2. App pages — wrapped in sidebar Layout */}
        <Route element={<Layout />}>
          <Route path="/upload"         element={<ResearchAnalyzer />} />
          <Route path="/summary"        element={<Summary />} />
          <Route path="/gaps"           element={<ResearchGaps />} />
          <Route path="/contradictions" element={<Contradictions />} />
          <Route path="/chat"           element={<Chat />} />
          <Route path="/ideas"          element={<Ideas />} />
        </Route>

        {/* 3. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
