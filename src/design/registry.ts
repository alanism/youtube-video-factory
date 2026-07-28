import type {
  DesignPack,
  LayoutDefinition,
  MotionDefinition,
  PaletteDefinition,
  TypographyDefinition,
} from "../types.js";

const frame = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});

export const layouts: LayoutDefinition[] = [
  { id:"title-full-presenter", sourcePages:[1,2], purpose:"Primary opening title and full-presenter geometry.", frames:{ presenter:frame(0,0,608,1080), accentBar:frame(1820,0,100,1080), title:frame(650,405,1030,260), author:frame(650,900,600,60) }, presenterSafeZones:[frame(0,0,608,1080)] },
  { id:"title-circle-presenter", sourcePages:[3], purpose:"Opening title with a reduced presenter footprint.", frames:{ presenter:frame(110,240,400,400), accentBar:frame(1820,0,100,1080), title:frame(650,405,1030,260), author:frame(650,900,600,60) }, presenterSafeZones:[frame(110,240,400,400)] },
  { id:"feature-16x9-cinematic", sourcePages:[4], purpose:"Presenter commentary beside cinematic footage.", frames:{ presenter:frame(0,0,608,1080), media:frame(650,1,1270,850), author:frame(650,875,500,55), bottomBar:frame(0,980,1920,100) }, media:[{frame:"media",aspect:"16:9",fit:"cover"}], presenterSafeZones:[frame(0,0,608,1080)] },
  { id:"feature-16x9-product", sourcePages:[5], purpose:"Presenter beside uncropped software or product media.", frames:{ presenter:frame(0,0,608,1080), media:frame(650,1,1270,850), author:frame(650,875,500,55), bottomBar:frame(0,980,1920,100) }, media:[{frame:"media",aspect:"16:9",fit:"contain"}], presenterSafeZones:[frame(0,0,608,1080)] },
  { id:"feature-4x3", sourcePages:[6], purpose:"Presenter beside a 4:3 instructional feature.", frames:{ presenter:frame(0,0,608,1080), media:frame(650,1,1270,915), author:frame(650,930,500,45), bottomBar:frame(0,980,1920,100) }, media:[{frame:"media",aspect:"4:3",fit:"contain"}], presenterSafeZones:[frame(0,0,608,1080)] },
  { id:"portrait-9x16-with-text", sourcePages:[7], purpose:"Commentary with portrait screen recording or mobile video.", frames:{ presenter:frame(110,240,400,400), text:frame(650,360,650,500), media:frame(1312,1,608,1079) }, media:[{frame:"media",aspect:"9:16",fit:"contain"}], presenterSafeZones:[frame(110,240,400,400)] },
  { id:"text-presenter-top-right", sourcePages:[8], purpose:"Text-led explanation with an upper-right presenter.", frames:{ leftBar:frame(0,0,27,1080), text:frame(300,300,1080,600), presenter:frame(1470,50,400,400) }, presenterSafeZones:[frame(1470,50,400,400)] },
  { id:"text-presenter-bottom-right", sourcePages:[9], purpose:"Text-led argument with a lower-right presenter.", frames:{ leftBar:frame(0,0,27,1080), text:frame(300,100,1080,720), presenter:frame(1480,650,400,400) }, presenterSafeZones:[frame(1480,650,400,400)] },
  { id:"feature-left-4x3", sourcePages:[10], purpose:"Large 4:3 media with right-side commentary.", frames:{ media:frame(0,0,1275,915), caption:frame(50,925,1230,80), text:frame(1300,225,570,350), presenter:frame(1480,650,400,400) }, media:[{frame:"media",aspect:"4:3",fit:"contain"}], presenterSafeZones:[frame(1480,650,400,400)] },
  { id:"three-up-4x3", sourcePages:[11], purpose:"Three-way landscape comparison.", frames:{ topBar:frame(0,0,1920,100), title:frame(17,75,1400,120), subtitle:frame(17,300,1500,90), media1:frame(17,500,600,431), media2:frame(659,500,600,431), media3:frame(1300,500,600,431), caption1:frame(17,945,600,90), caption2:frame(659,945,600,90), caption3:frame(1300,945,600,90) }, media:[1,2,3].map((value)=>({frame:`media${value}`,aspect:"4:3" as const,fit:"contain" as const})) },
  { id:"three-up-9x16", sourcePages:[12], purpose:"Three-way portrait or mobile comparison.", frames:{ title:frame(17,50,1500,120), media1:frame(362,235,300,533), media2:frame(810,235,300,533), media3:frame(1269,235,300,533), caption1:frame(362,780,300,160), caption2:frame(805,780,310,160), caption3:frame(1263,780,320,160), bottomBar:frame(0,980,1920,100) }, media:[1,2,3].map((value)=>({frame:`media${value}`,aspect:"9:16" as const,fit:"contain" as const})) },
  { id:"feature-left-16x9", sourcePages:[13], purpose:"Cinematic left feature with right-side commentary.", frames:{ topBar:frame(0,0,1920,100), media:frame(0,100,1275,815), caption:frame(50,930,1230,70), text:frame(1300,225,570,350), presenter:frame(1480,650,400,400) }, media:[{frame:"media",aspect:"16:9",fit:"cover"}], presenterSafeZones:[frame(1480,650,400,400)] },
  { id:"matrix-2x2", sourcePages:[14], purpose:"Presenter-led classification or strategy matrix.", frames:{ leftBar:frame(0,0,27,1080), presenter:frame(110,240,400,400), matrix:frame(840,240,800,600) }, presenterSafeZones:[frame(110,240,400,400)] },
  { id:"chart-cartesian", sourcePages:[15], purpose:"Presenter-led bar or line chart.", frames:{ leftBar:frame(0,0,27,1080), presenter:frame(110,240,400,400), chart:frame(780,230,1080,600) }, presenterSafeZones:[frame(110,240,400,400)] },
  { id:"chart-pie", sourcePages:[16], purpose:"Presenter-led composition or share breakdown.", frames:{ leftBar:frame(0,0,27,1080), presenter:frame(110,240,400,400), chart:frame(780,180,900,720) }, presenterSafeZones:[frame(110,240,400,400)] },
  { id:"open-canvas", sourcePages:[17], purpose:"Bounded custom diagrams, equations, or generated visuals.", frames:{ leftBar:frame(0,0,27,1080), presenter:frame(110,240,400,400), canvas:frame(650,100,1170,880) }, presenterSafeZones:[frame(110,240,400,400)] },
  { id:"quote", sourcePages:[18], purpose:"Quotation, thesis, source excerpt, or closing thought.", frames:{ topBar:frame(0,0,1920,100), quote:frame(150,390,1500,260), attribution:frame(150,800,900,70), bottomBar:frame(0,980,1920,100) } }
];

