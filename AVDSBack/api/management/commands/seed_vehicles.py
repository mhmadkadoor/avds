from django.core.management.base import BaseCommand
from api.models import Vehicle, VehicleImage, Review
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial vehicle data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        # Create a default user for reviews if not exists
        user, created = User.objects.get_or_create(username='demo_user', email='demo@example.com')
        if created:
            user.set_password('password123')
            user.save()

        vehicles_data = [
            {
                'id': '1',
                'title': 'Porsche 911 Turbo S',
                'brand': 'Porsche',
                'description': 'Iconic sports car with incredible performance',
                'detailed_description': 'The Porsche 911 Turbo S is the pinnacle of sports car engineering. With its twin-turbocharged flat-six engine producing 640 horsepower, it delivers breathtaking acceleration and handling. The all-wheel-drive system ensures maximum traction, while the luxurious interior provides comfort for daily driving.',
                'price': 207000,
                'production_year': 2024,
                'engine_type': 'petrol', # Mapped to choice
                'fuel_type': 'petrol',   # Mapped to choice
                'images': [
                    'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzYwNjIxMTE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                    'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800'
                ],
                'reviews': [
                    {
                        'rating': 5,
                        'comment': 'Absolutely stunning vehicle! The performance is incredible.',
                    },
                    {
                        'rating': 5,
                        'comment': 'Dream car finally came true. Worth every penny.',
                    }
                ]
            },
            {
                'id': '2',
                'title': 'Tesla Model X Plaid',
                'brand': 'Tesla',
                'description': 'Premium electric SUV with falcon-wing doors',
                'detailed_description': 'The Tesla Model X Plaid redefines electric SUV performance. With three motors producing over 1,000 horsepower, it accelerates from 0-60 mph in just 2.5 seconds. The spacious interior seats up to seven, and the advanced autopilot system makes every journey safer and more convenient.',
                'price': 108990,
                'production_year': 2024,
                'engine_type': 'electric',
                'fuel_type': 'electric',
                'images': [
                    'https://images.unsplash.com/photo-1740261118563-fa240f65384f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMFNVVnxlbnwxfHx8fDE3NjA2MjY0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
                    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'
                ],
                'reviews': [
                    {
                        'rating': 5,
                        'comment': 'Best electric SUV on the market. Incredible technology.',
                    }
                ]
            },
            {
                'id': '3',
                'title': 'BMW M5 Competition',
                'brand': 'BMW',
                'description': 'High-performance luxury sedan',
                'detailed_description': 'The BMW M5 Competition combines luxury with raw power. Its twin-turbocharged V8 engine delivers 617 horsepower, propelling this sedan from 0-60 mph in just 3.1 seconds. The sophisticated all-wheel-drive system and adaptive suspension ensure both comfort and thrilling driving dynamics.',
                'price': 103995,
                'production_year': 2024,
                'engine_type': 'petrol',
                'fuel_type': 'petrol',
                'images': [
                    'https://images.unsplash.com/photo-1648178326808-30e03de8049d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzZWRhbnxlbnwxfHx8fDE3NjA2MjY0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
                ],
                'reviews': []
            },
            {
                'id': '4',
                'title': 'Ford F-150 Raptor',
                'brand': 'Ford',
                'description': 'Off-road performance pickup truck',
                'detailed_description': 'The Ford F-150 Raptor is built for extreme off-road adventures. Its high-output twin-turbo V6 engine produces 450 horsepower, while the advanced suspension with FOX shocks can handle the toughest terrain. With its rugged design and spacious cabin, it is perfect for both work and play.',
                'price': 69525,
                'production_year': 2024,
                'engine_type': 'petrol',
                'fuel_type': 'petrol',
                'images': [
                    'https://images.unsplash.com/photo-1649793395985-967862a3b73f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWNrdXAlMjB0cnVja3xlbnwxfHx8fDE3NjA2MjIyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
                ],
                'reviews': [
                    {
                        'rating': 5,
                        'comment': 'Best truck for off-roading. The suspension is amazing!',
                    }
                ]
            },
            {
                'id': '5',
                'title': 'Dodge Challenger SRT Hellcat',
                'brand': 'Dodge',
                'description': 'Modern muscle car with supercharged V8',
                'detailed_description': 'The Dodge Challenger SRT Hellcat brings classic muscle car styling with modern performance. Its supercharged 6.2L HEMI V8 engine produces a thunderous 717 horsepower. With aggressive styling, wide body stance, and tire-shredding power, this is pure American muscle.',
                'price': 71490,
                'production_year': 2023,
                'engine_type': 'petrol',
                'fuel_type': 'petrol',
                'images': [
                    'https://images.unsplash.com/photo-1691315036348-85bf02674ae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbXVzY2xlJTIwY2FyfGVufDF8fHx8MTc2MDYyMjI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1552519507-22357ea4a98e?w=800',
                    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'
                ],
                'reviews': []
            },
            {
                'id': '6',
                'title': 'Volkswagen Golf GTI',
                'brand': 'Volkswagen',
                'description': 'Sporty and practical hot hatchback',
                'detailed_description': 'The Volkswagen Golf GTI is the perfect balance of practicality and performance. Its turbocharged 2.0L engine delivers 241 horsepower, while the refined chassis ensures precise handling. With a versatile hatchback design and premium interior, it is perfect for enthusiasts who need everyday usability.',
                'price': 30540,
                'production_year': 2024,
                'engine_type': 'petrol',
                'fuel_type': 'petrol',
                'images': [
                    'https://images.unsplash.com/photo-1705769942705-45266e50628b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrfGVufDF8fHx8MTc2MDU1MjU0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
                    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
                    'https://images.unsplash.com/photo-1611821064430-e45f7d3ace0a?w=800'
                ],
                'reviews': [
                    {
                        'rating': 4,
                        'comment': 'Great daily driver with a fun factor. Love the handling!',
                    }
                ]
            },
            {
                'id': '7',
                'title': 'Mercedes-AMG GT',
                'brand': 'Mercedes-Benz',
                'description': 'Luxury grand tourer with racing DNA',
                'detailed_description': 'The Mercedes-AMG GT is a stunning grand tourer that combines luxury with track-ready performance. Its handcrafted twin-turbo V8 produces up to 523 horsepower in the standard model. With a low-slung design, premium interior, and advanced technology, it is perfect for spirited driving.',
                'price': 118600,
                'production_year': 2024,
                'engine_type': 'petrol',
                'fuel_type': 'petrol',
                'images': [
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
                    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800'
                ],
                'reviews': []
            },
            {
                'id': '8',
                'title': 'Audi e-tron GT',
                'brand': 'Audi',
                'description': 'Electric grand tourer with stunning design',
                'detailed_description': 'The Audi e-tron GT is an all-electric grand tourer that does not compromise on performance or luxury. With dual motors producing 522 horsepower (637 in RS model), it accelerates from 0-60 mph in 3.9 seconds. The sleek design and premium interior make it a true driver car for the electric age.',
                'price': 106500,
                'production_year': 2024,
                'engine_type': 'electric',
                'fuel_type': 'electric',
                'images': [
                    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800',
                    'https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800',
                    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800'
                ],
                'reviews': []
            }
        ]

        for v_data in vehicles_data:
            vehicle, created = Vehicle.objects.update_or_create(
                title=v_data['title'],
                defaults={
                    'brand': v_data['brand'],
                    'description': v_data['description'],
                    'detailed_description': v_data['detailed_description'],
                    'price': v_data['price'],
                    'production_year': v_data['production_year'],
                    'engine_type': v_data['engine_type'],
                    'fuel_type': v_data['fuel_type'],
                }
            )
            
            # Clear existing images and reviews to avoid duplicates on re-run
            vehicle.images.all().delete()
            vehicle.reviews.all().delete()

            for i, img_url in enumerate(v_data['images']):
                VehicleImage.objects.create(vehicle=vehicle, url=img_url, order=i)

            for review_data in v_data['reviews']:
                Review.objects.create(
                    vehicle=vehicle,
                    user=user,
                    rating=review_data['rating'],
                    comment=review_data['comment']
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
