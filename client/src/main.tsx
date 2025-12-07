import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './i18n';

import { queryClient } from "./lib/queryClient";
import { bannersService } from "./services/banners.service";

// Prefetch banners immediately to improve LCP
queryClient.prefetchQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
        const data = await bannersService.getActiveBanners();
        // Smart Preload: Start downloading the LCP image immediately
        if (data && data.length > 0 && data[0].image) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = data[0].image;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        }
        return data;
    },
});

createRoot(document.getElementById("root")!).render(<App />);
