CREATE TYPE "public"."account_type" AS ENUM('bancaire', 'mobile_money');--> statement-breakpoint
CREATE TYPE "public"."enclos_status" AS ENUM('occupe', 'vide', 'a_nettoyer', 'en_maintenance');--> statement-breakpoint
CREATE TYPE "public"."enclos_type" AS ENUM('maternite', 'engraissement', 'quarantaine', 'reproducteur_male', 'reproducteur_femelle');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('sain', 'malade', 'en_quarantaine');--> statement-breakpoint
CREATE TYPE "public"."rabbit_sex" AS ENUM('male', 'femelle');--> statement-breakpoint
CREATE TYPE "public"."rabbit_status" AS ENUM('reproducteur', 'engraissement', 'stock_a_vendre', 'vendu', 'decede');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('a_faire', 'en_cours', 'terminee');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('depot', 'retrait', 'virement_interne');--> statement-breakpoint
CREATE TYPE "public"."treatment_status" AS ENUM('en_cours', 'termine', 'interrompu');--> statement-breakpoint
CREATE TABLE "accouplements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"femelle_id" varchar NOT NULL,
	"male_id" varchar NOT NULL,
	"date_accouplement" timestamp NOT NULL,
	"date_mise_bas_prevue" timestamp,
	"succes" boolean,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "achats_lapins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fournisseur_id" varchar,
	"date_achat" timestamp NOT NULL,
	"nombre_lapins" integer NOT NULL,
	"prix_total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aliments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"type" varchar,
	"quantite_stock" numeric(10, 2) DEFAULT '0',
	"unite" varchar DEFAULT 'kg',
	"prix_par_kg" numeric(10, 2),
	"date_reception" date,
	"date_peremption" date,
	"fournisseur_id" varchar,
	"seuil_alerte" numeric(10, 2) DEFAULT '50',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories_depenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"description" text,
	"couleur" varchar DEFAULT '#6b7280',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_depenses_nom_unique" UNIQUE("nom")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"telephone" varchar,
	"email" varchar,
	"adresse" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comptes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"type" "account_type" NOT NULL,
	"numero_compte" varchar,
	"solde_initial" numeric(15, 2) DEFAULT '0',
	"solde_actuel" numeric(15, 2) DEFAULT '0',
	"actif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consommation_aliments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aliment_id" varchar NOT NULL,
	"quantite_consommee" numeric(10, 2) NOT NULL,
	"date_consommation" date NOT NULL,
	"nombre_lapins" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "depenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categorie_id" varchar NOT NULL,
	"montant" numeric(10, 2) NOT NULL,
	"date_depense" timestamp NOT NULL,
	"description" text NOT NULL,
	"fournisseur_id" varchar,
	"facture" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "details_ventes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vente_id" varchar NOT NULL,
	"lapin_id" varchar NOT NULL,
	"poids" numeric(5, 2),
	"prix" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"prenom" varchar NOT NULL,
	"telephone" varchar,
	"email" varchar,
	"adresse" text,
	"role" varchar,
	"date_embauche" date,
	"qualifications" text,
	"solde_epargne" numeric(10, 2) DEFAULT '0',
	"actif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enclos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"type" "enclos_type" NOT NULL,
	"capacite_max" integer NOT NULL,
	"status" "enclos_status" DEFAULT 'vide',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "epargne_salariale" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employe_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"montant" numeric(10, 2) NOT NULL,
	"date_transaction" timestamp NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fournisseurs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"telephone" varchar,
	"email" varchar,
	"adresse" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lapins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifiant" varchar NOT NULL,
	"date_naissance" date,
	"race" varchar,
	"sexe" "rabbit_sex" NOT NULL,
	"couleur" varchar,
	"status" "rabbit_status" DEFAULT 'engraissement',
	"health_status" "health_status" DEFAULT 'sain',
	"pere_id" varchar,
	"mere_id" varchar,
	"enclos_id" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lapins_identifiant_unique" UNIQUE("identifiant")
);
--> statement-breakpoint
CREATE TABLE "materiel" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"type" varchar,
	"quantite_stock" integer DEFAULT 0,
	"etat" varchar DEFAULT 'bon',
	"seuil_alerte" integer DEFAULT 5,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medicaments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"dosage" varchar,
	"unite" varchar,
	"quantite_stock" numeric(10, 2) DEFAULT '0',
	"prix_achat" numeric(10, 2),
	"date_peremption" date,
	"seuil_alerte" numeric(10, 2) DEFAULT '10',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mises_bas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accouplement_id" varchar NOT NULL,
	"date_mise_bas" timestamp NOT NULL,
	"nombre_lapereaux" integer NOT NULL,
	"nombre_morts_nes" integer DEFAULT 0,
	"nombre_survivants_24h" integer,
	"nombre_survivants_48h" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pesees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lapin_id" varchar,
	"portee_id" varchar,
	"date_pesee" timestamp NOT NULL,
	"poids" numeric(5, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mise_bas_id" varchar NOT NULL,
	"identifiant_portee" varchar NOT NULL,
	"date_sevrage_prevue" date,
	"date_sevrage" date,
	"nombre_sevre" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "portees_identifiant_portee_unique" UNIQUE("identifiant_portee")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titre" varchar NOT NULL,
	"description" text,
	"employe_id" varchar,
	"date_limite" timestamp,
	"status" "task_status" DEFAULT 'a_faire',
	"date_completee" timestamp,
	"priorite" varchar DEFAULT 'normale',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "traitements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lapin_id" varchar NOT NULL,
	"medicament_id" varchar NOT NULL,
	"employe_id" varchar,
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp,
	"date_rappel" timestamp,
	"diagnostic" text,
	"symptomes" text,
	"voie_administration" varchar,
	"periode_retrait" integer,
	"status" "treatment_status" DEFAULT 'en_cours',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" varchar NOT NULL,
	"compte_destination_id" varchar,
	"type" "transaction_type" NOT NULL,
	"montant" numeric(15, 2) NOT NULL,
	"date_transaction" timestamp NOT NULL,
	"description" text NOT NULL,
	"categorie" varchar,
	"reference" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'employee',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ventes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"date_vente" timestamp NOT NULL,
	"type_vente" varchar NOT NULL,
	"poids_total" numeric(10, 2),
	"prix_par_kg" numeric(10, 2),
	"prix_unitaire" numeric(10, 2),
	"montant_total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");