namespace BaseDemoSI {
  export interface ManualTopic {readonly id:string;readonly title:string;readonly routes:readonly RouteId[];readonly paragraphs:readonly string[];}
  export const manualTopics: readonly ManualTopic[] = Object.freeze([
    {id:"inicio",title:"Primeiros passos",routes:["inicio"],paragraphs:["A página inicial organiza os recursos locais. Abra Ambiente para interagir com uma cena neutra.","A navegação usa seções independentes e mantém os dados desta instalação no navegador."]},
    {id:"bancada",title:"Bancada, docas e foco",routes:["ambiente"],paragraphs:["Em Montagem, crie e selecione objetos. Foco destaca o selecionado; Visão geral exibe o conjunto.","No celular, Montagem, Ver e Dados abrem como folhas inferiores. Escape fecha painéis e diálogos."]},
    {id:"modulos",title:"Módulos configuráveis",routes:["ambiente","configuracoes"],paragraphs:["Livre habilita todos os recursos; Explorar oferece manipulação e observação; Medir apresenta instrumentos; Calcular expõe análise genérica.","Módulos limitam controles disponíveis na interface. Não substituem validação científica nem mecanismos de segurança de acesso."]},
    {id:"instrumentos",title:"Ferramentas e instrumentos",routes:["ambiente"],paragraphs:["Ferramentas alteram a cena; instrumentos registram leituras. A extensão ativa é escolhida nos Ajustes da doca Montagem.","O painel Ver possui visualizações conectáveis de observação, medição e análise. Dados oferece histórico das leituras."]},
    {id:"aprendizagem",title:"Aprender, Missões e Roteiros",routes:["aprender","missoes","roteiros"],paragraphs:["Aprender apresenta temas com marcação de leitura concluída. Missões e Roteiros verificam condições da cena ou a confirmação manual.","O botão Montar na bancada abre o ambiente; depois, retorne à atividade para conferir cada etapa."]},
    {id:"professor",title:"Atividades do professor e links",routes:["professor","missoes","roteiros"],paragraphs:["A Área do Professor cria atividades locais, exporta ou importa JSON e gera links autocontidos para uma atividade.","O link de consulta não autoriza executar; o link de execução permite criar uma cópia local da atividade. Não há autenticação, restrição criptográfica ou controle remoto de estudantes."]},
    {id:"registros",title:"Caderno e relatórios",routes:["caderno","relatorios"],paragraphs:["O Caderno reúne observações, hipóteses e conclusões. Relatórios capturam uma cópia da cena e dos registros no momento da criação.","Os registros podem ser exportados em JSON, e os relatórios em HTML autocontido, prontos para impressão."]},
    {id:"offline",title:"Trabalhar sem internet",routes:["configuracoes"],paragraphs:["O standalone é um arquivo HTML com recursos incorporados. A PWA necessita de instalação e cache inicial em origem segura.","Prefira backups JSON para garantir portabilidade. O armazenamento depende das permissões e dos limites do navegador."]},
    {id:"acessibilidade",title:"Teclado e acessibilidade",routes:["configuracoes","ambiente"],paragraphs:["Use Tab para navegar, Escape para fechar painéis, as setas para deslocar o objeto selecionado e Ctrl/⌘+Z para desfazer.","A interface adapta-se a diferentes larguras e respeita a redução de movimento configurada no dispositivo."]}
  ]);
  export function searchManual(query:string, route?:RouteId): readonly ManualTopic[] {
    const clean=query.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim().slice(0,100);
    return manualTopics.filter(topic=>{
      if(route && !topic.routes.includes(route))return false;
      if(!clean)return true;
      const full=[topic.title,...topic.paragraphs].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
      return full.includes(clean);
    });
  }
  function manualElement(tag:string,content:string):HTMLElement {const n=document.createElement(tag);n.textContent=content;return n;}
  function manualSelectedTopic():string {
    return new URLSearchParams(window.location.hash.split("?")[1]??"").get("topic")??"";
  }
  function renderManual():void {
    const list=document.getElementById("manual-topics"),count=document.getElementById("manual-results-count"),index=document.getElementById("manual-index");if(!list)return;
    const input=document.getElementById("manual-search") as HTMLInputElement|null;
    const searching=!!input?.value.trim();const results=searchManual(input?.value??"");
    const selected=manualSelectedTopic();list.replaceChildren();index?.replaceChildren();
    if(index){index.append(manualElement("h2","Índice do Manual"));
      const group=document.createElement("div");group.className="si-manual-index-links";
      for(const topic of results){const link=document.createElement("a");link.href=`#/manual?topic=${encodeURIComponent(topic.id)}`;link.textContent=topic.title;
        if(selected===topic.id)link.setAttribute("aria-current","true");group.append(link);}
      index.append(group);
    }
    for(const topic of results){
      const article=document.createElement("article");article.className="card si-manual-topic";article.id="manual-"+topic.id;
      const details=document.createElement("details");details.open=searching || selected===topic.id;
      details.append(manualElement("summary",topic.title));for(const paragraph of topic.paragraphs)details.append(manualElement("p",paragraph));
      article.append(details);list.append(article);
    }
    if(count)count.textContent=`${results.length} de ${manualTopics.length} orientações`;
    if(!results.length)list.append(manualElement("p","Nenhuma orientação encontrada. Tente outro termo."));
  }
  export function setupManual():void {
    document.getElementById("manual-search")?.addEventListener("input",renderManual);
    window.addEventListener("si-route-changed",()=>{if(currentRoute(window.location.hash)==="manual")renderManual();});
    document.addEventListener("keydown",event=>{
      if(event.key!=="F1"||event.altKey||event.ctrlKey||event.metaKey||isPlatformDialogOpen())return;
      event.preventDefault();
      const current=currentRoute(window.location.hash);
      const topic=manualTopics.find(t=>t.routes.includes(current))?.id??"inicio";
      window.location.hash=`#/manual?topic=${topic}`;
    });
    document.getElementById("manual-index")?.addEventListener("click",event=>{
      const link=(event.target as HTMLElement).closest("a");
      if(!link)return;
      // A mudança de hash conserva a seção e seleciona o item no índice.
      window.setTimeout(()=>document.getElementById("manual-"+manualSelectedTopic())?.querySelector("summary")?.focus({preventScroll:true}),0);
    });
    renderManual();
  }
}
