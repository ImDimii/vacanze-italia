'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, UploadCloud, UserCircle, Building2, Save, ShieldAlert, 
  Lock, Trash2, CheckCircle2, AlertCircle, CreditCard, Settings, 
  User, ChevronRight, Heart
} from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { changePassword, deleteAccount } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCard } from '@/components/property/PropertyCard';

interface ProfileFormProps {
  initialData: any;
  favorites: any[];
}

const TABS = [
  { id: 'personal', label: 'Profilo', icon: User },
  { id: 'favorites', label: 'Preferiti', icon: Heart },
  { id: 'payments', label: 'Pagamenti', icon: CreditCard },
  { id: 'security', label: 'Sicurezza', icon: Lock },
];

export function ProfileForm({ initialData, favorites }: ProfileFormProps) {
  // Check for tab search param or default to 'personal'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
       const params = new URLSearchParams(window.location.search);
       return params.get('tab') || 'personal';
    }
    return 'personal';
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [bankHolder, setBankHolder] = useState(initialData?.bank_holder || '');
  const [bankName, setBankName] = useState(initialData?.bank_name || '');
  const [iban, setIban] = useState(initialData?.iban || '');

  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [delLoading, setDelLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData(e.currentTarget);
      if (avatarFile) formData.append('avatar_file', avatarFile);

      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profilo aggiornato');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      setError('Errore di sistema');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);
    if (result.success) {
      setPassSuccess('Password aggiornata');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setPassSuccess(''), 3000);
    } else {
      setPassError(result.error || 'Errore aggiornamento password');
    }
    setPassLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Eliminare l\'account? Questa azione è IRREVERSIBILE.')) return;
    setDelLoading(true);
    const result = await deleteAccount();
    if (!result.success) {
      setError(result.error || 'Errore eliminazione account');
      setDelLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar - Minimal Nav */}
      <aside className="space-y-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              activeTab === tab.id 
                ? "bg-accent-gold text-black" 
                : "text-text-secondary hover:bg-white/5 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Content Area */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <Card className="bg-bg-surface border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg text-white font-semibold">Informazioni Generali</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl border border-border overflow-hidden bg-bg-primary flex items-center justify-center relative">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-text-secondary opacity-30" />
                          )}
                          <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <UploadCloud className="w-6 h-6 text-white" />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </label>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-2 text-center uppercase tracking-wider">Modifica</p>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="space-y-2">
                          <Label className="text-text-secondary text-xs uppercase tracking-widest">Nome Completo</Label>
                          <Input name="full_name" defaultValue={initialData?.full_name || ''} className="bg-bg-primary border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-text-secondary text-xs uppercase tracking-widest">Telefono</Label>
                          <Input name="phone" defaultValue={initialData?.phone || ''} className="bg-bg-primary border-border" />
                        </div>
                        <div className="space-y-2 col-span-full">
                          <Label className="text-text-secondary text-xs uppercase tracking-widest">Biografia</Label>
                          <Textarea name="bio" defaultValue={initialData?.bio || ''} className="bg-bg-primary border-border min-h-[120px] resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <Button type="submit" disabled={loading} className="bg-accent-gold text-black font-bold px-8 hover:bg-[#d4b568]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva Modifiche'}
                      </Button>
                      {success && <span className="text-success text-sm font-medium">{success}</span>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
               <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white">I Miei Preferiti</h2>
                    <p className="text-text-secondary text-sm">Le case che hai salvato per i tuoi prossimi viaggi.</p>
                </div>
              </div>

              {!favorites || favorites.length === 0 ? (
                <div className="bg-bg-surface border border-dashed border-border rounded-3xl p-12 text-center">
                  <Heart className="w-12 h-12 text-text-secondary opacity-10 mx-auto mb-4" />
                  <p className="text-text-secondary text-sm">Non hai ancora salvato nessuna casa nei preferiti.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map((fav: any) => (
                    <PropertyCard
                      key={fav.id}
                      id={fav.property.id}
                      title={fav.property.title}
                      city={fav.property.location_city}
                      country="Italia"
                      pricePerNight={fav.property.price_per_night}
                      rating={fav.property.rating || 5.0}
                      reviewCount={fav.property.review_count || 0}
                      imageUrls={fav.property.images || []}
                      initialIsFavorite={true}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <Card className="bg-bg-surface border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg text-white font-semibold">Dati Bancari</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-full">
                        <Label className="text-text-secondary text-xs uppercase tracking-widest">Intestatario Conto</Label>
                        <Input name="bank_holder" value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} className="bg-bg-primary border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-text-secondary text-xs uppercase tracking-widest">Nome Banca</Label>
                        <Input name="bank_name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-bg-primary border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-text-secondary text-xs uppercase tracking-widest">IBAN</Label>
                        <Input name="iban" value={iban} onChange={(e) => setIban(e.target.value)} className="bg-bg-primary border-border font-mono uppercase" />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="bg-accent-gold text-black font-bold px-8">
                      Salva Coordinate
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <Card className="bg-bg-surface border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg text-white font-semibold">Sicurezza Account</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <Label className="text-text-secondary text-xs uppercase tracking-widest">Nuova Password</Label>
                      <Input name="password" type="password" className="bg-bg-primary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary text-xs uppercase tracking-widest">Conferma Password</Label>
                      <Input name="confirm_password" type="password" className="bg-bg-primary border-border" />
                    </div>
                    <Button type="submit" disabled={passLoading} variant="outline" className="border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-black">
                      Aggiorna Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-error/20 bg-error/5">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold">Elimina Account</h4>
                    <p className="text-sm text-text-secondary">Rimuovi permanentemente il tuo profilo e tutti i dati associati.</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={delLoading} className="bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white font-bold">
                    Elimina Definitivamente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
