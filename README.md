# Clinique Croix Bleue — Frontend React

Site vitrine + écrans d'authentification de la plateforme de gestion des rendez-vous médicaux.
Mémoire de fin de cycle — L3 Génie Logiciel, ISI Dakar.

## Stack
- React 18 + Vite
- React Router 6 (`/`, `/connexion`, `/inscription`)
- CSS custom (palette : #007BFF / #28A745, police Poppins)

## Démarrer
```bash
npm install
npm run dev        # http://localhost:5173
```

## Structure
```
src/
  pages/       Home, Login, Register
  components/  Header, Hero, Services, Doctors, Highlights,
               Social (Témoignages/Partenaires/Actualités),
               Gallery, Faq, Contact, Footer, AuthPanel
  styles/      site.css, auth.css
public/logos/  logos partenaires (AXA, Askia, SUNU, NSIA, Reliance, CMU)
```

## Fonctionnalités déjà interactives
- Recherche de médecins par nom + filtre par spécialité
- Pagination fonctionnelle de la galerie
- FAQ en accordéon
- Formulaires avec points d'entrée `TODO` vers l'API Laravel (Sanctum)

## Prochaines étapes
1. API Laravel 11 : auth Sanctum + middleware de rôles (Patient/Médecin/Secrétaire/Admin)
2. Module de prise de rendez-vous côté patient
3. Dashboards Médecin, Secrétaire, Administrateur
