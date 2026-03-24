"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, CheckCircle2, Share, MoreVertical, Plus } from "lucide-react";
import { SiAndroid, SiApple } from "react-icons/si";

interface MobileInstallModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return "desktop";
    }

    const userAgent = navigator.userAgent || "";

    if (/iPad|iPhone|iPod/.test(userAgent)) {
        return "ios";
    }

    if (/android/i.test(userAgent)) {
        return "android";
    }

    return "desktop";
}

const iosSteps = [
    { icon: Share, text: "Ouvrez le menu Partager (carré avec flèche vers le haut)" },
    { icon: Plus, text: 'Sélectionnez "Sur l\'écran d\'accueil"' },
    { icon: CheckCircle2, text: 'Appuyez sur "Ajouter" pour confirmer' },
];

const androidSteps = [
    { icon: MoreVertical, text: "Ouvrez le menu (trois points en haut à droite)" },
    { icon: Download, text: 'Sélectionnez "Ajouter à l\'écran d\'accueil"' },
    { icon: CheckCircle2, text: 'Confirmez en appuyant sur "Ajouter"' },
];

export function MobileInstallModal({ open, onOpenChange }: MobileInstallModalProps) {
    const [platform, setPlatform] = useState<Platform>("desktop");
    const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");

    useEffect(() => {
        const detected = detectPlatform();
        setPlatform(detected);
        if (detected === "ios" || detected === "android") {
            setActiveTab(detected);
        }
    }, []);

    const steps = activeTab === "ios" ? iosSteps : androidSteps;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" data-testid="modal-mobile-install">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Installer l'application
                    </DialogTitle>
                    <DialogDescription>
                        Ajoutez Edesio à votre écran d'accueil pour un accès rapide
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {platform === "desktop" && (
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <Button
                                variant={activeTab === "ios" ? "default" : "ghost"}
                                size="sm"
                                className="flex-1"
                                onClick={() => setActiveTab("ios")}
                                data-testid="button-tab-ios"
                            >
                                <SiApple className="h-4 w-4 mr-2" />
                                iPhone / iPad
                            </Button>
                            <Button
                                variant={activeTab === "android" ? "default" : "ghost"}
                                size="sm"
                                className="flex-1"
                                onClick={() => setActiveTab("android")}
                                data-testid="button-tab-android"
                            >
                                <SiAndroid className="h-4 w-4 mr-2" />
                                Android
                            </Button>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-4 border border-primary/10">
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            {activeTab === "ios" ? (
                                <>
                                    <SiApple className="h-4 w-4" />
                                    Instructions pour Safari
                                </>
                            ) : (
                                <>
                                    <SiAndroid className="h-4 w-4" />
                                    Instructions pour Chrome
                                </>
                            )}
                        </h4>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <step.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span>{step.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                        <p className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>
                                L'application fonctionne comme une app native : accès rapide, plein écran, et bientôt des notifications !
                            </span>
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                        data-testid="button-close-install-modal"
                    >
                        Compris, merci !
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function MobileInstallBanner({ onOpenModal }: { onOpenModal: () => void }) {
    const [dismissed, setDismissed] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [platform, setPlatform] = useState<Platform>("desktop");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        setIsStandalone(standalone);
        setPlatform(detectPlatform());

        const wasDismissed = localStorage.getItem("edesio_install_dismissed");
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem("edesio_install_dismissed", "true");
    };

    if (dismissed || isStandalone) {
        return null;
    }

    return (
        <div
            className="bg-gradient-to-r from-primary/10 to-violet-500/10 border-b border-primary/20 px-4 py-2"
            data-testid="banner-mobile-install"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-sm truncate">
                        {platform === "desktop"
                            ? "Installez Edesio sur votre téléphone !"
                            : "Installez l'app sur votre écran d'accueil !"}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                        size="sm"
                        variant="default"
                        onClick={onOpenModal}
                        data-testid="button-show-install-instructions"
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Installer
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        data-testid="button-dismiss-install-banner"
                    >
                        Plus tard
                    </Button>
                </div>
            </div>
        </div>
    );
}
