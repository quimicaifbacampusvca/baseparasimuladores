namespace BaseDemoSI {
  // Contrato de menu: preferência local e acesso contextual; nenhum motor científico.
  const menuGet=(id:string):HTMLElement|null=>document.getElementById(id);
  type MenuPref={dark:boolean;contrast:boolean;font:number;spacing:boolean;motion:boolean;intro:boolean;simple:boolean;vision:string;projector:boolean;startup:string};
  const prefDefault:MenuPref={dark:true,contrast:false,font:1,spacing:false,motion:false,intro:true,simple:false,vision:"none",projector:false,startup:"inicio"};
  const prefKey="family-menu-v1";
  const validVision=["none","protanopia","deuteranopia","tritanopia","acromatopsia"];
  let pref:MenuPref={...prefDefault};
  type ActiveMenuActivity={id:string;kind:ActivityKind;title:string;url:string;steps:readonly LearningStep[]};
  let activityLink="";
  let activeActivity:ActiveMenuActivity|null=null;
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
    // Rem afeta a aplicação inteira, não apenas os rótulos da gaveta.
    root.style.fontSize=pref.font===1?"":`${16*pref.font}px`;
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
    root.dataset.siIntro=pref.intro?"on":"off";
  }
  function updatePref<K extends keyof MenuPref>(key:K,value:MenuPref[K]):void {
    menuPreferences({...pref,[key]:value});
    if(!storage.write(prefKey,JSON.stringify(pref)))notify("Preferência aplicada nesta sessão. O navegador bloqueou o armazenamento.","warning");
  }
  function getActivityContext():ActiveMenuActivity|null {
    const route=currentRoute(window.location.hash);
    let destination=window.location.hash;
    if(route==="ambiente") {
      const returnControl=menuGet("si-return-activity") as HTMLAnchorElement|null;
      if(!returnControl || returnControl.hidden)return null;
      destination=returnControl.getAttribute("href")??"";
    }
    const activityRoute=currentRoute(destination);
    if(activityRoute!=="missoes" && activityRoute!=="roteiros")return null;
    const id=new URLSearchParams(destination.split("?")[1]??"").get("item");
    if(!id)return null;
    const kind:ActivityKind=activityRoute==="missoes"?"mission":"script";
    const activity=menuActivity(kind,id);
    return activity?{id,kind,title:activity.title,url:`#/${activityRoute}?item=${encodeURIComponent(id)}`,steps:activity.steps}:null;
  }
  function syncMenuReview():void {
    const ctx=getActivityContext();activeActivity=ctx;activityLink=ctx?.url??"";
    const activity=menuGet("si-activity-menu");if(activity)activity.hidden=!ctx;
    const context=menuGet("si-activity-context");
    if(context) {
      const done=ctx?menuActivityProgress(ctx.id):0;
      context.textContent=ctx?`${ctx.title} · ${Math.min(done,ctx.steps.length)}/${ctx.steps.length} etapas`:"";
    }
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
    menuGet("si-nav-group-toggle")?.setAttribute("aria-expanded",String(window.matchMedia("(max-width:900px)").matches));
    const routes=menuGet("si-nav-main");if(routes)routes.hidden=!window.matchMedia("(max-width:900px)").matches;
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
    menuGet("si-activity-finish")?.addEventListener("click",()=>{
      const ctx=activeActivity;
      if(!ctx)return;
      closeNavigationDrawer(false);
      const progress=menuActivityProgress(ctx.id);
      if(progress>=ctx.steps.length){notify("Esta atividade já está concluída.","info");window.location.hash=ctx.url;return;}
      const result=advanceActivityFromMenu(ctx.id);
      notify(result.message,result.ok?"success":"warning");
      if(result.ok){window.location.hash=ctx.url;syncMenuReview();}
    });
    menuGet("si-activity-exit")?.addEventListener("click",async()=>{
      const ctx=activeActivity;
      if(!ctx)return;
      const decision=await confirmDialog({title:"Encerrar atividade?",description:"Você retornará ao catálogo. O progresso local já registrado será preservado.",confirmText:"Encerrar"});
      if(!decision)return;
      clearGuidedReturn();
      closeNavigationDrawer(false);
      window.location.hash=ctx.kind==="mission"?"#/missoes":"#/roteiros";
      syncMenuReview();
    });
    syncMenuReview();
  }
}
