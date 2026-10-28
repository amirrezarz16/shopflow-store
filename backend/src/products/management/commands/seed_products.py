
from django.core.management.base import BaseCommand

from products.models import Product


PRODUCTS = [
    {
        "name": "Studio Headphones",
        "category": "technology",
        "description": "Comfortable listening for every day.",
        "price": "59.00",
        "image_url": "",
        "is_active": True,
    },
    {
        "name": "Daily Backpack",
        "category": "accessories",
        "description": "A practical companion for your routine.",
        "price": "45.00",
        "image_url": "",
        "is_active": True,
    },
    {
        "name": "Ceramic Mug",
        "category": "lifestyle",
        "description": "Make your morning ritual special.",
        "price": "18.00",
        "image_url": "",
        "is_active": True,
    },
    {
        "name": "Ambient Desk Light",
        "category": "home",
        "description": "A softer glow for your workspace.",
        "price": "35.00",
        "image_url": "",
        "is_active": True,
    },
]


class Command(BaseCommand):
    help = "Create or update the initial ShopFlow products."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for product_data in PRODUCTS:
            product, created = Product.objects.update_or_create(
                name=product_data["name"],
                defaults=product_data,
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created: {product.name}"
                    )
                )
            else:
                updated_count += 1
                self.stdout.write(
                    f"Updated: {product.name}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished: {created_count} created, "
                f"{updated_count} updated."
            )
        )
