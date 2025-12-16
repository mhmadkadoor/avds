import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Vehicle } from '../lib/types';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Trash2, Upload, X } from 'lucide-react';

interface EditVehicleDialogProps {
    vehicle: Vehicle;
    onUpdate: (updatedVehicle: Vehicle) => void;
    trigger?: React.ReactNode;
}

export function EditVehicleDialog({ vehicle, onUpdate, trigger }: EditVehicleDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(vehicle.custom_title || vehicle.title);
    const [description, setDescription] = useState(vehicle.description || '');
    const [uploading, setUploading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const updated = await api.updateVehicle(vehicle.id, {
                custom_title: title,
                description: description,
            });
            onUpdate(updated);
            toast.success('Vehicle updated successfully');
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update vehicle');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        try {
            await api.uploadVehicleImage(vehicle.id, file);
            toast.success('Image uploaded successfully');
            // Refresh vehicle data to show new image
            const updated = await api.getVehicle(vehicle.id);
            onUpdate(updated);
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.deleteVehicleImage(imageId);
            toast.success('Image deleted successfully');
            // Refresh vehicle data
            const updated = await api.getVehicle(vehicle.id);
            onUpdate(updated);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete image');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Edit Vehicle</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Vehicle Details</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 pr-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Custom Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter custom title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter vehicle description"
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Images</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Display uploaded images (from image_data) */}
                                {vehicle.image_data && vehicle.image_data.length > 0 ? (
                                    vehicle.image_data.map((img) => (
                                        <div key={img.id} className="relative group aspect-video bg-muted rounded-md overflow-hidden border border-border">
                                            <img src={img.image || img.image_url || ''} alt="Vehicle" className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteImage(img.id);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors z-10"
                                                title="Delete Image"
                                                type="button"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {img.is_primary && (
                                                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                                    Primary
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    /* Show fallback image with explanation if no custom images */
                                    <div className="relative aspect-video bg-muted rounded-md overflow-hidden opacity-70 border border-dashed border-muted-foreground">
                                        <img src={vehicle.images[0]} alt="Placeholder" className="w-full h-full object-cover grayscale opacity-50" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                            <span className="text-xs font-medium text-foreground">Default Placeholder</span>
                                            <span className="text-[10px] text-muted-foreground">(Upload an image to replace)</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-center aspect-video bg-muted border-2 border-dashed border-muted-foreground/25 rounded-md hover:bg-muted/50 transition-colors">
                                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
