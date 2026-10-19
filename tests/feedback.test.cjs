const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sound={created:0,tones:[],started:0,vibrate:[]};
class AudioContextMock {
  constructor(){sound.created++;this.currentTime=0;this.destination={};this.state='running';}
  createOscillator(){return {type:'',frequency:{value:0},connect(){return this;},start(){sound.started++;sound.tones.push(this.frequency.value);},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}};}
}
const window={AudioContext:AudioContextMock};
const navigator={vibrate:pattern=>{sound.vibrate.push(pattern);return true;}};
const context={window,navigator,document:{readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById(){return null},documentElement:{},body:{}},Set,Map,Object,Date};
vm.createContext(context);vm.runInContext(read('app.js'),context);
const api=context.BaseDemoSI;
assert.deepEqual(JSON.parse(JSON.stringify(api.currentFeedback())),{sound:false,vibration:false});
api.signalFeedback('success');assert.equal(sound.started,0);assert.equal(sound.vibrate.length,0);
assert.deepEqual(JSON.parse(JSON.stringify(api.feedbackCapabilities())),{sound:true,vibration:true});
api.configureFeedback(true,false);api.signalFeedback('success');
assert.equal(sound.started,1);assert.deepEqual(sound.tones,[580]);assert.equal(sound.vibrate.length,0);
api.configureFeedback(false,true);api.signalFeedback('warning');
assert.equal(sound.started,1);assert.equal(sound.vibrate.length,1);assert.deepEqual(JSON.parse(JSON.stringify(sound.vibrate[0])),[65,35,65]);
api.configureFeedback(true,true);api.signalFeedback('info');
assert.equal(sound.created,1);assert.equal(sound.started,2);assert.equal(sound.vibrate.length,2);
api.configureFeedback(false,false);api.signalFeedback('info');assert.equal(sound.started,2);assert.equal(sound.vibrate.length,2);
delete window.AudioContext;delete navigator.vibrate;
assert.deepEqual(JSON.parse(JSON.stringify(api.feedbackCapabilities())),{sound:false,vibration:false});
api.configureFeedback(true,true);assert.doesNotThrow(()=>api.signalFeedback('warning'));assert.equal(sound.started,2);assert.equal(sound.vibrate.length,2);
const html=read('index.html'),menu=read('src/menu-review.ts');
for(const id of ['si-sound','si-vibrate','si-sound-support','si-vibrate-support'])assert(html.includes('id="'+id+'"'),id);
assert(!/disabled="" id="si-(?:sound|vibrate)"/.test(html));
assert(menu.includes('sound:false,vibrate:false'));
assert(menu.includes('si-a11y-reset')&&menu.includes('configureFeedback(pref.sound,pref.vibrate)'));
assert(read('src/extensions-ui.ts').includes('signalFeedback(result.ok?"success":"warning")'));
assert(!/https?:\/\//.test(read('src/feedback.ts')));
assert(!/SIAB/i.test(read('docs/AUDITORIA-MENU-0.9.11.md')));
console.log('OK: 0.9.11 — feedback opt-in, Web Audio, vibração, reset, suporte ausente, extensões e independência offline.');
