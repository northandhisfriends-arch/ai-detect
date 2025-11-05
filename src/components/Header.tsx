import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from 'react-i18next'; // 👈 Import: Hook for translation
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

// Type definition for the dialog
type DialogType = "account" | "settings" | "about" | "feedback" | "privacy" | null;

const Header = () => {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  
  // ⭐️ Call the translation hook
  const { t, i18n } = useTranslation(); 
  
  // Function to change language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Dialog content (using translation keys)
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

  // Helper to safely access dialog content
  const currentDialogContent = openDialog ? dialogContent[openDialog as keyof typeof dialogContent] : null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Using t() for project name */}
            <div className="text-xl font-bold text-primary">{t('project_name')}</div> 
            
            <nav className="hidden md:flex items-center gap-8">
              {/* Using t() for navigation buttons */}
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

            {/* Language Switch Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-primary border-primary hover:bg-primary/10">
                  <Globe className="h-4 w-4" />
                  {/* Using t() for the language label */}
                  <span className="hidden sm:inline">{t('language')}</span> 
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                
                {/* 🇹🇭 Thailand (Code 'th') - CRITICAL FIX: onClick added */}
                <DropdownMenuItem onClick={() => changeLanguage('th')}>Thailand</DropdownMenuItem> 
                
                {/* 🇺🇸 English (Code 'en') - CRITICAL FIX: onClick added */}
                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem> 
                
                {/* 🇫🇷 French (Code 'fr') - CRITICAL FIX: onClick added */}
                <DropdownMenuItem onClick={() => changeLanguage('fr')}>Français</DropdownMenuItem>
                
                {/* 🇩🇪 German (Code 'de') - CRITICAL FIX: onClick added */}
                <DropdownMenuItem onClick={() => changeLanguage('de')}>Deutsch</DropdownMenuItem>
                
                {/* 🇨🇳 Chinese (Code 'zh') - CRITICAL FIX: onClick added */}
                <DropdownMenuItem onClick={() => changeLanguage('zh')}>中文</DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Dialog Display Section */}
      {currentDialogContent && (
        <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              {/* Using t() for dialog title */}
              <DialogTitle>{t(currentDialogContent.titleKey)}</DialogTitle> 
              {/* Using t() for dialog description */}
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
                >
                  {/* Item list inside dialog */}
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
