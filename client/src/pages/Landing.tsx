import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rabbit, TrendingUp, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-earth-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Rabbit className="text-white w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                LAPGEST-PRO
              </h1>
              <p className="text-lg text-primary-600 font-medium">
                v2.0 - Gestion Cunicole
              </p>
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight dark:text-gray-100">
            Système de Gestion
            <span className="text-primary-600"> Cunicole </span>
            Moderne
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-400">
            Optimisez chaque aspect de votre élevage de lapins : gestion du
            cheptel, des finances, de la santé, et du personnel.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 transition">
              Commencer l'essai gratuit
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h3 className="text-center text-3xl font-bold text-gray-900 mb-12 dark:text-gray-100">
            Fonctionnalités Clés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rabbit className="text-primary-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Gestion de Cheptel
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suivi individuel des lapins, fiches de santé, reproduction
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Personnel
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion des employés, attribution des tâches, suivi
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Rapports
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analytics, statistiques, tableaux de bord
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                Sécurité
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authentification, rôles, audit trail
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">
            Prêt à Optimiser Votre Élevage ?
          </h3>
          <p className="text-lg text-gray-600 mb-8 dark:text-gray-400">
            Rejoignez les éleveurs qui font confiance à LAPGEST-PRO pour gérer
            leur ferme cunicole.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 transition">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}