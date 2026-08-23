(()=>{
  const desc=document.querySelector('meta[name="description"]')?.content||'';
  const setMeta=(key,value,property=false)=>{if(!value)return;const attr=property?'property':'name';let el=document.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el)}el.content=value};
  setMeta('theme-color','#071018');
  setMeta('og:title',document.title,true);setMeta('og:description',desc,true);setMeta('og:type','website',true);setMeta('og:url',location.href.replace(/index\.html$/,''),true);
  setMeta('twitter:card','summary');setMeta('twitter:title',document.title);setMeta('twitter:description',desc);
  let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}canonical.href=location.href.replace(/index\.html$/,'').replace(/[?#].*$/,'');
  const path=location.pathname.replace(/index\.html$/,'');
  const brand=document.querySelector('.brand');
  const root=brand?new URL(brand.href,location.href).pathname.replace(/index\.html$/,''):null;
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const href=new URL(a.href,location.href).pathname.replace(/index\.html$/,'');
    const active=root?((href===root&&path===root)||(href!==root&&path.startsWith(href))):path===href;
    if(active){a.classList.add('active');a.setAttribute('aria-current','page')}
  });
})();
