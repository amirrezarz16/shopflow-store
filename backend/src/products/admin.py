from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "price",
        "is_active",
        "created_at",
    )

    list_display_links = ("id", "name")

    list_editable = ("price", "is_active")

    list_filter = ("category", "is_active")

    search_fields = ("name", "description")

    ordering = ("id",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )