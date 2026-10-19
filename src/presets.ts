namespace BaseDemoSI {
  // Montagens sem conteúdo científico: o motor e os objetos pertencem à extensão.
  export interface ScenePreset { readonly id:string;readonly name:string;readonly snapshot:SceneSnapshot;readonly builtin:boolean; }
  const key="si-scene-presets-v1";
  const builtins:readonly ScenePreset[] = [
    {id:"modelo-basico",name:"Objeto central",builtin:true,snapshot:{schemaVersion:1,selectedId:null,entities:[{id:"preset-1",kind:"block",label:"Objeto central",x:50,y:50,width:20,height:20,tone:"teal"}]}},
    {id:"modelo-comparacao",name:"Comparação lado a lado",builtin:true,snapshot:{schemaVersion:1,selectedId:null,entities:[
      {id:"preset-1",kind:"circle",label:"Objeto A",x:32,y:49,width:18,height:18,tone:"blue"},
      {id:"preset-2",kind:"circle",label:"Objeto B",x:68,y:49,width:18,height:18,tone:"amber"}]}},
    {id:"modelo-analise",name:"Composição com legenda",builtin:true,snapshot:{schemaVersion:1,selectedId:null,entities:[
      {id:"preset-1",kind:"block",label:"Estrutura",x:49,y:39,width:23,height:20,tone:"teal"},
      {id:"preset-2",kind:"label",label:"Observação",x:49,y:72,width:29,height:10,tone:"blue"}]}}
  ];
  const validPresetName=(value:unknown):value is string=>typeof value==="string" && value.trim().length>=2 && value.trim().length<=64;
  export function parseCustomPresets(input:unknown):ScenePreset[] {
    if(!Array.isArray(input)||input.length>8)return [];
    const seen=new Set<string>();const result:ScenePreset[]=[];
    for(const item of input){
      if(!item||typeof item!=="object"||Array.isArray(item))return [];
      const raw=item as Partial<ScenePreset>;
      if(typeof raw.id!=="string"||!/^user-[a-z0-9-]{1,55}$/.test(raw.id)||seen.has(raw.id)||!validPresetName(raw.name)||raw.builtin!==false)return [];
      const snapshot=parseScene(raw.snapshot);
      if(!snapshot||snapshot.entities.length===0)return [];
      seen.add(raw.id);result.push({id:raw.id,name:raw.name.trim(),snapshot,builtin:false});
    }
    return result;
  }
  let saved:ScenePreset[]=[];
  let opened=false;
  const byId=(id:string)=>document.getElementById(id);
  export function setupPresets(sceneStore:SceneStore):void {
    let dirty=false;
    try{const value=storage.read(key);if(value!==null){saved=parseCustomPresets(JSON.parse(value));dirty=JSON.parse(value).length!==saved.length;}}
    catch{saved=[];dirty=true;}
    const trigger=byId("si-drawer-presets");if(!trigger)return;
    const dialog=document.createElement("dialog");dialog.className="si-preset-dialog";dialog.setAttribute("aria-labelledby","si-preset-title");
    const container=document.createElement("div");container.className="si-preset-layout";
    const heading=document.createElement("h2");heading.id="si-preset-title";heading.textContent="Montagens prontas";
    const description=document.createElement("p");description.textContent="Escolha uma montagem neutra ou guarde a organização atual para reutilizar nesta instalação.";
    const list=document.createElement("div");list.className="si-preset-list";list.setAttribute("role","group");list.setAttribute("aria-label","Montagens disponíveis");
    const label=document.createElement("label");label.textContent="Nome da montagem atual";label.htmlFor="si-preset-name";
    const input=document.createElement("input");input.id="si-preset-name";input.maxLength=64;input.placeholder="Ex.: Investigação 1";
    const actions=document.createElement("div");actions.className="si-preset-actions";
    const save=document.createElement("button");save.type="button";save.textContent="Guardar montagem";
    const close=document.createElement("button");close.type="button";close.textContent="Fechar";
    actions.append(save,close);container.append(heading,description,list,label,input,actions);dialog.append(container);document.body.append(dialog);
    const closeDialog=()=>{if(dialog.open)dialog.close();};
    function persist():boolean{return storage.write(key,JSON.stringify(saved));}
    function rebuild():void {
      list.replaceChildren();
      for(const preset of [...builtins,...saved]){
        const row=document.createElement("div");row.className="si-preset-entry";
        const info=document.createElement("span");info.textContent=`${preset.name} · ${preset.snapshot.entities.length} objeto(s)`;
        const load=document.createElement("button");load.type="button";load.textContent="Montar";load.disabled=!sceneManipulationAllowed();
        load.addEventListener("click",async()=>{
          if(!sceneManipulationAllowed()){notify("Este módulo não permite manipular a montagem.","warning");return;}
          const current=sceneStore.getSnapshot();closeDialog();
          if(current.entities.length){
            const accepted=await confirmDialog({title:"Substituir montagem atual?",description:"A montagem atual será substituída. Você poderá usar Desfazer para recuperar todos os objetos de uma vez.",confirmText:"Montar",destructive:true});
            if(!accepted)return;
          }
          if(sceneStore.dispatch({type:"replace",snapshot:preset.snapshot})){closeNavigationDrawer(false);window.location.hash="#/ambiente";notify(`Montagem “${preset.name}” aplicada. Use Desfazer para recuperar a anterior.`,"success");}
          else notify("A montagem escolhida já está na cena.","info");
        });
        row.append(info,load);
        if(!preset.builtin){const remove=document.createElement("button");remove.type="button";remove.textContent="Excluir";remove.setAttribute("aria-label",`Excluir montagem ${preset.name}`);remove.addEventListener("click",async()=>{
          closeDialog();const accepted=await confirmDialog({title:"Excluir montagem guardada?",description:`A montagem “${preset.name}” será excluída do catálogo local.`,confirmText:"Excluir",destructive:true});
          if(!accepted)return;
          saved=saved.filter(x=>x.id!==preset.id);if(!persist())notify("Montagem excluída nesta sessão, mas o armazenamento está bloqueado.","warning");rebuild();dialog.showModal();
        });row.append(remove);}
        list.append(row);
      }
    }
    trigger.addEventListener("click",()=>{
      if(opened||dialog.open)return;
      closeNavigationDrawer(false);rebuild();dialog.showModal();input.focus();
      if(dirty)notify("Algumas montagens locais eram inválidas e não foram carregadas.","warning");dirty=false;
    });
    save.addEventListener("click",()=>{
      const snapshot=sceneStore.getSnapshot();const name=input.value.trim();
      if(!sceneManipulationAllowed()){notify("A montagem não pode ser editada neste módulo.","warning");return;}
      if(!validPresetName(name)){notify("Informe um nome entre 2 e 64 caracteres.","warning");input.focus();return;}
      if(!snapshot.entities.length){notify("Adicione um objeto antes de guardar uma montagem.","warning");return;}
      if(saved.length>=8){notify("Limite de 8 montagens locais atingido.","warning");return;}
      const id=`user-${Date.now().toString(36)}-${saved.length}`;
      saved=[...saved,{id,name,snapshot,builtin:false}];
      if(!persist())notify("Montagem guardada nesta sessão, mas o armazenamento local está indisponível.","warning");
      else notify("Montagem guardada no dispositivo.","success");
      input.value="";rebuild();
    });
    close.addEventListener("click",closeDialog);
    dialog.addEventListener("close",()=>{trigger.focus({preventScroll:true});});
    window.addEventListener("si-module-change",()=>{if(dialog.open)rebuild();});
  }
}
