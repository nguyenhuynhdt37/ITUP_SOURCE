"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

interface Club {
  id: string;
  name: string;
  description: string;
  mission: string;
  vision: string;
  established_at: string;
  logo_url: string;
  banner_url: string;
  contact_email: string;
  facebook_url: string;
  zalo_url: string;
  discord_url: string;
  legal_doc_url: string;
  legal_doc_number: string;
  issued_by: string;
  issued_date: string;
  head_id: string;
  total_members: number;
  created_at: string;
  updated_at: string;
}

export const useClub = () => {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from("clubs")
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        setClub(data);
      } catch (err) {
        console.log("Error fetching club data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch club data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, []);

  return { club, loading, error };
};
