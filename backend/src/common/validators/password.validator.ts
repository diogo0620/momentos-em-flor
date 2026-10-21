
import {
    registerDecorator,
    ValidationOptions,
} from 'class-validator';

export function IsStrongPassword(
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown): boolean {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return (
                        value.length >= 8 &&
                        /[a-z]/.test(value) &&
                        /[A-Z]/.test(value) &&
                        /[0-9]/.test(value) &&
                        /[^A-Za-z0-9\s]/.test(value)
                    );
                },
                defaultMessage(): string {
                    return (
                        'Password must contain at least 8 characters, ' +
                        'one uppercase letter, one lowercase letter, ' +
                        'one number and one special character.'
                    );
                },
            },
        });
    };
}
