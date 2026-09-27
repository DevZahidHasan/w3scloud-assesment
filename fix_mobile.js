const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add state for mobile menu
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'contacts' | 'accounts'>('dashboard');",
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'contacts' | 'accounts'>('dashboard');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);"
);

// 2. Add function to change tab and close mobile menu
content = content.replace(
  /onClick=\{\(\) => setActiveTab\('dashboard'\)\}/g,
  "onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}"
);
content = content.replace(
  /onClick=\{\(\) => setActiveTab\('leads'\)\}/g,
  "onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }}"
);
content = content.replace(
  /onClick=\{\(\) => setActiveTab\('contacts'\)\}/g,
  "onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }}"
);
content = content.replace(
  /onClick=\{\(\) => setActiveTab\('accounts'\)\}/g,
  "onClick={() => { setActiveTab('accounts'); setIsMobileMenuOpen(false); }}"
);

// 3. Update the sidebar classes and add mobile overlay
const oldSidebar = `<aside className="w-64 bg-[#111928] text-white flex flex-col hidden md:flex">`;
const newSidebar = `
        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* SIDEBAR (Zoho CRM Style) */}
        <aside className={\`fixed inset-y-0 left-0 z-50 w-64 bg-[#111928] text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>`;

content = content.replace(oldSidebar, newSidebar);

// 4. Update the header to include the hamburger icon
const oldHeader = `<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
            <div className="text-xl font-semibold text-gray-800 capitalize">{activeTab} Module</div>`;

const newHeader = `<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4 text-gray-600 hover:text-gray-900 focus:outline-none" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div className="text-xl font-semibold text-gray-800 capitalize">{activeTab} Module</div>
            </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Updated page.tsx successfully!");
