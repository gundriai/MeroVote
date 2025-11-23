import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannersService, Banner, CreateBannerDto } from "@/services/banners.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit3, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export default function BannerManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState<CreateBannerDto>({
        imageUrl: "",
        title: "",
        subTitle: "",
        buttonLabel: "",
        buttonUrl: "",
        isActive: true,
    });

    const { data: banners, isLoading } = useQuery({
        queryKey: ["banners"],
        queryFn: () => bannersService.getBanners(),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateBannerDto) => bannersService.createBanner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
            toast({ title: "Success", description: "Banner created successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create banner", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateBannerDto }) =>
            bannersService.updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
            toast({ title: "Success", description: "Banner updated successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update banner", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => bannersService.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
            toast({ title: "Success", description: "Banner deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBanner) {
            updateMutation.mutate({ id: editingBanner.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            imageUrl: banner.imageUrl,
            title: banner.title,
            subTitle: banner.subTitle,
            buttonLabel: banner.buttonLabel || "",
            buttonUrl: banner.buttonUrl || "",
            isActive: banner.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this banner?")) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setEditingBanner(null);
        setFormData({
            imageUrl: "",
            title: "",
            subTitle: "",
            buttonLabel: "",
            buttonUrl: "",
            isActive: true,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Banner Management</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Banner Title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subTitle">Subtitle</Label>
                                <Textarea
                                    id="subTitle"
                                    value={formData.subTitle}
                                    onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                                    placeholder="Banner Subtitle"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buttonLabel">Button Label</Label>
                                    <Input
                                        id="buttonLabel"
                                        value={formData.buttonLabel}
                                        onChange={(e) => setFormData({ ...formData, buttonLabel: e.target.value })}
                                        placeholder="Learn More"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="buttonUrl">Button URL</Label>
                                    <Input
                                        id="buttonUrl"
                                        value={formData.buttonUrl}
                                        onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                                        placeholder="/vote"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingBanner ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {banners && banners.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No banners found. Create one to get started.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners?.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="w-16 h-10 rounded overflow-hidden bg-gray-100">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 m-auto mt-2 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{banner.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.subTitle}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {banner.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                                            <Edit3 className="w-4 h-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(banner.id)}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
