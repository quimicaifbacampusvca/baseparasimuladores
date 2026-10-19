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
    const shade = backdrop(); if (shade) shade.hidden = true;
    const page = mainColumn(); if (page) page.inert = false;
    if (restoreFocus && wasOpen) menuButton()?.focus({preventScroll:true});
  }
  function openNavigationDrawer(): void {
    if (isPlatformDialogOpen()) return;
    document.body.classList.add("nav-open");
    menuButton()?.setAttribute("aria-expanded", "true");
    const shade = backdrop(); if (shade) shade.hidden = false;
    const page = mainColumn(); if (page) page.inert = true;
    drawer()?.querySelector<HTMLElement>('.nav a[aria-current="page"],.nav a[href]')?.focus({preventScroll:true});
  }
  function focusableItems(): HTMLElement[] {
    return Array.from(drawer()?.querySelectorAll<HTMLElement>('a[href]:not([hidden]),button:not([disabled])') ?? [])
      .filter(item=>item.getClientRects().length>0);
  }
  export function setupNavigationDrawer(): void {
    if (drawerStarted) return;
    drawerStarted = true;
    menuButton()?.addEventListener("click", () => drawerOpen() ? closeNavigationDrawer(true) : openNavigationDrawer());
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