export const palettes: PaletteDefinition[] = [
  { id:"ucc-core", label:"UCC Core", group:"channel", colors:["#D94A55","#101A2F","#FFFBFB","#E7B2BC","#5A7690"], primary:"#D94A55", secondary:"#101A2F", surface:"#FCEFF0", ink:"#101A2F", muted:"#5A7690" },
  { id:"math", label:"Math", group:"channel", colors:["#2D6CDF","#101A2F","#DFEAFF","#AFC4D4","#F2F5F6"], primary:"#2D6CDF", secondary:"#101A2F", surface:"#DFEAFF", ink:"#101A2F", muted:"#5A7690" },
  { id:"science", label:"Science", group:"channel", colors:["#087F72","#D89B32","#D9F0EB","#101A2F","#F2F5F6"], primary:"#087F72", secondary:"#D89B32", surface:"#D9F0EB", ink:"#101A2F", muted:"#506B69" },
  { id:"history", label:"History / Sociology", group:"channel", colors:["#8B3F35","#24364B","#EEE0D2","#101A2F","#F4F1EA"], primary:"#8B3F35", secondary:"#24364B", surface:"#EEE0D2", ink:"#101A2F", muted:"#665D57" },
  { id:"ela", label:"ELA", group:"channel", colors:["#8A4568","#D97855","#F1DFE8","#101A2F","#FFFBFB"], primary:"#8A4568", secondary:"#D97855", surface:"#F1DFE8", ink:"#101A2F", muted:"#705866" },
  { id:"ai", label:"AI / Technology", group:"channel", colors:["#1F9BB7","#6557B8","#D9EEF5","#101A2F","#F2F5F6"], primary:"#1F9BB7", secondary:"#6557B8", surface:"#D9EEF5", ink:"#101A2F", muted:"#586A79" },
  { id:"product", label:"Product Tutorial", group:"channel", colors:["#316EA8","#D94A55","#DDE8F3","#101A2F","#F2F5F6"], primary:"#316EA8", secondary:"#D94A55", surface:"#DDE8F3", ink:"#101A2F", muted:"#5A7690" },
  { id:"pedagogy", label:"Pedagogy / Parents", group:"channel", colors:["#6F7F5B","#B8694F","#E5EADB","#101A2F","#F4F1EA"], primary:"#6F7F5B", secondary:"#B8694F", surface:"#E5EADB", ink:"#101A2F", muted:"#68705E" },
  { id:"midnight-heritage", label:"Midnight Heritage", group:"inspiration", colors:["#020202","#223A5A","#A2282B","#38613F","#BFB194"], primary:"#A2282B", secondary:"#223A5A", surface:"#BFB194", ink:"#020202", muted:"#38613F" },
  { id:"forest-harbor", label:"Forest Harbor", group:"inspiration", colors:["#133228","#326042","#B2CCDB","#C3CDCE","#D2C1A3"], primary:"#326042", secondary:"#133228", surface:"#B2CCDB", ink:"#133228", muted:"#326042" },
  { id:"blush-polo", label:"Blush Polo", group:"inspiration", colors:["#050505","#374752","#FCC5EC","#E4E9EF","#D8D4CB"], primary:"#FCC5EC", secondary:"#374752", surface:"#E4E9EF", ink:"#050505", muted:"#374752" },
  { id:"anchor-crimson", label:"Anchor Crimson", group:"inspiration", colors:["#191C1F","#41444C","#9A9EA7","#174041","#C61F46"], primary:"#C61F46", secondary:"#174041", surface:"#9A9EA7", ink:"#191C1F", muted:"#41444C" },
  { id:"moss-atelier", label:"Moss Atelier", group:"inspiration", colors:["#050702","#2D2D22","#37420C","#8A8567","#F1F0EB"], primary:"#37420C", secondary:"#8A8567", surface:"#F1F0EB", ink:"#050702", muted:"#2D2D22" },
  { id:"old-money-sky", label:"Old Money Sky", group:"inspiration", colors:["#0E0F0E","#581F0D","#D6B488","#F3F3F0","#B8CBD2"], primary:"#581F0D", secondary:"#B8CBD2", surface:"#D6B488", ink:"#0E0F0E", muted:"#581F0D" },
  { id:"espresso-fog", label:"Espresso Fog", group:"inspiration", colors:["#645143","#CEBFB3","#E0E3E7","#8C8C8D","#302423"], primary:"#645143", secondary:"#8C8C8D", surface:"#CEBFB3", ink:"#302423", muted:"#645143" },
  { id:"hunter-rose", label:"Hunter Rose", group:"inspiration", colors:["#1F5132","#C1898B","#FFFFFF","#552E23","#0A0812"], primary:"#1F5132", secondary:"#C1898B", surface:"#FFFFFF", ink:"#0A0812", muted:"#552E23" },
  { id:"violet-taupe", label:"Violet Taupe", group:"inspiration", colors:["#95939B","#CECECE","#B5ACC1","#E3C4AD","#4A4541"], primary:"#B5ACC1", secondary:"#E3C4AD", surface:"#CECECE", ink:"#4A4541", muted:"#95939B" },
  { id:"ash-pink-electric", label:"Ash Pink Electric", group:"inspiration", colors:["#E2C2BD","#B8C2C4","#ECECEF","#0083BB","#232A30"], primary:"#0083BB", secondary:"#E2C2BD", surface:"#ECECEF", ink:"#232A30", muted:"#607078" },
  { id:"wine-steel", label:"Wine & Steel", group:"inspiration", colors:["#EBF0F5","#AC262D","#751F22","#25627C","#131712"], primary:"#AC262D", secondary:"#25627C", surface:"#EBF0F5", ink:"#131712", muted:"#751F22" },
  { id:"denim-crimson", label:"Denim Crimson", group:"inspiration", colors:["#B8CED9","#14192C","#AB2728","#9DA6A5","#EBEBEB"], primary:"#AB2728", secondary:"#14192C", surface:"#B8CED9", ink:"#14192C", muted:"#59636A" },
  { id:"cyan-chocolate", label:"Cyan Chocolate", group:"inspiration", colors:["#719C95","#C0D1BF","#AECDE9","#B9966E","#381708"], primary:"#719C95", secondary:"#B9966E", surface:"#AECDE9", ink:"#381708", muted:"#596F69" },
  { id:"sport-bloom", label:"Sport Bloom", group:"inspiration", colors:["#038A61","#E84579","#F696C1","#F5D6DB","#BDC8C9"], primary:"#038A61", secondary:"#E84579", surface:"#F5D6DB", ink:"#14382E", muted:"#657575" },
  { id:"soft-rose-street", label:"Soft Rose Street", group:"inspiration", colors:["#EAE1E5","#E3D1BF","#C4BDB8","#EBC4B9","#D48179"], primary:"#D48179", secondary:"#C4BDB8", surface:"#EAE1E5", ink:"#3C3435", muted:"#786D6C" },
  { id:"orchid-citrus", label:"Orchid Citrus", group:"inspiration", colors:["#F096C8","#0392F0","#85A441","#FFC025","#EF790B"], primary:"#F096C8", secondary:"#0392F0", surface:"#FFC025", ink:"#25351A", muted:"#63752D" },
  { id:"cavalli-coast", label:"Cavalli Coast", group:"inspiration", colors:["#D7511D","#E4D4BA","#9CBAB6","#558BA3","#193048"], primary:"#D7511D", secondary:"#558BA3", surface:"#9CBAB6", ink:"#193048", muted:"#5F6F75" },
  { id:"bordeaux-noir", label:"Bordeaux Noir", group:"inspiration", colors:["#191917","#6D6864","#FCD6BC","#5B191D","#2D1012"], primary:"#5B191D", secondary:"#6D6864", surface:"#FCD6BC", ink:"#191917", muted:"#6D6864" },
  { id:"kalamata-harbor", label:"Kalamata Harbor", group:"inspiration", colors:["#080808","#62424D","#545E3A","#476482","#E2E1DB"], primary:"#62424D", secondary:"#476482", surface:"#545E3A", ink:"#080808", muted:"#545E3A" },
  { id:"yacht-club", label:"Yacht Club", group:"inspiration", colors:["#28A476","#A7C3B2","#F5F5F5","#0289CD","#0244A6"], primary:"#28A476", secondary:"#0289CD", surface:"#A7C3B2", ink:"#0244A6", muted:"#4B766B" },
  { id:"peach-veil", label:"Peach Veil", group:"inspiration", colors:["#1C1813","#AA9485","#BF9F92","#DCC9C3","#E4E4E4"], primary:"#BF9F92", secondary:"#AA9485", surface:"#DCC9C3", ink:"#1C1813", muted:"#75665E" },
  { id:"tiger-smoke", label:"Tiger Smoke", group:"inspiration", colors:["#E75323","#F46B27","#E7C7B9","#C2C2C2","#453F3D"], primary:"#E75323", secondary:"#453F3D", surface:"#E7C7B9", ink:"#453F3D", muted:"#76645D" },
  { id:"ivory-dusk", label:"Ivory Dusk", group:"inspiration", colors:["#182131","#58586B","#D8D4DE","#DFD7CD","#BEB6B0"], primary:"#58586B", secondary:"#182131", surface:"#D8D4DE", ink:"#182131", muted:"#58586B" }
];

