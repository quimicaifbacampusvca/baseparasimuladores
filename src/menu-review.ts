namespace BaseDemoSI {
  // Contrato de menu: preferência local e acesso contextual; nenhum motor científico.
  const menuGet=(id:string):HTMLElement|null=>document.getElementById(id);
  type MenuPref={dark:boolean;contrast:boolean;font:number;spacing:boolean;motion:boolean;intro:boolean;simple:boolean;vision:string;projector:boolean;startup:string;sound:boolean;vibrate:boolean};
  const prefDefault:MenuPref={dark:true,contrast:false,font:1,spacing:false,motion:false,intro:true,simple:false,vision:"none",projector:false,startup:"inicio",sound:false,vibrate:false};
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
    configureFeedback(pref.sound,pref.vibrate);
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
    const capabilities=feedbackCapabilities();
    for(const [id,enabled,supported,noteId] of [
      ["si-sound",pref.sound,capabilities.sound,"si-sound-support"],
      ["si-vibrate",pref.vibrate,capabilities.vibration,"si-vibrate-support"]
    ] as [string,boolean,boolean,string][]){
      const control=menuGet(id) as HTMLInputElement|null;
      if(control){control.disabled=!supported;control.checked=supported&&enabled;control.setAttribute("aria-disabled",String(!supported));}
      const note=menuGet(noteId);
      if(note)note.textContent=supported?`${id==="si-sound"?"Som":"Vibração"} ${enabled?"ativado":"desativado"}; controle local`:(id==="si-sound"?"Áudio indisponível neste navegador":"Vibração indisponível neste dispositivo");
    }
    const vision=menuGet("si-vision-select") as HTMLSelectElement|null;if(vision)vision.value=pref.vision;
    const startup=menuGet("si-startup-select") as HTMLSelectElement|null;if(startup)startup.value=pref.startup;
    // Acromatopsia é representável por escala cinza. Os demais perfis
    // demandam transformações de cor validadas e permanecem informativos.
    for(const filter of ["protanopia","deuteranopia","tritanopia","acromatopsia"])root.classList.toggle(`si-color-${filter}`,pref.vision===filter);
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
  // Tour em coachmarks: não altera objetos, não interfere com missões e não
  // ocupa a cena com uma folha inferior que desloque o experimento.
  export function startWorkspaceTour():void {
    if(getActivityContext()){
      notify("O tour está disponível apenas no ambiente livre. Encerre a atividade orientada primeiro.","warning");
      return;
    }
    const steps=[
      {target:"#si-stage",title:"Conheça o ambiente",content:"Esta é a cena central, onde você seleciona e movimenta objetos."},
      {target:'[data-open-dock="montagem"]',title:"Prepare a montagem",content:"Abra Montagem para preparar a cena, selecionar objetos e escolher o módulo de trabalho."},
      {target:'[data-scene-view="overview"]',title:"Foco e visão geral",content:"Alterne entre examinar um objeto selecionado e acompanhar todos os objetos da montagem."},
      {target:'[data-open-dock="ver"]',title:"Observe e meça",content:"Abra Ver para escolher recursos de Observar, Medir e Analisar compatíveis com o módulo."},
      {target:'[data-open-dock="dados"]',title:"Consulte seus registros",content:"Em Dados, você encontra o histórico e os atalhos para Caderno e Relatórios."}
    ];
    const launch=()=>{
      // Evitar sobreposição de diálogos ou de folhas inferiores.
      const previousFocus=document.activeElement as HTMLElement|null;
      const dialog=document.createElement("dialog");dialog.className="si-coach-dialog";
      dialog.setAttribute("aria-label","Tour guiado do ambiente");
      const ring=document.createElement("div");ring.className="si-coach-ring";ring.setAttribute("aria-hidden","true");
      const card=document.createElement("section");card.className="si-coach-card";
      const step=document.createElement("p");step.className="si-coach-step";
      const title=document.createElement("h2");title.id="si-coach-title";
      const content=document.createElement("p");content.className="si-coach-text";
      const actions=document.createElement("div");actions.className="si-coach-actions";
      const back=document.createElement("button"),next=document.createElement("button"),skip=document.createElement("button");
      for(const button of [back,next,skip])button.type="button";
      back.textContent="Voltar";skip.textContent="Pular tour";
      actions.append(skip,back,next);card.append(step,title,content,actions);dialog.append(ring,card);
      dialog.setAttribute("aria-labelledby",title.id);
      document.body.append(dialog);
      let current=0;
      const position=()=>{
        const target=document.querySelector<HTMLElement>(steps[current].target);
        const box=target?.getBoundingClientRect();
        const vw=window.innerWidth,vh=window.innerHeight;
        ring.hidden=!box||box.width<=0||box.height<=0;
        if(box&&!ring.hidden){
          const x=Math.max(4,box.left-5),y=Math.max(4,box.top-5);
          ring.style.left=`${x}px`;ring.style.top=`${y}px`;
          ring.style.width=`${Math.min(vw-4,box.right+5)-x}px`;
          ring.style.height=`${Math.min(vh-4,box.bottom+5)-y}px`;
        }
        const cw=Math.min(430,Math.max(260,vw-24));
        const ch=card.getBoundingClientRect().height;
        const freeBottom=box?vh-box.bottom:0;
        const freeTop=box?box.top:0;
        let cy=(box&&freeBottom>=ch+22)?box.bottom+12:(box&&freeTop>=ch+22)?box.top-ch-12:vh-ch-12;
        cy=Math.max(8,Math.min(cy,vh-ch-8));
        let cx=box?box.left+box.width/2-cw/2:(vw-cw)/2;
        cx=Math.max(10,Math.min(cx,vw-cw-10));
        card.style.left=`${cx}px`;card.style.top=`${cy}px`;
      };
      const show=(index:number)=>{
        current=index;step.textContent=`PASSO ${current+1} DE ${steps.length}`;
        title.textContent=steps[current].title;content.textContent=steps[current].content;
        back.disabled=index===0;next.textContent=index===steps.length-1?"Concluir":"Próximo";
        position();next.focus({preventScroll:true});
      };
      let cleaned=false;
      const cleanup=()=>{
        if(cleaned)return;cleaned=true;
        window.removeEventListener("resize",position);
        document.removeEventListener("scroll",position,true);
        dialog.remove();
        const returnTarget=previousFocus?.isConnected && !previousFocus.closest("#sidebar")?previousFocus:menuGet("nav-toggle");
        returnTarget?.focus({preventScroll:true});
      };
      dialog.addEventListener("close",cleanup,{once:true});
      dialog.addEventListener("cancel",event=>{event.preventDefault();dialog.close();});
      dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
      skip.addEventListener("click",()=>dialog.close());
      back.addEventListener("click",()=>show(Math.max(0,current-1)));
      next.addEventListener("click",()=>{if(current>=steps.length-1)dialog.close();else show(current+1);});
      dialog.addEventListener("keydown",event=>{
        if(event.key!=="Tab")return;
        const buttons=[skip,back,next].filter(button=>!button.disabled);
        if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons[buttons.length-1].focus();}
        else if(!event.shiftKey&&document.activeElement===buttons[buttons.length-1]){event.preventDefault();buttons[0].focus();}
      });
      window.addEventListener("resize",position);
      document.addEventListener("scroll",position,true);
      dialog.showModal();show(0);
    };
    closeNavigationDrawer(false);
    if(currentRoute(window.location.hash)!=="ambiente"){
      window.location.hash="#/ambiente";
      window.requestAnimationFrame(()=>window.requestAnimationFrame(launch));
    }else window.requestAnimationFrame(launch);
  }
  export function setupMenuReview():void {
    try {const value=storage.read(prefKey);if(value){const obj=JSON.parse(value) as Partial<MenuPref>;
      if(obj&&typeof obj==="object")pref={...prefDefault,...obj,font:Math.min(2,Math.max(.8,Number(obj.font)||1)),vision:validVision.includes(obj.vision??"")?obj.vision!:"none",startup:["inicio","ambiente","aprender"].includes(obj.startup??"")?obj.startup!:"inicio",sound:obj.sound===true,vibrate:obj.vibrate===true};}}
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
    menuGet("si-projector")?.addEventListener("click",event=>{
      if(getActivityContext()){event.preventDefault();notify("O modo projetor não pode ser alterado durante uma atividade orientada.","warning");}
    });
    for(const [id,key] of [["si-dark","dark"],["si-contrast","contrast"],["si-letter-spacing","spacing"],["si-motion","motion"],["si-intro","intro"],["si-simple","simple"],["si-projector","projector"]] as [string,keyof MenuPref][]){
      menuGet(id)?.addEventListener("change",event=>updatePref(key,(event.target as HTMLInputElement).checked));
    }
    for(const [id,key,capability] of [["si-sound","sound","sound"],["si-vibrate","vibrate","vibration"]] as [string,"sound"|"vibrate","sound"|"vibration"][]){
      menuGet(id)?.addEventListener("change",event=>{
        const choice=(event.target as HTMLInputElement).checked;
        if(choice&&!feedbackCapabilities()[capability]){
          notify("Este dispositivo não oferece o recurso solicitado.","warning");menuPreferences(pref);return;
        }
        updatePref(key,choice);
        if(choice) signalFeedback("info");
      });
    }
    for(const [id,delta] of [["si-font-minus",-.1],["si-font-plus",.1]] as [string,number][]){menuGet(id)?.addEventListener("click",()=>updatePref("font",Math.round(Math.max(.8,Math.min(2,pref.font+delta))*10)/10));}
    menuGet("si-vision-select")?.addEventListener("change",event=>{
      const v=(event.target as HTMLSelectElement).value;updatePref("vision",v);
      if(v!=="none")notify("Simulação aproximada de visão de cores ativada. Consulte também os rótulos textuais.","info");
    });
    menuGet("si-a11y-reset")?.addEventListener("click",()=>{menuPreferences({...prefDefault});storage.write(prefKey,JSON.stringify(pref));notify("Preferências de acessibilidade restauradas.","success");});
    menuGet("si-drawer-install")?.addEventListener("click",()=>{closeNavigationDrawer(false);menuGet("distribution-install")?.click();});
    menuGet("si-drawer-tour")?.addEventListener("click",startWorkspaceTour);
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
