'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autorizzato' };

  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location_city = formData.get('location_city') as string;
    const location_address = formData.get('location_address') as string;
    const location_country = formData.get('location_country') as string || 'Italia';
    const category_id = formData.get('category_id') as string || null;
    const cin_code = formData.get('cin_code') as string || null;
    const location_lat = formData.get('location_lat') ? Number(formData.get('location_lat')) : null;
    const location_lng = formData.get('location_lng') ? Number(formData.get('location_lng')) : null;

    const price_per_night = Number(formData.get('price_per_night'));
    const cleaning_fee = Number(formData.get('cleaning_fee') || 0);
    const max_guests = Number(formData.get('max_guests') || 2);
    const bedrooms = Number(formData.get('bedrooms') || 1);
    const bathrooms = Number(formData.get('bathrooms') || 1);
    const beds = Number(formData.get('beds') || 1);
    const min_nights = Number(formData.get('min_nights') || 1);

    const amenities = JSON.parse(formData.get('amenities') as string || '[]');
    const seasonal_prices = JSON.parse(formData.get('seasonal_prices') as string || '[]');

    const coverImageFile = formData.get('cover_image') as File | null;
    const galleryFiles = formData.getAll('gallery') as File[];

    let cover_image_url = null;
    let images_urls: string[] = [];

    if (coverImageFile && coverImageFile.size > 0) {
      const fileName = `${user.id}-${Date.now()}-cover.${coverImageFile.name.split('.').pop()}`;
      const { data } = await supabase.storage.from('properties').upload(fileName, coverImageFile);
      if (data) cover_image_url = supabase.storage.from('properties').getPublicUrl(fileName).data.publicUrl;
    }

    for (const file of galleryFiles) {
      if (file.size > 0) {
        const fileName = `${user.id}-${Date.now()}-g-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { data } = await supabase.storage.from('properties').upload(fileName, file);
        if (data) images_urls.push(supabase.storage.from('properties').getPublicUrl(fileName).data.publicUrl);
      }
    }

    const { data: property, error } = await supabase.from('properties').insert({
      host_id: user.id,
      title, description, location_city, location_address, location_country,
      location_lat, location_lng, cin_code,
      category_id, price_per_night, cleaning_fee, max_guests, bedrooms, bathrooms, beds, min_nights,
      amenities, cover_image: cover_image_url, images: images_urls,
      is_published: true
    }).select().single();

    if (error) throw error;

    // Handle Seasonal Prices
    if (seasonal_prices && seasonal_prices.length > 0) {
      const pricesToInsert = seasonal_prices.map((p: any) => ({
        property_id: property.id,
        start_date: p.start_date,
        end_date: p.end_date,
        price: p.price,
        label: p.label
      }));
      await supabase.from('seasonal_prices').insert(pricesToInsert);
    }
    revalidatePath('/dashboard');
    return { success: true, propertyId: property.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorizzato' };

  try {
    const existingImages = JSON.parse(formData.get('existing_images') as string || '[]');
    const galleryFiles = formData.getAll('gallery') as File[];
    const featuredImageFile = formData.get('cover_image') as File | null;

    let images_urls = [...existingImages];
    let cover_image_url = formData.get('existing_cover_image') as string || null;

    // Upload new cover if provided
    if (featuredImageFile && featuredImageFile.size > 0) {
      const fileName = `${user.id}-${Date.now()}-cover.${featuredImageFile.name.split('.').pop()}`;
      const { data } = await supabase.storage.from('properties').upload(fileName, featuredImageFile);
      if (data) {
        cover_image_url = supabase.storage.from('properties').getPublicUrl(fileName).data.publicUrl;
      }
    }

    // Upload new gallery photos
    for (const file of galleryFiles) {
      if (file.size > 0) {
        const fileName = `${user.id}-${Date.now()}-g-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { data } = await supabase.storage.from('properties').upload(fileName, file);
        if (data) {
          images_urls.push(supabase.storage.from('properties').getPublicUrl(fileName).data.publicUrl);
        }
      }
    }

    const amenities = JSON.parse(formData.get('amenities') as string || '[]');

    const updateData: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      location_city: formData.get('location_city'),
      location_address: formData.get('location_address'),
      cin_code: formData.get('cin_code') || null,
      location_lat: formData.get('location_lat') ? Number(formData.get('location_lat')) : null,
      location_lng: formData.get('location_lng') ? Number(formData.get('location_lng')) : null,
      price_per_night: Number(formData.get('price_per_night')),
      cleaning_fee: Number(formData.get('cleaning_fee')),
      max_guests: Number(formData.get('max_guests')),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      beds: Number(formData.get('beds')),
      min_nights: Number(formData.get('min_nights')),
      amenities,
      images: images_urls,
      cover_image: cover_image_url
    };

    const { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('host_id', user.id);

    if (error) throw error;

    // Handle Blocked Dates sync
    const blockedDatesJson = formData.get('blocked_dates');
    if (blockedDatesJson) {
      const blockedDates = JSON.parse(blockedDatesJson as string);
      
      // Delete old blocks
      await supabase.from('blocked_dates').delete().eq('property_id', propertyId);
      
      // Insert new blocks
      if (blockedDates.length > 0) {
        const toInsert = blockedDates.map((d: string) => ({
          property_id: propertyId,
          date: d.split('T')[0] // Format for DATE column
        }));
        await supabase.from('blocked_dates').insert(toInsert);
      }
    }

    // Handle Seasonal Prices if provided
    const seasonalPricesJson = formData.get('seasonal_prices');
    if (seasonalPricesJson) {
      const seasonalPrices = JSON.parse(seasonalPricesJson as string);
      
      // Delete old ones first
      await supabase.from('seasonal_prices').delete().eq('property_id', propertyId);
      
      // Insert new ones
      if (seasonalPrices.length > 0) {
        const pricesToInsert = seasonalPrices.map((p: any) => ({
          property_id: propertyId,
          start_date: p.start_date,
          end_date: p.end_date,
          price: p.price,
          label: p.label
        }));
        await supabase.from('seasonal_prices').insert(pricesToInsert);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath(`/property/${propertyId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPropertiesByHost() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, seasonal_prices(*), blocked_dates(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function addSeasonalPrice(propertyId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase.from('seasonal_prices').insert({
    property_id: propertyId,
    ...data
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/property/${propertyId}`);
  return { success: true };
}

export async function deleteSeasonalPrice(id: string, propertyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('seasonal_prices').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/property/${propertyId}`);
  return { success: true };
}

export async function archiveProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorizzato' };

  try {
    const { error } = await supabase
      .from('properties')
      .update({ status: 'deleted', is_published: false })
      .eq('id', propertyId)
      .eq('host_id', user.id);

    if (error) throw error;
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
