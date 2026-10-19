namespace BaseDemoSI {
  export type SharedPermission = "view" | "run";
  export interface SharedActivityLink {
    readonly format: "base-si-link-v1";
    readonly permission: SharedPermission;
    readonly activity: LearningActivity;
  }
  const MAX_SHARE_CHARS=12000;
  export function encodeSharedActivity(activity:LearningActivity,permission:SharedPermission):string|null {
    if(!validTeacherActivity(activity)||!(permission==="view"||permission==="run"))return null;
    const text=JSON.stringify({format:"base-si-link-v1",permission,activity});
    if(text.length>6000)return null;
    const bytes=new TextEncoder().encode(text);
    let binary="";for(const v of bytes)binary+=String.fromCharCode(v);
    return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
  }
  export function decodeSharedActivity(encoded:string):SharedActivityLink|null {
    if(encoded.length<10||encoded.length>MAX_SHARE_CHARS||!/^[a-zA-Z0-9_-]+$/.test(encoded))return null;
    try {
      const normalized=encoded.replace(/-/g,"+").replace(/_/g,"/");
      const binary=atob(normalized);
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
      const object=JSON.parse(text) as Partial<SharedActivityLink>;
      if(object.format!=="base-si-link-v1"||!(object.permission==="view"||object.permission==="run")||!validTeacherActivity(object.activity))return null;
      if(encodeSharedActivity(object.activity,object.permission)!==encoded)return null;
      return {format:"base-si-link-v1",permission:object.permission,activity:object.activity};
    }catch{return null;}
  }
  export function buildShareLink(activity:LearningActivity,permission:SharedPermission,base:string):string|null {
    const token=encodeSharedActivity(activity,permission);if(!token)return null;
    return base.split("#")[0]+`#/`+(activity.kind==="mission"?"missoes":"roteiros")+`?share=${token}`;
  }
  function parseShareHash(hash:string):SharedActivityLink|null {
    const match=hash.match(/^#\/(?:missoes|roteiros)\?share=([a-zA-Z0-9_-]+)$/);
    if(!match)return null;
    const decoded=decodeSharedActivity(match[1]);
    if(!decoded)return null;
    const route=currentRoute(hash);
    return decoded.activity.kind===(route==="missoes"?"mission":"script")?decoded:null;
  }
  function renderShare():void {
    const route=currentRoute(window.location.hash);
    for(const id of ["si-shared-activity","si-shared-mission"]){const el=document.getElementById(id);if(el){el.hidden=true;el.replaceChildren();}}
    if(route!=="roteiros"&&route!=="missoes")return;
    const element=document.getElementById(route==="roteiros"?"si-shared-activity":"si-shared-mission");if(!element)return;
    const shared=parseShareHash(window.location.hash);
    if(!window.location.hash.includes("share="))return;
    element.hidden=false;
    const text=(tag:string,s:string)=>{const n=document.createElement(tag);n.textContent=s;return n;};
    if(!shared){element.append(text("h2","Link de atividade inválido"),text("p","O conteúdo não passou na validação ou é incompatível."));return;}
    const activity=shared.activity;
    element.append(text("p","Atividade compartilhada · "+(shared.permission==="view"?"Somente consulta":"Execução local permitida")),text("h2",activity.title),text("p",activity.description));
    const ol=document.createElement("ol");for(const step of activity.steps)ol.append(text("li",step.label));element.append(ol);
    element.append(text("p","A atividade foi incorporada ao endereço. Nenhuma informação foi enviada a terceiros. Permissões sem autenticação são apenas controles de interface."));
    if(shared.permission==="run"){
      const button=document.createElement("button");button.type="button";button.className="button primary";button.textContent="Adicionar cópia local para executar";
      button.addEventListener("click",()=>{
        const existing=educationSharePort?.snapshot().teacherActivities.some(a=>a.id===activity.id);
        if(existing){notify("Esta atividade já está na biblioteca local.","info");button.disabled=true;button.textContent="Atividade já disponível";return;}
        // Generate collision-resistant local ID without changing the imported content.
        const clone={...activity,id:`teacher-${Date.now().toString(36)}-${Math.floor(Math.random()*1e8).toString(36)}`};
        if(educationSharePort?.createActivity(clone)){
          notify("Cópia local adicionada. Continue pela lista de atividades.","success");
          button.disabled=true;button.textContent="Cópia adicionada";
        }else notify("Não foi possível adicionar a atividade. Confira o limite da biblioteca.","warning");
      });element.append(button);
    }
  }
  let educationSharePort:EducationPort|null=null;
  export function bindEducationForSharing(port:EducationPort):void {educationSharePort=port;}
  export function setupSharedActivities():void {
    const share=document.getElementById("si-sharing-link") as HTMLInputElement|null;
    document.getElementById("si-sharing-copy")?.addEventListener("click",async()=>{
      if(!share?.value)return;
      try{await navigator.clipboard.writeText(share.value);notify("Link copiado.","success");}
      catch{share.focus();share.select();notify("Selecione e copie o link manualmente.","info");}
    });
    window.addEventListener("si-route-changed",renderShare);
    window.addEventListener("hashchange",renderShare);
    renderShare();
  }
  export function offerShareLink(activity:LearningActivity):void {
    const select=document.getElementById("si-sharing-mode") as HTMLSelectElement|null;
    const permission=select?.value==="run"?"run":"view";
    const link=buildShareLink(activity,permission,window.location.href);
    const input=document.getElementById("si-sharing-link") as HTMLInputElement|null;
    if(input)input.value=link??"";
    const status=document.getElementById("si-sharing-status");if(status)status.textContent=link?`Link de ${permission==="view"?"consulta":"execução local"} pronto para copiar.`:"Não foi possível criar este link.";
  }
}
