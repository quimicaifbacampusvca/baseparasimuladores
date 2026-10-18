namespace BaseDemoSI {
  export type NoticeKind = "info" | "success" | "warning" | "error";
  export interface DialogSpec {
    readonly title: string;
    readonly description: string;
    readonly confirmText?: string;
    readonly cancelText?: string;
    readonly destructive?: boolean;
  }
  /** Porta compartilhada de notificações; nenhuma notificação depende de serviços externos. */
  let noticeSerial = 0;
  const noticeTimers = new Map<HTMLElement, number>();
  export function notify(text: string, kind: NoticeKind = "info"): void {
    const rail = document.getElementById("si-notifications");
    if (!rail) return;
    const item = document.createElement("div");
    item.className = `si-notice si-notice-${kind}`;
    item.setAttribute("role", kind === "error" ? "alert" : "status");
    item.dataset.noticeId = String(++noticeSerial);
    const message = document.createElement("span"); message.textContent = text;
    const dismiss = document.createElement("button"); dismiss.type = "button";
    dismiss.textContent = "×"; dismiss.setAttribute("aria-label", "Dispensar notificação");
    item.append(message, dismiss);
    const remove = (): void => {
      const timer = noticeTimers.get(item);
      if (timer !== undefined) { window.clearTimeout(timer); noticeTimers.delete(item); }
      item.remove();
    };
    dismiss.addEventListener("click", remove);
    rail.append(item);
    while (rail.children.length > 3) (rail.firstElementChild as HTMLElement)?.querySelector<HTMLButtonElement>("button")?.click();
    const duration = kind === "error" ? 9000 : kind === "warning" ? 6500 : 4400;
    noticeTimers.set(item, window.setTimeout(remove, duration));
  }
  type ModalResolve = (accepted:boolean)=>void;
  let finishModal:ModalResolve|null=null;
  let dialogOrigin:HTMLElement|null=null;
  let modalOpen = false;
  const dialogNode=(id:string)=>document.getElementById(id);
  /** Modal acessível sem window.confirm(): exige decisão explícita e restaura o foco. */
  export function confirmDialog(spec:DialogSpec):Promise<boolean> {
    const root=dialogNode("si-modal") as HTMLDivElement|null;
    if (!root || modalOpen) return Promise.resolve(false);
    modalOpen=true; dialogOrigin=document.activeElement instanceof HTMLElement?document.activeElement:null;
    dialogNode("si-modal-title")!.textContent=spec.title;
    dialogNode("si-modal-description")!.textContent=spec.description;
    const accept=dialogNode("si-modal-confirm") as HTMLButtonElement;
    const cancel=dialogNode("si-modal-cancel") as HTMLButtonElement;
    accept.textContent=spec.confirmText??"Confirmar";
    cancel.textContent=spec.cancelText??"Cancelar";
    accept.classList.toggle("si-button-danger",!!spec.destructive);
    root.hidden=false; document.body.classList.add("si-modal-active");
    const app=document.querySelector<HTMLElement>(".app-shell");if(app)app.inert=true;
    // Sem dependência de HTMLDialogElement, compatível com os navegadores-alvo.
    cancel.focus({preventScroll:true});
    return new Promise<boolean>(resolve=>{finishModal=resolve;});
  }
  function settleDialog(accepted:boolean):void {
    if(!modalOpen)return;
    const resolve=finishModal;finishModal=null;modalOpen=false;
    const root=dialogNode("si-modal");if(root)root.hidden=true;
    document.body.classList.remove("si-modal-active");
    const app=document.querySelector<HTMLElement>(".app-shell");if(app)app.inert=false;
    const focusTarget=dialogOrigin?.matches(":disabled")?document.getElementById("scene-undo"):dialogOrigin;
    focusTarget?.focus({preventScroll:true});dialogOrigin=null;
    resolve?.(accepted);
  }
  function focusableIn(el:HTMLElement):HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]'))
      .filter(item=>!item.closest('[hidden],[inert]') && item.getClientRects().length>0);
  }
  export function isPlatformDialogOpen():boolean {return modalOpen;}
  export function setupComponents():void {
    dialogNode("si-modal-cancel")?.addEventListener("click",()=>settleDialog(false));
    dialogNode("si-modal-confirm")?.addEventListener("click",()=>settleDialog(true));
    // Clicar fora equivale a cancelar, não confirmar uma ação destrutiva.
    dialogNode("si-modal")?.addEventListener("click",event=>{if(event.target===event.currentTarget)settleDialog(false);});
    document.addEventListener("keydown",event=>{
      if(!modalOpen)return;
      if(event.key==="Escape"){event.preventDefault();event.stopImmediatePropagation();settleDialog(false);return;}
      if(event.key!=="Tab")return;
      const root=dialogNode("si-modal")!;
      const items=focusableIn(root);if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    },true);
    window.addEventListener("si-route-changed",()=>settleDialog(false));
  }
  /** Menu de ações reutilizável: fechar por Escape, clique externo e perda de foco. */
  export function setupActionMenu(triggerId:string,menuId:string,activate:(action:string)=>void):void {
    const trigger=dialogNode(triggerId) as HTMLButtonElement|null;
    const menu=dialogNode(menuId);if(!trigger||!menu)return;
    const items=()=>Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'));
    const close=(restore:boolean):void=>{menu.hidden=true;trigger.setAttribute("aria-expanded","false");if(restore)trigger.focus({preventScroll:true});};
    const open=():void=>{if(modalOpen)return;menu.hidden=false;trigger.setAttribute("aria-expanded","true");items()[0]?.focus({preventScroll:true});};
    trigger.addEventListener("click",()=>menu.hidden?open():close(true));
    trigger.addEventListener("keydown",event=>{if(["ArrowDown","Enter"," "].includes(event.key)){event.preventDefault();open();}});
    menu.addEventListener("click",event=>{
      const clicked=(event.target as HTMLElement).closest<HTMLButtonElement>('[role="menuitem"]');
      if(!clicked||!menu.contains(clicked))return;
      const action=clicked.dataset.menuAction;
      close(true);if(action)activate(action);
    });
    menu.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close(true);return;}
      if(event.key==="Tab"){close(false);return;}
      if(!["ArrowUp","ArrowDown","Home","End"].includes(event.key))return;
      event.preventDefault();const list=items(),index=list.indexOf(document.activeElement as HTMLButtonElement);
      const next=event.key==="Home"?0:event.key==="End"?list.length-1:(index+(event.key==="ArrowDown"?1:-1)+list.length)%list.length;
      list[next]?.focus();
    });
    document.addEventListener("pointerdown",event=>{
      if(menu.hidden)return;
      if(!menu.contains(event.target as Node)&&!trigger.contains(event.target as Node))close(false);
    });
    window.addEventListener("si-route-changed",()=>close(false));
  }
}
