import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Building2, Search, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyActions } from './PropertyActions';
import Link from 'next/link';

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  
  const { data: properties } = await supabase
    .from('properties')
    .select('*, host:profiles!properties_host_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestione Proprietà</h1>
          <p className="text-text-secondary mt-1">Monitora e approva gli annunci pubblicati dagli host.</p>
        </div>
        <div className="bg-bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-2">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Cerca per titolo o città..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-text-secondary/50 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {properties?.map((property: any) => (
          <Card key={property.id} className="bg-bg-surface border-border overflow-hidden hover:border-white/10 transition-colors">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center">
                {/* Image */}
                <div className="w-full md:w-48 h-32 relative shrink-0">
                  <img 
                    src={property.cover_image || '/placeholder.jpg'} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                  {!property.is_published && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold border border-accent-gold/30 px-2 py-1 rounded">In attesa</span>
                    </div>
                  )}
                  {property.is_featured && property.is_published && (
                    <div className="absolute top-2 left-2 bg-accent-gold text-black px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg">In Evidenza</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6 w-full">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg tracking-tight">{property.title}</h3>
                      <Link href={`/property/${property.id}`} target="_blank">
                        <ExternalLink className="w-4 h-4 text-text-secondary hover:text-accent-gold transition-colors" />
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {property.location_city}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Host: {property.host?.full_name}</span>
                      <span className="font-bold text-white">€{property.price_per_night}/notte</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <PropertyActions propertyId={property.id} isPublished={property.is_published} isFeatured={property.is_featured || false} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!properties || properties.length === 0) && (
          <div className="p-12 text-center text-text-secondary bg-white/5 rounded-2xl border border-dashed border-border">
            Nessuna proprietà presente nel sistema.
          </div>
        )}
      </div>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
