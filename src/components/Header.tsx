import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type DialogType = "account" | "settings" | "about" | "feedback" | "privacy" | null;

const sectionIdMap: Record<string, string> = {
    "Introduction": "introduction",
    "Objectives": "objectives",
    "Process": "process",
    "How it works": "how",
    "Developers": "developers",
};

const logoUrl = "https://github.com/northandhisfriends-arch/ai-detect/blob/main/src/assets/logo.png?raw=true";

const Header = () => {
    const [openDialog, setOpenDialog] = useState<DialogType>(null);
    const { t, i18n } = useTranslation();
    
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleNavigation = (sectionName: string) => {
        const id = sectionIdMap[sectionName];
        if (id) {
            setOpenDialog(null);

            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // ปรับ URL Hash ให้ถูกต้องตามชื่อส่วน (เช่น #introduction)
                    window.history.pushState(null, '', `#${id}`);
                }
            }, 100); 
        }
    };

    const dialogContent = {
        account: {
            titleKey: "account",
            descriptionKey: "dialog_account_desc",
            items: ["Profile Settings", "History", "Acount Settings", "Notifications"],
        },
        settings: {
            titleKey: "settings",
            descriptionKey: "dialog_settings_desc",
            items: ["General Settings", "Display Options", "Advanced"],
        },
        about: {
            titleKey: "about_us",
            descriptionKey: "dialog_about_desc",
            items: ["Introduction", "Objectives", "Process", "How it works", "Developers"],
        },
        feedback: {
            titleKey: "feedback",
            descriptionKey: "dialog_feedback_desc",
            items: ["Submit Feedback", "Report an Issue", "Feature Request", "Customer Support"],
        },
        privacy: {
            titleKey: "privacy_policy",
            descriptionKey: "dialog_privacy_desc",
            items: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Data Protection"],
        },
    };

    const currentDialogContent = openDialog ? dialogContent[openDialog as keyof typeof dialogContent] : null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        
                        <a href="/" className="flex items-center space-x-2">
                            <img 
                                src={logoUrl} 
                                alt={t('project_name') + " Logo"} 
                                className="h-10 w-auto" 
                            />
                            <span className="text-xl font-bold text-primary">{t('project_name')}</span>
                        </a>
                        
                        <nav className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => setOpenDialog("account")}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('account')}
                            </button>
                            <button
                                onClick={() => setOpenDialog("settings")}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('settings')}
                            </button>
                            <button
                                onClick={() => setOpenDialog("about")}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('about_us')}
                            </button>
                            <button
                                onClick={() => setOpenDialog("feedback")}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('feedback')}
                            </button>
                            <button
                                onClick={() => setOpenDialog("privacy")}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('privacy_policy')}
                            </button>
                        </nav>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 text-primary border-primary hover:bg-primary/10">
                                    <Globe className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('language')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem onClick={() => changeLanguage('th')}>Thailand</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('fr')}>Français</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('de')}>Deutsch</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('zh')}>中文</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {currentDialogContent && (
                <Dialog open={!!openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t(currentDialogContent.titleKey)}</DialogTitle>
                            <DialogDescription>
                                {t(currentDialogContent.descriptionKey)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                            {currentDialogContent.items.map((item) => (
                                <Button
                                    key={item}
                                    variant="outline"
                                    className="justify-start"
                                    onClick={openDialog === 'about' ? () => handleNavigation(item) : undefined}
                                >
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default Header;
