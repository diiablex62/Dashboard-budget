import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className='relative flex'>
      {/* Contenu défilant */}
      <div className='p-8 overflow-y-auto h-screen w-full'>
        <h1>Politique de confidentialité</h1>
        <div>
          <br />
        </div>
        <div>
          <strong>Introduction</strong>
        </div>
        <div>
          Devant le développement des nouveaux outils de communication, il est
          nécessaire de porter une attention particulière à la protection de la
          vie privée. C’est pourquoi, nous nous engageons à respecter la
          confidentialité des renseignements personnels que nous collectons.
        </div>
        <div>
          <br />
        </div>
        <h2>Suppression des données utilisateur</h2>
        <div>
          Pour plus d'informations sur la suppression de vos données
          utilisateur, veuillez consulter la page dédiée :{" "}
          <Link
            to='/user-data-deletion'
            className='text-blue-500 hover:underline'>
            Suppression des données utilisateur
          </Link>
          .
        </div>
        <div>
          <br />
        </div>
        <h2>Collecte des renseignements personnels</h2>
        <div>
          <br />
        </div>
        <div>
          Les renseignements personnels que nous collectons sont recueillis au
          travers de formulaires et grâce à l’interactivité établie entre vous
          et notre site Web. Nous utilisons également, comme indiqué dans la
          section suivante, des fichiers témoins et/ou journaux pour réunir des
          informations vous concernant.
        </div>
        <div>
          <br />
        </div>
        <h2>Formulaires et interactivité:</h2>
        <div>
          Vos renseignements personnels sont collectés par le biais de
          formulaire, à savoir :
        </div>
        <div>
          <br />
        </div>
        <div>
          Nous utilisons les renseignements ainsi collectés pour les finalités
          suivantes :
        </div>
        <div>
          <br />
        </div>
        <div>
          Vos renseignements sont également collectés par le biais de
          l’interactivité pouvant s’établir entre vous et notre site Web et ce,
          de la façon suivante:
        </div>
        <div>
          <br />
        </div>
        <div>
          Nous utilisons les renseignements ainsi collectés pour les finalités
          suivantes :
        </div>
        <div>
          <br />
        </div>
        <h2>Droit d’opposition et de retrait</h2>
        <div>
          Nous nous engageons à vous offrir un droit d’opposition et de retrait
          quant à vos renseignements personnels.
        </div>
        <div>
          Le droit d’opposition s’entend comme étant la possibilité offerte aux
          internautes de refuser que leurs renseignements personnels soient
          utilisés à certaines fins mentionnées lors de la collecte.
        </div>
        <div>
          <br />
        </div>
        <div>
          Le droit de retrait s’entend comme étant la possibilité offerte aux
          internautes de demander à ce que leurs renseignements personnels ne
          figurent plus, par exemple, dans une liste de diffusion.
        </div>
        <div>
          <br />
        </div>
        <div>
          <strong>Pour pouvoir exercer ces droits, vous pouvez :</strong>
        </div>
        <div>
          <br />
        </div>
        <div>Code postal : 62190</div>
        <div>Courriel : alexandre.janacek@gmail.com</div>
        <div>Téléphone : 07 83 52 06 52</div>
        <div>Section du site web : Gestion de budget</div>
        <div>
          <br />
        </div>
        <h2>Droit d’accès</h2>
        <div>
          Nous nous engageons à reconnaître un droit d’accès et de rectification
          aux personnes concernées désireuses de consulter, modifier, voire
          radier les informations les concernant.
        </div>
        <div>
          <br />
        </div>
        <div>
          <strong>L’exercice de ce droit se fera :</strong>
        </div>
        <div>
          <br />
        </div>
        <div>Code postal : 62190</div>
        <div>Courriel : alexandre.janacek@gmail.com</div>
        <div>Téléphone : 0783520652</div>
        <div>Section du site web : Budget</div>
        <div>
          <br />
        </div>
        <h2>Sécurité</h2>
        <div>
          Les renseignements personnels que nous collectons sont conservés dans
          un environnement sécurisé. Les personnes travaillant pour nous sont
          tenues de respecter la confidentialité de vos informations.
        </div>
        <div>
          <br />
        </div>
        <div>
          Pour assurer la sécurité de vos renseignements personnels, nous avons
          recours aux mesures suivantes :
        </div>
        <div>
          <br />
        </div>
        <div>
          Nous nous engageons à maintenir un haut degré de confidentialité en
          intégrant les dernières innovations technologiques permettant
          d’assurer la confidentialité de vos transactions. Toutefois, comme
          aucun mécanisme n’offre une sécurité maximale, une part de risque est
          toujours présente lorsque l’on utilise Internet pour transmettre des
          renseignements personnels.
        </div>
        <div>
          <br />
        </div>
      </div>
    </div>
  );
}
