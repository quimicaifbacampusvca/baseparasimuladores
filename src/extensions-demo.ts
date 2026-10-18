namespace BaseDemoSI {
  /** Extensão neutra: demonstra contratos e ferramentas, sem afirmar fenômenos reais. */
  interface DemoState { readonly actions: number; }
  export const neutralDemoExtension: SimulationExtension<DemoState> = {
    metadata:{id:"demo.neutral",name:"Operações neutras",version:"1.0.0",
      description:"Demonstra ações sobre objetos e leitura de propriedades sem qualquer modelo científico."},
    initialState:()=>({actions:0}),
    isState:(value:unknown):value is DemoState=>{
      if(!value||typeof value!=="object"||Array.isArray(value))return false;
      const v=value as Partial<DemoState>;
      return Number.isSafeInteger(v.actions) && typeof v.actions === "number" && v.actions >= 0 && v.actions <= 1000000;
    },
    tools:[
      {id:"step",name:"Avançar posição",description:"Desloca o objeto selecionado 2% para a direita, respeitando os limites.",requiresSelection:true,
        run:({selected,state})=>{
          if(!selected)throw Error("Nenhum objeto selecionado");
          const position=Math.min(100-selected.width/2,selected.x+2);
          return {command:{type:"update",id:selected.id,changes:{x:position}},nextState:{actions:state.actions+1},
            message:"Posição avançada em até 2 pontos percentuais."};
        }},
      {id:"tone",name:"Alternar aparência",description:"Alterna a cor do objeto selecionado.",requiresSelection:true,
        run:({selected,state})=>{
          if(!selected)throw Error("Nenhum objeto selecionado");
          const colors:readonly EntityTone[]=["teal","blue","amber"];
          const tone=colors[(colors.indexOf(selected.tone)+1)%colors.length];
          return {command:{type:"update",id:selected.id,changes:{tone}},nextState:{actions:state.actions+1},
            message:"A aparência do objeto foi alternada."};
        }}
    ],
    instruments:[
      {id:"position",name:"Posição X",description:"Lê a coordenada horizontal percentual do objeto.",requiresSelection:true,
        read:({selected})=>({label:"Posição X",value:selected?.x??0,unit:"%"})},
      {id:"quantity",name:"Quantidade",description:"Lê a quantidade atual de objetos na cena.",requiresSelection:false,
        read:({scene})=>({label:"Quantidade de objetos",value:scene.entities.length,unit:"objetos"})},
      {id:"operations",name:"Operações",description:"Lê o contador de ferramentas desta extensão.",requiresSelection:false,
        read:({state})=>({label:"Operações executadas",value:state.actions,unit:"ações"})}
    ]
  };
}
