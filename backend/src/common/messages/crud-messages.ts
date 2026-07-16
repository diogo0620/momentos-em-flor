export class CrudMessages {

    static created(entity:string){
        return `${entity} created successfully.`;
    }

    static updated(entity:string){
        return `${entity} updated successfully.`;
    }

    static deleted(entity:string){
        return `${entity} deleted successfully.`;
    }

    static notFound(entity:string){
        return `${entity} not found.`;
    }

    static alreadyExists(entity:string){
        return `${entity} already exists.`;
    }

}