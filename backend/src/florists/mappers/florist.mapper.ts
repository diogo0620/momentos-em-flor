import { FloristResponseDto } from '../dto/florist-response.dto';

export class FloristMapper {
    toResponse(
        florist: any,
    ): FloristResponseDto {
        return {
            id:
                florist.id,

            name:
                florist.name,

            legalName:
                florist.legalName,

            taxNumber:
                florist.taxNumber,

            email:
                florist.email,

            phone:
                florist.phone,

            website:
                florist.website,

            description:
                florist.description,

            active:
                florist.active,

            acceptingOrders:
                florist.acceptingOrders,

            deliveryRadiusKm:
                Number(
                    florist.deliveryRadiusKm,
                ),

            address: {
                id:
                    florist.address.id,

                label:
                    florist.address.label,

                street:
                    florist.address.street,

                street2:
                    florist.address.street2,

                postalCode:
                    florist.address.postalCode,

                city:
                    florist.address.city,

                district:
                    florist.address.district,

                country:
                    florist.address.country,

                latitude:
                    Number(
                        florist.address.latitude,
                    ),

                longitude:
                    Number(
                        florist.address.longitude,
                    ),

                notes:
                    florist.address.notes,
            },

            admins:
                (florist.users ?? []).map(
                    (user: any) => ({
                        id:
                            user.id,

                        firstName:
                            user.firstName,

                        lastName:
                            user.lastName,

                        email:
                            user.email,

                        phone:
                            user.phone,

                        active:
                            user.active,

                        emailVerified:
                            user.emailVerified,

                        createdAt:
                            user.createdAt,

                        updatedAt:
                            user.updatedAt,
                    }),
                ),

            createdAt:
                florist.createdAt,

            updatedAt:
                florist.updatedAt,
        };
    }

    toResponses(
        florists: any[],
    ): FloristResponseDto[] {
        return florists.map(
            (florist) =>
                this.toResponse(
                    florist,
                ),
        );
    }
}