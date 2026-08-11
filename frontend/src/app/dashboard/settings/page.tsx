"use client";

import { Sparkles, Settings, Bell, Shield, User, LogOut, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) {
          const parts = user.fullName.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (user.email) {
          setEmail(user.email);
        }
      } catch(e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage("");
    
    // Simulate API call for other settings if added in the future
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 800);
  };

  const handleDelete = () => {
    if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion initiated.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Account Settings <Settings className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === "profile" ? "bg-white/10 text-white border border-white/5" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <User className="w-5 h-5" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === "notifications" ? "bg-white/10 text-white border border-white/5" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === "security" ? "bg-white/10 text-white border border-white/5" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">Profile Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">First Name</label>
                        <input type="text" value={firstName} readOnly disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 cursor-not-allowed focus:outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Last Name</label>
                        <input type="text" value={lastName} readOnly disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 cursor-not-allowed focus:outline-none focus:border-primary/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Email Address</label>
                      <input type="email" value={email} readOnly disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 cursor-not-allowed focus:outline-none focus:border-primary/50" />
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                      {saveMessage && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> {saveMessage}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl glass-card border border-red-500/10 space-y-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4 border-b border-red-500/10 pb-4">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button onClick={handleDelete} className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
                 <h3 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">Notification Preferences</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-white font-medium">Email Notifications</p>
                       <p className="text-sm text-muted-foreground">Receive weekly reports and tips via email.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                   </div>
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-white font-medium">Application Alerts</p>
                       <p className="text-sm text-muted-foreground">Get notified when a new feature is available.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                   </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
                 <h3 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">Security Settings</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <button className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors mt-2">
                      Update Password
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

