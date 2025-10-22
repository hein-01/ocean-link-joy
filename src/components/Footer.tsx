const Footer = () => {
  return (
    <footer className="bg-footer-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Company Group Info */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="text-2xl font-bold text-primary mr-2">
                Business
              </div>
              <div className="text-2xl font-light text-muted-foreground">
                Directory Group
              </div>
            </div>
            
            {/* Service Logos */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-sm font-medium text-foreground">BusinessFinder</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <span className="text-sm font-medium text-foreground">Directory.com</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Directory.com is part of Business Directory Group Limited, one of the world's leading providers of business discovery services.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;