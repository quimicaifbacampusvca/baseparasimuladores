namespace BaseDemoSI {
  // Contrato de menu: preferência local e acesso contextual; nenhum motor científico.
  const menuGet=(id:string):HTMLElement|null=>document.getElementById(id);
  type MenuPref={dark:boolean;contrast:boolean;font:number;spacing:boolean;motion:boolean;intro:boolean;simple:boolean;vision:string;projector:boolean;startup:string};
  const prefDefault:MenuPref={dark:true,contrast:false,font:1,spacing:false,motion:false,intro:true,simple:false,vision:"none",projector:false,startup:"inicio"};
  const prefKey="family-menu-v1";
  const validVision=["none","protanopia","deuteranopia","tritanopia","acromatopsia"];
  let pref:MenuPref={...prefDefault};
  let activityLink="";
  const checkbox=(id:string,checked:boolean)=>{const node=menuGet(id) as HTMLInputElement|null;if(node)node.checked=checked;};
  function menuPreferences(value:MenuPref):void {
    pref=value;
    const root=document.documentElement;
    const theme= pref.dark ? "escuro" : "claro";
    applyTheme(theme);
    (menuGet("theme-choice") as HTMLSelectElement|null)?.setAttribute("data-from-menu",theme);
    const selector=menuGet("theme-choice") as HTMLSelectElement|null;if(selector)selector.value=theme;
    storage.write("theme",theme);
    root.classList.toggle("si-highcontrast",pref.contrast);
    root.classList.toggle("si-large-spacing",pref.spacing);
    root.classList.toggle("si-no-motion",pref.motion);
    root.classList.toggle("si-simple-reading",pref.simple);
    root.classList.toggle("si-font-mod",pref.font!==1);
    root.style.setProperty("--si-font-factor",String(pref.font));
    document.body.classList.toggle("si-projector-mode",pref.projector);
    for(const [id,v] of [["si-dark",pref.dark],["si-contrast",pref.contrast],["si-letter-spacing",pref.spacing],["si-motion",pref.motion],["si-intro",pref.intro],["si-simple",pref.simple],["si-projector",pref.projector]] as [string,boolean][])checkbox(id,v);
    const output=menuGet("si-font-output");if(output)output.textContent=`${Math.round(pref.font*100)}%`;
    const minus=menuGet("si-font-minus") as HTMLButtonElement|null;
    const plus=menuGet("si-font-plus") as HTMLButtonElement|null;
    if(minus)minus.disabled=pref.font<=.8;if(plus)plus.disabled=pref.font>=2;
    const vision=menuGet("si-vision-select") as HTMLSelectElement|null;if(vision)vision.value=pref.vision;
    const startup=menuGet("si-startup-select") as HTMLSelectElement|null;if(startup)startup.value=pref.startup;
    // Acromatopsia é representável por escala cinza. Os demais perfis
    // demandam transformações de cor validadas e permanecem informativos.
    root.classList.toggle("si-achromatopsia",pref.vision==="acromatopsia");
  }
  function updatePref<K extends keyof MenuPref>(key:K,value:MenuPref[K]):void {
    menuPreferences({...pref,[key]:value});
    if(!storage.write(prefKey,JSON.stringify(pref)))notify("Preferência aplicada nesta sessão. O navegador bloqueou o armazenamento.","warning");
  }
  function getActivityContext():{title:string;url:string}|null {
    const route=currentRoute(window.location.hash);
    const item=new URLSearchParams((window.location.hash.split("?")[1]??"")).get("item");
    if(item&&(route==="missoes"||route==="roteiros")){
      const candidates=[...officialActivities];
      const match=candidates.find(a=>a.id===item);
      if(match)return {title:match.title,url:`#/${route}?item=${encodeURIComponent(item)}`};
    }
    const returnControl=menuGet("si-return-activity") as HTMLAnchorElement|null;
    if(route==="ambiente"&&returnControl&&!returnControl.hidden&&returnControl.href){
      const path=returnControl.getAttribute("href")??"";
      if(path.startsWith("#/"))return {title:"Atividade orientada",url:path};
    }
    return null;
  }
  function syncMenuReview():void {
    const ctx=getActivityContext();activityLink=ctx?.url??"";
    const activity=menuGet("si-activity-menu");if(activity)activity.hidden=!ctx;
    const context=menuGet("si-activity-context");if(context)context.textContent=ctx?`${ctx.title} · execução local`:"";
    const title=menuGet("si-menu-title");if(title)title.textContent=ctx?"Menu da atividade":"Menu";
    const now=menuGet("si-now-title"),desc=menuGet("si-now-description");
    const route=currentRoute(window.location.hash),info=manifest.routes.find(x=>x.id===route);
    if(now)now.textContent=info?.title??"Início";
    if(desc)desc.textContent=route==="ambiente"?"Ambiente livre · Cena e ferramentas":info?.subtitle??"Seu contexto atual";
    const button=menuGet("si-nav-continue");if(button)button.textContent=route==="ambiente"?"Continuar no ambiente":"Continuar nesta tela";
  }
  function openAccessibility():void {
    const menu=menuGet("nav-toggle") as HTMLButtonElement|null;
    if(menu?.getAttribute("aria-expanded")!=="true")menu?.click();
    const area=menuGet("si-a11y-panel"),expand=menuGet("si-a11y-toggle");
    if(area)area.hidden=false;if(expand)expand.setAttribute("aria-expanded","true");
    expand?.focus({preventScroll:true});expand?.scrollIntoView({block:"nearest"});
  }
  function togglePanel(triggerId:string,panelId:string):void {
    const trigger=menuGet(triggerId);const panel=menuGet(panelId);if(!panel||!trigger)return;
    panel.hidden=!panel.hidden;trigger.setAttribute("aria-expanded",String(!panel.hidden));
  }
  function tour():void {
    window.location.hash="#/ambiente";
    closeNavigationDrawer(false);
    const targets=["#si-stage","#si-dock-left","#si-dock-right",".si-actionbar"];
    const captions=["Esta é a cena principal, que recebe os objetos.","Montagem reúne objetos e ferramentas.","Ver e Dados apresentam visualizações e registros.","A barra de ações reúne operações de edição e histórico."];
    let index=0;
    const root=document.createElement("div");root.className="si-tour-overlay";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","Tour do ambiente");
    const card=document.createElement("section");card.className="si-tour-card";
    const title=document.createElement("h2");const detail=document.createElement("p");const buttons=document.createElement("div");
    const back=document.createElement("button"),next=document.createElement("button"),exit=document.createElement("button");
    back.type=next.type=exit.type="button";back.textContent="Anterior";exit.textContent="Encerrar";
    function done(){document.removeEventListener("keydown",key);root.remove();}
    function key(ev:KeyboardEvent){if(ev.key==="Escape"){ev.preventDefault();done();}}
    function render(){title.textContent=`Tour do ambiente · ${index+1}/${captions.length}`;detail.textContent=captions[index];back.disabled=index===0;next.textContent=index===captions.length-1?"Concluir":"Próximo";
      const item=document.querySelector<HTMLElement>(targets[index]);if(item){item.scrollIntoView({block:"center",behavior:"instant"});}}
    back.addEventListener("click",()=>{index=Math.max(index-1,0);render();});next.addEventListener("click",()=>{if(index===captions.length-1)done();else{index++;render();}});exit.addEventListener("click",done);
    buttons.append(back,next,exit);card.append(title,detail,buttons);root.append(card);document.body.append(root);render();next.focus();document.addEventListener("keydown",key);
  }
  export function setupMenuReview():void {
    try {const value=storage.read(prefKey);if(value){const obj=JSON.parse(value) as Partial<MenuPref>;
      if(obj&&typeof obj==="object")pref={...prefDefault,...obj,font:Math.min(2,Math.max(.8,Number(obj.font)||1)),vision:validVision.includes(obj.vision??"")?obj.vision!:"none",startup:["inicio","ambiente","aprender"].includes(obj.startup??"")?obj.startup!:"inicio"};}}
    catch{pref={...prefDefault};}
    const theme=normalizeTheme(storage.read("theme"));if(theme!=="sistema")pref.dark=theme==="escuro";
    menuPreferences(pref);
    // Apenas na abertura sem destino indicado é aplicada a tela inicial.
    if(!window.location.hash || window.location.hash==="#/")window.location.hash=`#/${pref.startup}`;
    // A lista de destinos deve iniciar expandida em qualquer tamanho de tela.
    // O usuário pode recolhê-la manualmente sem perder o acesso ao menu.
    menuGet("si-nav-group-toggle")?.setAttribute("aria-expanded","true");
    const routes=menuGet("si-nav-main");if(routes)routes.hidden=false;
    menuGet("si-a11y-toggle")?.addEventListener("click",()=>togglePanel("si-a11y-toggle","si-a11y-panel"));
    menuGet("si-startup-toggle")?.addEventListener("click",()=>togglePanel("si-startup-toggle","si-startup-panel"));
    menuGet("si-header-access")?.addEventListener("click",openAccessibility);
    menuGet("nav-toggle")?.addEventListener("click",()=>requestAnimationFrame(syncMenuReview));
    window.addEventListener("si-route-changed",syncMenuReview);
    menuGet("si-startup-select")?.addEventListener("change",event=>updatePref("startup",(event.target as HTMLSelectElement).value));
    for(const [id,key] of [["si-dark","dark"],["si-contrast","contrast"],["si-letter-spacing","spacing"],["si-motion","motion"],["si-intro","intro"],["si-simple","simple"],["si-projector","projector"]] as [string,keyof MenuPref][]){
      menuGet(id)?.addEventListener("change",event=>updatePref(key,(event.target as HTMLInputElement).checked));
    }
    for(const [id,delta] of [["si-font-minus",-.1],["si-font-plus",.1]] as [string,number][]){menuGet(id)?.addEventListener("click",()=>updatePref("font",Math.round(Math.max(.8,Math.min(2,pref.font+delta))*10)/10));}
    menuGet("si-vision-select")?.addEventListener("change",event=>{const v=(event.target as HTMLSelectElement).value;updatePref("vision",v);if(v!=="none"&&v!=="acromatopsia")notify("Perfil registrado. A simulação visual dessa alteração ainda requer validação específica.","info");});
    menuGet("si-a11y-reset")?.addEventListener("click",()=>{menuPreferences({...prefDefault});storage.write(prefKey,JSON.stringify(pref));notify("Preferências de acessibilidade restauradas.","success");});
    menuGet("si-drawer-install")?.addEventListener("click",()=>{closeNavigationDrawer(false);menuGet("distribution-install")?.click();});
    menuGet("si-drawer-tour")?.addEventListener("click",tour);
    menuGet("si-guide-open")?.addEventListener("click",()=>{closeNavigationDrawer(false);window.location.hash="#/manual";notify("Consulte as orientações de acessibilidade e os recursos para mediação em sala.","info");});
    menuGet("si-activity-about")?.addEventListener("click",()=>{if(activityLink){closeNavigationDrawer(false);window.location.hash=activityLink;}});
    menuGet("si-activity-finish")?.addEventListener("click",()=>{if(activityLink){closeNavigationDrawer(false);window.location.hash=activityLink;notify("Confira os critérios e registre a etapa na própria atividade.","info");}});
    menuGet("si-activity-exit")?.addEventListener("click",async()=>{const decision=await confirmDialog({title:"Encerrar atividade?",description:"Você retornará ao catálogo. O progresso local já registrado será preservado.",confirmText:"Encerrar"});if(decision){closeNavigationDrawer(false);window.location.hash="#/roteiros";}});
    syncMenuReview();
  }
}
