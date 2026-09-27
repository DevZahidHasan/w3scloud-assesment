'use client';

import { useState, useEffect } from 'react';

interface CrmRecord {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  lead_source?: string;
  owner?: string;
  website?: string;
}

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'contacts' | 'accounts'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [leads, setLeads] = useState<CrmRecord[]>([]);
  const [contacts, setContacts] = useState<CrmRecord[]>([]);
  const [accounts, setAccounts] = useState<CrmRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    First_Name: '',
    Last_Name: '',
    Email: '',
    Company: '',
    Phone: '',
    Lead_Source: '', // Specific for Leads
    Account_Name: '', // Specific for Accounts
    Website: '', // Specific for Accounts
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all modules data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [leadsRes, contactsRes, accountsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/contacts'),
          fetch('/api/accounts')
        ]);

        const leadsData = await leadsRes.json();
        const contactsData = await contactsRes.json();
        const accountsData = await accountsRes.json();

        // Check if any returned unauthorized
        if (!leadsRes.ok && leadsData.error === 'Not authenticated with Zoho') {
          throw new Error('Not authenticated with Zoho');
        }

        if (leadsRes.ok) setLeads(leadsData.data);
        if (contactsRes.ok) setContacts(contactsData.data);
        if (accountsRes.ok) setAccounts(accountsData.data);
        
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Generic Handle Form Submission
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    let endpoint = '';
    if (activeTab === 'leads') endpoint = '/api/leads';
    if (activeTab === 'contacts') endpoint = '/api/contacts';
    if (activeTab === 'accounts') endpoint = '/api/accounts';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || `Failed to create ${activeTab.slice(0, -1)}`);

      // Add newly fetched record to the top of the respective table
      if (activeTab === 'leads') setLeads([result.data, ...leads]);
      if (activeTab === 'contacts') setContacts([result.data, ...contacts]);
      if (activeTab === 'accounts') setAccounts([result.data, ...accounts]);

      setFormData({ First_Name: '', Last_Name: '', Email: '', Company: '', Phone: '', Lead_Source: '', Account_Name: '', Website: '' });
      setShowForm(false);
      alert(`Success! ${activeTab.slice(0, -1)} created and retrieved from Zoho CRM.`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setFormLoading(false);
    }
  };

  // Render Table depending on the active tab
  const renderTable = () => {
    if (activeTab === 'leads') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Source</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Owner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leads found. Create one to get started!</td></tr>
              ) : (
                leads.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{record.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.lead_source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'contacts') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Owner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {contacts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No contacts found in Zoho CRM.</td></tr>
              ) : (
                contacts.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{record.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'accounts') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Owner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No accounts found in Zoho CRM.</td></tr>
              ) : (
                accounts.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{record.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline"><a href={record.website} target="_blank">{record.website}</a></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR (Zoho CRM Style) */}
      
        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* SIDEBAR (Zoho CRM Style) */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111928] text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <span className="text-xl font-bold tracking-wide">W3SCLOUD CRM</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#1F2A3C] text-blue-400' : 'text-gray-400 hover:bg-[#1F2A3C] hover:text-white'}`}>
            Dashboard
          </button>
          <button onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'leads' ? 'bg-[#1F2A3C] text-blue-400' : 'text-gray-400 hover:bg-[#1F2A3C] hover:text-white'}`}>
            Leads
          </button>
          <button onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'contacts' ? 'bg-[#1F2A3C] text-blue-400' : 'text-gray-400 hover:bg-[#1F2A3C] hover:text-white'}`}>
            Contacts
          </button>
          <button onClick={() => { setActiveTab('accounts'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'accounts' ? 'bg-[#1F2A3C] text-blue-400' : 'text-gray-400 hover:bg-[#1F2A3C] hover:text-white'}`}>
            Accounts
          </button>
        </nav>
        
        {/* SIDEBAR BOTTOM - LOGOUT */}
        <div className="p-4 border-t border-gray-700">
          <a href="/api/auth/logout" className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-red-600">
            Logout
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-xl font-semibold text-gray-800 capitalize">{activeTab} Module</div>
          <div className="flex items-center space-x-6">
            <a href="/api/auth/login" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
              Refresh Connection
            </a>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow">
              Z
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto p-8 relative">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">All {activeTab}</h2>
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded shadow hover:bg-blue-700 transition font-medium flex items-center"
              >
                Create {activeTab.slice(0, -1)}
              </button>
            )}
          </div>

          {/* STATUS MESSAGES */}
          {loading && <div className="text-center py-10 text-gray-500 font-medium animate-pulse">Syncing data with Zoho CRM...</div>}
          
          {error === 'Not authenticated with Zoho' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded shadow-sm flex flex-col items-start">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Authentication Required</h3>
              <p className="text-yellow-700 mb-4">You need to connect to Zoho CRM to view and manage data.</p>
              <a href="/api/auth/login" className="bg-yellow-500 text-white px-4 py-2 rounded font-medium hover:bg-yellow-600 transition">
                Connect Now
              </a>
            </div>
          )}

          {error && error !== 'Not authenticated with Zoho' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm mb-6">
              <p className="text-red-700 font-medium">Error Fetching Data: {error}</p>
            </div>
          )}

          {/* DASHBOARD TAB (Overview) */}
          {!loading && !error && activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 font-medium mb-1">Total Leads</h3>
                  <p className="text-4xl font-bold text-blue-600">{leads.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 font-medium mb-1">Total Contacts</h3>
                  <p className="text-4xl font-bold text-green-600">{contacts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 font-medium mb-1">Total Accounts</h3>
                  <p className="text-4xl font-bold text-purple-600">{accounts.length}</p>
                </div>
              </div>
              <p className="text-gray-600">Welcome to your comprehensive CRM Dashboard. Navigate through the sidebar to view detailed records across multiple Zoho CRM modules.</p>
            </div>
          )}

          {/* DYNAMIC TABLES */}
          {!loading && !error && activeTab !== 'dashboard' && renderTable()}

        </div>

        {/* CREATE RECORD MODAL OVERLAY */}
        {showForm && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 capitalize">Create New {activeTab.slice(0, -1)}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>
              
              <form onSubmit={handleCreateRecord} className="p-6">
                {formError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">{formError}</div>}
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  {/* FOR LEADS */}
                  {activeTab === 'leads' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">First Name *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.First_Name} onChange={(e) => setFormData({...formData, First_Name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Last Name *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Last_Name} onChange={(e) => setFormData({...formData, Last_Name: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Company *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Company} onChange={(e) => setFormData({...formData, Company: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email *</label>
                        <input type="email" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Email} onChange={(e) => setFormData({...formData, Email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Phone *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Phone} onChange={(e) => setFormData({...formData, Phone: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Lead Source</label>
                        <select className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Lead_Source} onChange={(e) => setFormData({...formData, Lead_Source: e.target.value})}>
                          <option value="">None</option>
                          <option value="Advertisement">Advertisement</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Employee Referral">Employee Referral</option>
                          <option value="External Referral">External Referral</option>
                          <option value="Online Store">Online Store</option>
                          <option value="Partner">Partner</option>
                          <option value="Public Relations">Public Relations</option>
                          <option value="Sales Email Alias">Sales Email Alias</option>
                          <option value="Seminar Partner">Seminar Partner</option>
                          <option value="Internal Seminar">Internal Seminar</option>
                          <option value="Trade Show">Trade Show</option>
                          <option value="Web Download">Web Download</option>
                          <option value="Web Research">Web Research</option>
                          <option value="Chat">Chat</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* FOR CONTACTS */}
                  {activeTab === 'contacts' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">First Name *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.First_Name} onChange={(e) => setFormData({...formData, First_Name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Last Name *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Last_Name} onChange={(e) => setFormData({...formData, Last_Name: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Account Name (Text)</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Account_Name} onChange={(e) => setFormData({...formData, Account_Name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email *</label>
                        <input type="email" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Email} onChange={(e) => setFormData({...formData, Email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Phone</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Phone} onChange={(e) => setFormData({...formData, Phone: e.target.value})} />
                      </div>
                    </>
                  )}

                  {/* FOR ACCOUNTS */}
                  {activeTab === 'accounts' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Account Name *</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Account_Name} onChange={(e) => setFormData({...formData, Account_Name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Phone</label>
                        <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Phone} onChange={(e) => setFormData({...formData, Phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Website</label>
                        <input type="url" placeholder="https://example.com" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium" value={formData.Website} onChange={(e) => setFormData({...formData, Website: e.target.value})} />
                      </div>
                    </>
                  )}

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center">
                    {formLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