export const typographies: TypographyDefinition[] = [
  { id:"editorial-authority", label:"Editorial Authority", description:"Serif headline · Sans body", titleFamily:"Newsreader", bodyFamily:"IBM Plex Sans", captionFamily:"IBM Plex Sans", monoFamily:"IBM Plex Mono" },
  { id:"modern-clarity", label:"Modern Clarity", description:"Sans headline · Serif body", titleFamily:"IBM Plex Sans", bodyFamily:"Newsreader", captionFamily:"IBM Plex Sans", monoFamily:"IBM Plex Mono" },
  { id:"humanist-voice", label:"Humanist Voice", description:"Italic sans headline · Serif body", titleFamily:"IBM Plex Sans", bodyFamily:"Newsreader", captionFamily:"IBM Plex Sans", monoFamily:"IBM Plex Mono" },
  { id:"research-notebook", label:"Research Notebook", description:"Mono headline · Sans body", titleFamily:"IBM Plex Mono", bodyFamily:"IBM Plex Sans", captionFamily:"IBM Plex Sans", monoFamily:"IBM Plex Mono" },
  { id:"technical-signal", label:"Technical Signal", description:"Mono headline · Mono body", titleFamily:"IBM Plex Mono", bodyFamily:"IBM Plex Mono", captionFamily:"IBM Plex Sans", monoFamily:"IBM Plex Mono" }
];

