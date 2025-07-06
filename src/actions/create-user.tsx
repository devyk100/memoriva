async function createUserIfNotExists({
    email, name, image
}: {
    email: String;
    name: String;
    image: String;
}): Promise<Boolean> {
    "use server"
    try {


        return true
    } catch(error) {

        return false
    }
}