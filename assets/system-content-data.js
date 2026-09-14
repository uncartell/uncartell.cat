(()=>{
  const VALID_MODES=new Set(['local','auto','supabase']);
  const VALID_LOCALES=new Set(['ca','es','it']);
  const features=window.UNCARTELL_FEATURES||{};
  const configuredSources=features.contentSources||{};
  const resolveSource=(area,fallback)=>{
    const featureValue=configuredSources[area]||features[area==='posters'?'posterContentSource':'editorTemplateSource'];
    const storedValue=localStorage.getItem(`uncartell-${area}-content-source`);
    const value=featureValue||storedValue||fallback;
    return VALID_MODES.has(value)?value:fallback;
  };
  const sources=Object.freeze({posters:resolveSource('posters','supabase'),editorTemplates:resolveSource('editorTemplates','local')});
  const mode=sources.posters===sources.editorTemplates?sources.posters:'mixed';
  const status={posters:{source:sources.posters,state:'idle',count:null,locale:null},editorTemplates:{source:sources.editorTemplates,state:'idle',count:null,locale:null}};
  document.documentElement.dataset.posterContentSource=sources.posters;
  document.documentElement.dataset.editorTemplateSource=sources.editorTemplates;
  const publishStatus=(area,value)=>{
    status[area]=value;
    document.documentElement.dataset[area==='posters'?'posterContentStatus':'editorTemplateStatus']=`${value.state}${value.count===null?'':`:${value.count}`}`;
  };
  const locale=value=>VALID_LOCALES.has(value)?value:'ca';
  const query=async(table,columns)=>{
    const platform=window.UncartellPlatform;
    await platform?.whenReady?.();
    const supabase=platform?.getSupabase?.();
    if(!supabase)throw new Error('Supabase is not available');
    const {data,error}=await supabase.from(table).select(columns);
    if(error)throw error;
    return data||[];
  };
  async function loadPosterCatalog(requestedLocale){
    const source=sources.posters;
    if(source==='local'){publishStatus('posters',{source,state:'local',count:null,locale:locale(requestedLocale)});return null}
    const activeLocale=locale(requestedLocale);
    publishStatus('posters',{source,state:'loading',count:null,locale:activeLocale});
    try{
      const [parents,translations,terms,termTranslations]=await Promise.all([
        query('poster_templates','id,icon_key,custom_svg,primary_color,secondary_color,category_id,subcategory_id,required_plan,configuration,sort_order,is_featured,is_active'),
        query('poster_template_translations','template_id,locale,title,subtitle,status'),
        query('taxonomy_terms','id,kind,sort_order,is_active'),
        query('taxonomy_term_translations','term_id,locale,label,status')
      ]);
      const copy=new Map(translations.filter(row=>row.locale===activeLocale&&row.status==='published').map(row=>[row.template_id,row]));
      const labels=new Map(termTranslations.filter(row=>row.locale===activeLocale&&row.status==='published').map(row=>[row.term_id,row.label]));
      const validTerms=new Set(terms.filter(row=>row.is_active).map(row=>row.id));
      const suffix=activeLocale[0].toUpperCase()+activeLocale.slice(1);
      const catalog=parents.filter(row=>row.is_active&&copy.has(row.id)&&validTerms.has(row.category_id)&&validTerms.has(row.subcategory_id)&&labels.has(row.category_id)&&labels.has(row.subcategory_id)).map(row=>({
        id:row.id,icon:row.icon_key,customSvg:row.custom_svg,color:row.primary_color,secondary:row.secondary_color,
        category:labels.get(row.category_id),subcategory:labels.get(row.subcategory_id),title:copy.get(row.id).title,
        subtitle:copy.get(row.id).subtitle,requiredPlan:row.required_plan,order:row.sort_order,featured:row.is_featured,
        active:row.is_active,...(row.configuration||{}),
        [`category${suffix}`]:labels.get(row.category_id),
        [`subcategory${suffix}`]:labels.get(row.subcategory_id),
        [`title${suffix}`]:copy.get(row.id).title,
        [`subtitle${suffix}`]:copy.get(row.id).subtitle
      })).sort((a,b)=>a.order-b.order);
      publishStatus('posters',{source,state:'loaded',count:catalog.length,locale:activeLocale});
      return catalog;
    }catch(error){publishStatus('posters',{source,state:'error',count:null,locale:activeLocale});if(source==='auto'){console.warn('System content fallback: posters',error);return null}throw error}
  }
  async function loadEditorTemplates(toolType,requestedLocale){
    const source=sources.editorTemplates;
    if(source==='local'){publishStatus('editorTemplates',{source,state:'local',count:null,locale:locale(requestedLocale),toolType});return null}
    const activeLocale=locale(requestedLocale);
    publishStatus('editorTemplates',{source,state:'loading',count:null,locale:activeLocale,toolType});
    try{
      const [parents,translations]=await Promise.all([
        query('editor_templates','id,tool_type,format_id,payload,version,sort_order,is_published,is_active,required_plan,metadata'),
        query('editor_template_translations','template_id,locale,name,description,payload,status')
      ]);
      const copy=new Map(translations.filter(row=>row.locale===activeLocale&&row.status==='published').map(row=>[row.template_id,row]));
      const templates=parents.filter(row=>row.tool_type===toolType&&row.is_active&&row.is_published&&copy.has(row.id)).map(row=>{
        const localized=copy.get(row.id);
        return {...row,name:localized.name,detail:localized.description,
          payload:localized.payload?.document?localized.payload:(row.payload||{}),blank:false};
      }).sort((a,b)=>a.sort_order-b.sort_order);
      publishStatus('editorTemplates',{source,state:'loaded',count:templates.length,locale:activeLocale,toolType});
      return templates;
    }catch(error){publishStatus('editorTemplates',{source,state:'error',count:null,locale:activeLocale,toolType});if(source==='auto'){console.warn('System content fallback: editor templates',error);return null}throw error}
  }
  const getSource=area=>sources[area]||null;
  const getStatus=()=>JSON.parse(JSON.stringify(status));
  window.UncartellSystemContent=Object.freeze({mode,sources,getSource,getStatus,loadPosterCatalog,loadEditorTemplates});
})();
