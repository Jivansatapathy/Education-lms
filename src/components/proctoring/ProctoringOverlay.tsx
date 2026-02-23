import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ShieldAlert, Maximize, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProctoringOverlayProps {
    onViolation: (reason: string) => void;
    isActive: boolean;
}

export const ProctoringOverlay = ({ onViolation, isActive }: ProctoringOverlayProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [violations, setViolations] = useState(0);
    const [showWarning, setShowWarning] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        // Camera Access
        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
                onViolation("Camera access is required for this session.");
            }
        };

        setupCamera();

        // Tab Visibility / Focus Monitoring
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                handleViolation("Tab switched or browser minimized");
            }
        };

        const handleBlur = () => {
            handleViolation("Focus lost from window");
        };

        // Fullscreen Monitoring
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            if (!isFull && isActive) {
                handleViolation("Fullscreen exited");
            }
        };

        // Mouse Boundary Detection
        const handleMouseLeave = () => {
            handleViolation("Cursor moved outside monitored area");
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Detect if cursor is near the top edge (browser exit fullscreen hint area)
            if (e.clientY < 5 && isFullscreen) {
                handleViolation("Proximity to browser controls detected");
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mousemove", handleMouseMove);

            // Stop camera stream using ref to ensure it works even if video element is unmounted
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isActive]);

    const handleViolation = (reason: string) => {
        setViolations(prev => {
            const next = prev + 1;
            if (next >= 3) {
                onViolation(`Maximum violations reached: ${reason}`);
            } else {
                setShowWarning(`${reason}. Warning ${next}/3. Next violation will result in auto-submission.`);
            }
            return next;
        });
    };

    const enterFullscreen = () => {
        document.documentElement.requestFullscreen().catch(() => {
            onViolation("Failed to enter fullscreen mode.");
        });
    };

    if (!isActive) return null;

    return (
        <>
            {/* Video Feed Preview */}
            <motion.div
                drag
                dragConstraints={{ left: 20, right: window.innerWidth - 220, top: 20, bottom: window.innerHeight - 170 }}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1 }}
                className="fixed z-50 bottom-4 right-4 w-48 h-36 bg-black rounded-lg border-2 border-primary shadow-elevated overflow-hidden group cursor-move"
            >
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Feed</span>
                </div>
                {hasPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 p-4 text-center">
                        <Camera className="w-6 h-6 text-destructive mb-2" />
                        <p className="text-[10px] font-medium text-foreground">Camera Access Required</p>
                    </div>
                )}
            </motion.div>

            {/* Fullscreen Enforcer Overlay */}
            {!isFullscreen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="max-w-md space-y-4">
                        <ShieldAlert className="w-16 h-16 text-warning mx-auto" />
                        <h2 className="text-2xl font-bold">Proctored Session</h2>
                        <p className="text-muted-foreground">This session is being monitored. You must remain in fullscreen mode and avoid switching tabs.</p>
                        <Button onClick={enterFullscreen} className="w-full gap-2">
                            <Maximize className="w-4 h-4" /> Enter Fullscreen to Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* Top Protective Barrier */}
            {isFullscreen && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[100] group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-card border border-primary/30 border-t-0 px-4 py-1 rounded-b-lg shadow-elevated flex items-center gap-2 transition-transform duration-300 -translate-y-[90%] group-hover:translate-y-0">
                        <ShieldAlert className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">Proctored Environment Active</span>
                    </div>
                </div>
            )}

            {/* Warning Toast */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed z-[60] bottom-8 left-1/2 -translate-x-1/2 max-w-sm w-full bg-destructive text-destructive-foreground p-4 rounded-xl shadow-elevated border border-white/20 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-bold">Cheating Attempt Detected!</p>
                            <p className="text-xs opacity-90">{showWarning}</p>
                        </div>
                        <button onClick={() => setShowWarning(null)} className="p-1 hover:bg-white/10 rounded">
                            <span className="sr-only">Dismiss</span>
                            <AlertCircle className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
