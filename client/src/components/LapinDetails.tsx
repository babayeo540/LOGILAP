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
  Stethoscope
} from "lucide-react";

interface LapinDetailsProps {
  lapin: any;
  onClose: () => void;
}

export default function LapinDetails({ lapin, onClose }: LapinDetailsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "reproducteur": return "bg-blue-100 text-blue-800";
      case "engraissement": return "bg-yellow-100 text-yellow-800";
      case "stock_a_vendre": return "bg-green-100 text-green-800";
      case "vendu": return "bg-gray-100 text-gray-800";
      case "decede": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reproducteur": return "Reproducteur";
      case "engraissement": return "Engraissement";
      case "stock_a_vendre": return "À vendre";
      case "vendu": return "Vendu";
      case "decede": return "Décédé";
      default: return status;
    }
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} jours`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return `${years}a ${months}m`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{lapin.identifiant}</h2>
        </div>
        <Badge className={getStatusBadgeColor(lapin.status)}>
          {getStatusLabel(lapin.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Race</p>
                <p className="text-gray-900">{lapin.race}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sexe</p>
                <p className="text-gray-900">
                  {lapin.sexe === "male" ? "Mâle" : "Femelle"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Couleur</p>
                <p className="text-gray-900">{lapin.couleur || "Non renseignée"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <p className="text-gray-900">{getStatusLabel(lapin.status)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates et âge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Dates et âge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Date de naissance</p>
              <p className="text-gray-900">{formatDate(lapin.dateNaissance)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Âge actuel</p>
              <p className="text-gray-900">{calculateAge(lapin.dateNaissance)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Créé le</p>
              <p className="text-gray-900">{formatDate(lapin.createdAt)}</p>
            </div>
            {lapin.updatedAt && lapin.updatedAt !== lapin.createdAt && (
              <div>
                <p className="text-sm font-medium text-gray-600">Dernière modification</p>
                <p className="text-gray-900">{formatDate(lapin.updatedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* État de santé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              État de santé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-gray-600">État actuel</p>
              <p className="text-gray-900">
                {lapin.healthStatus === "sain" ? "Sain" : 
                 lapin.healthStatus === "malade" ? "Malade" : "En quarantaine"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-gray-600">Enclos actuel</p>
              <p className="text-gray-900">
                {lapin.enclosId || "Aucun enclos assigné"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Généalogie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Généalogie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Père</p>
                <p className="text-gray-900">
                  {lapin.pereId || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mère</p>
                <p className="text-gray-900">
                  {lapin.mereId || "Non renseigné"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique de reproduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Baby className="w-5 h-5 mr-2" />
              Reproduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                Historique de reproduction à venir
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {lapin.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Notes et observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{lapin.notes}</p>
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
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Scale className="w-6 h-6 mb-2" />
              <span className="text-sm">Peser</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Stethoscope className="w-6 h-6 mb-2" />
              <span className="text-sm">Traitement</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Heart className="w-6 h-6 mb-2" />
              <span className="text-sm">Reproduction</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <MapPin className="w-6 h-6 mb-2" />
              <span className="text-sm">Déplacer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de fermeture */}
      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}