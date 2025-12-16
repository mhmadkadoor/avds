from django.db import models

class Make(models.Model):
    make_id = models.IntegerField(primary_key=True, db_column='MakeID')
    make_name = models.CharField(max_length=255, db_column='Make')

    class Meta:
        db_table = 'Makes'
        managed = False

    def __str__(self):
        return self.make_name

class MakeModel(models.Model):
    model_id = models.IntegerField(primary_key=True, db_column='ModelID')
    make = models.ForeignKey(Make, on_delete=models.DO_NOTHING, db_column='MakeID')
    model_name = models.CharField(max_length=255, db_column='ModelName')

    class Meta:
        db_table = 'MakeModels'
        managed = False

    def __str__(self):
        return self.model_name

class Body(models.Model):
    body_id = models.IntegerField(primary_key=True, db_column='BodyID')
    body_name = models.CharField(max_length=255, db_column='BodyName')

    class Meta:
        db_table = 'Bodies'
        managed = False

    def __str__(self):
        return self.body_name

class DriveType(models.Model):
    drive_type_id = models.IntegerField(primary_key=True, db_column='DriveTypeID')
    drive_type_name = models.CharField(max_length=255, db_column='DriveTypeName')

    class Meta:
        db_table = 'DriveTypes'
        managed = False

    def __str__(self):
        return self.drive_type_name

class VehicleDetail(models.Model):
    id = models.IntegerField(primary_key=True, db_column='ID')
    make = models.ForeignKey(Make, on_delete=models.DO_NOTHING, db_column='MakeID')
    model = models.ForeignKey(MakeModel, on_delete=models.DO_NOTHING, db_column='ModelID')
    sub_model_id = models.IntegerField(db_column='SubModelID', null=True, blank=True) # Assuming no table for now
    body = models.ForeignKey(Body, on_delete=models.DO_NOTHING, db_column='BodyID', null=True, blank=True)
    vehicle_display_name = models.CharField(max_length=255, db_column='Vehicle_Display_Name', null=True, blank=True)
    year = models.IntegerField(db_column='Year', null=True, blank=True)
    drive_type = models.ForeignKey(DriveType, on_delete=models.DO_NOTHING, db_column='DriveTypeID', null=True, blank=True)
    engine = models.CharField(max_length=255, db_column='Engine', null=True, blank=True)
    engine_cc = models.IntegerField(db_column='Engine_CC', null=True, blank=True)
    engine_cylinders = models.IntegerField(db_column='Engine_Cylinders', null=True, blank=True)
    engine_liter_display = models.FloatField(db_column='Engine_Liter_Display', null=True, blank=True)
    fuel_type_id = models.IntegerField(db_column='FuelTypeID', null=True, blank=True) # Assuming no table for now
    num_doors = models.IntegerField(db_column='NumDoors', null=True, blank=True)

    class Meta:
        db_table = 'VehicleDetails'
        managed = False

    def __str__(self):
        return self.vehicle_display_name or f"Vehicle {self.id}"

from django.contrib.auth.models import User

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    vehicle = models.ForeignKey(VehicleDetail, on_delete=models.CASCADE, related_name='favorited_by', db_constraint=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'vehicle')

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    vehicle = models.ForeignKey(VehicleDetail, on_delete=models.CASCADE, related_name='reviews', db_constraint=False)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.vehicle.vehicle_display_name}"

class VehicleMetadata(models.Model):
    vehicle = models.OneToOneField(VehicleDetail, on_delete=models.CASCADE, related_name='metadata', db_constraint=False)
    description = models.TextField(blank=True, null=True)
    custom_title = models.CharField(max_length=255, blank=True, null=True)
    views_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Metadata for {self.vehicle.id}"

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(VehicleDetail, on_delete=models.CASCADE, related_name='images', db_constraint=False)
    image = models.ImageField(upload_to='vehicle_images/', null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.vehicle.id}"

class SearchAnalytics(models.Model):
    query = models.CharField(max_length=255)
    count = models.IntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.query} ({self.count})"

class HomepageFeature(models.Model):
    emoji = models.CharField(max_length=10)
    title_en = models.CharField(max_length=100)
    title_tr = models.CharField(max_length=100)
    title_ar = models.CharField(max_length=100, default="Arabic Title")
    description_en = models.TextField()
    description_tr = models.TextField()
    description_ar = models.TextField(default="Arabic Description")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title_en
