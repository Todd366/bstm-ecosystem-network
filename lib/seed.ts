import type { EcoNode, NodeType } from './supabase'

const mk = (
  name: string, type: NodeType, parent_name: string|null,
  status: 'green'|'yellow'|'red' = 'green',
  url: string|null = null, notes: string|null = null
): EcoNode => ({
  id: `seed-${name.replace(/\W+/g,'_')}`,
  name, type, parent_name, status, url, notes,
  users: 0, revenue: 0, thb_burn: 0,
  last_update: new Date().toISOString(),
})

export const SEED: EcoNode[] = [
  // SOVEREIGN
  mk('BSTM Sovereign Trust','sovereign',null),
  // TRUSTS
  mk('Ecosystem Planning Trust','trust','BSTM Sovereign Trust'),
  mk('Asset Acquisition Trust','trust','BSTM Sovereign Trust'),
  // FOUNDATIONS
  mk('BSTM Innovation Foundation','foundation','Ecosystem Planning Trust'),
  mk('Sustainability & Growth Foundation','foundation','Ecosystem Planning Trust','yellow'),
  mk('Digital Transformation Foundation','foundation','Ecosystem Planning Trust'),
  mk('Wellness & Lifestyle Foundation','foundation','Asset Acquisition Trust','yellow'),
  mk('Economic Empowerment Foundation','foundation','Asset Acquisition Trust'),
  // ORGS
  mk('BSTM Holdings','org','BSTM Innovation Foundation'),
  mk('Green Initiatives','org','Sustainability & Growth Foundation','yellow'),
  mk('Health & Wellness Org','org','Wellness & Lifestyle Foundation','yellow'),
  mk('Secure Systems','org','Digital Transformation Foundation'),
  mk('Digital Media','org','Digital Transformation Foundation'),
  mk('Data Intelligence','org','Digital Transformation Foundation'),
  mk('Financial Services','org','Economic Empowerment Foundation'),
  mk('E-commerce Hub','org','Economic Empowerment Foundation','yellow'),
  mk('BSTM Consulting Group','org','Economic Empowerment Foundation'),
  mk('Innovation Labs','org','BSTM Innovation Foundation'),
  // COMPANIES
  mk('BSTM Tech Solutions','company','BSTM Holdings'),
  mk('THoBoCoin Ltd','company','BSTM Holdings','green','https://thobocoin-project-frontend.vercel.app/'),
  mk('BHD Innovations','company','Innovation Labs'),
  mk('GreenCycle Pty Ltd','company','Green Initiatives','yellow'),
  mk('AgriTech Pty Ltd','company','Green Initiatives','yellow'),
  mk('NutriHub Pty Ltd','company','Health & Wellness Org','yellow'),
  mk('HealthWave Pty Ltd','company','Health & Wellness Org','yellow'),
  mk('SecureNet Pty Ltd','company','Secure Systems'),
  mk('BSTM Security Services','company','Secure Systems'),
  mk('BSTM Media Pty Ltd','company','Digital Media'),
  mk('GIN Analytics Pty Ltd','company','Data Intelligence'),
  mk('BSTM Finance Pty Ltd','company','Financial Services'),
  mk('MarketPlace Botswana','company','E-commerce Hub','yellow'),
  mk('CabLink Pty Ltd','company','E-commerce Hub','green','https://todd366.github.io/CabLink-pwa/'),
  mk('BSTM Consulting Pty Ltd','company','BSTM Consulting Group'),
  // DEPTS
  mk('AI & Machine Learning Dept','dept','BSTM Tech Solutions','green','https://t.me/Todd366Bot','Netbot / offline AI · users=42'),
  mk('Trading Automation Dept','dept','BSTM Tech Solutions','green','https://bstm-x.vercel.app/'),
  mk('VPN & Network Security Dept','dept','SecureNet Pty Ltd','yellow'),
  mk('Web Development Dept','dept','BSTM Tech Solutions','green','https://bstm.hellofigwebsite.com/'),
  mk('Mobile App Development Dept','dept','BSTM Tech Solutions','yellow'),
  mk('System Integration & API Dept','dept','BSTM Tech Solutions','green','https://todd366.github.io/bstm-system-map/'),
  mk('Data Science & Analytics Dept','dept','GIN Analytics Pty Ltd','green','https://todd366.github.io/'),
  mk('Blockchain & Cryptocurrency Dept','dept','THoBoCoin Ltd','green','https://thobocoin-project-frontend.vercel.app/'),
  mk('Graphic Design & Branding Dept','dept','BSTM Media Pty Ltd'),
  mk('Content Creation & Copywriting Dept','dept','BSTM Media Pty Ltd'),
  mk('Social Media Management Dept','dept','BSTM Media Pty Ltd','green','https://www.facebook.com/BotswanaonlineNew'),
  mk('Digital Marketing & Advertising Dept','dept','BSTM Media Pty Ltd','yellow'),
  mk('BSTM Tutorial Center','dept','BSTM Tech Solutions','yellow'),
  mk('Private Security Dept','dept','BSTM Security Services'),
  mk('Music Dept','dept','BSTM Media Pty Ltd'),
  mk('Cab/Taxi Platform Dept','dept','CabLink Pty Ltd','green','https://todd366.github.io/CabLink-pwa/','Replacing inDrive & Yango'),
  mk('Finance & Accounting Dept','dept','BSTM Finance Pty Ltd'),
  mk('Marketplace & E-commerce Dept','dept','MarketPlace Botswana','yellow'),
  mk('Research & Development Dept','dept','BHD Innovations'),
  mk('Healthcare Information & Wellness Dept','dept','HealthWave Pty Ltd','yellow'),
  mk('Nutrition & Health Products Dept','dept','NutriHub Pty Ltd','yellow',null,'Nutrient Shake'),
  mk('Micro Farming & Urban Agriculture Dept','dept','AgriTech Pty Ltd','yellow'),
  mk('Sustainability & Environmental Dept','dept','GreenCycle Pty Ltd','yellow'),
  mk('Human Resources & Talent Development','dept','BSTM Consulting Pty Ltd'),
  mk('Project Management Office','dept','BSTM Consulting Pty Ltd'),
  mk('Legal & Compliance Dept','dept','BSTM Consulting Pty Ltd'),
  mk('G.I.N. Global Intelligence Network','dept','GIN Analytics Pty Ltd'),
  mk('BSTM Cloth Brand','dept','BSTM Media Pty Ltd','yellow'),
  mk('Spiritual Guidance & Consciousness Dept','dept','BSTM Consulting Pty Ltd','yellow'),
  mk('BHD Black Hole Drive Dept','dept','BHD Innovations'),
  mk('CabLink PWA','dept','Cab/Taxi Platform Dept','green','https://todd366.github.io/CabLink-pwa/','Vue UI · THB rewards · offline bookings · users=1'),
  // ROOMS 1–63
  ...Array.from({ length: 63 }, (_, i) => {
    const n = i + 1
    const labels: Record<number,string> = {
      1:'Free Citizen', 10:'Signal Hunter', 20:'Active Trader',
      30:'Network Builder', 40:'Staker', 47:'$10/mo Subscriber',
      50:'Founding Member', 55:'Elite Operator',
      60:'Sovereign Staker', 63:'Diamond God',
    }
    const tag = labels[n] ? ` — ${labels[n]}` : ''
    const status = n >= 47 && n <= 55 ? 'yellow' : 'green'
    return mk(`Room ${n}${tag}`, 'room', 'BSTM Holdings', status)
  }),
]
