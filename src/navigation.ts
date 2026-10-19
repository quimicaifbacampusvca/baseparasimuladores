namespace BaseDemoSI {
  let drawerStarted = false;
  const menuButton = () => document.getElementById("nav-toggle") as HTMLButtonElement | null;
  const drawer = () => document.getElementById("sidebar") as HTMLElement | null;
  const backdrop = () => document.getElementById("nav-backdrop") as HTMLElement | null;
  const mainColumn = () => document.getElementById("main-column") as HTMLElement | null;
  const drawerOpen = () => document.body.classList.contains("nav-open");

  export function closeNavigationDrawer(restoreFocus = false): void {
    const wasOpen = drawerOpen();
    document.body.classList.remove("nav-open");
    menuButton()?.setAttribute("aria-expanded", "false");
    drawer()?.setAttribute("aria-hidden", "true");
    const shade = backdrop(); if (shade) shade.hidden = true;
    const page = mainColumn(); if (page) page.inert = false;
    if (restoreFocus && wasOpen) menuButton()?.focus({preventScroll:true});
  }
  function openNavigationDrawer(): void {
    if (isPlatformDialogOpen()) return;
    document.body.classList.add("nav-open");
    menuButton()?.setAttribute("aria-expanded", "true");
    drawer()?.setAttribute("aria-hidden", "false");
    updateMenuContext();
    const shade = backdrop(); if (shade) shade.hidden = false;
    const page = mainColumn(); if (page) page.inert = true;
    // A transição visual não pode impedir a entrada do foco na gaveta modal.
    window.requestAnimationFrame(() => {
      if (!drawerOpen()) return;
      const initial=drawer()?.querySelector<HTMLElement>("#si-nav-close");
      initial?.focus({preventScroll:true});
    });
  }
  function updateMenuContext(): void {
    const route = currentRoute(window.location.hash);
    const found = manifest.routes.find(item=>item.id===route);
    const title = document.getElementById("si-now-title");
    const description = document.getElementById("si-now-description");
    if (title) title.textContent = found?.title ?? "Início";
    if (description) description.textContent = found?.subtitle ?? "Continue sua atividade.";
  }
  function focusableItems(): HTMLElement[] {
    return Array.from(drawer()?.querySelectorAll<HTMLElement>('a[href]:not([hidden]),button:not([disabled]),input:not([disabled]),select:not([disabled])') ?? [])
      .filter(item=>item.getClientRects().length>0);
  }
  export function setupNavigationDrawer(): void {
    if (drawerStarted) return;
    drawerStarted = true;
    menuButton()?.addEventListener("click", () => drawerOpen() ? closeNavigationDrawer(true) : openNavigationDrawer());
    document.getElementById("si-nav-close")?.addEventListener("click", () => closeNavigationDrawer(true));
    document.getElementById("si-nav-continue")?.addEventListener("click", () => closeNavigationDrawer(true));
    document.getElementById("si-nav-group-toggle")?.addEventListener("click", () => {
      const group = document.getElementById("si-nav-main");
      const toggle = document.getElementById("si-nav-group-toggle");
      if (!group || !toggle) return;
      group.hidden = !group.hidden;
      toggle.setAttribute("aria-expanded",String(!group.hidden));
    });
    backdrop()?.addEventListener("click", () => closeNavigationDrawer(true));
    document.addEventListener("keydown", event => {
      if (!drawerOpen()) return;
      if (event.key === "Escape") {event.preventDefault();closeNavigationDrawer(true);return;}
      if (event.key !== "Tab") return;
      const items=focusableItems(); if (!items.length) return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    });
    document.querySelectorAll<HTMLAnchorElement>("#sidebar a[href]").forEach(link=>link.addEventListener("click",()=>{
      if(!drawerOpen()) return;
      closeNavigationDrawer(false);
      // Link navigation has occurred; announce the content destination to keyboard users.
      window.setTimeout(()=>document.getElementById("conteudo")?.focus({preventScroll:true}),0);
    }));
  }
}
