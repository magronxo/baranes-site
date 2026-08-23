(()=>{
  const path=location.pathname.replace(/index\.html$/,'');
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const href=new URL(a.href,location.href).pathname.replace(/index\.html$/,'');
    if((href==='/'&&path==='/')||(href!=='/'&&path.startsWith(href)))a.classList.add('active');
  });
})();
