const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync(require('node:path').join(__dirname,'../js/main.js'),'utf8');
function setup(fetchImpl) {
  const input = {value:'qt-test@example.com'};
  const button = {textContent:'Notify me →',disabled:false};
  const form = {dataset:{tags:'waitlist',success:'Confirmed'},children:[],valid:true,
    querySelector:s=>s.includes('email')?input:button,
    reportValidity(){return this.valid},
    setAttribute(){}, removeAttribute(){},
    addEventListener(type,fn){this[type]=fn},
    dispatchEvent(){this.accepted=true},
    appendChild(n){this.children.push(n)}, replaceChildren(n){this.children=[n]}
  };
  const document = {querySelector:()=>null,querySelectorAll:s=>s==='.news-form'?[form]:[],getElementById:()=>null,body:{hasAttribute:()=>true},createElement:()=>({style:{},setAttribute(){},focus(){this.focused=true}})};
  vm.runInNewContext(code,{document,fetch:fetchImpl,Event,AbortSignal});
  const submit = ()=>form.submit({preventDefault(){}});
  return {form,button,submit};
}
const flush = ()=>new Promise(resolve=>setImmediate(resolve));
test('sends to existing Klaviyo list, includes latest selected flavor, prevents duplicate requests, confirms acceptance',async()=>{
  let requests=[],resolveRequest;
  const x=setup((url,opts)=>{requests.push({url,opts});return new Promise(r=>resolveRequest=r)});
  x.form.dataset.tags='waitlist,first-batch,brand-core,flavor:yuzu';
  x.submit();x.submit();assert.equal(requests.length,1);assert.equal(x.button.disabled,true);assert.equal(x.form.accepted,undefined);
  assert.equal(requests[0].url,'https://a.klaviyo.com/client/subscriptions/?company_id=TULcea');
  const data=JSON.parse(requests[0].opts.body).data;
  assert.equal(data.relationships.list.data.id,'U5ccR9');
  assert.equal(data.attributes.profile.data.attributes.properties.source,x.form.dataset.tags);
  resolveRequest({ok:true});await flush();assert.equal(x.form.accepted,true);assert.equal(x.form.children[0].textContent,'Confirmed');assert.equal(x.form.children[0].focused,true);
});
test('rejects invalid form without a request',()=>{let count=0;const x=setup(()=>{count++});x.form.valid=false;x.submit();assert.equal(count,0)});
for(const mode of ['provider failure','network failure']) test(mode+' preserves form and allows retry',async()=>{
 const x=setup(()=>mode==='provider failure'?Promise.resolve({ok:false}):Promise.reject(new Error('offline')));
 x.submit();await flush();assert.equal(x.form.accepted,undefined);assert.equal(x.button.disabled,false);assert.match(x.form.children[0].textContent,/didn’t go through/);assert.equal(x.form.dataset.submitting,undefined);
});
