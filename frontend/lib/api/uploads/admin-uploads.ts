import { apiUpload } from "../common/client";


export type UploadImageTarget =
    | { categoryId: number }
    | { productId: number }
    | { variantId: number };

export class AdminUploadsApi {
    async uploadImage(
        file: File,
        target: UploadImageTarget,
    ): Promise<void> {
        const formData = this.getTargetFormData(target);

        await apiUpload<void>(
            "/admin/uploads",
            file,
            target,
        );
    }

    private getTargetFormData(
        target: UploadImageTarget,
    ): FormData {
        const formData = new FormData();

        if ("categoryId" in target) {
            formData.append(
                "categoryId",
                String(target.categoryId),
            );
        } else if ("productId" in target) {
            formData.append(
                "productId",
                String(target.productId),
            );
        } else {
            formData.append(
                "variantId",
                String(target.variantId),
            );
        }

        return formData;
    }
}

export const adminUploadsApi = new AdminUploadsApi();
