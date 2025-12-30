import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Briefcase, 
  Building2, 
  AlertTriangle, 
  Search, 
  Lock,
  ArrowRight,
  RefreshCcw,
  Info,
  Settings,
  LayoutDashboard,
  Database,
  Terminal,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  History
} from 'lucide-react';

export default function App() {
  // --- State Management ---
  const [token, setToken] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'details'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- Logic: Simulation of the Audit Engine ---
  // In a production environment, this would call your Flask/Node backend
  const runCrmAudit = async (patToken) => {
    setIsAuditing(true);
    setError(null);

    // Simulate network latency for the "Deep Scan" effect
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Logic-based generation: We generate findings based on the token's "strength"
      // or just randomizing for this interactive prototype to show variety
      const hubId = Math.floor(1000000 + Math.random() * 9000000).toString();
      
      const generatedCategories = [
        {
          id: "contacts",
          name: "Contact Hygiene",
          icon: <Users className="w-5 h-5" />,
          score: Math.floor(Math.random() * 40) + 60,
          checks: [
            { label: "Missing Email Addresses", value: `${Math.floor(Math.random() * 200)} records`, status: "warning", description: "Contacts missing a primary email identity." },
            { label: "Duplicate Contacts", value: `${Math.floor(Math.random() * 50)} pairs`, status: "danger", description: "Identified via name/domain overlap." },
            { label: "Engagement Rate", value: `${(Math.random() * 20 + 5).toFixed(1)}%`, status: "healthy", description: "Average click-through on recent CRM emails." }
          ]
        },
        {
          id: "deals",
          name: "Pipeline Health",
          icon: <Briefcase className="w-5 h-5" />,
          score: Math.floor(Math.random() * 30) + 70,
          checks: [
            { label: "Stale Deals", value: `${Math.floor(Math.random() * 15)} deals`, status: "warning", description: "No logged activity in the last 30 days." },
            { label: "Missing Close Dates", value: `${Math.floor(Math.random() * 5)} deals`, status: "healthy", description: "Open deals without a forecasted close date." },
            { label: "Amount Accuracy", value: "98%", status: "healthy", description: "Deals with non-zero or non-placeholder amounts." }
          ]
        },
        {
          id: "integrity",
          name: "Data Integrity",
          icon: <Building2 className="w-5 h-5" />,
          score: Math.floor(Math.random() * 50) + 40,
          checks: [
            { label: "Orphaned Records", value: `${Math.floor(Math.random() * 400)} records`, status: "danger", description: "Contacts not associated with any Company record." },
            { label: "Industry Field Fill", value: `${Math.floor(Math.random() * 60 + 20)}%`, status: "warning", description: "Completeness of the 'Industry' property on companies." },
            { label: "Sync Errors", value: "0", status: "healthy", description: "External integration sync health status." }
          ]
        }
      ];

      const avgScore = Math.round(generatedCategories.reduce((acc, cat) => acc + cat.score, 0) / 3);

      setResults({
        hub_id: hubId,
        health_score: avgScore,
        categories: generatedCategories,
        scopes: [
          "crm.objects.contacts.read",
          "crm.objects.companies.read",
          "crm.objects.deals.read",
          "crm.schemas.contacts.read",
          "crm.objects.owners.read"
        ],
        last_run: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setError("Failed to connect to HubSpot API. Please check your token permissions.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAuditClick = () => {
    if (!token || !token.startsWith('pat-')) {
      setError("Invalid format. HubSpot Private App Tokens must start with 'pat-'.");
      return;
    }
    runCrmAudit(token);
  };

  // --- UI Helpers ---
  const getStatusClasses = (status) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'danger': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  // --- Render Views ---
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
        <Activity className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Portal Analysis Ready</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">
        To begin the health check, paste your HubSpot Private App Access Token into the connection panel on the left.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <ShieldCheck className="w-5 h-5 text-[#FF7A59] mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Secure Access</h4>
          <p className="text-xs text-slate-400">Tokens are processed locally and never stored.</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <Terminal className="w-5 h-5 text-blue-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Scope Aware</h4>
          <p className="text-xs text-slate-400">We only audit objects your token is allowed to see.</p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Health Score</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-6xl font-black tracking-tighter ${getScoreColor(results.health_score)}`}>
                {results.health_score}
              </h3>
              <span className="text-2xl text-slate-300 font-bold">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
              <History className="w-4 h-4" />
              Last Audit: {results.last_run}
            </div>
          </div>
          <div className="hidden sm:flex relative w-32 h-32 items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
               <circle 
                cx="64" cy="64" r="56" 
                stroke="currentColor" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={351.8} 
                strokeDashoffset={351.8 - (351.8 * results.health_score) / 100} 
                className={getScoreColor(results.health_score) + " transition-all duration-1000 ease-out"}
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className={`w-8 h-8 ${getScoreColor(results.health_score)}`} />
             </div>
          </div>
        </div>

        <div className="bg-[#2D3E50] p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center text-white">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Top Recommendation</p>
          <h4 className="font-bold text-lg leading-tight mb-4">
            {results.health_score < 80 ? "Resolve association errors to improve integrity score." : "Your portal is looking great! Consider refining stale deals."}
          </h4>
          <button className="bg-[#FF7A59] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:shadow-lg transition-all w-fit flex items-center gap-2">
            View Action Plan <ChevronRight className="w-4 h-4" />
          </button>
          <BarChart3 className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5" />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-[#FF7A59] border border-slate-100 group-hover:bg-[#FF7A59] group-hover:text-white transition-colors">
                  {category.icon}
                </div>
                <h3 className="font-bold text-slate-800">{category.name}</h3>
              </div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-white ${getScoreColor(category.score)}`}>
                {category.score}%
              </div>
            </div>
            
            <div className="p-5 space-y-5 flex-grow">
              {category.checks.map((check, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-slate-700">{check.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusClasses(check.status)}`}>
                      {check.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{check.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
              <button 
                onClick={() => { setSelectedCategory(category); setActiveTab('details'); }}
                className="w-full text-[10px] font-bold text-slate-400 hover:text-[#FF7A59] transition-colors flex items-center justify-center gap-1 uppercase tracking-widest"
              >
                Deep Dive Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white rounded-xl shadow-sm text-[#FF7A59] border border-slate-100">
                {selectedCategory?.icon}
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCategory?.name}</h2>
            </div>
            <p className="text-slate-500">Comprehensive breakdown of object properties and metadata health.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category Health</p>
            <div className={`text-4xl font-black ${getScoreColor(selectedCategory?.score)}`}>{selectedCategory?.score}%</div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Check</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finding</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedCategory?.checks.map((check, i) => (
                  <tr key={i} className="group">
                    <td className="py-6 pr-4">
                      <div className="font-bold text-slate-700 group-hover:text-[#FF7A59] transition-colors">{check.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{check.description}</div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">{check.value}</span>
                    </td>
                    <td className="py-6 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusClasses(check.status)}`}>
                        {check.status === 'healthy' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {check.status}
                      </div>
                    </td>
                    <td className="py-6 pl-4 text-sm text-slate-500 italic leading-relaxed">
                      {check.status === 'healthy' ? 'No action required.' : `Review the top 50 flagged ${selectedCategory.id} and update missing values.`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* Sidebar - Control Panel */}
      <aside className="w-80 bg-[#2D3E50] text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7A59] rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">HubCheck</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Health Auditor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Connection Panel */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3" /> Connection
            </h3>
            <div className="space-y-3">
              <div className="relative group">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Private App Token"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:ring-1 focus:ring-[#FF7A59] focus:border-[#FF7A59] transition-all outline-none placeholder:text-slate-600"
                />
                <Settings className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors cursor-pointer" />
              </div>
              <button
                onClick={handleAuditClick}
                disabled={isAuditing}
                className="w-full bg-[#FF7A59] hover:bg-[#e66a4c] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
              >
                {isAuditing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isAuditing ? 'Scanning...' : 'Run Audit'}
              </button>
              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-in slide-in-from-top-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-200 font-medium leading-tight">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Scope Status */}
          {results && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Active Permissions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {results.scopes.map(scope => (
                  <span key={scope} className="text-[9px] font-bold bg-slate-800/80 text-slate-400 px-2 py-1 rounded border border-slate-700/50 tracking-tighter uppercase">
                    {scope.split('.').slice(-2).join('.')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="space-y-2 pt-4 border-t border-slate-700/50">
            <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedCategory(null); }}
              className={`w-full flex items-center justify-between p-2.5 text-sm rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#FF7A59]/10 text-[#FF7A59]' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /> Overview</div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'dashboard' ? 'rotate-90' : ''}`} />
            </button>
            <button className="w-full flex items-center justify-between p-2.5 text-sm text-slate-500 cursor-not-allowed group">
              <div className="flex items-center gap-3"><Database className="w-4 h-4" /> Objects</div>
              <Lock className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </nav>

        <div className="p-6 bg-slate-800/30 border-t border-slate-700/50">
          <div className="flex items-center gap-3 text-slate-400">
            <div className={`w-2 h-2 rounded-full ${isAuditing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Huber Heights Node</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-80 flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40 flex justify-between items-center backdrop-blur-sm bg-white/80">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              CRM Audit Engine
              {results && (
                <>
                  <span className="text-slate-300 font-normal">/</span>
                  <span className="text-slate-500 text-sm font-medium">Hub {results.hub_id}</span>
                </>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {results && (
               <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-blue-100 flex items-center gap-1.5 shadow-sm">
                  <Activity className="w-3.5 h-3.5" /> Scanned {Math.floor(Math.random() * 5000 + 1000).toLocaleString()} records
               </div>
             )}
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <ExternalLink className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {isAuditing ? (
            /* Loading State */
            <div className="h-[65vh] flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#FF7A59] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#FF7A59]" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Scanning Portal Objects</h3>
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                We're fetching property metadata and calculating association density...
              </p>
            </div>
          ) : results ? (
            /* Results View - Dashboard or Details */
            activeTab === 'dashboard' ? renderDashboard() : renderDetails()
          ) : (
            /* Initial State */
            renderEmptyState()
          )}
        </div>
      </main>
    </div>
  );
}
