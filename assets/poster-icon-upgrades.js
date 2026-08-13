(()=>{
  const seed=window.UncartellPosterSeed;
  if(!seed)return;
  const icons={
    'arrow-down':'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    elevator:'<rect x="3.5" y="2.5" width="17" height="19" rx="2"/><path d="M12 8.5v13M7.5 7V3.8M5.8 5.5l1.7-1.7 1.7 1.7M16.5 3.8V7m-1.7-1.7 1.7 1.7 1.7-1.7"/><circle cx="8" cy="11" r="1.35"/><path d="M5.8 18v-3.2A2.2 2.2 0 0 1 8 12.6a2.2 2.2 0 0 1 2.2 2.2V18M8 15.2V20"/><circle cx="16" cy="11" r="1.35"/><path d="M13.8 18v-3.2a2.2 2.2 0 0 1 4.4 0V18M16 15.2V20"/>',
    stairs:'<path d="M3 19h4v-4h4v-4h4V7h6"/><path d="M4 5h6m-3-3 3 3-3 3"/>',
    'escales-mecaniques':'<circle cx="8" cy="4.5" r="1.5"/><path d="M6.5 8v4.2l3 2.1 3.6-3.6h5.4a2.5 2.5 0 0 1 0 5h-3.4l-4.2 4.2a3.7 3.7 0 0 1-2.6 1.1H5.5a2.5 2.5 0 0 1 0-5h1.8l1.2-1.2-3-2.1V8"/>',
    ascensor:'<rect x="3.5" y="2.5" width="17" height="19" rx="2"/><path d="M12 8.5v13M7.5 7V3.8M5.8 5.5l1.7-1.7 1.7 1.7M16.5 3.8V7m-1.7-1.7 1.7 1.7 1.7-1.7"/><circle cx="8" cy="11" r="1.35"/><path d="M5.8 18v-3.2A2.2 2.2 0 0 1 8 12.6a2.2 2.2 0 0 1 2.2 2.2V18M8 15.2V20"/><circle cx="16" cy="11" r="1.35"/><path d="M13.8 18v-3.2a2.2 2.2 0 0 1 4.4 0V18M16 15.2V20"/>',
    'wc-accessible':'<circle cx="10" cy="4" r="1.5"/><path d="M9 7.5h3l1.3 4.2h3.2M10 8l-1 6.5h5.2l2.5 5.5h2.8M7.8 11.5a5 5 0 1 0 6.7 6.9"/>',
    'wc-homes':'<circle cx="12" cy="4" r="1.7"/><path d="M8.5 21v-7H6.7l1.8-6h7l1.8 6h-1.8v7M12 14v7"/>',
    'wc-dones':'<circle cx="12" cy="4" r="1.7"/><path d="m9 8-2.5 8h3V21m5-5h3L15 8h-6m5.5 13v-5"/>',
    'wc-people':'<g><circle cx="5.75" cy="4.25" r="1.65"/><path d="M3.2 21v-7.1H1.9l1.55-5.6h4.6l1.55 5.6H8.3V21M5.75 13.9V21"/></g><g><circle cx="18.25" cy="4.25" r="1.65"/><path d="M15.7 21v-5.2h-1.55l2.05-7.5h4.1l2.05 7.5H20.8V21M18.25 15.8V21"/></g>',
    mask:'<path d="M5.5 8.5c4.3-1.8 8.7-1.8 13 0v6.8c-3.8 3.2-9.2 3.2-13 0Z"/><path d="M5.5 10.2H4.3a2.3 2.3 0 0 0 0 4.6h1.2m13-4.6h1.2a2.3 2.3 0 0 1 0 4.6h-1.2M8.3 11.3h7.4M8.3 13.8h7.4"/>',
    bizum:'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.2"><path d="m5.2 5.3 5 3.4"/><path d="m4.1 10.4 5 3.4"/><path d="m3 15.5 5 3.4"/></g><g fill="currentColor" stroke="none"><circle cx="17.6" cy="7.5" r="1.55"/><circle cx="14.55" cy="16.65" r="1.55"/></g>',
    'snowflake-clean':'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.8 2.5 2 2.5-2M9.5 19.2l2.5-2 2.5 2M5.2 10.2l3-.4-.5-2.8m11.1 6.8-3 .4.5 2.8M5.2 13.8l3 .4-.5 2.8m11.1-6.8-3-.4.5-2.8"/>',
    'fire-exit-standard':'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3.2h5v17.6h-5"/><circle cx="11.15" cy="5.35" r="1.25"/><path d="m8.7 8.7 2.55-1.45 2.85 2.2-1.45 3.2-3.1-1.75-1.45 3.7-3.05 2.25"/><path d="m12.65 12.65 2.7 2.5 1.25 3.45M9.55 10.9l-1.4 3.7 2.45 2.35-1.65 3.05"/><path d="M7.25 11.35H2.5m1.85-2.1-2.1 2.1 2.1 2.1"/></g>',
    'safety-gloves':'<path d="M4.2 12.8V7.2a1.15 1.15 0 0 1 2.3 0v3.9-6a1.15 1.15 0 0 1 2.3 0v6-4.8a1.15 1.15 0 0 1 2.3 0v6.5a5.3 5.3 0 0 1-5.3 5.3H5a3.7 3.7 0 0 1-3.2-1.9l-.7-1.2a1.3 1.3 0 0 1 2.2-1.4l.9 1.3"/><path d="M13.1 12V6.6a1.1 1.1 0 0 1 2.2 0v4.5-3a1.1 1.1 0 0 1 2.2 0v3.7-2a1.1 1.1 0 0 1 2.2 0v4a5.3 5.3 0 0 1-5.3 5.3h-3.1M4.7 20.8h6.1m1.4 0h5.8"/>',
    'running-off':'<circle cx="12" cy="12" r="9.5"/><circle cx="13.4" cy="6.2" r="1.25"/><path d="m10.2 9.2 3.1 2 2.8-1m-5.9-1-1.7 4.1 3.3 2.1-2.4 3.2m2.4-3.2 3.8 1.8 1.8 2M7.9 13.3l-2.4 1M5.3 5.3l13.4 13.4"/>',
    toilet:'<path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.6a.5.5 0 0 0-.42.77l1.54 2.47a.5.5 0 0 1-.42.76H5.4a.5.5 0 0 1-.42-.76L7 18"/><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/>',
    'tram-front':'<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16M12 3v8m-4 8-2 3m12 0-2-3M8 15h.01M16 15h.01"/>',
    'train-front-tunnel':'<path d="M2 22V12a10 10 0 1 1 20 0v10M15 6.8v1.4a3 2.8 0 1 1-6 0V6.8M10 15h.01M14 15h.01"/><path d="M10 19a4 4 0 0 1-4-4v-3a6 6 0 1 1 12 0v3a4 4 0 0 1-4 4Zm-1 0-2 3m8-3 2 3"/>',
    phone:'<path d="M13.83 16.57a1 1 0 0 0 1.22-.3l.35-.47A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.47.35a1 1 0 0 0-.29 1.23 14 14 0 0 0 6.39 6.39"/>',
    'utensils-off':'<path d="M3 2v7c0 1.1.9 2 2 2h4M7 2v5m4-5v5M7 11v11M21 15V2a5 5 0 0 0-5 5v4m5 4v7M3 3l18 18"/>',
    'lock-keyhole':'<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    mosque:'<path d="M12.27 2a2 2 0 0 0 3.46 2M14 5v3M16 22v-3a2 2 0 0 0-4 0v3M21 13c-1.32-3-4.15-5-7-5s-5.67 2-7 5M3 9h4M7 22V6a5 5 0 0 0-2-4 5 5 0 0 0-2 4v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>',
    'star-kosher':'<path d="m12 2 8.66 15H3.34L12 2Z"/><path d="m12 22-8.66-15h17.32L12 22Z"/>',
    'credit-card-off':'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h8m5 0h7M2 2l20 20"/>',
    smartphone:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    'door-closed':'<path d="M10 12h.01M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14M2 20h20"/>',
    store:'<path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.77 10.31a2.5 2.5 0 0 1-3.45 0 2.5 2.5 0 0 1-3.55 0 2.5 2.5 0 0 1-3.55 0 2.5 2.5 0 0 1-4.77-3.25l2.89-4.18A2 2 0 0 1 7 2h10a2 2 0 0 1 1.65.87l2.9 4.2a2.5 2.5 0 0 1-3.78 3.24M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>',
    sparkles:'<path d="M11.02 2.81a1 1 0 0 1 1.96 0l1.05 5.56a2 2 0 0 0 1.6 1.6l5.56 1.05a1 1 0 0 1 0 1.96l-5.56 1.05a2 2 0 0 0-1.6 1.6l-1.05 5.56a1 1 0 0 1-1.96 0l-1.05-5.56a2 2 0 0 0-1.6-1.6l-5.56-1.05a1 1 0 0 1 0-1.96l5.56-1.05a2 2 0 0 0 1.6-1.6ZM20 2v4m2-2h-4"/><circle cx="4" cy="20" r="2"/>',
    gift:'<path d="M12 7v14M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/>',
    'receipt-text':'<path d="M13 16H8M14 8H8M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1c1 0 1.33 1 2.33 1s1.34-1 2.34-1S11 3 12 3s1.33-1 2.33-1 1.34 1 2.34 1S18 2 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1c-1 0-1.33-1-2.33-1s-1.34 1-2.34 1S13 21 12 21s-1.33 1-2.33 1-1.34-1-2.34-1S5 22 4 22Z"/>',
    refrigerator:'<path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2ZM5 10h14M15 7v6"/>',
    snowflake:'<path d="M12 2v20M4.22 6.5l15.56 11M4.22 17.5l15.56-11M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4m13 7-4-1 1 4M4 14l4-1-1 4m13-7-4 1 1-4"/>',
    scale:'<path d="M12 3v18m7-13 3 8a5 5 0 0 1-6 0l3-8ZM5 8l3 8a5 5 0 0 1-6 0l3-8ZM3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1M7 21h10"/>',
    fish:'<path d="M6.5 12c.94-3.46 4.94-6 8.5-6s6.06 2.54 7 6c-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6ZM18 12v.5M16 17.93a9.77 9.77 0 0 1 0-11.86M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>',
    bath:'<path d="M10 4 8 6M17 19v2M2 12h20M7 19v2M9 5 7.62 3.62A2.12 2.12 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
    'door-hanger':'<path d="M8 21h10a2 2 0 0 0 2-2V9H8v12ZM12 9V6a3 3 0 1 1 6 0v3M11 14h6M11 17h4"/>',
    'fire-exit':'<path d="M4 21V4a1 1 0 0 1 1-1h8v18M13 12h8m-3-3 3 3-3 3M8 12h.01"/><path d="M4 21h12"/>',
    syringe:'<path d="m18 2 4 4m-5 1 3-3M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5m-6 6 4 4m-8 4-3 3m12-18 6 6"/>',
    'meeting-point':'<path d="M12 3v4m-7-2 3 3m11-3-3 3M3 12h4m10 0h4"/><circle cx="12" cy="12" r="3"/><path d="M5 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"/>',
    sanitizer:'<path d="M9 3h6m-3 0v4m-4 0h8l1 3v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l1-3Z"/><path d="M10 14h4m-2-2v4M15 3h3"/>',
    glove:'<path d="M6 11V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v6a8 8 0 0 1-8 8H9a6 6 0 0 1-5.2-3L2 16a1.8 1.8 0 0 1 3-2l2 2"/>',
    running:'<circle cx="13" cy="4" r="2"/><path d="m10 8 3 2 3-1m-6-1-2 5 4 2-2 6m2-6 4 2 3 4M8 13l-4 2"/>',
    fountain:'<path d="M3 20h18M6 20v-5h12v5M12 15V5m-5 6c0-3 2-6 5-6s5 3 5 6M7 11h10M5 8h2m10 0h2"/>',
    goal:'<path d="M12 13V2l8 4-8 4M20.56 10.22A9 9 0 1 1 8 4.93M8 10a5 5 0 1 0 8.9 2"/>',
    gauge:'<path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0"/>',
    'swim-cap':'<path d="M5 17v-4a7 7 0 0 1 14 0v4M4 17c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M2 21c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0"/>',
    'circle-slash-2':'<circle cx="12" cy="12" r="10"/><path d="M22 2 2 22"/>',
    trees:'<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0ZM7 16v6m6-3v3m-1-3h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
    umbrella:'<path d="M12 13v7a2 2 0 0 0 4 0M12 2v2M20.99 13a1 1 0 0 0 .97-1.27 10.28 10.28 0 0 0-19.92 0A1 1 0 0 0 3 13Z"/>',
    dog:'<path d="M11.25 16.25h1.5L12 17ZM16 14v.5M4.42 11.25A13 13 0 0 0 4 14.56C4 18.73 7.58 21 12 21s8-2.27 8-6.44a12 12 0 0 0-.49-3.31M8 14v.5"/><path d="M8.5 8.5c-.38 1.05-1.08 2.03-2.34 2.5-1.93.72-3.58-.3-3.66-1-.11-.99 1.18-6.53 4-7 1.92-.32 3.65.85 3.65 2.24A7.5 7.5 0 0 1 14 5.28C14 3.89 15.84 2.68 17.77 3c2.82.47 4.11 6.01 4 7-.08.7-1.73 1.72-3.66 1-1.26-.47-1.86-1.45-2.24-2.5"/>',
    'flame-off':'<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 0 1-8.8 3.3M7.1 9.1A5 5 0 0 0 12 15m-2 6a5 5 0 0 0 7.8-3.2M3 3l18 18"/>',
    'ball-off':'<circle cx="12" cy="12" r="9"/><path d="m8 4 3 4-2 4-5 1m16-2-5 1-2 4 3 4M3 3l18 18"/>',
    'glass-water':'<path d="M5.12 4.1A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .99 1.1L17.19 20.2A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79ZM6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/>',
    'droplets-off':'<path d="M12 2s5 5.5 5 10a5 5 0 0 1-.8 2.7M8.5 19.6A5 5 0 0 1 7 16c0-2.4 1.4-5.1 3-7.4M3 3l18 18M18 8s3 3.2 3 6a3 3 0 0 1-.4 1.5"/>',
    'safety-vest':'<path d="m8 3-4 5 2 13h12l2-13-4-5-4 4-4-4ZM9 3v8h6V3M6 15h12"/>',
    'safety-shoes':'<path d="M4 4v10l-2 3v3h20v-3l-8-2-4-4V4H4ZM4 14h8m-5-3h3"/>',
    glasses:'<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-4 0M2.5 13 5 7c.7-1.3 1.4-2 3-2m13.5 8L19 7c-.7-1.3-1.5-2-3-2"/>',
    ear:'<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
    'triangle-alert':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>',
    'scan-heart':'<path d="M17 3h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M3 7V5a2 2 0 0 1 2-2h2m0 18H5a2 2 0 0 1-2-2v-2"/><path d="M7.83 13.07A3 3 0 0 1 12 8.76a3 3 0 0 1 4.17 4.31l-3.45 3.62a1 1 0 0 1-1.44 0Z"/>'
  };
  const map={
    'missing-arrow-down':'arrow-down','missing-wc-standard':'wc-people','missing-tram':'tram-front','missing-metro':'train-front-tunnel','missing-phone':'phone','missing-ban-utensils':'utensils-off','missing-lock':'lock-keyhole','missing-halal':'mosque','missing-kosher':'star-kosher','missing-no-card':'credit-card-off','missing-no-cash':'banknote-x','missing-smartphone':'smartphone','missing-closed':'door-closed','missing-admission':'badge-check','missing-store':'store','missing-sparkles':'sparkles','missing-gift':'gift','missing-receipt':'receipt-text','missing-fridge':'refrigerator','missing-snowflake':'snowflake-clean','missing-bulk':'scale','missing-fish':'fish','missing-spa':'bath','missing-door-hanger':'door-hanger','missing-fire-exit':'fire-exit-standard','missing-triage':'scan-heart','missing-syringe':'syringe','missing-meeting-point':'meeting-point','missing-bottle':'sanitizer','missing-glove':'safety-gloves','missing-running':'running-off','missing-fountain':'fountain','missing-goal':'goal','missing-air-pump':'gauge','missing-swim-cap':'swim-cap','missing-out-of-service':'circle-slash-2','missing-trees':'trees','missing-umbrella':'umbrella','missing-dog':'dog','missing-no-fire':'flame-off','missing-grass':'sprout','missing-no-ball':'ball-off','missing-glass-water':'glass-water','missing-droplets-off':'droplets-off','missing-vest':'safety-vest','missing-safety-shoes':'safety-shoes','missing-safety-glasses':'glasses','missing-hearing-protection':'ear','missing-triangle-alert':'triangle-alert'
  };
  Object.assign(seed.icons,icons);
  const upgradeItem=item=>{
    let icon=map[item.icon]||item.icon;
    const title=`${item.titleCa||''} ${item.titleEs||''}`.toLocaleLowerCase();
    if(title.includes('ascensor'))icon='elevator';
    else if(title.includes('escales mecàniques')||title.includes('escaleras mecánicas'))icon='escales-mecaniques';
    else if(title.includes('escales')||title.includes('escaleras'))icon='stairs';
    else if(title==='tren tren')icon='tram-front';
    else if(title.includes('bizum'))icon='bizum';
    else if(title.includes('mascareta')||title.includes('mascarilla'))icon='mask';
    else if(title.includes('producte congelat')||title.includes('producto congelado'))icon='snowflake-clean';
    else if(title.includes('no molesteu')||title.includes('no molestar'))icon='hand';
    else if(title.includes("sortida d'emergència")||title.includes('salida de emergencia')||title.includes('evacuació')||title.includes('evacuación'))icon='fire-exit-standard';
    else if(title.includes('guants')||title.includes('guantes'))icon='safety-gloves';
    else if(title.includes('no córrer')||title.includes('no correr'))icon='running-off';
    else if(title.includes("font d'aigua")||title.includes('fuente de agua'))icon='glass-water';
    return icon===item.icon?item:{...item,icon};
  };
  seed.catalog=seed.catalog.map(upgradeItem);
  window.UncartellPosterIconMap=map;
  window.UncartellPosterIconUpgradeItem=upgradeItem;
})();
