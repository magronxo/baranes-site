(()=>{
  const base=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>/assets\/site\.css(?:\?|$)/.test(link.getAttribute('href')||''));
  if(base){
    const href=base.getAttribute('href');
    const brandHref=href.replace(/site\.css(?:\?.*)?$/,'brand.css');
    if(!document.querySelector('link[data-baranes-brand]')){
      const brand=document.createElement('link');
      brand.rel='stylesheet';
      brand.href=brandHref;
      brand.dataset.baranesBrand='1';
      document.head.appendChild(brand);
    }
    const iconHref=href.replace(/site\.css(?:\?.*)?$/,'baranes-symbol-teal.svg');
    let icon=document.querySelector('link[rel~="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
    icon.type='image/svg+xml';
    icon.href=iconHref;
  }
  const path=location.pathname.replace(/index\.html$/,'');
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const href=new URL(a.href,location.href).pathname.replace(/index\.html$/,'');
    if((href==='/'&&path==='/')||(href!=='/'&&path.startsWith(href)))a.classList.add('active');
  });
})();
