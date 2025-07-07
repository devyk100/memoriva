import { prisma } from "@/lib/prisma";

export async function createUserIfNotExists({
    email, name, image, authType
}: {
    email: string;
    name: string;
    image: string;
    authType: "GOOGLE" | "GITHUB"
}): Promise<{isAuth: boolean, id: string}> {
    "use server"
    try {
        const resp = await prisma.user.findFirst({where: {
            email,
            authType
        }})
        if(resp == null) {
            const temp = await prisma.user.create({
                data: {
                    authType, email, image, name
                }
            })
            return {isAuth: true, id: temp.id!}
        }
        return {isAuth: true, id: resp?.id!}
    } catch(error) {
        console.log(error)
        return {isAuth: false, id: ""}
    }
}
