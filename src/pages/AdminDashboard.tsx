import { motion } from "framer-motion";
import { adminStats, users as mockUsers } from "@/data/mockData";
import { Users, BookOpen, DollarSign, TrendingUp, MoreHorizontal } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  status: "active" | "inactive";
  enrolled: number;
}

const AdminDashboard = () => {
  const [userList, setUserList] = useState<UserItem[]>(mockUsers);

  const toggleStatus = (id: string) => {
    setUserList(userList.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const } : u));
  };

  const changeRole = (id: string, role: "student" | "instructor" | "admin") => {
    setUserList(userList.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6 max-w-7xl">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), icon: Users, change: "+12%", color: "text-primary bg-primary/10" },
          { label: "Active Courses", value: adminStats.activeCourses, icon: BookOpen, change: "+8%", color: "text-accent bg-accent/10" },
          { label: "Revenue", value: `$${(adminStats.revenue / 1000).toFixed(0)}K`, icon: DollarSign, change: "+23%", color: "text-success bg-success/10" },
          { label: "Completion Rate", value: `${adminStats.completionRate}%`, icon: TrendingUp, change: "+5%", color: "text-warning bg-warning/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-success font-medium mt-1">{stat.change} this month</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={adminStats.userGrowth}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(224, 65%, 33%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(224, 65%, 33%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="hsl(224, 65%, 33%)" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={adminStats.revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 76%, 40%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(168, 76%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(168, 76%, 40%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Manage Users</h3>
          <Button size="sm">Add User</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enrolled</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Select value={user.role} onValueChange={(v) => changeRole(user.id, v as any)}>
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3">
                    <Switch checked={user.status === "active"} onCheckedChange={() => toggleStatus(user.id)} />
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{user.enrolled}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
