const Footer = () => {
  return (
    <footer className="bg-footer-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Company Group Info */}
          <div className="mb-6">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-primary">
                Welcome To YaYou!
              </h2>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              Sister platforms offering services across Thailand and SG.
            </p>
            
            {/* Service Logos */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <a 
                href="https://drive.google.com/uc?export=download&id=1K9z2nmPiv05M_MCCCYNryHycb8lZymOK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                YaYou App
              </a>
              
              <span className="text-sm text-muted-foreground">|</span>
              
              <a 
                href="https://www.golocalsg.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                <span className="text-muted-foreground">GoLocalSG</span>
                <span className="text-green-600">.com</span>
              </a>
              
              <span className="text-sm text-muted-foreground">|</span>
              
              <a 
                href="https://www.booknget.asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                <span className="text-muted-foreground">BooknGet</span>
                <span className="text-green-600">.asia</span>
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              GoLocalSG.com and MyanShops(YaYou App) are your AI-powered platforms and mobile app for booking services, offering your own services to earn money, discovering products, and managing your business online.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;