// WA Legislative Web Services - Download All WSDL Files & Data Dictionary
(async()=>{
  const S=['LegislationService','CommitteeService','CommitteeActionService','CommitteeMeetingService','LegislativeDocumentService','SessionLawService','SponsorService','AmendmentService','RcwCiteAffectedService'];
  const F=[['WebServiceDataDictionary.doc','/WebServiceDataDictionary.doc']];

  const js=src=>new Promise(r=>{let s=document.createElement('script');s.src=src;s.onload=r;document.head.appendChild(s)});
  if(!window.JSZip) await js('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

  document.body.innerHTML=`<div style="font:14px sans-serif;max-width:720px;margin:40px auto">
    <button id=b style="padding:10px 14px;font-weight:700;cursor:pointer">Download WSDL ZIP</button>
    <span id=s style="margin-left:10px;color:#666">ready</span>
  </div>`;

  const $=id=>document.getElementById(id),log=t=>$('s').textContent=t,dl=(blob,name)=>{
    let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2e4);
  };

  $('b').onclick=async()=>{
    $('b').disabled=true;
    const zip=new JSZip(), wsdl=zip.folder('wsdl-files');
    let i=0,total=S.length+F.length;

    for(const n of S){
      log(`${++i}/${total} ${n}.wsdl`);
      try{ wsdl.file(`${n}.wsdl`, await (await fetch(`/${n}.asmx?WSDL`)).text()); }
      catch(e){ wsdl.file(`${n}.wsdl_ERROR.txt`, String(e?.message||e)); }
    }
    for(const [name,url] of F){
      log(`${++i}/${total} ${name}`);
      try{ zip.file(name, await (await fetch(url)).blob()); }
      catch(e){ zip.file(`${name}_ERROR.txt`, String(e?.message||e)); }
    }

    zip.file('README.txt',`WA Legislative Web Services\nDownloaded: ${new Date().toISOString()}\n\nServices:\n${S.map(x=>`- ${x}`).join('\n')}\n\nSource: https://wslwebservices.leg.wa.gov/\n`);
    log('zipping…');
    dl(await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:9}}),
       `wa-leg-webservices-${new Date().toISOString().slice(0,10)}.zip`);
    log('done ✓');
    $('b').disabled=false;
  };
})();
