import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fonction utilitaire pour combiner les classes CSS
 * Évite les conflits de classes Tailwind
 * 
 * Exemple : cn("bg-blue-500", "bg-red-500") → "bg-red-500" (la dernière gagne)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}