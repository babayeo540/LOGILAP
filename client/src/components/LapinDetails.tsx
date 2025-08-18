import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Scale,
  Heart,
  MapPin,
  User,
  FileText,
  Baby,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";

// Enum pour centraliser les statuts du lapin, plus robuste que les chaînes de caractères
enum LapinStatus {
  REPRODUCTEUR = "reproducteur",
  ENGRAISSEMENT = "engraissement",
  STOCK_A_VENDRE = "stock_a_vendre",
  VENDU = "vendu",
  DECEDE = "decede",
}

// Interface pour garantir la sécurité des types des données de lapin
interface Lapin {
  id: string;
  identifiant: string;
  sexe: "male" | "femelle";
  race: string;
  dateNaissance: string;
  poids: number;
  statut: LapinStatus;
  enclos: string;
  notes?: string;
}

// Fonction utilitaire pour obtenir la couleur du badge en fonction du statut
const getStatusBadgeColor = (status: LapinStatus) => {
  switch (status) {
    case LapinStatus.REPRODUCTEUR:
      return "bg-blue-100 text-blue-800";
    case LapinStatus.ENGRAISSEMENT:
      return "bg-yellow-100 text-yellow-800";
    case LapinStatus.STOCK_A_VENDRE:
      return "bg-green-100 text-green-800";
    case LapinStatus.VENDU:
      return "bg-gray-100 text-gray-800";
    case LapinStatus.DECEDE:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Fonction utilitaire pour obtenir le libellé du statut
const getStatusLabel = (status: LapinStatus) => {
  switch (status) {
    case LapinStatus.REPRODUCTEUR:
      return "Reproducteur";
    case LapinStatus.ENGRAISSEMENT:
      return "Engraissement";
    case LapinStatus.STOCK_A_VENDRE:
      return "Stock à vendre";
    case LapinStatus.VENDU:
      return "Vendu";
    case LapinStatus.DECEDE:
      return "Décédé";
    default:
      return "Inconnu";
  }
};

interface LapinDetailsProps {
  lapin?: Lapin;
  onClose: () => void;
}

export default function LapinDetails({ lapin, onClose }: LapinDetailsProps) {
  // Ajoutez les états pour gérer l'ouverture des formulaires d'action rapide
  const [showWeighForm, setShowWeighForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showReproductionForm, setShowReproductionForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);

  // Gérer le cas où l'objet lapin n'est pas fourni
  if (!lapin) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Aucune information de lapin disponible.</p>
        <Button onClick={onClose} className="mt-4">
          Fermer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Informations de base */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">
            Fiche de {lapin.identifiant}
          </CardTitle>
          <Badge className={getStatusBadgeColor(lapin.statut)}>
            {getStatusLabel(lapin.statut)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sexe</p>
                <p className="font-semibold text-gray-900">
                  {lapin.sexe === "male" ? "Mâle" : "Femelle"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Race</p>
                <p className="font-semibold text-gray-900">{lapin.race}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Date de naissance
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(lapin.dateNaissance).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Poids</p>
                <p className="font-semibold text-gray-900">
                  {lapin.poids} kg
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Enclos</p>
                <p className="font-semibold text-gray-900">{lapin.enclos}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Historique médical */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Historique des soins, reproductions, poids...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            (Module à venir)
          </p>
        </CardContent>
      </Card>

      {/* Notes */}
      {lapin.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">
              {lapin.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setShowWeighForm(true)}
            >
              <Scale className="w-6 h-6 mb-2" />
              <span className="text-sm">Peser</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setShowTreatmentForm(true)}
            >
              <Stethoscope className="w-6 h-6 mb-2" />
              <span className="text-sm">Traitement</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setShowReproductionForm(true)}
            >
              <Heart className="w-6 h-6 mb-2" />
              <span className="text-sm">Reproduction</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setShowMoveForm(true)}
            >
              <MapPin className="w-6 h-6 mb-2" />
              <span className="text-sm">Déplacer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de fermeture */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary">
          Fermer
        </Button>
      </div>

      {/* Placeholders pour les Dialogs des formulaires */}
      {showWeighForm && (
        <p className="text-center text-gray-500 mt-4">
          Le formulaire de pesée est ouvert.
        </p>
      )}
      {showTreatmentForm && (
        <p className="text-center text-gray-500 mt-4">
          Le formulaire de traitement est ouvert.
        </p>
      )}
      {showReproductionForm && (
        <p className="text-center text-gray-500 mt-4">
          Le formulaire de reproduction est ouvert.
        </p>
      )}
      {showMoveForm && (
        <p className="text-center text-gray-500 mt-4">
          Le formulaire de déplacement est ouvert.
        </p>
      )}
    </div>
  );
}