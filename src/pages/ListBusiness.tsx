import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Building2, Upload, Calendar, MapPin, Phone, Globe, Facebook, Music, DollarSign, Package, Camera, CreditCard, Plus, X } from "lucide-react";

interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  licenseExpiredDate: string;
  address: string;
  towns: string;
  province_district: string;
  zipCode: string;
  website: string;
  facebookPage: string;
  tiktokUrl: string;
  startingPrice: string;
  options: string[];
  productsCatalog: string[];
  onlineShopOption: string;
  paymentOption: string;
}

const BUSINESS_OPTIONS = [
  "Cash on Delivery",
  "Pickup In-Store", 
  "Digital Payments",
  "Next-Day Delivery"
];

const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail Store",
  "Service Business",
  "Healthcare",
  "Beauty & Salon",
  "Technology",
  "Automotive",
  "Real Estate",
  "Education",
  "Entertainment",
  "Other"
];

const PREDEFINED_PRODUCTS = [
  "Espresso Latte",
  "Cappuccino",
  "Cold Brew",
  "Tea",
  "Pastries",
  "Sandwiches"
];

export default function ListBusiness() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [customProducts, setCustomProducts] = useState<string[]>([]);
  const [newProductName, setNewProductName] = useState("");
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    category: "",
    phone: "",
    licenseExpiredDate: "",
    address: "",
    towns: "",
    province_district: "",
    zipCode: "",
    website: "",
    facebookPage: "",
    tiktokUrl: "",
    startingPrice: "",
    options: [],
    productsCatalog: [],
    onlineShopOption: "sure",
    paymentOption: "stripe"
  });

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: checked 
        ? [...prev.options, option]
        : prev.options.filter(opt => opt !== option)
    }));
  };

  const handleProductChange = (product: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productsCatalog: checked 
        ? [...prev.productsCatalog, product]
        : prev.productsCatalog.filter(p => p !== product)
    }));
  };

  const addCustomProduct = () => {
    if (newProductName.trim() && !customProducts.includes(newProductName.trim())) {
      const newProduct = newProductName.trim();
      setCustomProducts(prev => [...prev, newProduct]);
      setFormData(prev => ({
        ...prev,
        productsCatalog: [...prev.productsCatalog, newProduct]
      }));
      setNewProductName("");
    }
  };

  const removeCustomProduct = (product: string) => {
    setCustomProducts(prev => prev.filter(p => p !== product));
    setFormData(prev => ({
      ...prev,
      productsCatalog: prev.productsCatalog.filter(p => p !== product)
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Logo file must be smaller than 1MB. Please choose a smaller file.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      setLogoFile(file);
    }
  };

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      const maxFiles = 3;
      
      // Check file count
      if (files.length > maxFiles) {
        toast({
          title: "Too Many Files",
          description: `You can only select up to ${maxFiles} images.`,
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        toast({
          title: "Files Too Large",
          description: `Each product image must be smaller than 1MB. ${oversizedFiles.length} file(s) exceed this limit.`,
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      setProductImages(files);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Receipt file must be smaller than 1MB. Please choose a smaller file.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your business.",
        variant: "destructive",
      });
      navigate('/auth/signin');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = "";
      let imageUrls: string[] = [];
      let receiptUrl = "";

      // Upload logo if provided
      if (logoFile) {
        const logoPath = `logos/${user.id}/${Date.now()}_${logoFile.name}`;
        logoUrl = await uploadFile(logoFile, 'business-assets', logoPath);
      }

      // Upload product images if provided
      if (productImages.length > 0) {
        const uploadPromises = productImages.map((file, index) => {
          const imagePath = `products/${user.id}/${Date.now()}_${index}_${file.name}`;
          return uploadFile(file, 'business-assets', imagePath);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      // Upload receipt if bank payment option is selected
      if (formData.paymentOption === 'bank' && receiptFile) {
        const receiptPath = `receipts/${user.id}/${Date.now()}_${receiptFile.name}`;
        receiptUrl = await uploadFile(receiptFile, 'business-assets', receiptPath);
      }

      // Create business listing
      const { error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          phone: formData.phone,
          address: formData.address,
          towns: formData.towns,
          province_district: formData.province_district,
          zip_code: formData.zipCode,
          website: formData.website,
          image_url: logoUrl || null,
          facebook_page: formData.facebookPage || null,
          tiktok_url: formData.tiktokUrl || null,
          starting_price: formData.startingPrice || null,
          business_options: formData.options.length > 0 ? formData.options : null,
          products_catalog: formData.productsCatalog.length > 0 ? formData.productsCatalog.join(', ') : null,
          license_expired_date: formData.licenseExpiredDate || null,
          product_images: imageUrls.length > 0 ? imageUrls : null,
          "POS+Website": formData.onlineShopOption === 'sure' ? 1 : 0
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your business has been listed successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error listing business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to list business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to list your business.</p>
          <Button onClick={() => navigate('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">List Your Business</h1>
          <p className="text-lg text-primary font-semibold mb-4">
            POS & Online Website included (14 days free)
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our directory and connect with customers in your area. Fill out the form below to get started.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business, services, and what makes you unique..."
                  rows={4}
                  required
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo</Label>
                <div className="relative">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="logo"
                    className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                  >
                    <Upload className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary group-hover:text-primary/80">
                        Choose Logo File
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 1MB
                      </p>
                    </div>
                  </label>
                </div>
                {logoFile && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-green-700">Selected: {logoFile.name}</p>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div className="space-y-2">
                <Label htmlFor="productImages">Product Images (Max 3)</Label>
                <div className="relative">
                  <input
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductImagesChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="productImages"
                    className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                  >
                    <Camera className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                        Choose Product Images
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Select up to 3 images (PNG, JPG, max 1MB each)
                      </p>
                    </div>
                  </label>
                </div>
                {productImages.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-green-700">
                      Selected: {productImages.length} image(s)
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiredDate">License Expiration Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="licenseExpiredDate"
                      type="date"
                      value={formData.licenseExpiredDate}
                      onChange={(e) => handleInputChange('licenseExpiredDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Store Address *</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.towns}
                      onChange={(e) => handleInputChange('towns', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.province_district}
                      onChange={(e) => handleInputChange('province_district', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Online Presence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookPage">Facebook Page URL</Label>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facebookPage"
                      value={formData.facebookPage}
                      onChange={(e) => handleInputChange('facebookPage', e.target.value)}
                      placeholder="https://facebook.com/yourbusiness"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktokUrl">TikTok URL</Label>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@yourbusiness"
                  />
                </div>
              </div>

              {/* Pricing & Services */}
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startingPrice"
                    value={formData.startingPrice}
                    onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                    placeholder="$25.00"
                  />
                </div>
              </div>

              {/* Business Options */}
              <div className="space-y-4">
                <Label>Business Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUSINESS_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.options.includes(option)}
                        onCheckedChange={(checked) => handleOptionChange(option, checked === true)}
                      />
                      <Label htmlFor={option} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Catalog */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products Catalog
                </Label>
                
                {/* Predefined Products */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select from popular products:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PREDEFINED_PRODUCTS.map((product) => (
                      <div key={product} className="flex items-center space-x-2">
                        <Checkbox
                          id={product}
                          checked={formData.productsCatalog.includes(product)}
                          onCheckedChange={(checked) => handleProductChange(product, checked === true)}
                        />
                        <Label htmlFor={product} className="text-sm font-normal">
                          {product}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Products */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-foreground">Add custom products:</Label>
                  
                  {/* Enhanced Add Product Input */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="Enter your custom product name..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProduct())}
                          className="border-primary/20 bg-background/80 backdrop-blur-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addCustomProduct}
                        disabled={!newProductName.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {newProductName.trim() && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Press Enter or click Add to include "{newProductName.trim()}" in your catalog
                      </div>
                    )}
                  </div>
                  
                  {/* Display Custom Products */}
                  {customProducts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Your Custom Products ({customProducts.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {customProducts.map((product) => (
                          <div
                            key={product}
                            className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary border border-border rounded-lg text-sm transition-all duration-200 hover:shadow-sm"
                          >
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-secondary-foreground">{product}</span>
                            <button
                              type="button"
                              onClick={() => removeCustomProduct(product)}
                              className="ml-1 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Remove product"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Online Shop + POS Option */}
              <div className="space-y-4">
                <Label>Enjoy a free 14-day Online Shop Website and POS. Please also rest assured that you will be informed before your trial expires. Only $10 a month after that, and can cancel anytime.</Label>
                <RadioGroup
                  value={formData.onlineShopOption}
                  onValueChange={(value) => handleInputChange('onlineShopOption', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sure" id="sure" />
                    <Label htmlFor="sure">Sure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe">Maybe Later</Label>
                  </div>
                </RadioGroup>

                {formData.onlineShopOption === 'sure' && (
                  <div className="ml-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Within 48 hours, your online shop website and POS (plus other apps like Inventory and Sales) will be ready. We'll send you the link, login details, and detailed instructions in an email. The total is 10 USD. You can choose the suitable payment options below.
                    </p>
                  </div>
                )}

                {formData.onlineShopOption === 'maybe' && (
                  <div className="ml-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      The total is 10 USD. Please choose the suitable payment options below.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Options *
                </Label>
                <RadioGroup
                  value={formData.paymentOption}
                  onValueChange={(value) => handleInputChange('paymentOption', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe">Stripe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank/Digital Payments</Label>
                  </div>
                </RadioGroup>

                {formData.paymentOption === 'bank' && (
                  <div className="space-y-4 ml-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Please make payment to Bank ABC 1234567, or True Money 610123456
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Upload your receipt *</Label>
                      <div className="relative">
                        <input
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptChange}
                          className="sr-only"
                          required={formData.paymentOption === 'bank'}
                        />
                        <label
                          htmlFor="receipt"
                          className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 cursor-pointer group"
                        >
                          <Upload className="h-5 w-5 text-orange-600 group-hover:text-orange-700 transition-colors" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-orange-700 group-hover:text-orange-800">
                              Choose Receipt File
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              PNG, JPG, or PDF (max 1MB)
                            </p>
                          </div>
                        </label>
                      </div>
                      {receiptFile && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm text-green-700">Selected: {receiptFile.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-6">
                <Button type="submit" disabled={loading} className="w-full max-w-md">
                  {loading ? "Listing Business..." : "List My Business"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}