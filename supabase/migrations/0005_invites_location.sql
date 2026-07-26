-- Ajouter la colonne location_id à la table invites
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE;

-- Mettre à jour les politiques RLS pour les invites (si nécessaire)
-- Les politiques existantes devraient suffire car elles utilisent généralement organization_id
