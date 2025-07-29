import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rabbit, TrendingUp, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-earth-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Rabbit className="text-white w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900">LAPGEST-PRO</h1>
              <p className="text-lg text-primary-600 font-medium">v2.0 - Gestion Cunicole</p>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Système de Gestion
            <span className="text-primary-600"> Cunicole </span>
            Moderne
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une solution complète pour optimiser votre élevage de lapins avec des outils avancés 
            de reproduction, santé, finances et généalogie automatisée.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/login'}
              size="lg"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Se Connecter
            </Button>
            <Button 
              onClick={() => window.location.href = '/demo'}
              size="lg"
              variant="outline"
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Voir la Démo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion Complète</h3>
              <p className="text-gray-600">
                Suivi intégral de la reproduction à la vente avec calculs automatiques 
                et alertes intelligentes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Santé & Traçabilité</h3>
              <p className="text-gray-600">
                Monitoring sanitaire avancé avec généalogie automatique et 
                périodes de retrait calculées.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Utilisateurs</h3>
              <p className="text-gray-600">
                Interface collaborative avec gestion des employés, tâches 
                et droits d'accès granulaires.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Modules */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Modules Intégrés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rabbit className="text-green-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestion des Lapins</h4>
              <p className="text-sm text-gray-600">Fiches individuelles, enclos, reproduction, sevrage</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-red-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Santé & Soins</h4>
              <p className="text-sm text-gray-600">Traitements, vaccinations, médications</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-amber-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Stocks & Finances</h4>
              <p className="text-sm text-gray-600">Aliments, matériel, ventes, trésorerie</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Personnel</h4>
              <p className="text-sm text-gray-600">Employés, tâches, épargne salariale</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Rapports</h4>
              <p className="text-sm text-gray-600">Analytics, statistiques, tableaux de bord</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600 w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sécurité</h4>
              <p className="text-sm text-gray-600">Authentification, rôles, audit trail</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à Optimiser Votre Élevage ?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez les éleveurs qui font confiance à LAPGEST-PRO pour gérer leur ferme cunicole.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Accéder au Système
          </Button>
        </div>
      </div>
    </div>
  );
}
