namespace BaseDemoSI {
  const validRoutes = new Set<RouteId>(["inicio", "ambiente", "aprender", "missoes", "roteiros", "professor", "caderno", "relatorios", "manual", "configuracoes", "sobre"]);

  export function currentRoute(hash: string): RouteId {
    const slug = hash.replace(/^#\/?/, "").split(/[?&]/, 1)[0];
    return validRoutes.has(slug as RouteId) ? slug as RouteId : "inicio";
  }

  export function updateRoute(): void {
    const selected = currentRoute(window.location.hash);
    for (const view of document.querySelectorAll<HTMLElement>("[data-view]")) {
      view.hidden = view.dataset.view !== selected;
    }
    for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-route]")) {
      const active = link.dataset.route === selected;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const route = manifest.routes.find(item => item.id === selected);
    document.title = `${route?.title ?? "Início"} · ${manifest.name}`;
    const heading = document.getElementById("current-section");
    if (heading) heading.textContent = route?.subtitle ?? "";
    document.body.classList.toggle("route-ambiente", selected === "ambiente");
    window.dispatchEvent(new CustomEvent("si-route-changed", { detail: selected }));
    closeNavigationDrawer(false);
  }
}
