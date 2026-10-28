
from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("technology", "Technology"),
        ("accessories", "Accessories"),
        ("lifestyle", "Lifestyle"),
        ("home", "Home"),
    ]

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name
