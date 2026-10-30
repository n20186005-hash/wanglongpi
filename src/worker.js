import server from '@astrojs/cloudflare/entrypoints/server';
export async function route(request, env, context, delegate=server) {
 const url=new URL(request.url),head=request.method==='HEAD';
 if(url.hostname==='wanglongpi.com'&&url.protocol==='http:'){
  url.protocol='https:';return new Response(null,{status:308,headers:{Location:url.href}});
 }
 if(['GET','HEAD'].includes(request.method)&&['/index','/index.html'].includes(url.pathname)){
  url.pathname='/';return new Response(null,{status:308,headers:{Location:url.href}});
 }
 const errorAlias=/^\/404(?:\/|\.html)?$/.test(url.pathname);
 let response=await delegate.fetch(errorAlias?new Request(new URL('/404',url),{method:'GET'}):request,env,context);
 if(errorAlias||response.status===404){
  if(!errorAlias)response=await delegate.fetch(new Request(new URL('/404',url),{method:'GET'}),env,context);
  const headers=new Headers(response.headers);headers.delete('Location');headers.set('X-Robots-Tag','noindex');headers.set('Cache-Control','no-store');
  return new Response(head?null:response.body,{status:404,headers});
 }
 return head?new Response(null,{status:response.status,headers:response.headers}):response;
}
export default {fetch:route};
