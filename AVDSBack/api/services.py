"""Service layer abstractions to apply SOLID principles.

Each service encapsulates one domain concern (Single Responsibility) and can be
extended or swapped without modifying controllers (Open/Closed & Dependency Inversion).
"""
from __future__ import annotations

import csv
import io
from calendar import month_name
from dataclasses import dataclass
from datetime import date
from typing import Iterable, List, Optional, Sequence

from django.db import transaction
from django.db.models import Count, Q, QuerySet
from django.utils.dateparse import parse_date

from .models import (
    Feature,
    SearchAnalytics,
    Vehicle,
    VehicleImage,
)


@dataclass
class UploadResult:
    created: int
    errors: List[str]


class VehicleService:
    """Operations related to vehicles and batch uploads."""

    @staticmethod
    def filter(qs: QuerySet, params: dict) -> QuerySet:
        brand = params.get('brand')
        engine_type = params.get('engineType')
        fuel_type = params.get('fuelType')
        min_price = params.get('minPrice')
        max_price = params.get('maxPrice')
        min_year = params.get('minYear')
        max_year = params.get('maxYear')
        ordering = params.get('ordering')  # price,-price,year,-year

        if brand:
            qs = qs.filter(brand__iexact=brand)
        if engine_type:
            qs = qs.filter(engine_type__iexact=engine_type)
        if fuel_type:
            qs = qs.filter(fuel_type__iexact=fuel_type)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if min_year:
            qs = qs.filter(production_year__gte=min_year)
        if max_year:
            qs = qs.filter(production_year__lte=max_year)
        if ordering:
            mapping = {
                'price': 'price',
                '-price': '-price',
                'year': 'production_year',
                '-year': '-production_year',
                'created': '-created_at'
            }
            qs = qs.order_by(mapping.get(ordering, '-created_at'))
        return qs

    @staticmethod
    def search(params: dict) -> QuerySet:
        q = params.get('q', '').strip()
        filters = Q()
        if q:
            filters &= (
                Q(title__icontains=q) |
                Q(brand__icontains=q) |
                Q(description__icontains=q) |
                Q(detailed_description__icontains=q)
            )
        # Reuse filter logic for brand/engine/fuel
        qs = Vehicle.objects.filter(filters)
        qs = VehicleService.filter(qs, params)
        return qs.order_by('-created_at')

    @staticmethod
    def suggestions(q: str, limit: int = 10) -> List[str]:
        if not q:
            return []
        titles = list(
            Vehicle.objects.filter(title__icontains=q).values_list('title', flat=True)[:limit]
        )
        brands = list(
            Vehicle.objects.filter(brand__icontains=q).values_list('brand', flat=True).distinct()[:limit]
        )
        unique: List[str] = []
        seen = set()
        for s in titles + brands:
            if s not in seen:
                unique.append(s)
                seen.add(s)
        return unique[:limit]

    @staticmethod
    def upload_csv(file) -> UploadResult:
        if not file:
            return UploadResult(created=0, errors=["No file provided"])
        errors: List[str] = []
        created = 0
        try:
            data = file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(data))
            with transaction.atomic():
                for idx, row in enumerate(reader, start=1):
                    try:
                        vehicle = Vehicle.objects.create(
                            title=row.get('title', ''),
                            brand=row.get('brand', ''),
                            description=row.get('description', ''),
                            detailed_description=row.get('detailed_description', ''),
                            price=row.get('price') or 0,
                            production_year=row.get('production_year') or 2000,
                            engine_type=row.get('engine_type') or 'petrol',
                            fuel_type=row.get('fuel_type') or 'petrol',
                        )
                        images = (row.get('images') or '').split('|') if row.get('images') else []
                        for order, url in enumerate([u.strip() for u in images if u.strip()]):
                            VehicleImage.objects.create(vehicle=vehicle, url=url, order=order)
                        created += 1
                    except Exception as e:  # noqa: BLE001
                        errors.append(f"Row {idx}: {e}")
        except Exception as e:  # noqa: BLE001
            errors.append(str(e))
        return UploadResult(created=created, errors=errors)


class SearchAnalyticsService:
    """Analytics operations for recording and aggregating search queries."""

    @staticmethod
    def record(query: str) -> int:
        q = query.strip()
        if not q:
            raise ValueError("query required")
        today = date.today()
        obj, _ = SearchAnalytics.objects.get_or_create(query=q, date=today, defaults={'count': 0})
        obj.count += 1
        obj.save()
        return obj.count

    @staticmethod
    def daily(start: Optional[str] = None, end: Optional[str] = None) -> List[dict]:
        qs = SearchAnalytics.objects.all()
        if start:
            qs = qs.filter(date__gte=parse_date(start))
        if end:
            qs = qs.filter(date__lte=parse_date(end))
        data = qs.values('date').annotate(total=Count('id')).order_by('date')
        return list(data)

    @staticmethod
    def monthly() -> List[dict]:
        qs = SearchAnalytics.objects.all()
        result = {}
        for rec in qs:
            key = f"{rec.date.year}-{rec.date.month:02d}"
            result[key] = result.get(key, 0) + rec.count
        formatted = [
            {"month": key, "label": f"{month_name[int(key.split('-')[1])]} {key.split('-')[0]}", "total": total}
            for key, total in sorted(result.items())
        ]
        return formatted


class FeatureService:
    """CRUD operations for dynamic features configuration."""

    @staticmethod
    def list_all() -> Sequence[Feature]:
        return Feature.objects.all()

    @staticmethod
    def upsert(key: str, value) -> Feature:
        feature, _ = Feature.objects.update_or_create(key=key, defaults={'value': value})
        return feature

    @staticmethod
    def get(key: str) -> Feature:
        return Feature.objects.get(key=key)

    @staticmethod
    def update(feature: Feature, data: dict) -> Feature:
        if 'value' in data:
            feature.value = data['value']
        feature.save()
        return feature

    @staticmethod
    def delete(feature: Feature) -> None:
        feature.delete()
