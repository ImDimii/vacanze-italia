'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronRight, Sparkles, Plus, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapPicker } from '@/components/property/MapPicker';
import { createProperty } from '@/app/actions/property';
import { SeasonalPriceManager } from '@/components/property/SeasonalPriceManager';

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
  { id: 'photos', title: 'Foto', icon: UploadCloud }
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<any[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Form State
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
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, host_status')
        .eq('id', user.id)
        .single();

      if (profile?.host_status === 'approved' || profile?.role === 'admin') {
        setIsApproved(true);
      } else {
        router.push('/dashboard');
      }
      setIsVerifying(false);

      const { data: cats } = await supabase.from('categories').select('id, name');
      if (cats) setCategories(cats);
    };

    checkAuth();
  }, [router]);

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

      if (coverFile) finalFormData.append('cover_image', coverFile);
      galleryFiles.forEach(file => finalFormData.append('gallery', file));

      const result = await createProperty(finalFormData);

      setLoading(false);

      if (result.success) {
        router.push(`/dashboard`);
      } else {
        setError(result.error || 'Errore durante la creazione della proprietà. Controlla che il form sia compilato correttamente.');
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
            <ArrowLeft className="w-4 h-4" /> Esci dalla creazione
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="text-accent-gold w-8 h-8" />
                Crea il tuo annuncio
              </h1>
              <p className="text-text-secondary">Pochi passaggi per rendere la tua proprietà visibile a tutti.</p>
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
                  <h2 className="text-2xl font-bold text-white">Iniziamo dalle basi</h2>
                  <p className="text-text-secondary text-sm">Dai un titolo accattivante e una descrizione dettagliata alla tua proprietà.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Titolo dell'annuncio</Label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Es. Villa Splendida con Vista Mare"
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
                        placeholder="Descrivi la casa, i dintorni e cosa la rende unica..."
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
                  <h2 className="text-2xl font-bold text-white">Dove si trova?</h2>
                  <p className="text-text-secondary text-sm">Indica la posizione e trascina il pin sulla mappa per la massima precisione.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-white text-sm">Città</Label>
                        <Input name="location_city" value={formData.location_city} onChange={handleInputChange} placeholder="Es. Roma" className="bg-bg-primary/50 border-border h-14 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white text-sm">Indirizzo</Label>
                        <Input name="location_address" value={formData.location_address} onChange={handleInputChange} placeholder="Via Roma, 1" className="bg-bg-primary/50 border-border h-14 rounded-xl" />
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
                  <p className="text-text-secondary text-sm">Definisci quanti ospiti puoi accogliere e il prezzo base.</p>
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
                            placeholder="0" 
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
                            placeholder="0" 
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
                  <h2 className="text-2xl font-bold text-white">Cosa offri?</h2>
                  <p className="text-text-secondary text-sm">Seleziona i servizi disponibili nella tua struttura.</p>
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
                  <h2 className="text-2xl font-bold text-white text-center">Rendila indimenticabile</h2>
                  <p className="text-text-secondary text-sm text-center">Le foto sono il fattore più importante per gli ospiti.</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                    <Label className="text-white font-medium text-center block">Immagine di Copertina</Label>
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-border hover:border-accent-gold transition-colors flex flex-col items-center justify-center bg-bg-primary/50 group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      {coverFile ? (
                         <div className="absolute inset-0">
                            <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCw className="text-white w-8 h-8" />
                            </div>
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-accent-gold/10 flex items-center justify-center">
                            <UploadCloud className="w-7 h-7 text-accent-gold" />
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">Carica Copertina</p>
                            <p className="text-xs text-text-secondary mt-1">Trascina qui la foto principale</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white font-medium text-center block">Galleria (consigliata)</Label>
                    <div className="relative border-2 border-dashed border-border hover:border-white/20 rounded-2xl p-6 text-center bg-bg-primary/20 transition-all">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <p className="text-sm font-medium text-text-secondary flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> 
                        {galleryFiles.length > 0 ? `${galleryFiles.length} foto selezionate` : "Aggiungi altre foto"}
                      </p>
                    </div>
                  </div>
                </div>

                {error && <p className="text-error text-center bg-error/10 p-4 rounded-xl text-sm font-bold border border-error/20">{error}</p>}
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
                    disabled={loading || !coverFile || !formData.title}
                    className="bg-accent-gold text-black hover:bg-[#d4b568] px-10 py-6 rounded-2xl font-bold flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Pubblica Ora</>}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
