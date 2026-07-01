import { createApp } from "vue";
import type { Caido } from "@caido/sdk-frontend";
import type { API, BackendEvents } from "backend";
import { SupaScanContainer } from "./components/SupaScan";
// @ts-expect-error — vite handles CSS imports at build time
import "../style.css";

export type FrontendSDK = Caido<API, BackendEvents>;

export const init = (sdk: FrontendSDK): void => {
  const root = document.createElement("div");
  root.style.height = "100%";
  root.style.overflow = "hidden";

  const app = createApp(SupaScanContainer, { sdk });
  app.mount(root);

  sdk.navigation.addPage("/supascan", { body: root });
  sdk.sidebar.registerItem("SupaScan", "/supascan", { icon: "fas fa-shield-halved" });

  sdk.commands.register("supascan:open", {
    name: "SupaScan: Open Panel",
    run: () => sdk.navigation.goTo("/supascan"),
  });
  sdk.commandPalette.register("supascan:open");

  // Context menu: auto-detect from a selected request
  sdk.commands.register("supascan:seed-request", {
    name: "SupaScan: Analyze Request",
    run: async (context) => {
      if (context.type === "Request" && context.requests.length > 0) {
        const requestId = context.requests[0]!.getId();
        await sdk.backend.seedFromRequest(requestId);
        sdk.navigation.goTo("/supascan");
      }
    },
  });
  sdk.menu.registerItem({ type: "Request", commandId: "supascan:seed-request", leadingIcon: "fas fa-shield-halved" });

  // Context menu: manually add host as a Supabase instance (opens the panel pre-filled)
  sdk.commands.register("supascan:add-instance", {
    name: "SupaScan: Add as Supabase Instance",
    run: async (context) => {
      if (context.type === "Request" && context.requests.length > 0) {
        const host = context.requests[0]!.getHost();
        (window as unknown as Record<string, string>)["__supascan_prefill_host"] = host;
      }
      sdk.navigation.goTo("/supascan");
    },
  });
  sdk.menu.registerItem({ type: "Request", commandId: "supascan:add-instance", leadingIcon: "fas fa-plus" });
  sdk.commandPalette.register("supascan:add-instance");
};
