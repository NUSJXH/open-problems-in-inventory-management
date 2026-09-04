// Keep previously shared URLs useful after the three-page reorganization.
const legacy=document.body.dataset.legacyPage;
if(legacy==='methodology')location.replace('trends.html'+(location.hash||'#data-methods'));
if(legacy==='problem'){
  const p=new URLSearchParams(location.search),id=p.get('id')||p.get('problem')||location.hash.slice(1);
  location.replace('index.html#'+(/^OIM-(?:\d{3}|R\d{2})$/.test(id||'')?id:'paper-list'));
}
function reveal(){
  const target=document.getElementById(location.hash.slice(1));if(!target)return;
  let element=target;while(element){if(element.tagName==='DETAILS')element.open=true;element=element.parentElement;}
  requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
reveal();window.addEventListener('hashchange',reveal);
