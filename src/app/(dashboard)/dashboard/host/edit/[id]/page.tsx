'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Loader2, UploadCloud, 
  MapPin, Info, Home, Wifi, Utensils, 
  Car, Waves, Wind, Tv, RefreshCw, Briefcase, Sunset, Euro,
  ChevronRight, Sparkles, Plus, Camera, Calendar as CalendarIcon
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { MapPicker } from '@/components/property/MapPicker';
import { updateProperty, getPropertyById } from '@/app/actions/property';
import { SeasonalPriceManager } from '@/components/property/SeasonalPriceManager';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const AMENITIES = [
  { id: 'wifi', label: 'WiFi Veloce', icon: Wifi },
  { id: 'kitchen', label: 'Cucina', icon: Utensils },
  { id: 'parking', label: 'Parcheggio', icon: Car },
  { id: 'pool', label: 'Piscina', icon: Waves },
  { id: 'ac', label: 'Clima', icon: Wind },
  { id: 'tv', label: 'Smart TV', icon: Tv },
  { id: 'washer', label: 'Lavatrice', icon: RefreshCw },
  { id: 'workspace', label: 'Lavoro', icon: Briefcase },
  { id: 'sea_view', label: 'Vista Mare', icon: Sunset }
];

const STEPS = [
  { id: 'base', title: 'Informazioni Base', icon: Home },
  { id: 'location', title: 'Posizione', icon: MapPin },
  { id: 'details', title: 'Dettagli & Prezzi', icon: Euro },
  { id: 'amenities', title: 'Servizi', icon: Sparkles },
  { id: 'photos', title: 'Foto', icon: UploadCloud },
  { id: 'availability', title: 'Disponibilità', icon: CalendarIcon }
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<any[]>([]);
  
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    location_city: '',
    location_address: '',
    location_country: 'Italia',
    location_lat: 41.9028,
    location_lng: 12.4964,
    cin_code: '',
    price_per_night: '',
    cleaning_fee: '0',
    max_guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    beds: '1',
    min_nights: '1',
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsVerifying(false);
        router.push('/login');
        return;
      }

      // Fetch Property
      const property = await getPropertyById(propertyId);
      if (!property || property.host_id !== user.id) {
        setIsVerifying(false);
        router.push('/dashboard');
        return;
      }

      setFormData({
        title: property.title || '',
        description: property.description || '',
        category_id: property.category_id || '',
        location_city: property.location_city || '',
        location_address: property.location_address || '',
        location_country: property.location_country || 'Italia',
        location_lat: property.location_lat || 41.9028,
        location_lng: property.location_lng || 12.4964,
        cin_code: property.cin_code || '',
        price_per_night: String(property.price_per_night || ''),
        cleaning_fee: String(property.cleaning_fee || '0'),
        max_guests: String(property.max_guests || '2'),
        bedrooms: String(property.bedrooms || '1'),
        bathrooms: String(property.bathrooms || '1'),
        beds: String(property.beds || '1'),
        min_nights: String(property.min_nights || '1'),
      });
      setAmenities(property.amenities || []);
      setSeasonalPrices(property.seasonal_prices || []);
      setCoverUrl(property.cover_image);
      setExistingImages(property.images || []);
      setBlockedDates((property.blocked_dates || []).map((b: any) => new Date(b.date)));

      const { data: cats } = await supabase.from('categories').select('id, name');
      if (cats) setCategories(cats);
      
      setIsVerifying(false);
    };

    if (propertyId) fetchData();
  }, [propertyId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLatLngChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, location_lat: lat, location_lng: lng }));
  };

  const handleAmenityToggle = (id: string) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const finalFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => finalFormData.append(key, String(value)));
      finalFormData.append('amenities', JSON.stringify(amenities));
      finalFormData.append('seasonal_prices', JSON.stringify(seasonalPrices));
      
      // Fix for Timezone shifting: Format as strictly YYYY-MM-DD local before saving
      finalFormData.append('blocked_dates', JSON.stringify(blockedDates.map(d => format(d, 'yyyy-MM-dd'))));
      
      // Photos
      finalFormData.append('existing_images', JSON.stringify(existingImages));
      if (newCoverFile) finalFormData.append('cover_image', newCoverFile);
      if (coverUrl) finalFormData.append('existing_cover_image', coverUrl);
      
      newGalleryFiles.forEach(file => finalFormData.append('gallery', file));

      const result = await updateProperty(propertyId, finalFormData);

      setLoading(false);

      if (result.success) {
        router.push(`/dashboard`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento.');
      }
    } catch (err) {
      setError('Errore critico di comunicazione col server.');
      setLoading(false);
    }
  };

  if (isVerifying) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary pb-20 overflow-x-hidden">
      <div className="bg-bg-surface border-b border-border mb-12">
        <div className="container mx-auto px-4 py-8">
          <Link href="/dashboard" className="text-text-secondary hover:text-white flex items-center gap-2 mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Annulla modifiche
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-3">
                <RefreshCw className="text-accent-gold w-8 h-8" />
                Modifica Annuncio
              </h1>
              <p className="text-text-secondary">Aggiorna i dettagli della tua proprietà "{formData.title}".</p>
            </div>

            <div className="flex gap-2">
              {STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className={cn(
                    "w-12 h-1.5 rounded-full transition-all duration-500",
                    index <= currentStep ? "bg-accent-gold" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-bg-surface/50 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* STEP 0: BASE INFO */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Informazioni Base</h2>
                  <p className="text-text-secondary text-sm">Modifica il titolo, la categoria e il codice CIN.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Titolo dell'annuncio</Label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="bg-bg-primary/50 border-border h-14 rounded-xl text-lg focus:ring-accent-gold/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Categoria</Label>
                       <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange as any}
                        className="w-full bg-bg-primary/50 border border-border h-14 rounded-xl px-4 text-white focus:ring-accent-gold outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Seleziona categoria</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-white text-sm">Codice CIN (Opzionale)</Label>
                       <Input name="cin_code" value={formData.cin_code} onChange={handleInputChange} placeholder="Es. CIN12345" className="bg-bg-primary/50 border-border h-14 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">Descrizione</Label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="bg-bg-primary/50 border-border rounded-xl min-h-[150px] focus:ring-accent-gold/50 py-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCATION */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Posizione</h2>
                  <p className="text-text-secondary text-sm">Aggiorna l'indirizzo e la posizione sulla mappa.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-white text-sm">Città</Label>
                        <Input name="location_city" value={formData.location_city} onChange={handleInputChange} className="bg-bg-primary/50 border-border h-14 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white text-sm">Indirizzo</Label>
                        <Input name="location_address" value={formData.location_address} onChange={handleInputChange} className="bg-bg-primary/50 border-border h-14 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm">Posizionamento Preciso</Label>
                    <MapPicker
                      initialLat={formData.location_lat}
                      initialLng={formData.location_lng}
                      onChange={handleLatLngChange}
                    />
                    <p className="text-[10px] text-text-secondary italic mt-2 text-right">Coordinate: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS & PRICES */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Capacità e Prezzi</h2>
                  <p className="text-text-secondary text-sm">Aggiorna i parametri di accoglienza e i costi.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Ospiti', name: 'max_guests' },
                    { label: 'Camere', name: 'bedrooms' },
                    { label: 'Letti', name: 'beds' },
                    { label: 'Bagni', name: 'bathrooms' },
                    { label: 'Min. Notti', name: 'min_nights' }
                  ].map(field => (
                    <div key={field.name} className="space-y-2">
                      <Label className="text-xs text-text-secondary uppercase tracking-wider">{field.label}</Label>
                      <Input 
                        type="number" 
                        name={field.name} 
                        value={(formData as any)[field.name]} 
                        onChange={handleInputChange}
                        className="bg-bg-primary/50 border-border h-12 text-center rounded-lg" 
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="p-6 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl">
                    <Label className="text-accent-gold font-bold flex items-center gap-2 mb-3">
                      <Euro className="w-4 h-4" /> Prezzo base per notte
                    </Label>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">€</span>
                        <Input 
                            type="number" 
                            name="price_per_night" 
                            value={formData.price_per_night}
                            onChange={handleInputChange}
                            className="bg-bg-primary/30 border-accent-gold/20 h-14 text-2xl font-bold rounded-xl" 
                        />
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <Label className="text-white font-bold mb-3 block">Costo Pulizie (fisso)</Label>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-text-secondary">€</span>
                        <Input 
                            type="number" 
                            name="cleaning_fee" 
                            value={formData.cleaning_fee}
                            onChange={handleInputChange}
                            className="bg-bg-primary/30 border-white/10 h-14 text-2xl font-bold rounded-xl" 
                        />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <h3 className="text-xl font-bold text-white mb-6">Prezzi Stagionali</h3>
                  <SeasonalPriceManager 
                    prices={seasonalPrices} 
                    onChange={setSeasonalPrices} 
                  />
                </div>
              </div>
            )}

            {/* STEP 3: AMENITIES */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Servizi</h2>
                  <p className="text-text-secondary text-sm">Aggiorna la lista dei servizi offerti.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map(item => {
                    const Icon = item.icon;
                    const isSelected = amenities.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAmenityToggle(item.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected 
                            ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                            : "bg-bg-primary/30 border-border text-text-secondary hover:border-white/20 hover:text-white"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? "text-black" : "text-white/40")} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: PHOTOS */}
            {currentStep === 4 && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Galleria Fotografica</h2>
                  <p className="text-text-secondary text-sm">Gestisci le foto del tuo annuncio. La prima foto sarà quella di copertina.</p>
                </div>

                {/* Cover Image */}
                <div className="space-y-4">
                  <Label className="text-white font-bold">Foto di Copertina</Label>
                  <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-border hover:border-accent-gold/50 transition-all">
                    {coverUrl || newCoverFile ? (
                      <>
                        <img 
                          src={newCoverFile ? URL.createObjectURL(newCoverFile) : coverUrl!} 
                          alt="Cover" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                           <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                             <RefreshCw className="w-4 h-4" /> Cambia Copertina
                             <input 
                               type="file" 
                               className="hidden" 
                               accept="image/*" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) setNewCoverFile(file);
                               }} 
                             />
                           </label>
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <Camera className="w-12 h-12 text-text-secondary mb-3" />
                        <span className="text-text-secondary font-medium">Carica Copertina</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setNewCoverFile(file);
                          }} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Gallery */}
                <div className="space-y-4">
                  <Label className="text-white font-bold">Altre Foto</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* New Files */}
                    {newGalleryFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-accent-gold/40 group">
                        <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-accent-gold text-black text-[10px] px-2 py-0.5 rounded font-bold">NEW</div>
                      </div>
                    ))}

                    {/* Add Button */}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-accent-gold/50 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/5">
                      <Plus className="w-6 h-6 text-text-secondary" />
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setNewGalleryFiles(prev => [...prev, ...files]);
                        }} 
                      />
                    </label>
                  </div>
                </div>

                {error && <p className="text-error text-center bg-error/10 p-4 rounded-xl text-sm font-bold border border-error/20">{error}</p>}
              </div>
            )}

            {/* STEP 5: AVAILABILITY (MANUAL BLOCKING) */}
            {currentStep === 5 && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Gestione Disponibilità</h2>
                  <p className="text-text-secondary text-sm">Seleziona le date in cui il tuo alloggio NON deve essere disponibile per la prenotazione (es. per manutenzione o uso personale).</p>
                </div>

                <div className="bg-bg-primary/30 border border-border rounded-3xl p-6 md:p-10 flex flex-col items-center">
                  <Calendar
                    mode="multiple"
                    selected={blockedDates}
                    onSelect={(dates) => setBlockedDates(dates || [])}
                    min={0}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-0 border-none scale-110"
                    numberOfMonths={1}
                  />
                  
                  <div className="mt-12 w-full pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-text-secondary">Date bloccate:</span>
                       <span className="text-white font-bold">{blockedDates.length}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setBlockedDates([])}
                      className="w-full border-white/10 hover:bg-white/5 text-text-secondary"
                    >
                      Sblocca tutte le date
                    </Button>
                  </div>
                </div>

                <div className="bg-accent-gold/5 border border-accent-gold/20 p-6 rounded-2xl flex items-start gap-4">
                   <Info className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                   <p className="text-xs text-text-secondary leading-relaxed">
                     Le date selezionate appariranno come "Impegnato" nel calendario pubblico e non potranno essere selezionate dagli ospiti per nuove prenotazioni.
                   </p>
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
              <Button 
                onClick={prevStep} 
                disabled={currentStep === 0 || loading}
                variant="ghost" 
                className="text-text-secondary hover:text-white"
              >
                Indietro
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button 
                    onClick={nextStep} 
                    className="bg-white text-black hover:bg-neutral-200 px-8 py-6 rounded-2xl font-bold flex items-center gap-2"
                >
                  Continua <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !formData.title}
                    className="bg-accent-gold text-black hover:bg-[#d4b568] px-10 py-6 rounded-2xl font-bold flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Salva Modifiche</>}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
