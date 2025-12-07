import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './i18n';

import { queryClient } from "./lib/queryClient";
import { bannersService } from "./services/banners.service";

// Prefetch banners immediately to improve LCP
queryClient.prefetchQuery({
    queryKey: ["active-banners"],
    queryFn: () => bannersService.getActiveBanners(),
});

createRoot(document.getElementById("root")!).render(<App />);
