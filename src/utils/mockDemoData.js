/**
 * Demo content strictly used for Landing Page interactive showcase.
 * CRITICAL RULE: This data is NEVER mixed with real user data or saved to Appwrite.
 */
export const LANDING_PAGE_DEMO_MEMORIES = [
  {
    id: 'demo-1',
    title: 'Chocolate Lava Cake Recipe',
    description: 'Screenshot of grandma\'s 20-minute molten lava cake recipe with ingredient ratios.',
    type: 'screenshot',
    tags: ['recipe', 'baking', 'dessert'],
    content: '',
    extractedText: '1/2 cup butter, 4 oz bittersweet chocolate, 2 whole eggs, 2 egg yolks, 1/4 cup sugar, pinch of salt, 2 tbsp flour. Bake at 425F for 12-14 minutes.',
    url: '',
    fileId: '',
    language: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Appwrite TablesDB Schema Initialization',
    description: 'Node.js script to create tables and define attributes with permissions.',
    type: 'code',
    tags: ['appwrite', 'database', 'backend'],
    content: `// Initialize TablesDB collection with permissions
import { Client, TablesDB, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('recallx_project');

const tablesDb = new TablesDB(client);
const row = await tablesDb.createRow(
  'recallx_db',
  'memories',
  'unique()',
  { title: 'My Note', type: 'note' },
  [Permission.read(Role.user(userId))]
);`,
    extractedText: '',
    url: 'https://appwrite.io/docs/products/databases',
    fileId: '',
    language: 'javascript',
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Q3 Financial Forecast Report',
    description: 'Executive quarterly summary and runway projections from Q3.',
    type: 'pdf',
    tags: ['finance', 'report', 'q3'],
    content: '',
    extractedText: 'Executive Summary: Overall runway expanded to 28 months. Operating expenses decreased by 14% year-over-year. Key metric growth exceeded targets by 18%.',
    url: '',
    fileId: '',
    language: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Tailwind CSS Grid & Glassmorphism Cheatsheet',
    description: 'Quick reference for backdrop filters and responsive dashboard layouts.',
    type: 'note',
    tags: ['css', 'frontend', 'ui-design'],
    content: `Backdrop blur: backdrop-blur-md bg-white/70 dark:bg-slate-900/80
Card border: border border-slate-200/60 dark:border-slate-800/60
Responsive grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`,
    extractedText: '',
    url: 'https://tailwindcss.com/docs',
    fileId: '',
    language: '',
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];
