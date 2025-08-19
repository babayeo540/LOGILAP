import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Printer, 
  Rabbit,
  Calendar, 
  Scale, 
  Heart,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface Rabbit {
  id: string;
  identifiant: string;
  race: string;
  sexe: 'Male' | 'Female';
  couleur: string;
  dateNaissance: string;
  poids?: number;
  pere?: Rabbit;
  mere?: Rabbit;
}

interface Customer {
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

interface Sale {
  id: string;
  numeroVente: string;
  dateVente: string;
  typeVente: 'Chair' | 'Reproducteur';
  prixUnitaire: number;
  prixTotal: number;
  quantite: number;
  client: Customer;
  lapins: Rabbit[];
}

interface GenealogyReceiptProps {
  sale: Sale;
  onDownload?: () => void;
  onPrint?: () => void;
}

const GenealogyReceipt: React.FC<GenealogyReceiptProps> = ({ 
  sale, 
  onDownload, 
  onPrint 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} mois`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} an${years > 1 ? 's' : ''} ${months} mois` : `${years} an${years > 1 ? 's' : ''}`;
    }
  };

  const renderGenealogyTree = (rabbit: Rabbit) => (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <Rabbit className="w-5 h-5" />
        Arbre Généalogique - {rabbit.identifiant}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lapin principal */}
        <div className="md:col-start-2 bg-white rounded-lg p-3 border-2 border-primary-500">
          <div className="text-center">
            <Badge variant={rabbit.sexe === 'Male' ? 'default' : 'secondary'} className="mb-2">
              {rabbit.sexe === 'Male' ? '♂' : '♀'} {rabbit.identifiant}
            </Badge>
            <p className="text-sm text-gray-600">{rabbit.race}</p>
            <p className="text-sm text-gray-600">{rabbit.couleur}</p>
            <p className="text-xs text-gray-500">
              Né le {formatDate(rabbit.dateNaissance)}
            </p>
            <p className="text-xs text-gray-500">
              Âge: {calculateAge(rabbit.dateNaissance)}
            </p>
            {rabbit.poids && (
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Scale className="w-3 h-3" />
                {rabbit.poids} kg
              </p>
            )}
          </div>
        </div>

        {/* Père */}
        <div className="md:col-start-1 md:row-start-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2 text-center">Père</h5>
          {rabbit.pere ? (
            <div className="text-center">
              <Badge variant="outline" className="mb-1 border-blue-300 text-blue-700">
                ♂ {rabbit.pere.identifiant}
              </Badge>
              <p className="text-xs text-blue-600">{rabbit.pere.race}</p>
              <p className="text-xs text-blue-600">{rabbit.pere.couleur}</p>
              <p className="text-xs text-blue-500">
                {formatDate(rabbit.pere.dateNaissance)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center italic">Non renseigné</p>
          )}
        </div>

        {/* Mère */}
        <div className="md:col-start-3 md:row-start-2 bg-pink-50 rounded-lg p-3 border border-pink-200">
          <h5 className="font-medium text-pink-800 mb-2 text-center">Mère</h5>
          {rabbit.mere ? (
            <div className="text-center">
              <Badge variant="outline" className="mb-1 border-pink-300 text-pink-700">
                ♀ {rabbit.mere.identifiant}
              </Badge>
              <p className="text-xs text-pink-600">{rabbit.mere.race}</p>
              <p className="text-xs text-pink-600">{rabbit.mere.couleur}</p>
              <p className="text-xs text-pink-500">
                {formatDate(rabbit.mere.dateNaissance)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center italic">Non renseigné</p>
          )}
        </div>

        {/* Grands-parents paternels */}
        {rabbit.pere && (
          <>
            <div className="md:col-start-1 md:row-start-3 bg-blue-25 rounded p-2 border border-blue-100">
              <h6 className="text-xs font-medium text-blue-700 mb-1">Grand-père paternel</h6>
              {rabbit.pere.pere ? (
                <div>
                  <p className="text-xs text-blue-600">♂ {rabbit.pere.pere.identifiant}</p>
                  <p className="text-xs text-blue-500">{rabbit.pere.pere.race}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Non renseigné</p>
              )}
            </div>
            <div className="md:col-start-1 md:row-start-4 bg-blue-25 rounded p-2 border border-blue-100">
              <h6 className="text-xs font-medium text-blue-700 mb-1">Grand-mère paternelle</h6>
              {rabbit.pere.mere ? (
                <div>
                  <p className="text-xs text-blue-600">♀ {rabbit.pere.mere.identifiant}</p>
                  <p className="text-xs text-blue-500">{rabbit.pere.mere.race}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Non renseigné</p>
              )}
            </div>
          </>
        )}

        {/* Grands-parents maternels */}
        {rabbit.mere && (
          <>
            <div className="md:col-start-3 md:row-start-3 bg-pink-25 rounded p-2 border border-pink-100">
              <h6 className="text-xs font-medium text-pink-700 mb-1">Grand-père maternel</h6>
              {rabbit.mere.pere ? (
                <div>
                  <p className="text-xs text-pink-600">♂ {rabbit.mere.pere.identifiant}</p>
                  <p className="text-xs text-pink-500">{rabbit.mere.pere.race}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Non renseigné</p>
              )}
            </div>
            <div className="md:col-start-3 md:row-start-4 bg-pink-25 rounded p-2 border border-pink-100">
              <h6 className="text-xs font-medium text-pink-700 mb-1">Grand-mère maternelle</h6>
              {rabbit.mere.mere ? (
                <div>
                  <p className="text-xs text-pink-600">♀ {rabbit.mere.mere.identifiant}</p>
                  <p className="text-xs text-pink-500">{rabbit.mere.mere.race}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Non renseigné</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* En-tête du reçu */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">LAPGEST-PRO</h1>
        <p className="text-gray-600">Reçu de Vente avec Certificat Généalogique</p>
        <p className="text-sm text-gray-500">Élevage de Lapins Professionnel</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Informations de Vente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Détails de la vente */}
            <div>
              <h3 className="font-semibold mb-3">Détails de la Transaction</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">N° de Vente:</span>
                  <span className="font-medium">{sale.numeroVente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de Vente:</span>
                  <span className="font-medium">{formatDate(sale.dateVente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type de Vente:</span>
                  <Badge variant={sale.typeVente === 'Reproducteur' ? 'default' : 'secondary'}>
                    {sale.typeVente}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité:</span>
                  <span className="font-medium">{sale.quantite} lapin(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix Unitaire:</span>
                  <span className="font-medium">{formatCurrency(sale.prixUnitaire)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(sale.prixTotal)}</span>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations Client
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Nom:</span>
                  <p className="font-medium">
                    {sale.client.nom} {sale.client.prenom || ''}
                  </p>
                </div>
                {sale.client.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{sale.client.telephone}</span>
                  </div>
                )}
                {sale.client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{sale.client.email}</span>
                  </div>
                )}
                {sale.client.adresse && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{sale.client.adresse}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbres généalogiques pour chaque lapin */}
      <div className="space-y-6 mb-8">
        {sale.lapins.map((rabbit, index) => (
          <Card key={rabbit.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Certificat Généalogique #{index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderGenealogyTree(rabbit)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pied de page */}
      <div className="border-t pt-6 text-center text-sm text-gray-500">
        <p className="mb-2">
          <strong>LAPGEST-PRO 2.0</strong> - Système de Gestion d'Élevage de Lapins
        </p>
        <p>
          Ce document certifie l'authenticité des informations généalogiques fournies.
        </p>
        <p className="mt-2">
          Document généré le {formatDate(new Date().toISOString())}
        </p>
      </div>
    </div>
  );
};

export default GenealogyReceipt;
