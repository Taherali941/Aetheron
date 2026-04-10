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
  {/* 1. Use 'index' for the Landing Page */}
  <Route index element={<LandingPage />} />

  {/* 2. Layout with NO path attribute */}
  <Route element={<Layout />}>
    <Route path="upload" element={<ResearchAnalyzer />} />
    <Route path="chat" element={<Chat />} />
    <Route path="summary" element={<Summary />} />
    <Route path="gaps" element={<ResearchGaps />} />
    <Route path="contradictions" element={<Contradictions />} />
    <Route path="ideas" element={<Ideas />} />
  </Route>

  {/* 3. Global fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;