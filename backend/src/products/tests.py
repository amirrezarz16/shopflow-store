
from decimal import Decimal
from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Product


class ProductAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.active_product = Product.objects.create(
            name="Studio Headphones",
            description="Comfortable listening for every day.",
            category="technology",
            price=Decimal("59.00"),
            is_active=True,
        )

        cls.inactive_product = Product.objects.create(
            name="Hidden Product",
            description="Not available for sale.",
            category="home",
            price=Decimal("25.00"),
            is_active=False,
        )

    def test_list_returns_only_active_products(self):
        response = self.client.get("/api/products/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["name"],
            "Studio Headphones",
        )

    def test_product_detail_returns_correct_product(self):
        response = self.client.get(
            f"/api/products/{self.active_product.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Studio Headphones",
        )

    def test_inactive_product_is_not_accessible(self):
        response = self.client.get(
            f"/api/products/{self.inactive_product.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_unknown_product_returns_404(self):
        response = self.client.get("/api/products/999999/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_price_is_serialized_correctly(self):
        response = self.client.get(
            f"/api/products/{self.active_product.id}/"
        )

        self.assertEqual(
            response.data["price"],
            "59.00",
        )

    def test_public_api_is_read_only(self):
        response = self.client.post(
            "/api/products/",
            {"name": "Unauthorized Product"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class SeedProductsTests(TestCase):
    def test_seed_command_is_idempotent(self):
        output = StringIO()

        call_command("seed_products", stdout=output)

        self.assertEqual(Product.objects.count(), 4)

        call_command("seed_products", stdout=output)

        self.assertEqual(Product.objects.count(), 4)

        headphones = Product.objects.get(
            name="Studio Headphones"
        )

        self.assertEqual(
            headphones.price,
            Decimal("59.00"),
        )