export const motions: MotionDefinition[] = [
  { id:"editorial-restraint", transition:"editorial-push", transitionDuration:0.6, entrance:"rise-fade" },
  { id:"soft-continuity", transition:"blur-crossfade", transitionDuration:0.6, entrance:"fade" },
  { id:"dusk-close", transition:"dip-to-dusk", transitionDuration:0.8, entrance:"rise-fade" }
];

export const designPacks: DesignPack[] = [
  { id:"ivory-dusk", label:"Ivory Dusk", palette:"ivory-dusk", typography:"modern-clarity", defaultLayout:"feature-left-16x9", motion:"soft-continuity" },
  { id:"ivory-dusk-editorial", label:"Ivory Dusk Editorial", palette:"ivory-dusk-editorial", typography:"editorial-authority", defaultLayout:"feature-left-4x3", motion:"editorial-restraint" }
];

export const factoryPalettes: PaletteDefinition[] = [
  {
    id:"ivory-dusk-editorial",
    label:"Ivory Dusk Editorial",
    group:"factory",
    colors:["#EEE6D8","#D8CBB8","#24202A","#5F5363","#A6793B"],
    primary:"#A6793B",
    secondary:"#5F5363",
    surface:"#D8CBB8",
    ink:"#24202A",
    muted:"#5F5363"
  }
];

export const allPalettes = [...palettes, ...factoryPalettes];

export function getLayout(id: string): LayoutDefinition {
  const value = layouts.find((item) => item.id === id);
  if (!value) throw new Error(`Unknown layout: ${id}`);
  return value;
}

export function getPalette(id: string): PaletteDefinition {
  const value = allPalettes.find((item) => item.id === id);
  if (!value) throw new Error(`Unknown palette: ${id}`);
  return value;
}

export function getTypography(id: string): TypographyDefinition {
  const value = typographies.find((item) => item.id === id);
  if (!value) throw new Error(`Unknown typography: ${id}`);
  return value;
}

export function getDesignPack(id: string): DesignPack {
  const value = designPacks.find((item) => item.id === id);
  if (!value) throw new Error(`Unknown design pack: ${id}`);
  return value;
}
