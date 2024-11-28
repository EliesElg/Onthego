// payment.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TokenPackage {
  id: number;
  name: string;
  tokens: number;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  selectedPackage: TokenPackage | null = null;

  packages: TokenPackage[] = [
    {
      id: 1,
      name: 'Starter',
      tokens: 20,
      price: 19.99,
      description: 'Parfait pour débuter',
      features: [
        '20 générations de voyages',
        'Support par email',
        'Validité 3 mois'
      ]
    },
    {
      id: 2,
      name: 'Popular',
      tokens: 50,
      price: 39.99,
      description: 'Notre offre la plus populaire',
      features: [
        '50 générations de voyages',
        'Support prioritaire',
        'Validité 6 mois',
        'Options avancées'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Pro',
      tokens: 100,
      price: 69.99,
      description: 'Pour les voyageurs fréquents',
      features: [
        '100 générations de voyages',
        'Support 24/7',
        'Validité illimitée',
        'Toutes les options',
        'API Access'
      ]
    }
  ];

  selectPackage(pkg: TokenPackage) {
    this.selectedPackage = pkg;
  }
}