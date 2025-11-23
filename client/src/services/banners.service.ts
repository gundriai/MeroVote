import { apiRequest } from '@/lib/queryClient';

export interface Banner {
    id: string;
    image: string;
    imageAlt: string;
    title: string;
    subTitle: string;
    buttonLabel?: string;
    buttonUrl?: string;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBannerDto {
    image: string;
    title: string;
    subTitle: string;
    buttonLabel?: string;
    buttonUrl?: string;
    isActive?: boolean;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> { }

class BannersService {
    private baseUrl = '/api/banners';

    async getBanners(): Promise<Banner[]> {
        const response = await apiRequest('GET', this.baseUrl);
        return response.json();
    }

    async getActiveBanners(): Promise<Banner[]> {
        const response = await apiRequest('GET', `${this.baseUrl}/active`);
        return response.json();
    }

    async getBanner(id: string): Promise<Banner> {
        const response = await apiRequest('GET', `${this.baseUrl}/${id}`);
        return response.json();
    }

    async createBanner(data: CreateBannerDto): Promise<Banner> {
        // Map frontend DTO to backend expected DTO if needed
        // Backend expects: image, title, subTitle, buttonLabel, buttonUrl, isActive
        // Frontend DTO matches backend DTO structure based on my analysis of create-banner.dto.ts
        // Wait, let me double check create-banner.dto.ts
        // Backend DTO: image, title, subTitle, buttonLabel?, buttonUrl?, isActive?
        // My DTO here: imageUrl... wait. Backend uses 'image', not 'imageUrl'.

        const payload = {
            image: data.image,
            title: data.title,
            subTitle: data.subTitle,
            buttonLabel: data.buttonLabel,
            buttonUrl: data.buttonUrl,
            isActive: data.isActive
        };

        const response = await apiRequest('POST', this.baseUrl, payload);
        return response.json();
    }

    async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
        const payload: any = {};
        if (data.image !== undefined) payload.image = data.image;
        if (data.title !== undefined) payload.title = data.title;
        if (data.subTitle !== undefined) payload.subTitle = data.subTitle;
        if (data.buttonLabel !== undefined) payload.buttonLabel = data.buttonLabel;
        if (data.buttonUrl !== undefined) payload.buttonUrl = data.buttonUrl;
        if (data.isActive !== undefined) payload.isActive = data.isActive;

        const response = await apiRequest('PATCH', `${this.baseUrl}/${id}`, payload);
        return response.json();
    }

    async deleteBanner(id: string): Promise<void> {
        await apiRequest('DELETE', `${this.baseUrl}/${id}`);
    }

    async reorderBanners(ids: string[]): Promise<void> {
        await apiRequest('POST', `${this.baseUrl}/reorder`, ids);
    }
}

export const bannersService = new BannersService();
