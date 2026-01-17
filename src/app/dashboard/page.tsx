"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  createProject, 
  deleteProject, 
  addApplication, 
  updateApplicationStatus, 
  deleteApplication 
} from "@/lib/services/projectService";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

type Toast = { id: string; message: string; type: "success" | "error" | "info"; };

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"links" | "tracker">("links");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copying, setCopying] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string, type: 'project' | 'application'} | null>(null);

  const [projectName, setProjectName] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [applications, setApplications] = useState<any[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  useEffect(() => {
    if (!user) return;
    const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const qApps = query(collection(db, "applications"), where("userId", "==", user.uid), orderBy("appliedAt", "desc"));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubProjects(); unsubApps(); };
  }, [user]);

  const totalClicks = projects.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const mostPopular = projects.length > 0 
    ? [...projects].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0].name 
    : "N/A";

  const filteredApps = applications.filter(app => 
    app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      const result = await createProject(projectName, user.uid, destUrl);
      if (result.success) { setProjectName(""); setDestUrl(""); showToast("Smart link generated!", "success"); }
    } catch (err) { showToast("Error", "error"); } finally { setLoading(false); }
  };

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      const result = await addApplication(user.uid, company, role);
      if (result.success) { setCompany(""); setRole(""); showToast("Application tracked!", "success"); }
    } catch (err) { showToast("Error saving", "error"); } finally { setLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
        if (deleteTarget.type === 'project') await deleteProject(deleteTarget.id);
        else await deleteApplication(deleteTarget.id);
        showToast("Removed successfully", "info");
    } catch (e) { showToast("Error", "error"); }
    setDeleteTarget(null);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "No activity";
    try {
      const date = timestamp.toDate();
      return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "Recent"; }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-6 md:p-12 selection:bg-blue-500/30">
      
      {/* TOASTS */}
      <div className="fixed top-8 right-8 z-[110] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto bg-slate-900/90 border border-blue-500/20 backdrop-blur-xl px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest text-blue-400 shadow-2xl animate-in slide-in-from-right-10">
            {t.message}
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 p-10 rounded-[3rem] max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">Confirm</h2>
            <p className="text-slate-400 text-sm mb-8">Delete <span className="text-white font-bold">{deleteTarget.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 rounded-2xl bg-slate-800 text-[10px] font-black tracking-widest">BACK</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-[10px] font-black tracking-widest text-white">DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <div className="max-w-6xl mx-auto bg-[#0F172A]/30 border border-slate-800/60 rounded-[4rem] p-8 md:p-20 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] -z-10"></div>

        <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white">Career Command Center</h1>
            <p className="text-slate-600 font-bold mt-3 tracking-[0.4em] uppercase text-[10px]">Real-Time Insight Engine</p>
          </div>
          <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-slate-800 shadow-inner">
            <button onClick={() => setActiveTab("links")} className={`px-10 py-3 text-[10px] font-black rounded-full transition-all ${activeTab === 'links' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab("tracker")} className={`px-10 py-3 text-[10px] font-black rounded-full transition-all ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>TRACKER</button>
          </div>
        </header>

        {activeTab === "links" ? (
          <div key="links-tab" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24 items-center">
              <div className="flex flex-col items-center justify-center aspect-square rounded-full border border-slate-800 bg-slate-900/10 p-10 group hover:border-blue-500/20 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Assets</p>
                <p className="text-5xl font-black text-white">{projects.length}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center aspect-square rounded-full border-2 border-blue-500 bg-blue-500/5 p-12 shadow-[0_0_50px_rgba(59,130,246,0.1)] scale-125 relative">
                <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping"></div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Total Clicks</p>
                <p className="text-7xl font-black text-white tracking-tighter">{totalClicks}</p>
                <p className="text-[8px] font-bold text-blue-300/50 mt-2 uppercase tracking-tighter">Live Monitor Active</p>
              </div>

              <div className="flex flex-col items-center justify-center aspect-square rounded-full border border-slate-800 bg-slate-900/10 p-10 group hover:border-blue-500/20 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Top Project</p>
                <p className="text-xs font-black text-blue-400 uppercase px-4 truncate w-full text-center">{mostPopular}</p>
              </div>
            </div>

            {/* CHART VIEW */}
            <div className="mb-20 p-10 bg-slate-950/40 border border-slate-800/50 rounded-[3rem] relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xs font-black text-white tracking-widest uppercase">7-Day Engagement Trend</h3>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Collecting Data...</span>
                    </div>
                </div>
                <div className="h-32 flex items-end gap-2 px-4">
                    {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/10 rounded-t-lg transition-all hover:from-blue-500" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col md:flex-row gap-8 mb-20 items-center">
              <input type="text" placeholder="Project Name" className="bg-transparent border-b border-slate-800 py-4 px-2 text-sm text-white focus:border-blue-500 outline-none w-full transition-all font-medium" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
              <input type="url" placeholder="URL" className="bg-transparent border-b border-slate-800 py-4 px-2 text-sm text-white focus:border-blue-500 outline-none w-full transition-all font-medium" value={destUrl} onChange={(e) => setDestUrl(e.target.value)} required />
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-full font-black text-[10px] tracking-[0.2em] transition-all shadow-2xl shadow-blue-900/40">
                {loading ? "..." : "GENERATE SMART LINK"}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[9px] uppercase font-black text-slate-600 border-b border-slate-800/50">
                  <tr>
                    <th className="pb-8 px-4">Asset Name</th>
                    <th className="pb-8 px-4">Last Activity</th>
                    <th className="pb-8 px-4 text-center">Engagement</th>
                    <th className="pb-8 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20">
                  {projects.map((p) => (
                    <tr key={p.id} className="group hover:bg-blue-500/[0.02] transition-all">
                      <td className="py-10 px-4">
                        <p className="font-black text-lg text-white group-hover:text-blue-400 transition-all">{p.name}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Status: Active</p>
                      </td>
                      <td className="py-10 px-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.lastClickedAt ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                            <span className="text-[11px] font-mono text-slate-400">{formatTime(p.lastClickedAt)}</span>
                        </div>
                      </td>
                      <td className="py-10 px-4 text-center font-black text-xl text-white tracking-tighter">{p.clicks || 0}</td>
                      <td className="py-10 px-4 text-right">
                        <div className="flex justify-end gap-6">
                          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/go/${p.slug}`); showToast("Copied!", "success"); }} className="text-[9px] font-black text-slate-500 hover:text-white tracking-widest">COPY</button>
                          <button onClick={() => setDeleteTarget({id: p.id, name: p.name, type: 'project'})} className="text-[9px] font-black text-slate-800 hover:text-red-500 tracking-widest transition-all">REMOVE</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div key="tracker-tab" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <form onSubmit={handleAddApp} className="flex flex-col md:flex-row gap-8 mb-16 items-center">
                <input type="text" placeholder="Company Name" className="bg-transparent border-b border-slate-800 py-4 px-2 text-sm text-white focus:border-indigo-500 outline-none w-full transition-all font-medium" value={company} onChange={(e) => setCompany(e.target.value)} required />
                <input type="text" placeholder="Role" className="bg-transparent border-b border-slate-800 py-4 px-2 text-sm text-white focus:border-indigo-500 outline-none w-full transition-all font-medium" value={role} onChange={(e) => setRole(e.target.value)} required />
                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-full font-black text-[10px] tracking-[0.2em] transition-all shadow-2xl">ADD APPLICATION</button>
             </form>

             <div className="mb-12 relative group">
               <input type="text" placeholder="Search applications..." className="w-full bg-slate-950/30 p-5 pl-14 border border-slate-800 rounded-full text-white text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               <span className="absolute left-6 top-5 opacity-40 group-focus-within:text-indigo-400 group-focus-within:opacity-100 transition-all text-lg">🔍</span>
            </div>

             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[9px] uppercase font-black text-slate-600 border-b border-slate-800/50">
                  <tr>
                    <th className="pb-8 px-4">Company & Role</th>
                    <th className="pb-8 px-4">Applied Date</th>
                    <th className="pb-8 px-4">Status</th>
                    <th className="pb-8 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="group hover:bg-indigo-500/[0.02] transition-all">
                      <td className="py-10 px-4">
                        <p className="font-black text-lg text-white group-hover:text-indigo-400 transition-all tracking-tight">{app.company}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{app.role}</p>
                      </td>
                      <td className="py-10 px-4 text-[11px] font-mono text-slate-500">
                        {formatTime(app.appliedAt)}
                      </td>
                      <td className="py-10 px-4">
                        <select 
                          value={app.status} 
                          onChange={(e) => { updateApplicationStatus(app.id, e.target.value); showToast(`Updated to ${e.target.value}`, "info"); }}
                          className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black px-4 py-2 rounded-full outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        >
                          <option value="Applied" className="bg-[#0F172A]">Applied</option>
                          <option value="Interviewing" className="bg-[#0F172A]">Interviewing</option>
                          <option value="Accepted" className="bg-[#0F172A]">Accepted</option>
                          <option value="Rejected" className="bg-[#0F172A]">Rejected</option>
                        </select>
                      </td>
                      <td className="py-10 px-4 text-right">
                        <button onClick={() => setDeleteTarget({id: app.id, name: app.company, type: 'application'})} className="text-[9px] font-black text-slate-800 hover:text-red-500 tracking-widest opacity-30 group-hover:opacity-100 transition-all">REMOVE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}