import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Splash } from "./components/layout/Splash";
import { Home } from "./pages/Home";
import { Overview } from "./pages/Overview";
import { AiIntegrations } from "./pages/AiIntegrations";
import { SendToAi } from "./pages/SendToAi";
import { AiHandoff } from "./pages/AiHandoff";
import { Unsorted } from "./pages/Unsorted";
import { TrashArchive } from "./pages/TrashArchive";
import { SharedWithMe } from "./pages/SharedWithMe";
import { TeamWorkspace } from "./pages/TeamWorkspace";
import { HandoffHistory } from "./pages/HandoffHistory";
import { BoardDetail } from "./pages/BoardDetail";
import { Build } from "./pages/Build";
import { AiHandoffExport } from "./pages/AiHandoffExport";
import { AiHandoffReview } from "./pages/AiHandoffReview";
import { AiHandoffSent } from "./pages/AiHandoffSent";
import { Settings } from "./pages/Settings";
import { Welcome } from "./pages/onboarding/Welcome";
import { Features } from "./pages/onboarding/Features";
import { Role } from "./pages/onboarding/Role";
import { SignUp } from "./pages/onboarding/SignUp";
import { Permissions } from "./pages/onboarding/Permissions";
import { Ready } from "./pages/onboarding/Ready";

/** The splash shows once each time the app loads, before the first onboarding screen. */
let splashShown = false;

function WelcomeWithSplash() {
  const [splash, setSplash] = useState(!splashShown);
  if (splash)
    return (
      <Splash
        onDone={() => {
          splashShown = true;
          setSplash(false);
        }}
      />
    );
  return <Welcome />;
}

/** Shown between the end of onboarding and the home page. Slightly shorter than the opening splash (SPLASH_MS):
 *  the logo finishes drawing at ~1.8s, so this just trims the hold on the final frame. */
const LAUNCH_SPLASH_MS = 2400;

function LaunchSplash() {
  const navigate = useNavigate();
  return <Splash duration={LAUNCH_SPLASH_MS} onDone={() => navigate("/home", { replace: true })} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeWithSplash />} />
        <Route path="/home" element={<Home key="all" />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/favourites" element={<Home key="favourites" view="favourites" />} />
        <Route path="/ai-integrations" element={<AiIntegrations />} />
        <Route path="/send-to-ai" element={<SendToAi />} />
        <Route path="/send-to-ai/handoff" element={<AiHandoff />} />
        <Route path="/unsorted" element={<Unsorted />} />
        <Route path="/archive" element={<TrashArchive kind="archive" />} />
        <Route path="/trash" element={<TrashArchive kind="trash" />} />
        <Route path="/shared" element={<SharedWithMe />} />
        <Route path="/team" element={<TeamWorkspace />} />
        <Route path="/boards/:boardId/unsorted" element={<Unsorted />} />
        <Route path="/handoff-history" element={<HandoffHistory />} />
        <Route path="/projects" element={<Home key="projects" view="projects" />} />
        <Route path="/onboarding/features" element={<Features />} />
        <Route path="/onboarding/role" element={<Role />} />
        <Route path="/onboarding/signup" element={<SignUp />} />
        <Route path="/onboarding/permissions" element={<Permissions />} />
        <Route path="/onboarding/ready" element={<Ready />} />
        <Route path="/onboarding/launching" element={<LaunchSplash />} />
        <Route path="/boards/:boardId" element={<BoardDetail />} />
        <Route path="/boards/:boardId/build" element={<Build />} />
        <Route path="/boards/:boardId/handoff" element={<AiHandoffExport />} />
        <Route path="/boards/:boardId/handoff/review" element={<AiHandoffReview />} />
        <Route path="/boards/:boardId/handoff/sent" element={<AiHandoffSent />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
