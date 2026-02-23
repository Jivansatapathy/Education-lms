import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const certs = [
  { id: "1", course: "UX Design Masterclass", date: "Jan 15, 2026", instructor: "Lisa Park" },
  { id: "2", course: "Project Management Professional", date: "Dec 20, 2025", instructor: "Maria Garcia" },
];

const Certificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const downloadCertificate = (cert: typeof certs[0]) => {
    // Generate a text-based certificate and download it
    const content = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║              CERTIFICATE OF COMPLETION                   ║
║                                                          ║
║                      LMS Pro                             ║
║                                                          ║
║                 This certifies that                      ║
║                                                          ║
║              ${(user?.name || "Student").padStart(30).padEnd(40)}  ║
║                                                          ║
║          has successfully completed the course            ║
║                                                          ║
║       ${cert.course.padStart(35).padEnd(45)}  ║
║                                                          ║
║              Date: ${cert.date.padEnd(35)}    ║
║              Instructor: ${cert.instructor.padEnd(29)}    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${cert.course.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Certificate downloaded", description: `${cert.course} certificate saved.` });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Certificates</h1>
      <p className="text-muted-foreground">Certificates for completed courses</p>

      {certs.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border shadow-card text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No certificates yet. Complete a course to earn one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map(cert => (
            <div key={cert.id} className="bg-card rounded-xl p-5 border border-border shadow-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{cert.course}</p>
                  <p className="text-sm text-muted-foreground">{cert.instructor} · {cert.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(cert.id)} className="gap-1.5">
                  <Eye className="w-4 h-4" /> Preview
                </Button>
                <Button size="sm" onClick={() => downloadCertificate(cert)} className="gap-1.5">
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-xl border border-border shadow-elevated max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Certificate Preview</h3>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 bg-gradient-hero text-center">
              <div className="bg-card/95 backdrop-blur rounded-xl p-10 max-w-lg mx-auto border border-border">
                <Award className="w-12 h-12 text-accent mx-auto mb-4" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Certificate of Completion</p>
                <h2 className="text-2xl font-bold text-foreground">{certs.find(c => c.id === preview)?.course}</h2>
                <p className="text-muted-foreground mt-3">Awarded to <span className="font-semibold text-foreground">{user?.name || "Student"}</span></p>
                <p className="text-sm text-muted-foreground mt-1">{certs.find(c => c.id === preview)?.date}</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">LMS Pro · {certs.find(c => c.id === preview)?.instructor}</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-border">
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              <Button className="gap-1.5" onClick={() => downloadCertificate(certs.find(c => c.id === preview)!)}><Download className="w-4 h-4" /> Download</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Certificates;
