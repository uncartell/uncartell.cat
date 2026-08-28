import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const hashToken=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(byte=>byte.toString(16).padStart(2,"0")).join("");

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  let stage="initialise";
  try{
    const url=Deno.env.get("SUPABASE_URL"),serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url||!serviceKey)throw new Error("Missing Supabase runtime secrets");
    const authorization=req.headers.get("Authorization")??"";
    const token=authorization.replace(/^Bearer\s+/i,"");
    if(!token)return json({error:"Unauthorized"},401);
    const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
    stage="authenticate";
    const {data:{user},error:authError}=await admin.auth.getUser(token);
    if(authError||!user)return json({error:"Unauthorized"},401);
    const {data:caller,error:callerError}=await admin.from("profiles").select("role").eq("id",user.id).maybeSingle();
    if(callerError)throw callerError;
    if(caller?.role!=="admin")return json({error:"Forbidden"},403);

    const body=req.method==="POST"?await req.json().catch(()=>({})):{};
    const audit=async(action:string,entityType:string,entityId?:string,targetUserId?:string,details:Record<string,unknown>={})=>{
      const {error}=await admin.from("admin_audit_log").insert({admin_user_id:user.id,action,entity_type:entityType,entity_id:entityId??null,target_user_id:targetUserId??null,details});
      if(error)console.error("admin-audit",{action,message:error.message});
    };
    const paging=()=>{
      const page=Math.max(1,Math.min(100000,Number(body.page)||1));
      const perPage=Math.max(10,Math.min(100,Number(body.per_page)||25));
      return {page,perPage,from:(page-1)*perPage,to:page*perPage-1};
    };
    const search=String(body.search??"").trim().slice(0,160).replace(/[%_]/g,"\\$&");
    const supportSession=async()=>{
      const raw=String(body.support_token??"");if(!raw)return null;
      const {data,error}=await admin.from("admin_support_sessions").select("id,admin_user_id,target_user_id,expires_at,ended_at").eq("token_hash",await hashToken(raw)).eq("admin_user_id",user.id).maybeSingle();
      if(error)throw error;if(!data||data.ended_at||new Date(data.expires_at)<=new Date())return null;return data;
    };

    if(body?.action==="start_impersonation"){
      if(!body.user_id)return json({error:"Missing target user"},400);
      const {data:target,error:targetError}=await admin.from("profiles").select("id,display_name,plan,premium_until,ultra_until").eq("id",String(body.user_id)).maybeSingle();
      if(targetError)return json({error:targetError.message},400);if(!target)return json({error:"User not found"},404);
      const {data:directory}=await admin.from("admin_user_directory").select("email").eq("user_id",target.id).maybeSingle();
      const raw=crypto.randomUUID()+crypto.randomUUID();const expiresAt=new Date(Date.now()+2*60*60*1000).toISOString();
      const {data:session,error}=await admin.from("admin_support_sessions").insert({admin_user_id:user.id,target_user_id:target.id,token_hash:await hashToken(raw),expires_at:expiresAt}).select("id").single();
      if(error)return json({error:error.message},400);
      await audit("start_impersonation","support_session",String(session.id),target.id);
      return json({ok:true,support_token:raw,expires_at:expiresAt,user:{id:target.id,email:directory?.email??"",display_name:target.display_name??"",plan:target.plan??"basic",premium_until:target.premium_until,ultra_until:target.ultra_until}});
    }
    if(body?.action==="support_context"){
      const session=await supportSession();if(!session)return json({error:"Support session expired"},401);
      const [{data:profile,error:profileError},{data:directory,error:directoryError}]=await Promise.all([admin.from("profiles").select("id,display_name,plan,premium_until,ultra_until").eq("id",session.target_user_id).single(),admin.from("admin_user_directory").select("email").eq("user_id",session.target_user_id).maybeSingle()]);
      if(profileError||directoryError)return json({error:(profileError||directoryError)?.message},400);
      return json({ok:true,user:{...profile,email:directory?.email??""},expires_at:session.expires_at});
    }
    if(body?.action==="stop_impersonation"){
      const session=await supportSession();if(session){await admin.from("admin_support_sessions").update({ended_at:new Date().toISOString()}).eq("id",session.id);await audit("stop_impersonation","support_session",String(session.id),session.target_user_id)}
      return json({ok:true});
    }
    if(body?.action==="support_list_projects"){
      const session=await supportSession();if(!session)return json({error:"Support session expired"},401);
      const {data,error}=await admin.from("user_projects").select("id,name,payload,created_at,updated_at").eq("user_id",session.target_user_id).eq("tool_type",String(body.tool_type??"")).order("updated_at",{ascending:false}).limit(100);
      if(error)return json({error:error.message},400);return json({ok:true,rows:data??[]});
    }
    if(body?.action==="support_save_project"){
      const session=await supportSession();if(!session)return json({error:"Support session expired"},401);
      if(!body.project?.id||!body.tool_type)return json({error:"Invalid project"},400);
      const now=new Date().toISOString();const project={...body.project,id:String(body.project.id)};
      const {error}=await admin.from("user_projects").upsert({id:project.id,user_id:session.target_user_id,tool_type:String(body.tool_type),locale:String(body.locale||"ca"),name:String(project.name||"Projecte"),payload:project,updated_at:now},{onConflict:"user_id,tool_type,id"});
      if(error)return json({error:error.message},400);await audit("support_save_project","user_project",project.id,session.target_user_id,{tool_type:body.tool_type});return json({ok:true,updated_at:now});
    }
    if(body?.action==="support_delete_project"){
      return json({error:"Irreversible actions are disabled during support mode"},403);
    }

    if(body?.action==="list_users"){
      const {page,perPage,from}=paging();
      const {data,error}=await admin.rpc("admin_search_users",{p_search:search,p_plan:String(body.plan??""),p_status:String(body.status??""),p_limit:perPage,p_offset:from});
      if(error)return json({error:error.message},400);const rows=(data??[]).map((row:any)=>({id:row.user_id,...row}));
      return json({ok:true,rows,page,per_page:perPage,total:Number(rows[0]?.total_count??0)});
    }
    if(body?.action==="list_projects"){
      const {page,perPage,from}=paging();
      const {data,error}=await admin.rpc("admin_search_projects",{p_search:search,p_tool_type:String(body.tool_type??""),p_status:String(body.status??""),p_limit:perPage,p_offset:from});
      if(error)return json({error:error.message},400);const rows=data??[];
      return json({ok:true,rows,page,per_page:perPage,total:Number(rows[0]?.total_count??0)});
    }
    if(body?.action==="list_qr_projects"){
      const {page,perPage,from}=paging();
      const {data,error}=await admin.rpc("admin_search_qr_projects",{p_search:search,p_status:String(body.status??""),p_limit:perPage,p_offset:from});
      if(error)return json({error:error.message},400);const rows=data??[];
      return json({ok:true,rows,page,per_page:perPage,total:Number(rows[0]?.total_count??0)});
    }
    if(body?.action==="summary"){
      const [users,premium,ultra,projects,publications]=await Promise.all([
        admin.from("admin_user_directory").select("user_id",{count:"exact",head:true}),
        admin.from("profiles").select("id",{count:"exact",head:true}).eq("plan","premium"),
        admin.from("profiles").select("id",{count:"exact",head:true}).eq("plan","ultra"),
        admin.from("user_projects").select("id",{count:"exact",head:true}),
        admin.from("public_documents").select("id",{count:"exact",head:true}).eq("status","active"),
      ]);
      const failed=[users,premium,ultra,projects,publications].find(item=>item.error);if(failed?.error)return json({error:failed.error.message},400);
      return json({ok:true,summary:{users:users.count??0,premium:premium.count??0,ultra:ultra.count??0,projects:projects.count??0,active_publications:publications.count??0}});
    }
    if(body?.action==="list_publications"){
      const {page,perPage,from}=paging();
      const {data,error}=await admin.rpc("admin_search_publications",{p_search:search,p_locale:String(body.locale??""),p_kind:String(body.kind??""),p_status:String(body.status??""),p_limit:perPage,p_offset:from});
      if(error)return json({error:error.message},400);const rows=data??[];
      return json({ok:true,rows,page,per_page:perPage,total:Number(rows[0]?.total_count??0)});
    }
    if(body?.action==="list_audit_log"){
      const {page,perPage,from,to}=paging();
      const {data,error,count}=await admin.from("admin_audit_log").select("id,admin_user_id,action,entity_type,entity_id,target_user_id,details,created_at",{count:"exact"}).order("created_at",{ascending:false}).order("id",{ascending:false}).range(from,to);
      if(error)return json({error:error.message},400);
      return json({ok:true,rows:data??[],page,per_page:perPage,total:count??0});
    }
    if(body?.action==="set_publication_status"){
      if(!body.id||!["active","disabled","expired"].includes(body.status))return json({error:"Invalid publication or status"},400);
      const {data,error}=await admin.from("public_documents").update({status:body.status,updated_at:new Date().toISOString()}).eq("id",String(body.id)).select("id,user_id").maybeSingle();
      if(error)return json({error:error.message},400);
      if(!data)return json({error:"Publication not found"},404);
      await audit("set_publication_status","public_document",String(body.id),data.user_id,{status:body.status});
      return json({ok:true});
    }
    if(body?.action==="delete_publication"){
      if(!body.id)return json({error:"Missing publication id"},400);
      const {data:publication,error:readError}=await admin.from("public_documents").select("id,locale,kind,slug").eq("id",body.id).maybeSingle();
      if(readError)return json({error:readError.message},400);
      if(!publication)return json({error:"Publication not found"},404);
      const {error:tombstoneError}=await admin.from("public_document_tombstones").upsert({locale:publication.locale,kind:publication.kind,slug:publication.slug,deleted_by:user.id,deleted_at:new Date().toISOString()},{onConflict:"locale,kind,slug"});
      if(tombstoneError)return json({error:tombstoneError.message},400);
      const {error}=await admin.from("public_documents").delete().eq("id",body.id);
      if(error)return json({error:error.message},400);
      await audit("delete_publication","public_document",String(body.id),undefined,{locale:publication.locale,kind:publication.kind,slug:publication.slug});
      return json({ok:true});
    }
    if(body?.action==="set_user_plan"){
      if(!body.user_id||!["basic","premium","ultra"].includes(body.plan))return json({error:"Invalid user or plan"},400);
      const until=body.until?new Date(body.until):null;
      if(body.plan==="ultra"&&(!until||Number.isNaN(until.getTime())||until<=new Date()))return json({error:"Ultra requires a future expiry date"},400);
      const update:any={plan:body.plan,premium_until:null,ultra_until:null,updated_at:new Date().toISOString()};
      if(body.plan==="premium")update.premium_until=until&&!Number.isNaN(until.getTime())?until.toISOString():null;
      if(body.plan==="ultra")update.ultra_until=until!.toISOString();
      const {error}=await admin.from("profiles").update(update).eq("id",body.user_id);
      if(error)return json({error:error.message},400);
      await audit("set_user_plan","profile",String(body.user_id),String(body.user_id),{plan:update.plan,until:update.ultra_until||update.premium_until});
      return json({ok:true,plan:update.plan,until:update.ultra_until||update.premium_until});
    }
    if(body?.action==="save_poster_icon"){
      if(!body.item?.id)return json({error:"Missing icon payload"},400);
      const {error}=await admin.from("poster_icon_overrides").upsert({id:String(body.item.id),payload:body.item,updated_by:user.id,updated_at:new Date().toISOString()});
      if(error)return json({error:error.message},400);
      await audit("save_poster_icon","poster_icon",String(body.item.id));
      return json({ok:true});
    }
    if(body?.action==="list_template_sources"){
      const toolType=String(body.tool_type??"");
      if(!["menu","services"].includes(toolType))return json({error:"Invalid template tool"},400);
      const {data,error}=await admin.from("user_projects").select("id,name,tool_type,payload,updated_at,user_id").eq("user_id",user.id).eq("tool_type",toolType).order("updated_at",{ascending:false}).limit(100);
      if(error)return json({error:error.message},400);
      return json({ok:true,rows:data??[]});
    }
    if(body?.action==="list_editor_templates"){
      const {data,error}=await admin.from("editor_templates").select("id,tool_type,format_id,name,description,source_project_id,version,sort_order,is_published,created_at,updated_at").order("tool_type").order("format_id").order("sort_order").order("updated_at",{ascending:false});
      if(error)return json({error:error.message},400);
      return json({ok:true,rows:data??[]});
    }
    if(body?.action==="save_editor_template"){
      const toolType=String(body.tool_type??"");
      const sourceId=String(body.source_project_id??"");
      const name=String(body.name??"").trim().slice(0,100);
      if(!["menu","services"].includes(toolType)||!sourceId||!name)return json({error:"Invalid template"},400);
      const {data:source,error:sourceError}=await admin.from("user_projects").select("id,payload").eq("id",sourceId).eq("user_id",user.id).eq("tool_type",toolType).maybeSingle();
      if(sourceError)return json({error:sourceError.message},400);
      if(!source)return json({error:"Source project not found"},404);
      const sourcePayload=structuredClone(source.payload??{});
      const document=sourcePayload.document??{};
      const formatId=String(body.format_id??document.format??"").slice(0,80);
      if(!formatId)return json({error:"Template format is missing"},400);
      for(const page of document.pages??[])for(const block of page.blocks??[])if(["image","dish-image"].includes(block.type)&&block.image)block.templateImageLocked=true;
      const row={tool_type:toolType,format_id:formatId,name,description:String(body.description??"").trim().slice(0,240),payload:sourcePayload,source_project_id:sourceId,sort_order:Number(body.sort_order)||0,is_published:body.is_published!==false,updated_by:user.id,updated_at:new Date().toISOString()};
      let result;
      if(body.id){
        const current=await admin.from("editor_templates").select("version").eq("id",String(body.id)).maybeSingle();
        if(current.error)return json({error:current.error.message},400);
        result=await admin.from("editor_templates").update({...row,version:Number(current.data?.version??0)+1}).eq("id",String(body.id)).select("id,version").single();
      }else result=await admin.from("editor_templates").insert({...row,created_by:user.id}).select("id,version").single();
      if(result.error)return json({error:result.error.message},400);
      await audit(body.id?"update_editor_template":"create_editor_template","editor_template",String(result.data.id),undefined,{tool_type:toolType,format_id:formatId,version:result.data.version});
      return json({ok:true,...result.data});
    }
    if(body?.action==="delete_editor_template"){
      if(!body.id)return json({error:"Missing template id"},400);
      const {error}=await admin.from("editor_templates").delete().eq("id",String(body.id));
      if(error)return json({error:error.message},400);
      await audit("delete_editor_template","editor_template",String(body.id));
      return json({ok:true});
    }
    if(body?.action==="delete_poster_icon"){
      if(!body.id)return json({error:"Missing icon id"},400);
      const {error}=await admin.from("poster_icon_overrides").delete().eq("id",String(body.id));
      if(error)return json({error:error.message},400);
      await audit("delete_poster_icon","poster_icon",String(body.id));
      return json({ok:true});
    }
    if(body?.action==="set_qr_status"){
      if(!body.id||!["active","blocked"].includes(body.status))return json({error:"Invalid QR project or status"},400);
      const now=new Date().toISOString();
      const update=body.status==="blocked"?{status:"blocked",blocked_at:now,blocked_by:user.id,updated_at:now}:{status:"active",blocked_at:null,blocked_by:null,updated_at:now};
      const {data,error}=await admin.from("user_projects").update(update).eq("id",String(body.id)).eq("tool_type","qr").select("id").maybeSingle();
      if(error)return json({error:error.message},400);
      if(!data)return json({error:"QR project not found"},404);
      await audit("set_qr_status","user_project",String(body.id),undefined,{status:body.status});
      return json({ok:true});
    }
    if(body?.action==="update_qr_project"){
      if(!body.id)return json({error:"Missing QR project id"},400);
      let target:URL;
      try{target=new URL(String(body.url??""))}catch{return json({error:"Invalid destination URL"},400)}
      if(!["http:","https:"].includes(target.protocol))return json({error:"Invalid destination URL"},400);
      const hex=(value:unknown,fallback:string)=>/^#[0-9a-f]{6}$/i.test(String(value??""))?String(value):fallback;
      const {data:existing,error:readError}=await admin.from("user_projects").select("id,payload").eq("id",String(body.id)).eq("tool_type","qr").maybeSingle();
      if(readError)return json({error:readError.message},400);
      if(!existing)return json({error:"QR project not found"},404);
      const payload={...(existing.payload??{}),name:String(body.name??existing.payload?.name??"QR").trim().slice(0,120)||"QR",url:target.toString(),foreground:hex(body.foreground,"#181614"),background:hex(body.background,"#ffffff"),level:["L","M","Q","H"].includes(body.level)?body.level:"Q",watermark:String(body.watermark??"").trim().slice(0,120),svg:""};
      const {error}=await admin.from("user_projects").update({name:payload.name,payload,updated_at:new Date().toISOString()}).eq("id",String(body.id)).eq("tool_type","qr");
      if(error)return json({error:error.message},400);
      await audit("update_qr_project","user_project",String(body.id));
      return json({ok:true});
    }
    return json({error:"Unknown action"},400);
  }catch(error){
    const message=error instanceof Error
      ? error.message
      : typeof error==="string"
        ? error
        : error&&typeof error==="object"&&"message" in error
          ? String((error as {message:unknown}).message)
          : "Unexpected error";
    console.error("admin-dashboard",{stage,message});
    return json({error:message,stage},500)
  }
});
